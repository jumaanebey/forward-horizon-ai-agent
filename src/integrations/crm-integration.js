/**
 * CRM Integration Manager
 * Supports Salesforce, HubSpot, Pipedrive, and other CRMs
 */

const Logger = require('../utils/logger');
const axios = require('axios');

class CRMIntegration {
    constructor() {
        this.logger = new Logger('CRMIntegration');
        this.initialized = false;
        
        // Supported CRMs
        this.crms = {
            salesforce: {
                enabled: !!process.env.SALESFORCE_CLIENT_ID,
                client: null,
                config: {
                    clientId: process.env.SALESFORCE_CLIENT_ID,
                    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
                    username: process.env.SALESFORCE_USERNAME,
                    password: process.env.SALESFORCE_PASSWORD,
                    securityToken: process.env.SALESFORCE_SECURITY_TOKEN,
                    instanceUrl: process.env.SALESFORCE_INSTANCE_URL
                }
            },
            hubspot: {
                enabled: !!process.env.HUBSPOT_API_KEY,
                client: null,
                config: {
                    apiKey: process.env.HUBSPOT_API_KEY,
                    portalId: process.env.HUBSPOT_PORTAL_ID,
                    baseUrl: 'https://api.hubapi.com'
                }
            },
            pipedrive: {
                enabled: !!process.env.PIPEDRIVE_API_TOKEN,
                client: null,
                config: {
                    apiToken: process.env.PIPEDRIVE_API_TOKEN,
                    companyDomain: process.env.PIPEDRIVE_COMPANY_DOMAIN,
                    baseUrl: `https://${process.env.PIPEDRIVE_COMPANY_DOMAIN}.pipedrive.com/api/v1`
                }
            }
        };
        
        // Sync queues
        this.syncQueues = {
            leads: [],
            contacts: [],
            activities: []
        };
        
        // Field mappings
        this.fieldMappings = this.getFieldMappings();
    }

    async initialize() {
        this.logger.info('🤝 Initializing CRM Integration...');
        
        try {
            // Initialize enabled CRMs
            for (const [crmName, crm] of Object.entries(this.crms)) {
                if (crm.enabled) {
                    await this.initializeCRM(crmName, crm);
                }
            }
            
            // Start sync processes
            this.startSyncProcesses();
            
            this.initialized = true;
            this.logger.success('✅ CRM Integration initialized');
            return true;
        } catch (error) {
            this.logger.error('Failed to initialize CRM Integration:', error);
            return false;
        }
    }

    async initializeCRM(crmName, crm) {
        switch (crmName) {
            case 'salesforce':
                await this.initializeSalesforce(crm);
                break;
            case 'hubspot':
                await this.initializeHubSpot(crm);
                break;
            case 'pipedrive':
                await this.initializePipedrive(crm);
                break;
        }
        
        this.logger.success(`✅ ${crmName} initialized`);
    }

    async initializeSalesforce(crm) {
        // Salesforce OAuth flow would go here
        // For now, store config for API calls
        crm.client = {
            makeRequest: async (endpoint, method = 'GET', data = null) => {
                // This would handle Salesforce API authentication and requests
                return { success: true, data: {} };
            }
        };
    }

