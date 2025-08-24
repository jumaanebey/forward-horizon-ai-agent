# 🚀 CI/CD Pipeline & Container Guide - Forward Horizon AI Agent

## 📋 Overview

Complete enterprise-grade CI/CD pipeline with Docker containerization, Kubernetes deployment, and automated security scanning.

## 🐳 Docker Containerization

### Quick Start
```bash
# Build and run locally
docker build -t forward-horizon-ai .
docker run -p 3000:3000 --env-file .env forward-horizon-ai

# Or use Docker Compose
docker-compose up -d
```

### Multi-Stage Build Architecture
```dockerfile
FROM node:18-alpine AS base      # Base image with system dependencies
FROM base AS dependencies       # Production dependencies
FROM base AS development       # Development environment
FROM base AS build             # Build stage
FROM node:18-alpine AS production # Optimized production image
```

### Container Features
- ✅ **Multi-stage builds** for optimized production images
- ✅ **Non-root user** for security (nodejs:1001)
- ✅ **Health checks** with automatic restart
- ✅ **Alpine Linux** for minimal attack surface
- ✅ **Chromium integration** for web scraping
- ✅ **Volume mounts** for persistent data
- ✅ **Environment variables** for configuration

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)
```yaml
Triggers: push to main/develop, PRs, releases
Jobs:
├── 🔍 quality-check      # Code quality & security analysis
├── 🏗️ build-test        # Build & test containers
├── 🚀 build-production   # Multi-platform production builds
├── 🚧 deploy-staging     # Staging environment deployment
└── 🌟 deploy-production  # Production deployment
```

#### 2. Security Pipeline (`.github/workflows/security.yml`)
```yaml
Triggers: push, PRs, daily schedule
Jobs:
├── 🔍 dependency-audit   # npm audit + Snyk scanning
├── 🔍 codeql-analysis   # GitHub CodeQL security analysis  
├── 🔍 semgrep           # SAST security scanning
└── 🔐 secret-detection  # TruffleHog secret detection
```

### Pipeline Features
- ✅ **Quality Gates** - SonarQube + ESLint analysis
- ✅ **Security Scanning** - Trivy + Snyk + CodeQL
- ✅ **Multi-platform Builds** - AMD64 + ARM64
- ✅ **Container Registry** - GitHub Container Registry
- ✅ **SBOM Generation** - Software Bill of Materials
- ✅ **Automated Testing** - Container health checks
- ✅ **Blue/Green Deployments** - Zero downtime
- ✅ **Notifications** - Slack integration

## ☸️ Kubernetes Deployment

### Quick Deploy
```bash
# Deploy to Kubernetes
./deployment/deploy.sh production kubernetes

# Or apply manually
kubectl create namespace forward-horizon
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/deployment.yml
```

### Kubernetes Resources
- **Deployment** - 3 replicas with rolling updates
- **Service** - ClusterIP with load balancing  
- **Ingress** - NGINX with SSL termination
- **ConfigMap** - Non-sensitive configuration
- **Secrets** - Encrypted sensitive data
- **PVC** - Persistent data storage

### Production Features
- ✅ **High Availability** - 3 replica pods
- ✅ **Rolling Updates** - Zero downtime deployments
- ✅ **Resource Limits** - CPU/memory constraints
- ✅ **Health Checks** - Liveness/readiness probes
- ✅ **Auto-scaling** - HPA based on CPU/memory
- ✅ **SSL/TLS** - Let's Encrypt certificates
- ✅ **Rate Limiting** - NGINX ingress protection

## 🚀 Deployment Options

### 1. Local Development
```bash
# Docker
docker build -t forward-horizon-ai --target development .
docker run -p 3000:3000 --env-file .env forward-horizon-ai:dev

# Docker Compose
docker-compose up -d

# Direct Node.js
npm install
npm run dev
```

### 2. Staging Environment
```bash
# Automated via GitHub Actions on push to main
# Or manual deployment:
./deployment/deploy.sh staging docker-compose
```

### 3. Production Deployment
```bash
# Option 1: Docker
./deployment/deploy.sh production docker

# Option 2: Docker Compose with profiles
docker-compose --profile production up -d

# Option 3: Kubernetes
./deployment/deploy.sh production kubernetes

# Option 4: Cloud Platforms
# - Railway: railway up
# - Render: render deploy
# - Fly.io: fly deploy
# - Google Cloud Run: gcloud run deploy
# - AWS ECS: aws ecs update-service
```

## 🔒 Security Features

### Container Security
- ✅ **Non-root execution** - User ID 1001
- ✅ **Read-only filesystem** - Immutable container
- ✅ **Vulnerability scanning** - Trivy integration
- ✅ **Secret management** - External secret injection
- ✅ **Network policies** - Restricted communication
- ✅ **Security contexts** - Pod security standards

