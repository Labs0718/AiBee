-- Supabase Cron을 위한 RPC 함수들

-- 1. HTTP 요청을 스케줄링하는 함수
CREATE OR REPLACE FUNCTION schedule_trigger_http(
  job_name text,
  schedule text,
  url text,
  headers jsonb DEFAULT '{}',
  body jsonb DEFAULT '{}',
  timeout_ms int DEFAULT 8000
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_id bigint;
BEGIN
  -- cron.schedule을 사용하여 HTTP 요청 스케줄링
  SELECT cron.schedule(
    job_name,
    schedule,
    format('SELECT net.http_post(url => %L, headers => %L, body => %L, timeout_milliseconds => %s)',
           url, headers, body::text, timeout_ms)
  ) INTO job_id;

  RETURN job_id::text;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to schedule job: %', SQLERRM;
END;
$$;

-- 2. 작업 이름으로 스케줄 해제하는 함수
CREATE OR REPLACE FUNCTION unschedule_job_by_name(job_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_found boolean := false;
BEGIN
  -- 작업 이름으로 스케줄 해제
  SELECT cron.unschedule(job_name) INTO job_found;

  RETURN COALESCE(job_found, false);
EXCEPTION
  WHEN OTHERS THEN
    -- 작업이 없어도 성공으로 처리
    RETURN true;
END;
$$;

-- 3. 활성 cron 작업 조회 함수 (선택사항)
CREATE OR REPLACE FUNCTION get_active_cron_jobs()
RETURNS TABLE(
  jobid bigint,
  schedule text,
  command text,
  nodename text,
  nodeport integer,
  database text,
  username text,
  active boolean,
  jobname text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM cron.job
  WHERE active = true;
END;
$$;

-- 권한 설정 (필요한 경우)
-- GRANT EXECUTE ON FUNCTION schedule_trigger_http TO authenticated;
-- GRANT EXECUTE ON FUNCTION unschedule_job_by_name TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_active_cron_jobs TO authenticated;