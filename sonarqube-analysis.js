#!/usr/bin/env node

/**
 * SonarQube Analysis Script for Forward Horizon AI Agent
 * Performs comprehensive code quality analysis
 */

const fs = require('fs');
const path = require('path');

class CodeAnalyzer {
    constructor() {
        this.issues = [];
        this.metrics = {
            totalFiles: 0,
            linesOfCode: 0,
            complexity: 0,
            duplicatedLines: 0,
            securityHotspots: 0,
            bugs: 0,
            vulnerabilities: 0,
            codeSmells: 0
        };
    }

    async analyzeRepository() {
        console.log('🔍 Starting SonarQube-style analysis of Forward Horizon AI Agent...\n');
        
        // Analyze all JavaScript files
        await this.analyzeDirectory('.');
        
        this.generateReport();
        this.generateSonarReport();
    }

    async analyzeDirectory(dirPath) {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            // Skip node_modules and other excluded directories
            if (item.isDirectory()) {
                if (!['node_modules', '.git', 'coverage', 'dist'].includes(item.name)) {
                    await this.analyzeDirectory(fullPath);
                }
            } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.json'))) {
                await this.analyzeFile(fullPath);
            }
        }
    }

    async analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            this.metrics.totalFiles++;
            this.metrics.linesOfCode += lines.length;
            
            console.log(`📄 Analyzing: ${filePath}`);
            
            // Analyze for various issues
            this.checkSecurity(filePath, content, lines);
            this.checkCodeQuality(filePath, content, lines);
            this.checkComplexity(filePath, content, lines);
            this.checkDuplication(filePath, content);
            this.checkBugs(filePath, content, lines);
            
        } catch (error) {
            console.error(`❌ Error analyzing ${filePath}:`, error.message);
        }
    }

    checkSecurity(filePath, content, lines) {
        const securityIssues = [
            {
                pattern: /process\.env\[\s*['"`].*['"`]\s*\]/g,
                message: 'Direct environment variable access - consider validation',
                severity: 'MINOR'
            },
            {
                pattern: /eval\s*\(/g,
                message: 'Use of eval() - potential security risk',
                severity: 'CRITICAL'
            },
            {
                pattern: /innerHTML\s*=/g,
                message: 'Direct innerHTML assignment - XSS risk',
                severity: 'MAJOR'
            },
            {
                pattern: /console\.log\s*\(/g,
                message: 'Console.log statements should be removed in production',
                severity: 'INFO'
            },
            {
                pattern: /password|secret|key|token/gi,
                message: 'Potential sensitive data in code',
                severity: 'MINOR'
            }
        ];

        securityIssues.forEach(issue => {
            let match;
            while ((match = issue.pattern.exec(content)) !== null) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                
                this.issues.push({
                    file: filePath,
                    line: lineNumber,
                    type: 'SECURITY',
                    severity: issue.severity,
                    message: issue.message,
                    rule: 'security-check'
                });
                
                if (issue.severity === 'CRITICAL' || issue.severity === 'MAJOR') {
                    this.metrics.securityHotspots++;
                }
            }
        });
    }

    checkCodeQuality(filePath, content, lines) {
        const qualityIssues = [
            {
                pattern: /function\s+\w+\s*\([^)]*\)\s*{[^}]{200,}/g,
                message: 'Function too long - consider breaking down',
                severity: 'MAJOR'
            },
            {
                pattern: /\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*XXX/gi,
                message: 'TODO comment should be resolved',
                severity: 'INFO'
            },
            {
                pattern: /var\s+/g,
                message: 'Use let or const instead of var',
                severity: 'MINOR'
            },
            {
                pattern: /==\s*[^=]|!=\s*[^=]/g,
                message: 'Use strict equality (=== or !==)',
                severity: 'MINOR'
            }
        ];

        qualityIssues.forEach(issue => {
            let match;
            while ((match = issue.pattern.exec(content)) !== null) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                
                this.issues.push({
                    file: filePath,
                    line: lineNumber,
                    type: 'CODE_SMELL',
                    severity: issue.severity,
                    message: issue.message,
                    rule: 'code-quality'
                });
                
                this.metrics.codeSmells++;
            }
        });

        // Check for long lines
        lines.forEach((line, index) => {
            if (line.length > 120) {
                this.issues.push({
                    file: filePath,
                    line: index + 1,
                    type: 'CODE_SMELL',
                    severity: 'MINOR',
                    message: `Line too long (${line.length} characters)`,
                    rule: 'line-length'
                });
                this.metrics.codeSmells++;
            }
        });
    }

    checkComplexity(filePath, content, lines) {
        // Simple cyclomatic complexity calculation
        const complexityKeywords = /\b(if|else|while|for|switch|case|catch|&&|\|\||\?)\b/g;
        const matches = content.match(complexityKeywords) || [];
        const complexity = matches.length + 1; // Base complexity of 1
        
        this.metrics.complexity += complexity;
        
        if (complexity > 10) {
            this.issues.push({
                file: filePath,
                line: 1,
                type: 'CODE_SMELL',
                severity: 'MAJOR',
                message: `High cyclomatic complexity (${complexity})`,
                rule: 'complexity'
            });
            this.metrics.codeSmells++;
        }
    }

    checkDuplication(filePath, content) {
        // Simple duplication check (would be more sophisticated in real SonarQube)
        const lines = content.split('\n').filter(line => line.trim().length > 10);
        const duplicateCount = lines.length - new Set(lines).size;
        
        if (duplicateCount > 5) {
            this.metrics.duplicatedLines += duplicateCount;
            this.issues.push({
                file: filePath,
                line: 1,
                type: 'CODE_SMELL',
                severity: 'MAJOR',
                message: `Potential code duplication (${duplicateCount} duplicate lines)`,
                rule: 'duplication'
            });
            this.metrics.codeSmells++;
        }
    }

    checkBugs(filePath, content, lines) {
        const bugPatterns = [
            {
                pattern: /catch\s*\(\s*\w+\s*\)\s*{\s*}/g,
                message: 'Empty catch block - handle or log the exception',
                severity: 'MAJOR'
            },
            {
                pattern: /null\s*==\s*\w+|\w+\s*==\s*null/g,
                message: 'Null comparison - use strict equality',
                severity: 'MINOR'
            },
            {
                pattern: /undefined\s*==\s*\w+|\w+\s*==\s*undefined/g,
                message: 'Undefined comparison - use strict equality',
                severity: 'MINOR'
            }
        ];

        bugPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.pattern.exec(content)) !== null) {
                const lineNumber = content.substring(0, match.index).split('\n').length;
                
                this.issues.push({
                    file: filePath,
                    line: lineNumber,
                    type: 'BUG',
                    severity: pattern.severity,
                    message: pattern.message,
                    rule: 'bug-detection'
                });
                
                this.metrics.bugs++;
            }
        });
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 SONARQUBE-STYLE CODE ANALYSIS REPORT');
        console.log('='.repeat(80));
        
        console.log('\n📈 METRICS:');
        console.log(`   Files Analyzed: ${this.metrics.totalFiles}`);
        console.log(`   Lines of Code: ${this.metrics.linesOfCode}`);
        console.log(`   Cyclomatic Complexity: ${this.metrics.complexity}`);
        console.log(`   Duplicated Lines: ${this.metrics.duplicatedLines}`);
        
        console.log('\n🔍 ISSUES SUMMARY:');
        console.log(`   🐛 Bugs: ${this.metrics.bugs}`);
        console.log(`   🔒 Vulnerabilities: ${this.metrics.vulnerabilities}`);
        console.log(`   🔥 Security Hotspots: ${this.metrics.securityHotspots}`);
        console.log(`   👃 Code Smells: ${this.metrics.codeSmells}`);
        
        const totalIssues = this.issues.length;
        console.log(`   📋 Total Issues: ${totalIssues}`);
        
        // Quality rating
        const rating = this.calculateQualityRating();
        console.log(`   ⭐ Quality Rating: ${rating}`);
        
        if (totalIssues > 0) {
            console.log('\n🔍 DETAILED ISSUES:');
            
            // Group issues by severity
            const bySeverity = this.issues.reduce((acc, issue) => {
                acc[issue.severity] = (acc[issue.severity] || 0) + 1;
                return acc;
            }, {});
            
            Object.entries(bySeverity).forEach(([severity, count]) => {
                console.log(`   ${this.getSeverityIcon(severity)} ${severity}: ${count} issues`);
            });
            
            console.log('\n📝 TOP 10 ISSUES:');
            this.issues.slice(0, 10).forEach((issue, index) => {
                console.log(`   ${index + 1}. ${path.basename(issue.file)}:${issue.line}`);
                console.log(`      ${this.getSeverityIcon(issue.severity)} ${issue.severity}: ${issue.message}`);
            });
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Recommendations
        this.generateRecommendations();
    }

    calculateQualityRating() {
        const totalIssues = this.issues.length;
        const linesOfCode = this.metrics.linesOfCode;
        
        if (linesOfCode === 0) return 'N/A';
        
        const issueRatio = totalIssues / linesOfCode * 1000; // Issues per 1000 lines
        
        if (issueRatio <= 5) return 'A (Excellent)';
        if (issueRatio <= 10) return 'B (Good)';
        if (issueRatio <= 20) return 'C (Fair)';
        if (issueRatio <= 50) return 'D (Poor)';
        return 'E (Very Poor)';
    }

    getSeverityIcon(severity) {
        const icons = {
            'CRITICAL': '🚨',
            'MAJOR': '🔴',
            'MINOR': '🟡',
            'INFO': 'ℹ️'
        };
        return icons[severity] || '📋';
    }

    generateRecommendations() {
        console.log('💡 RECOMMENDATIONS:');
        
        if (this.metrics.bugs > 0) {
            console.log('   🐛 Fix bugs to improve reliability');
        }
        
        if (this.metrics.securityHotspots > 0) {
            console.log('   🔒 Review security hotspots');
        }
        
        if (this.metrics.codeSmells > 10) {
            console.log('   👃 Refactor code to reduce code smells');
        }
        
        if (this.metrics.complexity > 50) {
            console.log('   🔄 Break down complex functions');
        }
        
        if (this.metrics.duplicatedLines > 20) {
            console.log('   📋 Extract common code to reduce duplication');
        }
        
        console.log('   📚 Consider adding unit tests for better coverage');
        console.log('   📝 Add JSDoc comments for better documentation');
        console.log('   🔧 Set up ESLint and Prettier for consistent code style');
    }

    generateSonarReport() {
        // Generate SonarQube-compatible JSON report
        const sonarReport = {
            issues: this.issues.map(issue => ({
                engineId: 'forward-horizon-analyzer',
                ruleId: issue.rule,
                primaryLocation: {
                    message: issue.message,
                    filePath: issue.file,
                    textRange: {
                        startLine: issue.line,
                        startColumn: 1
                    }
                },
                type: issue.type,
                severity: issue.severity
            })),
            metrics: this.metrics
        };
        
        fs.writeFileSync('sonar-report.json', JSON.stringify(sonarReport, null, 2));
        console.log('\n📄 Generated sonar-report.json for SonarQube integration');
    }
}

// Run the analysis
const analyzer = new CodeAnalyzer();
analyzer.analyzeRepository().catch(console.error);