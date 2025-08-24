/**
 * Enhanced Email Manager with Nurturing Campaigns
 * Integrates world-class email campaigns with lead scoring
 */

const nodemailer = require('nodemailer');
const Logger = require('../utils/logger');
const NurtureCampaigns = require('../campaigns/nurture-campaigns');
const LeadScoring = require('../campaigns/lead-scoring');

class EnhancedEmailManager {
    constructor(supabase) {
        this.logger = new Logger('EnhancedEmail');
        this.supabase = supabase;
        this.transporter = null;
        this.initialized = false;
        
        // Campaign and scoring systems
        this.campaigns = new NurtureCampaigns();
        this.scoring = new LeadScoring();
        
        // Email statistics
        this.stats = {
            sent: 0,
            failed: 0,
            opened: 0,
            clicked: 0,
            daily_sent: 0,
            last_reset: new Date().toDateString()
        };
        
        // Rate limiting
        this.maxDailyEmails = parseInt(process.env.MAX_DAILY_EMAILS) || 50;
        this.maxHourlyEmails = 10;
        this.hourlyCount = 0;
        this.lastHourReset = new Date().getHours();
        
        // Business info
        this.businessInfo = {
            name: process.env.BUSINESS_NAME || 'Forward Horizon',
            phone: process.env.BUSINESS_PHONE || '(310) 488-5280',
            email: process.env.BUSINESS_EMAIL || 'theforwardhorizon@gmail.com',
            website: process.env.BUSINESS_WEBSITE || 'https://theforwardhorizon.com'
        };
    }

