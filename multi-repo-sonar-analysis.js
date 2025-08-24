#!/usr/bin/env node

/**
 * Multi-Repository SonarQube Analysis Tool
 * Analyzes all repositories for a GitHub user with comprehensive reporting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MultiRepoAnalyzer {
    constructor() {
        this.allRepos = [];
        this.analysisResults = {};
        this.totalMetrics = {
            repositories: 0,
            totalFiles: 0,
            totalLines: 0,
            totalIssues: 0,
            totalBugs: 0,
            totalVulnerabilities: 0,
            totalSecurityHotspots: 0,
            totalCodeSmells: 0,
            languages: new Set()
        };
    }

    async analyzeAllRepositories(username = 'jumaanebey') {
        console.log(`🔍 Starting multi-repository analysis for: ${username}\n`);
        
        try {
            // Get list of repositories
            await this.discoverRepositories(username);
            
            // Analyze each repository
            for (const repo of this.allRepos) {
                await this.analyzeRepository(repo);
            }
            
            // Generate comprehensive report
            this.generateMultiRepoReport();
            
        } catch (error) {
            console.error('❌ Multi-repo analysis failed:', error.message);
        }
    }

    async discoverRepositories(username) {
        console.log('📋 Discovering repositories...');
        
        try {
            // Try to get repos via GitHub CLI if available
            try {
                const reposJson = execSync(`gh repo list ${username} --json name,url,language,isPrivate --limit 100`, 
                    { encoding: 'utf8', timeout: 30000 });
                const repos = JSON.parse(reposJson);
                
                this.allRepos = repos.map(repo => ({
                    name: repo.name,
                    url: repo.url,
                    language: repo.language || 'Unknown',
                    isPrivate: repo.isPrivate,
                    path: null // Will be set when cloned
                }));
                
                console.log(`✅ Found ${this.allRepos.length} repositories via GitHub CLI`);
                
            } catch (ghError) {
                console.log('⚠️ GitHub CLI not available, using manual discovery...');
                
                // Manual repository discovery based on common patterns
                this.allRepos = [
                    {
                        name: 'forward-horizon-ai-agent',
                        url: `https://github.com/${username}/forward-horizon-ai-agent`,
                        language: 'JavaScript',
                        isPrivate: false,
                        path: '.'
                    },
                    // Add more repositories manually if needed
                ];
                
                console.log(`✅ Using ${this.allRepos.length} manually configured repositories`);
            }
            
        } catch (error) {
            console.error('❌ Repository discovery failed:', error.message);
            // Fallback to current repository
            this.allRepos = [{
                name: 'current-repository',
                url: 'local',
                language: 'JavaScript',
                isPrivate: false,
                path: '.'
            }];
        }
    }

    async analyzeRepository(repo) {
        console.log(`\n🔍 Analyzing repository: ${repo.name}`);
        console.log(`   Language: ${repo.language}`);
        console.log(`   URL: ${repo.url}`);
        
        try {
            // For current repo, use current directory
            const repoPath = repo.path || '.';
            
            // Check if repository exists and has code
            if (!fs.existsSync(repoPath)) {
                console.log(`⚠️ Repository path not found: ${repoPath}`);
                return;
            }
            
            const analysis = await this.runRepositoryAnalysis(repoPath, repo);
            this.analysisResults[repo.name] = {
                ...repo,
                analysis,
                timestamp: new Date().toISOString()
            };
            
            // Update total metrics
            this.updateTotalMetrics(analysis);
            
            console.log(`✅ Analysis complete for ${repo.name}`);
            
        } catch (error) {
            console.error(`❌ Failed to analyze ${repo.name}:`, error.message);
            this.analysisResults[repo.name] = {
                ...repo,
                analysis: { error: error.message },
                timestamp: new Date().toISOString()
            };
        }
    }

    async runRepositoryAnalysis(repoPath, repo) {
        const analyzer = new RepositoryAnalyzer();
        const analysis = await analyzer.analyzeDirectory(repoPath);
        
        return {
            metrics: analysis.metrics,
            issues: analysis.issues,
            qualityRating: this.calculateQualityRating(analysis.issues.length, analysis.metrics.linesOfCode),
            languages: analysis.languages,
            fileTypes: analysis.fileTypes
        };
    }

    calculateQualityRating(totalIssues, linesOfCode) {
        if (linesOfCode === 0) return 'N/A';
        
        const issueRatio = totalIssues / linesOfCode * 1000;
        
        if (issueRatio <= 5) return 'A';
        if (issueRatio <= 10) return 'B';
        if (issueRatio <= 20) return 'C';
        if (issueRatio <= 50) return 'D';
        return 'E';
    }

    updateTotalMetrics(analysis) {
        this.totalMetrics.repositories++;
        this.totalMetrics.totalFiles += analysis.metrics.totalFiles;
        this.totalMetrics.totalLines += analysis.metrics.linesOfCode;
        this.totalMetrics.totalIssues += analysis.issues.length;
        
        // Count issue types
        analysis.issues.forEach(issue => {
            switch(issue.type) {
                case 'BUG':
                    this.totalMetrics.totalBugs++;
                    break;
                case 'VULNERABILITY':
                    this.totalMetrics.totalVulnerabilities++;
                    break;
                case 'SECURITY_HOTSPOT':
                    this.totalMetrics.totalSecurityHotspots++;
                    break;
                case 'CODE_SMELL':
                    this.totalMetrics.totalCodeSmells++;
                    break;
            }
        });
        
        // Add languages
        if (analysis.languages) {
            analysis.languages.forEach(lang => this.totalMetrics.languages.add(lang));
        }
    }

    generateMultiRepoReport() {
        console.log('\n' + '='.repeat(100));
        console.log('📊 MULTI-REPOSITORY SONARQUBE ANALYSIS REPORT');
        console.log('='.repeat(100));
        
        // Overall summary
        console.log('\n📈 PORTFOLIO OVERVIEW:');
        console.log(`   📚 Repositories Analyzed: ${this.totalMetrics.repositories}`);
        console.log(`   📄 Total Files: ${this.totalMetrics.totalFiles.toLocaleString()}`);
        console.log(`   📝 Total Lines of Code: ${this.totalMetrics.totalLines.toLocaleString()}`);
        console.log(`   🔤 Languages: ${Array.from(this.totalMetrics.languages).join(', ')}`);
        
        console.log('\n🔍 AGGREGATE ISSUES:');
        console.log(`   🐛 Total Bugs: ${this.totalMetrics.totalBugs}`);
        console.log(`   🔒 Total Vulnerabilities: ${this.totalMetrics.totalVulnerabilities}`);
        console.log(`   🔥 Total Security Hotspots: ${this.totalMetrics.totalSecurityHotspots}`);
        console.log(`   👃 Total Code Smells: ${this.totalMetrics.totalCodeSmells}`);
        console.log(`   📋 Total Issues: ${this.totalMetrics.totalIssues.toLocaleString()}`);
        
        // Repository breakdown
        console.log('\n📊 REPOSITORY BREAKDOWN:');
        console.log('-'.repeat(100));
        
        const sortedRepos = Object.entries(this.analysisResults)
            .sort(([,a], [,b]) => {
                const aIssues = a.analysis?.issues?.length || 0;
                const bIssues = b.analysis?.issues?.length || 0;
                return bIssues - aIssues;
            });
        
        sortedRepos.forEach(([name, result], index) => {
            if (result.analysis.error) {
                console.log(`${index + 1}. ❌ ${name} - Analysis Failed: ${result.analysis.error}`);
                return;
            }
            
            const analysis = result.analysis;
            const metrics = analysis.metrics || {};
            const issues = analysis.issues || [];
            
            console.log(`\n${index + 1}. 📁 ${name}`);
            console.log(`   🔤 Language: ${result.language}`);
            console.log(`   📄 Files: ${metrics.totalFiles || 0}`);
            console.log(`   📝 Lines: ${(metrics.linesOfCode || 0).toLocaleString()}`);
            console.log(`   🔍 Issues: ${issues.length}`);
            console.log(`   ⭐ Rating: ${analysis.qualityRating || 'N/A'}`);
            
            if (issues.length > 0) {
                const bugCount = issues.filter(i => i.type === 'BUG').length;
                const vulnCount = issues.filter(i => i.type === 'VULNERABILITY').length;
                const hotspotCount = issues.filter(i => i.type === 'SECURITY_HOTSPOT').length;
                const smellCount = issues.filter(i => i.type === 'CODE_SMELL').length;
                
                console.log(`      🐛 Bugs: ${bugCount} | 🔒 Vulnerabilities: ${vulnCount} | 🔥 Hotspots: ${hotspotCount} | 👃 Smells: ${smellCount}`);
            }
        });
        
        // Quality distribution
        console.log('\n📈 QUALITY DISTRIBUTION:');
        const qualityDistribution = {};
        Object.values(this.analysisResults).forEach(result => {
            const rating = result.analysis?.qualityRating || 'N/A';
            qualityDistribution[rating] = (qualityDistribution[rating] || 0) + 1;
        });
        
        Object.entries(qualityDistribution)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([rating, count]) => {
                const percentage = ((count / this.totalMetrics.repositories) * 100).toFixed(1);
                console.log(`   ${this.getRatingIcon(rating)} ${rating}: ${count} repositories (${percentage}%)`);
            });
        
        // Top issues across all repos
        console.log('\n🚨 TOP ISSUES ACROSS ALL REPOSITORIES:');
        const allIssues = [];
        Object.values(this.analysisResults).forEach(result => {
            if (result.analysis.issues) {
                result.analysis.issues.forEach(issue => {
                    allIssues.push({...issue, repository: result.name});
                });
            }
        });
        
        // Group by severity and type
        const criticalIssues = allIssues.filter(i => i.severity === 'CRITICAL');
        const majorIssues = allIssues.filter(i => i.severity === 'MAJOR');
        
        if (criticalIssues.length > 0) {
            console.log(`\n🚨 ${criticalIssues.length} Critical Issues:`);
            criticalIssues.slice(0, 5).forEach((issue, i) => {
                console.log(`   ${i+1}. ${issue.repository}: ${issue.message}`);
            });
        }
        
        if (majorIssues.length > 0) {
            console.log(`\n🔴 ${majorIssues.length} Major Issues (showing top 10):`);
            majorIssues.slice(0, 10).forEach((issue, i) => {
                console.log(`   ${i+1}. ${issue.repository}: ${issue.message}`);
            });
        }
        
        // Recommendations
        console.log('\n💡 PORTFOLIO-WIDE RECOMMENDATIONS:');
        
        if (this.totalMetrics.totalBugs > 0) {
            console.log(`   🐛 Fix ${this.totalMetrics.totalBugs} bugs across repositories`);
        }
        
        if (this.totalMetrics.totalSecurityHotspots > 0) {
            console.log(`   🔒 Review ${this.totalMetrics.totalSecurityHotspots} security hotspots`);
        }
        
        if (this.totalMetrics.totalCodeSmells > 100) {
            console.log(`   👃 Refactor code to reduce ${this.totalMetrics.totalCodeSmells} code smells`);
        }
        
        console.log('   📚 Implement consistent coding standards across all repositories');
        console.log('   🔧 Set up automated quality gates in CI/CD pipelines');
        console.log('   📝 Add comprehensive documentation and unit tests');
        
        // Save comprehensive report
        this.savePortfolioReport();
        
        console.log('\n' + '='.repeat(100));
        console.log('✅ Multi-repository analysis complete!');
        console.log('📄 Detailed report saved to: portfolio-sonar-report.json');
    }

    getRatingIcon(rating) {
        const icons = {
            'A': '🟢',
            'B': '🟡', 
            'C': '🟠',
            'D': '🔴',
            'E': '🚨',
            'N/A': '⚪'
        };
        return icons[rating] || '⚪';
    }

    savePortfolioReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.totalMetrics,
            repositories: this.analysisResults,
            recommendations: this.generateRecommendations()
        };
        
        fs.writeFileSync('portfolio-sonar-report.json', JSON.stringify(report, null, 2));
        console.log('📄 Portfolio report saved to: portfolio-sonar-report.json');
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Quality recommendations based on metrics
        const avgIssuesPerRepo = this.totalMetrics.totalIssues / this.totalMetrics.repositories;
        const avgLinesPerRepo = this.totalMetrics.totalLines / this.totalMetrics.repositories;
        
        if (avgIssuesPerRepo > 100) {
            recommendations.push({
                priority: 'HIGH',
                category: 'CODE_QUALITY',
                message: `High issue density (${avgIssuesPerRepo.toFixed(0)} issues/repo average) - implement quality gates`
            });
        }
        
        if (this.totalMetrics.totalSecurityHotspots > 0) {
            recommendations.push({
                priority: 'HIGH',
                category: 'SECURITY',
                message: `${this.totalMetrics.totalSecurityHotspots} security hotspots across portfolio - immediate review needed`
            });
        }
        
        if (this.totalMetrics.totalBugs > 0) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'RELIABILITY', 
                message: `${this.totalMetrics.totalBugs} bugs identified - prioritize fixes by repository`
            });
        }
        
        recommendations.push({
            priority: 'MEDIUM',
            category: 'MAINTAINABILITY',
            message: 'Establish consistent coding standards and automated quality checks across all repositories'
        });
        
        return recommendations;
    }
}

// Repository analyzer class (simplified version of the main analyzer)
class RepositoryAnalyzer {
    constructor() {
        this.metrics = {
            totalFiles: 0,
            linesOfCode: 0,
            complexity: 0,
            duplicatedLines: 0
        };
        this.issues = [];
        this.languages = new Set();
        this.fileTypes = {};
    }

    async analyzeDirectory(dirPath) {
        try {
            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);
                
                if (item.isDirectory()) {
                    if (!['node_modules', '.git', 'coverage', 'dist', '.next', 'build'].includes(item.name)) {
                        await this.analyzeDirectory(fullPath);
                    }
                } else if (this.isCodeFile(item.name)) {
                    await this.analyzeFile(fullPath);
                }
            }
        } catch (error) {
            // Handle permission errors gracefully
            if (error.code !== 'EACCES' && error.code !== 'EPERM') {
                throw error;
            }
        }
        
        return {
            metrics: this.metrics,
            issues: this.issues,
            languages: Array.from(this.languages),
            fileTypes: this.fileTypes
        };
    }

    isCodeFile(fileName) {
        const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.json', '.yml', '.yaml', '.xml', '.html', '.css', '.scss', '.sass', '.vue', '.svelte'];
        return codeExtensions.some(ext => fileName.endsWith(ext));
    }

    async analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const ext = path.extname(filePath);
            
            this.metrics.totalFiles++;
            this.metrics.linesOfCode += lines.length;
            
            // Track file types and languages
            this.fileTypes[ext] = (this.fileTypes[ext] || 0) + 1;
            this.detectLanguage(ext);
            
            // Simple issue detection
            this.detectIssues(filePath, content, lines);
            
        } catch (error) {
            // Handle file read errors gracefully
        }
    }

    detectLanguage(ext) {
        const langMap = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript', 
            '.jsx': 'React',
            '.tsx': 'React TypeScript',
            '.py': 'Python',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.go': 'Go',
            '.rs': 'Rust',
            '.swift': 'Swift',
            '.kt': 'Kotlin'
        };
        
        if (langMap[ext]) {
            this.languages.add(langMap[ext]);
        }
    }

    detectIssues(filePath, content, lines) {
        // Console.log detection
        const consoleMatches = content.match(/console\.log/g) || [];
        consoleMatches.forEach(() => {
            this.issues.push({
                file: filePath,
                type: 'CODE_SMELL',
                severity: 'INFO',
                message: 'Console.log statements should be removed in production'
            });
        });
        
        // Long lines
        lines.forEach((line, index) => {
            if (line.length > 120) {
                this.issues.push({
                    file: filePath,
                    line: index + 1,
                    type: 'CODE_SMELL',
                    severity: 'MINOR',
                    message: `Line too long (${line.length} characters)`
                });
            }
        });
        
        // Security patterns
        if (content.includes('eval(')) {
            this.issues.push({
                file: filePath,
                type: 'VULNERABILITY',
                severity: 'CRITICAL',
                message: 'Use of eval() - potential security risk'
            });
        }
        
        if (content.match(/password|secret|key|token/gi)) {
            this.issues.push({
                file: filePath,
                type: 'SECURITY_HOTSPOT',
                severity: 'MINOR',
                message: 'Potential sensitive data in code'
            });
        }
    }
}

// Run the analysis
const analyzer = new MultiRepoAnalyzer();
analyzer.analyzeAllRepositories().catch(console.error);