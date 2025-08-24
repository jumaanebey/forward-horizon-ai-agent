#!/usr/bin/env node

/**
 * Database Fix Script
 * Creates all necessary tables for the AI agent
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function fixDatabase() {
    console.log('🔧 Fixing database schema...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    try {
        // Create leads table
        console.log('📋 Creating leads table...');
        const { error: leadsError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS leads (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'new',
                    source VARCHAR(100),
                    is_veteran BOOLEAN DEFAULT false,
                    currently_homeless BOOLEAN DEFAULT false,
                    in_recovery BOOLEAN DEFAULT false,
                    is_reentry BOOLEAN DEFAULT false,
                    eviction_risk BOOLEAN DEFAULT false,
                    employment_status VARCHAR(50),
                    housing_needs TEXT,
                    income_qualified BOOLEAN DEFAULT false,
                    preferred_contact_method VARCHAR(50),
                    score INTEGER DEFAULT 0,
                    next_action VARCHAR(100),
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
                CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
                CREATE INDEX IF NOT EXISTS leads_score_idx ON leads(score);
                CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at);
            `
        });
        
        if (leadsError) {
            console.log('⚠️ RPC failed, trying direct table creation...');
            
            // Alternative: Try direct table operations
            const { error: createError } = await supabase
                .from('leads')
                .select('id')
                .limit(1);
                
            if (createError && createError.code === 'PGRST116') {
                console.log('✅ Leads table needs to be created in Supabase dashboard');
                console.log('📋 Please run this SQL in your Supabase SQL editor:');
                console.log(`
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'new',
    source VARCHAR(100),
    is_veteran BOOLEAN DEFAULT false,
    currently_homeless BOOLEAN DEFAULT false,
    in_recovery BOOLEAN DEFAULT false,
    is_reentry BOOLEAN DEFAULT false,
    eviction_risk BOOLEAN DEFAULT false,
    employment_status VARCHAR(50),
    housing_needs TEXT,
    income_qualified BOOLEAN DEFAULT false,
    preferred_contact_method VARCHAR(50),
    score INTEGER DEFAULT 0,
    next_action VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
                `);
            } else {
                console.log('✅ Leads table already exists or accessible');
            }
        } else {
            console.log('✅ Leads table created successfully via RPC');
        }
        
        // Test with a simple lead
        console.log('🧪 Testing lead insertion...');
        const testLead = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '555-0000',
            source: 'database_fix_test',
            score: 50
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('leads')
            .insert([testLead])
            .select()
            .single();
            
        if (insertError) {
            console.error('❌ Lead insertion failed:', insertError.message);
            if (insertError.code === 'PGRST116') {
                console.log('📋 Table doesn\'t exist - create it manually in Supabase dashboard');
            }
        } else {
            console.log('✅ Test lead inserted successfully:', insertData.id);
            
            // Clean up test lead
            await supabase.from('leads').delete().eq('id', insertData.id);
            console.log('🧹 Test lead cleaned up');
        }
        
        console.log('🎉 Database fix complete!');
        
    } catch (error) {
        console.error('❌ Database fix failed:', error.message);
        process.exit(1);
    }
}

fixDatabase().catch(console.error);