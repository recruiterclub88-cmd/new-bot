'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        sessionStorage.setItem('adminAuth', btoa(`${username}:${password}`));
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        setError(data.error === 'SERVER_CONFIG_ERROR' ? `Сервісна помилка: ${data.details}` : 'Неправильний логін або пароль');
      }
    } catch (err) {
      setError('Помилка підключення до сервера');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#1a202c'
          }}>
            🤖 WhatsApp Bot
          </h1>
          <p style={{ color: '#718096', fontSize: '15px' }}>
            Вхід в адмін-панель
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#2d3748',
              fontSize: '14px'
            }}>
              Логін
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введіть логін"
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#2d3748',
              fontSize: '14px'
            }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть пароль"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.2s',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fed7d7',
              color: '#c53030',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              border: '1px solid #fc8181'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#a0aec0' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#5a67d8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? '⏳ Перевірка...' : '🔓 Увійти'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#a0aec0',
            fontSize: '13px',
            margin: 0
          }}>
            Налаштування промптів Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
