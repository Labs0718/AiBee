from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
import os
import aiofiles
from pathlib import Path
import re
import time
from utils.auth_utils import get_current_user_id_from_jwt
from services.supabase import DBConnection
from .ollama_embeddings import OllamaEmbeddingProcessor

router = APIRouter()

# 업로드 디렉토리 설정
UPLOAD_DIR = Path("uploads/pdfs")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def sanitize_filename(filename: str) -> str:
    """파일명을 안전하게 정리"""
    # 파일명과 확장자 분리
    name, ext = os.path.splitext(filename)
    
    # 특수문자를 언더스코어로 변경 (한글, 영문, 숫자, 일부 특수문자만 유지)
    name = re.sub(r'[^\w가-힣.\-\s]', '_', name)
    
    # 연속된 공백을 언더스코어로 변경
    name = re.sub(r'\s+', '_', name)
    
    # 연속된 언더스코어 정리
    name = re.sub(r'_+', '_', name)
    
    # 앞뒤 언더스코어 제거
    name = name.strip('_')
    
    # 타임스탬프 추가 (중복 방지)
    timestamp = str(int(time.time() * 1000))
    
    return f"{timestamp}_{name}{ext}"

@router.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    fileName: str = Form(...),
    documentId: str = Form(...)
):
    """PDF 파일 업로드"""
    try:
        # JWT에서 사용자 ID 추출
        user_id = await get_current_user_id_from_jwt(request)
        # 파일 유효성 검사
        if not file.content_type or not file.content_type.startswith('application/pdf'):
            raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다.")
        
        # 파일 크기 제한 (50MB)
        MAX_SIZE = 50 * 1024 * 1024  # 50MB
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_SIZE:
            raise HTTPException(status_code=400, detail="파일 크기는 50MB 이하여야 합니다.")
        
        # 파일명 그대로 사용 (타임스탬프만 추가)
        timestamp = str(int(time.time() * 1000))
        safe_filename = f"{timestamp}_{fileName}"
        file_path = UPLOAD_DIR / safe_filename
        
        # 파일 저장
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # 성공 응답
        return {
            "success": True,
            "message": "파일이 성공적으로 업로드되었습니다.",
            "file_path": str(file_path),
            "file_size": file_size,
            "safe_filename": safe_filename
        }
        
    except Exception as e:
        # 실패 시 파일 삭제
        if 'file_path' in locals() and file_path.exists():
            file_path.unlink()
        
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")

@router.get("/{document_id}/download")
async def download_pdf(
    document_id: str,
    request: Request
):
    """PDF 파일 다운로드"""
    try:
        # JWT에서 사용자 ID 추출
        user_id = await get_current_user_id_from_jwt(request)
        
        # Supabase 연결
        db = DBConnection()
        await db.initialize()
        
        # 문서 정보 조회
        query = "SELECT file_name, original_file_name FROM pdf_documents WHERE id = %s AND deleted_at IS NULL"
        result = await db.fetch_one(query, [document_id])
        
        if not result:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
        
        file_path = UPLOAD_DIR / result['file_name']
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
        
        # 다운로드 카운트 증가
        update_query = "UPDATE pdf_documents SET download_count = COALESCE(download_count, 0) + 1 WHERE id = %s"
        await db.execute(update_query, [document_id])
        
        return FileResponse(
            path=file_path,
            filename=result['original_file_name'],
            media_type='application/pdf'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"파일 다운로드 실패: {str(e)}")

@router.post("/{document_id}/process-embeddings")
async def process_embeddings(
    document_id: str,
    request: Request
):
    """PDF 문서의 임베딩 처리"""
    try:
        # JWT에서 사용자 ID 추출
        user_id = await get_current_user_id_from_jwt(request)
        
        # 데이터베이스 연결
        db = DBConnection()
        await db.initialize()
        
        # 문서 정보 조회
        query = """
            SELECT id, storage_path, file_uploaded 
            FROM pdf_documents 
            WHERE id = %s AND account_id = %s AND deleted_at IS NULL
        """
        result = await db.fetch_one(query, [document_id, user_id])
        
        if not result:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
        
        if not result['file_uploaded'] or not result['storage_path']:
            raise HTTPException(status_code=400, detail="파일이 아직 업로드되지 않았습니다.")
        
        # 임베딩 상태를 processing으로 업데이트
        update_query = "UPDATE pdf_documents SET embedding_status = %s WHERE id = %s"
        await db.execute(update_query, ['processing', document_id])
        
        # Ollama 임베딩 프로세서 초기화
        processor = OllamaEmbeddingProcessor()
        
        # 백그라운드에서 임베딩 처리
        import asyncio
        asyncio.create_task(processor.process_document(document_id, result['storage_path']))
        
        return {
            "success": True,
            "message": "임베딩 처리가 시작되었습니다.",
            "document_id": document_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"임베딩 처리 실패: {str(e)}")

@router.post("/search")
async def search_documents(
    query: str = Form(...),
    match_count: int = Form(5),
    filter_department: str = Form(None),
    request: Request = None
):
    """벡터 검색을 통한 문서 검색"""
    try:
        # JWT에서 사용자 ID 추출
        user_id = await get_current_user_id_from_jwt(request)
        
        # Ollama 임베딩 프로세서 초기화
        processor = OllamaEmbeddingProcessor()
        
        # 검색 실행
        results = await processor.search_similar_documents(
            query=query,
            match_count=match_count,
            filter_department=filter_department
        )
        
        return {
            "success": True,
            "query": query,
            "results": results,
            "total_results": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"검색 실패: {str(e)}")

@router.get("/{document_id}/embedding-status")
async def get_embedding_status(
    document_id: str,
    request: Request
):
    """임베딩 처리 상태 조회"""
    try:
        # JWT에서 사용자 ID 추출
        user_id = await get_current_user_id_from_jwt(request)
        
        # 데이터베이스 연결
        db = DBConnection()
        await db.initialize()
        
        # 문서 상태 조회
        query = """
            SELECT embedding_status, total_chunks 
            FROM pdf_documents 
            WHERE id = %s AND account_id = %s AND deleted_at IS NULL
        """
        result = await db.fetch_one(query, [document_id, user_id])
        
        if not result:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
        
        return {
            "document_id": document_id,
            "embedding_status": result['embedding_status'],
            "total_chunks": result.get('total_chunks', 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상태 조회 실패: {str(e)}")