### Pipeline Security
- ✅ **Dependency scanning** - Snyk + npm audit
- ✅ **SAST analysis** - Semgrep + CodeQL
- ✅ **Secret detection** - TruffleHog scanning  
- ✅ **Container scanning** - Trivy vulnerability scan
- ✅ **SBOM generation** - Supply chain transparency
- ✅ **Security reporting** - GitHub Security tab

## 📊 Monitoring & Observability

### Built-in Endpoints
```bash
# Health check
curl http://localhost:3000/api/status

# Application metrics
curl http://localhost:3000/metrics

# Kubernetes probes
livenessProbe: /api/status
readinessProbe: /api/status
```

### Logging
```bash
# Container logs
docker logs forward-horizon-ai-agent

# Kubernetes logs
kubectl logs -l app=forward-horizon-ai-agent -n forward-horizon

# Persistent logs
tail -f ./logs/application.log
```

## 🛠️ Development Workflow

### Local Development
```bash
# 1. Clone repository
git clone https://github.com/jumaanebey/forward-horizon-ai-agent.git
cd forward-horizon-ai-agent

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Run in development mode
npm run dev

# Or with Docker
docker-compose up -d
```

### Code Quality Checks
```bash
# Run all quality checks
npm run lint
npm run test
npm audit
node sonarqube-analysis.js

# Pre-commit hooks
npm run pre-commit
```

### Building & Testing
```bash
# Build production image
docker build -t forward-horizon-ai:latest .

# Test container
docker run -d -p 3000:3000 --name test-container forward-horizon-ai:latest
curl http://localhost:3000/api/status
docker stop test-container && docker rm test-container
```

## 🌐 Cloud Platform Deployments

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Render
```yaml
# render.yaml
services:
  - type: web
    name: forward-horizon-ai
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: NODE_ENV
        value: production
```

### Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/forward-horizon-ai
gcloud run deploy --image gcr.io/PROJECT_ID/forward-horizon-ai --platform managed
```

### AWS ECS/Fargate
```bash
# Create task definition and service
aws ecs create-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster forward-horizon --service-name ai-agent
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
NODE_ENV=production
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional  
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://project.supabase.co
GOOGLE_SHEETS_ID=sheet-id
```

### Docker Compose Profiles
```bash
# Development
docker-compose up -d

# Production with SonarQube
docker-compose --profile sonarqube up -d

# With Redis caching
docker-compose --profile cache up -d

# Full stack
docker-compose --profile sonarqube --profile cache up -d
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: forward-horizon-ai-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: forward-horizon-ai-agent
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

### Load Balancing
```bash
# NGINX Ingress
kubectl apply -f k8s/deployment.yml

# Docker Swarm
docker service create --name forward-horizon-ai --replicas 3 -p 3000:3000 forward-horizon-ai:latest

# Docker Compose Scale
docker-compose up -d --scale forward-horizon-ai=3
```

## 🚨 Troubleshooting

### Common Issues
```bash
# Container won't start
docker logs forward-horizon-ai-agent
# Check environment variables and port conflicts

# High memory usage
docker stats forward-horizon-ai-agent
# Adjust resource limits in deployment

# Health check failures
curl -v http://localhost:3000/api/status
# Check application logs and dependencies

# Build failures
docker build --no-cache -t forward-horizon-ai .
# Clear Docker cache and rebuild
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
export LOG_LEVEL=debug

# Run with verbose output
docker run -it --rm forward-horizon-ai:latest sh
```

## 🎯 Best Practices

### Development
- ✅ Use multi-stage builds for optimization
- ✅ Implement health checks for reliability
- ✅ Follow security scanning in CI/CD
- ✅ Use semantic versioning for releases
- ✅ Keep images small with Alpine Linux

### Production  
- ✅ Run as non-root user
- ✅ Use read-only filesystems
- ✅ Implement proper logging
- ✅ Monitor resource usage
- ✅ Plan for disaster recovery

### Security
- ✅ Scan images for vulnerabilities
- ✅ Use secrets management
- ✅ Implement network policies
- ✅ Regular security updates
- ✅ Principle of least privilege

---

## 🚀 Quick Start Commands

```bash
# Local development
docker-compose up -d

# Deploy to staging
./deployment/deploy.sh staging docker-compose

# Deploy to production
./deployment/deploy.sh production kubernetes

# Run security scan
npm audit && node sonarqube-analysis.js

# View logs
docker-compose logs -f forward-horizon-ai
```

**Your Forward Horizon AI Agent is now ready for enterprise-grade containerized deployment!** 🏗️✨