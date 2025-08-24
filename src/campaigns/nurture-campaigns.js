/**
 * World-Class Email Nurturing Campaigns for Forward Horizon
 * Sophisticated multi-touch sequences for lead conversion
 */

class NurtureCampaigns {
    constructor() {
        this.campaigns = {
            veteran: this.getVeteranCampaign(),
            recovery: this.getRecoveryCampaign(),
            reentry: this.getReentryCampaign(),
            general: this.getGeneralCampaign()
        };
        
        this.businessInfo = {
            name: 'Forward Horizon',
            phone: '(310) 488-5280',
            email: 'theforwardhorizon@gmail.com',
            website: 'https://theforwardhorizon.com'
        };
    }

    /**
     * Veteran-focused nurturing campaign
     */
    getVeteranCampaign() {
        return {
            name: 'Veteran Housing Support',
            description: 'Specialized campaign for veterans seeking transitional housing',
            scoring_boost: 15, // Veterans get priority
            sequences: [
                {
                    day: 0,
                    hour: 0,
                    subject: 'Welcome Home, {name} - Your Housing Application Received',
                    template: 'veteran_welcome',
                    priority: 'high'
                },
                {
                    day: 1,
                    hour: 10,
                    subject: 'VA Benefits & Housing Resources Available for You',
                    template: 'veteran_benefits',
                    priority: 'high'
                },
                {
                    day: 3,
                    hour: 14,
                    subject: '{name}, Success Story: How Veterans Thrive at Forward Horizon',
                    template: 'veteran_success_story',
                    priority: 'medium'
                },
                {
                    day: 5,
                    hour: 9,
                    subject: 'Quick Check-In: Your Housing Timeline',
                    template: 'veteran_check_in',
                    priority: 'high'
                },
                {
                    day: 7,
                    hour: 15,
                    subject: 'Virtual Tour: See Your Future Home',
                    template: 'veteran_virtual_tour',
                    priority: 'medium'
                },
                {
                    day: 10,
                    hour: 11,
                    subject: 'Important: Complete Your VA Documentation',
                    template: 'veteran_documentation',
                    priority: 'high'
                },
                {
                    day: 14,
                    hour: 10,
                    subject: 'Community Support: Meet Other Veterans',
                    template: 'veteran_community',
                    priority: 'medium'
                },
                {
                    day: 21,
                    hour: 9,
                    subject: 'Final Step: Schedule Your Assessment',
                    template: 'veteran_final_push',
                    priority: 'high'
                },
                {
                    day: 30,
                    hour: 10,
                    subject: 'Still Here to Support Your Journey',
                    template: 'veteran_long_term',
                    priority: 'low'
                }
            ]
        };
    }

    /**
     * Recovery-focused nurturing campaign
     */
    getRecoveryCampaign() {
        return {
            name: 'Recovery Housing Support',
            description: 'Supportive campaign for individuals in recovery',
            scoring_boost: 12,
            sequences: [
                {
                    day: 0,
                    hour: 0,
                    subject: '{name}, Your Recovery Journey Matters - We\'re Here',
                    template: 'recovery_welcome',
                    priority: 'high'
                },
                {
                    day: 1,
                    hour: 11,
                    subject: 'Safe, Supportive Housing for Your Recovery',
                    template: 'recovery_environment',
                    priority: 'high'
                },
                {
                    day: 2,
                    hour: 16,
                    subject: 'Our Recovery Support Programs',
                    template: 'recovery_programs',
                    priority: 'medium'
                },
                {
                    day: 4,
                    hour: 10,
                    subject: 'Inspiring Story: From Recovery to Success',
                    template: 'recovery_success_story',
                    priority: 'medium'
                },
                {
                    day: 6,
                    hour: 14,
                    subject: '{name}, Let\'s Talk About Your Goals',
                    template: 'recovery_goals',
                    priority: 'high'
                },
                {
                    day: 9,
                    hour: 11,
                    subject: 'Community & Accountability in Recovery',
                    template: 'recovery_community',
                    priority: 'medium'
                },
                {
                    day: 12,
                    hour: 15,
                    subject: 'Financial Assistance Options Available',
                    template: 'recovery_financial',
                    priority: 'high'
                },
                {
                    day: 18,
                    hour: 10,
                    subject: 'Ready for the Next Step?',
                    template: 'recovery_next_step',
                    priority: 'high'
                },
                {
                    day: 25,
                    hour: 11,
                    subject: 'Your Path to Stable Housing',
                    template: 'recovery_stability',
                    priority: 'medium'
                },
                {
                    day: 35,
                    hour: 10,
                    subject: 'We\'re Still Here When You\'re Ready',
                    template: 'recovery_long_term',
                    priority: 'low'
                }
            ]
        };
    }