    async initialize() {
        this.logger.info('📧 Initializing Enhanced Email Manager...');
        
        try {
            // Clear any cached nodemailer module
            delete require.cache[require.resolve('nodemailer')];
            const nodemailer = require('nodemailer');
            
            // Create transporter with proper configuration
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify connection
            await this.transporter.verify();
            
            this.initialized = true;
            this.logger.info('✅ Enhanced Email Manager initialized successfully');
            
            // Start campaign processor
            this.startCampaignProcessor();
            
            return true;
        } catch (error) {
            this.logger.error('❌ Failed to initialize email manager:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * Process and send nurturing campaigns
     */
    async startCampaignProcessor() {
        // Process campaigns every 30 minutes
        setInterval(async () => {
            await this.processCampaigns();
        }, 30 * 60 * 1000);
        
        // Process immediately on start
        setTimeout(() => this.processCampaigns(), 5000);
    }

    /**
     * Process all active campaigns
     */
    async processCampaigns() {
        if (!this.initialized) return;
        
        this.logger.info('🔄 Processing email campaigns...');
        
        try {
            // Get all leads with active campaigns
            const { data: leads, error } = await this.supabase
                .from('leads')
                .select(`
                    *,
                    lead_interactions (*)
                `)
                .in('status', ['new', 'contacted', 'nurturing'])
                .not('opted_out', 'eq', true);
            
            if (error) {
                this.logger.error('Failed to fetch leads:', error);
                return;
            }
            
            if (!leads || leads.length === 0) {
                this.logger.info('No leads to process');
                return;
            }
            
            // Score and prioritize leads
            const scoredLeads = await this.scoreAndPrioritizeLeads(leads);
            
            // Process each lead
            for (const lead of scoredLeads) {
                await this.processLeadCampaign(lead);
                
                // Rate limiting - wait between emails
                await this.delay(2000);
            }
            
            this.logger.info(`✅ Processed ${scoredLeads.length} leads`);
            
        } catch (error) {
            this.logger.error('Campaign processing error:', error);
        }
    }

    /**
     * Score and prioritize leads
     */
    async scoreAndPrioritizeLeads(leads) {
        const scoredLeads = [];
        
        for (const lead of leads) {
            const interactions = lead.lead_interactions || [];
            const scoreResult = this.scoring.calculateScore(lead, interactions);
            
            scoredLeads.push({
                ...lead,
                score: scoreResult.score,
                grade: scoreResult.grade,
                priority: scoreResult.priority,
                nextAction: scoreResult.nextAction
            });
        }
        
        // Sort by priority (highest score first)
        return scoredLeads.sort((a, b) => b.score - a.score);
    }

    /**
     * Process campaign for individual lead
     */
    async processLeadCampaign(lead) {
        try {
            // Determine campaign type
            const campaignType = this.determineCampaignType(lead);
            const campaign = this.campaigns.campaigns[campaignType];
            
            if (!campaign) {
                this.logger.warn(`No campaign found for type: ${campaignType}`);
                return;
            }
            
            // Calculate days since lead creation
            const daysSinceCreation = this.getDaysSince(lead.created_at);
            
            // Find the next email to send
            const nextEmail = this.findNextEmail(campaign, lead, daysSinceCreation);
            
            if (!nextEmail) {
                this.logger.info(`No email due for lead ${lead.id}`);
                return;
            }
            
            // Check if we should send based on priority
            if (!this.shouldSendEmail(lead, nextEmail)) {
                this.logger.info(`Skipping email for lead ${lead.id} - priority/timing check`);
                return;
            }
            
            // Get email template
            const template = this.campaigns.getEmailTemplate(nextEmail.template, lead);
            
            // Send the email
            const result = await this.sendEmail({
                to: lead.email,
                subject: this.personalizeSubject(template.subject, lead),
                html: template.html,
                text: template.text
            });
            
            if (result.success) {
                // Record the interaction
                await this.recordEmailInteraction(lead.id, nextEmail, result);
                
                // Update lead status if needed
                await this.updateLeadStatus(lead, nextEmail);
                
                this.logger.info(`✅ Sent ${nextEmail.template} to ${lead.email}`);
            } else {
                this.logger.error(`Failed to send email to ${lead.email}:`, result.error);
            }
            
        } catch (error) {
            this.logger.error(`Error processing campaign for lead ${lead.id}:`, error);
        }
    }

    /**
     * Determine which campaign type to use
     */
    determineCampaignType(lead) {
        if (lead.is_veteran || lead.tags?.includes('veteran')) {
            return 'veteran';
        }
        if (lead.in_recovery || lead.tags?.includes('recovery')) {
            return 'recovery';
        }
        if (lead.is_reentry || lead.tags?.includes('reentry')) {
            return 'reentry';
        }
        return 'general';
    }

    /**
     * Find the next email to send in the sequence
     */
    findNextEmail(campaign, lead, daysSinceCreation) {
        const sentEmails = lead.lead_interactions?.filter(i => 
            i.interaction_type === 'email_sent'
        ) || [];
        
        // Find emails that are due and haven't been sent
        for (const sequence of campaign.sequences) {
            if (daysSinceCreation >= sequence.day) {
                // Check if this email has already been sent
                const alreadySent = sentEmails.some(e => 
                    e.interaction_data?.template === sequence.template
                );
                
                if (!alreadySent) {
                    // Check if it's the right time of day
                    const currentHour = new Date().getHours();
                    if (Math.abs(currentHour - sequence.hour) <= 2) {
                        return sequence;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Check if we should send email based on priority and limits
     */
    shouldSendEmail(lead, email) {
        // Check daily limit
        if (!this.checkDailyLimit()) {
            return false;
        }
        
        // Check hourly limit
        if (!this.checkHourlyLimit()) {
            return false;
        }
        
        // High priority emails always send
        if (email.priority === 'high' || lead.priority === 'URGENT') {
            return true;
        }
        
        // Medium priority sends during business hours
        if (email.priority === 'medium') {
            const hour = new Date().getHours();
            return hour >= 9 && hour <= 17;
        }
        
        // Low priority only if we have capacity
        return this.stats.daily_sent < this.maxDailyEmails * 0.5;
    }

    /**
     * Send email with enhanced tracking
     */
    async sendEmail(options) {
        if (!this.initialized) {
            return { success: false, error: 'Email not configured' };
        }

        if (!this.checkDailyLimit()) {
            return { success: false, error: 'Daily email limit reached' };
        }

        try {
            // Add tracking pixel for opens
            const trackingPixel = `<img src="${this.businessInfo.website}/track/open/${options.trackingId || 'default'}" width="1" height="1" style="display:none;">`;
            
            // Add tracking to links for clicks
            const trackedHtml = this.addLinkTracking(options.html, options.trackingId);
            
            const mailOptions = {
                from: process.env.EMAIL_FROM || `"${this.businessInfo.name}" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: trackedHtml + trackingPixel,
                headers: {
                    'X-Campaign-ID': options.campaignId || 'default',
                    'X-Lead-ID': options.leadId || 'unknown'
                }
            };

            const result = await this.transporter.sendMail(mailOptions);
            
            this.stats.sent++;
            this.stats.daily_sent++;
            this.hourlyCount++;
            
            return {
                success: true,
                messageId: result.messageId,
                response: result.response
            };
            
        } catch (error) {
            this.stats.failed++;
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Add click tracking to links
     */
    addLinkTracking(html, trackingId) {
        if (!html || !trackingId) return html;
        
        // Replace links with tracked versions
        return html.replace(
            /href="(https?:\/\/[^"]+)"/g,
            `href="${this.businessInfo.website}/track/click/${trackingId}?url=$1"`
        );
    }

    /**
     * Record email interaction in database
     */
    async recordEmailInteraction(leadId, email, result) {
        try {
            await this.supabase
                .from('lead_interactions')
                .insert({
                    lead_id: leadId,
                    interaction_type: 'email_sent',
                    interaction_data: {
                        template: email.template,
                        subject: email.subject,
                        priority: email.priority,
                        day: email.day,
                        messageId: result.messageId,
                        sentAt: new Date().toISOString()
                    },
                    status: 'completed',
                    completed_at: new Date().toISOString()
                });
        } catch (error) {
            this.logger.error('Failed to record email interaction:', error);
        }
    }

    /**
     * Update lead status based on campaign progress
     */
    async updateLeadStatus(lead, email) {
        try {
            // Update status based on campaign progress
            let newStatus = lead.status;
            
            if (email.day === 0) {
                newStatus = 'contacted';
            } else if (email.day >= 7) {
                newStatus = 'nurturing';
            }
            
            if (newStatus !== lead.status) {
                await this.supabase
                    .from('leads')
                    .update({ 
                        status: newStatus,
                        last_contact: new Date().toISOString()
                    })
                    .eq('id', lead.id);
            }
        } catch (error) {
            this.logger.error('Failed to update lead status:', error);
        }
    }

    /**
     * Personalize subject line
     */
    personalizeSubject(subject, lead) {
        return subject
            .replace('{name}', lead.name || 'Friend')
            .replace('{firstName}', (lead.name || '').split(' ')[0] || 'Friend');
    }

    /**
     * Check daily email limit
     */
    checkDailyLimit() {
        const today = new Date().toDateString();
        
        if (this.stats.last_reset !== today) {
            this.stats.daily_sent = 0;
            this.stats.last_reset = today;
        }
        
        return this.stats.daily_sent < this.maxDailyEmails;
    }

    /**
     * Check hourly email limit
     */
    checkHourlyLimit() {
        const currentHour = new Date().getHours();
        
        if (this.lastHourReset !== currentHour) {
            this.hourlyCount = 0;
            this.lastHourReset = currentHour;
        }
        
        return this.hourlyCount < this.maxHourlyEmails;
    }

    // Utility methods
    getDaysSince(date) {
        const pastDate = new Date(date);
        const today = new Date();
        const diffTime = today - pastDate;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStats() {
        return {
            ...this.stats,
            daily_limit: this.maxDailyEmails,
            remaining_today: Math.max(0, this.maxDailyEmails - this.stats.daily_sent),
            hourly_limit: this.maxHourlyEmails,
            remaining_hour: Math.max(0, this.maxHourlyEmails - this.hourlyCount),
            initialized: this.initialized
        };
    }
}

module.exports = EnhancedEmailManager;