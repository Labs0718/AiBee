
# 아이비 AWS 배포 가이드

## 1️⃣ AWS 계정이 있다면 바로 시작!

### AWS 콘솔에서 할 일 (10분):

1. **IAM 사용자 생성**
   - AWS 콘솔 → IAM → Users → Create user
   - 사용자 이름: `github-actions-suna`
   - Attach policies directly 선택
   - 정책: `AmazonEC2ContainerRegistryFullAccess`, `AmazonECS_FullAccess`

2. **Access Key 생성**
   - 사용자 생성 후 → Security credentials → Create access key
   - Use case: Third-party service 선택
   - **Access Key ID**와 **Secret Access Key** 복사해두기! ⚠️⚠️

3. **ECR 리포지토리 생성**
   - AWS 콘솔 → ECR → Create repository
   - 이름: `suna-backend` 생성
   - 이름: `suna-frontend` 생성

4. **계정 ID 확인**
   - 우측 상단 계정명 클릭하면 12자리 숫자 확인

## 2️⃣ GitHub에서 할 일 (3분):

1. **GitHub 저장소 → Settings → Secrets and variables → Actions**
2. **New repository secret** 클릭해서 다음 추가:
   ```
   AWS_ACCESS_KEY_ID = [위에서 복사한 Access Key ID]
   AWS_SECRET_ACCESS_KEY = [위에서 복사한 Secret Access Key]
   AWS_ACCOUNT_ID = [12자리 계정 ID]
   ```

## 3️⃣ 코드 푸시하면 자동 배포! 

1. 이 코드를 GitHub에 푸시
2. Actions 탭에서 배포 진행상황 확인
3. 완료!

## 주의사항 
- 처음 배포시 ECS 서비스가 없어서 실패할 수 있음
- 그럴 땐 AWS 콘솔에서 ECS 서비스 수동 생성 필요
- Redis는 ElastiCache 또는 외부 서비스 사용

## 비용 예상
- ECS Fargate: 월 $20-50
- ECR: 월 $1-5
- ElastiCache: 월 $15-30
- **총 월 $40-85 정도**
