/**
 * Dashboard Module
 * Provides web interface for monitoring and controlling the AI agent
 */

const path = require('path');
const Logger = require('../utils/logger');

class Dashboard {
  constructor() {
    this.logger = new Logger('Dashboard');
    this.agent = null;
    this.initialized = false;
  }

  async initialize(agent) {
    this.logger.info('📊 Initializing Dashboard...');
    
    this.agent = agent;
    
    // Setup dashboard-specific routes
    this.setupDashboardRoutes();
    
    this.initialized = true;
    this.logger.info('✅ Dashboard initialized');
    
    return true;
  }

  setupDashboardRoutes() {
    const app = this.agent.app;

    // Dashboard static files
    app.get('/dashboard', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    // Dashboard data API
    app.get('/api/dashboard/data', async (req, res) => {
      try {
        const data = await this.getDashboardData();
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Agent control actions
    app.post('/api/dashboard/action', async (req, res) => {
      try {
        const { action, params } = req.body;
        const result = await this.executeAction(action, params);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Real-time updates endpoint
    app.get('/api/dashboard/updates', (req, res) => {
      // This would be enhanced with WebSocket for real-time updates
      res.json({
        timestamp: new Date().toISOString(),
        updates: []
      });
    });
  }

  async getDashboardData() {
    const data = {
      agent: {
        status: this.agent.isRunning ? 'active' : 'inactive',
        uptime: process.uptime(),
        lastActivity: this.agent.lastActivity,
        version: require('../../package.json').version
      },
      memory: await this.agent.memory.getStats(),
      business: await this.agent.business.getStats(),
      automation: this.agent.automation.getStats(),
      email: this.agent.email.getStats(),
      ai: this.agent.ai.getStats(),
      system: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage(),
        cpu_usage: process.cpuUsage()
      },
      timestamp: new Date().toISOString()
    };

    // Get recent activities
    data.recent_activities = await this.getRecentActivities();
    
    // Get upcoming tasks
    data.upcoming_tasks = await this.getUpcomingTasks();
    
    return data;
  }

  async getRecentActivities() {
    try {
      const memories = await this.agent.memory.getRecentMemories(10);
      return memories.map(memory => ({
        id: memory.id,
        type: memory.type,
        content: memory.content.substring(0, 100) + '...',
        timestamp: memory.created_at,
        importance: memory.importance
      }));
    } catch (error) {
      return [];
    }
  }

  async getUpcomingTasks() {
    try {
      const tasks = await this.agent.automation.getTasks({ status: 'pending', limit: 10 });
      return tasks.map(task => ({
        id: task.id,
        type: task.type,
        scheduled_at: task.scheduled_at,
        priority: task.priority,
        data: task.data
      }));
    } catch (error) {
      return [];
    }
  }

  async executeAction(action, params = {}) {
    switch (action) {
      case 'start_agent':
        await this.agent.start();
        return 'Agent started successfully';
      
      case 'stop_agent':
        await this.agent.stop();
        return 'Agent stopped successfully';
      
      case 'clear_memory':
        await this.agent.memory.cleanup();
        return 'Memory cleared successfully';
      
      case 'send_test_email':
        if (!params.email) throw new Error('Email address required');
        const result = await this.agent.email.sendEmail({
          to: params.email,
          subject: 'Test Email from Forward Horizon AI',
          text: 'This is a test email to verify the email system is working correctly.'
        });
        return result.success ? 'Test email sent successfully' : 'Failed to send test email';
      
      case 'schedule_task':
        if (!params.type || !params.data) throw new Error('Task type and data required');
        const taskId = await this.agent.automation.scheduleTask(params.type, params.data);
        return `Task scheduled with ID: ${taskId}`;
      
      case 'research_topic':
        if (!params.topic) throw new Error('Research topic required');
        const research = await this.agent.internet.research(params.topic);
        await this.agent.memory.store(`Researched: ${params.topic}`, 'research', 'medium');
        return `Research completed on "${params.topic}"`;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forward Horizon AI Agent Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: #333;
            line-height: 1.6;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .logo h1 {
            color: #2c3e50;
            font-size: 1.5rem;
            font-weight: 700;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 600;
        }

        .status-active {
            background: #10b981;
            color: white;
        }

        .status-inactive {
            background: #ef4444;
            color: white;
        }

        .container {
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 2rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .card-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
        }

        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.5rem 0;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .metric:last-child {
            border-bottom: none;
        }

        .metric-value {
            font-weight: 600;
            color: #059669;
        }

        .controls {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #3b82f6;
            color: white;
        }

        .btn-primary:hover {
            background: #2563eb;
        }

        .btn-danger {
            background: #ef4444;
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
        }

        .btn-secondary:hover {
            background: #4b5563;
        }

        .activity-item {
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            gap: 0.75rem;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-top: 0.5rem;
            flex-shrink: 0;
        }

        .activity-high { background: #ef4444; }
        .activity-medium { background: #f59e0b; }
        .activity-low { background: #10b981; }

        .activity-content {
            flex: 1;
        }

        .activity-text {
            font-size: 0.875rem;
            color: #374151;
            margin-bottom: 0.25rem;
        }

        .activity-time {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .loading {
            text-align: center;
            padding: 2rem;
            color: #6b7280;
        }

        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }
            
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="logo">
                <span>🤖</span>
                <h1>Forward Horizon AI Agent</h1>
            </div>
            <div id="status-badge" class="status-badge">
                Loading...
            </div>
        </div>
    </div>

    <div class="container">
        <div class="grid">
            <!-- Agent Status -->
            <div class="card">
                <div class="card-header">
                    <span>⚡</span>
                    <h3 class="card-title">Agent Status</h3>
                </div>
                <div id="agent-metrics" class="loading">Loading...</div>
                <div class="controls" style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="controlAgent('start')">Start Agent</button>
                    <button class="btn btn-danger" onclick="controlAgent('stop')">Stop Agent</button>
                </div>
            </div>

            <!-- Business Metrics -->
            <div class="card">
                <div class="card-header">
                    <span>📊</span>
                    <h3 class="card-title">Business Metrics</h3>
                </div>
                <div id="business-metrics" class="loading">Loading...</div>
            </div>

            <!-- Memory System -->
            <div class="card">
                <div class="card-header">
                    <span>🧠</span>
                    <h3 class="card-title">Memory System</h3>
                </div>
                <div id="memory-metrics" class="loading">Loading...</div>
                <div class="controls" style="margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="executeAction('clear_memory')">Clear Old Memories</button>
                </div>
            </div>

            <!-- Task Automation -->
            <div class="card">
                <div class="card-header">
                    <span>⚙️</span>
                    <h3 class="card-title">Task Automation</h3>
                </div>
                <div id="automation-metrics" class="loading">Loading...</div>
            </div>

            <!-- Email System -->
            <div class="card">
                <div class="card-header">
                    <span>📧</span>
                    <h3 class="card-title">Email System</h3>
                </div>
                <div id="email-metrics" class="loading">Loading...</div>
                <div class="controls" style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="sendTestEmail()">Send Test Email</button>
                </div>
            </div>

            <!-- AI Core -->
            <div class="card">
                <div class="card-header">
                    <span>🤖</span>
                    <h3 class="card-title">AI Core</h3>
                </div>
                <div id="ai-metrics" class="loading">Loading...</div>
            </div>
        </div>

        <!-- Recent Activities -->
        <div class="card" style="grid-column: 1 / -1;">
            <div class="card-header">
                <span>📋</span>
                <h3 class="card-title">Recent Activities</h3>
            </div>
            <div id="recent-activities" class="loading">Loading...</div>
        </div>

        <!-- Chat Interface -->
        <div class="card" style="grid-column: 1 / -1; margin-top: 1.5rem;">
            <div class="card-header">
                <span>💬</span>
                <h3 class="card-title">Chat with AI Agent</h3>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="chat-input" placeholder="Ask the AI agent anything..." style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 8px;">
                <button class="btn btn-primary" onclick="sendChatMessage()">Send</button>
            </div>
            <div id="chat-response" style="margin-top: 1rem; padding: 1rem; background: #f9fafb; border-radius: 8px; min-height: 100px; display: none;">
            </div>
        </div>
    </div>

    <script>
        let dashboardData = {};

        // Load dashboard data
        async function loadDashboard() {
            try {
                const response = await fetch('/api/dashboard/data');
                dashboardData = await response.json();
                updateDashboard();
            } catch (error) {
                console.error('Failed to load dashboard:', error);
            }
        }

        // Update dashboard UI
        function updateDashboard() {
            updateStatusBadge();
            updateAgentMetrics();
            updateBusinessMetrics();
            updateMemoryMetrics();
            updateAutomationMetrics();
            updateEmailMetrics();
            updateAIMetrics();
            updateRecentActivities();
        }

        function updateStatusBadge() {
            const badge = document.getElementById('status-badge');
            const isActive = dashboardData.agent?.status === 'active';
            badge.textContent = isActive ? '🟢 Active' : '🔴 Inactive';
            badge.className = 'status-badge ' + (isActive ? 'status-active' : 'status-inactive');
        }

        function updateAgentMetrics() {
            const container = document.getElementById('agent-metrics');
            const agent = dashboardData.agent || {};
            
            container.innerHTML = \`
                <div class="metric">
                    <span>Status</span>
                    <span class="metric-value">\${agent.status || 'Unknown'}</span>
                </div>
                <div class="metric">
                    <span>Uptime</span>
                    <span class="metric-value">\${formatUptime(agent.uptime)}</span>
                </div>
                <div class="metric">
                    <span>Last Activity</span>
                    <span class="metric-value">\${formatTime(agent.lastActivity)}</span>
                </div>
                <div class="metric">
                    <span>Version</span>
                    <span class="metric-value">\${agent.version || '1.0.0'}</span>
                </div>
            \`;
        }

        function updateBusinessMetrics() {
            const container = document.getElementById('business-metrics');
            const business = dashboardData.business || {};
            const metrics = business.metrics || {};
            
            container.innerHTML = \`
                <div class="metric">
                    <span>Total Leads</span>
                    <span class="metric-value">\${metrics.leads?.total || 0}</span>
                </div>
                <div class="metric">
                    <span>New Leads</span>
                    <span class="metric-value">\${metrics.leads?.new || 0}</span>
                </div>
                <div class="metric">
                    <span>Converted</span>
                    <span class="metric-value">\${metrics.leads?.converted || 0}</span>
                </div>
                <div class="metric">
                    <span>Emails Sent</span>
                    <span class="metric-value">\${metrics.emails?.sent || 0}</span>
                </div>
            \`;
        }

        function updateMemoryMetrics() {
            const container = document.getElementById('memory-metrics');
            const memory = dashboardData.memory || {};
            
            container.innerHTML = \`
                <div class="metric">
                    <span>Total Memories</span>
                    <span class="metric-value">\${memory.total || 0}</span>
                </div>
                <div class="metric">
                    <span>Conversations</span>
                    <span class="metric-value">\${memory.by_type?.conversation || 0}</span>
                </div>
                <div class="metric">
                    <span>Business Data</span>
                    <span class="metric-value">\${memory.by_type?.business || 0}</span>
                </div>
                <div class="metric">
                    <span>High Importance</span>
                    <span class="metric-value">\${memory.by_importance?.high || 0}</span>
                </div>
            \`;
        }

        function updateAutomationMetrics() {
            const container = document.getElementById('automation-metrics');
            const automation = dashboardData.automation || {};
            
            container.innerHTML = \`
                <div class="metric">
                    <span>Total Tasks</span>
                    <span class="metric-value">\${automation.total_tasks || 0}</span>
                </div>
                <div class="metric">
                    <span>Completed</span>
                    <span class="metric-value">\${automation.completed_tasks || 0}</span>
                </div>
                <div class="metric">
                    <span>Failed</span>
                    <span class="metric-value">\${automation.failed_tasks || 0}</span>
                </div>
                <div class="metric">
                    <span>Pending</span>
                    <span class="metric-value">\${automation.pending_tasks || 0}</span>
                </div>
            \`;
        }

        function updateEmailMetrics() {
            const container = document.getElementById('email-metrics');
            const email = dashboardData.email || {};
            
            container.innerHTML = \`
                <div class="metric">
                    <span>Emails Sent</span>
                    <span class="metric-value">\${email.sent || 0}</span>
                </div>
                <div class="metric">
                    <span>Failed</span>
                    <span class="metric-value">\${email.failed || 0}</span>
                </div>
                <div class="metric">
                    <span>Daily Sent</span>
                    <span class="metric-value">\${email.daily_sent || 0}</span>
                </div>
                <div class="metric">
                    <span>Remaining Today</span>
                    <span class="metric-value">\${email.remaining_today || 0}</span>
                </div>
            \`;
        }

        function updateAIMetrics() {
            const container = document.getElementById('ai-metrics');
            const ai = dashboardData.ai || {};
            
            container.innerHTML = \`
                <div class="metric">
                    <span>Requests</span>
                    <span class="metric-value">\${ai.requests || 0}</span>
                </div>
                <div class="metric">
                    <span>Successful</span>
                    <span class="metric-value">\${ai.successful || 0}</span>
                </div>
                <div class="metric">
                    <span>Success Rate</span>
                    <span class="metric-value">\${ai.success_rate || '0%'}</span>
                </div>
                <div class="metric">
                    <span>Tokens Used</span>
                    <span class="metric-value">\${ai.tokens_used || 0}</span>
                </div>
            \`;
        }

        function updateRecentActivities() {
            const container = document.getElementById('recent-activities');
            const activities = dashboardData.recent_activities || [];
            
            if (activities.length === 0) {
                container.innerHTML = '<p class="loading">No recent activities</p>';
                return;
            }
            
            container.innerHTML = activities.map(activity => \`
                <div class="activity-item">
                    <div class="activity-icon activity-\${activity.importance}"></div>
                    <div class="activity-content">
                        <div class="activity-text">\${activity.content}</div>
                        <div class="activity-time">\${formatTime(activity.timestamp)}</div>
                    </div>
                </div>
            \`).join('');
        }

        // Control functions
        async function controlAgent(action) {
            try {
                const response = await fetch('/api/control/' + action, { method: 'POST' });
                const result = await response.json();
                
                if (result.success) {
                    setTimeout(loadDashboard, 1000); // Refresh after action
                } else {
                    alert('Action failed: ' + result.error);
                }
            } catch (error) {
                alert('Failed to ' + action + ' agent: ' + error.message);
            }
        }

        async function executeAction(action, params = {}) {
            try {
                const response = await fetch('/api/dashboard/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, params })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Success: ' + result.result);
                    loadDashboard();
                } else {
                    alert('Action failed: ' + result.error);
                }
            } catch (error) {
                alert('Failed to execute action: ' + error.message);
            }
        }

        function sendTestEmail() {
            const email = prompt('Enter email address for test:');
            if (email) {
                executeAction('send_test_email', { email });
            }
        }

        async function sendChatMessage() {
            const input = document.getElementById('chat-input');
            const responseDiv = document.getElementById('chat-response');
            const message = input.value.trim();
            
            if (!message) return;
            
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = 'Thinking...';
            input.value = '';
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                
                const result = await response.json();
                responseDiv.innerHTML = result.response || 'No response received';
            } catch (error) {
                responseDiv.innerHTML = 'Error: ' + error.message;
            }
        }

        // Utility functions
        function formatUptime(seconds) {
            if (!seconds) return '0s';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours > 0 ? \`\${hours}h \${minutes}m\` : \`\${minutes}m\`;
        }

        function formatTime(timestamp) {
            if (!timestamp) return 'Never';
            return new Date(timestamp).toLocaleString();
        }

        // Auto-refresh dashboard
        setInterval(loadDashboard, 30000); // Refresh every 30 seconds
        
        // Initial load
        loadDashboard();
        
        // Enter key for chat
        document.getElementById('chat-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    </script>
</body>
</html>
    `;
  }
}

module.exports = Dashboard;