-- =============================================
-- Supabase 완전 설정 SQL
-- SQL Editor에서 실행하세요
-- =============================================

-- 1. 벡터 확장 활성화 (이미 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. pdf_documents 테이블에 컬럼 추가
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS file_uploaded BOOLEAN DEFAULT FALSE;
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS total_chunks INTEGER DEFAULT 0;

-- 3. Storage 버킷 생성 (Supabase Dashboard > Storage에서도 가능)
-- 혹시 오류 나면 Dashboard에서 수동 생성하세요
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'pdf-documents',
  'pdf-documents', 
  false, -- 비공개 버킷
  false,
  52428800, -- 50MB 제한
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage 정책 설정
-- 업로드 정책
CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pdf-documents' 
  AND auth.role() = 'authenticated'
);

-- 조회 정책  
CREATE POLICY "Users can view accessible PDFs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'pdf-documents'
  AND auth.uid() IS NOT NULL
);

-- 삭제 정책
CREATE POLICY "Users can delete their own PDFs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pdf-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. 임베딩 테이블 생성 (Ollama 768차원용)
DROP TABLE IF EXISTS pdf_embeddings;
CREATE TABLE pdf_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT REFERENCES pdf_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(768), -- Ollama nomic-embed-text 크기
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- 6. 벡터 검색 인덱스
CREATE INDEX pdf_embeddings_embedding_idx ON pdf_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 7. 벡터 검색 함수
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(768),
  match_count INT DEFAULT 5,
  filter_department TEXT DEFAULT NULL
)
RETURNS TABLE (
  document_id TEXT,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB,
  document_title TEXT,
  department TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.document_id,
    e.chunk_text,
    1 - (e.embedding <=> query_embedding) as similarity,
    e.metadata,
    d.original_file_name as document_title,
    d.department
  FROM pdf_embeddings e
  JOIN pdf_documents d ON e.document_id = d.id
  WHERE 
    (filter_department IS NULL OR d.department = filter_department)
    AND d.deleted_at IS NULL
    AND d.embedding_status = 'completed'
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 8. 임베딩 상태 확인 함수
CREATE OR REPLACE FUNCTION get_embedding_status(doc_id TEXT)
RETURNS TABLE (
  document_id TEXT,
  embedding_status TEXT,
  total_chunks INTEGER,
  processed_chunks INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as document_id,
    d.embedding_status,
    d.total_chunks,
    (SELECT COUNT(*)::INTEGER FROM pdf_embeddings WHERE document_id = doc_id) as processed_chunks
  FROM pdf_documents d
  WHERE d.id = doc_id;
END;
$$;