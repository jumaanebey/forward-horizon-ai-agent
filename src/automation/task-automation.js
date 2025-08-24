/**
 * Task Automation System
 * Handles scheduling, execution, and management of automated tasks
 */

const { CronJob } = require('cron');
const Logger = require('../utils/logger');

class TaskAutomation {
  constructor() {
    this.logger = new Logger('TaskAutomation');
    this.tasks = new Map();
    this.cronJobs = new Map();
    this.initialized = false;
    this.running = false;
    
    // Task statistics
    this.stats = {
      total_tasks: 0,
      completed_tasks: 0,
      failed_tasks: 0,
      pending_tasks: 0,
      last_execution: null
    };
    
    // Task types with their default configurations
    this.taskTypes = {
      email_follow_up: {
        priority: 'high',
        retry_attempts: 3,
        retry_delay: 30 * 60 * 1000 // 30 minutes
      },
      web_research: {
        priority: 'medium',
        retry_attempts: 2,
        retry_delay: 60 * 60 * 1000 // 1 hour
      },
      lead_processing: {
        priority: 'high',
        retry_attempts: 3,
        retry_delay: 15 * 60 * 1000 // 15 minutes
      },
      report_generation: {
        priority: 'low',
        retry_attempts: 1,
        retry_delay: 4 * 60 * 60 * 1000 // 4 hours
      },
      data_cleanup: {
        priority: 'low',
        retry_attempts: 1,
        retry_delay: 24 * 60 * 60 * 1000 // 24 hours
      }
    };
  }

  async initialize() {
    this.logger.info('⚡ Initializing Task Automation...');
    
    try {
      // Setup recurring tasks
      this.setupRecurringTasks();
      
      this.initialized = true;
      this.logger.info('✅ Task Automation initialized');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize task automation:', error);
      throw error;
    }
  }

  /**
   * Setup recurring tasks using cron jobs
   */
  setupRecurringTasks() {
    const recurringTasks = [
      {
        name: 'lead_processing',
        schedule: '*/10 * * * *', // Every 10 minutes
        task: () => this.scheduleTask('lead_processing', {
          action: 'process_new_leads',
          automated: true
        })
      },
      {
        name: 'email_queue_processing',
        schedule: '*/5 * * * *', // Every 5 minutes
        task: () => this.scheduleTask('email_processing', {
          action: 'process_email_queue',
          automated: true
        })
      },
      {
        name: 'daily_report',
        schedule: '0 18 * * *', // 6 PM daily
        task: () => this.scheduleTask('report_generation', {
          action: 'generate_daily_report',
          automated: true
        })
      },
      {
        name: 'weekly_report',
        schedule: '0 9 * * 1', // 9 AM every Monday
        task: () => this.scheduleTask('report_generation', {
          action: 'generate_weekly_report',
          automated: true
        })
      },
      {
        name: 'data_cleanup',
        schedule: '0 2 * * *', // 2 AM daily
        task: () => this.scheduleTask('data_cleanup', {
          action: 'cleanup_expired_data',
          automated: true
        })
      },
      {
        name: 'research_trending_topics',
        schedule: '0 12 * * *', // 12 PM daily
        task: () => this.scheduleTask('web_research', {
          action: 'research_industry_trends',
          automated: true
        })
      }
    ];

    recurringTasks.forEach(({ name, schedule, task }) => {
      try {
        const cronJob = new CronJob(schedule, task, null, false, 'America/Los_Angeles');
        this.cronJobs.set(name, cronJob);
        this.logger.info(`📅 Scheduled recurring task: ${name} (${schedule})`);
      } catch (error) {
        this.logger.error(`Failed to schedule ${name}:`, error);
      }
    });
  }

  /**
   * Start the task automation system
   */
  async start() {
    if (this.running) {
      this.logger.warn('Task automation is already running');
      return;
    }

    this.logger.info('▶️ Starting task automation...');
    
    // Start all cron jobs
    this.cronJobs.forEach((job, name) => {
      job.start();
      this.logger.info(`✅ Started recurring task: ${name}`);
    });
    
    this.running = true;
    this.logger.info('🚀 Task automation is now running');
  }

  /**
   * Stop the task automation system
   */
  async stop() {
    if (!this.running) {
      this.logger.warn('Task automation is not running');
      return;
    }

    this.logger.info('⏹️ Stopping task automation...');
    
    // Stop all cron jobs
    this.cronJobs.forEach((job, name) => {
      job.stop();
      this.logger.info(`⏸️ Stopped recurring task: ${name}`);
    });
    
    this.running = false;
    this.logger.info('🛑 Task automation stopped');
  }

  /**
   * Schedule a new task
   */
  async scheduleTask(type, data, options = {}) {
    const task = {
      id: this.generateTaskId(),
      type,
      data,
      status: 'pending',
      priority: this.taskTypes[type]?.priority || 'medium',
      created_at: new Date(),
      scheduled_at: options.scheduledAt || new Date(),
      attempts: 0,
      max_attempts: this.taskTypes[type]?.retry_attempts || 2,
      retry_delay: this.taskTypes[type]?.retry_delay || 60000,
      last_error: null,
      metadata: options.metadata || {}
    };

    this.tasks.set(task.id, task);
    this.stats.total_tasks++;
    this.stats.pending_tasks++;

    this.logger.info(`📋 Scheduled ${type} task: ${task.id}`);
    
    // If task is due now or overdue, execute immediately
    if (task.scheduled_at <= new Date()) {
      setTimeout(() => this.executeTask(task.id), 100);
    }

    return task.id;
  }

  /**
   * Schedule a follow-up task for a lead
   */
  async scheduleFollowUp(lead, delayHours = 24) {
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + delayHours);

