# Suna AI Worker 프로그램 관리자 메뉴얼

## 📖 목차
1. [시스템 개요](#시스템-개요)
2. [설치 및 초기 설정](#설치-및-초기-설정)
3. [서비스 관리](#서비스-관리)
4. [환경 설정](#환경-설정)
5. [모니터링 및 유지보수](#모니터링-및-유지보수)
6. [백업 및 복구](#백업-및-복구)
7. [보안 관리](#보안-관리)
8. [문제 해결](#문제-해결)

## 🏗️ 시스템 개요

### 프로젝트 정보
- **프로젝트명**: Suna (Kortix AI Agent Platform)
- **버전**: 0.1.3+
- **라이선스**: Apache License 2.0
- **아키텍처**: 마이크로서비스 기반 Docker 컨테이너 구조

### 주요 구성 요소

#### 1. 백엔드 서비스
- **API 서버**: FastAPI 기반 REST API (포트: 8000)
- **백그라운드 워커**: Dramatiq 기반 비동기 작업 처리
- **데이터베이스**: Supabase (PostgreSQL 기반)
- **캐시**: Redis (포트: 6379)

#### 2. 프론트엔드 서비스
- **웹 인터페이스**: Next.js 15+ (포트: 3000)
- **인증**: Supabase Auth 기반 JWT 토큰

#### 3. AI 에이전트 실행 환경
- **브라우저 샌드박스**: 격리된 Docker 컨테이너
- **VNC**: 포트 5901 (원격 접속)
- **noVNC**: 포트 6080 (웹 기반 접속)
- **Stagehand API**: 포트 8004 (브라우저 자동화)

#### 4. 외부 서비스 연동
- **LLM 제공자**: Anthropic Claude, OpenAI, Groq, OpenRouter 등
- **검색 서비스**: Tavily API
- **웹 스크래핑**: Firecrawl API
- **에이전트 실행**: Daytona

## 🚀 설치 및 초기 설정

### 시스템 요구사항
- **운영체제**: Linux, macOS, Windows (Docker 지원)
- **메모리**: 최소 4GB, 권장 8GB 이상
- **디스크**: 최소 10GB 여유 공간
- **네트워크**: 인터넷 연결 필수

### 필수 소프트웨어
```bash
# Docker 설치 확인
docker --version
docker-compose --version

# Python 3.11+ 설치 확인
python --version

# Git 설치 확인
git --version
```

### 1. 프로젝트 클론
```bash
git clone https://github.com/kortix-ai/suna.git
cd suna
```

### 2. 자동 설치 (권장)
```bash
# 설치 마법사 실행
python setup.py

# 서비스 시작
python start.py
```

### 3. 수동 설치
#### 3.1 환경 변수 설정
```bash
# 백엔드 환경 설정
cp ./suna-main/backend/.env.example ./suna-main/backend/.env
# 프론트엔드 환경 설정
cp ./suna-main/frontend/.env.example ./suna-main/frontend/.env.local
```

#### 3.2 의존성 설치
```bash
# 백엔드 의존성
cd ./suna-main/backend
uv install

# 프론트엔드 의존성
cd ../frontend
npm install
```

## 🔧 서비스 관리

### Docker Compose를 이용한 서비스 관리

#### 전체 서비스 시작
```bash
# 백그라운드 실행
docker compose up -d

# 또는 Python 스크립트 사용
python start.py
```

#### 개별 서비스 관리
```bash
# Redis만 시작
docker compose up redis -d

# 백엔드 API 및 워커만 시작
docker compose up backend worker -d

# 프론트엔드만 시작
docker compose up frontend -d

# 브라우저 샌드박스만 시작
docker compose up browser-sandbox -d
```

#### 서비스 중지
```bash
# 전체 서비스 중지
docker compose down

# 특정 서비스만 중지
docker compose stop backend
```

#### 서비스 재시작
```bash
# 전체 서비스 재시작
docker compose restart

# 특정 서비스 재시작
docker compose restart backend
```

### 개발 모드 실행

#### 1. Redis만 Docker로 실행
```bash
docker compose up redis -d
```

#### 2. 백엔드 로컬 실행
```bash
cd ./suna-main/backend

# API 서버 실행 (터미널 1)
uv run api.py

# 백그라운드 워커 실행 (터미널 2)
uv run dramatiq --processes 4 --threads 4 run_agent_background
```

#### 3. 프론트엔드 로컬 실행
```bash
cd ./suna-main/frontend
npm run dev
```

## ⚙️ 환경 설정

### 백엔드 환경 설정 (.env)

#### 필수 설정 항목
```env
# 환경 모드
ENV_MODE=local  # local, staging, production

# 데이터베이스 (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis 설정
REDIS_HOST=redis  # Docker 사용시 'redis', 로컬 실행시 'localhost'
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_SSL=false

# LLM 제공자 (최소 하나 필수)
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
OPENROUTER_API_KEY=your-openrouter-key
GEMINI_API_KEY=your-gemini-api-key
MODEL_TO_USE=anthropic/claude-sonnet-4-20250514

# 웹 검색 및 스크래핑
TAVILY_API_KEY=your-tavily-key
FIRECRAWL_API_KEY=your-firecrawl-key
FIRECRAWL_URL=https://api.firecrawl.dev

# 에이전트 실행 환경
DAYTONA_API_KEY=your-daytona-key
DAYTONA_SERVER_URL=https://app.daytona.io/api
DAYTONA_TARGET=us

# 웹훅 설정
WEBHOOK_BASE_URL=https://your-domain.ngrok.io

# MCP 설정
MCP_CREDENTIAL_ENCRYPTION_KEY=your-generated-encryption-key

# 선택사항 API
RAPID_API_KEY=your-rapidapi-key
```

#### 로그 및 모니터링
```env
# Langfuse (LLM 추적)
LANGFUSE_PUBLIC_KEY=pk-your-public-key
LANGFUSE_SECRET_KEY=sk-your-secret-key
LANGFUSE_HOST=https://cloud.langfuse.com

# 기타 분석 도구
SMITHERY_API_KEY=your-smithery-key
```

### 프론트엔드 환경 설정 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ENV_MODE=LOCAL
```

### Docker Compose 환경 변수
주요 환경 변수들이 docker-compose.yaml에서 오버라이드됩니다:
- `HOST_PORT`: 백엔드 포트 (기본값: 8000)
- `OLLAMA_HOST`: 로컬 LLM 서비스 URL
- `MODEL_TO_USE`: 사용할 LLM 모델

## 📊 모니터링 및 유지보수

### 서비스 상태 확인

#### 컨테이너 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker compose ps

# 전체 Docker 컨테이너 상태
docker ps -a

# 특정 서비스 로그 확인
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f worker
docker compose logs -f redis
```

#### 리소스 사용량 모니터링
```bash
# Docker 컨테이너 리소스 사용량
docker stats

# 시스템 리소스 확인
htop  # Linux/macOS
# 또는 작업 관리자 (Windows)
```

#### 네트워크 및 포트 확인
```bash
# 포트 사용 확인
netstat -tulpn | grep -E ":(3000|8000|6379|5901|6080|8004|9222)"

# 서비스 응답 확인
curl http://localhost:8000/health
curl http://localhost:3000
```

### 로그 관리

#### 로그 위치
- **Docker 로그**: `docker compose logs [service]`
- **애플리케이션 로그**: 각 서비스 내부 로그 시스템 사용

#### 로그 순환 설정
```yaml
# docker-compose.yml에서 로그 설정
logging:
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "3"
```

### 성능 최적화

#### Redis 캐시 최적화
```bash
# Redis 메모리 사용량 확인
redis-cli info memory

# Redis 설정 확인
redis-cli config get maxmemory-policy
```

#### 데이터베이스 최적화
- Supabase 대시보드에서 쿼리 성능 모니터링
- 자주 사용되는 쿼리에 대한 인덱스 최적화
- 정기적인 데이터베이스 청소 작업

## 💾 백업 및 복구

### 데이터베이스 백업
```bash
# Supabase CLI를 통한 백업
supabase db dump --db-url [DATABASE_URL] > backup.sql

# 정기 백업 스크립트 예시
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
supabase db dump --db-url $DATABASE_URL > "backup_$DATE.sql"
```

### 설정 파일 백업
```bash
# 중요 설정 파일들 백업
tar -czf suna_config_backup.tar.gz \
  ./suna-main/backend/.env \
  ./suna-main/frontend/.env.local \
  ./suna-main/docker-compose.yaml
```

### Redis 데이터 백업
```bash
# Redis 데이터 백업
docker exec [redis-container-name] redis-cli BGSAVE
docker cp [redis-container-name]:/data/dump.rdb ./redis_backup.rdb
```

### 복구 절차
1. 서비스 중지: `docker compose down`
2. 백업 파일에서 설정 복원
3. 데이터베이스 복원: Supabase에서 SQL 파일 실행
4. Redis 데이터 복원 (필요시)
5. 서비스 재시작: `docker compose up -d`

## 🔒 보안 관리

### 접근 제어
- **포트 방화벽**: 필요한 포트만 외부 접근 허용
- **JWT 토큰 관리**: 정기적인 토큰 갱신 정책
- **API 키 관리**: 환경 변수를 통한 안전한 키 보관

### SSL/TLS 설정
```nginx
# Nginx 역방향 프록시 설정 예시
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}
```

### 데이터베이스 보안
- **Row Level Security (RLS)**: Supabase에서 활성화
- **API 키 순환**: 정기적인 API 키 교체
- **감사 로그**: 중요한 작업에 대한 로그 기록

### Docker 보안
```yaml
# docker-compose.yml 보안 설정
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
user: "1001:1001"  # 비root 사용자
```

## 🚨 문제 해결

### 일반적인 문제 및 해결책

#### 1. 컨테이너 시작 실패
```bash
# 로그 확인
docker compose logs [service-name]

# 포트 충돌 확인
netstat -tulpn | grep [port-number]

# 이미지 재빌드
docker compose up --build -d
```

#### 2. 데이터베이스 연결 실패
- Supabase 설정 확인
- API 키 유효성 검증
- 네트워크 연결 상태 확인
- basejump 스키마 노출 여부 확인

#### 3. LLM API 연결 문제
```bash
# API 키 테스트
curl -H "Authorization: Bearer [API_KEY]" \
  https://api.anthropic.com/v1/messages

# 사용량 한도 확인
# 각 제공자의 대시보드에서 확인
```

#### 4. Redis 연결 문제
```bash
# Redis 연결 테스트
redis-cli -h localhost -p 6379 ping

# Redis 컨테이너 재시작
docker compose restart redis
```

#### 5. 브라우저 샌드박스 문제
```bash
# VNC 포트 확인
telnet localhost 5901

# noVNC 웹 접속 확인
curl http://localhost:6080

# 컨테이너 재시작
docker compose restart browser-sandbox
```

### 성능 문제 해결

#### 메모리 부족
```bash
# 메모리 사용량 확인
docker stats --no-stream

# 불필요한 컨테이너 정리
docker system prune -f
```

#### 디스크 공간 부족
```bash
# Docker 정리
docker system prune -a -f

# 로그 파일 정리
docker compose logs --tail=0 -f
```

### 복구 절차

#### 전체 시스템 복구
1. 모든 컨테이너 중지: `docker compose down`
2. 백업에서 데이터 복원
3. 설정 파일 확인 및 복원
4. 단계별 서비스 시작:
   ```bash
   docker compose up redis -d
   docker compose up backend worker -d
   docker compose up frontend -d
   ```

#### 부분 복구
```bash
# 특정 서비스만 재시작
docker compose restart [service-name]

# 설정 리로드 (가능한 경우)
docker compose exec backend kill -HUP 1
```

## 📞 지원 및 문의

### 공식 지원 채널
- **GitHub**: https://github.com/kortix-ai/suna
- **Discord 커뮤니티**: https://discord.gg/Py6pCBUUPw
- **공식 문서**: https://docs.kortix.ai

### 관리자 체크리스트

#### 일일 점검 항목
- [ ] 모든 서비스 상태 확인
- [ ] 시스템 리소스 사용량 모니터링
- [ ] 오류 로그 검토
- [ ] 외부 API 서비스 상태 확인

#### 주간 점검 항목
- [ ] 시스템 업데이트 확인
- [ ] 보안 패치 적용
- [ ] 백업 상태 확인
- [ ] 성능 지표 분석

#### 월간 점검 항목
- [ ] 전체 백업 실행 및 검증
- [ ] API 키 순환
- [ ] 용량 계획 검토
- [ ] 보안 감사 수행

---

이 메뉴얼은 Suna AI Worker 시스템의 효과적인 관리와 운영을 위한 종합 가이드입니다. 추가 문의사항이나 기술적 지원이 필요한 경우 공식 지원 채널을 통해 도움을 받으시기 바랍니다.