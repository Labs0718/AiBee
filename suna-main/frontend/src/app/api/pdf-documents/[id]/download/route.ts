import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { id: documentId } = await params;

    // 문서 정보 조회 및 권한 확인
    const { data: document, error: dbError } = await supabase
      .from('pdf_documents')
      .select(`
        id,
        file_name,
        original_file_name,
        document_type,
        department,
        access_level,
        account_id,
        storage_path,
        deleted_at
      `)
      .eq('id', documentId)
      .is('deleted_at', null)
      .single();

    if (dbError || !document) {
      return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // RPC 함수를 사용하여 사용자 정보 조회
    const { data: userProfile } = await supabase
      .rpc('get_user_info', { user_uuid: user.id });

    // 접근 권한 확인
    const canAccess = 
      document.account_id === user.id || // 업로드한 사용자
      document.document_type === 'common' || // 전사 공통 문서
      (document.document_type === 'dept' && document.department === userProfile?.department_name) || // 같은 부서
      userProfile?.is_admin; // 관리자

    if (!canAccess) {
      return NextResponse.json({ error: '이 문서에 대한 접근 권한이 없습니다.' }, { status: 403 });
    }

    // storage_path가 없으면 오류
    if (!document.storage_path) {
      return NextResponse.json({ error: '파일 경로 정보가 없습니다.' }, { status: 404 });
    }

    // Supabase Storage에서 파일 다운로드
    const { data: fileData, error: storageError } = await supabase.storage
      .from('pdf-documents')
      .download(document.storage_path);

    if (storageError || !fileData) {
      console.error('Storage 다운로드 오류:', storageError);
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Blob을 Buffer로 변환
    const fileBuffer = Buffer.from(await fileData.arrayBuffer());

    // 다운로드 횟수 증가 (public 스키마이므로 직접 접근)
    const { data: currentDoc } = await supabase
      .from('pdf_documents')
      .select('download_count')
      .eq('id', documentId)
      .single();
    
    if (currentDoc) {
      await supabase
        .from('pdf_documents')
        .update({ download_count: (currentDoc.download_count || 0) + 1 })
        .eq('id', documentId);
    }

    // 파일 응답
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(document.original_file_name)}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    return NextResponse.json(
      { error: '파일 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}