    /**
     * Reentry-focused nurturing campaign
     */
    getReentryCampaign() {
        return {
            name: 'Reentry Housing Support',
            description: 'Supportive campaign for returning citizens',
            scoring_boost: 10,
            sequences: [
                {
                    day: 0,
                    hour: 0,
                    subject: 'Welcome {name} - Fresh Start Housing Available',
                    template: 'reentry_welcome',
                    priority: 'high'
                },
                {
                    day: 1,
                    hour: 13,
                    subject: 'No Judgment, Just Support - Your Housing Options',
                    template: 'reentry_acceptance',
                    priority: 'high'
                },
                {
                    day: 3,
                    hour: 10,
                    subject: 'Employment & Housing: Building Your Foundation',
                    template: 'reentry_employment',
                    priority: 'high'
                },
                {
                    day: 5,
                    hour: 15,
                    subject: 'Success Story: Second Chances Work',
                    template: 'reentry_success',
                    priority: 'medium'
                },
                {
                    day: 7,
                    hour: 11,
                    subject: '{name}, Let\'s Address Your Concerns',
                    template: 'reentry_concerns',
                    priority: 'high'
                },
                {
                    day: 10,
                    hour: 14,
                    subject: 'Resources for Returning Citizens',
                    template: 'reentry_resources',
                    priority: 'medium'
                },
                {
                    day: 14,
                    hour: 10,
                    subject: 'Building Credit & Financial Stability',
                    template: 'reentry_financial',
                    priority: 'medium'
                },
                {
                    day: 20,
                    hour: 11,
                    subject: 'Ready to Apply? We\'ll Guide You',
                    template: 'reentry_application',
                    priority: 'high'
                },
                {
                    day: 28,
                    hour: 10,
                    subject: 'Your Future Starts Here',
                    template: 'reentry_future',
                    priority: 'medium'
                },
                {
                    day: 40,
                    hour: 11,
                    subject: 'Door is Always Open',
                    template: 'reentry_long_term',
                    priority: 'low'
                }
            ]
        };
    }

    /**
     * General nurturing campaign
     */
    getGeneralCampaign() {
        return {
            name: 'General Housing Support',
            description: 'Standard nurturing campaign for all leads',
            scoring_boost: 0,
            sequences: [
                {
                    day: 0,
                    hour: 0,
                    subject: 'Thank You {name} - Your Housing Inquiry Received',
                    template: 'general_welcome',
                    priority: 'high'
                },
                {
                    day: 1,
                    hour: 12,
                    subject: 'Affordable Housing Solutions at Forward Horizon',
                    template: 'general_solutions',
                    priority: 'high'
                },
                {
                    day: 3,
                    hour: 10,
                    subject: 'Our Programs & Services Overview',
                    template: 'general_programs',
                    priority: 'medium'
                },
                {
                    day: 5,
                    hour: 14,
                    subject: '{name}, See What Residents Say',
                    template: 'general_testimonials',
                    priority: 'medium'
                },
                {
                    day: 8,
                    hour: 11,
                    subject: 'Quick Question About Your Housing Needs',
                    template: 'general_survey',
                    priority: 'high'
                },
                {
                    day: 12,
                    hour: 10,
                    subject: 'Financial Assistance & Payment Plans',
                    template: 'general_financial',
                    priority: 'medium'
                },
                {
                    day: 16,
                    hour: 15,
                    subject: 'Virtual Tour Available',
                    template: 'general_tour',
                    priority: 'medium'
                },
                {
                    day: 22,
                    hour: 10,
                    subject: 'Application Deadline Approaching',
                    template: 'general_urgency',
                    priority: 'high'
                },
                {
                    day: 30,
                    hour: 11,
                    subject: 'Last Chance for Current Openings',
                    template: 'general_final',
                    priority: 'high'
                },
                {
                    day: 45,
                    hour: 10,
                    subject: 'We\'re Here When You Need Us',
                    template: 'general_long_term',
                    priority: 'low'
                }
            ]
        };
    }

