# 🔧 Forward Horizon AI Agent - Integration Setup Guide

## Overview
Your AI agent now includes comprehensive business integrations. Below are all the credentials and API keys you need to activate each feature.

## 🚨 Priority Setup (Essential Features)

### 1. **SMS & WhatsApp (Twilio)**
**Required for:** Lead notifications, two-way SMS, WhatsApp messaging
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_WHATSAPP_NUMBER=your_whatsapp_business_number
MAX_DAILY_SMS=100
```
**Setup Steps:**
1. Sign up at [Twilio Console](https://console.twilio.com/)
2. Get phone number and WhatsApp Business approval
3. Configure webhooks: `https://your-domain.railway.app/api/sms/webhook`

### 2. **Analytics Engine** 
**Required for:** Real-time metrics, conversion tracking
```env
# No additional credentials needed - uses internal memory
```
**Features:** Lead tracking, conversion funnels, ROI analysis

### 3. **CRM Integration**
**Required for:** Lead synchronization with your existing CRM

#### Salesforce
```env
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_USERNAME=your_username
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_INSTANCE_URL=https://your-instance.salesforce.com
```

#### HubSpot
```env
HUBSPOT_API_KEY=your_hubspot_api_key
HUBSPOT_PORTAL_ID=your_portal_id
```

#### Pipedrive
```env
PIPEDRIVE_API_TOKEN=your_api_token
PIPEDRIVE_COMPANY_DOMAIN=your-company
```

## 🎯 Advanced Features

### 4. **Google Calendar Integration**
**Required for:** Appointment booking, scheduling
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.railway.app/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
```
**Setup Steps:**
1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Calendar API
3. Create OAuth 2.0 credentials
4. Complete OAuth flow to get refresh token

### 5. **Voice AI System**
**Required for:** Phone call handling, speech-to-text
```env
# Uses existing Twilio credentials for voice
GOOGLE_SPEECH_API_KEY=your_google_speech_key  # Optional: Better transcription
OPENAI_API_KEY=your_openai_key  # Optional: Enhanced AI responses
```
**Setup Steps:**
1. Configure Twilio Voice webhook: `https://your-domain.railway.app/api/voice/incoming`
2. Enable Google Speech API (optional)

### 6. **Business Configuration**
```env
BUSINESS_OWNER_PHONE=+1234567890  # For lead notifications
BUSINESS_WEBSITE=https://forwardhorizon.com
BASE_URL=https://your-domain.railway.app
```

## 🔐 Security & Performance

### Email (Already Configured)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

### Database & Memory
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### AI Core
```env
ANTHROPIC_API_KEY=your_claude_api_key
```

## 📊 What Each Integration Does

### **SMS Manager** (`/src/integrations/sms-manager.js`)
- ✅ Instant lead notifications via SMS
- ✅ WhatsApp Business messaging
- ✅ Two-way conversations with AI
- ✅ Bulk SMS campaigns
- ✅ Auto-responders and opt-out handling

### **Calendar Manager** (`/src/integrations/calendar-manager.js`)
- ✅ Real-time appointment booking
- ✅ Google Calendar sync
- ✅ Automated confirmations and reminders
- ✅ Available time slot detection
- ✅ Business hours management

### **Voice AI** (`/src/integrations/voice-ai.js`)
- ✅ Incoming call handling
- ✅ Speech-to-text transcription
- ✅ AI-powered responses
- ✅ Lead qualification via phone
- ✅ Call analytics and recording

### **Analytics Engine** (`/src/analytics/analytics-engine.js`)
- ✅ Real-time dashboard metrics
- ✅ Lead source tracking and ROI
- ✅ Conversion funnel analysis
- ✅ Email campaign performance
- ✅ System performance monitoring

### **CRM Integration** (`/src/integrations/crm-integration.js`)
- ✅ Multi-CRM support (Salesforce, HubSpot, Pipedrive)
- ✅ Real-time lead synchronization
- ✅ Bi-directional data sync via webhooks
- ✅ Custom field mapping
- ✅ Bulk sync operations

## 🚀 API Endpoints Now Available

### SMS & WhatsApp
- `POST /api/sms/send` - Send SMS/WhatsApp messages
- `POST /api/sms/webhook` - Handle incoming messages

### Voice AI
- `POST /api/voice/incoming` - Handle incoming calls
- `POST /api/voice/gather` - Process speech input

### Calendar
- `GET /api/calendar/slots` - Get available time slots
- `POST /api/calendar/book` - Book appointments

### Analytics
- `GET /api/analytics/dashboard` - Real-time metrics
- `GET /api/analytics/funnel` - Conversion funnel data
- `POST /api/analytics/track` - Track events

### CRM
- `POST /api/crm/sync` - Sync lead to CRM
- `POST /api/crm/webhook/:crmName` - CRM webhook handler

## 🎯 Live Chat Widget
Your site now includes an embeddable chat widget:

**For any website:**
```html
<script src="https://your-domain.railway.app/embed.js"></script>
```

**Direct access:**
- Widget: `https://your-domain.railway.app/chat-widget.html`
- API: `POST /api/chat` (JSON: `{"message": "Hello"}`)

## ⚡ Quick Start Priority

1. **Essential (Start here):**
   - Twilio SMS (lead notifications)
   - Analytics (built-in, no setup needed)
   
2. **High Impact:**
   - Google Calendar (appointment booking)
   - CRM sync (choose one: HubSpot is easiest)
   
3. **Advanced:**
   - Voice AI (phone support)
   - WhatsApp Business

## 📞 Support
- **Live Chat**: Use the widget on your deployed site
- **Phone**: Configure Voice AI and call your Twilio number
- **SMS**: Text your Twilio number for AI responses

## 🔄 Auto-Processing
When a lead is submitted via `/api/leads`, the system automatically:
1. ✅ Stores in memory and database  
2. ✅ Syncs to all configured CRMs
3. ✅ Sends SMS notifications
4. ✅ Tracks in analytics
5. ✅ Triggers email sequences
6. ✅ Scores and qualifies the lead

## 🚀 Next Steps
1. Add the environment variables you want to use
2. Deploy to Railway: `git add . && git commit -m "Add integrations" && git push`
3. Configure webhooks in each service
4. Test the integrations via the dashboard

**Your AI agent is now a complete business automation platform!** 🎉