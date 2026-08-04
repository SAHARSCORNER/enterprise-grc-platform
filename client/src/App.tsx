import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './widgets/Navbar';
import { Sidebar } from './widgets/Sidebar';
import { GlobalSearchModal } from './widgets/GlobalSearchModal';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AssetsPage } from './pages/AssetsPage';
import { NetworkDiagramPage } from './pages/NetworkDiagramPage';
import { AuditPage } from './pages/AuditPage';
import { TicketsPage } from './pages/TicketsPage';
import { useAuthStore } from './shared/stores/authStore';

export const App: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main Admin Panel Protected Layout */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
              {/* Sidebar Navigation */}
              <Sidebar />

              {/* Main Container */}
              <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/employees" element={<EmployeesPage />} />
                    <Route path="/assets" element={<AssetsPage />} />
                    <Route path="/graph" element={<NetworkDiagramPage />} />
                    <Route path="/audits" element={<AuditPage />} />
                    <Route path="/tickets" element={<TicketsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>

              {/* Global Search Dialog */}
              <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