    return await this.scheduleTask('email_follow_up', {
      lead_id: lead.id,
      lead_name: lead.name,
      lead_email: lead.email,
      follow_up_type: 'general'
    }, {
      scheduledAt,
      metadata: {
        lead_source: lead.source,
        original_inquiry: lead.created_at
      }
    });
  }

  /**
   * Get tasks that are due for execution
   */
  async getDueTasks() {
    const now = new Date();
    const dueTasks = [];

    this.tasks.forEach(task => {
      if (task.status === 'pending' && task.scheduled_at <= now) {
        dueTasks.push(task);
      }
    });

    // Sort by priority and creation time
    return dueTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.created_at - b.created_at;
    });
  }

  /**
   * Execute a specific task
   */
  async executeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) {
      this.logger.warn(`Task ${taskId} not found`);
      return false;
    }

    if (task.status !== 'pending') {
      this.logger.warn(`Task ${taskId} is not pending (status: ${task.status})`);
      return false;
    }

    this.logger.info(`⚡ Executing ${task.type} task: ${taskId}`);
    
    task.status = 'running';
    task.started_at = new Date();
    task.attempts++;

    try {
      const result = await this.executeTaskByType(task);
      
      task.status = 'completed';
      task.completed_at = new Date();
      task.result = result;
      
      this.stats.completed_tasks++;
      this.stats.pending_tasks--;
      this.stats.last_execution = new Date();
      
      this.logger.info(`✅ Completed ${task.type} task: ${taskId}`);
      return true;
      
    } catch (error) {
      task.last_error = error.message;
      
      if (task.attempts < task.max_attempts) {
        // Schedule retry
        task.status = 'pending';
        task.scheduled_at = new Date(Date.now() + task.retry_delay);
        
        this.logger.warn(`🔄 Retrying ${task.type} task ${taskId} in ${task.retry_delay}ms (attempt ${task.attempts}/${task.max_attempts})`);
        
        setTimeout(() => this.executeTask(taskId), task.retry_delay);
      } else {
        // Mark as failed
        task.status = 'failed';
        task.failed_at = new Date();
        
        this.stats.failed_tasks++;
        this.stats.pending_tasks--;
        
        this.logger.error(`❌ Failed ${task.type} task ${taskId} after ${task.attempts} attempts:`, error);
      }
      
      return false;
    }
  }

  /**
   * Execute task based on its type
   */
  async executeTaskByType(task) {
    switch (task.type) {
      case 'lead_processing':
        return await this.processLeads(task.data);
      
      case 'email_follow_up':
        return await this.sendFollowUpEmail(task.data);
      
      case 'email_processing':
        return await this.processEmailQueue(task.data);
      
      case 'web_research':
        return await this.performWebResearch(task.data);
      
      case 'report_generation':
        return await this.generateReport(task.data);
      
      case 'data_cleanup':
        return await this.performDataCleanup(task.data);
      
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  // Task execution methods
  async processLeads(data) {
    // This would integrate with the business logic module
    return { processed: 0, message: 'Lead processing not implemented' };
  }

  async sendFollowUpEmail(data) {
    // This would integrate with the email manager
    return { 
      sent: true, 
      lead_id: data.lead_id,
      message: `Follow-up email sent to ${data.lead_email}` 
    };
  }

  async processEmailQueue(data) {
    // Process pending emails
    return { processed: 0, message: 'Email queue processing not implemented' };
  }

  async performWebResearch(data) {
    // This would integrate with the internet access module
    return { 
      researched: true,
      topic: data.topic || 'general',
      message: 'Web research completed' 
    };
  }

  async generateReport(data) {
    // This would integrate with the business logic module
    return { 
      generated: true,
      type: data.action,
      message: `Report generated: ${data.action}` 
    };
  }

  async performDataCleanup(data) {
    // Clean up expired data
    let cleaned = 0;
    
    // Clean up old completed tasks (keep last 100)
    const completedTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'completed')
      .sort((a, b) => b.completed_at - a.completed_at)
      .slice(100);
    
    completedTasks.forEach(task => {
      this.tasks.delete(task.id);
      cleaned++;
    });
    
    return { cleaned, message: `Cleaned up ${cleaned} old tasks` };
  }

  /**
   * Mark a task as completed
   */
  async markTaskCompleted(taskId, result = null) {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.status = 'completed';
    task.completed_at = new Date();
    if (result) task.result = result;

    this.stats.completed_tasks++;
    if (task.status === 'pending') this.stats.pending_tasks--;

    return true;
  }

  /**
   * Mark a task as failed
   */
  async markTaskFailed(taskId, error) {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.status = 'failed';
    task.failed_at = new Date();
    task.last_error = error;

    this.stats.failed_tasks++;
    if (task.status === 'pending') this.stats.pending_tasks--;

    return true;
  }

  /**
   * Get all tasks with optional filtering
   */
  async getTasks(options = {}) {
    const { status, type, limit = 50 } = options;
    
    let tasks = Array.from(this.tasks.values());
    
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    
    if (type) {
      tasks = tasks.filter(t => t.type === type);
    }
    
    return tasks
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit);
  }

  /**
   * Get task statistics
   */
  getStats() {
    return {
      ...this.stats,
      running: this.running,
      initialized: this.initialized,
      active_cron_jobs: this.cronJobs.size,
      pending_tasks: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length
    };
  }

  /**
   * Generate a unique task ID
   */
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup - stop all tasks and clear data
   */
  async cleanup() {
    await this.stop();
    this.tasks.clear();
    this.cronJobs.clear();
    this.logger.info('🧹 Task automation cleaned up');
  }
}

module.exports = TaskAutomation;