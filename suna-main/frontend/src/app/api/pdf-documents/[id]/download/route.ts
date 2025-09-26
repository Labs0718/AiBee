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

    // 사용자 정보 조회 - accounts 테이블에서 직접 조회
    let userProfile = null;
    let isAdmin = false;
    let userDepartment = null;

    // accounts 테이블에서 사용자 정보 조회 (백엔드 로그에서 확인한 구조)
    const { data: accountProfile, error: accountError } = await supabase
      .from('accounts')
      .select(`
        id,
        user_role,
        display_name,
        department_id,
        departments!accounts_department_id_fkey(name, display_name)
      `)
      .eq('id', user.id)
      .single();

    if (accountError) {
      console.warn('Account query 오류:', accountError);

      // 대체 방법: user_info 뷰가 있는지 확인
      const { data: userInfoProfile, error: userInfoError } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userInfoError) {
        console.warn('User_info query 오류:', userInfoError);
        // 기본값으로 설정 - 적어도 인증된 사용자이므로 최소 권한 부여
        userProfile = { id: user.id };
        isAdmin = false;
        userDepartment = null;
      } else {
        userProfile = userInfoProfile;
        isAdmin = userInfoProfile.user_role === 'admin' || userInfoProfile.user_role === 'operator';
        userDepartment = userInfoProfile.department_name || userInfoProfile.department;
      }
    } else {
      userProfile = accountProfile;
      isAdmin = accountProfile.user_role === 'admin' || accountProfile.user_role === 'operator';
      // departments 조인으로 부서명 가져오기
      userDepartment = accountProfile.departments?.[0]?.display_name || accountProfile.departments?.[0]?.name;
    }

    // 디버깅 로그
    console.log('다운로드 권한 체크:', {
      documentId,
      userId: user.id,
      documentAccountId: document.account_id,
      isOwner: document.account_id === user.id,
      documentType: document.document_type,
      documentDepartment: document.department,
      userDepartment: userDepartment,
      isAdmin: isAdmin,
      userProfile,
      accountError,
      accountProfile
    });

    // 접근 권한 확인
    const isOwner = document.account_id === user.id;
    const isCommon = document.document_type === 'common';
    const isSameDept = document.document_type === 'dept' && document.department === userDepartment;

    const canAccess = isOwner || isCommon || isSameDept || isAdmin;

    console.log('권한 체크 결과:', {
      isOwner,
      isCommon,
      isSameDept,
      isAdmin,
      canAccess
    });

    if (!canAccess) {
      const errorDetails = {
        reason: '접근 권한 없음',
        isOwner,
        isCommon,
        isSameDept,
        isAdmin,
        userDepartment,
        documentDepartment: document.department,
        documentType: document.document_type,
        userId: user.id,
        documentAccountId: document.account_id
      };

      console.error('접근 권한 거부:', errorDetails);

      return NextResponse.json({
        error: '이 문서에 대한 접근 권한이 없습니다.',
        details: errorDetails
      }, { status: 403 });
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