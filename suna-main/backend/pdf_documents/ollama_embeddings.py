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

# Ollama API 설정 (Docker Compose 환경 고려)
OLLAMA_API_URL = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11435")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "bge-large")  # BGE Large 모델

class OllamaEmbeddingProcessor:
    def __init__(self):
        self.supabase = create_client(
            os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
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
                return result.get("embedding", [])
            else:
                print(f"Ollama 임베딩 오류: {response.status_code}")
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
            
            if file_response.error:
                return {"success": False, "error": f"PDF 파일을 다운로드할 수 없습니다: {file_response.error}"}
            
            pdf_bytes = file_response.data
            
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
                
                if result.error:
                    print(f"임베딩 저장 오류: {result.error}")
                    return {"success": False, "error": f"임베딩 저장 실패: {result.error}"}
                
                # 7. 문서 상태 업데이트
                update_result = self.supabase.table('pdf_documents').update({
                    'embedding_status': 'completed',
                    'total_chunks': len(embeddings_data)
                }).eq('id', document_id).execute()
                
                if update_result.error:
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
        """쿼리와 유사한 문서 검색 (BGE Large 1024차원)"""
        try:
            # 1. 쿼리 임베딩 생성
            query_embedding = self.get_ollama_embedding(query)
            
            if not query_embedding:
                return []
            
            # BGE Large는 1024차원이므로 확인
            if len(query_embedding) != 1024:
                print(f"경고: 예상 차원 1024, 실제 차원 {len(query_embedding)}")
            
            # 2. 벡터 검색 실행
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
            print(f"검색 오류: {str(e)}")
            return []