'use client';

import { useEffect, useState } from 'react';

type Settings = {
    system_prompt: string;
    site_url: string;
    candidate_link: string;
    agency_link: string;
    tone: string;
};

export default function AdminDashboard() {
    const [settings, setSettings] = useState<Settings>({
        system_prompt: '',
        site_url: '',
        candidate_link: '',
        agency_link: '',
        tone: '',
    });
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');

    async function loadAll() {
        setLoading(true);
        setError('');
        try {
            const auth = sessionStorage.getItem('adminAuth');
            const headers: Record<string, string> = {};
            if (auth) headers['Authorization'] = `Basic ${auth}`;

            const sRes = await fetch('/api/admin/settings', { cache: 'no-store', headers });
            if (!sRes.ok) {
                const txt = await sRes.text();
                throw new Error(`Settings Fetch Error (${sRes.status}): ${txt.slice(0, 100)}`);
            }
            const s = await sRes.json();
            if (s?.error) throw new Error(s.error);
            setSettings(s);

            const hRes = await fetch('/api/admin/history', { cache: 'no-store', headers });
            if (!hRes.ok) {
                const txt = await hRes.text();
                throw new Error(`History Fetch Error (${hRes.status}): ${txt.slice(0, 100)}`);
            }
            const h = await hRes.json();
            if (h?.error) throw new Error(h.error);
            setHistory(h.items || []);
        } catch (e: any) {
            console.error('[Dashboard LoadAll] Error:', e);
            setError(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadAll(); }, []);

    async function save() {
        setSaving(true);
        setError('');
        try {
            const auth = sessionStorage.getItem('adminAuth');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (auth) headers['Authorization'] = `Basic ${auth}`;

            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers,
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data?.error) throw new Error(data.error);
            alert('Налаштування збережено!');
        } catch (e: any) {
            setError(String(e?.message || e));
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
                <p>Завантаження...</p>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    marginBottom: '30px'
                }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#1a202c' }}>
                        🤖 Адмін-панель WhatsApp Bot
                    </h1>
                    <p style={{ color: '#718096', marginBottom: '32px' }}>
                        Налаштування промптів та параметрів Gemini AI
                    </p>

                    {error && (
                        <div style={{
                            background: '#fed7d7',
                            color: '#c53030',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            border: '1px solid #fc8181'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>
                            System Prompt (Промпт для Gemini)
                        </label>
                        <textarea
                            value={settings.system_prompt}
                            onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                            rows={6}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontFamily: 'monospace',
                                resize: 'vertical',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>
                            Site URL
                        </label>
                        <input
                            type="url"
                            value={settings.site_url}
                            onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>
                            Candidate Link
                        </label>
                        <input
                            type="url"
                            value={settings.candidate_link}
                            onChange={(e) => setSettings({ ...settings, candidate_link: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>
                            Agency Link
                        </label>
                        <input
                            type="url"
                            value={settings.agency_link}
                            onChange={(e) => setSettings({ ...settings, agency_link: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>
                            Tone (Тон спілкування)
                        </label>
                        <input
                            type="text"
                            value={settings.tone}
                            onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                            placeholder="наприклад: friendly, professional"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <button
                        onClick={save}
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: saving ? '#a0aec0' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: saving ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.4)'
                        }}
                        onMouseEnter={(e) => {
                            if (!saving) {
                                e.currentTarget.style.background = '#059669';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!saving) {
                                e.currentTarget.style.background = '#10b981';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        {saving ? '💾 Збереження...' : '✅ Зберегти налаштування'}
                    </button>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: '#1a202c' }}>
                        📜 Історія повідомлень
                    </h2>
                    {history.length === 0 ? (
                        <p style={{ color: '#718096' }}>Немає повідомлень</p>
                    ) : (
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {history.map((msg, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '16px',
                                        background: '#f7fafc',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px' }}>
                                        {new Date(msg.created_at).toLocaleString('uk-UA')}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#2d3748', fontFamily: 'monospace' }}>
                                        <strong>{msg.role}:</strong> {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
