import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Here you would typically handle the login logic
    // For now, just show a message
    console.log('Login attempt:', { email, password, username });
    
    // Redirect to dashboard after successful login
    // window.location.href = '/dashboard';
  };

  const handleRegister = () => {
    setIsLogin(false);
    setError('');
  };

  const handleLogin = () => {
    setIsLogin(true);
    setError('');
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
        {/* Header with toggle */}
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
            {isLogin ? 'Login to VIRALRUSH' : 'Register to VIRALRUSH'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {isLogin ? (
            <>
              <input
                type="text"
                placeholder="Username or Email"
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
            </>
          ) : (
            <>
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
                type="text"
                placeholder="Username"
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
            </>
          )}

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
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '1rem'
            }}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>

          {/* Toggle switch */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem'
          }}>
            <span style={{ color: '#666', fontSize: '0.875rem' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={isLogin ? handleRegister : handleLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a1a1a',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
