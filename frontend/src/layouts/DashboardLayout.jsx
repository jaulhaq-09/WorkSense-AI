import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const DashboardLayout = ({ title, onRefresh, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden font-sans text-zinc-100">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#09090b]">
        <Navbar
          title={title}
          onRefresh={onRefresh}
          onToggleMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-6xl mx-auto space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
