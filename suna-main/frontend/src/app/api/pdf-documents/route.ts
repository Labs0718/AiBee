import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PDF 문서 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // RPC 함수를 사용하여 사용자 정보 조회
    const { data: userProfile } = await supabase
      .rpc('get_user_info', { user_uuid: user.id });

    // URL 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const documentType = searchParams.get('type'); // 'common', 'dept', 또는 null (전체)
    const offset = (page - 1) * limit;

    // 기본 쿼리 구성
    let query = supabase
      .from('pdf_documents')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // 접근 권한에 따른 필터링
    if (!userProfile?.is_admin) {
      // 관리자가 아닌 경우: 자신이 업로드한 문서 + 전사공통 + 같은 부서 문서
      query = query.or(`account_id.eq.${user.id},document_type.eq.common,and(document_type.eq.dept,department.eq.${userProfile?.department_name})`);
    }

    // 문서 타입 필터
    if (documentType === 'common') {
      query = query.eq('document_type', 'common');
    } else if (documentType === 'dept') {
      query = query.eq('document_type', 'dept');
    }

    // 검색 필터
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,original_file_name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // 페이지네이션 및 정렬
    const { data: documents, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('PDF 문서 조회 오류:', error);
      return NextResponse.json({ error: '문서 조회 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      documents: documents || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('PDF 문서 조회 오류:', error);
    return NextResponse.json(
      { error: '문서 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PDF 문서 메타데이터 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      file_name,
      original_file_name,
      document_type,
      department,
      access_level = 'public',
      version = 'v1.0',
      category,
      tags = [],
      description,
      creator_name,
      file_size
    } = body;

    // 필수 필드 확인
    if (!file_name || !original_file_name || !document_type || !department) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    // RPC 함수를 사용하여 사용자 정보 조회
    const { data: userProfile } = await supabase
      .rpc('get_user_info', { user_uuid: user.id });

    // 전사공통 문서는 관리자만 생성 가능
    if (document_type === 'common' && !userProfile?.is_admin) {
      return NextResponse.json({ error: '전사공통 문서는 관리자만 생성할 수 있습니다.' }, { status: 403 });
    }

    // 문서 메타데이터 생성
    const { data: newDocument, error: insertError } = await supabase
      .from('pdf_documents')
      .insert({
        file_name,
        original_file_name,
        document_type,
        department,
        access_level,
        version,
        category,
        tags,
        description,
        creator_name,
        file_size,
        account_id: user.id,
        download_count: 0,
        view_count: 0,
        embedding_status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('문서 생성 오류:', insertError);
      return NextResponse.json({ error: '문서 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document: newDocument
    });

  } catch (error) {
    console.error('문서 생성 오류:', error);
    return NextResponse.json(
      { error: '문서 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}