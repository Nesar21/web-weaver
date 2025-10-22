/**
 * Web Weaver Lightning - Template Manager
 * Version: 4.2.0 (v4.2 - NEW FILE)
 * 
 * 🆕 v4.2: Template Management System
 * - Built-in templates for popular sites (Amazon, LinkedIn, Medium, YouTube, Indeed)
 * - Custom user templates (CRUD operations)
 * - Template auto-detection by domain
 * - Template import/export
 * - Template application (auto-configure settings)
 * 
 * FEATURES:
 * - Auto-detect extraction template based on domain
 * - Apply template settings (category, mode, deduplication, translation, summarization)
 * - User can create, edit, delete custom templates
 * - Import/export templates as JSON
 * - Template history tracking
 */

console.log('[TemplateManager] Loading Template Manager v4.2.0...');

const TemplateManager = {
  VERSION: '4.2.0',
  STORAGE_KEY: 'web_weaver_templates',
  USER_TEMPLATES_KEY: 'web_weaver_user_templates',
  TEMPLATE_HISTORY_KEY: 'web_weaver_template_history',
  MAX_USER_TEMPLATES: 20,
  MAX_HISTORY: 50,
  
  // ════════════════════════════════════════════════════════════════
  // BUILT-IN TEMPLATES
  // ════════════════════════════════════════════════════════════════
  
  builtInTemplates: [
    {
      id: 'amazon_products',
      name: 'Amazon Products',
      description: 'Extract product listings from Amazon',
      icon: '🛒',
      category: 'e-commerce',
      domains: ['amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.in', 'amazon.ca', 'amazon.fr', 'amazon.es', 'amazon.it', 'amazon.co.jp'],
      urlPatterns: ['/s?', '/dp/', '/gp/product/'],
      settings: {
        category: 'products',
        mode: 'balanced',
        extractionType: 'MULTI',
        deduplication: true,
        translation: false,
        summarization: false,
        aiProvider: 'auto' // Let system decide
      },
      schema: 'product',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    },
    
    {
      id: 'linkedin_posts',
      name: 'LinkedIn Posts',
      description: 'Extract posts from LinkedIn feed',
      icon: '💼',
      category: 'social',
      domains: ['linkedin.com'],
      urlPatterns: ['/feed', '/posts'],
      settings: {
        category: 'articles',
        mode: 'min',
        extractionType: 'MULTI',
        deduplication: true,
        translation: true, // Often multilingual content
        summarization: true,
        aiProvider: 'auto'
      },
      schema: 'article',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    },
    
    {
      id: 'medium_articles',
      name: 'Medium Articles',
      description: 'Extract article listings from Medium',
      icon: '📰',
      category: 'news',
      domains: ['medium.com'],
      urlPatterns: ['/tag/', '/topic/', '/@'],
      settings: {
        category: 'articles',
        mode: 'balanced',
        extractionType: 'MULTI',
        deduplication: false,
        translation: true,
        summarization: true,
        aiProvider: 'auto'
      },
      schema: 'article',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    },
    
    {
      id: 'youtube_videos',
      name: 'YouTube Videos',
      description: 'Extract video listings from YouTube',
      icon: '🎥',
      category: 'video',
      domains: ['youtube.com', 'youtu.be'],
      urlPatterns: ['/results', '/feed', '/playlist'],
      settings: {
        category: 'videos',
        mode: 'balanced',
        extractionType: 'MULTI',
        deduplication: true,
        translation: false,
        summarization: false,
        aiProvider: 'auto'
      },
      schema: 'video',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    },
    
    {
      id: 'indeed_jobs',
      name: 'Indeed Jobs',
      description: 'Extract job listings from Indeed',
      icon: '💼',
      category: 'jobs',
      domains: ['indeed.com', 'indeed.co.uk', 'indeed.ca'],
      urlPatterns: ['/jobs', '/viewjob'],
      settings: {
        category: 'jobs',
        mode: 'balanced',
        extractionType: 'MULTI',
        deduplication: true,
        translation: false,
        summarization: true, // Summarize job descriptions
        aiProvider: 'auto'
      },
      schema: 'job',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    },
    
    {
      id: 'github_repos',
      name: 'GitHub Repositories',
      description: 'Extract repository listings from GitHub',
      icon: '🐙',
      category: 'tech',
      domains: ['github.com'],
      urlPatterns: ['/search', '/trending', '/explore'],
      settings: {
        category: 'all',
        mode: 'min',
        extractionType: 'MULTI',
        deduplication: true,
        translation: false,
        summarization: false,
        aiProvider: 'auto'
      },
      schema: 'universal',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    },
    
    {
      id: 'reddit_posts',
      name: 'Reddit Posts',
      description: 'Extract post listings from Reddit',
      icon: '🤖',
      category: 'social',
      domains: ['reddit.com'],
      urlPatterns: ['/r/', '/search'],
      settings: {
        category: 'all',
        mode: 'balanced',
        extractionType: 'MULTI',
        deduplication: true,
        translation: false,
        summarization: true,
        aiProvider: 'auto'
      },
      schema: 'article',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    },
    
    {
      id: 'custom',
      name: 'Custom',
      description: 'Manual configuration for any site',
      icon: '🔧',
      category: 'custom',
      domains: [],
      urlPatterns: [],
      settings: {
        category: 'all',
        mode: 'auto',
        extractionType: 'MULTI',
        deduplication: false,
        translation: false,
        summarization: false,
        aiProvider: 'auto'
      },
      schema: 'universal',
      metadata: {
        author: 'Web Weaver Team',
        version: '1.0',
        created: '2025-10-22',
        builtIn: true,
        verified: true
      }
    }
  ],
  
  // ════════════════════════════════════════════════════════════════
  // TEMPLATE DETECTION
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Detect template by domain and URL
   */
  detectTemplate(domain, url) {
    console.log('[TemplateManager] Detecting template for:', domain);
    
    // Check built-in templates
    for (const template of this.builtInTemplates) {
      // Check domain match
      const domainMatch = template.domains.some(d => domain.includes(d));
      
      if (domainMatch) {
        // Check URL pattern match (if specified)
        if (template.urlPatterns.length > 0) {
          const patternMatch = template.urlPatterns.some(pattern => url.includes(pattern));
          if (patternMatch) {
            console.log('[TemplateManager] ✅ Template detected:', template.name);
            return template;
          }
        } else {
          // No URL patterns specified, domain match is enough
          console.log('[TemplateManager] ✅ Template detected:', template.name);
          return template;
        }
      }
    }
    
    // Check user custom templates
    const userTemplates = this.getUserTemplates();
    for (const template of userTemplates) {
      const domainMatch = template.domains.some(d => domain.includes(d));
      if (domainMatch) {
        console.log('[TemplateManager] ✅ Custom template detected:', template.name);
        return template;
      }
    }
    
    console.log('[TemplateManager] No specific template detected, using custom');
    return this.builtInTemplates.find(t => t.id === 'custom');
  },
  
  /**
   * Get template by ID
   */
  getTemplateById(templateId) {
    // Check built-in templates
    let template = this.builtInTemplates.find(t => t.id === templateId);
    
    if (template) {
      return template;
    }
    
    // Check user templates
    const userTemplates = this.getUserTemplates();
    template = userTemplates.find(t => t.id === templateId);
    
    return template || null;
  },
  
  /**
   * Get all templates (built-in + user custom)
   */
  getAllTemplates() {
    const userTemplates = this.getUserTemplates();
    return [...this.builtInTemplates, ...userTemplates];
  },
  
  // ════════════════════════════════════════════════════════════════
  // USER CUSTOM TEMPLATES (CRUD)
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Get user custom templates from storage
   */
  getUserTemplates() {
    try {
      const stored = localStorage.getItem(this.USER_TEMPLATES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[TemplateManager] Error loading user templates:', error);
      return [];
    }
  },
  
  /**
   * Save user custom templates to storage
   */
  saveUserTemplates(templates) {
    try {
      localStorage.setItem(this.USER_TEMPLATES_KEY, JSON.stringify(templates));
      console.log('[TemplateManager] User templates saved:', templates.length);
      return true;
    } catch (error) {
      console.error('[TemplateManager] Error saving user templates:', error);
      return false;
    }
  },
  
  /**
   * Create new custom template
   */
  createCustomTemplate(templateData) {
    console.log('[TemplateManager] Creating custom template:', templateData.name);
    
    const userTemplates = this.getUserTemplates();
    
    // Check limit
    if (userTemplates.length >= this.MAX_USER_TEMPLATES) {
      throw new Error(`Maximum ${this.MAX_USER_TEMPLATES} custom templates allowed`);
    }
    
    // Generate ID
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTemplate = {
      id,
      name: templateData.name || 'Untitled Template',
      description: templateData.description || '',
      icon: templateData.icon || '🔧',
      category: templateData.category || 'custom',
      domains: templateData.domains || [],
      urlPatterns: templateData.urlPatterns || [],
      settings: {
        category: templateData.settings?.category || 'all',
        mode: templateData.settings?.mode || 'auto',
        extractionType: templateData.settings?.extractionType || 'MULTI',
        deduplication: templateData.settings?.deduplication ?? false,
        translation: templateData.settings?.translation ?? false,
        summarization: templateData.settings?.summarization ?? false,
        aiProvider: templateData.settings?.aiProvider || 'auto'
      },
      schema: templateData.schema || 'universal',
      metadata: {
        author: 'User',
        version: '1.0',
        created: new Date().toISOString(),
        builtIn: false,
        verified: false
      }
    };
    
    userTemplates.push(newTemplate);
    this.saveUserTemplates(userTemplates);
    
    console.log('[TemplateManager] ✅ Custom template created:', id);
    return newTemplate;
  },
  
  /**
   * Update existing custom template
   */
  updateCustomTemplate(templateId, updates) {
    console.log('[TemplateManager] Updating custom template:', templateId);
    
    const userTemplates = this.getUserTemplates();
    const templateIndex = userTemplates.findIndex(t => t.id === templateId);
    
    if (templateIndex === -1) {
      throw new Error('Template not found');
    }
    
    const template = userTemplates[templateIndex];
    
    // Can't update built-in templates
    if (template.metadata?.builtIn) {
      throw new Error('Cannot update built-in templates');
    }
    
    // Merge updates
    userTemplates[templateIndex] = {
      ...template,
      ...updates,
      id: template.id, // Preserve ID
      metadata: {
        ...template.metadata,
        modified: new Date().toISOString()
      }
    };
    
    this.saveUserTemplates(userTemplates);
    
    console.log('[TemplateManager] ✅ Custom template updated:', templateId);
    return userTemplates[templateIndex];
  },
  
  /**
   * Delete custom template
   */
  deleteCustomTemplate(templateId) {
    console.log('[TemplateManager] Deleting custom template:', templateId);
    
    const userTemplates = this.getUserTemplates();
    const template = userTemplates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Can't delete built-in templates
    if (template.metadata?.builtIn) {
      throw new Error('Cannot delete built-in templates');
    }
    
    const filteredTemplates = userTemplates.filter(t => t.id !== templateId);
    this.saveUserTemplates(filteredTemplates);
    
    console.log('[TemplateManager] ✅ Custom template deleted:', templateId);
    return true;
  },
  
  // ════════════════════════════════════════════════════════════════
  // TEMPLATE APPLICATION
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Apply template settings
   */
  async applyTemplate(template) {
    console.log('[TemplateManager] Applying template:', template.name);
    
    try {
      // Send settings to background.js
      await chrome.runtime.sendMessage({
        action: 'applyTemplate',
        template
      });
      
      // Track template usage
      this.trackTemplateUsage(template.id);
      
      console.log('[TemplateManager] ✅ Template applied:', template.name);
      return true;
      
    } catch (error) {
      console.error('[TemplateManager] Error applying template:', error);
      return false;
    }
  },
  
  // ════════════════════════════════════════════════════════════════
  // TEMPLATE IMPORT/EXPORT
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Export template as JSON
   */
  exportTemplate(templateId) {
    console.log('[TemplateManager] Exporting template:', templateId);
    
    const template = this.getTemplateById(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Remove internal metadata
    const exportData = {
      ...template,
      metadata: {
        ...template.metadata,
        exportedAt: new Date().toISOString(),
        exportedFrom: 'Web Weaver Lightning v4.2.0'
      }
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-weaver-template-${template.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('[TemplateManager] ✅ Template exported:', templateId);
    return true;
  },
  
  /**
   * Import template from JSON
   */
  importTemplate(jsonData) {
    console.log('[TemplateManager] Importing template...');
    
    try {
      const template = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      // Validate template structure
      if (!template.name || !template.settings) {
        throw new Error('Invalid template format');
      }
      
      // Create as new custom template
      const imported = this.createCustomTemplate({
        ...template,
        id: undefined // Generate new ID
      });
      
      console.log('[TemplateManager] ✅ Template imported:', imported.name);
      return imported;
      
    } catch (error) {
      console.error('[TemplateManager] Import error:', error);
      throw new Error('Failed to import template: ' + error.message);
    }
  },
  
  /**
   * Export all user templates
   */
  exportAllUserTemplates() {
    console.log('[TemplateManager] Exporting all user templates...');
    
    const userTemplates = this.getUserTemplates();
    
    if (userTemplates.length === 0) {
      throw new Error('No custom templates to export');
    }
    
    const exportData = {
      version: '4.2.0',
      exportedAt: new Date().toISOString(),
      count: userTemplates.length,
      templates: userTemplates
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `web-weaver-templates-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('[TemplateManager] ✅ All templates exported:', userTemplates.length);
    return true;
  },
  
  /**
   * Import multiple templates
   */
  importMultipleTemplates(jsonData) {
    console.log('[TemplateManager] Importing multiple templates...');
    
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (!data.templates || !Array.isArray(data.templates)) {
        throw new Error('Invalid format: expected templates array');
      }
      
      const imported = [];
      
      for (const template of data.templates) {
        try {
          const result = this.importTemplate(template);
          imported.push(result);
        } catch (error) {
          console.warn('[TemplateManager] Failed to import template:', template.name, error);
        }
      }
      
      console.log('[TemplateManager] ✅ Templates imported:', imported.length);
      return imported;
      
    } catch (error) {
      console.error('[TemplateManager] Import error:', error);
      throw new Error('Failed to import templates: ' + error.message);
    }
  },
  
  // ════════════════════════════════════════════════════════════════
  // TEMPLATE HISTORY
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Track template usage
   */
  trackTemplateUsage(templateId) {
    try {
      const history = this.getTemplateHistory();
      
      history.unshift({
        templateId,
        timestamp: Date.now(),
        domain: window.location?.hostname || 'unknown'
      });
      
      // Keep last MAX_HISTORY entries
      if (history.length > this.MAX_HISTORY) {
        history.splice(this.MAX_HISTORY);
      }
      
      localStorage.setItem(this.TEMPLATE_HISTORY_KEY, JSON.stringify(history));
      
    } catch (error) {
      console.error('[TemplateManager] Error tracking template usage:', error);
    }
  },
  
  /**
   * Get template usage history
   */
  getTemplateHistory() {
    try {
      const stored = localStorage.getItem(this.TEMPLATE_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[TemplateManager] Error loading template history:', error);
      return [];
    }
  },
  
  /**
   * Get most used templates
   */
  getMostUsedTemplates(limit = 5) {
    const history = this.getTemplateHistory();
    const usageCount = {};
    
    history.forEach(entry => {
      usageCount[entry.templateId] = (usageCount[entry.templateId] || 0) + 1;
    });
    
    const sorted = Object.entries(usageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([templateId, count]) => ({
        template: this.getTemplateById(templateId),
        usageCount: count
      }))
      .filter(item => item.template !== null);
    
    return sorted;
  },
  
  // ════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ════════════════════════════════════════════════════════════════
  
  /**
   * Validate template structure
   */
  validateTemplate(template) {
    const requiredFields = ['name', 'settings'];
    
    for (const field of requiredFields) {
      if (!template[field]) {
        return {
          valid: false,
          error: `Missing required field: ${field}`
        };
      }
    }
    
    return {
      valid: true
    };
  },
  
  /**
   * Clear all user templates
   */
  clearAllUserTemplates() {
    localStorage.removeItem(this.USER_TEMPLATES_KEY);
    console.log('[TemplateManager] All user templates cleared');
    return true;
  },
  
  /**
   * Clear template history
   */
  clearTemplateHistory() {
    localStorage.removeItem(this.TEMPLATE_HISTORY_KEY);
    console.log('[TemplateManager] Template history cleared');
    return true;
  }
};

// Export to global scope
if (typeof self !== 'undefined') {
  self.TemplateManager = TemplateManager;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateManager;
}

console.log('[TemplateManager] ✅ Template Manager v4.2.0 loaded');
console.log('[TemplateManager] Built-in templates:', TemplateManager.builtInTemplates.length);
console.log('[TemplateManager] User templates:', TemplateManager.getUserTemplates().length);
