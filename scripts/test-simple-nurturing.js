#!/usr/bin/env node

/**
 * Simple Nurturing Test - Core Functionality
 */

require('dotenv').config();
const LeadScoring = require('../src/campaigns/lead-scoring');
const nodemailer = require('nodemailer');

async function testNurturingCore() {
    console.log('🚀 Testing Core Nurturing Features\n');
    console.log('=' .repeat(50));
    
    // Test Lead Scoring System
    console.log('\n📊 LEAD SCORING SYSTEM TEST');
    console.log('-'.repeat(50));
    
    const scoring = new LeadScoring();
    
    // Create test leads with different profiles
    const testLeads = [
        {
            id: 1,
            name: 'John Smith',
            email: 'john@example.com',
            is_veteran: true,
            currently_homeless: false,
            employment_status: 'employed',
            created_at: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            in_recovery: true,
            currently_homeless: true,
            created_at: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Mike Davis',
            email: 'mike@example.com',
            is_reentry: true,
            eviction_risk: true,
            created_at: new Date().toISOString()
        }
    ];
    
    // Test interactions
    const interactions = {
        1: [
            { type: 'email_opened', created_at: new Date(Date.now() - 2*60*60*1000) },
            { type: 'email_clicked', created_at: new Date(Date.now() - 1*60*60*1000) }
        ],
        2: [
            { type: 'email_opened', created_at: new Date(Date.now() - 24*60*60*1000) }
        ],
        3: []
    };
    
    // Score each lead
    testLeads.forEach(lead => {
        const leadInteractions = interactions[lead.id] || [];
        const scoreResult = scoring.calculateScore(lead, leadInteractions);
        
        console.log(`\n👤 ${lead.name}`);
        console.log(`   Score: ${scoreResult.score}/100 (${scoreResult.grade})`);
        console.log(`   Priority: ${scoreResult.priority}`);
        console.log(`   Next Action: ${scoreResult.nextAction.description}`);
        
        if (scoreResult.recommendations.length > 0) {
            console.log(`   Top Recommendation: ${scoreResult.recommendations[0]}`);
        }
    });
    
    // Test Email System
    console.log('\n\n📧 EMAIL SYSTEM TEST');
    console.log('-'.repeat(50));
    
    try {
        // Clear cached module
        delete require.cache[require.resolve('nodemailer')];
        const nodemailer = require('nodemailer');
        
        const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        console.log('✅ Email transporter created');
        
        // Test email template
        const veteranWelcomeEmail = {
            subject: 'Welcome Home, John - Your Housing Application Received',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎖️ Welcome Home, John</h1>
                        <p style="color: #e0e7ff; margin-top: 10px; font-size: 16px;">Your service matters. Your future matters more.</p>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 40px 30px;">
                        <p style="font-size: 18px; color: #111827; line-height: 1.6;">
                            Thank you for your service and for choosing Forward Horizon for your housing needs.
                        </p>
                        
                        <div style="background: #eff6ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1e3a8a;">
                            <h2 style="color: #1e3a8a; margin-top: 0; font-size: 20px;">✅ Application Received</h2>
                            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 0;">
                                We've received your housing application and our Veterans Liaison will review it within 24 hours.
                                As a veteran, you receive priority processing and access to specialized support services.
                            </p>
                        </div>
                        
                        <h3 style="color: #111827; font-size: 18px; margin-top: 30px;">What Happens Next:</h3>
                        <ol style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
                            <li><strong>Application Review:</strong> Our team reviews your information (24-48 hours)</li>
                            <li><strong>VA Benefits Check:</strong> We help maximize your housing benefits</li>
                            <li><strong>Personal Consultation:</strong> Schedule a call with our Veterans Specialist</li>
                            <li><strong>Housing Match:</strong> We find the perfect fit for your needs</li>
                            <li><strong>Move-In Support:</strong> Complete assistance through move-in day</li>
                        </ol>
                        
                        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #111827; margin-top: 0;">🏆 Veteran Benefits Available:</h3>
                            <ul style="color: #4b5563; line-height: 1.6;">
                                <li>Priority placement in our housing programs</li>
                                <li>VA benefits coordination and advocacy</li>
                                <li>Employment assistance and job training</li>
                                <li>Mental health and wellness support</li>
                                <li>Peer support groups with fellow veterans</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="tel:+13104885280" 
                               style="display: inline-block; background: #1e3a8a; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                                📞 Call Us Now: (310) 488-5280
                            </a>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px; background: #f9fafb; padding: 15px; border-radius: 8px;">
                            <strong>Need immediate assistance?</strong><br>
                            Our Veterans Hotline is available 24/7 at (310) 488-5280<br>
                            Email: theforwardhorizon@gmail.com
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            Forward Horizon - Transitional Housing for Heroes<br>
                            "Your Service Honored, Your Future Secured"
                        </p>
                    </div>
                </div>
            `,
            text: `
Welcome Home, John!

Thank you for your service and for choosing Forward Horizon for your housing needs.

APPLICATION RECEIVED ✅
We've received your housing application and our Veterans Liaison will review it within 24 hours.
As a veteran, you receive priority processing and access to specialized support services.

What Happens Next:
1. Application Review: Our team reviews your information (24-48 hours)
2. VA Benefits Check: We help maximize your housing benefits
3. Personal Consultation: Schedule a call with our Veterans Specialist
4. Housing Match: We find the perfect fit for your needs
5. Move-In Support: Complete assistance through move-in day

Veteran Benefits Available:
• Priority placement in our housing programs
• VA benefits coordination and advocacy
• Employment assistance and job training
• Mental health and wellness support
• Peer support groups with fellow veterans

Need immediate assistance?
Call our Veterans Hotline: (310) 488-5280
Email: theforwardhorizon@gmail.com

Forward Horizon - Your Service Honored, Your Future Secured
            `.trim()
        };
        
        console.log('\n📬 Sending sample nurturing email...');
        console.log(`To: ${process.env.EMAIL_USER}`);
        console.log(`Subject: ${veteranWelcomeEmail.subject}`);
        
        const result = await transporter.sendMail({
            from: `"Forward Horizon AI Agent" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: veteranWelcomeEmail.subject,
            html: veteranWelcomeEmail.html,
            text: veteranWelcomeEmail.text
        });
        
        console.log('✅ Email sent successfully!');
        console.log(`Message ID: ${result.messageId}`);
        
    } catch (error) {
        console.log('❌ Email test failed:', error.message);
    }
    
    // Show Campaign Structure
    console.log('\n\n📋 CAMPAIGN STRUCTURE');
    console.log('-'.repeat(50));
    
    const campaigns = {
        veteran: {
            name: 'Veteran Housing Support',
            emails: 9,
            timeline: '30 days',
            highlights: [
                'VA benefits optimization',
                'Veterans liaison support', 
                'Priority processing',
                'Peer support groups'
            ]
        },
        recovery: {
            name: 'Recovery Housing Support',
            emails: 10,
            timeline: '35 days',
            highlights: [
                'Safe, substance-free environment',
                '24/7 peer support',
                'Recovery program integration',
                'Wellness activities'
            ]
        },
        reentry: {
            name: 'Reentry Housing Support',
            emails: 10,
            timeline: '40 days',
            highlights: [
                'No-judgment approach',
                'Employment assistance',
                'Credit building support',
                'Legal resource connections'
            ]
        }
    };
    
    Object.entries(campaigns).forEach(([type, campaign]) => {
        console.log(`\n🎯 ${campaign.name}`);
        console.log(`   Timeline: ${campaign.timeline} | Emails: ${campaign.emails}`);
        console.log(`   Key Features:`);
        campaign.highlights.forEach(highlight => {
            console.log(`   • ${highlight}`);
        });
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✨ NURTURING SYSTEM CAPABILITIES');
    console.log('-'.repeat(50));
    console.log(`
🎯 Smart Lead Scoring
   • 100-point scoring system
   • Demographics, urgency, engagement factors
   • A-F grading with priority levels
   • Automated next-action recommendations

📧 Multi-Touch Email Campaigns
   • Veteran-specific sequences (9 emails)
   • Recovery-focused content (10 emails)
   • Reentry support campaigns (10 emails)
   • Professional HTML templates

⚡ Intelligent Automation
   • Time-based email delivery
   • Priority-based processing
   • Rate limiting and compliance
   • Engagement tracking

📊 Advanced Analytics
   • Lead scoring breakdown
   • Campaign performance metrics  
   • Conversion funnel analysis
   • ROI tracking and reporting
    `);
    
    console.log('=' .repeat(50));
    console.log('\n🎉 NURTURING SYSTEM READY!');
    console.log('\n✅ Your AI agent now has world-class nurturing capabilities:');
    console.log('   • Intelligent lead scoring and prioritization');
    console.log('   • Professional email templates for all audiences'); 
    console.log('   • Automated multi-touch sequences');
    console.log('   • Engagement tracking and analytics');
    console.log('   • Priority-based processing');
    console.log('\n🚀 Ready to convert leads into residents!\n');
}

testNurturingCore().catch(console.error);