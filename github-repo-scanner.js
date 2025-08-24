#!/usr/bin/env node

/**
 * GitHub Repository Scanner and SonarQube Analyzer
 * Discovers and analyzes all repositories for a GitHub user
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHubRepoScanner {
    constructor(username = 'jumaanebey') {
        this.username = username;
        this.repositories = [];
        this.analysisResults = {};
    }

    async scanAllRepositories() {
        console.log(`🔍 Scanning all repositories for GitHub user: ${this.username}\n`);
        
        try {
            // Discover repositories via GitHub API
            await this.fetchRepositoriesFromGitHub();
            
            // Analyze current repository in detail
            await this.analyzeCurrentRepository();
            
            // Generate comprehensive report
            this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ Repository scanning failed:', error.message);
        }
    }

    async fetchRepositoriesFromGitHub() {
        return new Promise((resolve, reject) => {
            console.log('📋 Fetching repositories from GitHub API...');
            
            const options = {
                hostname: 'api.github.com',
                path: `/users/${this.username}/repos?per_page=100&sort=updated`,
                method: 'GET',
                headers: {
                    'User-Agent': 'Forward-Horizon-AI-Scanner',
                    'Accept': 'application/vnd.github.v3+json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const repos = JSON.parse(data);
                            this.repositories = repos.map(repo => ({
                                name: repo.name,
                                full_name: repo.full_name,
                                html_url: repo.html_url,
                                clone_url: repo.clone_url,
                                language: repo.language,
                                size: repo.size,
                                stargazers_count: repo.stargazers_count,
                                forks_count: repo.forks_count,
                                open_issues_count: repo.open_issues_count,
                                created_at: repo.created_at,
                                updated_at: repo.updated_at,
                                private: repo.private,
                                fork: repo.fork,
                                archived: repo.archived,
                                description: repo.description
                            }));
                            
                            console.log(`✅ Found ${this.repositories.length} repositories`);
                            resolve();
                        } else {
                            reject(new Error(`GitHub API returned status ${res.statusCode}`));
                        }
                    } catch (parseError) {
                        reject(new Error(`Failed to parse GitHub API response: ${parseError.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`GitHub API request failed: ${error.message}`));
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('GitHub API request timed out'));
            });

            req.end();
        });
    }

    async analyzeCurrentRepository() {
        console.log('\\n🔍 Analyzing current repository in detail...');
        
        const currentRepo = {
            name: 'forward-horizon-ai-agent',
            path: '.',
            language: 'JavaScript',
            isCurrentRepo: true
        };
        
        // Run detailed analysis on current repository
        const analysis = await this.performDetailedAnalysis(currentRepo);
        this.analysisResults[currentRepo.name] = {
            ...currentRepo,
            analysis,
            timestamp: new Date().toISOString()
        };
        
        console.log(`✅ Detailed analysis complete for current repository`);
    }

    async performDetailedAnalysis(repo) {
        const analyzer = new DetailedRepoAnalyzer();
        return await analyzer.analyzeRepository(repo.path || '.');
    }

    generateComprehensiveReport() {
        console.log('\\n' + '='.repeat(120));
        console.log('📊 COMPREHENSIVE GITHUB PORTFOLIO & SONARQUBE ANALYSIS');
        console.log('='.repeat(120));
        
        // Portfolio Overview
        console.log('\\n🏆 GITHUB PORTFOLIO OVERVIEW:');
        console.log(`   👤 User: ${this.username}`);
        console.log(`   📚 Total Repositories: ${this.repositories.length}`);
        
        // Repository statistics
        const languages = {};
        let totalStars = 0;
        let totalForks = 0;
        let totalIssues = 0;
        let publicRepos = 0;
        let privateRepos = 0;
        
        this.repositories.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
            totalStars += repo.stargazers_count;
            totalForks += repo.forks_count;
            totalIssues += repo.open_issues_count;
            if (repo.private) privateRepos++; else publicRepos++;
        });
        
        console.log(`   🌟 Total Stars: ${totalStars.toLocaleString()}`);
        console.log(`   🍴 Total Forks: ${totalForks.toLocaleString()}`);
        console.log(`   📋 Total Open Issues: ${totalIssues.toLocaleString()}`);
        console.log(`   🔓 Public Repositories: ${publicRepos}`);
        console.log(`   🔒 Private Repositories: ${privateRepos}`);
        
        // Language distribution
        console.log('\\n🔤 LANGUAGE DISTRIBUTION:');
        const sortedLanguages = Object.entries(languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
            
        sortedLanguages.forEach(([lang, count]) => {
            const percentage = ((count / this.repositories.length) * 100).toFixed(1);
            console.log(`   ${this.getLanguageIcon(lang)} ${lang}: ${count} repos (${percentage}%)`);
        });
        
        // Top repositories by stars
        console.log('\\n⭐ TOP REPOSITORIES BY STARS:');
        const topRepos = this.repositories
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 10);
            
        topRepos.forEach((repo, index) => {
            console.log(`   ${index + 1}. ${repo.name} - ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | ${repo.language || 'Unknown'}`);
            if (repo.description) {
                console.log(`      ${repo.description}`);
            }
        });
        
        // Recent activity
        console.log('\\n📅 RECENT ACTIVITY:');
        const recentRepos = this.repositories
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 10);
            
        recentRepos.forEach((repo, index) => {
            const updatedDate = new Date(repo.updated_at).toLocaleDateString();
            console.log(`   ${index + 1}. ${repo.name} - Updated: ${updatedDate} | ${repo.language || 'Unknown'}`);
        });
        
        // Code quality analysis for current repository
        if (this.analysisResults['forward-horizon-ai-agent']) {
            const currentAnalysis = this.analysisResults['forward-horizon-ai-agent'].analysis;
            
            console.log('\\n🔍 DETAILED CODE ANALYSIS - FORWARD HORIZON AI AGENT:');
            console.log('-'.repeat(80));
            
            if (currentAnalysis.metrics) {
                console.log(`   📄 Files: ${currentAnalysis.metrics.totalFiles.toLocaleString()}`);
                console.log(`   📝 Lines of Code: ${currentAnalysis.metrics.linesOfCode.toLocaleString()}`);
                console.log(`   🔄 Cyclomatic Complexity: ${currentAnalysis.metrics.complexity}`);
                console.log(`   📋 Duplicated Lines: ${currentAnalysis.metrics.duplicatedLines.toLocaleString()}`);
            }
            
            if (currentAnalysis.issues) {
                const issues = currentAnalysis.issues;
                const bugCount = issues.filter(i => i.type === 'BUG').length;
                const vulnCount = issues.filter(i => i.type === 'VULNERABILITY').length;
                const hotspotCount = issues.filter(i => i.type === 'SECURITY_HOTSPOT').length;
                const smellCount = issues.filter(i => i.type === 'CODE_SMELL').length;
                
                console.log(`   🐛 Bugs: ${bugCount}`);
                console.log(`   🔒 Vulnerabilities: ${vulnCount}`);
                console.log(`   🔥 Security Hotspots: ${hotspotCount}`);
                console.log(`   👃 Code Smells: ${smellCount}`);
                console.log(`   ⭐ Quality Rating: ${currentAnalysis.qualityRating || 'N/A'}`);
            }
            
            // Technology stack analysis
            if (currentAnalysis.technologies) {
                console.log('\\n🛠️ TECHNOLOGY STACK:');
                Object.entries(currentAnalysis.technologies).forEach(([tech, count]) => {
                    console.log(`   ${this.getTechIcon(tech)} ${tech}: ${count} files`);
                });
            }
        }
        
        // Repository recommendations
        console.log('\\n💡 PORTFOLIO RECOMMENDATIONS:');
        
        // Language diversity
        if (Object.keys(languages).length < 3) {
            console.log('   🔤 Consider expanding language diversity for broader skill demonstration');
        }
        
        // Documentation
        const reposWithoutDescription = this.repositories.filter(repo => !repo.description).length;
        if (reposWithoutDescription > 0) {
            console.log(`   📝 Add descriptions to ${reposWithoutDescription} repositories`);
        }
        
        // Activity
        const staleRepos = this.repositories.filter(repo => {
            const lastUpdate = new Date(repo.updated_at);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            return lastUpdate < sixMonthsAgo && !repo.archived;
        }).length;
        
        if (staleRepos > 0) {
            console.log(`   📅 Consider updating or archiving ${staleRepos} stale repositories`);
        }
        
        // Security
        if (totalIssues > 0) {
            console.log(`   🔒 Review and close ${totalIssues} open security issues`);
        }
        
        console.log('   🔧 Implement consistent CI/CD pipelines across repositories');
        console.log('   📊 Add comprehensive README files with badges and documentation');
        console.log('   🏷️ Use consistent tagging and release strategies');
        
        // Save comprehensive report
        this.saveComprehensiveReport();
        
        console.log('\\n' + '='.repeat(120));
        console.log('✅ Comprehensive GitHub portfolio analysis complete!');
    }

    getLanguageIcon(language) {
        const icons = {
            'JavaScript': '🟨',
            'TypeScript': '🔷',
            'Python': '🐍',
            'Java': '☕',
            'Go': '🐹',
            'Rust': '🦀',
            'C++': '⚡',
            'C#': '💜',
            'PHP': '🐘',
            'Ruby': '💎',
            'Swift': '🦉',
            'Kotlin': '🎯',
            'HTML': '🌐',
            'CSS': '🎨',
            'Shell': '🐚'
        };
        return icons[language] || '📄';
    }

    getTechIcon(tech) {
        const icons = {
            'React': '⚛️',
            'Node.js': '🟢',
            'Docker': '🐳',
            'Kubernetes': '☸️',
            'AWS': '☁️',
            'MongoDB': '🍃',
            'PostgreSQL': '🐘',
            'Redis': '🔴',
            'GraphQL': '💜',
            'REST': '🌐'
        };
        return icons[tech] || '🔧';
    }

    saveComprehensiveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            username: this.username,
            portfolio: {
                totalRepositories: this.repositories.length,
                publicRepositories: this.repositories.filter(r => !r.private).length,
                privateRepositories: this.repositories.filter(r => r.private).length,
                totalStars: this.repositories.reduce((sum, r) => sum + r.stargazers_count, 0),
                totalForks: this.repositories.reduce((sum, r) => sum + r.forks_count, 0),
                languages: this.getLanguageDistribution()
            },
            repositories: this.repositories,
            codeAnalysis: this.analysisResults,
            recommendations: this.generatePortfolioRecommendations()
        };
        
        fs.writeFileSync('github-portfolio-analysis.json', JSON.stringify(report, null, 2));
        console.log('📄 Comprehensive report saved to: github-portfolio-analysis.json');
    }

    getLanguageDistribution() {
        const languages = {};
        this.repositories.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        return languages;
    }

    generatePortfolioRecommendations() {
        return [
            'Add comprehensive README files to all repositories',
            'Implement consistent CI/CD pipelines',
            'Use semantic versioning and proper tagging',
            'Maintain active development on core projects',
            'Document code architecture and setup instructions',
            'Add unit tests and code coverage reporting',
            'Implement security scanning in all repositories'
        ];
    }
}

// Detailed repository analyzer
class DetailedRepoAnalyzer {
    constructor() {
        this.metrics = {
            totalFiles: 0,
            linesOfCode: 0,
            complexity: 0,
            duplicatedLines: 0
        };
        this.issues = [];
        this.technologies = {};
        this.qualityRating = 'N/A';
    }

    async analyzeRepository(repoPath) {
        try {
            await this.scanDirectory(repoPath);
            this.qualityRating = this.calculateQualityRating();
            
            return {
                metrics: this.metrics,
                issues: this.issues,
                technologies: this.technologies,
                qualityRating: this.qualityRating
            };
            
        } catch (error) {
            return {
                error: error.message,
                metrics: this.metrics,
                issues: [],
                technologies: {},
                qualityRating: 'ERROR'
            };
        }
    }

    async scanDirectory(dirPath) {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item.name);
            
            if (item.isDirectory()) {
                if (!['node_modules', '.git', 'coverage', 'dist', '.next', 'build', 'public'].includes(item.name)) {
                    await this.scanDirectory(fullPath);
                }
            } else if (this.isAnalyzableFile(item.name)) {
                await this.analyzeFile(fullPath, item.name);
            }
        }
    }

    isAnalyzableFile(fileName) {
        const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.md', '.css', '.scss', '.html'];
        return extensions.some(ext => fileName.endsWith(ext));
    }

    async analyzeFile(filePath, fileName) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\\n');
            
            this.metrics.totalFiles++;
            this.metrics.linesOfCode += lines.length;
            
            // Detect technologies
            this.detectTechnologies(fileName, content);
            
            // Detect issues
            this.detectIssues(filePath, content, lines);
            
            // Calculate complexity (simplified)
            this.metrics.complexity += this.calculateFileComplexity(content);
            
        } catch (error) {
            // Skip files that can't be read
        }
    }

    detectTechnologies(fileName, content) {
        // Framework detection
        if (content.includes('import React') || content.includes('from \'react\'')) {
            this.technologies['React'] = (this.technologies['React'] || 0) + 1;
        }
        
        if (content.includes('express') || content.includes('app.listen')) {
            this.technologies['Express.js'] = (this.technologies['Express.js'] || 0) + 1;
        }
        
        if (content.includes('@anthropic') || content.includes('anthropic')) {
            this.technologies['Anthropic AI'] = (this.technologies['Anthropic AI'] || 0) + 1;
        }
        
        if (content.includes('supabase') || content.includes('createClient')) {
            this.technologies['Supabase'] = (this.technologies['Supabase'] || 0) + 1;
        }
        
        if (content.includes('nodemailer') || content.includes('createTransport')) {
            this.technologies['Email (Nodemailer)'] = (this.technologies['Email (Nodemailer)'] || 0) + 1;
        }
        
        if (content.includes('docker') || fileName === 'Dockerfile') {
            this.technologies['Docker'] = (this.technologies['Docker'] || 0) + 1;
        }
        
        if (content.includes('kubernetes') || content.includes('kubectl')) {
            this.technologies['Kubernetes'] = (this.technologies['Kubernetes'] || 0) + 1;
        }
    }

    detectIssues(filePath, content, lines) {
        // Security issues
        if (content.includes('eval(')) {
            this.issues.push({
                file: filePath,
                type: 'VULNERABILITY',
                severity: 'CRITICAL',
                message: 'Use of eval() - potential security risk'
            });
        }
        
        // Console logs
        const consoleMatches = content.match(/console\\.log/g) || [];
        consoleMatches.forEach(() => {
            this.issues.push({
                file: filePath,
                type: 'CODE_SMELL',
                severity: 'INFO',
                message: 'Console.log statements should be removed in production'
            });
        });
        
        // Sensitive data patterns
        if (content.match(/password|secret|key|token/gi)) {
            this.issues.push({
                file: filePath,
                type: 'SECURITY_HOTSPOT',
                severity: 'MINOR',
                message: 'Potential sensitive data in code'
            });
        }
        
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
    }

    calculateFileComplexity(content) {
        const complexityKeywords = /\\b(if|else|while|for|switch|case|catch|&&|\\|\\||\\?)\\b/g;
        const matches = content.match(complexityKeywords) || [];
        return matches.length;
    }

    calculateQualityRating() {
        if (this.metrics.linesOfCode === 0) return 'N/A';
        
        const issueRatio = this.issues.length / this.metrics.linesOfCode * 1000;
        
        if (issueRatio <= 5) return 'A';
        if (issueRatio <= 10) return 'B';
        if (issueRatio <= 20) return 'C';
        if (issueRatio <= 50) return 'D';
        return 'E';
    }
}

// Run the scanner
const scanner = new GitHubRepoScanner();
scanner.scanAllRepositories().catch(console.error);