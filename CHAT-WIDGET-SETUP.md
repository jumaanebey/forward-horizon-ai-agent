# Forward Horizon AI Chat Widget Setup

## 🚀 Quick Integration

Add 24/7 AI support to your website with just one line of code:

```html
<script src="https://your-domain.com/chat.js"></script>
```

## 📁 Files Created

1. **`embeddable-chat.js`** - The main chat widget script
2. **`chat-integration.js`** - Backend integration handler
3. **`chat-widget.html`** - Standalone chat page
4. **`demo-website.html`** - Example integration
5. **Updated `simple-agent.js`** - Added chat API endpoints

## 🔧 Backend Setup

The chat widget automatically connects to your AI backend through these endpoints:

- `GET /chat.js` - Serves the embeddable script
- `POST /api/chat/message` - Processes chat messages
- `GET /api/chat/session/:id` - Session status
- `GET /chat` - Standalone chat page

## 💬 Features

✅ **Floating chat button** - Appears on all pages  
✅ **Professional UI** - Matches your brand  
✅ **Mobile responsive** - Works on all devices  
✅ **Typing indicators** - Shows AI is thinking  
✅ **Session management** - Maintains conversation context  
✅ **Lead generation** - Automatically creates leads from conversations  
✅ **Crisis intervention** - Provides emergency resources  
✅ **Multi-program support** - Veterans, Recovery, Reentry  

## 🎯 Integration Options

### Option 1: Direct Integration
Add to your website's `<head>` section:
```html
<script src="embeddable-chat.js"></script>
```

### Option 2: CDN/Server Integration
1. Upload `embeddable-chat.js` to your server
2. Add to your HTML:
```html
<script src="https://yoursite.com/path/to/embeddable-chat.js"></script>
```

### Option 3: Programmatic Control
```html
<script src="embeddable-chat.js"></script>
<script>
// Open chat programmatically
function openChat() {
    if (window.ForwardHorizonChat) {
        window.ForwardHorizonChat.openChat();
    }
}
</script>
<button onclick="openChat()">Chat with AI</button>
```

## ⚙️ Configuration

The chat widget is pre-configured for The Forward Horizon with:

- **Business Name**: The Forward Horizon
- **Phone**: (858) 299-2490  
- **Services**: Veterans, Recovery, Reentry programs
- **Consultation Booking**: Video consultation requirement for pricing
- **Crisis Resources**: 911, Suicide Prevention Lifeline (988)

## 🔄 Lead Generation

The chat automatically creates leads when users:
- Express interest in housing programs
- Request appointments/consultations
- Provide contact information
- Engage in meaningful conversation (3+ messages)

## 📱 Mobile Optimization

- Full-screen chat on mobile devices
- Touch-friendly interface
- Responsive design
- Optimized typing experience

## 🛡️ Crisis Intervention

Built-in responses for:
- Emergency situations → Directs to 911
- Mental health crisis → National Suicide Prevention Lifeline (988)
- Housing emergencies → Direct phone contact
- Resource referrals → Immediate assistance

## 🎨 Customization

To customize the appearance, edit the CSS in `embeddable-chat.js`:

```css
.fh-chat-button {
    background: your-brand-color;
    /* Other styles */
}
```

## 📊 Analytics

The backend tracks:
- Active chat sessions
- Messages per session
- Lead conversion rate
- Session duration
- Popular conversation topics

Access analytics at: `GET /api/chat/stats`

## 🔐 Security Features

- Session timeout (30 minutes)
- Message length limits (1000 chars)
- XSS protection
- Rate limiting ready
- Privacy-focused (no sensitive data logging)

## 🚀 Deployment Checklist

- [ ] Backend running with chat integration
- [ ] `embeddable-chat.js` accessible via URL
- [ ] Added script tag to website
- [ ] Tested on mobile devices
- [ ] Verified lead creation
- [ ] Confirmed crisis intervention responses

## 📞 Support Escalation

The AI automatically escalates to human support for:
- Complex housing questions
- Pricing discussions (requires video consultation)
- Emergency situations
- Technical issues

## 🔄 Next Steps

1. **Deploy the backend** - Run `npm start` to start the server
2. **Test the chat** - Visit `http://localhost:3000/chat` 
3. **Add to website** - Include the script tag
4. **Monitor leads** - Check dashboard for new leads
5. **Customize responses** - Adjust AI responses as needed

---

**Need Help?** Call (858) 299-2490 or email admin@theforwardhorizon.com