    /**
     * Get email template content
     */
    getEmailTemplate(templateName, lead) {
        const templates = {
            // Veteran Templates
            veteran_welcome: {
                subject: `Welcome Home, ${lead.name || 'Veteran'} - Your Housing Application Received`,
                html: this.veteranWelcomeTemplate(lead),
                text: this.veteranWelcomeText(lead)
            },
            veteran_benefits: {
                subject: 'VA Benefits & Housing Resources Available for You',
                html: this.veteranBenefitsTemplate(lead),
                text: this.veteranBenefitsText(lead)
            },
            veteran_success_story: {
                subject: `${lead.name || 'Friend'}, Success Story: How Veterans Thrive at Forward Horizon`,
                html: this.getDefaultTemplate(lead).html,
                text: this.getDefaultTemplate(lead).text
            },
            
            // Recovery Templates
            recovery_welcome: {
                subject: `${lead.name || 'Friend'}, Your Recovery Journey Matters - We're Here`,
                html: this.recoveryWelcomeTemplate(lead),
                text: this.recoveryWelcomeText(lead)
            },
            recovery_environment: {
                subject: 'Safe, Supportive Housing for Your Recovery',
                html: this.recoveryEnvironmentTemplate(lead),
                text: this.recoveryEnvironmentText(lead)
            },
            
            // Reentry Templates
            reentry_welcome: {
                subject: `Welcome ${lead.name || 'Friend'} - Fresh Start Housing Available`,
                html: this.reentryWelcomeTemplate(lead),
                text: this.reentryWelcomeText(lead)
            },
            reentry_acceptance: {
                subject: 'No Judgment, Just Support - Your Housing Options',
                html: this.reentryAcceptanceTemplate(lead),
                text: this.reentryAcceptanceText(lead)
            },
            
            // General Templates
            general_welcome: {
                subject: `Thank You ${lead.name || 'Friend'} - Your Housing Inquiry Received`,
                html: this.generalWelcomeTemplate(lead),
                text: this.generalWelcomeText(lead)
            },
            general_solutions: {
                subject: 'Affordable Housing Solutions at Forward Horizon',
                html: this.generalSolutionsTemplate(lead),
                text: this.generalSolutionsText(lead)
            }
        };
        
        return templates[templateName] || this.getDefaultTemplate(lead);
    }

    // Template HTML generators
    veteranWelcomeTemplate(lead) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 40px 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎖️ Welcome Home, ${lead.name || 'Veteran'}</h1>
                    <p style="color: #e0e7ff; margin-top: 10px; font-size: 16px;">Your service matters. Your future matters more.</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 18px; color: #111827; line-height: 1.6;">
                        Thank you for your service and for choosing Forward Horizon for your housing needs.
                    </p>
                    
                    <div style="background: #eff6ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #1e3a8a;">
                        <h2 style="color: #1e3a8a; margin-top: 0; font-size: 20px;">✅ Application Received</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
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
                        <a href="tel:${this.businessInfo.phone.replace(/[^0-9]/g, '')}" 
                           style="display: inline-block; background: #1e3a8a; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            📞 Call Us Now: ${this.businessInfo.phone}
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                        <strong>Need immediate assistance?</strong><br>
                        Our Veterans Hotline is available 24/7 at ${this.businessInfo.phone}<br>
                        Email: ${this.businessInfo.email}
                    </p>
                </div>
                
