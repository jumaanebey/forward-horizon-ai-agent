#!/usr/bin/env node

/**
 * Test Script for Forward Horizon AI Agent
 * Validates all components can be loaded and basic functionality works
 */

const path = require('path');
const fs = require('fs');

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  async runAllTests() {
    console.log('🧪 Forward Horizon AI Agent Test Suite\n');
    
    try {
      await this.testModuleImports();
      await this.testConfiguration();
      await this.testBasicFunctionality();
      
      this.showSummary();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async testModuleImports() {
    console.log('📦 Testing Module Imports...');
    
    const modules = [
      { name: 'Memory', path: '../src/memory/memory' },
      { name: 'InternetAccess', path: '../src/internet/web-access' },
      { name: 'EmailManager', path: '../src/email/email-manager' },
      { name: 'TaskAutomation', path: '../src/automation/task-automation' },
      { name: 'BusinessLogic', path: '../src/business/business-logic' },
      { name: 'AICore', path: '../src/ai/ai-core' },
      { name: 'Logger', path: '../src/utils/logger' },
      { name: 'Dashboard', path: '../src/dashboard/dashboard' }
    ];

    for (const module of modules) {
      try {
        const ModuleClass = require(module.path);
        const instance = new ModuleClass();
        
        if (instance && typeof instance === 'object') {
          this.pass(`${module.name} module imports correctly`);
        } else {
          this.fail(`${module.name} module does not create valid instance`);
        }
      } catch (error) {
        this.fail(`${module.name} module import failed: ${error.message}`);
      }
    }
  }

  async testConfiguration() {
    console.log('\n⚙️ Testing Configuration...');
    
    // Test environment loading
    try {
      require('dotenv').config();
      this.pass('Environment configuration loads');
    } catch (error) {
      this.fail(`Environment configuration failed: ${error.message}`);
    }

    // Test required files exist
    const requiredFiles = [
      'src/agent.js',
      'package.json',
      '.env.example',
      'schema.sql',
      'README.md'
    ];

    requiredFiles.forEach(file => {
      if (fs.existsSync(path.join(process.cwd(), file))) {
        this.pass(`Required file exists: ${file}`);
      } else {
        this.fail(`Missing required file: ${file}`);
      }
    });

    // Test directories exist
    const requiredDirs = [
      'src',
      'scripts',
      'logs'
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.pass(`Required directory exists: ${dir}`);
      } else {
        this.fail(`Missing required directory: ${dir}`);
      }
    });
  }

  async testBasicFunctionality() {
    console.log('\n🔧 Testing Basic Functionality...');
    
    // Test Logger
    try {
      const Logger = require('../src/utils/logger');
      const logger = new Logger('Test');
      
      logger.info('Test message');
      this.pass('Logger basic functionality');
    } catch (error) {
      this.fail(`Logger test failed: ${error.message}`);
    }

    // Test Memory (without database)
    try {
      const Memory = require('../src/memory/memory');
      const memory = new Memory();
      
      // Test memory structure
      if (memory.types && memory.importance && typeof memory.store === 'function') {
        this.pass('Memory module structure');
      } else {
        this.fail('Memory module missing required methods');
      }
    } catch (error) {
      this.fail(`Memory test failed: ${error.message}`);
    }

    // Test Email Manager (without SMTP)
    try {
      const EmailManager = require('../src/email/email-manager');
      const emailManager = new EmailManager();
      
      if (typeof emailManager.sendEmail === 'function' && 
          typeof emailManager.generateWelcomeEmailHTML === 'function') {
        this.pass('EmailManager module structure');
      } else {
        this.fail('EmailManager module missing required methods');
      }
    } catch (error) {
      this.fail(`EmailManager test failed: ${error.message}`);
    }

    // Test Task Automation
    try {
      const TaskAutomation = require('../src/automation/task-automation');
      const taskAutomation = new TaskAutomation();
      
      if (typeof taskAutomation.scheduleTask === 'function' &&
          taskAutomation.taskTypes) {
        this.pass('TaskAutomation module structure');
      } else {
        this.fail('TaskAutomation module missing required methods');
      }
    } catch (error) {
      this.fail(`TaskAutomation test failed: ${error.message}`);
    }

    // Test Business Logic
    try {
      const BusinessLogic = require('../src/business/business-logic');
      const businessLogic = new BusinessLogic();
      
      if (typeof businessLogic.getLeads === 'function' &&
          typeof businessLogic.scheduleFollowUp === 'function') {
        this.pass('BusinessLogic module structure');
      } else {
        this.fail('BusinessLogic module missing required methods');
      }
    } catch (error) {
      this.fail(`BusinessLogic test failed: ${error.message}`);
    }

    // Test AI Core (without API key)
    try {
      const AICore = require('../src/ai/ai-core');
      const aiCore = new AICore();
      
      if (typeof aiCore.generateResponse === 'function' &&
          aiCore.config) {
        this.pass('AICore module structure');
      } else {
        this.fail('AICore module missing required methods');
      }
    } catch (error) {
      this.fail(`AICore test failed: ${error.message}`);
    }

    // Test Internet Access
    try {
      const InternetAccess = require('../src/internet/web-access');
      const internetAccess = new InternetAccess();
      
      if (typeof internetAccess.scrapeWebsite === 'function' &&
          typeof internetAccess.research === 'function') {
        this.pass('InternetAccess module structure');
      } else {
        this.fail('InternetAccess module missing required methods');
      }
    } catch (error) {
      this.fail(`InternetAccess test failed: ${error.message}`);
    }

    // Test main agent class
    try {
      const ForwardHorizonAIAgent = require('../src/agent');
      const agent = new ForwardHorizonAIAgent();
      
      if (typeof agent.initialize === 'function' &&
          typeof agent.start === 'function' &&
          typeof agent.stop === 'function') {
        this.pass('Main Agent class structure');
      } else {
        this.fail('Main Agent class missing required methods');
      }
    } catch (error) {
      this.fail(`Main Agent test failed: ${error.message}`);
    }
  }

  pass(testName) {
    console.log(`  ✅ ${testName}`);
    this.passed++;
  }

  fail(testName) {
    console.log(`  ❌ ${testName}`);
    this.failed++;
  }

  showSummary() {
    console.log('\n📊 Test Results');
    console.log('================');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📝 Total:  ${this.passed + this.failed}`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All tests passed! The AI agent is ready to use.');
      console.log('\nNext steps:');
      console.log('  1. Configure environment variables in .env');
      console.log('  2. Run: npm run setup');
      console.log('  3. Start the agent: npm start');
    } else {
      console.log(`\n⚠️  ${this.failed} tests failed. Please review the errors above.`);
      process.exit(1);
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const testRunner = new TestRunner();
  testRunner.runAllTests().catch(console.error);
}

module.exports = TestRunner;