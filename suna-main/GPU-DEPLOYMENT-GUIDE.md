# SUNA GPU 배포 완전 가이드 🚀

## 시스템 구성도
```
GitHub Actions (자동 배포)
    ↓
AWS ECS Fargate (컨테이너)
├── Backend (FastAPI)
├── Worker (Dramatiq)
├── Frontend (Next.js)
└── Redis (ElastiCache)

연결→ EC2 GPU (Ollama 서버) ← 70% 비용 절약!
```

## 1단계: AWS 기본 설정 (10분)

### A. IAM 사용자 생성
```bash
# AWS CLI로 빠른 설정
aws iam create-user --user-name aibee-abs
aws iam attach-user-policy --user-name aibee-abs --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
aws iam attach-user-policy --user-name aibee-abs --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
aws iam create-access-key --user-name aibee-abs
```

### B. ECR 리포지토리 생성
```bash
aws ecr create-repository --repository-name suna-backend --region ap-northeast-2
aws ecr create-repository --repository-name suna-frontend --region ap-northeast-2
```

## 2단계: GPU 서버 생성 (15분)

### A. 키페어 생성
```bash
aws ec2 create-key-pair --key-name suna-ollama-key --query 'KeyMaterial' --output text > ~/.ssh/suna-ollama-key.pem
chmod 400 ~/.ssh/suna-ollama-key.pem
```

### B. 스팟 인스턴스로 GPU 서버 생성
```bash
chmod +x ollama-server/create-spot-instance.sh
./ollama-server/create-spot-instance.sh
```

**출력 예시:**
```
=== Ollama GPU 서버 생성 완료! ===
인스턴스 ID: i-0123456789abcdef0
퍼블릭 IP: 13.124.123.45
Ollama API URL: http://13.124.123.45:11435
```

### C. 설치 완료 확인 (5-10분 소요)
```bash
# 설치 진행 상황 확인
ssh -i ~/.ssh/suna-ollama-key.pem ubuntu@13.124.123.45 'tail -f /var/log/ollama-setup.log'

# 설치 완료 후 테스트
curl http://13.124.123.45:11435/api/tags
```

## 3단계: GitHub Secrets 설정 (3분)

**GitHub 저장소 → Settings → Secrets and variables → Actions**

필수 Secrets:
```
AWS_ACCESS_KEY_ID = [IAM 사용자 Access Key]
AWS_SECRET_ACCESS_KEY = [IAM 사용자 Secret Key]
AWS_ACCOUNT_ID = [12자리 AWS 계정 ID]
OLLAMA_HOST = http://13.124.123.45:11435
```

## 4단계: ECS 인프라 설정 (10분)

### A. ElastiCache Redis 생성
```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id suna-redis \
    --engine redis \
    --cache-node-type cache.t3.micro \
    --num-cache-nodes 1 \
    --port 6379 \
    --region ap-northeast-2
```

### B. ECS 클러스터 생성
```bash
aws ecs create-cluster --cluster-name suna-cluster --capacity-providers FARGATE --region ap-northeast-2
```

### C. 로그 그룹 생성
```bash
aws logs create-log-group --log-group-name /ecs/suna-backend --region ap-northeast-2
aws logs create-log-group --log-group-name /ecs/suna-frontend --region ap-northeast-2
aws logs create-log-group --log-group-name /ecs/suna-worker --region ap-northeast-2
```

## 5단계: 첫 배포 실행 🎯

### A. 환경변수 업데이트
1. Redis 엔드포인트 확인:
```bash
aws elasticache describe-cache-clusters --cache-cluster-id suna-redis --show-cache-node-info --region ap-northeast-2
```

2. ECS 작업 정의에서 `REDIS_ENDPOINT_REPLACE_ME`와 `OLLAMA_SERVER_IP_REPLACE_ME` 교체

### B. 코드 푸시하여 배포 시작
```bash
git add .
git commit -m "Deploy SUNA with GPU support"
git push origin main
```

### C. 배포 상태 확인
- GitHub Actions 탭에서 배포 진행 확인
- AWS ECS 콘솔에서 서비스 상태 확인

## 6단계: 도메인 및 HTTPS 설정 (선택사항)

### A. Application Load Balancer 생성
```bash
# VPC와 서브넷 정보 확인
aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --region ap-northeast-2
aws ec2 describe-subnets --filters "Name=default-for-az,Values=true" --region ap-northeast-2

# 로드밸런서 생성 (실제 서브넷 ID로 교체)
aws elbv2 create-load-balancer \
    --name suna-alb \
    --subnets subnet-12345 subnet-67890 \
    --security-groups sg-12345 \
    --region ap-northeast-2
```

## 비용 분석 💰

### 월 예상 비용:
```
EC2 GPU 스팟 인스턴스 (g4dn.xlarge):  $115
ECS Fargate (Backend + Worker + Frontend): $50
ElastiCache (Redis t3.micro): $12
ECR (이미지 저장소): $3
로드밸런서 (선택사항): $20
=====================================
총 월 $180-200 (온디맨드 대비 70% 절약!)
```

### 비용 절약 팁:
1. **스팟 인스턴스 사용**: 70% 비용 절약
2. **개발 시에만 켜두기**: 평일 9-18시만 사용 시 50% 추가 절약
3. **자동 스케일링**: 트래픽 적을 때 인스턴스 수 감소

## 문제해결 🔧

### GPU 서버 연결 안 됨:
```bash
# GPU 서버 상태 확인
ssh -i ~/.ssh/suna-ollama-key.pem ubuntu@[GPU_SERVER_IP]
docker ps | grep ollama
curl localhost:11435/api/tags
```

### ECS 서비스 시작 실패:
```bash
# 로그 확인
aws logs get-log-events \
    --log-group-name /ecs/suna-backend \
    --log-stream-name [STREAM_NAME] \
    --region ap-northeast-2
```

### 스팟 인스턴스 중단:
```bash
# 자동으로 새 스팟 인스턴스 생성
./ollama-server/create-spot-instance.sh
# GitHub Secrets의 OLLAMA_HOST 업데이트
```

## 완료! 🎉

배포 완료 후 접속:
- **Frontend**: http://[ALB-DNS-NAME]
- **Backend API**: http://[ALB-DNS-NAME]/api
- **Ollama API**: http://[GPU-SERVER-IP]:11435

**총 소요 시간: 약 45분**
**월 운영 비용: $180-200** (온디맨드 대비 70% 절약)