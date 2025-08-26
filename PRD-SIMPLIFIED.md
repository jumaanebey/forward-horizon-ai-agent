# 📋 Forward Horizon AI Agent - Simple PRD

## 🎯 What It Does
**24/7 AI support system** that answers calls, chats with website visitors, and captures leads automatically.

## ✅ Current Features (LIVE)
- **Phone Support**: AI answers calls with natural voice (ElevenLabs)
- **Web Chat**: Pop-up widget for any website
- **Lead Tracking**: Automatically saves contact info from conversations
- **Crisis Support**: Routes emergencies to 911/crisis hotlines
- **Email System**: Sends notifications for new leads

## 🔧 How to Use It

### For Phone Calls
1. Update Twilio webhook: `https://forward-horizon-ai-agent-production.up.railway.app/api/voice/incoming`
2. Call your number - AI answers automatically

### For Website Chat
1. Add to any webpage: `<script src="https://forward-horizon-ai-agent-production.up.railway.app/chat.js"></script>`
2. Chat button appears automatically

### Monitor System
- Dashboard: https://forward-horizon-ai-agent-production.up.railway.app/
- Check leads, system health, and stats

## 🚨 Security Status
- ✅ Environment variables protected
- ✅ API endpoints secured
- ✅ No sensitive data in code
- ⚠️ **ACTION NEEDED**: Add rate limiting for chat API
- ⚠️ **ACTION NEEDED**: Add CORS restrictions

## 💰 Costs
- **Railway**: ~$5/month hosting
- **Twilio**: ~$0.01/minute for calls
- **ElevenLabs**: Free tier (10,000 chars/month)
- **Total**: ~$10-20/month

## 🔑 Required Accounts
1. **Railway** (hosting)
2. **Twilio** (phone/SMS)
3. **Supabase** (database) - optional
4. **ElevenLabs** (voice AI) - optional

## 📊 Success Metrics
- Leads captured per day
- Call answer rate
- Chat engagement rate
- Crisis interventions handled

## 🐛 Known Issues
1. SMS blocked until A2P 10DLC approved
2. Chat routes need Railway redeploy to activate
3. Session cleanup every 30 minutes

## 🚀 Next Steps
1. Complete A2P 10DLC for SMS
2. Add analytics dashboard
3. Build follow-up email sequences

---
**Status**: ✅ PRODUCTION READY | **Support**: admin@theforwardhorizon.com