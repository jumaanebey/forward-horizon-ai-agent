/**
 * SMS & WhatsApp Integration Manager
 * Handles Twilio SMS and WhatsApp Business API
 */

const twilio = require('twilio');
const Logger = require('../utils/logger');

class SMSManager {
    constructor() {
        this.logger = new Logger('SMSManager');
        this.client = null;
        this.initialized = false;
        
        // Twilio configuration
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
        this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
        
        // Rate limiting
        this.dailySMSCount = 0;
        this.maxDailySMS = parseInt(process.env.MAX_DAILY_SMS) || 100;
        this.lastReset = new Date();
    }

    async initialize() {
        this.logger.info('📱 Initializing SMS & WhatsApp Manager...');
        
        try {
            if (!this.accountSid || !this.authToken) {
                this.logger.warn('⚠️ Twilio credentials not configured - SMS disabled');
                return false;
            }
            
            // Initialize Twilio client
            this.client = twilio(this.accountSid, this.authToken);
            
            // Verify phone numbers
            await this.verifyPhoneNumbers();
            
            this.initialized = true;
            this.logger.success('✅ SMS & WhatsApp Manager initialized');
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize SMS Manager:', error);
            return false;
        }
    }

    async verifyPhoneNumbers() {
        try {
            if (this.phoneNumber) {
                const number = await this.client.lookups.v1
                    .phoneNumbers(this.phoneNumber)
                    .fetch();
                this.logger.info(`✅ SMS number verified: ${number.phoneNumber}`);
            }
            
            if (this.whatsappNumber) {
                this.logger.info(`✅ WhatsApp number configured: ${this.whatsappNumber}`);
            }
        } catch (error) {
            this.logger.error('Phone number verification failed:', error);
            throw error;
        }
    }

    /**
     * Send SMS message
     */
    async sendSMS(to, message, options = {}) {
        if (!this.initialized) {
            this.logger.warn('SMS Manager not initialized');
            return { success: false, error: 'SMS not configured' };
        }

        // Check rate limit
        if (!this.checkRateLimit()) {
            return { success: false, error: 'Daily SMS limit reached' };
        }

        try {
            const result = await this.client.messages.create({
                body: message,
                to: to,
                from: this.phoneNumber,
                statusCallback: options.statusCallback,
                ...(options.mediaUrl && { mediaUrl: options.mediaUrl })
            });

            this.incrementCounter();
            
            this.logger.success(`📤 SMS sent to ${to}: ${result.sid}`);
            
            // Store in memory for tracking
            await this.logSMS({
                sid: result.sid,
                to: to,
                message: message,
                status: result.status,
                type: 'sms',
                timestamp: new Date()
            });

            return {
                success: true,
                messageId: result.sid,
                status: result.status
            };
        } catch (error) {
            this.logger.error(`Failed to send SMS to ${to}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send WhatsApp message
     */
    async sendWhatsApp(to, message, options = {}) {
        if (!this.initialized || !this.whatsappNumber) {
            this.logger.warn('WhatsApp not configured');
            return { success: false, error: 'WhatsApp not configured' };
        }

        try {
            // Format number for WhatsApp
            const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
            
            const result = await this.client.messages.create({
                body: message,
                to: whatsappTo,
                from: `whatsapp:${this.whatsappNumber}`,
                ...(options.mediaUrl && { mediaUrl: options.mediaUrl })
            });

            this.logger.success(`📱 WhatsApp sent to ${to}: ${result.sid}`);
            
            await this.logSMS({
                sid: result.sid,
                to: to,
                message: message,
                status: result.status,
                type: 'whatsapp',
                timestamp: new Date()
            });

            return {
                success: true,
                messageId: result.sid,
                status: result.status
            };
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp to ${to}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send automated lead notification
     */
    async sendLeadNotification(lead) {
        const message = `🏠 New Forward Horizon Lead!\n\nName: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone || 'Not provided'}\n${lead.is_veteran ? '🎖️ Veteran' : ''}\n\nMessage: ${lead.message || 'No message'}\n\nReply STOP to unsubscribe.`;
        
        // Send to business owner
        const businessPhone = process.env.BUSINESS_OWNER_PHONE;
        if (businessPhone) {
            await this.sendSMS(businessPhone, message);
        }
        
        // Send welcome to lead if phone provided
        if (lead.phone) {
            const welcomeMsg = `Welcome to Forward Horizon, ${lead.name}! 🏠\n\nThank you for your interest in our transitional housing. We'll be in touch shortly.\n\nFor immediate assistance, call (310) 488-5280.\n\nReply STOP to unsubscribe.`;
            
            await this.sendSMS(lead.phone, welcomeMsg);
        }
    }

