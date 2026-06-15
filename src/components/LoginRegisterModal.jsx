import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function LoginRegisterModal({ 
  isOpen, 
  onClose, 
  initialMode = "register", 
  onSuccess 
}) {
  const { login, signup, verifySignupOTP, verifyLoginOTP } = useAuth();
  
  const [mode, setMode] = useState(initialMode); // "login" or "register"
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // 1 or 2 for registration
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    niche: '',
    platform: '',
    platformProfileUrl: '',
    role: 'creator'
  });

  // OTP Verification States
  const [otpState, setOtpState] = useState(null); // null | "signup_otp" | "login_otp"
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [localError, setLocalError] = useState("");

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    setIsAnimating(true);
    setFormData({ username: '', email: '', password: '', niche: '', platform: '', platformProfileUrl: '', role: 'creator' });
    setRegistrationStep(1);
    setOtpState(null);
    setOtpValue("");
    setLocalError("");
    setTimeout(() => {
      setMode(newMode);
      setIsAnimating(false);
    }, 150);
  };

  const handleNextStep = () => {
    // Validate page 1 fields before proceeding
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      alert('Please fill in all fields on this page');
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setRegistrationStep(2);
      setIsAnimating(false);
    }, 150);
  };

  const handlePrevStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setRegistrationStep(1);
      setIsAnimating(false);
    }, 150);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setLocalError("");
    try {
      await api.post("/auth/resend-otp", {
        email: formData.email,
        type: otpState === "login_otp" ? "login" : "signup"
      });
      setResendTimer(60); // 60s cooldown
    } catch (err) {
      setLocalError(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");
    
    try {
      if (otpState) {
        // --- OTP verification ---
        let result;
        if (otpState === 'signup_otp') {
          result = await verifySignupOTP({
            email: formData.email,
            otp: otpValue
          });
        } else {
          result = await verifyLoginOTP({
            email: formData.email,
            otp: otpValue
          });
        }
        onSuccess(result.user, otpState === 'signup_otp');
      } else {
        // --- Credentials login/signup ---
        if (mode === 'register') {
          const res = await signup({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            niche: formData.niche,
            platform: formData.platform,
            platformProfileUrl: formData.platformProfileUrl,
            role: formData.role
          });
          if (res?.otpRequired) {
            setOtpState('signup_otp');
            setResendTimer(60);
          } else {
            onSuccess(res.user, true);
          }
        } else {
          const res = await login({
            email: formData.email,
            password: formData.password
          });
          if (res?.otpRequired) {
            setOtpState('login_otp');
            setResendTimer(60);
          } else {
            onSuccess(res.user, false);
          }
        }
      }
    } catch (error) {
      const data = error?.response?.data;
      if (data?.unverified) {
        // User exists but has not verified their email, transition directly to registration OTP screen!
        setOtpState('signup_otp');
        setResendTimer(60);
        setLocalError(data?.message || "Please verify your email to complete registration.");
      } else {
        setLocalError(data?.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .slider-track {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 50px;
          padding: 4px;
          position: relative;
          display: flex;
          gap: 4px;
        }
        .slider-thumb {
          position: absolute;
          top: 4px;
          left: 4px;
          height: calc(100% - 8px);
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 50px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1;
        }
        .slider-thumb.register {
          width: calc(50% - 2px);
        }
        .slider-thumb.login {
          width: calc(50% - 2px);
          transform: translateX(calc(100% + 4px));
        }
        .slider-btn {
          flex: 1;
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 50px;
          transition: color 0.3s;
          position: relative;
          z-index: 2;
        }
        .slider-btn.active {
          color: white;
        }
        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
        }
        .form-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
        }
        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: scale(1.1);
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, rgba(18, 18, 36, 0.98), rgba(30, 30, 60, 0.98))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 24,
        width: '100%',
        maxWidth: 440,
        padding: 28,
        position: 'relative',
        boxShadow: '0 32px 80px rgba(0, 0, 0, 0.6)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 4
          }}>
            {otpState 
              ? otpState === 'signup_otp' ? 'Verify Your Email' : 'Enter OTP'
              : mode === 'register' 
                ? registrationStep === 1 ? 'Create Account' : 'Complete Your Profile'
                : 'Welcome Back'
            }
          </h2>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            {otpState
              ? 'A 6-digit OTP code has been sent to your email.'
              : mode === 'register' 
                ? registrationStep === 1 
                  ? 'Enter your basic information to get started'
                  : 'Tell us about your content creation'
                : 'Sign in to continue creating viral content'
            }
          </p>
          
          {/* Progress Indicator for Registration */}
          {mode === 'register' && !otpState && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 8, 
              marginTop: 16 
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: registrationStep >= 1 ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
                transition: 'background 0.3s'
              }}></div>
              <div style={{
                width: 32,
                height: 2,
                background: registrationStep >= 2 ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
                transition: 'background 0.3s'
              }}></div>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: registrationStep >= 2 ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
                transition: 'background 0.3s'
              }}></div>
            </div>
          )}
        </div>

        {/* Mode Slider */}
        {!otpState && (
          <div style={{ marginBottom: 24 }}>
            <div className="slider-track">
              <div className={`slider-thumb ${mode}`}></div>
              <button 
                className={`slider-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => handleModeSwitch('register')}
              >
                Register
              </button>
              <button 
                className={`slider-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => handleModeSwitch('login')}
              >
                Login
              </button>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div style={{
          transition: 'all 0.3s ease',
          transform: isAnimating ? (mode === 'login' ? 'translateX(-20px)' : 'translateX(20px)') : 'translateX(0)',
          opacity: isAnimating ? 0 : 1
        }}>
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {localError && (
              <div style={{
                marginBottom: 16,
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 8,
                color: '#ef4444',
                fontSize: 13,
                textAlign: 'center'
              }}>
                {localError}
              </div>
            )}

            {/* OTP Mode Layout */}
            {otpState && (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <p style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
                    Enter the 6-digit OTP code sent to your email:<br />
                    <b style={{ color: '#a78bfa', fontSize: 15 }}>{formData.email}</b>
                  </p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-Digit OTP"
                    className="form-input"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))} // Numeric only
                    required
                    disabled={loading}
                    autoFocus
                    style={{
                      textAlign: 'center',
                      fontSize: 22,
                      letterSpacing: 8,
                      fontWeight: 800,
                      color: '#a78bfa',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading || otpValue.length < 6}
                  style={{
                    opacity: (loading || otpValue.length < 6) ? 0.7 : 1,
                    cursor: (loading || otpValue.length < 6) ? 'not-allowed' : 'pointer',
                    marginBottom: 20
                  }}
                >
                  {loading ? 'Verifying OTP…' : 'Verify & Proceed'}
                </button>

                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.6)' }}>
                    Didn't receive the email?{' '}
                    {resendTimer > 0 ? (
                      <span style={{ color: '#6366f1', fontWeight: 600 }}>Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a78bfa',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpState(null);
                      setOtpValue("");
                      setLocalError("");
                    }}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontSize: 13,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    ← Back to {mode === 'register' ? 'Register' : 'Login'}
                  </button>
                </div>
              </>
            )}

            {/* Standard Mode Layout */}
            {!otpState && mode === 'register' && registrationStep === 1 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="form-input"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {!otpState && mode === 'register' && registrationStep === 2 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    name="niche"
                    placeholder="Content Niche (e.g., Tech, Fashion, Fitness)"
                    className="form-input"
                    value={formData.niche}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <select
                    name="platform"
                    className="form-input"
                    value={formData.platform}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      color: formData.platform ? 'white' : 'rgba(255, 255, 255, 0.4)',
                      fontSize: 15,
                      transition: 'all 0.3s',
                      outline: 'none'
                    }}
                  >
                    <option value="" style={{ background: '#1a1a2e', color: 'white' }}>Select Platform</option>
                    <option value="Instagram" style={{ background: '#1a1a2e', color: 'white' }}>Instagram</option>
                    <option value="YouTube" style={{ background: '#1a1a2e', color: 'white' }}>YouTube</option>
                    <option value="TikTok" style={{ background: '#1a1a2e', color: 'white' }}>TikTok</option>
                    <option value="Twitter" style={{ background: '#1a1a2e', color: 'white' }}>Twitter</option>
                    <option value="LinkedIn" style={{ background: '#1a1a2e', color: 'white' }}>LinkedIn</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="url"
                    name="platformProfileUrl"
                    placeholder="Profile URL (e.g., https://instagram.com/username)"
                    className="form-input"
                    value={formData.platformProfileUrl}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {!otpState && mode === 'login' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {!otpState && mode === 'login' && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 20
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <input type="checkbox" style={{ margin: 0 }} />
                  Remember me
                </label>
                <button 
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: 13,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Registration Step 1: Next Button */}
            {!otpState && mode === 'register' && registrationStep === 1 && (
              <button 
                type="button"
                onClick={handleNextStep}
                className="submit-btn"
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Next Step →
              </button>
            )}

            {/* Registration Step 2: Back and Submit Buttons */}
            {!otpState && mode === 'register' && registrationStep === 2 && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="button"
                  onClick={handlePrevStep}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                  style={{
                    flex: 2,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: 16, 
                        height: 16, 
                        border: '2px solid white', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }}></span>
                      Creating...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            )}

            {/* Login Submit Button */}
            {!otpState && mode === 'login' && (
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: 16, 
                      height: 16, 
                      border: '2px solid white', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }}></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            )}
          </form>

          {/* Terms */}
          {!otpState && mode === 'register' && (
            <p style={{
              margin: '16px 0 0',
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.4)',
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              By creating an account, you agree to our{' '}
              <button style={{
                background: 'none',
                border: 'none',
                color: '#6366f1',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 11
              }}>
                Terms of Service
              </button>{' '}
              and{' '}
              <button style={{
                background: 'none',
                border: 'none',
                color: '#6366f1',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 11
              }}>
                Privacy Policy
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
