# Forward Horizon AI Agent 🤖

A comprehensive, intelligent AI business assistant with memory, internet access, email automation, and task management capabilities. Built specifically for Forward Horizon to automate business operations without direct management.

## ✨ Features

### 🧠 **Intelligent Memory System**
- Persistent memory storage with importance levels
- Contextual memory retrieval for conversations
- Automatic memory cleanup and organization
- Search and categorization capabilities

### 🌐 **Internet Access & Research**
- Web scraping with static and dynamic content support
- Automated research on business topics and trends
- Website monitoring and change detection
- Rate-limited and respectful crawling

### 📧 **Email Automation**
- Professional email templates for leads
- Automated follow-up sequences
- Appointment confirmations and reminders
- Business report distribution
- SMTP integration with popular providers

### ⚡ **Task Automation**
- Cron-based recurring task scheduling
- Lead processing and follow-up automation
- Report generation and distribution
- Data cleanup and maintenance
- Priority-based task execution

### 🏢 **Business Intelligence**
- Lead tracking and conversion analytics
- Performance metrics and reporting
- Customer interaction history
- Business decision support

### 🎯 **AI-Powered Conversations**
- Context-aware responses using Claude AI
- Business knowledge integration
- Natural language task execution
- Personalized customer interactions

### 📊 **Real-time Dashboard**
- Live monitoring of all systems
- Interactive controls and management
- Performance metrics visualization
- Chat interface with the AI agent

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- Anthropic API key (for Claude AI)
- Email provider (Gmail/Outlook recommended)

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd forward-horizon-ai-agent
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run Setup**
```bash
npm run setup
```

4. **Start the Agent**
```bash
npm start
```

5. **Access Dashboard**
Open http://localhost:3000/dashboard

## ⚙️ Configuration

### Required Environment Variables

```env
# Database (Supabase)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Integration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Email Configuration  
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password

# Business Information
BUSINESS_NAME="Forward Horizon"
BUSINESS_PHONE="(310) 488-5280"
BUSINESS_EMAIL="info@forwardhorizon.com"
BUSINESS_WEBSITE="https://www.theforwardhorizon.com"
```

### Optional Configuration

```env
# Agent Settings
AGENT_NAME="Horizon AI"
MEMORY_RETENTION_DAYS=30
MAX_DAILY_EMAILS=50
WORKING_HOURS_START=09
WORKING_HOURS_END=17
TIMEZONE="America/Los_Angeles"

# Google Services (Optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

## 🏗️ Architecture

```
Forward Horizon AI Agent
├── 🧠 Memory System (Supabase)
├── 🤖 AI Core (Anthropic Claude)
├── 🌐 Internet Access (Puppeteer + Axios)
├── 📧 Email Manager (Nodemailer)
├── ⚡ Task Automation (Cron Jobs)
├── 🏢 Business Logic (Lead Management)
├── 📊 Dashboard (Web Interface)
└── 🔧 Utilities (Logging, etc.)
```

## 📋 Core Capabilities

### Automatic Lead Management
- **New Lead Detection**: Monitors lead capture API
- **Instant Response**: Sends welcome emails within minutes
- **Smart Follow-up**: Schedules personalized follow-up sequences
- **Status Tracking**: Updates lead status through the sales funnel

### Business Automation
- **Daily Reports**: Automatic generation and distribution
- **Data Cleanup**: Removes expired data and optimizes performance
- **Research Tasks**: Keeps up with industry trends and news
- **Email Queue Processing**: Manages bulk email operations

### Intelligent Decision Making
- **Lead Scoring**: Evaluates lead quality and potential
- **Response Optimization**: Learns from successful interactions
- **Task Prioritization**: Focuses on high-impact activities
- **Resource Management**: Balances system resources efficiently

## 🔌 API Endpoints

### Agent Control
```
GET  /api/status          # Agent status and metrics
POST /api/control/start   # Start the agent
POST /api/control/stop    # Stop the agent
```

### Memory Operations
```
GET  /api/memory          # Retrieve memories
POST /api/memory          # Store new memory
```

### Business Operations
```
GET  /api/business/leads  # Get leads data
GET  /api/business/tasks  # Get scheduled tasks
```

### Chat Interface
```
POST /api/chat           # Chat with the AI agent
```

## 🎛️ Dashboard Features

### Real-time Monitoring
- **Agent Status**: Current operational state
- **System Metrics**: Memory usage, uptime, performance
- **Business KPIs**: Leads, conversions, email stats
- **Recent Activities**: Live activity feed

### Interactive Controls
- **Start/Stop Agent**: Manual control over operations
- **Task Scheduling**: Create custom automation tasks
- **Email Testing**: Send test emails to verify configuration
- **Memory Management**: Clear old data and optimize storage

### Chat Interface
- **Direct Communication**: Chat directly with the AI agent
- **Business Queries**: Ask about leads, metrics, and operations
- **Task Commands**: Execute tasks through natural language

## 🔧 Customization

### Adding Custom Tasks
```javascript
// In src/automation/task-automation.js
async executeCustomTask(task) {
  switch (task.type) {
    case 'your_custom_task':
      return await this.yourCustomFunction(task.data);
    // ... other cases
  }
}
```

### Custom Email Templates
```javascript
// In src/email/email-manager.js
generateCustomEmailHTML(data) {
  return `
    <!-- Your custom HTML template -->
  `;
}
```

### Business Logic Integration
```javascript
// In src/business/business-logic.js
async customBusinessProcess(data) {
  // Your custom business logic
  return result;
}
```

## 📊 Monitoring & Logs

### Log Files
- `logs/combined.log` - All application logs
- `logs/error.log` - Error-only logs
- Console output with color-coded levels

### Metrics Tracking
- Database performance and usage
- Email delivery rates and engagement
- Task completion and failure rates
- AI API usage and costs
- Memory system efficiency

## 🛡️ Security & Best Practices

### Data Protection
- Environment variables for sensitive data
- Database row-level security (RLS)
- Rate limiting on API endpoints
- Input validation and sanitization

### Email Security
- App-specific passwords (not account passwords)
- SMTP TLS encryption
- Daily sending limits
- Bounce and spam handling

### API Security
- Authentication for admin endpoints
- Request rate limiting
- Error handling without data exposure
- Secure token management

## 🚨 Troubleshooting

### Common Issues

**Agent Won't Start**
```bash
# Check environment variables
npm run setup

