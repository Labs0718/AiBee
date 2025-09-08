from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Request
from fastapi.responses import Response
import os
import time
from utils.auth_utils import get_current_user_id_from_jwt
from services.supabase import DBConnection
from .ollama_embeddings import OllamaEmbeddingProcessor

router = APIRouter(prefix="/pdf-documents")

@router.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    fileName: str = Form(...),
    documentId: str = Form(...)
):
    """PDF 파일을 Supabase Storage에 업로드"""
    print(f"PDF 업로드 요청: fileName={fileName}, documentId={documentId}")
    try:
        # JWT에서 사용자 ID 추출
        print("JWT에서 사용자 ID 추출 중...")
        user_id = await get_current_user_id_from_jwt(request)
        print(f"사용자 ID: {user_id}")
        
        # 파일 유효성 검사
        if not file.content_type or not file.content_type.startswith('application/pdf'):
            raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다.")
        
        # 파일 크기 제한 (50MB)
        MAX_SIZE = 50 * 1024 * 1024  # 50MB
        content = await file.read()
        file_size = len(content)
        
        if file_size > MAX_SIZE:
            raise HTTPException(status_code=400, detail="파일 크기는 50MB 이하여야 합니다.")
        
        # 데이터베이스 연결
        db = DBConnection()
        await db.initialize()
        client = await db.client
        
        # Supabase Storage에 업로드 (사용자별 폴더 구조: {user_id}/{document_id}/document.pdf)
        # 한글 파일명 문제 해결을 위해 간단한 파일명 사용, 원본명은 DB에 저장
        storage_path = f"{user_id}/{documentId}/document.pdf"
        
        # 기존 파일이 있으면 삭제 후 업로드 (upsert 대신)
        try:
            await client.storage.from_('pdf-documents').remove([storage_path])
        except:
            pass  # 파일이 없으면 무시
        
        upload_response = await client.storage.from_('pdf-documents').upload(
            storage_path,
            content,
            file_options={
                "content-type": "application/pdf"
            }
        )
        
        # 업로드 성공 여부 확인 (최신 Supabase Python 클라이언트 대응)
        if hasattr(upload_response, 'error') and upload_response.error:
            print(f"Storage 업로드 오류: {upload_response.error}")
            raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {upload_response.error}")
        
        print(f"Storage 업로드 성공: {upload_response}")
        
        # 데이터베이스에서 문서 정보 업데이트 (원본 파일명도 함께 저장)
        update_response = await client.table('pdf_documents').update({
            'storage_path': storage_path,
            'original_file_name': fileName,  # 원본 파일명 저장
            'file_uploaded': True,
            'embedding_status': 'processing'
        }).eq('id', documentId).eq('account_id', user_id).execute()
        
        # 데이터베이스 업데이트 응답 확인 (최신 Supabase Python 클라이언트 대응)
        if hasattr(update_response, 'error') and update_response.error:
            # 업로드 실패 시 Storage에서 파일 삭제
            await client.storage.from_('pdf-documents').remove([storage_path])
            raise HTTPException(status_code=500, detail=f"데이터베이스 업데이트 실패: {update_response.error}")
        
        # 업데이트된 데이터 확인
        if not update_response.data:
            # 업로드 실패 시 Storage에서 파일 삭제
            await client.storage.from_('pdf-documents').remove([storage_path])
            raise HTTPException(status_code=500, detail="문서 정보 업데이트에 실패했습니다.")
        
        print(f"데이터베이스 업데이트 성공: {update_response.data}")
        
        # 임베딩 처리 시작 (백그라운드)
        processor = OllamaEmbeddingProcessor()
        import asyncio
        
        async def process_and_complete(doc_id, path):
            """임베딩 처리 후 자동으로 completed 상태로 변경"""
            try:
                result = await processor.process_document(doc_id, path)
                print(f"임베딩 처리 결과: {result}")
                
                # 처리 완료되었는데 상태가 processing이면 completed로 변경
                if result.get("success"):
                    # 처리된 청크 수 확인
                    chunks_processed = result.get("chunks_processed", 0)
                    if chunks_processed > 0:
                        await client.table('pdf_documents').update({
                            'embedding_status': 'completed',
                            'total_chunks': chunks_processed
                        }).eq('id', doc_id).execute()
                        print(f"문서 {doc_id} 상태를 completed로 변경 완료 ({chunks_processed}개 청크)")
                
            except Exception as e:
                print(f"백그라운드 처리 중 오류: {e}")
                
                # 오류 발생해도 저장된 청크가 있는지 확인
                try:
                    saved_chunks_result = await client.table('pdf_embeddings').select('id').eq('document_id', doc_id).execute()
                    saved_count = len(saved_chunks_result.data) if saved_chunks_result.data else 0
                    
                    if saved_count > 0:
                        await client.table('pdf_documents').update({
                            'embedding_status': 'completed',
                            'total_chunks': saved_count
                        }).eq('id', doc_id).execute()
                        print(f"오류 발생했지만 {saved_count}개 청크 저장되어 completed 처리")
                    else:
                        await client.table('pdf_documents').update({
                            'embedding_status': 'failed'
                        }).eq('id', doc_id).execute()
                        print(f"저장된 청크가 없어서 failed 처리")
                except Exception as update_error:
                    print(f"상태 업데이트 실패: {update_error}")
        
        asyncio.create_task(process_and_complete(documentId, storage_path))
        
        # 성공 응답
        return {
            "success": True,
            "message": "파일이 성공적으로 업로드되었습니다. 임베딩 처리가 시작됩니다.",
            "storage_path": storage_path,
            "file_size": file_size
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"업로드 오류 상세: {error_details}")
        print(f"업로드 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"파일 업로드 실패: {str(e)}")

@router.get("/{document_id}/download")
async def download_pdf(
    document_id: str,
    request: Request
):
    """PDF 파일 다운로드 (Supabase Storage에서)"""
    try:
        # JWT에서 사용자 ID 추출
        user_id = await get_current_user_id_from_jwt(request)
        
        # 데이터베이스 연결
        db = DBConnection()
        await db.initialize()
        client = await db.client
        
        # 문서 정보 조회
        document_response = await client.table('pdf_documents').select(
            'storage_path, original_file_name'
        ).eq('id', document_id).eq('account_id', user_id).is_('deleted_at', 'null').execute()
        
        if not document_response.data:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
        
        document = document_response.data[0]
        storage_path = document['storage_path']
        
        if not storage_path:
            raise HTTPException(status_code=404, detail="파일이 업로드되지 않았습니다.")
        
        # Supabase Storage에서 파일 다운로드
        file_response = await client.storage.from_('pdf-documents').download(storage_path)
        
        if file_response.error:
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
        
        # 다운로드 카운트 증가
        await client.table('pdf_documents').update({
            'download_count': client.rpc('increment_download_count', {'doc_id': document_id})
        }).eq('id', document_id).execute()
        
        return Response(
            content=file_response.data,
            media_type='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename="{document["original_file_name"]}"'
            }
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
        client = await db.client
        
        # 문서 정보 조회
        document_response = await client.table('pdf_documents').select(
            'id, storage_path, file_uploaded'
        ).eq('id', document_id).eq('account_id', user_id).is_('deleted_at', 'null').execute()
        
        if not document_response.data:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
        
        document = document_response.data[0]
        
        if not document['file_uploaded'] or not document['storage_path']:
            raise HTTPException(status_code=400, detail="파일이 아직 업로드되지 않았습니다.")
        
        # 임베딩 상태를 processing으로 업데이트
        await client.table('pdf_documents').update({
            'embedding_status': 'processing'
        }).eq('id', document_id).execute()
        
        # Ollama 임베딩 프로세서 초기화
        processor = OllamaEmbeddingProcessor()
        
        # 백그라운드에서 임베딩 처리
        import asyncio
        asyncio.create_task(processor.process_document(document_id, document['storage_path']))
        
        return {
            "success": True,
            "message": "임베딩 처리가 시작되었습니다.",
            "document_id": document_id
        }
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"임베딩 처리 오류 상세: {error_details}")
        print(f"임베딩 처리 오류: {str(e)}")
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
        client = await db.client
        
        # 문서 상태 조회
        document_response = await client.table('pdf_documents').select(
            'embedding_status, total_chunks'
        ).eq('id', document_id).eq('account_id', user_id).is_('deleted_at', 'null').execute()
        
        if not document_response.data:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
        
        document = document_response.data[0]
        
        return {
            "document_id": document_id,
            "embedding_status": document.get('embedding_status'),
            "total_chunks": document.get('total_chunks', 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상태 조회 실패: {str(e)}")