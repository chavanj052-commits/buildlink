import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, Users, HardHat, Check, ArrowRight } from 'lucide-react';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'company',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await API.post('/auth/register', form);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { id: 'company', label: 'Company / Builder', icon: Building, desc: 'Manage projects, budgets & team' },
    { id: 'homeowner', label: 'Homeowner', icon: Users, desc: 'Track construction & approve payments' },
    { id: 'contractor', label: 'Contractor', icon: HardHat, desc: 'Log materials, updates & site work' },
  ];

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
            Join the <span>Next Era</span> of Construction.
          </h1>
          <p className="auth-brand-desc">
            Connect construction companies, homeowners, and trade contractors
            under a single unified digital ledger and operational cockpit.
          </p>

          <div className="auth-brand-features">
            <div className="auth-feature-row">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <span>Role-filtered dashboards and sensitive cost isolation</span>
            </div>
            <div className="auth-feature-row">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <span>INR milestone payment requests and approvals</span>
            </div>
            <div className="auth-feature-row">
              <div className="auth-feature-check">
                <Check size={14} />
              </div>
              <span>Instant site photo and architectural document sharing</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          BuildLink Enterprise Inc. Secured with bank-grade encryption.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-page__form-panel">
        <div className="auth-form-header">
          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">
            Get started by selecting your role in the project lifecycle.
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

        {success && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              color: 'var(--success)',
              fontSize: '13px',
              marginBottom: '20px',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              fontWeight: 600,
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector visual cards */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Select Your Role</label>
            <div className="role-selector-grid">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const active = form.role === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`role-card ${active ? 'role-card--active' : ''}`}
                    onClick={() => handleRoleSelect(opt.id)}
                  >
                    <div className="role-card__icon">
                      <Icon size={18} />
                    </div>
                    <div className="role-card__title">{opt.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name or Entity Name</label>
            <div style={{ position: 'relative' }}>
              <User
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
                name="name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="e.g. Apex Builders or Rajesh Sharma"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
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
            <label className="form-label">Set Password</label>
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
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', padding: '12px', fontSize: '14.5px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Workspace'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--accent)', fontWeight: 700 }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
