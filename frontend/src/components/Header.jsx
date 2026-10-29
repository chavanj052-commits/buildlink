import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu, LogOut, Shield } from 'lucide-react';
import { useAuth } from './ProtectedRoute';
import { getInitials } from '../utils/format';

export default function Header({ onToggleSidebar, title: customTitle }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic route titles
  const getRouteTitle = () => {
    if (customTitle) return customTitle;
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Overview';
    if (path.startsWith('/projects/')) return 'Project Workspace';
    if (path.startsWith('/projects')) return 'Projects Management';
    if (path.startsWith('/materials')) return 'Materials & Procurement';
    if (path.startsWith('/payments')) return 'Financials & Payments';
    if (path.startsWith('/documents')) return 'Documents & Blueprints';
    if (path.startsWith('/team')) return 'Team & Directory';
    if (path.startsWith('/messages')) return 'Project Communication';
    return 'BuildLink Platform';
  };

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="header__title">{getRouteTitle()}</h1>
          <div className="header__subtitle">
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name || 'Partner'}</strong>
          </div>
        </div>
      </div>

      <div className="header__search">
        <Search className="header__search-icon" size={16} />
        <input
          type="text"
          className="header__search-input"
          placeholder="Search projects, materials, invoices..."
        />
      </div>

      <div className="header__right">
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            className="header__icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="header__badge" />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '46px',
              width: '300px',
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              border: '1px solid var(--border)',
              padding: '16px',
              zIndex: 50,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>Notifications</span>
                <span style={{ fontSize: '11px', color: 'var(--accent)', cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 600 }}>Project milestone reached</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Foundation complete for Villa Horizon</div>
                </div>
                <div style={{ fontSize: '12px', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 600 }}>Material shipment confirmed</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>50 bags cement delivered on site</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              transition: 'background 0.15s ease',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f1b2d 0%, #1e293b 100%)',
                color: '#e8a838',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                border: '2px solid rgba(232, 168, 56, 0.4)',
              }}
            >
              {getInitials(user?.name)}
            </div>
            <div style={{ display: 'none', md: 'block' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--accent)', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '200px',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)',
                padding: '8px',
                zIndex: 50,
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)',
                }}
              >
                <Shield size={14} /> Role: <span style={{ fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <button
                onClick={logout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: 'var(--danger)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '4px',
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
