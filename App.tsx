
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Unlock, Info, ShieldCheck, Menu, X, Github } from 'lucide-react';
import Home from './pages/Home';
import Encrypt from './pages/Encrypt';
import Decrypt from './pages/Decrypt';
import SecurityInfo from './pages/SecurityInfo';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', name: 'Home', icon: <Shield className="w-4 h-4" /> },
    { path: '/encrypt', name: 'Encrypt', icon: <Lock className="w-4 h-4" /> },
    { path: '/decrypt', name: 'Decrypt', icon: <Unlock className="w-4 h-4" /> },
    { path: '/security', name: 'Security', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-500 transition-colors">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              CipherVault
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="py-12 px-4 border-t border-slate-800 mt-auto bg-slate-950/50">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
      <div className="flex items-center space-x-2 mb-4 md:mb-0">
        <Shield className="w-5 h-5" />
        <span className="font-semibold text-slate-400">CipherVault</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
      <div className="flex space-x-6">
        <Link to="/security" className="hover:text-indigo-400 transition-colors">Encryption Logic</Link>
        <a href="#" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
          <Github className="w-4 h-4" /> Github
        </a>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-indigo-500/30">
        <Navbar />
        <main className="flex-grow pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/encrypt" element={<Encrypt />} />
              <Route path="/decrypt" element={<Decrypt />} />
              <Route path="/security" element={<SecurityInfo />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
