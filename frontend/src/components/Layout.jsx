import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from './ProtectedRoute';

export default function Layout({ children, pageTitle }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-layout__main">
        <Header
          title={pageTitle}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="app-layout__content">
          {children}
        </main>
      </div>
    </div>
  );
}
