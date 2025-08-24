/**
 * Advanced Lead Scoring System for Forward Horizon
 * Intelligent lead qualification and prioritization
 */

class LeadScoring {
    constructor() {
        // Base scoring weights
        this.weights = {
            // Demographics
            isVeteran: 25,
            inRecovery: 20,
            isReentry: 18,
            hasFamily: 15,
            employed: 10,
            
            // Urgency factors
            currentlyHomeless: 30,
            evictionRisk: 25,
            within30Days: 20,
            within60Days: 15,
            within90Days: 10,
            
            // Engagement signals
            emailOpened: 5,
            emailClicked: 10,
            phoneContact: 15,
            formCompleted: 20,
            appointmentScheduled: 25,
            documentSubmitted: 20,
            
            // Qualification factors
            incomeVerified: 15,
            referencesProvided: 10,
            backgroundCheckConsent: 10,
            
            // Behavioral scoring
            responseTime: {
                within1Hour: 15,
                within6Hours: 10,
                within24Hours: 5,
                within3Days: 2
            },
            
            // Negative factors (subtract points)
            noResponse7Days: -10,
            noResponse14Days: -20,
            bounceEmail: -15,
            invalidPhone: -10,
            optedOut: -100
        };
        
        // Score thresholds
        this.thresholds = {
            hot: 80,      // Immediate attention needed
            warm: 60,     // High priority
            medium: 40,   // Standard follow-up
            cool: 20,     // Low priority
            cold: 0       // Minimal engagement
        };
        
        // Lead stages
        this.stages = {
            NEW: 'new',
            CONTACTED: 'contacted',
            QUALIFIED: 'qualified',
            NURTURING: 'nurturing',
            APPOINTMENT_SET: 'appointment_set',
            APPLICATION_SUBMITTED: 'application_submitted',
            APPROVED: 'approved',
            MOVED_IN: 'moved_in',
            LOST: 'lost'
        };
    }

    /**
     * Calculate comprehensive lead score
     */
    calculateScore(lead, interactions = []) {
        let score = 0;
        const scoreBreakdown = {
            demographic: 0,
            urgency: 0,
            engagement: 0,
            qualification: 0,
            behavioral: 0,
            penalties: 0
        };
        
        // Demographic scoring
        if (lead.is_veteran) {
            score += this.weights.isVeteran;
            scoreBreakdown.demographic += this.weights.isVeteran;
        }
        
        if (lead.in_recovery) {
            score += this.weights.inRecovery;
            scoreBreakdown.demographic += this.weights.inRecovery;
        }
        
        if (lead.is_reentry) {
            score += this.weights.isReentry;
            scoreBreakdown.demographic += this.weights.isReentry;
        }
        
        if (lead.has_family || lead.household_size > 1) {
            score += this.weights.hasFamily;
            scoreBreakdown.demographic += this.weights.hasFamily;
        }
        
        if (lead.employment_status === 'employed') {
            score += this.weights.employed;
            scoreBreakdown.demographic += this.weights.employed;
        }
        
        // Urgency scoring
        const urgencyScore = this.calculateUrgencyScore(lead);
        score += urgencyScore;
        scoreBreakdown.urgency = urgencyScore;
        
        // Engagement scoring
        const engagementScore = this.calculateEngagementScore(lead, interactions);
        score += engagementScore;
        scoreBreakdown.engagement = engagementScore;
        
        // Qualification scoring
        const qualificationScore = this.calculateQualificationScore(lead);
        score += qualificationScore;
        scoreBreakdown.qualification = qualificationScore;
        
        // Behavioral scoring
        const behavioralScore = this.calculateBehavioralScore(lead, interactions);
        score += behavioralScore;
        scoreBreakdown.behavioral = behavioralScore;
        
        // Apply penalties
        const penalties = this.calculatePenalties(lead, interactions);
        score += penalties;
        scoreBreakdown.penalties = penalties;
        
        // Ensure score is within bounds
        score = Math.max(0, Math.min(100, score));
        
        return {
            score,
            grade: this.getGrade(score),
            priority: this.getPriority(score),
            breakdown: scoreBreakdown,
            recommendations: this.getRecommendations(score, lead, interactions),
            nextAction: this.suggestNextAction(score, lead, interactions)
        };
    }

