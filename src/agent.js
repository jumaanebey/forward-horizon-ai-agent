#!/usr/bin/env node

/**
 * Forward Horizon AI Agent
 * An intelligent business assistant with memory, internet access, and automation
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Core modules
const Memory = require('./memory/memory');
const InternetAccess = require('./internet/web-access');
const EmailManager = require('./email/enhanced-email-manager');
const TaskAutomation = require('./automation/task-automation');
const BusinessLogic = require('./business/business-logic');
const AICore = require('./ai/ai-core');
const Logger = require('./utils/logger');
const Dashboard = require('./dashboard/dashboard');

class ForwardHorizonAIAgent {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Lazy-loaded components (initialized only when needed)
    this._memory = null;
    this._internet = null;
    this._email = null;
    this._automation = null;
    this._business = null;
    this._ai = null;
    this._dashboard = null;
    
    this.logger = new Logger('AI-Agent');
    this.isRunning = false;
    this.lastActivity = new Date();
    
    // Track which components are initialized
    this.initializedComponents = new Set();
  }

  // Lazy initialization getters
  async getMemory() {
    if (!this._memory) {
      this._memory = new Memory();
      if (!this.initializedComponents.has('memory')) {
        await this._memory.initialize();
        this.initializedComponents.add('memory');
      }
    }
    return this._memory;
  }

  async getInternet() {
    if (!this._internet) {
      this._internet = new InternetAccess();
      if (!this.initializedComponents.has('internet')) {
        await this._internet.initialize();
        this.initializedComponents.add('internet');
      }
    }
    return this._internet;
  }

  async getEmail() {
    if (!this._email) {
      this._email = new EmailManager();
      if (!this.initializedComponents.has('email')) {
        await this._email.initialize();
        this.initializedComponents.add('email');
      }
    }
    return this._email;
  }

  async getAutomation() {
    if (!this._automation) {
      this._automation = new TaskAutomation();
      if (!this.initializedComponents.has('automation')) {
        await this._automation.initialize();
        this.initializedComponents.add('automation');
      }
    }
    return this._automation;
  }

  async getBusiness() {
    if (!this._business) {
      this._business = new BusinessLogic();
      if (!this.initializedComponents.has('business')) {
        await this._business.initialize();
        this.initializedComponents.add('business');
      }
    }
    return this._business;
  }

  async getAI() {
    if (!this._ai) {
      this._ai = new AICore();
      if (!this.initializedComponents.has('ai')) {
        await this._ai.initialize();
        this.initializedComponents.add('ai');
      }
    }
    return this._ai;
  }

  async getDashboard() {
    if (!this._dashboard) {
      this._dashboard = new Dashboard();
      if (!this.initializedComponents.has('dashboard')) {
        await this._dashboard.initialize(this);
        this.initializedComponents.add('dashboard');
      }
    }
    return this._dashboard;
  }

  async initialize() {
    this.logger.info('🚀 Initializing Forward Horizon AI Agent (Fast Startup Mode)...');

    try {
      // Setup Express server only - components will be lazy-loaded
      this.setupServer();
      
      this.logger.info('✅ Agent initialized successfully - Components will load on-demand');
      this.logger.info('🏃‍♂️ Fast startup complete! Server ready in milliseconds instead of seconds');
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize agent:', error);
      return false;
    }
  }

  setupServer() {
    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));

    // API Routes
    this.setupRoutes();
  }

  setupRoutes() {
    // Agent status and control
    this.app.get('/api/status', async (req, res) => {
      try {
        const status = {
          status: this.isRunning ? 'active' : 'inactive',
          uptime: process.uptime(),
          lastActivity: this.lastActivity,
          initializedComponents: Array.from(this.initializedComponents)
        };
        
        // Only get stats from initialized components to avoid unnecessary initialization
        if (this.initializedComponents.has('memory')) {
          const memory = await this.getMemory();
          status.memory = await memory.getStats();
        }
        if (this.initializedComponents.has('automation')) {
          const automation = await this.getAutomation();
          status.tasks = automation.getStats();
        }
        if (this.initializedComponents.has('business')) {
          const business = await this.getBusiness();
          status.business = business.getStats();
        }
        
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: 'Failed to get status' });
      }
    });

    // Start/stop agent
    this.app.post('/api/control/:action', async (req, res) => {
      const { action } = req.params;
      
      try {
        if (action === 'start') {
          await this.start();
          res.json({ success: true, message: 'Agent started' });
        } else if (action === 'stop') {
          await this.stop();
          res.json({ success: true, message: 'Agent stopped' });
        } else {
          res.status(400).json({ error: 'Invalid action' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Memory operations
    this.app.get('/api/memory', async (req, res) => {
      try {
        const memory = await this.getMemory();
        const memories = await memory.getRecentMemories();
        res.json(memories);
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve memories' });
      }
    });

    this.app.post('/api/memory', async (req, res) => {
      const { content, type, importance } = req.body;
      
      // Input validation
      if (!content || typeof content !== 'string' || content.length > 10000) {
        return res.status(400).json({ error: 'Invalid content: must be a string under 10000 characters' });
      }
      
      const validTypes = ['conversation', 'lead', 'action', 'business', 'research', 'system'];
      const validImportance = ['low', 'medium', 'high', 'critical'];
      
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid type: must be one of ' + validTypes.join(', ') });
      }
      
      if (importance && !validImportance.includes(importance)) {
        return res.status(400).json({ error: 'Invalid importance: must be one of ' + validImportance.join(', ') });
      }
      
      const memory = await this.getMemory();
      const storedMemory = await memory.store(content, type, importance);
      res.json(storedMemory);
    });

    // Chat with agent
    this.app.post('/api/chat', async (req, res) => {
      const { message, context } = req.body;
      
      // Input validation
      if (!message || typeof message !== 'string' || message.length > 5000) {
        return res.status(400).json({ error: 'Invalid message: must be a string under 5000 characters' });
      }
      
      try {
        const response = await this.processMessage(message, context);
        res.json({ response });
      } catch (error) {
        this.logger.error('Chat API error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Business operations
    this.app.get('/api/business/leads', async (req, res) => {
      try {
        const business = await this.getBusiness();
        const leads = await business.getLeads();
        res.json(leads);
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve leads' });
      }
    });

    this.app.get('/api/business/tasks', async (req, res) => {
      try {
        const automation = await this.getAutomation();
        const tasks = await automation.getTasks();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve tasks' });
      }
    });

    // Lead Capture API - This is where live leads are received
    this.app.post('/api/leads', async (req, res) => {
      try {
        const leadData = req.body;
        
        // Validate required fields
        if (!leadData.name || !leadData.email) {
          return res.status(400).json({
            success: false,
            error: 'Name and email are required'
          });
        }

        // Process the lead through business logic
        const business = await this.getBusiness();
        const lead = await business.processNewLead(leadData);
        
        // Log the new lead
        this.logger.info(`📋 New lead received: ${leadData.name} (${leadData.email})`);
        
        // Store in memory
        const memory = await this.getMemory();
        await memory.store(
          `New lead: ${leadData.name} from ${leadData.source || 'unknown source'}`,
          'lead',
          leadData.is_veteran || leadData.currently_homeless ? 'high' : 'medium'
        );

        // Trigger immediate lead processing
        if (this.initializedComponents.has('automation')) {
          const automation = await this.getAutomation();
          if (typeof automation.triggerTask === 'function') {
            automation.triggerTask('lead_processing');
          }
        }

        res.json({
          success: true,
          lead: {
            id: lead.id,
            name: lead.name,
            status: lead.status,
            score: lead.score || 0,
            next_action: lead.next_action
          },
          message: 'Lead successfully captured and processing initiated'
        });

      } catch (error) {
        this.logger.error('Failed to process new lead:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to process lead',
          details: error.message
        });
      }
    });

    // Dashboard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/dashboard.html'));
    });
  }

  async start() {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    this.logger.info('🟢 Starting AI Agent...');
    this.isRunning = true;
    this.lastActivity = new Date();

    // Start automated tasks only if initialized
    if (this.initializedComponents.has('automation')) {
      const automation = await this.getAutomation();
      await automation.start();
    }
    
    // Start monitoring loops
    this.startMonitoring();
    
    this.logger.info('✅ AI Agent is now active and monitoring');
  }

  async stop() {
    if (!this.isRunning) {
      this.logger.warn('Agent is not running');
      return;
    }

    this.logger.info('🔴 Stopping AI Agent...');
    this.isRunning = false;
    
    // Stop automated tasks if running
    if (this.initializedComponents.has('automation')) {
      const automation = await this.getAutomation();
      await automation.stop();
    }
    
    this.logger.info('✅ AI Agent stopped');
  }

  startMonitoring() {
    // Check for new leads every 5 minutes
    setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkNewLeads();
        await this.processScheduledTasks();
        this.lastActivity = new Date();
      } catch (error) {
        this.logger.error('Error in monitoring loop:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Memory cleanup every hour
    setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        if (this.initializedComponents.has('memory')) {
          const memory = await this.getMemory();
          await memory.cleanup();
        }
      } catch (error) {
        this.logger.error('Error in memory cleanup:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  async checkNewLeads() {
    if (!this.initializedComponents.has('business')) return;
    
    const business = await this.getBusiness();
    const newLeads = await business.getNewLeads();
    
    for (const lead of newLeads) {
      this.logger.info(`📧 Processing new lead: ${lead.name}`);
      
      // Store in memory
      if (this.initializedComponents.has('memory')) {
        const memory = await this.getMemory();
        await memory.store(`New lead: ${lead.name} (${lead.email})`, 'lead', 'high');
      }
      
      // Auto-respond if configured
      if (business.shouldAutoRespond(lead)) {
        if (this.initializedComponents.has('email')) {
          const email = await this.getEmail();
          await email.sendWelcomeEmail(lead);
          
          if (this.initializedComponents.has('memory')) {
            const memory = await this.getMemory();
            await memory.store(`Sent welcome email to ${lead.name}`, 'action', 'medium');
          }
        }
      }
      
      // Schedule follow-up
      if (this.initializedComponents.has('automation')) {
        const automation = await this.getAutomation();
        await automation.scheduleFollowUp(lead);
      }
    }
  }

  async processScheduledTasks() {
    const tasks = await this.automation.getDueTasks();
    
    for (const task of tasks) {
      try {
        await this.executeTask(task);
        await this.automation.markTaskCompleted(task.id);
      } catch (error) {
        this.logger.error(`Failed to execute task ${task.id}:`, error);
        await this.automation.markTaskFailed(task.id, error.message);
      }
    }
  }

  async executeTask(task) {
    this.logger.info(`🔄 Executing task: ${task.type}`);
    
    switch (task.type) {
      case 'send_email':
        await this.email.sendEmail(task.data);
        break;
      case 'web_research':
        await this.internet.research(task.data.topic);
        break;
      case 'follow_up_lead':
        await this.business.followUpLead(task.data.leadId);
        break;
      case 'generate_report':
        await this.business.generateReport(task.data.type);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
    
    await this.memory.store(`Completed task: ${task.type}`, 'action', 'medium');
  }

  async processMessage(message, context = {}) {
    this.logger.info(`💬 Processing message: ${message.substring(0, 50)}...`);
    
    // Store message in memory
    await this.memory.store(`User message: ${message}`, 'conversation', 'medium');
    
    // Get relevant memories for context
    const relevantMemories = await this.memory.search(message);
    
    // Get business context
    const businessContext = await this.business.getContext();
    
    // Generate response using AI
    const response = await this.ai.generateResponse(message, {
      memories: relevantMemories,
      business: businessContext,
      ...context
    });
    
    // Store response in memory
    await this.memory.store(`Agent response: ${response}`, 'conversation', 'medium');
    
    return response;
  }

  async listen() {
    const server = this.app.listen(this.port, () => {
      this.logger.info(`🌐 AI Agent dashboard available at http://localhost:${this.port}`);
      this.logger.info(`📊 Status: http://localhost:${this.port}/api/status`);
      this.logger.info(`💬 Chat: http://localhost:${this.port}/api/chat`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      this.logger.info('🛑 Received SIGTERM, shutting down gracefully...');
      await this.stop();
      server.close(() => {
        process.exit(0);
      });
    });

    return server;
  }
}

// Handle unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Main execution
async function main() {
  const agent = new ForwardHorizonAIAgent();
  
  const initialized = await agent.initialize();
  if (!initialized) {
    console.error('❌ Failed to initialize agent. Check logs for details.');
    process.exit(1);
  }
  
  await agent.listen();
  
  // Auto-start if not in test mode
  if (process.env.NODE_ENV !== 'test') {
    setTimeout(async () => {
      await agent.start();
    }, 2000);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ForwardHorizonAIAgent;