#!/bin/bash

# EC2 스팟 인스턴스로 Ollama GPU 서버 생성 스크립트
# 70% 비용 절약! ($380 → $115/월)

set -e

# 설정값
INSTANCE_TYPE="g4dn.xlarge"
MAX_PRICE="0.20"  # 시간당 최대 $0.20 (온디맨드는 $0.526)
REGION="ap-northeast-2"
KEY_NAME="suna-ollama-key"  # 사전에 생성된 키페어 이름
SECURITY_GROUP_NAME="ollama-gpu-sg"

echo "=== EC2 스팟 인스턴스로 Ollama GPU 서버 생성 ==="

# 1. 보안 그룹 생성 (존재하지 않는 경우)
echo "보안 그룹 확인 중..."
SG_ID=$(aws ec2 describe-security-groups \
    --group-names $SECURITY_GROUP_NAME \
    --region $REGION \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || echo "None")

if [[ "$SG_ID" == "None" ]]; then
    echo "보안 그룹 생성 중..."
    SG_ID=$(aws ec2 create-security-group \
        --group-name $SECURITY_GROUP_NAME \
        --description "Security group for Ollama GPU server" \
        --region $REGION \
        --query 'GroupId' --output text)

    # Ollama API 포트 (11435) 및 SSH 포트 (22) 허용
    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 11435 \
        --cidr 0.0.0.0/0 \
        --region $REGION

    aws ec2 authorize-security-group-ingress \
        --group-id $SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --region $REGION

    echo "보안 그룹 생성 완료: $SG_ID"
else
    echo "기존 보안 그룹 사용: $SG_ID"
fi

# 2. 최신 Ubuntu 20.04 LTS AMI ID 조회
echo "최신 Ubuntu AMI 조회 중..."
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters \
        'Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*' \
        'Name=state,Values=available' \
    --query 'Images|sort_by(@, &CreationDate)[-1].[ImageId]' \
    --region $REGION \
    --output text)

echo "AMI ID: $AMI_ID"

# 3. User Data 스크립트를 Base64로 인코딩
USER_DATA=$(base64 -w 0 ollama-server/user-data.sh)

# 4. 스팟 인스턴스 요청 생성
echo "스팟 인스턴스 생성 중... (최대 가격: $${MAX_PRICE}/시간)"

SPOT_REQUEST=$(aws ec2 request-spot-instances \
    --spot-price $MAX_PRICE \
    --instance-count 1 \
    --type "one-time" \
    --launch-specification "{
        \"ImageId\": \"$AMI_ID\",
        \"InstanceType\": \"$INSTANCE_TYPE\",
        \"KeyName\": \"$KEY_NAME\",
        \"SecurityGroupIds\": [\"$SG_ID\"],
        \"UserData\": \"$USER_DATA\"
    }" \
    --region $REGION \
    --query 'SpotInstanceRequests[0].SpotInstanceRequestId' \
    --output text)

echo "스팟 인스턴스 요청 ID: $SPOT_REQUEST"

# 5. 인스턴스 시작까지 대기
echo "인스턴스 시작 대기 중..."
aws ec2 wait spot-instance-request-fulfilled \
    --spot-instance-request-ids $SPOT_REQUEST \
    --region $REGION

# 6. 인스턴스 ID 조회
INSTANCE_ID=$(aws ec2 describe-spot-instance-requests \
    --spot-instance-request-ids $SPOT_REQUEST \
    --region $REGION \
    --query 'SpotInstanceRequests[0].InstanceId' \
    --output text)

echo "인스턴스 ID: $INSTANCE_ID"

# 7. 인스턴스가 실행 중이 될 때까지 대기
echo "인스턴스 실행 대기 중..."
aws ec2 wait instance-running \
    --instance-ids $INSTANCE_ID \
    --region $REGION

# 8. 퍼블릭 IP 조회
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# 9. 인스턴스에 태그 추가
aws ec2 create-tags \
    --resources $INSTANCE_ID \
    --tags Key=Name,Value=suna-ollama-gpu-server \
           Key=Purpose,Value=ollama-embeddings \
           Key=CostOptimized,Value=spot-instance \
    --region $REGION

echo ""
echo "=== Ollama GPU 서버 생성 완료! ==="
echo "인스턴스 ID: $INSTANCE_ID"
echo "퍼블릭 IP: $PUBLIC_IP"
echo "Ollama API URL: http://$PUBLIC_IP:11435"
echo ""
echo "설치 진행 상황 확인:"
echo "ssh -i ~/.ssh/$KEY_NAME.pem ubuntu@$PUBLIC_IP 'tail -f /var/log/ollama-setup.log'"
echo ""
echo "설치 완료 후 테스트:"
echo "curl http://$PUBLIC_IP:11435/api/tags"
echo ""
echo "예상 월 비용: 약 $115 (70% 절약!)"

# 10. OLLAMA_HOST 환경변수 업데이트 안내
echo ""
echo "다음 단계:"
echo "1. GitHub Secrets에 OLLAMA_HOST 추가:"
echo "   OLLAMA_HOST=http://$PUBLIC_IP:11435"
echo ""
echo "2. 또는 backend/.env 파일에 추가:"
echo "   OLLAMA_HOST=http://$PUBLIC_IP:11435"