import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const getInitialMode = () => {
    if (window.innerWidth < 768) return 'hidden';
    return 'open';
  };

  // 'open' | 'collapsed' | 'hidden'
  const [sidebarMode, setSidebarMode] = useState(getInitialMode);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarMode(m => m === 'open' ? 'hidden' : m);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setSidebarMode(m => m === 'hidden' ? 'open' : 'hidden');
    } else {
      setSidebarMode(m => m === 'open' ? 'collapsed' : 'open');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile backdrop — shown when full sidebar is open on mobile */}
      {sidebarMode === 'open' && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarMode('hidden')}
        />
      )}

      <Sidebar mode={sidebarMode} onClose={() => setSidebarMode('hidden')} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={handleMenuClick} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
