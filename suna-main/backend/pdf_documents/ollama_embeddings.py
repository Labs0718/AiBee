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

# Ollama API 설정 (로컬 환경 우선)
OLLAMA_API_URL = os.getenv("OLLAMA_HOST", "http://localhost:11435")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "bge-m3")  # BGE-M3 다국어 모델

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
            chunk_size=1500,
            chunk_overlap=200,
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
    
    async def process_document(self, document_id: str, storage_path: str) -> Dict[str, Any]:
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
                else:
                    print(f"청크 {i} 임베딩 생성 실패")
            
            # 6. 배치로 임베딩 저장
            if embeddings_data:
                print(f"{len(embeddings_data)}개 임베딩 데이터베이스에 저장 중...")
                result = self.supabase.table('pdf_embeddings').insert(embeddings_data).execute()
                
                # 최신 Supabase Python 클라이언트 응답 처리
                if hasattr(result, 'error') and result.error:
                    print(f"임베딩 저장 오류: {result.error}")
                    return {"success": False, "error": f"임베딩 저장 실패: {result.error}"}
                
                # 7. 문서 상태 업데이트
                update_result = self.supabase.table('pdf_documents').update({
                    'embedding_status': 'completed',
                    'total_chunks': len(embeddings_data)
                }).eq('id', document_id).execute()
                
                if hasattr(update_result, 'error') and update_result.error:
                    print(f"문서 상태 업데이트 오류: {update_result.error}")
                
                print(f"임베딩 처리 완료: {len(embeddings_data)}개 임베딩 생성됨")
                return {
                    "success": True,
                    "message": f"{len(embeddings_data)}개의 임베딩이 생성되었습니다.",
                    "chunks_processed": len(embeddings_data)
                }
            else:
                return {"success": False, "error": "임베딩을 생성할 수 없습니다."}
            
        except Exception as e:
            print(f"문서 처리 오류: {str(e)}")
            
            # 오류 상태 업데이트
            try:
                self.supabase.table('pdf_documents').update({
                    'embedding_status': 'failed'
                }).eq('id', document_id).execute()
            except Exception as update_error:
                print(f"오류 상태 업데이트 실패: {update_error}")
            
            return {"success": False, "error": str(e)}
    
    async def search_similar_documents(
        self,
        query: str,
        match_count: int = 5,
        filter_department: str = None
    ) -> List[Dict[str, Any]]:
        """최신 하이브리드 검색 (Dense + Sparse + Query Expansion + Reranking)"""
        try:
            # 1. Query Expansion - 다양한 표현으로 확장
            expanded_queries = await self._expand_query_advanced(query)
            print(f"확장된 쿼리: {expanded_queries}")
            
            # 2. Multi-Query Dense Search
            all_dense_results = []
            for expanded_query in expanded_queries:
                query_embedding = self.get_ollama_embedding(expanded_query)
                if query_embedding and len(query_embedding) == 1024:
                    dense_results = self.supabase.rpc(
                        'search_documents',
                        {
                            'query_embedding': query_embedding,
                            'match_count': match_count * 2,  # 더 많이 가져와서 재랭킹
                            'filter_department': filter_department
                        }
                    ).execute()
                    
                    if dense_results.data:
                        # 각 결과에 쿼리 정보 추가
                        for result in dense_results.data:
                            result['search_query'] = expanded_query
                        all_dense_results.extend(dense_results.data)
            
            # 3. Sparse Search (키워드 기반) - PostgreSQL Full Text Search
            sparse_results = await self._keyword_search(query, match_count * 2, filter_department)
            
            # 4. Hybrid Fusion - RRF (Reciprocal Rank Fusion)
            fused_results = self._reciprocal_rank_fusion(all_dense_results, sparse_results)
            
            # 5. Semantic Reranking - 의미적 재랭킹
            final_results = await self._semantic_rerank(query, fused_results[:match_count * 3])
            
            return final_results[:match_count]
            
        except Exception as e:
            print(f"고급 검색 오류: {str(e)}")
            # 실패시 기본 검색으로 폴백
            return await self._fallback_search(query, match_count, filter_department)
    
    async def _expand_query_advanced(self, query: str) -> List[str]:
        """고급 쿼리 확장 - 동의어, 관련어, 상위/하위 개념"""
        base_query = query.strip()
        expanded = [base_query]
        
        # 한국어 민원 도메인 특화 확장
        expansion_map = {
            "교통": ["교통체증", "교통난", "교통문제", "도로", "차량", "신호등"],
            "정체": ["체증", "막힘", "지연", "느림"],
            "소음": ["시끄러움", "소리", "騒音", "소음공해", "층간소음"],
            "주차": ["주차장", "주차공간", "주차난", "주차문제"],
            "민원": ["불만", "신고", "요청", "건의", "항의"]
        }
        
        for keyword, synonyms in expansion_map.items():
            if keyword in base_query:
                for synonym in synonyms:
                    expanded.append(base_query.replace(keyword, synonym))
        
        # 지역별 특화 확장
        if "강남" in base_query:
            expanded.extend([
                base_query.replace("강남", "테헤란로"),
                base_query.replace("강남", "역삼동"),
                base_query + " CBD"
            ])
        
        return list(set(expanded))[:5]  # 중복 제거, 최대 5개
    
    async def _keyword_search(self, query: str, match_count: int, filter_department: str = None) -> List[Dict]:
        """PostgreSQL Full Text Search를 이용한 키워드 검색"""
        try:
            # PostgreSQL의 한국어 전문 검색
            search_query = f"""
            SELECT 
                document_id,
                chunk_text,
                document_title,
                department,
                ts_rank(to_tsvector('korean', chunk_text), plainto_tsquery('korean', %s)) as rank,
                'keyword' as search_type
            FROM pdf_embeddings pe
            JOIN pdf_documents pd ON pe.document_id = pd.id
            WHERE to_tsvector('korean', chunk_text) @@ plainto_tsquery('korean', %s)
            AND pd.deleted_at IS NULL
            AND pd.embedding_status = 'completed'
            {}
            ORDER BY rank DESC
            LIMIT %s
            """.format("AND pd.department = %s" if filter_department else "")
            
            params = [query, query]
            if filter_department:
                params.append(filter_department)
            params.append(match_count)
            
            # 직접 SQL 실행 (supabase rpc 대신)
            result = self.supabase.postgrest.rpc('execute_sql', {
                'sql': search_query,
                'params': params
            }).execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            print(f"키워드 검색 오류: {str(e)}")
            return []
    
    def _reciprocal_rank_fusion(self, dense_results: List[Dict], sparse_results: List[Dict], k: int = 60) -> List[Dict]:
        """RRF를 이용한 하이브리드 검색 결과 융합"""
        scores = {}
        
        # Dense 검색 결과 점수화
        for rank, result in enumerate(dense_results):
            doc_key = f"{result['document_id']}_{result.get('chunk_index', 0)}"
            if doc_key not in scores:
                scores[doc_key] = {'result': result, 'dense_score': 0, 'sparse_score': 0}
            scores[doc_key]['dense_score'] += 1 / (k + rank + 1)
        
        # Sparse 검색 결과 점수화
        for rank, result in enumerate(sparse_results):
            doc_key = f"{result['document_id']}_{result.get('chunk_index', 0)}"
            if doc_key not in scores:
                scores[doc_key] = {'result': result, 'dense_score': 0, 'sparse_score': 0}
            scores[doc_key]['sparse_score'] += 1 / (k + rank + 1)
        
        # 총 점수로 정렬
        for item in scores.values():
            item['total_score'] = item['dense_score'] + item['sparse_score']
            item['result']['fusion_score'] = item['total_score']
        
        return [item['result'] for item in sorted(scores.values(), key=lambda x: x['total_score'], reverse=True)]
    
    async def _semantic_rerank(self, query: str, results: List[Dict]) -> List[Dict]:
        """의미적 재랭킹 - 쿼리와 각 결과의 의미적 관련성 점수화"""
        if not results:
            return []
        
        try:
            # 쿼리 임베딩
            query_embedding = self.get_ollama_embedding(query)
            if not query_embedding:
                return results
            
            # 각 결과와 쿼리 간의 세밀한 유사도 계산
            for result in results:
                chunk_text = result.get('chunk_text', '')
                if chunk_text:
                    chunk_embedding = self.get_ollama_embedding(chunk_text[:500])  # 길이 제한
                    if chunk_embedding:
                        # 코사인 유사도 계산
                        similarity = self._cosine_similarity(query_embedding, chunk_embedding)
                        result['semantic_score'] = similarity
                        
                        # 기존 점수와 결합
                        fusion_score = result.get('fusion_score', 0)
                        result['final_score'] = fusion_score * 0.7 + similarity * 0.3
                    else:
                        result['semantic_score'] = 0
                        result['final_score'] = result.get('fusion_score', 0)
            
            # 최종 점수로 정렬
            return sorted(results, key=lambda x: x.get('final_score', 0), reverse=True)
            
        except Exception as e:
            print(f"의미적 재랭킹 오류: {str(e)}")
            return results
    
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
    
    async def _fallback_search(self, query: str, match_count: int, filter_department: str = None) -> List[Dict]:
        """기본 검색 (고급 검색 실패시 폴백)"""
        try:
            query_embedding = self.get_ollama_embedding(query)
            if not query_embedding:
                return []
            
            result = self.supabase.rpc(
                'search_documents',
                {
                    'query_embedding': query_embedding,
                    'match_count': match_count,
                    'filter_department': filter_department
                }
            ).execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            print(f"폴백 검색 오류: {str(e)}")
            return []