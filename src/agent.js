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
    
    // Initialize core components
    this.memory = new Memory();
    this.internet = new InternetAccess();
    this.email = new EmailManager();
    this.automation = new TaskAutomation();
    this.business = new BusinessLogic();
    this.ai = new AICore();
    this.logger = new Logger('AI-Agent');
    this.dashboard = new Dashboard();
    
    this.isRunning = false;
    this.lastActivity = new Date();
  }

  async initialize() {
    this.logger.info('🚀 Initializing Forward Horizon AI Agent...');

    try {
      // Setup Express server
      this.setupServer();
      
      // Initialize all components
      await this.memory.initialize();
      await this.internet.initialize();
      await this.email.initialize();
      await this.automation.initialize();
      await this.business.initialize();
      await this.ai.initialize();
      await this.dashboard.initialize(this);

      this.logger.info('✅ All components initialized successfully');
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
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: this.isRunning ? 'active' : 'inactive',
        uptime: process.uptime(),
        lastActivity: this.lastActivity,
        memory: this.memory.getStats(),
        tasks: this.automation.getStats(),
        business: this.business.getStats()
      });
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
      const memories = await this.memory.getRecentMemories();
      res.json(memories);
    });

    this.app.post('/api/memory', async (req, res) => {
      const { content, type, importance } = req.body;
      const memory = await this.memory.store(content, type, importance);
      res.json(memory);
    });

    // Chat with agent
    this.app.post('/api/chat', async (req, res) => {
      const { message, context } = req.body;
      
      try {
        const response = await this.processMessage(message, context);
        res.json({ response });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Business operations
    this.app.get('/api/business/leads', async (req, res) => {
      const leads = await this.business.getLeads();
      res.json(leads);
    });

    this.app.get('/api/business/tasks', async (req, res) => {
      const tasks = await this.automation.getTasks();
      res.json(tasks);
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
        const lead = await this.business.processNewLead(leadData);
        
        // Log the new lead
        this.logger.info(`📋 New lead received: ${leadData.name} (${leadData.email})`);
        
        // Store in memory
        await this.memory.store(
          `New lead: ${leadData.name} from ${leadData.source || 'unknown source'}`,
          'lead',
          leadData.is_veteran || leadData.currently_homeless ? 'high' : 'medium'
        );

        // Trigger immediate lead processing
        if (this.automation && typeof this.automation.triggerTask === 'function') {
          this.automation.triggerTask('lead_processing');
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

    // Start automated tasks
    await this.automation.start();
    
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
    
    // Stop automated tasks
    await this.automation.stop();
    
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
        await this.memory.cleanup();
      } catch (error) {
        this.logger.error('Error in memory cleanup:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  async checkNewLeads() {
    const newLeads = await this.business.getNewLeads();
    
    for (const lead of newLeads) {
      this.logger.info(`📧 Processing new lead: ${lead.name}`);
      
      // Store in memory
      await this.memory.store(`New lead: ${lead.name} (${lead.email})`, 'lead', 'high');
      
      // Auto-respond if configured
      if (this.business.shouldAutoRespond(lead)) {
        await this.email.sendWelcomeEmail(lead);
        await this.memory.store(`Sent welcome email to ${lead.name}`, 'action', 'medium');
      }
      
      // Schedule follow-up
      await this.automation.scheduleFollowUp(lead);
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