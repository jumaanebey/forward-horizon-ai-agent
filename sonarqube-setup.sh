#!/bin/bash

# SonarQube Setup Script for Forward Horizon AI Agent
echo "🔧 Setting up SonarQube analysis..."

# Install SonarQube Scanner
echo "📦 Installing SonarQube Scanner..."
if ! command -v sonar-scanner &> /dev/null; then
    echo "Installing SonarQube Scanner via npm..."
    npm install -g sonarqube-scanner
fi

# Install ESLint for code quality
echo "📦 Installing ESLint..."
npm install --save-dev eslint eslint-config-standard

# Create coverage directory
mkdir -p coverage

echo "✅ SonarQube setup complete!"
echo ""
echo "🚀 To run analysis:"
echo "1. Start SonarQube server (Docker): docker run -d -p 9000:9000 sonarqube:latest"
echo "2. Login to http://localhost:9000 (admin/admin)"
echo "3. Create project token"
echo "4. Run: sonar-scanner -Dsonar.login=YOUR_TOKEN"
echo ""
echo "📊 Or run our custom analysis: node sonarqube-analysis.js"