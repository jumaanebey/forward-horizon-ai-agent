/**
 * Advanced Analytics Engine
 * Real-time metrics, conversion tracking, and business intelligence
 */

const Logger = require('../utils/logger');

class AnalyticsEngine {
    constructor() {
        this.logger = new Logger('Analytics');
        this.initialized = false;
        
        // Data storage
        this.metrics = {
            leads: new Map(),
            conversations: new Map(),
            emails: new Map(),
            conversions: new Map(),
            revenue: new Map()
        };
        
        // Real-time counters
        this.counters = {
            dailyLeads: 0,
            weeklyLeads: 0,
            monthlyLeads: 0,
            totalConversations: 0,
            emailsSent: 0,
            emailsOpened: 0,
            emailsClicked: 0,
            conversions: 0,
            revenue: 0
        };
        
        // Performance tracking
        this.performance = {
            responseTime: [],
            errorRate: 0,
            uptime: Date.now(),
            memoryUsage: []
        };
    }

    async initialize() {
        this.logger.info('📊 Initializing Analytics Engine...');
        
        try {
            // Load historical data
            await this.loadHistoricalData();
            
            // Start real-time monitoring
            this.startRealTimeMonitoring();
            
            // Schedule periodic reports
            this.scheduleReports();
            
            this.initialized = true;
            this.logger.success('✅ Analytics Engine initialized');
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize Analytics Engine:', error);
            return false;
        }
    }

    async loadHistoricalData() {
        // Load data from database/memory system
        // For now, initialize with current state
        this.logger.info('📈 Loading historical analytics data...');
    }

    startRealTimeMonitoring() {
        // Monitor system metrics every minute
        setInterval(() => {
            this.collectSystemMetrics();
        }, 60000);
        
        // Update counters every 5 minutes
        setInterval(() => {
            this.updateCounters();
        }, 300000);
    }

    scheduleReports() {
        // Daily report at 9 AM
        const dailyReport = () => {
            const now = new Date();
            if (now.getHours() === 9 && now.getMinutes() === 0) {
                this.generateDailyReport();
            }
        };
        
        setInterval(dailyReport, 60000); // Check every minute
        
        // Weekly report on Mondays at 9 AM
        const weeklyReport = () => {
            const now = new Date();
            if (now.getDay() === 1 && now.getHours() === 9 && now.getMinutes() === 0) {
                this.generateWeeklyReport();
            }
        };
        
        setInterval(weeklyReport, 60000);
    }

    /**
     * Track lead events
     */
    trackLead(lead, event = 'created') {
        const leadId = lead.id || `lead_${Date.now()}`;
        
        if (!this.metrics.leads.has(leadId)) {
            this.metrics.leads.set(leadId, {
                id: leadId,
                events: [],
                source: lead.source,
                created: new Date(),
                value: this.calculateLeadValue(lead)
            });
        }
        
        const leadData = this.metrics.leads.get(leadId);
        leadData.events.push({
            event: event,
            timestamp: new Date(),
            data: lead
        });
        
        // Update counters
        if (event === 'created') {
            this.counters.dailyLeads++;
            this.counters.weeklyLeads++;
            this.counters.monthlyLeads++;
        }
        
        this.logger.info(`📊 Lead tracked: ${leadId} - ${event}`);
    }

    calculateLeadValue(lead) {
        let value = 100; // Base value
        
        // Increase for veterans
        if (lead.is_veteran) value += 50;
        
        // Increase for urgent cases
        if (lead.currently_homeless) value += 75;
        
        // Increase based on income level
        if (lead.income_level) {
            switch (lead.income_level) {
                case 'very_low': value += 100;
                case 'low': value += 75;
                case 'moderate': value += 50;
                default: value += 25;
            }
        }
        
        return value;
    }

    /**
     * Track conversation metrics
     */
    trackConversation(conversationId, message, response, duration) {
        if (!this.metrics.conversations.has(conversationId)) {
            this.metrics.conversations.set(conversationId, {
                id: conversationId,
                messages: [],
                totalDuration: 0,
                satisfaction: null,
                converted: false
            });
        }
        
        const conversation = this.metrics.conversations.get(conversationId);
        conversation.messages.push({
            message: message,
            response: response,
            duration: duration,
            timestamp: new Date()
        });
        
        conversation.totalDuration += duration;
        this.counters.totalConversations++;
        
        // Track performance
        this.performance.responseTime.push(duration);
        
        // Keep only last 1000 response times for memory efficiency
        if (this.performance.responseTime.length > 1000) {
            this.performance.responseTime.shift();
        }
    }

