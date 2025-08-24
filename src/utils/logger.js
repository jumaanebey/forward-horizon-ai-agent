/**
 * Logger Utility
 * Provides consistent logging across all modules
 */

const winston = require('winston');
const path = require('path');

class Logger {
  constructor(module = 'App') {
    this.module = module;
    this.winston = this.createWinstonLogger();
  }

  createWinstonLogger() {
    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    return winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'forward-horizon-ai-agent' },
      transports: [
        // Write all logs with importance level of 'error' or less to 'error.log'
        new winston.transports.File({ 
          filename: path.join(logsDir, 'error.log'), 
          level: 'error' 
        }),
        // Write all logs with importance level of 'info' or less to 'combined.log'
        new winston.transports.File({ 
          filename: path.join(logsDir, 'combined.log') 
        })
      ]
    });
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.module}] [${level.toUpperCase()}]`;
    
    if (typeof message === 'object') {
      return `${prefix} ${JSON.stringify(message)}`;
    }
    
    return `${prefix} ${message}`;
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('info', message, meta);
    console.log(`\x1b[36m${formatted}\x1b[0m`); // Cyan
    this.winston.info(message, { module: this.module, ...meta });
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn(`\x1b[33m${formatted}\x1b[0m`); // Yellow
    this.winston.warn(message, { module: this.module, ...meta });
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('error', message, meta);
    console.error(`\x1b[31m${formatted}\x1b[0m`); // Red
    this.winston.error(message, { module: this.module, ...meta });
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
      const formatted = this.formatMessage('debug', message, meta);
      console.log(`\x1b[37m${formatted}\x1b[0m`); // Gray
      this.winston.debug(message, { module: this.module, ...meta });
    }
  }

  success(message, meta = {}) {
    const formatted = this.formatMessage('success', message, meta);
    console.log(`\x1b[32m${formatted}\x1b[0m`); // Green
    this.winston.info(message, { module: this.module, type: 'success', ...meta });
  }

  // Convenience methods for different types of operations
  startup(message, meta = {}) {
    this.info(`🚀 ${message}`, meta);
  }

  shutdown(message, meta = {}) {
    this.info(`🛑 ${message}`, meta);
  }

  database(message, meta = {}) {
    this.info(`💾 ${message}`, meta);
  }

  network(message, meta = {}) {
    this.info(`🌐 ${message}`, meta);
  }

  email(message, meta = {}) {
    this.info(`📧 ${message}`, meta);
  }

  task(message, meta = {}) {
    this.info(`⚡ ${message}`, meta);
  }

  business(message, meta = {}) {
    this.info(`🏢 ${message}`, meta);
  }

  ai(message, meta = {}) {
    this.info(`🤖 ${message}`, meta);
  }
}

module.exports = Logger;