    /**
     * Calculate urgency score based on housing timeline
     */
    calculateUrgencyScore(lead) {
        let urgencyScore = 0;
        
        if (lead.currently_homeless || lead.housing_status === 'homeless') {
            urgencyScore += this.weights.currentlyHomeless;
        }
        
        if (lead.eviction_risk || lead.housing_status === 'at_risk') {
            urgencyScore += this.weights.evictionRisk;
        }
        
        // Check move-in timeline
        if (lead.move_in_date) {
            const daysUntilMove = this.getDaysUntilDate(lead.move_in_date);
            
            if (daysUntilMove <= 30) {
                urgencyScore += this.weights.within30Days;
            } else if (daysUntilMove <= 60) {
                urgencyScore += this.weights.within60Days;
            } else if (daysUntilMove <= 90) {
                urgencyScore += this.weights.within90Days;
            }
        }
        
        return urgencyScore;
    }

    /**
     * Calculate engagement score from interactions
     */
    calculateEngagementScore(lead, interactions) {
        let engagementScore = 0;
        const engagementCounts = {
            emails_opened: 0,
            emails_clicked: 0,
            phone_contacts: 0,
            forms_completed: 0,
            appointments_scheduled: 0,
            documents_submitted: 0
        };
        
        // Process all interactions
        interactions.forEach(interaction => {
            switch (interaction.type) {
                case 'email_opened':
                    engagementCounts.emails_opened++;
                    engagementScore += this.weights.emailOpened;
                    break;
                    
                case 'email_clicked':
                    engagementCounts.emails_clicked++;
                    engagementScore += this.weights.emailClicked;
                    break;
                    
                case 'phone_contact':
                case 'phone_call':
                    engagementCounts.phone_contacts++;
                    engagementScore += this.weights.phoneContact;
                    break;
                    
                case 'form_completed':
                    engagementCounts.forms_completed++;
                    engagementScore += this.weights.formCompleted;
                    break;
                    
                case 'appointment_scheduled':
                    engagementCounts.appointments_scheduled++;
                    engagementScore += this.weights.appointmentScheduled;
                    break;
                    
                case 'document_submitted':
                    engagementCounts.documents_submitted++;
                    engagementScore += this.weights.documentSubmitted;
                    break;
            }
        });
        
        // Cap engagement score at reasonable maximum
        return Math.min(engagementScore, 50);
    }

    /**
     * Calculate qualification score
     */
    calculateQualificationScore(lead) {
        let qualificationScore = 0;
        
        if (lead.income_verified) {
            qualificationScore += this.weights.incomeVerified;
        }
        
        if (lead.references_provided) {
            qualificationScore += this.weights.referencesProvided;
        }
        
        if (lead.background_check_consent) {
            qualificationScore += this.weights.backgroundCheckConsent;
        }
        
        return qualificationScore;
    }

    /**
     * Calculate behavioral score based on response patterns
     */
    calculateBehavioralScore(lead, interactions) {
        let behavioralScore = 0;
        
        // Check response time to first outreach
        const firstOutreach = interactions.find(i => i.type === 'email_sent' || i.type === 'sms_sent');
        const firstResponse = interactions.find(i => 
            i.type === 'email_opened' || i.type === 'email_clicked' || i.type === 'form_completed'
        );
        
        if (firstOutreach && firstResponse) {
            const responseHours = this.getHoursBetween(firstOutreach.created_at, firstResponse.created_at);
            
            if (responseHours <= 1) {
                behavioralScore += this.weights.responseTime.within1Hour;
            } else if (responseHours <= 6) {
                behavioralScore += this.weights.responseTime.within6Hours;
            } else if (responseHours <= 24) {
                behavioralScore += this.weights.responseTime.within24Hours;
            } else if (responseHours <= 72) {
                behavioralScore += this.weights.responseTime.within3Days;
            }
        }
        
        return behavioralScore;
    }

    /**
     * Calculate penalties for negative signals
     */
    calculatePenalties(lead, interactions) {
        let penalties = 0;
        
        // Check for recent engagement
        const lastInteraction = this.getLastInteraction(interactions);
        if (lastInteraction) {
            const daysSinceInteraction = this.getDaysSince(lastInteraction.created_at);
            
            if (daysSinceInteraction >= 14) {
                penalties += this.weights.noResponse14Days;
            } else if (daysSinceInteraction >= 7) {
                penalties += this.weights.noResponse7Days;
            }
        }
        
        // Check for bounced emails
        if (lead.email_bounced || interactions.some(i => i.type === 'email_bounced')) {
            penalties += this.weights.bounceEmail;
        }
        
        // Check for invalid phone
        if (lead.phone_invalid || interactions.some(i => i.type === 'phone_invalid')) {
            penalties += this.weights.invalidPhone;
        }
        
        // Check if opted out
        if (lead.opted_out || lead.unsubscribed) {
            penalties += this.weights.optedOut;
        }
        
        return penalties;
    }