    /**
     * Track email metrics
     */
    trackEmail(emailId, event, data = {}) {
        if (!this.metrics.emails.has(emailId)) {
            this.metrics.emails.set(emailId, {
                id: emailId,
                events: [],
                recipient: data.recipient,
                subject: data.subject,
                campaign: data.campaign
            });
        }
        
        const email = this.metrics.emails.get(emailId);
        email.events.push({
            event: event,
            timestamp: new Date(),
            data: data
        });
        
        // Update counters
        switch (event) {
            case 'sent':
                this.counters.emailsSent++;
                break;
            case 'opened':
                this.counters.emailsOpened++;
                break;
            case 'clicked':
                this.counters.emailsClicked++;
                break;
        }
    }

    /**
     * Track conversion events
     */
    trackConversion(leadId, type, value = 0) {
        const conversionId = `conv_${Date.now()}`;
        
        this.metrics.conversions.set(conversionId, {
            id: conversionId,
            leadId: leadId,
            type: type, // 'application', 'tour', 'lease_signed', etc.
            value: value,
            timestamp: new Date()
        });
        
        this.counters.conversions++;
        this.counters.revenue += value;
        
        // Update lead status
        if (this.metrics.leads.has(leadId)) {
            const lead = this.metrics.leads.get(leadId);
            lead.events.push({
                event: 'converted',
                type: type,
                value: value,
                timestamp: new Date()
            });
        }
        
        this.logger.success(`💰 Conversion tracked: ${type} - $${value}`);
    }

    /**
     * Generate real-time dashboard data
     */
    getDashboardMetrics() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Calculate conversion rates
        const emailOpenRate = this.counters.emailsSent > 0 
            ? (this.counters.emailsOpened / this.counters.emailsSent) * 100 
            : 0;
        
        const emailClickRate = this.counters.emailsOpened > 0 
            ? (this.counters.emailsClicked / this.counters.emailsOpened) * 100 
            : 0;
        
        const leadConversionRate = this.counters.dailyLeads > 0 
            ? (this.counters.conversions / this.counters.dailyLeads) * 100 
            : 0;
        
        // Average response time
        const avgResponseTime = this.performance.responseTime.length > 0
            ? this.performance.responseTime.reduce((a, b) => a + b, 0) / this.performance.responseTime.length
            : 0;
        
