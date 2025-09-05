-- =============================================
-- basejump.accounts 테이블에 이메일 컬럼 추가 및 동기화
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1. basejump.accounts 테이블에 email 컬럼 추가 (이미 있다면 건너뛰어짐)
ALTER TABLE basejump.accounts 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. 기존 사용자들의 이메일을 auth.users에서 복사
-- (RLS 정책이 허용하는 경우에만 작동)
UPDATE basejump.accounts 
SET email = COALESCE(
    (
        SELECT COALESCE(
            (raw_user_meta_data->>'email')::TEXT,
            auth_users.email
        )
        FROM auth.users auth_users
        WHERE auth_users.id = basejump.accounts.primary_owner_user_id
    ),
    basejump.accounts.name
)
WHERE email IS NULL AND primary_owner_user_id IS NOT NULL;

-- 3. 새로운 사용자 가입 시 자동으로 이메일 동기화하는 트리거 함수
CREATE OR REPLACE FUNCTION sync_user_email_to_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 새로 생성된 계정에 이메일 정보 추가
    IF NEW.primary_owner_user_id IS NOT NULL AND NEW.email IS NULL THEN
        BEGIN
            -- auth.users에서 이메일 가져오기
            SELECT COALESCE(
                (raw_user_meta_data->>'email')::TEXT,
                auth_users.email,
                NEW.name
            ) INTO NEW.email
            FROM auth.users auth_users
            WHERE auth_users.id = NEW.primary_owner_user_id;
        EXCEPTION WHEN OTHERS THEN
            -- 에러 발생 시 name 필드 사용
            NEW.email := COALESCE(NEW.name, 'unknown@example.com');
        END;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. 트리거 생성 (INSERT/UPDATE 시 이메일 동기화)
DROP TRIGGER IF EXISTS sync_email_trigger ON basejump.accounts;
CREATE TRIGGER sync_email_trigger
    BEFORE INSERT OR UPDATE ON basejump.accounts
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email_to_account();

-- 5. 현재 저장된 이메일 확인
SELECT 
    id,
    primary_owner_user_id,
    name,
    email,
    user_role,
    created_at
FROM basejump.accounts
WHERE primary_owner_user_id IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;