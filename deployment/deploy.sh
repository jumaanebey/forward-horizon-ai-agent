#!/bin/bash

# Forward Horizon AI Agent Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_IMAGE="ghcr.io/jumaanebey/forward-horizon-ai-agent"
CONTAINER_NAME="forward-horizon-ai"
NETWORK_NAME="forward-horizon-network"
VOLUME_NAME="forward-horizon-data"

# Environment (production, staging, development)
ENVIRONMENT=${1:-development}

echo -e "${BLUE}🚀 Forward Horizon AI Agent Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Create network if it doesn't exist
if ! docker network ls | grep -q $NETWORK_NAME; then
    docker network create $NETWORK_NAME
    print_status "Created Docker network: $NETWORK_NAME"
else
    print_status "Docker network exists: $NETWORK_NAME"
fi

# Create volume if it doesn't exist
if ! docker volume ls | grep -q $VOLUME_NAME; then
    docker volume create $VOLUME_NAME
    print_status "Created Docker volume: $VOLUME_NAME"
else
    print_status "Docker volume exists: $VOLUME_NAME"
fi

# Stop and remove existing container
if docker ps -a | grep -q $CONTAINER_NAME; then
    print_warning "Stopping existing container..."
    docker stop $CONTAINER_NAME >/dev/null 2>&1 || true
    docker rm $CONTAINER_NAME >/dev/null 2>&1 || true
    print_status "Removed existing container"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please create one with your environment variables."
    exit 1
fi

# Build or pull image based on environment
if [ "$ENVIRONMENT" = "development" ]; then
    echo -e "${YELLOW}🏗️ Building development image...${NC}"
    docker build -t $DOCKER_IMAGE:dev --target development .
    IMAGE_TAG="dev"
elif [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${YELLOW}📥 Pulling latest staging image...${NC}"
    docker pull $DOCKER_IMAGE:staging || docker pull $DOCKER_IMAGE:latest
    IMAGE_TAG="staging"
else
    echo -e "${YELLOW}📥 Pulling latest production image...${NC}"
    docker pull $DOCKER_IMAGE:latest
    IMAGE_TAG="latest"
fi

print_status "Image ready: $DOCKER_IMAGE:$IMAGE_TAG"

# Deploy based on method
DEPLOY_METHOD=${2:-docker}

case $DEPLOY_METHOD in
    "docker")
        echo -e "${BLUE}🐳 Deploying with Docker...${NC}"
        docker run -d \
            --name $CONTAINER_NAME \
            --network $NETWORK_NAME \
            --restart unless-stopped \
            -p 3000:3000 \
            --env-file .env \
            -v $VOLUME_NAME:/app/data \
            -v "$(pwd)/logs:/app/logs" \
            $DOCKER_IMAGE:$IMAGE_TAG
        ;;
        
    "docker-compose")
        echo -e "${BLUE}🐳 Deploying with Docker Compose...${NC}"
        docker-compose down || true
        docker-compose up -d
        ;;
        
    "kubernetes")
        echo -e "${BLUE}☸️ Deploying to Kubernetes...${NC}"
        
        # Create namespace if it doesn't exist
        kubectl create namespace forward-horizon --dry-run=client -o yaml | kubectl apply -f -
        
        # Apply Kubernetes manifests
        kubectl apply -f k8s/configmap.yml
        kubectl apply -f k8s/deployment.yml
        
        # Wait for deployment to be ready
        kubectl wait --for=condition=available --timeout=300s deployment/forward-horizon-ai-agent -n forward-horizon
        ;;
        
    *)
        print_error "Unknown deployment method: $DEPLOY_METHOD"
        echo "Available methods: docker, docker-compose, kubernetes"
        exit 1
        ;;
esac

# Wait for container to be ready
echo -e "${YELLOW}⏳ Waiting for service to be ready...${NC}"
sleep 10

# Health check
for i in {1..30}; do
    if curl -f http://localhost:3000/api/status >/dev/null 2>&1; then
        print_status "Service is healthy!"
        break
    elif [ $i -eq 30 ]; then
        print_error "Service failed to start within 30 seconds"
        exit 1
    else
        echo -n "."
        sleep 1
    fi
done

echo ""
print_status "Deployment complete!"
echo ""
echo -e "${BLUE}🌐 Service URLs:${NC}"
echo -e "   Dashboard: ${GREEN}http://localhost:3000${NC}"
echo -e "   API Status: ${GREEN}http://localhost:3000/api/status${NC}"
echo -e "   Health: ${GREEN}http://localhost:3000/api/health${NC}"
echo ""
echo -e "${BLUE}📊 Container Status:${NC}"

if [ "$DEPLOY_METHOD" = "kubernetes" ]; then
    kubectl get pods -n forward-horizon -l app=forward-horizon-ai-agent
else
    docker ps | grep $CONTAINER_NAME
fi

echo ""
echo -e "${GREEN}🎉 Forward Horizon AI Agent deployed successfully!${NC}"

# Show logs
echo -e "${BLUE}📋 Recent logs:${NC}"
if [ "$DEPLOY_METHOD" = "kubernetes" ]; then
    kubectl logs -n forward-horizon -l app=forward-horizon-ai-agent --tail=10
else
    docker logs $CONTAINER_NAME --tail=10
fi