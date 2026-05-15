import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type StatusKind = 'loading' | 'success' | 'warning' | 'error';

export default function TestDB() {
  const [statusKind, setStatusKind] = useState<StatusKind>('loading');
  const [statusText, setStatusText] = useState('Testing connection...');
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [envCheck, setEnvCheck] = useState({
    url: '',
    key: ''
  });

  useEffect(() => {
    setEnvCheck({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'MISSING'
    });

    testConnection();
  }, []);

  async function testConnection() {
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*');

      if (queryError) {
        setError(`Database Error: ${queryError.message}`);
        setStatusKind('error');
        setStatusText('Connection Failed');
        console.error('Query error:', queryError);
        return;
      }

      if (!data || data.length === 0) {
        setError('Users table is empty! You need to run the SQL schema.');
        setStatusKind('warning');
        setStatusText('Table Empty');
        return;
      }

      setUsers(data);
      setStatusKind('success');
      setStatusText('Connection Successful!');
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
      setStatusKind('error');
      setStatusText('Connection Failed');
      console.error('Exception:', err);
    }
  }

  const StatusIcon = () => {
    if (statusKind === 'success') {
      return (
        <svg width="20" height="20" fill="none" stroke="#16a34a" strokeWidth={3} viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (statusKind === 'warning') {
      return (
        <svg width="20" height="20" fill="none" stroke="#d97706" strokeWidth={2} viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    if (statusKind === 'error') {
      return (
        <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth={3} viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div style={{
      padding: '40px',
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#8B0000', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Database Connection Test</span>
      </h1>

      <div style={{
        background: '#f0f0f0',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span>Status:</span>
          <StatusIcon />
          <span>{statusText}</span>
        </h2>
      </div>

      <div style={{
        background: '#e8f4f8',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Environment Variables:</h3>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Supabase URL: <code>{envCheck.url}</code></span>
        </p>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span>Anon Key: <code>{envCheck.key}</code></span>
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #f88',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c00' }}>Error:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{error}</pre>
        </div>
      )}

      {users.length > 0 && (
        <div style={{
          background: '#efe',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #8f8',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#060', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" fill="none" stroke="#16a34a" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Found {users.length} user(s):</span>
          </h3>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white'
          }}>
            <thead>
              <tr style={{ background: '#dfd' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Username</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Role</th>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ccc' }}>Password Type</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                    <strong>{user.username}</strong>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                    {user.role}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ccc' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {user.password.startsWith('$2') ? (
                        <>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Hashed</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2M6 21h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                          <span>Plain Text</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        background: '#fff3cd',
        padding: '20px',
        borderRadius: '8px',
        border: '2px solid #ffc107'
      }}>
        <h3>Next Steps:</h3>
        {users.length === 0 ? (
          <ol>
            <li>Go to Supabase Dashboard &rarr; SQL Editor</li>
            <li>Run the SQL schema from supabase-schema.sql</li>
            <li>Refresh this page</li>
          </ol>
        ) : (
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>Database is ready! Try logging in at <a href="/login">the login page</a></span>
          </p>
        )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/" style={{
          color: '#8B0000',
          textDecoration: 'none',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </a>
      </div>
    </div>
  );
}
