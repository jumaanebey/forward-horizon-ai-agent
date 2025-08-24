/**
 * Business Logic Module
 * Handles Forward Horizon specific business operations and integrations
 */

const { createClient } = require('@supabase/supabase-js');
const Logger = require('../utils/logger');

class BusinessLogic {
  constructor() {
    this.logger = new Logger('Business');
    this.supabase = null;
    this.initialized = false;
    
    // Business configuration
    this.config = {
      autoRespond: process.env.AUTO_RESPOND_LEADS === 'true',
      followUpDelay: parseInt(process.env.FOLLOW_UP_DELAY_HOURS) || 24,
      workingHours: {
        start: parseInt(process.env.WORKING_HOURS_START) || 9,
        end: parseInt(process.env.WORKING_HOURS_END) || 17,
        timezone: process.env.TIMEZONE || 'America/Los_Angeles'
      }
    };
    
    // Business metrics
    this.metrics = {
      leads: { total: 0, new: 0, contacted: 0, converted: 0 },
      emails: { sent: 0, opened: 0, clicked: 0 },
      appointments: { scheduled: 0, completed: 0, cancelled: 0 }
    };
  }

  async initialize() {
    this.logger.info('🏢 Initializing Business Logic...');
    
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        await this.setupBusinessTables();
      }
      
      // Load initial metrics
      await this.loadMetrics();
      
