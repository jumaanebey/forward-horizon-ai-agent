#!/usr/bin/env node

/**
 * Test Nurturing Campaign System
 * Demonstrates world-class email nurturing and lead scoring
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const EnhancedEmailManager = require('../src/email/enhanced-email-manager');
const LeadScoring = require('../src/campaigns/lead-scoring');
const NurtureCampaigns = require('../src/campaigns/nurture-campaigns');

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testNurturingSystem() {
    console.log('🚀 Testing World-Class Nurturing Campaign System\n');
    console.log('=' .repeat(60));
    
    // Initialize systems
    const emailManager = new EnhancedEmailManager(supabase);
    const scoring = new LeadScoring();
    const campaigns = new NurtureCampaigns();
    
    // Test email system
    console.log('\n📧 Testing Email System...');
    const emailInitialized = await emailManager.initialize();
    
    if (!emailInitialized) {
        console.error('❌ Email system failed to initialize');
        console.log('Please check your email credentials in .env');
        return;
    }
    
    console.log('✅ Email system ready!\n');
    
    // Create test leads with different profiles
    const testLeads = [
        {
            id: 'test-veteran-001',
            name: 'John Smith',
            email: process.env.EMAIL_USER, // Send to yourself for testing
            phone: '(555) 123-4567',
            is_veteran: true,
            currently_homeless: false,
            move_in_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days out
            created_at: new Date().toISOString(),
            tags: ['veteran', 'priority']
        },
        {
            id: 'test-recovery-001',
            name: 'Sarah Johnson',
            email: process.env.EMAIL_USER,
            phone: '(555) 234-5678',
            in_recovery: true,
            currently_homeless: true,
            created_at: new Date().toISOString(),
            tags: ['recovery', 'urgent']
        },
        {
            id: 'test-reentry-001',
            name: 'Michael Williams',
            email: process.env.EMAIL_USER,
            phone: '(555) 345-6789',
            is_reentry: true,
            employment_status: 'seeking',
            created_at: new Date().toISOString(),
            tags: ['reentry', 'employment-needed']
        }
    ];
    
    // Test interactions for scoring
    const testInteractions = {
        'test-veteran-001': [
            { type: 'email_opened', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { type: 'email_clicked', created_at: new Date(Date.now() - 1 * 60 * 60 * 1000) },
            { type: 'form_completed', created_at: new Date(Date.now() - 30 * 60 * 1000) }
        ],
        'test-recovery-001': [
            { type: 'email_opened', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        ],
        'test-reentry-001': []
    };
    
    console.log('📊 Lead Scoring Analysis:');
    console.log('-'.repeat(60));
    
    // Score each lead
    for (const lead of testLeads) {
        const interactions = testInteractions[lead.id] || [];
        const scoreResult = scoring.calculateScore(lead, interactions);
        
        console.log(`\n👤 ${lead.name}`);
        console.log(`   Profile: ${lead.tags.join(', ')}`);
        console.log(`   Score: ${scoreResult.score}/100 (Grade: ${scoreResult.grade})`);
        console.log(`   Priority: ${scoreResult.priority}`);
        console.log(`   Next Action: ${scoreResult.nextAction.description}`);
        
        console.log('\n   Score Breakdown:');
        console.log(`   - Demographic: ${scoreResult.breakdown.demographic}`);
        console.log(`   - Urgency: ${scoreResult.breakdown.urgency}`);
        console.log(`   - Engagement: ${scoreResult.breakdown.engagement}`);
        console.log(`   - Behavioral: ${scoreResult.breakdown.behavioral}`);
        
        console.log('\n   Recommendations:');
        scoreResult.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📬 Email Campaign Templates:');
    console.log('-'.repeat(60));
    
    // Show campaign sequences
    const campaignTypes = ['veteran', 'recovery', 'reentry'];
    
    for (const type of campaignTypes) {
        const campaign = campaigns.campaigns[type];
        console.log(`\n🎯 ${campaign.name}`);
        console.log(`   ${campaign.description}`);
        console.log(`   Score Boost: +${campaign.scoring_boost} points`);
        console.log('\n   Email Sequence:');
        
        campaign.sequences.slice(0, 5).forEach(seq => {
            console.log(`   Day ${seq.day.toString().padStart(2, '0')} | ${seq.subject}`);
            console.log(`           Priority: ${seq.priority} | Send at: ${seq.hour}:00`);
        });
        
        console.log(`   ... and ${campaign.sequences.length - 5} more emails in sequence`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n💌 Sending Test Emails:');
    console.log('-'.repeat(60));
    
    // Send a sample email from each campaign
    console.log('\n⚠️  Note: Sending 3 test emails to:', process.env.EMAIL_USER ? '[CONFIGURED EMAIL]' : '[EMAIL NOT SET]');
    console.log('Check your inbox to see the campaign templates!\n');
    
    for (let i = 0; i < Math.min(3, testLeads.length); i++) {
        const lead = testLeads[i];
        const campaignType = emailManager.determineCampaignType(lead);
        const campaign = campaigns.campaigns[campaignType];
        const firstEmail = campaign.sequences[0];
        
        console.log(`\n📨 Sending ${campaignType} welcome email to ${lead.name}...`);
        
        const template = campaigns.getEmailTemplate(firstEmail.template, lead);
        
        if (!template || !template.html) {
            console.log(`   ⚠️  Template not fully implemented: ${firstEmail.template}`);
            
            // Send with default template
            const result = await emailManager.sendEmail({
                to: lead.email,
                subject: firstEmail.subject.replace('{name}', lead.name),
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Welcome ${lead.name}!</h2>
                        <p>This is a test email from the ${campaignType} nurturing campaign.</p>
                        <p>Campaign: ${campaign.name}</p>
                        <p>Your lead score: ${scoring.calculateScore(lead, testInteractions[lead.id] || []).score}/100</p>
                        <hr>
                        <p>Forward Horizon AI Agent - Nurturing Campaign Test</p>
                    </div>
                `,
                text: `Welcome ${lead.name}! This is a test from the ${campaignType} campaign.`,
                trackingId: `test-${lead.id}`,
                campaignId: campaignType,
                leadId: lead.id
            });
            
            if (result.success) {
                console.log(`   ✅ Email sent successfully!`);
            } else {
                console.log(`   ❌ Failed: ${result.error}`);
            }
        } else {
            const result = await emailManager.sendEmail({
                to: lead.email,
                subject: template.subject,
                html: template.html,
                text: template.text,
                trackingId: `test-${lead.id}`,
                campaignId: campaignType,
                leadId: lead.id
            });
            
            if (result.success) {
                console.log(`   ✅ Email sent successfully!`);
                console.log(`   Subject: "${template.subject}"`);
            } else {
                console.log(`   ❌ Failed: ${result.error}`);
            }
        }
        
        // Wait between emails
        await delay(2000);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 System Statistics:');
    console.log('-'.repeat(60));
    
    const stats = emailManager.getStats();
    console.log('\nEmail System Stats:');
    console.log(`  Emails Sent: ${stats.sent}`);
    console.log(`  Emails Failed: ${stats.failed}`);
    console.log(`  Daily Limit: ${stats.daily_limit}`);
    console.log(`  Remaining Today: ${stats.remaining_today}`);
    console.log(`  Hourly Limit: ${stats.hourly_limit}`);
    console.log(`  Remaining This Hour: ${stats.remaining_hour}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Nurturing System Features:');
    console.log('-'.repeat(60));
    console.log(`
• 🎯 Smart Lead Scoring (0-100 scale)
• 📧 Multi-touch Email Sequences (9-10 emails per campaign)
• 🏆 Specialized Campaigns (Veteran, Recovery, Reentry)
• ⏰ Time-based Automation (Day/Hour specific sending)
• 📊 Engagement Tracking (Opens, Clicks, Responses)
• 🚀 Priority-based Processing (Hot leads first)
• 💡 AI-powered Recommendations
• 🔄 Automatic Status Updates
• 📈 Performance Analytics
• 🛡️ Rate Limiting & Compliance
    `);
    
    console.log('=' .repeat(60));
    console.log('\n🎉 World-Class Nurturing System Test Complete!');
    console.log('\nYour AI agent is now equipped with:');
    console.log('- Professional email campaigns for all lead types');
    console.log('- Intelligent lead scoring and prioritization');
    console.log('- Automated follow-up sequences');
    console.log('- Full engagement tracking and analytics');
    console.log('\n✅ Ready to nurture and convert live leads!\n');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the test
testNurturingSystem().catch(console.error);