# 🚀 Deployment Instructions - Forward Horizon AI Agent

## Quick Deploy to Railway

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Deploy on Railway

1. **Go to Railway Dashboard**: https://railway.app/dashboard

2. **Create New Project** (if not already created):
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `forward-horizon-ai-agent`

3. **Environment Variables** - Add these in Railway Settings:
   ```
   # Required
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI (Required for full functionality)
   ANTHROPIC_API_KEY=your_anthropic_key
   
   # Email (Optional but recommended)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Twilio (For SMS/Voice)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   
   # Business Info
   BUSINESS_NAME=The Forward Horizon
   BUSINESS_PHONE=(858) 299-2490
   BUSINESS_EMAIL=admin@theforwardhorizon.com
   ```

4. **Deploy**:
   - Railway will automatically deploy when you push to GitHub
   - Or click "Deploy" in Railway dashboard

### Step 3: Get Your Public URL

Once deployed, Railway will provide a URL like:
```
https://forward-horizon-ai-agent.up.railway.app
```

### Step 4: Add Chat Widget to Your Website

Add this ONE line to any webpage:
```html
<script src="https://forward-horizon-ai-agent.up.railway.app/chat.js"></script>
```

## 📱 Test Your Deployment

### 1. Chat Widget Test
Visit: `https://your-app.railway.app/demo`

### 2. Standalone Chat
Visit: `https://your-app.railway.app/chat`

### 3. Dashboard
Visit: `https://your-app.railway.app/`

### 4. API Health Check
Visit: `https://your-app.railway.app/api/status`

## 🔧 Update Twilio Webhooks

After deployment, update your Twilio phone number webhooks:

1. **Voice Webhook**:
   ```
   https://your-app.railway.app/api/voice/incoming
   ```

2. **SMS Webhook** (after A2P 10DLC approval):
   ```
   https://your-app.railway.app/api/sms/webhook
   ```

## 🌐 Custom Domain (Optional)

1. In Railway Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update chat widget script source:
   ```html
   <script src="https://yourdomain.com/chat.js"></script>
   ```

## 📊 Monitor Your Deployment

### Railway Dashboard Shows:
- Memory usage
- CPU usage
- Request logs
- Deploy history
- Error logs

### Your App Dashboard Shows:
- Active chat sessions
- Lead count
- Email queue
- System status

## 🚨 Troubleshooting

### Chat Widget Not Appearing?
- Check browser console for errors
- Verify script URL is correct
- Ensure CORS is enabled (already configured)

### Webhooks Not Working?
- Check Twilio webhook URLs
- Verify environment variables
- Check Railway logs

### Database Issues?
- Verify Supabase credentials
- Check Supabase dashboard for errors
- Run setup script if needed

## 🔄 Update Deployment

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update message"
   git push origin main
   ```
3. Railway auto-deploys within 2-3 minutes

## 📞 Support Channels Now Active

Once deployed, you'll have:
- ✅ **Web Chat**: On any page with the widget
- ✅ **Phone**: Via Twilio number with ElevenLabs AI
- ⏳ **SMS**: Pending A2P 10DLC approval
- ✅ **Email**: Automated responses
- ✅ **Lead Tracking**: All interactions tracked

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Chat widget tested
- [ ] Twilio webhooks updated
- [ ] Custom domain configured (optional)

---

**Need Help?** The system is designed to be self-healing and will show clear error messages if something goes wrong. Check Railway logs for detailed information.