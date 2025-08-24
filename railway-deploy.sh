#!/bin/bash

# Forward Horizon AI Agent - Railway Deployment Script
# This script helps deploy your AI agent to Railway

echo "🚂 Forward Horizon AI Agent - Railway Deployment"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Railway CLI
echo "📦 Checking Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi
echo -e "${GREEN}✅ Railway CLI found${NC}"
echo ""

# Step 2: Login Check
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo ""
    echo "Please login to Railway:"
    echo -e "${GREEN}railway login${NC}"
    echo ""
    echo "After logging in, run this script again."
    exit 1
fi
echo -e "${GREEN}✅ Logged in as $(railway whoami)${NC}"
echo ""

# Step 3: Project Initialization
echo "🎯 Setting up Railway project..."
if [ ! -f "railway.toml" ]; then
    echo "Creating new Railway project..."
    railway init
    echo -e "${GREEN}✅ Railway project initialized${NC}"
else
    echo -e "${GREEN}✅ Using existing Railway project${NC}"
fi
echo ""

# Step 4: Environment Variables
echo "⚙️  Setting Railway environment variables..."
echo ""
echo "Setting required environment variables from .env file..."

# Read .env file and set variables in Railway
if [ -f ".env" ]; then
    echo "Found .env file, uploading variables to Railway..."
    
    # Parse .env file and set each variable
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! "$key" =~ ^# ]] && [[ -n "$key" ]]; then
            # Remove quotes from value if present
            value="${value%\"}"
            value="${value#\"}"
            value="${value%\'}"
            value="${value#\'}"
            
            # Set the variable in Railway
            echo "Setting $key..."
            railway variables set "$key=$value" &> /dev/null
        fi
    done < .env
    
    echo -e "${GREEN}✅ Environment variables configured${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
    echo ""
    echo "You'll need to set these variables in Railway dashboard:"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - ANTHROPIC_API_KEY"
    echo "  - EMAIL_USER"
    echo "  - EMAIL_PASS"
    echo "  - EMAIL_HOST"
    echo "  - BUSINESS_NAME"
    echo "  - BUSINESS_PHONE"
    echo "  - BUSINESS_EMAIL"
fi
echo ""

# Step 5: Deploy
echo "🚀 Deploying to Railway..."
echo ""
echo "Starting deployment (this may take a few minutes)..."

# Deploy using Docker
railway up --detach

echo ""
echo -e "${GREEN}✅ Deployment initiated!${NC}"
echo ""

# Step 6: Get deployment URL
echo "🌐 Getting deployment information..."
sleep 5  # Wait for deployment to register

# Get the deployment URL
DEPLOYMENT_URL=$(railway open --json 2>/dev/null | grep -o '"url":"[^"]*' | sed 's/"url":"//')

if [ -n "$DEPLOYMENT_URL" ]; then
    echo ""
    echo "════════════════════════════════════════════════"
    echo -e "${GREEN}🎉 DEPLOYMENT SUCCESSFUL!${NC}"
    echo "════════════════════════════════════════════════"
    echo ""
    echo "Your AI Agent is deploying to:"
    echo -e "${GREEN}$DEPLOYMENT_URL${NC}"
    echo ""
    echo "📊 Dashboard will be available at:"
    echo -e "${GREEN}$DEPLOYMENT_URL/dashboard${NC}"
    echo ""
    echo "🔍 API Status endpoint:"
    echo -e "${GREEN}$DEPLOYMENT_URL/api/status${NC}"
    echo ""
else
    echo ""
    echo "════════════════════════════════════════════════"
    echo -e "${YELLOW}⚠️  DEPLOYMENT IN PROGRESS${NC}"
    echo "════════════════════════════════════════════════"
    echo ""
    echo "Run these commands to check status:"
    echo ""
    echo "  railway logs        # View deployment logs"
    echo "  railway open        # Open in browser"
    echo "  railway status      # Check deployment status"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Check deployment logs: railway logs"
echo "2. Monitor the deployment in Railway dashboard"
echo "3. Test the API endpoints once deployed"
echo "4. Configure custom domain if needed"
echo ""
echo "💡 Useful Railway Commands:"
echo "  railway logs          # View application logs"
echo "  railway open          # Open project in browser"
echo "  railway status        # Check deployment status"
echo "  railway variables     # Manage environment variables"
echo "  railway restart       # Restart the service"
echo ""

# Check if deployment is healthy
echo "⏳ Waiting for health check (30 seconds)..."
sleep 30

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "🏥 Checking deployment health..."
    if curl -f -s "$DEPLOYMENT_URL/api/status" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed! Your AI Agent is running!${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check pending. Check 'railway logs' for details${NC}"
    fi
fi

echo ""
echo "════════════════════════════════════════════════"
echo "🚂 Railway deployment process complete!"
echo "════════════════════════════════════════════════"