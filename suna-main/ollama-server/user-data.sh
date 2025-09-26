#!/bin/bash

# EC2 GPU 인스턴스에서 Ollama 서버 자동 설치 스크립트
# g4dn.xlarge (Tesla T4, 16GB GPU 메모리) 최적화

set -e

# 로그 설정
exec > >(tee /var/log/ollama-setup.log)
exec 2>&1

echo "=== Ollama GPU 서버 설정 시작 ==="

# NVIDIA 드라이버 설치
echo "NVIDIA 드라이버 설치 중..."
apt-get update -y
apt-get install -y awscli

# CUDA 및 NVIDIA Docker 설치
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | tee /etc/apt/sources.list.d/nvidia-docker.list

apt-get update -y
apt-get install -y nvidia-container-toolkit nvidia-docker2

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Docker에 NVIDIA 런타임 설정
systemctl restart docker

echo "=== Ollama 컨테이너 실행 ==="

# Ollama GPU 컨테이너 실행
docker run -d \
  --gpus all \
  --name ollama-server \
  --restart unless-stopped \
  -p 11435:11434 \
  -v ollama-data:/root/.ollama \
  -e OLLAMA_HOST=0.0.0.0:11434 \
  -e OLLAMA_ORIGINS="*" \
  ollama/ollama:latest

echo "Ollama 서버 시작 대기 중..."
sleep 30

# 임베딩 모델 다운로드
echo "bge-m3 모델 다운로드 중..."
docker exec ollama-server ollama pull bge-m3

echo "nomic-embed-text 모델 다운로드 중 (백업)..."
docker exec ollama-server ollama pull nomic-embed-text

# 선택적: 추론용 모델도 다운로드
echo "deepseek-r1:32b 모델 다운로드 중..."
docker exec ollama-server ollama pull deepseek-r1:32b

# 상태 확인
echo "=== 설치 완료 상태 확인 ==="
docker ps | grep ollama-server
docker exec ollama-server ollama list

# CloudWatch 에이전트 설치 (선택적 모니터링)
wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E amazon-cloudwatch-agent.deb

# 헬스체크 스크립트 생성
cat > /home/ubuntu/health-check.sh << 'EOF'
#!/bin/bash
# Ollama 서버 상태 확인
HEALTH_CHECK=$(curl -s http://localhost:11435/api/tags || echo "FAILED")
if [[ "$HEALTH_CHECK" == *"models"* ]]; then
    echo "$(date): Ollama 서버 정상 동작 중"
else
    echo "$(date): Ollama 서버 오류 - 재시작 시도"
    docker restart ollama-server
    sleep 60
    docker exec ollama-server ollama pull bge-m3
fi
EOF

chmod +x /home/ubuntu/health-check.sh

# 5분마다 헬스체크 실행
echo "*/5 * * * * /home/ubuntu/health-check.sh >> /var/log/ollama-health.log 2>&1" | crontab -

echo "=== Ollama GPU 서버 설정 완료! ==="
echo "서버 주소: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):11435"
echo "테스트: curl http://localhost:11435/api/tags"