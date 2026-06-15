import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password || !confirmPassword || !username) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Here you would typically handle the registration logic
    // For now, just show a message
    console.log('Registration attempt:', { email, password, username, confirmPassword });
    
    // Redirect to dashboard after successful registration
    // window.location.href = '/dashboard';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a, #10b981)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        width: '90%',
        maxWidth: '450px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: '#1a1a1a',
            fontSize: '1.8rem',
            fontWeight: '700',
            margin: '0'
          }}>
            Register to VIRALRUSH
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#333',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#333',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#333',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
              padding: '0.875rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#333',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />

          {/* Error message */}
          {error && (
            <div style={{
              color: '#dc2626',
              fontSize: '0.875rem',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a, #10b981)',
              color: 'white',
              border: 'none',
              padding: '0.875rem 1.5rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '1rem'
            }}
          >
            Register
          </button>

          {/* Login link */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem'
          }}>
            <span style={{ color: '#666', fontSize: '0.875rem' }}>
              Already have an account? 
            </span>
            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a1a1a',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