    /**
     * Get lead grade based on score
     */
    getGrade(score) {
        if (score >= this.thresholds.hot) return 'A';
        if (score >= this.thresholds.warm) return 'B';
        if (score >= this.thresholds.medium) return 'C';
        if (score >= this.thresholds.cool) return 'D';
        return 'F';
    }

    /**
     * Get priority level based on score
     */
    getPriority(score) {
        if (score >= this.thresholds.hot) return 'URGENT';
        if (score >= this.thresholds.warm) return 'HIGH';
        if (score >= this.thresholds.medium) return 'MEDIUM';
        if (score >= this.thresholds.cool) return 'LOW';
        return 'MINIMAL';
    }

    /**
     * Get recommendations based on lead score and profile
     */
    getRecommendations(score, lead, interactions) {
        const recommendations = [];
        
        if (score >= this.thresholds.hot) {
            recommendations.push('🔥 HOT LEAD: Call immediately - high conversion probability');
            recommendations.push('Assign to senior housing specialist');
            recommendations.push('Fast-track application process');
        } else if (score >= this.thresholds.warm) {
            recommendations.push('📞 Schedule phone call within 24 hours');
            recommendations.push('Send personalized video message');
            recommendations.push('Offer virtual tour');
        } else if (score >= this.thresholds.medium) {
            recommendations.push('📧 Continue email nurturing sequence');
            recommendations.push('Send relevant success stories');
            recommendations.push('Invite to upcoming webinar or event');
        } else {
            recommendations.push('🔄 Add to long-term nurture campaign');
            recommendations.push('Send monthly newsletters');
            recommendations.push('Re-engage in 30 days');
        }
        
        // Add specific recommendations based on profile
        if (lead.is_veteran) {
            recommendations.push('🎖️ Connect with Veterans Liaison');
        }
        
        if (lead.in_recovery) {
            recommendations.push('💜 Assign recovery-specialized counselor');
        }
        
        if (lead.currently_homeless) {
            recommendations.push('🚨 Expedite housing placement');
        }
        
        return recommendations;
    }

    /**
     * Suggest next best action
     */
    suggestNextAction(score, lead, interactions) {
        const lastInteraction = this.getLastInteraction(interactions);
        const daysSinceContact = lastInteraction ? 
            this.getDaysSince(lastInteraction.created_at) : 999;
        
        if (score >= this.thresholds.hot) {
            if (!lead.phone_contacted) {
                return {
                    action: 'CALL_NOW',
                    description: 'Call lead immediately',
                    priority: 'URGENT',
                    script: 'Use hot lead phone script #1'
                };
            }
            return {
                action: 'SCHEDULE_TOUR',
                description: 'Schedule property tour',
                priority: 'HIGH'
            };
        }
        
        if (daysSinceContact > 3) {
            return {
                action: 'FOLLOW_UP',
                description: 'Send follow-up email',
                priority: 'MEDIUM',
                template: 'follow_up_day_' + Math.min(daysSinceContact, 30)
            };
        }
        
        if (!lead.appointment_scheduled) {
            return {
                action: 'BOOK_CONSULTATION',
                description: 'Send calendar link for consultation',
                priority: 'MEDIUM'
            };
        }
        
        return {
            action: 'CONTINUE_NURTURE',
            description: 'Continue automated nurture sequence',
            priority: 'LOW'
        };
    }

    // Utility methods
    getDaysUntilDate(date) {
        const targetDate = new Date(date);
        const today = new Date();
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysSince(date) {
        const pastDate = new Date(date);
        const today = new Date();
        const diffTime = today - pastDate;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    getHoursBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60));
    }

    getLastInteraction(interactions) {
        if (!interactions || interactions.length === 0) return null;
        return interactions.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        )[0];
    }

    /**
     * Bulk score leads for prioritization
     */
    async scoreLeads(leads, interactionMap = {}) {
        const scoredLeads = [];
        
        for (const lead of leads) {
            const interactions = interactionMap[lead.id] || [];
            const scoreResult = this.calculateScore(lead, interactions);
            
            scoredLeads.push({
                ...lead,
                score: scoreResult.score,
                grade: scoreResult.grade,
                priority: scoreResult.priority,
                nextAction: scoreResult.nextAction,
                scoreBreakdown: scoreResult.breakdown
            });
        }
        
        // Sort by score descending
        return scoredLeads.sort((a, b) => b.score - a.score);
    }
}

module.exports = LeadScoring;