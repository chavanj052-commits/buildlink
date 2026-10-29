import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  HardHat,
  Package,
  CreditCard,
  FileText,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Building,
} from 'lucide-react';
import { useAuth } from './ProtectedRoute';
import { getInitials } from '../utils/format';

export default function Sidebar({ user, isOpen, onClose }) {
  const { logout } = useAuth();
  const role = user?.role || 'company';

  // Define navigation configuration by role
  const getNavSections = () => {
    if (role === 'company') {
      return [
        {
          title: 'Management',
          items: [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/projects', label: 'Projects', icon: FolderKanban },
            { to: '/team', label: 'Homeowners & Team', icon: Users },
            { to: '/materials', label: 'Materials', icon: Package },
            { to: '/payments', label: 'Payments', icon: CreditCard },
            { to: '/documents', label: 'Documents', icon: FileText },
          ],
        },
        {
          title: 'Communication',
          items: [
            { to: '/messages', label: 'Messages', icon: MessageSquare },
          ],
        },
      ];
    } else if (role === 'homeowner') {
      return [
        {
          title: 'My Construction',
          items: [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/projects', label: 'My Project', icon: FolderKanban },
            { to: '/payments', label: 'Payments', icon: CreditCard },
            { to: '/documents', label: 'Documents & Designs', icon: FileText },
          ],
        },
        {
          title: 'Collaboration',
          items: [
            { to: '/messages', label: 'Messages', icon: MessageSquare },
          ],
        },
      ];
    } else {
      // Contractor
      return [
        {
          title: 'Site Execution',
          items: [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/projects', label: 'My Projects', icon: FolderKanban },
            { to: '/materials', label: 'Materials & Orders', icon: Package },
            { to: '/payments', label: 'Payments & Claims', icon: CreditCard },
            { to: '/documents', label: 'Site Photos & Docs', icon: FileText },
          ],
        },
        {
          title: 'Field Chat',
          items: [
            { to: '/messages', label: 'Messages', icon: MessageSquare },
          ],
        },
      ];
    }
  };

  const navSections = getNavSections();

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--open' : ''}`}
        onClick={onClose}
      />
      <aside className={`app-layout__sidebar ${isOpen ? 'app-layout__sidebar--open' : ''}`}>
        <div className="sidebar">
          {/* Brand header */}
          <div className="sidebar__brand">
            <div className="sidebar__logo-icon">
              <Building size={20} color="#0f1b2d" />
            </div>
            <div>
              <div className="sidebar__logo-text">BuildLink</div>
              <div style={{ fontSize: '10px', color: '#8899aa', fontWeight: 500 }}>
                Project Suite
              </div>
            </div>
            <span className="sidebar__logo-tag">{role}</span>
          </div>

          {/* Nav links */}
          <nav className="sidebar__nav">
            {navSections.map((section, idx) => (
              <React.Fragment key={idx}>
                <div className="sidebar__section-title">{section.title}</div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </React.Fragment>
            ))}
          </nav>

          {/* User profile footer */}
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {getInitials(user?.name)}
            </div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name" title={user?.name}>
                {user?.name || 'User'}
              </div>
              <div className="sidebar__user-role">{user?.role}</div>
            </div>
            <button
              className="sidebar__logout-btn"
              onClick={logout}
              title="Sign Out"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
