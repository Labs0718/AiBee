import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// PDF 문서 상세 정보 조회
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

    // 문서 정보 조회
    const { data: document, error: dbError } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('id', documentId)
      .is('deleted_at', null)
      .single();

    if (dbError || !document) {
      return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 조회수 증가 (public 스키마이므로 직접 접근)
    const { data: currentDoc } = await supabase
      .from('pdf_documents')
      .select('view_count')
      .eq('id', documentId)
      .single();
    
    if (currentDoc) {
      await supabase
        .from('pdf_documents')
        .update({ view_count: (currentDoc.view_count || 0) + 1 })
        .eq('id', documentId);
    }

    return NextResponse.json({ document });

  } catch (error) {
    console.error('문서 조회 오류:', error);
    return NextResponse.json(
      { error: '문서 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PDF 문서 정보 수정
export async function PATCH(
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
    const body = await request.json();

    // 현재 문서 정보 조회 및 권한 확인
    const { data: currentDocument, error: fetchError } = await supabase
      .from('pdf_documents')
      .select('account_id, document_type')
      .eq('id', documentId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !currentDocument) {
      return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // RPC 함수를 사용하여 사용자 정보 조회
    const { data: userProfile } = await supabase
      .rpc('get_user_info', { user_uuid: user.id });

    const isOwner = currentDocument.account_id === user.id;
    const isAdmin = userProfile?.is_admin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: '이 문서를 수정할 권한이 없습니다.' }, { status: 403 });
    }

    // 전사공통 문서로 변경하는 경우 관리자 권한 확인
    if (body.document_type === 'common' && !isAdmin) {
      return NextResponse.json({ error: '전사공통 문서는 관리자만 설정할 수 있습니다.' }, { status: 403 });
    }

    // 허용되는 필드만 업데이트
    const allowedUpdates = {
      ...(body.document_type && { document_type: body.document_type }),
      ...(body.access_level && { access_level: body.access_level }),
      ...(body.version && { version: body.version }),
      ...(body.category && { category: body.category }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.description !== undefined && { description: body.description }),
      updated_at: new Date().toISOString()
    };

    // 문서 정보 업데이트
    const { data: updatedDocument, error: updateError } = await supabase
      .from('pdf_documents')
      .update(allowedUpdates)
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      console.error('문서 수정 오류:', updateError);
      return NextResponse.json({ error: '문서 수정 중 오류가 발생했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument
    });

  } catch (error) {
    console.error('문서 수정 오류:', error);
    return NextResponse.json(
      { error: '문서 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PDF 문서 삭제
export async function DELETE(
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

    // 현재 문서 정보 조회 및 권한 확인
    const { data: document, error: fetchError } = await supabase
      .from('pdf_documents')
      .select('account_id, file_name')
      .eq('id', documentId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // RPC 함수를 사용하여 사용자 정보 조회
    const { data: userProfile } = await supabase
      .rpc('get_user_info', { user_uuid: user.id });

    const isOwner = document.account_id === user.id;
    const isAdmin = userProfile?.is_admin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: '이 문서를 삭제할 권한이 없습니다.' }, { status: 403 });
    }

    // 소프트 삭제 (deleted_at 필드 설정)
    const { error: deleteError } = await supabase
      .from('pdf_documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId);

    if (deleteError) {
      console.error('문서 삭제 오류:', deleteError);
      return NextResponse.json({ error: '문서 삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // PDF 임베딩 데이터 삭제 (CASCADE로 자동 삭제되지만 명시적으로 삭제)
    await supabase
      .from('pdf_embeddings')
      .delete()
      .eq('document_id', documentId);

    // Supabase Storage에서 파일 삭제
    try {
      // storage_path가 있다면 Storage에서 삭제
      const { data: docData } = await supabase
        .from('pdf_documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();
        
      if (docData?.storage_path) {
        await supabase.storage
          .from('pdf-documents')
          .remove([docData.storage_path]);
      }
    } catch (storageError) {
      console.warn('Storage 파일 삭제 실패:', storageError);
      // Storage 삭제 실패는 치명적이지 않으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      message: '문서가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('문서 삭제 오류:', error);
    return NextResponse.json(
      { error: '문서 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}