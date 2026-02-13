import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import {
  Menu,
  X,
  Zap,
  Activity,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, label }: { to: string, label: string }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`nav-link text-sm tracking-wide ${isActive(to) ? 'active' : ''}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-light selection:bg-primary selection:text-white">
      {/* Navbar - Floating Glass */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel rounded-full px-6 h-16 flex justify-between items-center backdrop-blur-md">

            {/* Logo area */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2 group">
                <Activity size={20} className="text-primary animate-pulse" />
                <span className="text-lg font-display font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                  SmartQueue
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              {!user && (
                <>
                  <NavItem to="/" label="Home" />
                  <NavItem to="/login" label="Access" />
                  <Link
                    to="/register"
                    className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 text-sm font-medium transition-all duration-300"
                  >
                    Initialize
                  </Link>
                </>
              )}

              {user && (
                <>
                  <NavItem to="/dashboard" label="Dashboard" />
                  <NavItem to="/booking" label="Book" />
                  <NavItem to="/predictions" label="Forecast" />

                  {user.role === UserRole.ADMIN && (
                    <>
                      <NavItem to="/admin" label="Admin" />
                      <NavItem to="/analytics" label="Data" />
                    </>
                  )}

                  <div className="h-4 w-px bg-white/10 mx-2"></div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-400 font-mono hidden lg:block">
                      {user.name}
                    </span>
                    <button
                      onClick={onLogout}
                      className="text-gray-500 hover:text-white transition-colors"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-full"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 glass-panel rounded-2xl mx-auto max-w-7xl overflow-hidden p-6 absolute left-6 right-6">
            <div className="flex flex-col space-y-6 text-center">
              {!user && (
                <>
                  <Link to="/" className="text-xl font-display font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                  <Link to="/login" className="text-xl font-display font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>Access</Link>
                  <Link to="/register" className="text-xl font-display font-medium text-primary" onClick={() => setIsMobileMenuOpen(false)}>Initialize</Link>
                </>
              )}
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-white">Dashboard</Link>
                  <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-white">Book</Link>
                  <Link to="/predictions" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-white">Forecast</Link>
                  {user.role === UserRole.ADMIN && (
                    <>
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-white">Admin</Link>
                      <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-white">Data</Link>
                    </>
                  )}
                  <button onClick={onLogout} className="text-red-400 pt-4">Terminte Session</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        {children}
      </main>

      {/* Footer - Brutalist Grid */}
      <footer className="border-t border-white/5 bg-black text-white pt-24 pb-12 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>

        <div className="w-full px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-6xl md:text-8xl font-display font-bold text-white mb-6 leading-[0.8]">
                SMART<br />QUEUE
              </h2>
              <p className="text-gray-400 text-lg max-w-md font-light leading-relaxed">
                Next-generation load balancing for physical spaces. <br />
                Powered by predictive algorithms.
              </p>
            </div>

            <div className="pt-4">
              <h4 className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">System</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg">Architecture</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg">Protocols</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg">Lab Notes</a></li>
              </ul>
            </div>

            <div className="pt-4">
              <h4 className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">Network</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg font-mono">GH / SmartQueue</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg font-mono">TW / @smartqueue</a></li>
                <li><a href="#" className="text-gray-300 hover:text-primary transition-colors text-lg font-mono">LI / SmartQueue</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-mono">
            <p>SMARTQUEUE V2.0 // 2024</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>SYSTEM OPERATIONAL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};