        return {
            leads: {
                today: this.counters.dailyLeads,
                thisWeek: this.counters.weeklyLeads,
                thisMonth: this.counters.monthlyLeads,
                conversionRate: leadConversionRate
            },
            conversations: {
                total: this.counters.totalConversations,
                avgResponseTime: Math.round(avgResponseTime),
                active: this.getActiveConversations()
            },
            emails: {
                sent: this.counters.emailsSent,
                opened: this.counters.emailsOpened,
                clicked: this.counters.emailsClicked,
                openRate: Math.round(emailOpenRate),
                clickRate: Math.round(emailClickRate)
            },
            conversions: {
                total: this.counters.conversions,
                revenue: this.counters.revenue,
                avgValue: this.counters.conversions > 0 ? this.counters.revenue / this.counters.conversions : 0
            },
            performance: {
                uptime: this.getUptime(),
                errorRate: this.performance.errorRate,
                memoryUsage: this.getCurrentMemoryUsage()
            }
        };
    }

    getActiveConversations() {
        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
        
        let active = 0;
        for (let conversation of this.metrics.conversations.values()) {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            if (lastMessage && new Date(lastMessage.timestamp) > fiveMinutesAgo) {
                active++;
            }
        }
        
        return active;
    }

    getUptime() {
        const uptimeMs = Date.now() - this.performance.uptime;
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    getCurrentMemoryUsage() {
        const used = process.memoryUsage();
        return {
            rss: Math.round(used.rss / 1024 / 1024), // MB
            heapTotal: Math.round(used.heapTotal / 1024 / 1024), // MB
            heapUsed: Math.round(used.heapUsed / 1024 / 1024), // MB
            external: Math.round(used.external / 1024 / 1024) // MB
        };
    }

    /**
     * Lead source analysis
     */
    getLeadSourceAnalysis(timeframe = '30d') {
        const cutoff = this.getCutoffDate(timeframe);
        const sources = {};
        
        for (let lead of this.metrics.leads.values()) {
            if (new Date(lead.created) > cutoff) {
                const source = lead.source || 'unknown';
                if (!sources[source]) {
                    sources[source] = { count: 0, value: 0, converted: 0 };
                }
                
                sources[source].count++;
                sources[source].value += lead.value;
                
                // Check if converted
                const hasConversion = lead.events.some(event => event.event === 'converted');
                if (hasConversion) {
                    sources[source].converted++;
                }
            }
        }
        
        // Calculate ROI and conversion rates
        Object.keys(sources).forEach(source => {
            const data = sources[source];
            data.conversionRate = data.count > 0 ? (data.converted / data.count) * 100 : 0;
            data.avgValue = data.count > 0 ? data.value / data.count : 0;
        });
        
        return sources;
    }

    /**
     * Conversion funnel analysis
     */
    getConversionFunnel(timeframe = '30d') {
        const cutoff = this.getCutoffDate(timeframe);
        const funnel = {
            leads: 0,
            contacted: 0,
            interested: 0,
            toured: 0,
            applied: 0,
            approved: 0,
            leased: 0
        };
        
        for (let lead of this.metrics.leads.values()) {
            if (new Date(lead.created) > cutoff) {
                funnel.leads++;
                
                const events = lead.events.map(e => e.event);
                
                if (events.includes('contacted')) funnel.contacted++;
                if (events.includes('interested')) funnel.interested++;
                if (events.includes('tour_scheduled') || events.includes('toured')) funnel.toured++;
                if (events.includes('applied')) funnel.applied++;
                if (events.includes('approved')) funnel.approved++;
                if (events.includes('lease_signed')) funnel.leased++;
            }
        }
        
        return funnel;
    }

    /**
     * Time-based analytics
     */
    getTimeAnalysis(timeframe = '7d') {
        const cutoff = this.getCutoffDate(timeframe);
        const timeData = {};
        
        for (let lead of this.metrics.leads.values()) {
            if (new Date(lead.created) > cutoff) {
                const hour = new Date(lead.created).getHours();
                const day = new Date(lead.created).getDay(); // 0 = Sunday
                
                const key = `${day}-${hour}`;
                timeData[key] = (timeData[key] || 0) + 1;
            }
        }
        
        return timeData;
    }

    getCutoffDate(timeframe) {
        const now = new Date();
        switch (timeframe) {
            case '24h':
                return new Date(now - 24 * 60 * 60 * 1000);
            case '7d':
                return new Date(now - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now - 30 * 24 * 60 * 60 * 1000);
            case '90d':
                return new Date(now - 90 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now - 30 * 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Generate reports
     */
    async generateDailyReport() {
        const metrics = this.getDashboardMetrics();
        const report = {
            date: new Date().toDateString(),
            summary: {
                leads: metrics.leads.today,
                conversations: metrics.conversations.total,
                emails: metrics.emails.sent,
                conversions: metrics.conversions.total,
                revenue: metrics.conversions.revenue
            },
            highlights: this.generateHighlights(metrics),
            recommendations: this.generateRecommendations(metrics)
        };
        
        this.logger.info('📊 Daily report generated');
        return report;
    }

    generateHighlights(metrics) {
        const highlights = [];
        
        if (metrics.leads.today > 10) {
            highlights.push('🔥 High lead volume today - great job!');
        }
        
        if (metrics.emails.openRate > 30) {
            highlights.push('📧 Excellent email open rate performance');
        }
        
        if (metrics.conversions.total > 0) {
            highlights.push('💰 Conversions generated today!');
        }
        
        return highlights;
    }

    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.emails.openRate < 20) {
            recommendations.push('📧 Consider A/B testing email subject lines to improve open rates');
        }
        
        if (metrics.leads.conversionRate < 5) {
            recommendations.push('🎯 Focus on lead qualification to improve conversion rates');
        }
        
        if (metrics.conversations.avgResponseTime > 5000) {
            recommendations.push('⚡ Consider optimizing AI response time');
        }
        
        return recommendations;
    }

    collectSystemMetrics() {
        const memUsage = this.getCurrentMemoryUsage();
        this.performance.memoryUsage.push({
            timestamp: new Date(),
            ...memUsage
        });
        
        // Keep only last 24 hours of memory data
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        this.performance.memoryUsage = this.performance.memoryUsage.filter(
            entry => new Date(entry.timestamp) > oneDayAgo
        );
    }

    updateCounters() {
        // This would sync with database for accurate counts
        // For now, maintain in-memory counters
    }

    getStats() {
        return {
            initialized: this.initialized,
            totalLeads: this.metrics.leads.size,
            totalConversations: this.metrics.conversations.size,
            totalEmails: this.metrics.emails.size,
            totalConversions: this.metrics.conversions.size,
            counters: this.counters
        };
    }
}

module.exports = AnalyticsEngine;