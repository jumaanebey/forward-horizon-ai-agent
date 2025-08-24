#!/bin/bash

# Forward Horizon AI Agent Deployment Script
# Supports Railway, DigitalOcean, and AWS deployments

set -e

echo "🚀 Forward Horizon AI Agent Deployment"
echo "======================================"

# Check if platform argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: ./deploy.sh [railway|digitalocean|aws]"
    echo ""
    echo "Platforms:"
    echo "  railway      - Deploy to Railway (Recommended)"
    echo "  digitalocean - Deploy to DigitalOcean App Platform"
    echo "  aws          - Deploy to AWS ECS"
    exit 1
fi

PLATFORM=$1

case $PLATFORM in
    "railway")
        echo "🚂 Deploying to Railway..."
        echo ""
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo "❌ Railway CLI not found. Install it:"
            echo "npm install -g @railway/cli"
            echo "Or visit: https://docs.railway.app/develop/cli"
            exit 1
        fi
        
        # Login to Railway (if not already)
        echo "🔐 Ensuring Railway authentication..."
        railway login
        
        # Create new project if needed
        if [ ! -f "railway.toml" ]; then
            echo "📝 Creating new Railway project..."
            railway init
        fi
        
        # Set environment variables
        echo "⚙️  Setting environment variables..."
        echo "Please set these in Railway dashboard:"
        echo "- SUPABASE_URL"
        echo "- SUPABASE_SERVICE_ROLE_KEY"
        echo "- ANTHROPIC_API_KEY"
        echo "- EMAIL_USER and EMAIL_PASS"
        echo ""
        
        # Deploy
        echo "🚀 Deploying to Railway..."
        railway up --detach
        
        echo "✅ Deployment complete!"
        echo "🌐 Your AI agent will be available at your Railway domain"
        ;;
        
    "digitalocean")
        echo "🌊 Deploying to DigitalOcean App Platform..."
        echo ""
        
        # Check if doctl is installed
        if ! command -v doctl &> /dev/null; then
            echo "❌ DigitalOcean CLI not found. Install it:"
            echo "Visit: https://docs.digitalocean.com/reference/doctl/how-to/install/"
            exit 1
        fi
        
        # Create app spec if it doesn't exist
        if [ ! -f ".do/app.yaml" ]; then
            mkdir -p .do
            cat > .do/app.yaml << EOF
name: forward-horizon-ai-agent
services:
  - name: ai-agent
    source_dir: /
    github:
      repo: jumaanebey/forward-horizon-ai-agent
      branch: main
    run_command: node simple-agent.js
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    http_port: 3000
    health_check:
      http_path: /api/status
    envs:
      - key: NODE_ENV
        value: production
EOF
            echo "📝 Created .do/app.yaml - Please update with your environment variables"
        fi
        
        # Deploy
        echo "🚀 Creating DigitalOcean App..."
        doctl apps create .do/app.yaml
        
        echo "✅ Deployment initiated!"
        echo "🌐 Check DigitalOcean dashboard for deployment status"
        ;;
        
    "aws")
        echo "☁️  Deploying to AWS ECS..."
        echo ""
        
        # Check if AWS CLI is installed
        if ! command -v aws &> /dev/null; then
            echo "❌ AWS CLI not found. Install it:"
            echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
            exit 1
        fi
        
        # Build and push Docker image
        echo "🐳 Building Docker image..."
        docker build -t forward-horizon-ai-agent .
        
        # Tag and push to ECR (assumes ECR repo exists)
        ECR_REPO=$(aws ecr describe-repositories --repository-names forward-horizon-ai-agent --query 'repositories[0].repositoryUri' --output text 2>/dev/null || echo "")
        
        if [ -z "$ECR_REPO" ]; then
            echo "❌ ECR repository not found. Create it first:"
            echo "aws ecr create-repository --repository-name forward-horizon-ai-agent"
            exit 1
        fi
        
        aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPO
        docker tag forward-horizon-ai-agent:latest $ECR_REPO:latest
        docker push $ECR_REPO:latest
        
        echo "✅ Image pushed to ECR!"
        echo "🚀 Update your ECS service to use the new image"
        ;;
        
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Supported platforms: railway, digitalocean, aws"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "💡 Don't forget to:"
echo "   1. Set all environment variables"
echo "   2. Configure your domain"
echo "   3. Set up monitoring"
echo "   4. Test all API endpoints"