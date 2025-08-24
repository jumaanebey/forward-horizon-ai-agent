# 🚂 Railway Deployment Steps for Forward Horizon AI Agent

Since you're logged in as **jumaanebey** via GitHub, follow these exact steps:

## Step 1: Open Terminal and Login
```bash
railway login
```
✅ You said you're already logged in via GitHub

## Step 2: Initialize Railway Project
```bash
railway init
```
When prompted:
- Choose "Empty Project" or enter a project name like "forward-horizon-ai-agent"

## Step 3: Link Your Project (Optional)
If you want to connect to GitHub repo:
```bash
railway link
```

## Step 4: Set Environment Variables
You have two options:

### Option A: Upload from .env file (Recommended)
```bash
# This command uploads all variables at once
railway variables set $(cat .env | grep -v '^#' | xargs)
```

### Option B: Set individually
```bash
railway variables set SUPABASE_URL="your_supabase_url"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your_service_key"
railway variables set ANTHROPIC_API_KEY="your_anthropic_key"
railway variables set EMAIL_USER="your_email@gmail.com"
railway variables set EMAIL_PASS="your_app_password"
railway variables set EMAIL_HOST="smtp.gmail.com"
railway variables set EMAIL_PORT="587"
railway variables set BUSINESS_NAME="Forward Horizon"
railway variables set BUSINESS_PHONE="(310) 488-5280"
railway variables set BUSINESS_EMAIL="info@forwardhorizon.com"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
```

## Step 5: Deploy Your Application
```bash
railway up
```

This will:
- Build your Docker container
- Deploy to Railway
- Start your AI agent

## Step 6: Get Your URL
```bash
railway open
```
This opens your Railway dashboard where you can see:
- Your deployment URL
- Logs
- Metrics
- Environment variables

## Step 7: Monitor Deployment
```bash
# Watch logs in real-time
railway logs

# Check deployment status
railway status
```

## Step 8: Test Your Endpoints
Once deployed (usually takes 3-5 minutes), test:

1. **Status Check:**
```bash
curl https://your-app.railway.app/api/status
```

2. **Dashboard:**
Open in browser: `https://your-app.railway.app/dashboard`

## 🚀 Quick All-in-One Command
After login, you can run all steps:
```bash
# Initialize and deploy
railway init && \
railway variables set $(cat .env | grep -v '^#' | xargs) && \
railway up
```

## 🔧 Troubleshooting

### If deployment fails:
```bash
# Check logs
railway logs

# Restart service
railway restart

# Redeploy
railway up --detach
```

### Common Issues:
1. **Port binding:** Make sure PORT env var is set
2. **Memory issues:** Railway free tier has 512MB RAM limit
3. **Build errors:** Check Dockerfile and logs

## 📊 Your Deployment Info
- **User:** jumaanebey (GitHub)
- **Project:** forward-horizon-ai-agent
- **Region:** Auto-selected by Railway
- **URL:** Will be `*.railway.app`

## 💡 Next Steps After Deployment
1. Configure custom domain (optional)
2. Set up monitoring alerts
3. Test all API endpoints
4. Check lead processing
5. Verify email sending

---

**Ready?** Start with Step 2 since you're already logged in:
```bash
railway init
```