                <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        Forward Horizon - Transitional Housing for Heroes<br>
                        "Your Service Honored, Your Future Secured"
                    </p>
                </div>
            </div>
        `;
    }

    veteranWelcomeText(lead) {
        return `
Welcome Home, ${lead.name || 'Veteran'}!

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
Call our Veterans Hotline: ${this.businessInfo.phone}
Email: ${this.businessInfo.email}

Forward Horizon - Your Service Honored, Your Future Secured
        `.trim();
    }

    veteranBenefitsTemplate(lead) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">💰 Maximize Your VA Benefits</h1>
                    <p style="color: #d1fae5; margin-top: 10px;">We help you access every benefit you've earned</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 18px; color: #111827; line-height: 1.6;">
                        Hi ${lead.name || 'there'},
                    </p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                        Many veterans don't realize they qualify for housing assistance programs. 
                        We're here to ensure you receive every benefit you've earned through your service.
                    </p>
                    
                    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #059669;">
                        <h2 style="color: #059669; margin-top: 0;">📋 Benefits You May Qualify For:</h2>
                        <ul style="color: #4b5563; line-height: 1.8;">
                            <li><strong>HUD-VASH:</strong> Rental assistance + case management</li>
                            <li><strong>SSVF:</strong> Rapid re-housing for veterans and families</li>
                            <li><strong>VA Pension:</strong> Additional income for eligible veterans</li>
                            <li><strong>State Benefits:</strong> California-specific veteran programs</li>
                            <li><strong>Disability Compensation:</strong> Monthly tax-free benefits</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h3 style="color: #92400e; margin-top: 0;">⏰ Time-Sensitive Opportunity</h3>
                        <p style="color: #78350f;">
                            New funding just became available for veteran housing assistance. 
                            Applications are processed first-come, first-served.
                        </p>
                    </div>
                    
                    <h3 style="color: #111827; font-size: 18px;">We Handle Everything For You:</h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin: 20px 0;">
                        <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
                            <strong style="color: #059669;">✓ Benefits Assessment</strong>
                            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">
                                Free evaluation of all available benefits
                            </p>
                        </div>
                        <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
                            <strong style="color: #059669;">✓ Application Support</strong>
                            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">
                                We complete and submit all paperwork
                            </p>
                        </div>
                        <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px;">
                            <strong style="color: #059669;">✓ Advocacy Services</strong>
                            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">
                                We fight for your maximum benefits
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${this.businessInfo.website}/veterans-benefits" 
                           style="display: inline-block; background: #059669; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Check Your Benefits Now →
                        </a>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 25px;">
                        <p style="color: #111827; font-weight: bold; margin-top: 0;">
                            🎖️ "Forward Horizon helped me get $1,200/month in benefits I didn't know I qualified for."
                        </p>
                        <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
                            - James K., Marine Corps Veteran
                        </p>
                    </div>
                </div>
                
                <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                        Questions? Call our Veterans Specialist: <strong>${this.businessInfo.phone}</strong>
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                        Forward Horizon - Maximizing Benefits for Those Who Served
                    </p>
                </div>
            </div>
        `;
    }

    veteranBenefitsText(lead) {
        return `
Hi ${lead.name || 'there'},

MAXIMIZE YOUR VA BENEFITS 💰

Many veterans don't realize they qualify for housing assistance programs. 
We're here to ensure you receive every benefit you've earned through your service.

Benefits You May Qualify For:
• HUD-VASH: Rental assistance + case management
• SSVF: Rapid re-housing for veterans and families  
• VA Pension: Additional income for eligible veterans
• State Benefits: California-specific veteran programs
• Disability Compensation: Monthly tax-free benefits

⏰ TIME-SENSITIVE OPPORTUNITY
New funding just became available for veteran housing assistance. 
Applications are processed first-come, first-served.

We Handle Everything For You:
✓ Benefits Assessment - Free evaluation of all available benefits
✓ Application Support - We complete and submit all paperwork
✓ Advocacy Services - We fight for your maximum benefits

"Forward Horizon helped me get $1,200/month in benefits I didn't know I qualified for."
- James K., Marine Corps Veteran

Check your benefits now: ${this.businessInfo.website}/veterans-benefits

Questions? Call our Veterans Specialist: ${this.businessInfo.phone}

Forward Horizon - Maximizing Benefits for Those Who Served
        `.trim();
    }

    // Recovery templates
    recoveryWelcomeTemplate(lead) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 30px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">💜 Your Recovery Journey Matters</h1>
                    <p style="color: #f3e8ff; margin-top: 10px;">Safe, supportive housing for your fresh start</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 18px; color: #111827; line-height: 1.6;">
                        Dear ${lead.name || 'Friend'},
                    </p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
                        Thank you for taking this brave step. We understand that recovery is a journey, 
                        and having stable, supportive housing is crucial to your success.
                    </p>
                    
                    <div style="background: #faf5ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #7c3aed;">
                        <h2 style="color: #7c3aed; margin-top: 0;">🏠 A Place That Supports Your Recovery</h2>
                        <p style="color: #4b5563; line-height: 1.6;">
                            Forward Horizon isn't just housing - it's a recovery-focused community designed 
                            to support your sobriety and personal growth every step of the way.
                        </p>
                    </div>
                    
                    <h3 style="color: #111827; font-size: 18px;">Our Recovery Support Includes:</h3>
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
                        <ul style="color: #4b5563; line-height: 1.8;">
                            <li>🛡️ <strong>Safe, substance-free environment</strong></li>
                            <li>👥 <strong>24/7 peer support and accountability</strong></li>
                            <li>📅 <strong>On-site recovery meetings (AA/NA)</strong></li>
                            <li>🧘 <strong>Wellness programs and activities</strong></li>
                            <li>💼 <strong>Employment assistance and skill building</strong></li>
                            <li>🎯 <strong>Personalized recovery planning</strong></li>
                        </ul>
                    </div>
                    
                    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="color: #065f46; font-weight: bold; margin-top: 0;">
                            ✨ "Forward Horizon gave me the stability I needed to focus on my recovery. 
                            18 months clean and counting!"
                        </p>
                        <p style="color: #047857; font-size: 14px; margin-bottom: 0;">
                            - Sarah M., Current Resident
                        </p>
                    </div>
                    
                    <h3 style="color: #111827; font-size: 18px;">Your Next Steps:</h3>
                    <ol style="color: #4b5563; line-height: 1.8;">
                        <li>Complete our confidential assessment (online or phone)</li>
                        <li>Tour our facilities (virtual or in-person)</li>
                        <li>Meet with our recovery counselor</li>
                        <li>Create your personalized housing plan</li>
                    </ol>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="tel:${this.businessInfo.phone.replace(/[^0-9]/g, '')}" 
                           style="display: inline-block; background: #7c3aed; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                            Start Your Journey Today
                        </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px; background: #f9fafb; padding: 15px; border-radius: 8px;">
                        <strong>Confidential Support Available 24/7</strong><br>
                        Call: ${this.businessInfo.phone}<br>
                        Email: ${this.businessInfo.email}<br>
                        <em>All communications are completely confidential</em>
                    </p>
                </div>
                
                <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        Forward Horizon - Recovery-Focused Transitional Housing<br>
                        "Your Recovery, Our Priority"
                    </p>
                </div>
            </div>
        `;
    }

    recoveryWelcomeText(lead) {
        return `