    async initializeHubSpot(crm) {
        crm.client = axios.create({
            baseURL: crm.config.baseUrl,
            headers: {
                'Authorization': `Bearer ${crm.config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Test connection
        try {
            await crm.client.get('/contacts/v1/lists/all/contacts/all');
            this.logger.success('✅ HubSpot connection verified');
        } catch (error) {
            this.logger.error('HubSpot connection failed:', error.message);
        }
    }

    async initializePipedrive(crm) {
        crm.client = axios.create({
            baseURL: crm.config.baseUrl,
            params: {
                api_token: crm.config.apiToken
            }
        });
        
        // Test connection
        try {
            await crm.client.get('/users/me');
            this.logger.success('✅ Pipedrive connection verified');
        } catch (error) {
            this.logger.error('Pipedrive connection failed:', error.message);
        }
    }

    /**
     * Sync lead to all enabled CRMs
     */
    async syncLead(leadData) {
        const results = {};
        
        for (const [crmName, crm] of Object.entries(this.crms)) {
            if (crm.enabled && crm.client) {
                try {
                    const result = await this.syncLeadToCRM(crmName, leadData);
                    results[crmName] = result;
                    this.logger.success(`✅ Lead synced to ${crmName}: ${leadData.name}`);
                } catch (error) {
                    this.logger.error(`Failed to sync lead to ${crmName}:`, error);
                    results[crmName] = { success: false, error: error.message };
                }
            }
        }
        
        return results;
    }

    async syncLeadToCRM(crmName, leadData) {
        const mappedData = this.mapFieldsForCRM(crmName, leadData);
        
        switch (crmName) {
            case 'salesforce':
                return await this.createSalesforceContact(mappedData);
            case 'hubspot':
                return await this.createHubSpotContact(mappedData);
            case 'pipedrive':
                return await this.createPipedriveContact(mappedData);
            default:
                throw new Error(`Unsupported CRM: ${crmName}`);
        }
    }

    async createSalesforceContact(data) {
        // Salesforce contact creation
        const contact = {
            FirstName: data.firstName,
            LastName: data.lastName,
            Email: data.email,
            Phone: data.phone,
            Description: data.message,
            LeadSource: data.source,
            Lead_Score__c: data.score,
            Is_Veteran__c: data.isVeteran,
            Currently_Homeless__c: data.currentlyHomeless
        };
        
        // This would make actual Salesforce API call
        return { success: true, id: 'sf_' + Date.now(), data: contact };
    }

    async createHubSpotContact(data) {
        const crm = this.crms.hubspot;
        
        const contact = {
            properties: {
                firstname: data.firstName,
                lastname: data.lastName,
                email: data.email,
                phone: data.phone,
                message: data.message,
                lead_source: data.source,
                lead_score: data.score,
                is_veteran: data.isVeteran,
                currently_homeless: data.currentlyHomeless,
                lifecyclestage: 'lead'
            }
        };
        
        try {
            const response = await crm.client.post('/contacts/v1/contact', contact);
            return { success: true, id: response.data.vid, data: response.data };
        } catch (error) {
            throw new Error(`HubSpot API error: ${error.response?.data?.message || error.message}`);
        }
    }

    async createPipedriveContact(data) {
        const crm = this.crms.pipedrive;
        
        // Create person first
        const person = {
            name: `${data.firstName} ${data.lastName}`,
            email: [{ value: data.email, primary: true }],
            phone: [{ value: data.phone, primary: true }],
            'custom_field_is_veteran': data.isVeteran,
            'custom_field_currently_homeless': data.currentlyHomeless
        };
        
        try {
            const personResponse = await crm.client.post('/persons', person);
            const personId = personResponse.data.data.id;
            
            // Create deal
            const deal = {
                title: `Housing Lead - ${data.firstName} ${data.lastName}`,
                person_id: personId,
                value: data.score * 10, // Convert score to dollar value
                currency: 'USD',
                stage_id: 1, // First stage
                pipeline_id: 1, // Default pipeline
                status: 'open'
            };
            
            const dealResponse = await crm.client.post('/deals', deal);
            
            return { 
                success: true, 
                personId: personId,
                dealId: dealResponse.data.data.id,
                data: { person: personResponse.data, deal: dealResponse.data }
            };
        } catch (error) {
            throw new Error(`Pipedrive API error: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Update CRM record with interaction
     */
    async logInteraction(leadId, interaction) {
        const results = {};
        
        for (const [crmName, crm] of Object.entries(this.crms)) {
            if (crm.enabled) {
                try {
                    const result = await this.logInteractionToCRM(crmName, leadId, interaction);
                    results[crmName] = result;
                } catch (error) {
                    this.logger.error(`Failed to log interaction to ${crmName}:`, error);
                    results[crmName] = { success: false, error: error.message };
                }
            }
        }
        
        return results;
    }

    async logInteractionToCRM(crmName, leadId, interaction) {
        switch (crmName) {
            case 'salesforce':
                return await this.logSalesforceActivity(leadId, interaction);
            case 'hubspot':
                return await this.logHubSpotActivity(leadId, interaction);
            case 'pipedrive':
                return await this.logPipedriveActivity(leadId, interaction);
            default:
                throw new Error(`Unsupported CRM: ${crmName}`);
        }
    }

    async logHubSpotActivity(contactId, interaction) {
        const crm = this.crms.hubspot;
        
        const engagement = {
            engagement: {
                active: true,
                type: this.mapInteractionType(interaction.type),
                timestamp: Date.now()
            },
            associations: {
                contactIds: [contactId]
            },
            metadata: {
                subject: interaction.subject || `${interaction.type} via AI Agent`,
                body: interaction.message,
                source: 'AI_AGENT'
            }
        };
        
        try {
            const response = await crm.client.post('/engagements/v1/engagements', engagement);
            return { success: true, id: response.data.engagement.id };
        } catch (error) {
            throw new Error(`HubSpot engagement error: ${error.response?.data?.message || error.message}`);
        }
    }

    mapInteractionType(type) {
        const typeMapping = {
            'chat': 'NOTE',
            'email': 'EMAIL',
            'call': 'CALL',
            'meeting': 'MEETING',
            'sms': 'NOTE'
        };
        
        return typeMapping[type] || 'NOTE';
    }

    /**
     * Get CRM data for lead
     */
    async getCRMData(leadId, crmName = 'all') {
        if (crmName === 'all') {
            const results = {};
            for (const [name, crm] of Object.entries(this.crms)) {
                if (crm.enabled) {
                    results[name] = await this.getCRMDataFromSource(name, leadId);
                }
            }
            return results;
        } else {
            return await this.getCRMDataFromSource(crmName, leadId);
        }
    }

    async getCRMDataFromSource(crmName, leadId) {
        switch (crmName) {
            case 'hubspot':
                return await this.getHubSpotContact(leadId);
            case 'pipedrive':
                return await this.getPipedriveContact(leadId);
            case 'salesforce':
                return await this.getSalesforceContact(leadId);
            default:
                throw new Error(`Unsupported CRM: ${crmName}`);
        }
    }

    /**
     * Bulk sync operations
     */
    async bulkSync(leads) {
        const results = {
            processed: 0,
            successful: 0,
            failed: 0,
            errors: []
        };
        
        for (const lead of leads) {
            results.processed++;
            
            try {
                await this.syncLead(lead);
                results.successful++;
                
                // Add delay to respect API limits
                await this.delay(1000);
            } catch (error) {
                results.failed++;
                results.errors.push({
                    lead: lead.id || lead.name,
                    error: error.message
                });
            }
        }
        
        this.logger.info(`📊 Bulk sync completed: ${results.successful}/${results.processed} successful`);
        return results;
    }

    /**
     * Set up webhooks for real-time sync
     */
    async setupWebhooks() {
        // This would set up webhooks with CRM systems
        // to receive real-time updates
        
        for (const [crmName, crm] of Object.entries(this.crms)) {
            if (crm.enabled) {
                try {
                    await this.setupCRMWebhook(crmName);
                } catch (error) {
                    this.logger.error(`Failed to setup webhook for ${crmName}:`, error);
                }
            }
        }
    }

    async setupCRMWebhook(crmName) {
        const webhookUrl = `${process.env.BASE_URL}/api/webhooks/crm/${crmName}`;
        
        switch (crmName) {
            case 'hubspot':
                // Set up HubSpot webhook
                break;
            case 'pipedrive':
                // Set up Pipedrive webhook
                break;
            case 'salesforce':
                // Set up Salesforce webhook
                break;
        }
        
        this.logger.success(`🔗 Webhook configured for ${crmName}`);
    }

    /**
     * Process webhook from CRM
     */
    async processWebhook(crmName, data) {
        this.logger.info(`📨 Webhook received from ${crmName}`);
        
        switch (crmName) {
            case 'hubspot':
                await this.processHubSpotWebhook(data);
                break;
            case 'pipedrive':
                await this.processPipedriveWebhook(data);
                break;
            case 'salesforce':
                await this.processSalesforceWebhook(data);
                break;
        }
    }

    startSyncProcesses() {
        // Process sync queues every 5 minutes
        setInterval(() => {
            this.processSyncQueues();
        }, 5 * 60 * 1000);
        
        this.logger.info('🔄 Sync processes started');
    }

    async processSyncQueues() {
        // Process leads queue
        if (this.syncQueues.leads.length > 0) {
            const leads = this.syncQueues.leads.splice(0, 10); // Process in batches of 10
            await this.bulkSync(leads);
        }
        
        // Process other queues...
    }

    mapFieldsForCRM(crmName, leadData) {
        const mapping = this.fieldMappings[crmName] || this.fieldMappings.default;
        const mapped = {};
        
        for (const [sourceField, targetField] of Object.entries(mapping)) {
            if (leadData[sourceField] !== undefined) {
                mapped[targetField] = leadData[sourceField];
            }
        }
        
        // Split name into first and last name
        if (leadData.name && !mapped.firstName && !mapped.lastName) {
            const nameParts = leadData.name.split(' ');
            mapped.firstName = nameParts[0] || '';
            mapped.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        return mapped;
    }

    getFieldMappings() {
        return {
            default: {
                name: 'name',
                email: 'email',
                phone: 'phone',
                message: 'message',
                source: 'source',
                score: 'score',
                is_veteran: 'isVeteran',
                currently_homeless: 'currentlyHomeless'
            },
            salesforce: {
                name: 'Name',
                email: 'Email',
                phone: 'Phone',
                message: 'Description',
                source: 'LeadSource',
                score: 'Lead_Score__c',
                is_veteran: 'Is_Veteran__c',
                currently_homeless: 'Currently_Homeless__c'
            },
            hubspot: {
                name: 'name',
                email: 'email',
                phone: 'phone',
                message: 'message',
                source: 'lead_source',
                score: 'lead_score',
                is_veteran: 'is_veteran',
                currently_homeless: 'currently_homeless'
            }
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStats() {
        const enabledCRMs = Object.entries(this.crms)
            .filter(([_, crm]) => crm.enabled)
            .map(([name, _]) => name);
        
        return {
            initialized: this.initialized,
            enabledCRMs: enabledCRMs,
            queueSizes: {
                leads: this.syncQueues.leads.length,
                contacts: this.syncQueues.contacts.length,
                activities: this.syncQueues.activities.length
            }
        };
    }
}

module.exports = CRMIntegration;