# Check logs
tail -f logs/error.log

# Verify database connection
```

**Email Not Sending**
```bash
# Test email configuration
node -e "require('./src/email/email-manager').testConnection()"

# Check Gmail app passwords
# Verify SMTP settings
```

**Database Connection Issues**
```bash
# Verify Supabase credentials
# Check network connectivity
# Review RLS policies
```

**Memory Issues**
```bash
# Check disk space
# Review memory retention settings
# Monitor database size
```

## 🔄 Updates & Maintenance

### Regular Tasks
- **Weekly**: Review performance metrics and optimize
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Analyze business impact and ROI

### Version Updates
```bash
git pull origin main
npm install
npm run setup  # If database changes
npm start
```

## 🤝 Support & Contributing

### Getting Help
1. Check the troubleshooting section
2. Review logs for specific errors
3. Test individual components
4. Verify configuration settings

### Development Setup
```bash
# Development mode with auto-restart
npm run dev

# Run setup wizard
npm run setup

# Test specific components
npm run test
```

## 📈 Performance Optimization

### Database Optimization
- Regular cleanup of expired data
- Index optimization for common queries
- Connection pooling and caching
- Query performance monitoring

### System Resources
- Memory usage monitoring
- CPU optimization for web scraping
- Rate limiting for external APIs
- Efficient task scheduling

## 🎯 Use Cases

### Sales Automation
- **Lead Nurturing**: Automated follow-up sequences
- **Appointment Scheduling**: Calendar integration and reminders
- **Pipeline Management**: Status updates and progress tracking

### Customer Service
- **Instant Response**: Welcome emails and acknowledgments
- **FAQ Automation**: Common question handling
- **Escalation Management**: Priority-based routing

### Business Intelligence
- **Performance Analytics**: KPI tracking and reporting
- **Market Research**: Industry trend monitoring
- **Competitive Analysis**: Automated research and insights

## 📚 Additional Resources

- **API Documentation**: `/api/docs` when running
- **Schema Documentation**: `schema.sql` for database structure
- **Example Configurations**: `.env.example` for all options
- **Architecture Diagrams**: In the `/docs` folder

---

**Forward Horizon AI Agent** - Intelligent business automation that works while you sleep. 

Built with ❤️ for Forward Horizon's success.