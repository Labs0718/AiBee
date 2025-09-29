ollama_embeddings.py

import os
import io
import json
import requests
from typing import List, Dict, Any
import PyPDF2
from langchain_text_splitters import RecursiveCharacterTextSplitter
import numpy as np
from supabase import create_client
import asyncio
import math
from collections import Counter
import re

import logging
from logging.handlers import TimedRotatingFileHandler


# Ollama API 설정 (로컬 환경 우선)
OLLAMA_API_URL = os.getenv("OLLAMA_HOST", "http://localhost:11435")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "bge-m3")  # bge-m3 다국어 모델

class OllamaEmbeddingProcessor:
    def __init__(self):
        # Backend uses SUPABASE_URL instead of NEXT_PUBLIC_SUPABASE_URL
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        print(f"Supabase 연결: URL={supabase_url[:50]}..." if supabase_url else "URL=None")
        print(f"Supabase Key: {'설정됨' if supabase_key else '없음'}")
        
        if not supabase_url or not supabase_key:
            raise Exception(f"Supabase 환경 변수 누락: URL={bool(supabase_url)}, Key={bool(supabase_key)}")
            
        self.supabase = create_client(supabase_url, supabase_key)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,  # 의미적 맥락 보존을 위해 증가
            chunk_overlap=200,  # 충분한 오버랩으로 맥락 연결성 확보
            separators=["\n\n", "\n", ".", "!", "?", "。", "！", "？", " ", ""],
            length_function=len,
        )
    
    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """PDF에서 텍스트 추출"""
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n"
        
        return text
    
    def get_ollama_embedding(self, text: str) -> List[float]:
        """Ollama를 사용하여 텍스트 임베딩 생성"""
        try:
            print(f"Ollama 임베딩 요청: URL={OLLAMA_API_URL}, 모델={EMBEDDING_MODEL}")
            response = requests.post(
                f"{OLLAMA_API_URL}/api/embeddings",
                json={
                    "model": EMBEDDING_MODEL,
                    "prompt": text
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                embedding = result.get("embedding", [])
                print(f"임베딩 성공: 차원 {len(embedding)}")
                return embedding
            else:
                print(f"Ollama 임베딩 오류: {response.status_code}, 응답: {response.text}")
                return None
        except requests.exceptions.ConnectionError as e:
            print(f"Ollama 서버 연결 실패: {str(e)}")
            print(f"Ollama URL 확인: {OLLAMA_API_URL}")
            return None
        except Exception as e:
            print(f"Ollama 연결 오류: {str(e)}")
            return None
    
    async def process_document(self, document_id: str, storage_path: str, file_name: str) -> Dict[str, Any]:
        """Supabase Storage에서 문서를 다운로드하고 임베딩 생성"""
        try:
            print(f"임베딩 처리 시작: document_id={document_id}, storage_path={storage_path}")
            
            # 1. Supabase Storage에서 PDF 파일 다운로드
            file_response = self.supabase.storage.from_('pdf-documents').download(storage_path)
            
            # 최신 Supabase Python 클라이언트는 직접 bytes를 반환함
            if isinstance(file_response, bytes):
                pdf_bytes = file_response
            elif hasattr(file_response, 'error') and file_response.error:
                return {"success": False, "error": f"PDF 파일을 다운로드할 수 없습니다: {file_response.error}"}
            else:
                pdf_bytes = file_response.data if hasattr(file_response, 'data') else file_response
            
            if not pdf_bytes:
                return {"success": False, "error": "PDF 파일이 비어있습니다."}
            
            print(f"PDF 파일 다운로드 완료: {len(pdf_bytes)} bytes")
            
            # 2. PDF에서 텍스트 추출
            text = self.extract_text_from_pdf(pdf_bytes)
            
            if not text.strip():
                return {"success": False, "error": "PDF에서 텍스트를 추출할 수 없습니다."}
            
            print(f"텍스트 추출 완료: {len(text)} 문자")
            
            # 3. 텍스트를 청크로 분할
            chunks = self.text_splitter.split_text(text)
            print(f"텍스트 분할 완료: {len(chunks)}개 청크")
            chunks = [f"{file_name.replace('.pdf', '')}{idx+1}\n\n{chunk}" for idx, chunk in enumerate(chunks)]
            
            # 4. 기존 임베딩 삭제
            delete_result = self.supabase.table('pdf_embeddings').delete().eq('document_id', document_id).execute()
            print(f"기존 임베딩 삭제 완료")
            
            # 5. 각 청크에 대해 임베딩 생성 및 저장
            embeddings_data = []
            for i, chunk in enumerate(chunks):
                print(f"청크 {i+1}/{len(chunks)} 임베딩 생성 중...")
                embedding = self.get_ollama_embedding(chunk)
                
                if embedding:
                    embedding_data = {
                        'document_id': document_id,
                        'chunk_index': i,
                        'chunk_text': chunk[:5000],  # 텍스트 길이 제한
                        'embedding': embedding,
                        'metadata': {
                            'chunk_length': len(chunk),
                            'total_chunks': len(chunks)
                        }
                    }
                    embeddings_data.append(embedding_data)
                    print(f"청크 {i} 임베딩 생성 완료!")
                else:
                    print(f"청크 {i} 임베딩 생성 실패")
            
            # 6. 작은 배치로 나누어서 임베딩 저장 (대용량 데이터 처리)
            if embeddings_data:
                print(f"{len(embeddings_data)}개 임베딩 데이터베이스에 저장 중...")
                
                # 배치 크기 설정 (너무 크면 Supabase 저장 실패)
                BATCH_SIZE = 10  # 한번에 10개씩 저장
                saved_count = 0
                
                for i in range(0, len(embeddings_data), BATCH_SIZE):
                    batch = embeddings_data[i:i + BATCH_SIZE]
                    print(f"배치 {i//BATCH_SIZE + 1}/{(len(embeddings_data) + BATCH_SIZE - 1)//BATCH_SIZE}: {len(batch)}개 저장 중...")
                    
                    try:
                        result = self.supabase.table('pdf_embeddings').insert(batch).execute()
                        
                        # 최신 Supabase Python 클라이언트 응답 처리
                        if hasattr(result, 'error') and result.error:
                            print(f"배치 저장 오류: {result.error}")
                            return {"success": False, "error": f"임베딩 저장 실패: {result.error}"}
                        
                        saved_count += len(batch)
                        print(f"배치 저장 완료: {saved_count}/{len(embeddings_data)}")
                        
                    except Exception as batch_error:
                        print(f"배치 저장 중 예외 발생: {batch_error}")
                        return {"success": False, "error": f"배치 저장 실패: {str(batch_error)}"}
                
                # 7. 문서 상태 업데이트
                update_result = self.supabase.table('pdf_documents').update({
                    'embedding_status': 'completed',
                    'total_chunks': saved_count
                }).eq('id', document_id).execute()
                
                if hasattr(update_result, 'error') and update_result.error:
                    print(f"문서 상태 업데이트 오류: {update_result.error}")
                
                print(f"임베딩 처리 완료: {saved_count}개 임베딩 생성됨")
                return {
                    "success": True,
                    "message": f"{saved_count}개의 임베딩이 생성되었습니다.",
                    "chunks_processed": saved_count
                }
            else:
                return {"success": False, "error": "임베딩을 생성할 수 없습니다."}
            
        except Exception as e:
            print(f"문서 처리 오류: {str(e)}")
            
            # 오류 발생해도 저장된 청크가 있으면 completed로, 없으면 failed로 처리
            try:
                # 저장된 청크 개수 확인
                saved_chunks_result = self.supabase.table('pdf_embeddings').select('id').eq('document_id', document_id).execute()
                saved_count = len(saved_chunks_result.data) if saved_chunks_result.data else 0
                
                if saved_count > 0:
                    # 저장된 청크가 있으면 completed로 처리
                    print(f"오류 발생했지만 {saved_count}개 청크가 저장되어 completed 처리")
                    self.supabase.table('pdf_documents').update({
                        'embedding_status': 'completed',
                        'total_chunks': saved_count
                    }).eq('id', document_id).execute()
                    
                    return {
                        "success": True,
                        "message": f"처리 중 오류가 발생했지만 {saved_count}개의 임베딩이 성공적으로 저장되었습니다.",
                        "chunks_processed": saved_count,
                        "error_details": str(e)
                    }
                else:
                    # 저장된 청크가 없으면 failed 처리
                    print(f"저장된 청크가 없어서 failed 처리")
                    self.supabase.table('pdf_documents').update({
                        'embedding_status': 'failed'
                    }).eq('id', document_id).execute()
                    
                    return {"success": False, "error": str(e)}
                    
            except Exception as update_error:
                print(f"오류 상태 업데이트 실패: {update_error}")
                return {"success": False, "error": f"처리 오류: {str(e)}, 상태 업데이트 오류: {str(update_error)}"}
    
    async def search_similar_documents(
        self,
        query: str,
        match_count: int = 5,
        filter_department: str = None
    ) -> List[Dict[str, Any]]:
        """하이브리드 검색 (벡터 + 키워드) - RPC 없이 직접 구현"""
        try:
            print(f"하이브리드 검색 시작: '{query}' (최대 {match_count}개)")

            # 1. 벡터 검색 실행
            vector_results = await self._vector_search(query, match_count * 2, filter_department)
            print(f"벡터 검색 결과: {len(vector_results)}개")

            # 2. 키워드 검색 실행
            keyword_results = await self._keyword_search(query, match_count * 2, filter_department)
            print(f"키워드 검색 결과: {len(keyword_results)}개")

            # 3. 하이브리드 결합 (간단한 점수 기반)
            combined_results = self._combine_search_results(vector_results, keyword_results)
            print(f"결합 후 결과: {len(combined_results)}개")

            # 4. 최종 결과 반환
            final_results = combined_results[:match_count]
            print(f"최종 반환: {len(final_results)}개")
            print(f"{final_results}")

            return final_results

        except Exception as e:
            print(f"하이브리드 검색 오류: {str(e)}")
            # 오류시 키워드 검색만 실행
            return await self._keyword_search(query, match_count, filter_department)

    async def _vector_search(
        self,
        query: str,
        match_count: int,
        filter_department: str = None
    ) -> List[Dict[str, Any]]:
        """벡터 검색 (RPC 없이 직접 구현)"""
        try:
            # 쿼리 임베딩 생성
            query_embedding = self.get_ollama_embedding(query)
            if not query_embedding:
                return []

            # 부서 필터 적용 쿼리 구성
            query_builder = self.supabase.table('pdf_embeddings').select(
                'document_id, chunk_text, embedding, metadata, pdf_documents(original_file_name, department)'
            ).eq('pdf_documents.embedding_status', 'completed').is_('pdf_documents.deleted_at', 'null')

            if filter_department:
                query_builder = query_builder.eq('pdf_documents.department', filter_department)

            # 충분한 데이터 가져오기
            embeddings_result = query_builder.limit(200).execute()

            if not embeddings_result.data:
                return []

            # 코사인 유사도 계산
            scored_results = []
            for item in embeddings_result.data:
                doc_embedding = item.get('embedding', [])
                if doc_embedding and len(doc_embedding) == len(query_embedding):
                    similarity = self._cosine_similarity(query_embedding, doc_embedding)

                    doc_info = item.get('pdf_documents', {})
                    scored_results.append({
                        'document_id': item['document_id'],
                        'chunk_text': item['chunk_text'],
                        'similarity': round(similarity, 4),
                        'document_title': doc_info.get('original_file_name', '제목 없음'),
                        'department': doc_info.get('department', '부서 정보 없음'),
                        'metadata': item.get('metadata', {}),
                        'search_type': 'vector'
                    })

            # 유사도순 정렬 후 임계값 필터링
            scored_results.sort(key=lambda x: x['similarity'], reverse=True)
            return [r for r in scored_results[:match_count] if r['similarity'] > 0.2]

        except Exception as e:
            print(f"벡터 검색 오류: {str(e)}")
            return []

    def _combine_search_results(
        self,
        vector_results: List[Dict],
        keyword_results: List[Dict]
    ) -> List[Dict[str, Any]]:
        """벡터 검색과 키워드 검색 결과를 결합"""
        # 결과를 document_id + chunk_text로 식별하여 중복 제거 및 점수 결합
        combined_scores = {}

        # 벡터 검색 결과 처리 (가중치 0.7)
        for i, result in enumerate(vector_results):
            key = f"{result['document_id']}_{hash(result['chunk_text'][:100])}"

            if key not in combined_scores:
                combined_scores[key] = result.copy()
                combined_scores[key]['vector_score'] = result.get('similarity', 0)
                combined_scores[key]['keyword_score'] = 0
                combined_scores[key]['vector_rank'] = i + 1
                combined_scores[key]['keyword_rank'] = 999
            else:
                combined_scores[key]['vector_score'] = max(
                    combined_scores[key]['vector_score'],
                    result.get('similarity', 0)
                )
                combined_scores[key]['vector_rank'] = min(combined_scores[key]['vector_rank'], i + 1)

        # BM25 검색 결과 처리
        for i, result in enumerate(keyword_results):
            key = f"{result['document_id']}_{hash(result['chunk_text'][:100])}"

            # BM25 점수 사용 (기존 similarity 대신)
            bm25_score = result.get('bm25_score', 0)
            normalized_bm25 = result.get('similarity', bm25_score / 10)

            if key not in combined_scores:
                combined_scores[key] = result.copy()
                combined_scores[key]['vector_score'] = 0
                combined_scores[key]['keyword_score'] = normalized_bm25
                combined_scores[key]['bm25_raw_score'] = bm25_score
                combined_scores[key]['vector_rank'] = 999
                combined_scores[key]['keyword_rank'] = i + 1
            else:
                # 더 높은 BM25 점수 선택
                if bm25_score > combined_scores[key].get('bm25_raw_score', 0):
                    combined_scores[key]['keyword_score'] = normalized_bm25
                    combined_scores[key]['bm25_raw_score'] = bm25_score
                combined_scores[key]['keyword_rank'] = min(combined_scores[key]['keyword_rank'], i + 1)

        # 최종 점수 계산 및 정렬
        final_results = []
        for result in combined_scores.values():
            # RRF (Reciprocal Rank Fusion) 기반 점수 계산
            vector_rrf = 1 / (60 + result['vector_rank'])
            keyword_rrf = 1 / (60 + result['keyword_rank'])

            # 가중 결합 점수
            final_score = (
                result['vector_score'] * 0.8 +
                result['keyword_score'] * 0.2 +
                vector_rrf * 0.3 +
                keyword_rrf * 0.1
            )

            result['final_score'] = round(final_score, 4)
            result['similarity'] = round(final_score, 4)  # 호환성을 위해
            final_results.append(result)

        # 최종 점수로 정렬
        return sorted(final_results, key=lambda x: x['final_score'], reverse=True)
    
    
    async def _keyword_search(self, query: str, match_count: int, filter_department: str = None) -> List[Dict]:
        """BM25 기반 키워드 검색"""
        try:
            print(f"BM25 키워드 검색 시작: '{query}'")

            # 모든 문서 조회 (BM25 계산을 위해)
            query_builder = self.supabase.table('pdf_embeddings').select(
                'document_id, chunk_text, pdf_documents(original_file_name, department)'
            ).eq('pdf_documents.embedding_status', 'completed').is_('pdf_documents.deleted_at', 'null')

            if filter_department:
                query_builder = query_builder.eq('pdf_documents.department', filter_department)

            result = query_builder.limit(500).execute()  # BM25 계산을 위해 더 많이 조회

            if not result.data:
                return []

            print(f"BM25 계산 대상: {len(result.data)}개 문서")

            # BM25 점수 계산
            bm25_scores = self._calculate_bm25_scores(query, result.data)

            # 점수순 정렬 후 상위 결과만 선택
            ranked_results = sorted(bm25_scores, key=lambda x: x['bm25_score'], reverse=True)

            # 점수가 0인 결과 제거
            filtered_results = [r for r in ranked_results if r['bm25_score'] > 0]

            print(f"BM25 검색 완료: {len(filtered_results)}개 관련 문서")

            return filtered_results[:match_count]

        except Exception as e:
            print(f"BM25 검색 오류: {str(e)}")
            return []

    def _calculate_bm25_scores(self, query: str, documents: List[Dict]) -> List[Dict]:
        """BM25 알고리즘으로 문서 점수 계산"""
        # BM25 파라미터
        k1 = 1.5  # term frequency saturation parameter
        b = 0.75  # length normalization parameter

        # 쿼리 토큰화
        query_terms = self._tokenize(query.lower())
        if not query_terms:
            return []

        # 문서 전처리
        doc_tokens = []
        doc_lengths = []
        term_doc_freq = Counter()  # 각 단어가 포함된 문서 수

        for doc in documents:
            tokens = self._tokenize(doc['chunk_text'].lower())
            doc_tokens.append(tokens)
            doc_lengths.append(len(tokens))

            # 문서별 고유 단어들
            unique_terms = set(tokens)
            for term in unique_terms:
                term_doc_freq[term] += 1

        total_docs = len(documents)
        avg_doc_length = sum(doc_lengths) / total_docs if total_docs > 0 else 0

        # BM25 점수 계산
        scored_results = []
        for i, doc in enumerate(documents):
            doc_token_count = Counter(doc_tokens[i])
            doc_length = doc_lengths[i]
            bm25_score = 0

            for term in query_terms:
                if term in doc_token_count:
                    # Term Frequency (TF)
                    tf = doc_token_count[term]

                    # Inverse Document Frequency (IDF)
                    df = term_doc_freq.get(term, 0)
                    if df > 0:
                        idf = math.log((total_docs - df + 0.5) / (df + 0.5))
                    else:
                        continue

                    # BM25 점수 계산
                    numerator = tf * (k1 + 1)
                    denominator = tf + k1 * (1 - b + b * (doc_length / avg_doc_length))
                    bm25_score += idf * (numerator / denominator)

            # 결과 포맷팅
            doc_info = doc.get('pdf_documents', {})
            scored_results.append({
                'document_id': doc['document_id'],
                'chunk_text': doc['chunk_text'],
                'document_title': doc_info.get('original_file_name', '제목 없음'),
                'department': doc_info.get('department', '부서 정보 없음'),
                'search_type': 'bm25',
                'bm25_score': round(bm25_score, 4),
                'similarity': min(bm25_score / 10, 1.0)  # 0-1 범위로 정규화
            })

        return scored_results

    def _tokenize(self, text: str) -> List[str]:
        """텍스트 토큰화 (한국어/영어 지원)"""
        # 한국어, 영어, 숫자만 남기고 나머지 제거
        text = re.sub(r'[^\w\s가-힣]', ' ', text)

        # 공백으로 분할하여 토큰화
        tokens = text.split()

        # 길이가 1인 토큰 제거 (너무 짧은 단어)
        tokens = [token for token in tokens if len(token) > 1]

        return tokens
    
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """코사인 유사도 계산"""
        import numpy as np
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)
        
        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)
        
        if norm1 == 0 or norm2 == 0:
            return 0
        
        return dot_product / (norm1 * norm2)
    