Dear ${lead.name || 'Friend'},

YOUR RECOVERY JOURNEY MATTERS 💜

Thank you for taking this brave step. We understand that recovery is a journey, 
and having stable, supportive housing is crucial to your success.

A PLACE THAT SUPPORTS YOUR RECOVERY
Forward Horizon isn't just housing - it's a recovery-focused community designed 
to support your sobriety and personal growth every step of the way.

Our Recovery Support Includes:
🛡️ Safe, substance-free environment
👥 24/7 peer support and accountability
📅 On-site recovery meetings (AA/NA)
🧘 Wellness programs and activities
💼 Employment assistance and skill building
🎯 Personalized recovery planning

"Forward Horizon gave me the stability I needed to focus on my recovery. 
18 months clean and counting!" - Sarah M., Current Resident

Your Next Steps:
1. Complete our confidential assessment (online or phone)
2. Tour our facilities (virtual or in-person)
3. Meet with our recovery counselor
4. Create your personalized housing plan

CONFIDENTIAL SUPPORT AVAILABLE 24/7
Call: ${this.businessInfo.phone}
Email: ${this.businessInfo.email}
All communications are completely confidential

Forward Horizon - Your Recovery, Our Priority
        `.trim();
    }

    // Default template
    getDefaultTemplate(lead) {
        return {
            subject: `Important Update for ${lead.name || 'You'}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Hello ${lead.name || 'there'},</h2>
                    <p>We wanted to follow up on your housing inquiry.</p>
                    <p>Please contact us at ${this.businessInfo.phone} to discuss your options.</p>
                    <p>Best regards,<br>Forward Horizon Team</p>
                </div>
            `,
            text: `Hello ${lead.name || 'there'}, We wanted to follow up on your housing inquiry. Please contact us at ${this.businessInfo.phone}. Best regards, Forward Horizon Team`
        };
    }

    // More template methods would continue here...
    // (Recovery, Reentry, General templates)
}

module.exports = NurtureCampaigns;