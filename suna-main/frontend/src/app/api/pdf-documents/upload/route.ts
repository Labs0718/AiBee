import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const documentId = formData.get('documentId') as string;

    if (!file || !fileName || !documentId) {
      return NextResponse.json({ error: '필수 데이터가 누락되었습니다.' }, { status: 400 });
    }

    // PDF 파일인지 확인
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'PDF 파일만 업로드 가능합니다.' }, { status: 400 });
    }

    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '파일 크기는 50MB를 초과할 수 없습니다.' }, { status: 400 });
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Supabase Storage에 업로드 (Service Role 클라이언트 사용)
    // 사용자별 폴더 구조: {user_id}/{document_id}/{filename}
    const storagePath = `${user.id}/${documentId}/${fileName}`;
    const serviceRoleSupabase = await createServiceRoleClient();
    
    const { data: uploadData, error: uploadError } = await serviceRoleSupabase.storage
      .from('pdf-documents')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage 업로드 오류:', uploadError);
      return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 });
    }

    // 데이터베이스 문서 정보 업데이트 (storage_path 추가)
    const { data: document, error: updateError } = await supabase
      .from('pdf_documents')
      .update({ 
        storage_path: storagePath,
        file_uploaded: true
      })
      .eq('id', documentId)
      .eq('account_id', user.id)
      .select()
      .single();

    if (updateError || !document) {
      // 업로드 실패 시 Storage에서 파일 삭제
      await serviceRoleSupabase.storage.from('pdf-documents').remove([storagePath]);
      return NextResponse.json({ error: '문서 정보 업데이트에 실패했습니다.' }, { status: 500 });
    }

    // Ollama 임베딩 처리를 위한 백그라운드 작업 트리거
    // 백엔드 API 호출 (비동기로 처리)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    fetch(`${backendUrl}/pdf-documents/${documentId}/process-embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || ''
      }
    }).catch(error => console.error('임베딩 처리 요청 실패:', error));

    return NextResponse.json({
      success: true,
      message: '파일이 성공적으로 업로드되었습니다. 임베딩 처리가 시작됩니다.',
      document: {
        id: document.id,
        fileName: document.file_name,
        storagePath: storagePath,
        size: file.size
      }
    });

  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}