      this.initialized = true;
      this.logger.info('✅ Business Logic initialized');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize business logic:', error);
      throw error;
    }
  }

  async setupBusinessTables() {
    try {
      // Ensure business-specific tables exist
      const tables = [
        {
          name: 'business_metrics',
          sql: `
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
            
            CREATE INDEX IF NOT EXISTS business_metrics_type_date_idx ON business_metrics(metric_type, date);
            CREATE INDEX IF NOT EXISTS business_metrics_name_date_idx ON business_metrics(metric_name, date);
          `
        },
        {
          name: 'lead_interactions',
          sql: `
            CREATE TABLE IF NOT EXISTS lead_interactions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              lead_id UUID REFERENCES leads(id),
              interaction_type VARCHAR(50) NOT NULL,
              interaction_data JSONB NOT NULL DEFAULT '{}',
              scheduled_at TIMESTAMPTZ,
              completed_at TIMESTAMPTZ,
              status VARCHAR(20) DEFAULT 'pending',
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS lead_interactions_lead_id_idx ON lead_interactions(lead_id);
            CREATE INDEX IF NOT EXISTS lead_interactions_type_status_idx ON lead_interactions(interaction_type, status);
          `
        }
      ];

      for (const table of tables) {
        try {
          await this.supabase.rpc('exec_sql', { sql: table.sql });
        } catch (error) {
          this.logger.warn(`Could not create ${table.name} table:`, error.message);
        }
      }
    } catch (error) {
      this.logger.warn('Business table setup warning:', error.message);
    }
  }

  /**
   * Get all leads with their latest status
   */
  async getLeads(options = {}) {
    if (!this.supabase) {
      return [];
    }

    try {
      const { limit = 50, offset = 0, status = null } = options;
      
      let query = this.supabase
        .from('leads')
        .select(`
          *,
          lead_interactions (
            id,
            interaction_type,
            status,
            scheduled_at,
            completed_at,
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Failed to get leads:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error getting leads:', error);
      return [];
    }
  }

  /**
   * Get new leads that haven't been contacted
   */
  async getNewLeads() {
    return await this.getLeads({ status: 'new' });
  }

  /**
   * Process a new incoming lead
   */
  async processNewLead(leadData) {
    if (!this.supabase) {
      throw new Error('Database not available');
    }

    try {
      // Ensure required fields
      if (!leadData.name || !leadData.email) {
        throw new Error('Name and email are required');
      }

      // Add metadata
      const lead = {
        ...leadData,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        score: this.calculateInitialScore(leadData),
        next_action: this.determineNextAction(leadData)
      };

      // Insert lead into database
      const { data, error } = await this.supabase
        .from('leads')
        .insert([lead])
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to insert lead:', error);
        throw error;
      }

      // Update metrics
      this.metrics.leads.total++;
      this.metrics.leads.new++;

      // Record initial interaction
      await this.recordInteraction(data.id, 'lead_created', {
        source: leadData.source || 'unknown',
        initial_score: lead.score
      });

      this.logger.info(`📋 New lead processed: ${lead.name} (Score: ${lead.score})`);
      return data;

    } catch (error) {
      this.logger.error('Error processing new lead:', error);
      throw error;
    }
  }

  /**
   * Calculate initial lead score based on demographics and urgency
   */
  calculateInitialScore(leadData) {
    let score = 50; // Base score

    // Demographic factors
    if (leadData.is_veteran) score += 25;
    if (leadData.in_recovery) score += 20;
    if (leadData.is_reentry) score += 18;
    
    // Urgency factors
    if (leadData.currently_homeless) score += 30;
    if (leadData.eviction_risk) score += 15;
    if (leadData.income_qualified) score += 10;
    
    // Employment status
    if (leadData.employment_status === 'employed') score += 10;
    else if (leadData.employment_status === 'seeking') score += 5;
    
    // Contact preferences
    if (leadData.phone) score += 5;
    if (leadData.preferred_contact_method) score += 3;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine next action for a new lead
   */
  determineNextAction(leadData) {
    if (leadData.currently_homeless) {
      return 'immediate_outreach';
    } else if (leadData.is_veteran || leadData.eviction_risk) {
      return 'priority_contact';
    } else {
      return 'nurture_sequence';
    }
  }

  /**
   * Determine if a lead should receive auto-response
   */
  shouldAutoRespond(lead) {
    if (!this.config.autoRespond) return false;
    if (!lead.email) return false;
    
    // Check if it's during working hours
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < this.config.workingHours.start || hour > this.config.workingHours.end) {
      return false; // Outside working hours
    }
    
    return true;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(leadId, status, metadata = {}) {
    if (!this.supabase) {
      return false;
    }

    try {
      const { data, error } = await this.supabase
        .from('leads')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update lead status:', error);
        return false;
      }

      // Record the status change as an interaction
      await this.recordInteraction(leadId, 'status_change', {
        old_status: data.status,
        new_status: status,
        ...metadata
      });

      this.logger.info(`📊 Lead ${leadId} status updated to ${status}`);
      return true;
    } catch (error) {
      this.logger.error('Error updating lead status:', error);
      return false;
    }
  }

  /**
   * Record a lead interaction
   */
  async recordInteraction(leadId, type, data = {}) {
    if (!this.supabase) {
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('lead_interactions')
        .insert([{
          lead_id: leadId,
          interaction_type: type,
          interaction_data: data,
          status: 'completed'
        }]);

      if (error) {
        this.logger.error('Failed to record interaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error recording interaction:', error);
      return false;
    }
  }

  /**
   * Schedule a follow-up for a lead
   */
  async scheduleFollowUp(lead, type = 'email', delayHours = null) {
    const delay = delayHours || this.config.followUpDelay;
    const scheduledAt = new Date();
    scheduledAt.setHours(scheduledAt.getHours() + delay);

    try {
      const followUp = {
        lead_id: lead.id,
        interaction_type: `follow_up_${type}`,
        interaction_data: {
          lead_name: lead.name,
          lead_email: lead.email,
          original_inquiry: lead.created_at,
          follow_up_type: type
        },
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending'
      };

      const { data, error } = await this.supabase
        .from('lead_interactions')
        .insert([followUp])
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to schedule follow-up:', error);
        return false;
      }

      this.logger.info(`📅 Scheduled ${type} follow-up for ${lead.name} at ${scheduledAt}`);
      return data;
    } catch (error) {
      this.logger.error('Error scheduling follow-up:', error);
      return false;
    }
  }

  /**
   * Follow up on a lead
   */
  async followUpLead(leadId) {
    try {
      const leads = await this.getLeads({ limit: 1 });
      const lead = leads.find(l => l.id === leadId);
      
      if (!lead) {
        throw new Error(`Lead ${leadId} not found`);
      }

      // This would trigger email sending, etc.
      await this.recordInteraction(leadId, 'follow_up_completed', {
        method: 'email',
        completed_at: new Date().toISOString()
      });

      // Update lead status if still new
      if (lead.status === 'new') {
        await this.updateLeadStatus(leadId, 'contacted');
      }

      this.logger.info(`✅ Completed follow-up for lead ${leadId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to follow up lead ${leadId}:`, error);
      throw error;
    }
  }

  /**
   * Generate business reports
   */
  async generateReport(type = 'daily') {
    try {
      const report = {
        type,
        period: this.getReportPeriod(type),
        generated_at: new Date().toISOString(),
        data: {}
      };

      // Get lead metrics
      const leads = await this.getLeads({ limit: 1000 });
      report.data.leads = this.analyzeLeads(leads, type);

      // Get interaction metrics
      if (this.supabase) {
        const interactions = await this.getInteractions(type);
        report.data.interactions = this.analyzeInteractions(interactions);
      }

      // Store report metrics
      await this.storeMetrics('report_generated', type, 1);

      this.logger.info(`📋 Generated ${type} business report`);
      return report;
    } catch (error) {
      this.logger.error(`Failed to generate ${type} report:`, error);
      throw error;
    }
  }

  /**
   * Get business context for AI
   */
  async getContext() {
    return {
      business: {
        name: process.env.BUSINESS_NAME || 'Forward Horizon',
        phone: process.env.BUSINESS_PHONE || '(310) 488-5280',
        email: process.env.BUSINESS_EMAIL || 'info@forwardhorizon.com',
        website: process.env.BUSINESS_WEBSITE || 'https://www.theforwardhorizon.com'
      },
      metrics: this.metrics,
      config: this.config,
      current_time: new Date().toISOString(),
      working_hours: this.isWorkingHours()
    };
  }

  // Helper methods
  async loadMetrics() {
    if (!this.supabase) {
      return;
    }

    try {
      // Load lead metrics
      const { data: leads } = await this.supabase
        .from('leads')
        .select('status');

      if (leads) {
        this.metrics.leads.total = leads.length;
        this.metrics.leads.new = leads.filter(l => l.status === 'new').length;
        this.metrics.leads.contacted = leads.filter(l => l.status === 'contacted').length;
        this.metrics.leads.converted = leads.filter(l => l.status === 'converted').length;
      }
    } catch (error) {
      this.logger.warn('Could not load metrics:', error.message);
    }
  }

  async storeMetrics(type, name, value, metadata = {}) {
    if (!this.supabase) {
      return;
    }

    try {
      await this.supabase
        .from('business_metrics')
        .insert([{
          metric_type: type,
          metric_name: name,
          metric_value: value,
          metadata
        }]);
    } catch (error) {
      this.logger.warn('Could not store metrics:', error.message);
    }
  }

  async getInteractions(period = 'daily') {
    if (!this.supabase) {
      return [];
    }

    try {
      const startDate = this.getStartDate(period);
      
      const { data, error } = await this.supabase
        .from('lead_interactions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) {
        this.logger.error('Failed to get interactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error getting interactions:', error);
      return [];
    }
  }

  analyzeLeads(leads, period) {
    const startDate = this.getStartDate(period);
    const periodLeads = leads.filter(lead => 
      new Date(lead.created_at) >= startDate
    );

    return {
      total: periodLeads.length,
      new: periodLeads.filter(l => l.status === 'new').length,
      contacted: periodLeads.filter(l => l.status === 'contacted').length,
      qualified: periodLeads.filter(l => l.status === 'qualified').length,
      converted: periodLeads.filter(l => l.status === 'converted').length,
      sources: this.groupBy(periodLeads, 'source'),
      conversion_rate: periodLeads.length > 0 ? 
        (periodLeads.filter(l => l.status === 'converted').length / periodLeads.length * 100).toFixed(1) + '%' : '0%'
    };
  }

  analyzeInteractions(interactions) {
    return {
      total: interactions.length,
      by_type: this.groupBy(interactions, 'interaction_type'),
      completed: interactions.filter(i => i.status === 'completed').length,
      pending: interactions.filter(i => i.status === 'pending').length,
      failed: interactions.filter(i => i.status === 'failed').length
    };
  }

  getStartDate(period) {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
      default:
        return new Date(now.setHours(0, 0, 0, 0));
    }
  }

  getReportPeriod(type) {
    const now = new Date();
    const today = now.toDateString();
    
    switch (type) {
      case 'daily':
        return today;
      case 'weekly':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return `${weekStart.toDateString()} - ${today}`;
      case 'monthly':
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      default:
        return today;
    }
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  isWorkingHours() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= this.config.workingHours.start && hour <= this.config.workingHours.end;
  }

  getStats() {
    return {
      metrics: this.metrics,
      config: this.config,
      initialized: this.initialized
    };
  }
}

module.exports = BusinessLogic;