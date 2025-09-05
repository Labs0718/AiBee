-- =============================================
-- BGE Large (1024차원)으로 업데이트
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. 기존 임베딩 테이블 및 인덱스 삭제
DROP INDEX IF EXISTS pdf_embeddings_embedding_idx;
DROP TABLE IF EXISTS pdf_embeddings;

-- 2. BGE Large용 임베딩 테이블 재생성 (1024차원)
CREATE TABLE pdf_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT REFERENCES pdf_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(1024), -- BGE Large는 1024차원
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- 3. 벡터 검색 인덱스 재생성
CREATE INDEX pdf_embeddings_embedding_idx ON pdf_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. 검색 함수 업데이트 (1024차원)
CREATE OR REPLACE FUNCTION search_documents(
  query_embedding vector(1024), -- 1024차원으로 변경
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

-- 5. 모든 기존 문서의 임베딩 상태를 pending으로 리셋
UPDATE pdf_documents 
SET embedding_status = 'pending', total_chunks = 0
WHERE embedding_status IN ('completed', 'processing', 'failed');