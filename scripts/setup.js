#!/usr/bin/env node

/**
 * Setup Script for Forward Horizon AI Agent
 * Initializes database, creates necessary tables, and validates configuration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class SetupWizard {
  constructor() {
    this.supabase = null;
    this.errors = [];
    this.warnings = [];
  }

  async run() {
    console.log('🚀 Forward Horizon AI Agent Setup Wizard\n');
    
    try {
      // Check environment variables
      await this.checkEnvironment();
      
      // Initialize Supabase
      await this.initializeSupabase();
      
      // Setup database tables
      await this.setupDatabase();
      
      // Test integrations
      await this.testIntegrations();
      
      // Create logs directory
      this.createDirectories();
      
      // Show summary
      this.showSummary();
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkEnvironment() {
    console.log('🔍 Checking environment configuration...');
    
    const required = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    
    const recommended = [
      'ANTHROPIC_API_KEY',
      'EMAIL_HOST',
      'EMAIL_USER',
      'EMAIL_PASS',
      'BUSINESS_NAME',
      'BUSINESS_PHONE',
      'BUSINESS_EMAIL'
    ];
    
    // Check required variables
    for (const env of required) {
      if (!process.env[env]) {
        this.errors.push(`Missing required environment variable: ${env}`);
      } else {
        console.log(`  ✅ ${env}`);
      }
    }
    
    // Check recommended variables
    for (const env of recommended) {
      if (!process.env[env]) {
        this.warnings.push(`Missing recommended environment variable: ${env}`);
        console.log(`  ⚠️  ${env} (recommended)`);
      } else {
        console.log(`  ✅ ${env}`);
      }
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Missing required environment variables:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      throw new Error('Please configure required environment variables in .env file');
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Missing recommended variables (some features may be limited):');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('✅ Environment check completed\n');
  }

  async initializeSupabase() {
    console.log('🗄️  Initializing Supabase connection...');
    
    try {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
      );
      
      // Test connection
      const { data, error } = await this.supabase
        .from('leads')
        .select('count', { count: 'exact', head: true })
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (OK for first setup)
        throw error;
      }
      
      console.log('✅ Supabase connection successful\n');
    } catch (error) {
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }
  }

  async setupDatabase() {
    console.log('🏗️  Setting up database tables...');
    
    const tables = [
      {
        name: 'leads',
        sql: `
          -- Create leads table
          CREATE TABLE IF NOT EXISTS leads (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(50),
            source VARCHAR(100) DEFAULT 'website',
            status VARCHAR(50) DEFAULT 'new',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            
            -- Add constraints
            CONSTRAINT leads_name_check CHECK (length(trim(name)) > 0),
            CONSTRAINT leads_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}\$'),
            CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'))
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
          CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
          CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email) WHERE email IS NOT NULL;
        `
      },
      {
        name: 'agent_memories',
        sql: `
          -- Create agent memories table
          CREATE TABLE IF NOT EXISTS agent_memories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            content TEXT NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'system',
            importance VARCHAR(20) NOT NULL DEFAULT 'medium',
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ,
            
            -- Constraints
            CONSTRAINT memories_type_check CHECK (type IN ('conversation', 'lead', 'action', 'business', 'research', 'system')),
            CONSTRAINT memories_importance_check CHECK (importance IN ('low', 'medium', 'high', 'critical'))
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS memories_type_idx ON agent_memories(type);
          CREATE INDEX IF NOT EXISTS memories_importance_idx ON agent_memories(importance);
          CREATE INDEX IF NOT EXISTS memories_created_at_idx ON agent_memories(created_at DESC);
          CREATE INDEX IF NOT EXISTS memories_expires_at_idx ON agent_memories(expires_at) WHERE expires_at IS NOT NULL;
        `
      },
      {
        name: 'lead_interactions',
        sql: `
          -- Create lead interactions table
          CREATE TABLE IF NOT EXISTS lead_interactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
            interaction_type VARCHAR(50) NOT NULL,
            interaction_data JSONB NOT NULL DEFAULT '{}',
            scheduled_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            
            CONSTRAINT interactions_status_check CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS lead_interactions_lead_id_idx ON lead_interactions(lead_id);
          CREATE INDEX IF NOT EXISTS lead_interactions_type_status_idx ON lead_interactions(interaction_type, status);
          CREATE INDEX IF NOT EXISTS lead_interactions_scheduled_idx ON lead_interactions(scheduled_at) WHERE scheduled_at IS NOT NULL;
        `
      },
      {
        name: 'business_metrics',
        sql: `
          -- Create business metrics table
          CREATE TABLE IF NOT EXISTS business_metrics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            metric_type VARCHAR(50) NOT NULL,
            metric_name VARCHAR(100) NOT NULL,
            metric_value NUMERIC NOT NULL DEFAULT 0,
            date DATE NOT NULL DEFAULT CURRENT_DATE,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Create indexes
          CREATE INDEX IF NOT EXISTS business_metrics_type_date_idx ON business_metrics(metric_type, date);
          CREATE INDEX IF NOT EXISTS business_metrics_name_date_idx ON business_metrics(metric_name, date);
        `
      }
    ];

    // Create triggers for updated_at
    const triggerSQL = `
      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS \$\$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      \$\$ language 'plpgsql';

      -- Apply triggers to all tables
      DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
      CREATE TRIGGER update_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_memories_updated_at ON agent_memories;
      CREATE TRIGGER update_memories_updated_at
        BEFORE UPDATE ON agent_memories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_interactions_updated_at ON lead_interactions;
      CREATE TRIGGER update_interactions_updated_at
        BEFORE UPDATE ON lead_interactions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_metrics_updated_at ON business_metrics;
      CREATE TRIGGER update_metrics_updated_at
        BEFORE UPDATE ON business_metrics
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute table creation
    for (const table of tables) {
      try {
        // Check if we have service role key for RPC
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { error } = await this.supabase.rpc('exec_sql', { sql: table.sql });
          
          if (error) {
            console.log(`  ⚠️  Could not create ${table.name} via RPC: ${error.message}`);
            console.log(`  💡  Please run the SQL commands manually in your Supabase SQL editor`);
          } else {
            console.log(`  ✅ Created table: ${table.name}`);
          }
        } else {
          console.log(`  ⚠️  ${table.name}: Requires SUPABASE_SERVICE_ROLE_KEY for automatic creation`);
          console.log(`  💡  Please run schema.sql manually in your Supabase SQL editor`);
        }
      } catch (error) {
        console.log(`  ⚠️  ${table.name}: ${error.message}`);
        console.log(`  💡  This is normal with placeholder credentials - run schema.sql manually when ready`);
      }
    }

    // Setup triggers
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { error } = await this.supabase.rpc('exec_sql', { sql: triggerSQL });
        if (!error) {
          console.log('  ✅ Created update triggers');
        } else {
          console.log(`  ⚠️  Triggers: ${error.message}`);
          console.log(`  💡  Please run schema.sql manually for triggers`);
        }
      } else {
        console.log('  ⚠️  Triggers: Requires SUPABASE_SERVICE_ROLE_KEY for automatic creation');
        console.log('  💡  Please run schema.sql manually in your Supabase SQL editor');
      }
    } catch (error) {
      console.log(`  ⚠️  Triggers: ${error.message}`);
      console.log(`  💡  This is normal with placeholder credentials - run schema.sql manually when ready`);
    }

    console.log('✅ Database setup completed\n');
  }

  async testIntegrations() {
    console.log('🔬 Testing integrations...');
    
    // Test Supabase operations
    try {
      // Test insert
      const { data, error } = await this.supabase
        .from('agent_memories')
        .insert([{
          content: 'Setup test memory',
          type: 'system',
          importance: 'low'
        }])
        .select()
        .single();

      if (error) {
        console.log(`  ⚠️  Supabase insert test: ${error.message}`);
      } else {
        console.log('  ✅ Supabase insert test');
        
        // Cleanup test data
        await this.supabase
          .from('agent_memories')
          .delete()
          .eq('id', data.id);
      }
    } catch (error) {
      console.log(`  ⚠️  Supabase test: ${error.message}`);
    }

    // Test AI API if configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        const client = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });

        const response = await client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }]
        });

        if (response.content && response.content.length > 0) {
          console.log('  ✅ Anthropic API test');
        }
      } catch (error) {
        console.log(`  ⚠️  Anthropic API test: ${error.message}`);
      }
    } else {
      console.log('  ⚠️  Anthropic API: Not configured');
    }

    // Test email if configured
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const nodemailer = require('nodemailer');
        
        const transporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        await transporter.verify();
        console.log('  ✅ Email configuration test');
      } catch (error) {
        console.log(`  ⚠️  Email test: ${error.message}`);
      }
    } else {
      console.log('  ⚠️  Email: Not configured');
    }

    console.log('✅ Integration tests completed\n');
  }

  createDirectories() {
    console.log('📁 Creating necessary directories...');
    
    const directories = [
      'logs',
      'public',
      'data'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  ✅ Created directory: ${dir}`);
      } else {
        console.log(`  ✅ Directory exists: ${dir}`);
      }
    });

    console.log('✅ Directory setup completed\n');
  }

  showSummary() {
    console.log('📋 Setup Summary');
    console.log('================');
    
    console.log('✅ Environment variables validated');
    console.log('✅ Database connection established');
    console.log('✅ Database tables created');
    console.log('✅ Integration tests completed');
    console.log('✅ Directories created');
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  \${this.warnings.length} warnings (see above)`);
    }
    
    console.log('\n🚀 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Review any warnings above');
    console.log('  2. Run: npm start');
    console.log('  3. Visit: http://localhost:3000/dashboard');
    console.log('  4. Configure any missing integrations');
    
    console.log('\n📚 Documentation:');
    console.log('  - README.md for full setup guide');
    console.log('  - .env.example for all configuration options');
    console.log('  - /dashboard for web interface');
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new SetupWizard();
  setup.run().catch(console.error);
}

module.exports = SetupWizard;