    /**
     * Handle incoming SMS/WhatsApp
     */
    async handleIncomingMessage(from, body, type = 'sms') {
        this.logger.info(`📨 Incoming ${type} from ${from}: ${body}`);
        
        // Check for opt-out
        if (body.toLowerCase().includes('stop')) {
            await this.handleOptOut(from);
            return;
        }
        
        // Process with AI
        const response = await this.processWithAI(body, from);
        
        // Send response
        if (type === 'whatsapp') {
            await this.sendWhatsApp(from, response);
        } else {
            await this.sendSMS(from, response);
        }
    }

    async processWithAI(message, from) {
        // This would integrate with your AI core
        // For now, return a default response
        return `Thank you for contacting Forward Horizon! We've received your message and will respond shortly. For immediate assistance, call (310) 488-5280.`;
    }

    async handleOptOut(phoneNumber) {
        // Add to opt-out list
        this.logger.info(`❌ ${phoneNumber} opted out`);
        // Store in database
        return await this.sendSMS(phoneNumber, 'You have been unsubscribed from Forward Horizon messages. Reply START to resubscribe.');
    }

    /**
     * Send bulk SMS campaign
     */
    async sendBulkSMS(recipients, message, options = {}) {
        const results = {
            sent: 0,
            failed: 0,
            errors: []
        };
        
        for (const recipient of recipients) {
            // Add delay to avoid rate limiting
            await this.delay(1000);
            
            const result = await this.sendSMS(recipient.phone, message, options);
            
            if (result.success) {
                results.sent++;
            } else {
                results.failed++;
                results.errors.push({
                    recipient: recipient,
                    error: result.error
                });
            }
        }
        
        return results;
    }

    /**
     * Schedule SMS for later
     */
    async scheduleSMS(to, message, sendAt) {
        const delay = new Date(sendAt) - new Date();
        
        if (delay <= 0) {
            return await this.sendSMS(to, message);
        }
        
        setTimeout(async () => {
            await this.sendSMS(to, message);
        }, delay);
        
        this.logger.info(`⏰ SMS scheduled for ${sendAt}`);
        return { success: true, scheduledFor: sendAt };
    }

    /**
     * Get SMS conversation history
     */
    async getConversationHistory(phoneNumber, limit = 50) {
        if (!this.initialized) {
            return [];
        }
        
        try {
            const messages = await this.client.messages.list({
                to: phoneNumber,
                from: this.phoneNumber,
                limit: limit
            });
            
            const received = await this.client.messages.list({
                from: phoneNumber,
                to: this.phoneNumber,
                limit: limit
            });
            
            // Combine and sort by date
            const allMessages = [...messages, ...received]
                .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
            
            return allMessages.map(msg => ({
                sid: msg.sid,
                from: msg.from,
                to: msg.to,
                body: msg.body,
                status: msg.status,
                direction: msg.direction,
                timestamp: msg.dateCreated
            }));
        } catch (error) {
            this.logger.error('Failed to get conversation history:', error);
            return [];
        }
    }

    /**
     * Utility functions
     */
    checkRateLimit() {
        // Reset counter daily
        const now = new Date();
        if (now.getDate() !== this.lastReset.getDate()) {
            this.dailySMSCount = 0;
            this.lastReset = now;
        }
        
        return this.dailySMSCount < this.maxDailySMS;
    }

    incrementCounter() {
        this.dailySMSCount++;
    }

    async logSMS(data) {
        // This would store in your database
        // For now, just log
        this.logger.info('SMS logged:', data);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStats() {
        return {
            initialized: this.initialized,
            dailySMSCount: this.dailySMSCount,
            maxDailySMS: this.maxDailySMS,
            hasWhatsApp: !!this.whatsappNumber
        };
    }
}

module.exports = SMSManager;