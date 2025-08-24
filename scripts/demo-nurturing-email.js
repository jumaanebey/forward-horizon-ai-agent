#!/usr/bin/env node

/**
 * Demo Nurturing Email - Show Professional Campaign Template
 */

require('dotenv').config();

async function sendDemoEmail() {
    // Clear cached module
    delete require.cache[require.resolve('nodemailer')];
    
    console.log('📧 Sending Demo Nurturing Campaign Email\n');
    
    // Load nodemailer fresh
    const nodemailer = require('nodemailer');
    
    try {
        const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const veteranWelcomeEmail = {
            subject: '🎖️ Welcome Home - Your Forward Horizon Housing Application',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 50px 40px; text-align: center; position: relative;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grain\" width=\"100\" height=\"100\" patternUnits=\"userSpaceOnUse\"><circle cx=\"25\" cy=\"25\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"75\" cy=\"75\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grain)\"/></svg>'); opacity: 0.1;"></div>
                        <div style="position: relative; z-index: 1;">
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎖️ Welcome Home</h1>
                            <p style="color: #e0e7ff; margin: 15px 0 0 0; font-size: 18px; font-weight: 400;">Your service honored. Your future secured.</p>
                        </div>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 50px 40px;">
                        <div style="text-align: center; margin-bottom: 40px;">
                            <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0;">Thank you for choosing Forward Horizon</h2>
                            <p style="color: #6b7280; font-size: 16px; margin-top: 10px;">We're honored to support your housing journey</p>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid #bfdbfe; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: #1e3a8a; opacity: 0.1; border-radius: 50%; transform: translate(20px, -20px);"></div>
                            <div style="position: relative; z-index: 1;">
                                <h3 style="color: #1e40af; margin-top: 0; font-size: 22px; font-weight: 600; display: flex; align-items: center;">
                                    <span style="background: #1e40af; color: white; width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 18px;">✓</span>
                                    Application Received
                                </h3>
                                <p style="color: #1e40af; line-height: 1.7; margin-bottom: 0; font-size: 16px;">
                                    <strong>Priority Processing Active:</strong> As a veteran, your application receives expedited review by our Veterans Housing Specialist within 24 hours.
                                </p>
                            </div>
                        </div>
                        
                        <div style="margin: 40px 0;">
                            <h3 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 25px;">Your Next Steps:</h3>
                            <div style="space-y: 20px;">
                                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                    <div style="background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 15px; flex-shrink: 0;">1</div>
                                    <div>
                                        <h4 style="color: #111827; margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">Application Review</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.5;">Veterans Liaison reviews your information and housing needs (24-48 hours)</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                    <div style="background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 15px; flex-shrink: 0;">2</div>
                                    <div>
                                        <h4 style="color: #111827; margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">VA Benefits Optimization</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.5;">We help maximize your housing benefits and coordinate with VA resources</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                    <div style="background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 15px; flex-shrink: 0;">3</div>
                                    <div>
                                        <h4 style="color: #111827; margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">Personal Consultation</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.5;">Schedule a call with our Veterans Housing Specialist</p>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
                                    <div style="background: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; margin-right: 15px; flex-shrink: 0;">4</div>
                                    <div>
                                        <h4 style="color: #111827; margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">Housing Placement</h4>
                                        <p style="color: #6b7280; margin: 0; line-height: 1.5;">We find the perfect housing match for your needs and timeline</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; margin: 40px 0;">
                            <h3 style="color: #111827; margin-top: 0; font-size: 18px; font-weight: 600;">🏆 Exclusive Veteran Benefits:</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                                <div>
                                    <p style="margin: 0 0 8px 0; color: #10b981; font-weight: 600; font-size: 14px;">✓ Priority Placement</p>
                                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.4;">Fast-track access to available units</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 8px 0; color: #10b981; font-weight: 600; font-size: 14px;">✓ VA Benefits Coordination</p>
                                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.4;">Maximize your housing allowances</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 8px 0; color: #10b981; font-weight: 600; font-size: 14px;">✓ Career Services</p>
                                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.4;">Job placement and skill training</p>
                                </div>
                                <div>
                                    <p style="margin: 0 0 8px 0; color: #10b981; font-weight: 600; font-size: 14px;">✓ Veteran Community</p>
                                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.4;">Connect with fellow veterans</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin: 50px 0;">
                            <a href="tel:+13104885280" style="display: inline-block; background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(30, 58, 138, 0.3); transition: all 0.2s;">
                                📞 Call Veterans Hotline: (310) 488-5280
                            </a>
                            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">Available 24/7 for veteran housing emergencies</p>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 25px; border-radius: 8px; margin: 40px 0;">
                            <p style="color: #92400e; font-weight: 600; margin-top: 0; font-size: 16px;">💡 Did You Know?</p>
                            <p style="color: #78350f; margin-bottom: 0; line-height: 1.6;">Veterans at Forward Horizon have a 94% success rate in transitioning to permanent housing within 6 months. You're in excellent hands.</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #f8fafc; padding: 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                        <div style="margin-bottom: 25px;">
                            <h4 style="color: #111827; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Need Immediate Support?</h4>
                            <div style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                                <div>
                                    <p style="color: #6b7280; margin: 0; font-size: 14px;">📞 Veterans Hotline</p>
                                    <p style="color: #111827; margin: 5px 0 0 0; font-weight: 600;">(310) 488-5280</p>
                                </div>
                                <div>
                                    <p style="color: #6b7280; margin: 0; font-size: 14px;">📧 Direct Email</p>
                                    <p style="color: #111827; margin: 5px 0 0 0; font-weight: 600;">theforwardhorizon@gmail.com</p>
                                </div>
                            </div>
                        </div>
                        
                        <div style="border-top: 1px solid #e2e8f0; padding-top: 25px;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                                <strong>Forward Horizon</strong><br>
                                Transitional Housing for Heroes<br>
                                <em>"Your Service Honored, Your Future Secured"</em>
                            </p>
                        </div>
                    </div>
                </div>
            `,
            text: `
🎖️ WELCOME HOME - FORWARD HORIZON HOUSING

Thank you for your service and for choosing Forward Horizon for your housing needs.

✓ APPLICATION RECEIVED
Priority Processing Active: As a veteran, your application receives expedited review by our Veterans Housing Specialist within 24 hours.

YOUR NEXT STEPS:
1. Application Review - Veterans Liaison reviews your information (24-48 hours)
2. VA Benefits Optimization - We help maximize your housing benefits
3. Personal Consultation - Schedule a call with our Veterans Specialist
4. Housing Placement - We find the perfect match for your needs

EXCLUSIVE VETERAN BENEFITS:
✓ Priority Placement - Fast-track access to available units
✓ VA Benefits Coordination - Maximize your housing allowances
✓ Career Services - Job placement and skill training
✓ Veteran Community - Connect with fellow veterans

DID YOU KNOW?
Veterans at Forward Horizon have a 94% success rate in transitioning to permanent housing within 6 months. You're in excellent hands.

NEED IMMEDIATE SUPPORT?
📞 Veterans Hotline: (310) 488-5280 (Available 24/7)
📧 Direct Email: theforwardhorizon@gmail.com

Forward Horizon - Your Service Honored, Your Future Secured
            `.trim()
        };
        
        console.log('📨 Sending professional nurturing email to:', process.env.EMAIL_USER);
        console.log('Subject:', veteranWelcomeEmail.subject);
        
        const result = await transporter.sendMail({
            from: `"Forward Horizon AI Agent" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: veteranWelcomeEmail.subject,
            html: veteranWelcomeEmail.html,
            text: veteranWelcomeEmail.text,
            headers: {
                'X-Campaign-Type': 'veteran_nurturing',
                'X-Email-Sequence': '1_of_9',
                'X-Priority': 'high'
            }
        });
        
        console.log('\n✅ Demo email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('\n📱 Check your email to see the professional nurturing template!');
        
        console.log('\n🎯 This demonstrates:');
        console.log('   • Professional HTML email design');
        console.log('   • Veteran-specific messaging and benefits');
        console.log('   • Clear call-to-actions and next steps');
        console.log('   • Mobile-responsive layout');
        console.log('   • Professional branding and trust signals');
        
    } catch (error) {
        console.log('❌ Demo email failed:', error.message);
    }
}

sendDemoEmail().catch(console.error);