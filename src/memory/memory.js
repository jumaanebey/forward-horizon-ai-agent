/**
 * Memory System for AI Agent
 * Stores, retrieves, and manages agent memories with different types and importance levels
 */

const { createClient } = require('@supabase/supabase-js');
const Logger = require('../utils/logger');

class Memory {
  constructor() {
    this.logger = new Logger('Memory');
    this.supabase = null;
    this.initialized = false;
    
    // Memory types
    this.types = {
      CONVERSATION: 'conversation',
      LEAD: 'lead',
      ACTION: 'action', 
      BUSINESS: 'business',
      RESEARCH: 'research',
      SYSTEM: 'system'
    };
    
    // Importance levels
    this.importance = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  async initialize() {
    this.logger.info('🧠 Initializing Memory System...');
    
    try {
      // Initialize Supabase client
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not found in environment variables');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseKey);
      
      // Test connection and create tables if needed
      await this.setupDatabase();
      
      this.initialized = true;
      this.logger.info('✅ Memory System initialized');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to initialize memory system:', error);
      throw error;
    }
  }

  async setupDatabase() {
    try {
      // Create memories table if it doesn't exist
      const { error } = await this.supabase.rpc('create_memories_table_if_not_exists');
      
      if (error && !error.message.includes('already exists')) {
        // Try creating with raw SQL
        await this.createMemoriesTable();
      }
      
      this.logger.info('📊 Database tables verified/created');
    } catch (error) {
      this.logger.warn('Database setup warning (may be normal):', error.message);
    }
  }

  async createMemoriesTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS agent_memories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'system',
        importance VARCHAR(20) NOT NULL DEFAULT 'medium',
        metadata JSONB DEFAULT '{}',
        embedding VECTOR(1536), -- For semantic search
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ,
        
        -- Indexes
        CONSTRAINT memories_type_check CHECK (type IN ('conversation', 'lead', 'action', 'business', 'research', 'system')),
        CONSTRAINT memories_importance_check CHECK (importance IN ('low', 'medium', 'high', 'critical'))
      );
      
      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS memories_type_idx ON agent_memories(type);
      CREATE INDEX IF NOT EXISTS memories_importance_idx ON agent_memories(importance);
      CREATE INDEX IF NOT EXISTS memories_created_at_idx ON agent_memories(created_at DESC);
      CREATE INDEX IF NOT EXISTS memories_expires_at_idx ON agent_memories(expires_at) WHERE expires_at IS NOT NULL;
      
      -- Updated trigger
      CREATE OR REPLACE FUNCTION update_memories_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_memories_updated_at ON agent_memories;
      CREATE TRIGGER update_memories_updated_at
        BEFORE UPDATE ON agent_memories
        FOR EACH ROW
        EXECUTE FUNCTION update_memories_updated_at();
    `;

    const { error } = await this.supabase.rpc('exec_sql', { sql });
    if (error) {
      this.logger.warn('Could not create memories table via RPC, using direct queries');
      
      // Fallback: try individual operations
      const { error: tableError } = await this.supabase
        .from('agent_memories')
        .select('id')
        .limit(1);
        
      if (tableError && tableError.code === 'PGRST116') {
        this.logger.warn('Memories table does not exist and cannot be created automatically');
        this.logger.info('Please run the setup SQL in your Supabase dashboard');
      }
    }
  }

  /**
   * Store a memory
   */
  async store(content, type = 'system', importance = 'medium', metadata = {}) {
    if (!this.initialized) {
      this.logger.warn('Memory system not initialized, storing locally only');
      return { id: 'local-' + Date.now(), content, type, importance, created_at: new Date() };
    }

    try {
      // Calculate expiration based on importance
      const expiresAt = this.calculateExpiration(importance);
      
      const { data, error } = await this.supabase
        .from('agent_memories')
        .insert([{
          content,
          type,
          importance,
          metadata,
          expires_at: expiresAt
        }])
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to store memory:', error);
        return null;
      }

      this.logger.debug(`💾 Stored ${importance} ${type} memory: ${content.substring(0, 50)}...`);
      return data;
    } catch (error) {
      this.logger.error('Error storing memory:', error);
      return null;
    }
  }

  /**
   * Retrieve recent memories
   */
  async getRecentMemories(limit = 50, type = null) {
    if (!this.initialized) {
      return [];
    }

    try {
      let query = this.supabase
        .from('agent_memories')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Failed to retrieve memories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error retrieving memories:', error);
      return [];
    }
  }

  /**
   * Search memories by content
   */
  async search(query, limit = 10, types = null) {
    if (!this.initialized) {
      return [];
    }

    try {
      let dbQuery = this.supabase
        .from('agent_memories')
        .select('*')
        .textSearch('content', query)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (types) {
        dbQuery = dbQuery.in('type', types);
      }

      const { data, error } = await dbQuery;

      if (error) {
        this.logger.error('Failed to search memories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error searching memories:', error);
      return [];
    }
  }

  /**
   * Get memories by type and importance
   */
  async getByTypeAndImportance(type, importance, limit = 20) {
    if (!this.initialized) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('agent_memories')
        .select('*')
        .eq('type', type)
        .eq('importance', importance)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.logger.error('Failed to get memories by type/importance:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error getting memories:', error);
      return [];
    }
  }

  /**
   * Clean up expired memories
   */
  async cleanup() {
    if (!this.initialized) {
      return { deleted: 0 };
    }

    try {
      const { data, error } = await this.supabase
        .from('agent_memories')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        this.logger.error('Failed to cleanup memories:', error);
        return { deleted: 0, error: error.message };
      }

      const deletedCount = data ? data.length : 0;
      if (deletedCount > 0) {
        this.logger.info(`🗑️ Cleaned up ${deletedCount} expired memories`);
      }

      return { deleted: deletedCount };
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      return { deleted: 0, error: error.message };
    }
  }

  /**
   * Get memory statistics
   */
  async getStats() {
    if (!this.initialized) {
      return { total: 0, by_type: {}, by_importance: {} };
    }

    try {
      const { data, error } = await this.supabase
        .from('agent_memories')
        .select('type, importance');

      if (error) {
        this.logger.error('Failed to get memory stats:', error);
        return { total: 0, by_type: {}, by_importance: {} };
      }

      const stats = {
        total: data.length,
        by_type: {},
        by_importance: {}
      };

      data.forEach(memory => {
        stats.by_type[memory.type] = (stats.by_type[memory.type] || 0) + 1;
        stats.by_importance[memory.importance] = (stats.by_importance[memory.importance] || 0) + 1;
      });

      return stats;
    } catch (error) {
      this.logger.error('Error getting stats:', error);
      return { total: 0, by_type: {}, by_importance: {} };
    }
  }

  /**
   * Calculate memory expiration based on importance
   */
  calculateExpiration(importance) {
    const now = new Date();
    const retentionDays = parseInt(process.env.MEMORY_RETENTION_DAYS) || 30;

    switch (importance) {
      case this.importance.CRITICAL:
        return new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
      case this.importance.HIGH:
        return new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
      case this.importance.MEDIUM:
        return new Date(now.getTime() + (retentionDays * 24 * 60 * 60 * 1000)); // configurable
      case this.importance.LOW:
        return new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
      default:
        return new Date(now.getTime() + (retentionDays * 24 * 60 * 60 * 1000));
    }
  }
}

module.exports = Memory;