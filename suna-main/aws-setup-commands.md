# AWS 설정 명령어 모음

## 1. ECR 리포지토리 생성
```bash
# Backend 리포지토리
aws ecr create-repository --repository-name suna-backend --region ap-northeast-2

# Frontend 리포지토리
aws ecr create-repository --repository-name suna-frontend --region ap-northeast-2
```

## 2. IAM 사용자 생성 (GitHub Actions용)
```bash
# IAM 사용자 생성
aws iam create-user --user-name aibee-abs

# 정책 첨부
aws iam put-user-policy \
    --user-name aibee-abs \
    --policy-name SunaDeploymentPolicy \
    --policy-document file://aws-iam-policy.json

# Access Key 생성 (출력된 키를 GitHub Secrets에 저장)
aws iam create-access-key --user-name aibee-abs
```

## 3. ECS 클러스터 및 서비스 생성
```bash
# 클러스터 생성
aws ecs create-cluster --cluster-name aibee-cluster --capacity-providers FARGATE

# VPC 및 서브넷 정보 확인 (기본 VPC 사용)
aws ec2 describe-vpcs --filters "Name=is-default,Values=true"
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-xxxxxxxx"

# 보안 그룹 생성
aws ec2 create-security-group \
    --group-name suna-sg \
    --description "Security group for SUNA application" \
    --vpc-id vpc-xxxxxxxx

# 보안 그룹 규칙 추가 (HTTP/HTTPS 허용)
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 3000 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 8000 \
    --cidr 0.0.0.0/0
```

## 4. 로그 그룹 생성
```bash
aws logs create-log-group --log-group-name /ecs/suna-backend
aws logs create-log-group --log-group-name /ecs/suna-frontend
aws logs create-log-group --log-group-name /ecs/suna-worker
```

## 5. ElastiCache Redis 인스턴스 생성
```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id suna-redis \
    --engine redis \
    --cache-node-type cache.t3.micro \
    --num-cache-nodes 1 \
    --port 6379
```

## 6. GitHub Secrets에 추가할 값들
- `AWS_ACCESS_KEY_ID`: IAM 사용자의 Access Key ID
- `AWS_SECRET_ACCESS_KEY`: IAM 사용자의 Secret Access Key
- `AWS_ACCOUNT_ID`: AWS 계정 ID (12자리 숫자)
- `REDIS_HOST`: ElastiCache Redis 엔드포인트