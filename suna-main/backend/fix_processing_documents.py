#!/usr/bin/env python3
"""
Processing 상태에서 멈춘 PDF 문서들을 자동으로 completed로 변경하는 스크립트
저장된 청크가 있으면 completed, 없으면 failed로 처리
"""

import os
import asyncio
from supabase import create_client

async def fix_processing_documents():
    # Supabase 연결
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("환경변수 설정이 필요합니다: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY")
        return
    
    supabase = create_client(supabase_url, supabase_key)
    
    # processing 상태인 문서들 조회
    result = supabase.table('pdf_documents').select('id, original_file_name').eq('embedding_status', 'processing').execute()
    
    if not result.data:
        print("Processing 상태의 문서가 없습니다.")
        return
    
    print(f"발견된 Processing 문서: {len(result.data)}개")
    
    for doc in result.data:
        doc_id = doc['id']
        filename = doc['original_file_name']
        
        print(f"\n문서: {filename}")
        
        # 실제 저장된 청크 개수 확인
        saved_chunks_result = supabase.table('pdf_embeddings').select('id').eq('document_id', doc_id).execute()
        saved_count = len(saved_chunks_result.data) if saved_chunks_result.data else 0
        
        print(f"실제 저장된 청크: {saved_count}개")
        
        if saved_count > 0:
            # 저장된 청크가 있으면 completed로 변경
            update_result = supabase.table('pdf_documents').update({
                'embedding_status': 'completed',
                'total_chunks': saved_count,
                'actual_chunks': saved_count
            }).eq('id', doc_id).execute()
            
            if hasattr(update_result, 'error') and update_result.error:
                print(f"❌ 업데이트 실패: {update_result.error}")
            else:
                print(f"✅ 상태 변경 완료: processing → completed ({saved_count}개 청크)")
        else:
            # 저장된 청크가 없으면 failed로 처리
            update_result = supabase.table('pdf_documents').update({
                'embedding_status': 'failed'
            }).eq('id', doc_id).execute()
            
            if hasattr(update_result, 'error') and update_result.error:
                print(f"❌ 업데이트 실패: {update_result.error}")
            else:
                print(f"❌ 상태 변경 완료: processing → failed (저장된 청크 없음)")

if __name__ == "__main__":
    asyncio.run(fix_processing_documents())