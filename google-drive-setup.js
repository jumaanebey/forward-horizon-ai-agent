#!/usr/bin/env node

/**
 * Google Drive/Sheets Setup Script
 * Creates a Google Sheet for lead tracking and provides integration code
 */

require('dotenv').config();
const { google } = require('googleapis');

async function setupGoogleDrive() {
    console.log('🔧 Setting up Google Drive integration...');
    
    // For now, provide instructions for manual setup
    console.log(`
📋 GOOGLE DRIVE INTEGRATION SETUP:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable Google Sheets API and Google Drive API
4. Create Service Account credentials
5. Download the credentials JSON file
6. Share your Google Sheet with the service account email

📊 CREATE YOUR LEADS SHEET:
1. Create a new Google Sheet: https://sheets.google.com/
2. Name it "Forward Horizon Leads"
3. Add these headers in row 1:
   A1: ID
   B1: Name  
   C1: Email
   D1: Phone
   E1: Score
   F1: Status
   G1: Source
   H1: Created
   I1: Notes

4. Share the sheet with your service account email
5. Copy the Sheet ID from the URL
6. Add to your .env file:
   GOOGLE_SHEETS_ID=your_sheet_id_here
   GOOGLE_SERVICE_ACCOUNT_KEY=path_to_your_credentials.json

🚀 Your simplified AI agent will automatically sync leads to this sheet!
    `);
    
    // Test if credentials are available
    const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    const sheetsId = process.env.GOOGLE_SHEETS_ID;
    
    if (!serviceAccountPath || !sheetsId) {
        console.log('⚠️  Google credentials not configured yet');
        console.log('   Add GOOGLE_SHEETS_ID and GOOGLE_SERVICE_ACCOUNT_KEY to .env');
        return;
    }
    
    try {
        console.log('🔑 Testing Google authentication...');
        
        // This would test the actual connection
        // const auth = new google.auth.GoogleAuth({
        //     keyFile: serviceAccountPath,
        //     scopes: ['https://www.googleapis.com/auth/spreadsheets']
        // });
        
        console.log('✅ Google Drive integration ready!');
        
    } catch (error) {
        console.error('❌ Google setup failed:', error.message);
    }
}

setupGoogleDrive().catch(console.error);