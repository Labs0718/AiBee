-- Supabase Storage 버킷 생성 (Supabase Dashboard에서 실행)
-- Storage > Buckets에서 생성하거나 아래 SQL 사용

-- 0. pdf_documents 테이블에 컬럼 추가
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE pdf_documents ADD COLUMN IF NOT EXISTS file_uploaded BOOLEAN DEFAULT FALSE;

-- 1. PDF 저장용 버킷 생성
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

-- 2. 버킷 정책 설정 (인증된 사용자만 접근)
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdf-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pdf-documents'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pdf-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. 임베딩 테이블 수정 (Ollama 용)
DROP TABLE IF EXISTS pdf_embeddings;
CREATE TABLE pdf_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT REFERENCES pdf_documents(id) ON DELETE CASCADE, -- TEXT 타입으로 변경
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(768), -- Ollama nomic-embed-text 크기
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- 4. 벡터 검색 인덱스
CREATE INDEX pdf_embeddings_embedding_idx ON pdf_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. 검색 함수
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(768),
  match_count INT DEFAULT 5,
  filter_department TEXT DEFAULT NULL
)
RETURNS TABLE (
  document_id TEXT,
  chunk_text TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.document_id,
    e.chunk_text,
    1 - (e.embedding <=> query_embedding) as similarity,
    e.metadata
  FROM pdf_embeddings e
  JOIN pdf_documents d ON e.document_id = d.id
  WHERE 
    (filter_department IS NULL OR d.department = filter_department)
    AND d.deleted_at IS NULL
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;