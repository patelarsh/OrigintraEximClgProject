/**
 * ===============================================================
 * Origintra Exim - Supabase Database Client (Zero-Dependency)
 * ===============================================================
 * 
 * Directly connects to your Supabase PostgreSQL project using the
 * high-performance PostgREST HTTP standard API.
 * 
 * Works out-of-the-box on Hostinger, Netlify, Vercel, and localhost.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const STORAGE_KEYS = {
  URL: 'origintra_supabase_url_v1',
  KEY: 'origintra_supabase_anon_key_v1',
};

export class SupabaseClient {
  private url: string = '';
  private anonKey: string = '';

  constructor() {
    this.reloadConfig();
  }

  public reloadConfig(): void {
    // 1. Check environment variables
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    // 2. Check localStorage (allows dynamic config from Admin UI)
    let storedUrl = '';
    let storedKey = '';
    if (typeof window !== 'undefined') {
      try {
        storedUrl = localStorage.getItem(STORAGE_KEYS.URL) || '';
        storedKey = localStorage.getItem(STORAGE_KEYS.KEY) || '';
      } catch (e) {
        // ignore
      }
    }

    this.url = (storedUrl || envUrl || '').trim().replace(/\/+$/, '');
    this.anonKey = (storedKey || envKey || '').trim();
  }

  public isConfigured(): boolean {
    return Boolean(this.url && this.anonKey && this.url.startsWith('https://') && this.anonKey.length > 20);
  }

  public getConfig(): SupabaseConfig {
    return { url: this.url, anonKey: this.anonKey };
  }

  public setConfig(url: string, anonKey: string): void {
    this.url = (url || '').trim().replace(/\/+$/, '');
    this.anonKey = (anonKey || '').trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.URL, this.url);
      localStorage.setItem(STORAGE_KEYS.KEY, this.anonKey);
      window.dispatchEvent(new Event('origintra_supabase_config_updated'));
    }
  }

  public clearConfig(): void {
    this.url = '';
    this.anonKey = '';
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.URL);
      localStorage.removeItem(STORAGE_KEYS.KEY);
      window.dispatchEvent(new Event('origintra_supabase_config_updated'));
    }
  }

  private getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`,
      'Content-Type': 'application/json',
      ...extraHeaders
    };
  }

  /**
   * Generic PostgREST Query Builder
   */
  public from(tableName: string) {
    const baseUrl = `${this.url}/rest/v1/${tableName}`;
    const headers = this.getHeaders();

    return {
      // 1. SELECT
      select: async (selectQuery: string = '*', filters: Record<string, string> = {}, orderBy?: string) => {
        if (!this.isConfigured()) return { data: null, error: 'Supabase is not configured' };

        const params = new URLSearchParams();
        params.append('select', selectQuery);
        for (const [key, val] of Object.entries(filters)) {
          params.append(key, val);
        }
        if (orderBy) {
          params.append('order', orderBy);
        }

        try {
          const res = await fetch(`${baseUrl}?${params.toString()}`, {
            method: 'GET',
            headers
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return { data: null, error: err.message || `HTTP ${res.status}` };
          }
          const data = await res.json();
          return { data, error: null };
        } catch (e: any) {
          return { data: null, error: e?.message || 'Network error' };
        }
      },

      // 2. INSERT
      insert: async (records: any | any[]) => {
        if (!this.isConfigured()) return { data: null, error: 'Supabase is not configured' };
        const body = Array.isArray(records) ? records : [records];

        try {
          const res = await fetch(baseUrl, {
            method: 'POST',
            headers: this.getHeaders({
              'Prefer': 'return=representation'
            }),
            body: JSON.stringify(body)
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return { data: null, error: err.message || `HTTP ${res.status}` };
          }
          const data = await res.json();
          return { data, error: null };
        } catch (e: any) {
          return { data: null, error: e?.message || 'Network error' };
        }
      },

      // 3. UPSERT (MERGE)
      upsert: async (records: any | any[], onConflict?: string) => {
        if (!this.isConfigured()) return { data: null, error: 'Supabase is not configured' };
        const body = Array.isArray(records) ? records : [records];
        const params = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';

        try {
          const res = await fetch(`${baseUrl}${params}`, {
            method: 'POST',
            headers: this.getHeaders({
              'Prefer': 'resolution=merge-duplicates,return=representation'
            }),
            body: JSON.stringify(body)
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return { data: null, error: err.message || `HTTP ${res.status}` };
          }
          const data = await res.json();
          return { data, error: null };
        } catch (e: any) {
          return { data: null, error: e?.message || 'Network error' };
        }
      },

      // 4. UPDATE
      update: async (updates: any, matchColumn: string, matchValue: any) => {
        if (!this.isConfigured()) return { data: null, error: 'Supabase is not configured' };

        try {
          const res = await fetch(`${baseUrl}?${encodeURIComponent(matchColumn)}=eq.${encodeURIComponent(matchValue)}`, {
            method: 'PATCH',
            headers: this.getHeaders({
              'Prefer': 'return=representation'
            }),
            body: JSON.stringify(updates)
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return { data: null, error: err.message || `HTTP ${res.status}` };
          }
          const data = await res.json();
          return { data, error: null };
        } catch (e: any) {
          return { data: null, error: e?.message || 'Network error' };
        }
      },

      // 5. DELETE
      delete: async (matchColumn: string, matchValue: any) => {
        if (!this.isConfigured()) return { data: null, error: 'Supabase is not configured' };

        try {
          const res = await fetch(`${baseUrl}?${encodeURIComponent(matchColumn)}=eq.${encodeURIComponent(matchValue)}`, {
            method: 'DELETE',
            headers: this.getHeaders({
              'Prefer': 'return=representation'
            })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return { data: null, error: err.message || `HTTP ${res.status}` };
          }
          return { data: true, error: null };
        } catch (e: any) {
          return { data: null, error: e?.message || 'Network error' };
        }
      }
    };
  }

  /**
   * Tests Supabase Connection & table accessibility
   */
  public async testConnection(): Promise<{
    ok: boolean;
    message: string;
    counts?: Record<string, number>;
  }> {
    if (!this.isConfigured()) {
      return { ok: false, message: 'Supabase Project URL and Anon Key are missing or incomplete.' };
    }

    try {
      // Test products table
      const res = await fetch(`${this.url}/rest/v1/products?select=id&limit=1`, {
        method: 'GET',
        headers: this.getHeaders({ 'Prefer': 'count=exact' })
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return { ok: false, message: 'Invalid Supabase Anon Key or authorization failed.' };
        }
        if (res.status === 404) {
          return { ok: false, message: 'Supabase tables not found. Please run the supabase_schema.sql script in Supabase SQL Editor.' };
        }
        const err = await res.json().catch(() => ({}));
        return { ok: false, message: err.message || `HTTP Error ${res.status}` };
      }

      // Check counts of key tables
      const tables = ['products', 'inquiries', 'blog_posts', 'team_members'];
      const counts: Record<string, number> = {};

      for (const t of tables) {
        const cRes = await fetch(`${this.url}/rest/v1/${t}?select=id&limit=1`, {
          method: 'GET',
          headers: this.getHeaders({ 'Prefer': 'count=exact' })
        });
        const range = cRes.headers.get('content-range') || '';
        const match = range.match(/\/(\d+)/);
        counts[t] = match ? parseInt(match[1], 10) : 0;
      }

      return {
        ok: true,
        message: 'Successfully connected to Supabase PostgreSQL!',
        counts
      };
    } catch (e: any) {
      return {
        ok: false,
        message: `Connection failed: ${e?.message || 'Network unreachable'}`
      };
    }
  }

  /**
   * Fast Initial Site Data Bootstrap from Supabase
   */
  public async fetchBootstrap(): Promise<{
    products: any[];
    blogPosts: any[];
    teamMembers: any[];
    inquiries: any[];
    companyConfig: any;
    customGallery: any[];
    testimonials: any[];
    users: any[];
  } | null> {
    if (!this.isConfigured()) return null;

    try {
      const [prodRes, blogRes, teamRes, inqRes, compRes, galRes, testRes, userRes] = await Promise.all([
        this.from('products').select('payload_json', {}, 'sort_order.asc'),
        this.from('blog_posts').select('payload_json', {}, 'sort_order.asc'),
        this.from('team_members').select('payload_json', {}, 'sort_order.asc'),
        this.from('inquiries').select('*', {}, 'created_at.desc'),
        this.from('company_config').select('payload_json', { id: 'eq.1' }),
        this.from('custom_gallery').select('*', {}, 'created_at.desc'),
        this.from('testimonials').select('payload_json', {}, 'created_at.desc'),
        this.from('users').select('id,name,email,role,avatar,department,created_at,last_login', {}, 'name.asc')
      ]);

      const products = (prodRes.data || []).map((r: any) => r.payload_json).filter(Boolean);
      const blogPosts = (blogRes.data || []).map((r: any) => r.payload_json).filter(Boolean);
      const teamMembers = (teamRes.data || []).map((r: any) => r.payload_json).filter(Boolean);
      const inquiries = (inqRes.data || []).map((r: any) => ({
        id: r.id,
        fullName: r.full_name,
        companyName: r.company_name,
        businessEmail: r.business_email,
        country: r.country,
        phoneWhatsApp: r.phone_whatsapp,
        product: r.product,
        productForm: r.product_form,
        quantityRequired: r.quantity_required,
        packagingRequirement: r.packaging_requirement,
        destinationPort: r.destination_port,
        message: r.message,
        status: r.status,
        source: r.source,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      const companyConfig = compRes.data && compRes.data[0] ? compRes.data[0].payload_json : null;
      const customGallery = (galRes.data || []).map((r: any) => ({
        id: r.id,
        url: r.url,
        title: r.title,
        category: r.category,
        description: r.description,
        tag: r.tag,
        isUploaded: r.is_uploaded,
        createdAt: r.created_at
      }));
      const testimonials = (testRes.data || []).map((r: any) => r.payload_json).filter(Boolean);
      const users = userRes.data || [];

      return {
        products,
        blogPosts,
        teamMembers,
        inquiries,
        companyConfig,
        customGallery,
        testimonials,
        users
      };
    } catch (e) {
      console.warn('[Supabase Bootstrap Error]:', e);
      return null;
    }
  }
}

export const supabase = new SupabaseClient();
