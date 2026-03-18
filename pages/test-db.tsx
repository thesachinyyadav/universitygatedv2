import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TestDB() {
  const [status, setStatus] = useState('Testing connection...');
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
        setStatus('❌ Connection Failed');
        console.error('Query error:', queryError);
        return;
      }

      if (!data || data.length === 0) {
        setError('⚠️ Users table is empty! You need to run the SQL schema.');
        setStatus('⚠️ Table Empty');
        return;
      }

      setUsers(data);
      setStatus('✅ Connection Successful!');
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
      setStatus('❌ Connection Failed');
      console.error('Exception:', err);
    }
  }

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#8B0000' }}>🔍 Database Connection Test</h1>
      
      <div style={{ 
        background: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Status: {status}</h2>
      </div>

      <div style={{ 
        background: '#e8f4f8', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Environment Variables:</h3>
        <p>📍 Supabase URL: <code>{envCheck.url}</code></p>
        <p>🔑 Anon Key: <code>{envCheck.key}</code></p>
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
          <h3 style={{ margin: '0 0 15px 0', color: '#060' }}>
            ✅ Found {users.length} user(s):
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
                    {user.password.startsWith('$2') ? '🔒 Hashed' : '🔓 Plain Text'}
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
            <li>Go to Supabase Dashboard → SQL Editor</li>
            <li>Run the SQL schema from supabase-schema.sql</li>
            <li>Refresh this page</li>
          </ol>
        ) : (
          <p>✅ Database is ready! Try logging in at <a href="/login">the login page</a></p>
        )}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/" style={{ 
          color: '#8B0000',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>← Back to Home</a>
      </div>
    </div>
  );
}
