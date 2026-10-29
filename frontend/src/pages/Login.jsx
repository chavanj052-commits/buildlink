import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building, Check, ArrowRight } from 'lucide-react';
import API, { initSocket } from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      initSocket();
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Navy Branding Panel */}
      <div className="auth-page__brand-panel">
        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <Building size={24} />
          </div>
          <div className="auth-brand-name">BuildLink</div>
        </div>

        <div className="auth-brand-body">
          <h1 className="auth-brand-title">
            Build <span>Smarter</span> Together.
          </h1>
          <p className="auth-brand-desc">
            The next-generation construction project management platform aligning
            homeowners, contractors, and builders in real-time clarity.
          </p>

          <div className="auth-brand-features">
            <div className="auth-feature-row">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <span>Real-time milestone & blueprint tracking</span>
            </div>
            <div className="auth-feature-row">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <span>Transparent INR budget disbursement & payment escrow</span>
            </div>
            <div className="auth-feature-row">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <span>Contractor material requisition & site photo auditing</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          © {new Date().getFullYear()} BuildLink Enterprise Inc. High-velocity construction management.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-page__form-panel">
        <div className="auth-form-header">
          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-subtitle">
            Enter your credentials to access your construction workspace.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                name="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@buildlink.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions will be sent to your registered email.');
                }}
                style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}
              >
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '18px 0 24px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              <span>Keep me signed in for 30 days</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', padding: '12px', fontSize: '14.5px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Social login divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => alert('Social sign-on is managed through corporate SSO.')}
          >
            Google Workspace
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => alert('Apple ID sign-on is enabled for mobile apps.')}
          >
            Apple ID
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--accent)', fontWeight: 700 }}
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
