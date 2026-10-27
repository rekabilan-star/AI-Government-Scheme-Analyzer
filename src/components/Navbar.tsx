import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { notificationApi } from '../services/api.js';
import { Notification } from '../types/index.js';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Bot,
  ListTodo,
  Bookmark,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  MessageSquareHeart,
  ChevronDown,
  Building,
  Scale,
  SlidersHorizontal,
  GraduationCap,
  Volume2,
  VolumeX,
  Sun,
  Eye
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, login, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [isNarrating, setIsNarrating] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      // Non-blocking notification fetch failure
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickLogin = async (role: 'citizen' | 'admin') => {
    try {
      if (role === 'admin') {
        await login('admin@gov.in', 'Admin@1234');
        navigate('/admin');
      } else {
        await login('citizen@demo.in', 'Citizen@1234');
        navigate('/profile');
      }
      setShowUserDropdown(false);
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  const toggleNarratePage = () => {
    if ('speechSynthesis' in window) {
      if (isNarrating) {
        window.speechSynthesis.cancel();
        setIsNarrating(false);
      } else {
        const textToRead = document.querySelector('main')?.textContent || 'AI-Powered Government Scheme Analyzer and Recommendation System.';
        const utterance = new SpeechSynthesisUtterance(textToRead.slice(0, 500));
        utterance.rate = 1.0;
        utterance.onend = () => setIsNarrating(false);
        utterance.onerror = () => setIsNarrating(false);
        window.speechSynthesis.speak(utterance);
        setIsNarrating(true);
      }
    }
  };

  const changeFontSize = (size: 'normal' | 'large' | 'larger') => {
    setFontSize(size);
    const root = document.documentElement;
    if (size === 'larger') {
      root.style.fontSize = '18px';
    } else if (size === 'large') {
      root.style.fontSize = '17px';
    } else {
      root.style.fontSize = '16px';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* National Tricolor Top Strip */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-white border-t border-slate-100" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* GovTech Institutional Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-400">भारत सरकार · Government of India</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">Public Service Digital Architecture</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher for Viva Presentations */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              <span className="text-[10px] text-slate-400 font-medium">Demo Auth:</span>
              <button
                onClick={() => handleQuickLogin('citizen')}
                className="text-[10px] font-bold text-amber-300 hover:text-amber-200 transition-colors"
                title="1-Click Login as Citizen"
              >
                Citizen
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => handleQuickLogin('admin')}
                className="text-[10px] font-bold text-indigo-300 hover:text-indigo-200 transition-colors"
                title="1-Click Login as Admin"
              >
                Admin
              </button>
            </div>

            {/* Accessibility Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={toggleNarratePage}
                className={`p-1 rounded hover:text-white transition-colors flex items-center gap-1 ${isNarrating ? 'text-amber-400 font-bold' : ''}`}
                title="Screen Reader / Text-to-Speech"
              >
                {isNarrating ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden md:inline text-[10px]">{isNarrating ? 'Stop Audio' : 'Screen Reader'}</span>
              </button>

              <span className="text-slate-600">|</span>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => changeFontSize('normal')}
                  className={`px-1 py-0.5 rounded text-[10px] ${fontSize === 'normal' ? 'bg-slate-700 text-white font-bold' : 'hover:text-white'}`}
                  title="Standard Font Size"
                >
                  A-
                </button>
                <button
                  onClick={() => changeFontSize('large')}
                  className={`px-1 py-0.5 rounded text-[10px] ${fontSize === 'large' ? 'bg-slate-700 text-white font-bold' : 'hover:text-white'}`}
                  title="Large Font Size"
                >
                  A
                </button>
                <button
                  onClick={() => changeFontSize('larger')}
                  className={`px-1 py-0.5 rounded text-[10px] ${fontSize === 'larger' ? 'bg-slate-700 text-white font-bold' : 'hover:text-white'}`}
                  title="Extra Large Font Size"
                >
                  A+
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Portal Name */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <Building className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                  Scheme<span className="text-blue-700">Analyzer</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                  AI-GOV
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Government Scheme Recommendation System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Zero-Pill Typography) */}
          <nav className="hidden xl:flex items-center gap-6">
            <Link
              to="/schemes"
              className={`text-xs font-semibold tracking-tight transition-colors ${
                isActive('/schemes')
                  ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schemes Directory
            </Link>

            <Link
              to="/eligibility"
              className={`text-xs font-semibold tracking-tight transition-colors ${
                isActive('/eligibility')
                  ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eligibility Analyzer
            </Link>

            <Link
              to="/simulator"
              className={`text-xs font-semibold tracking-tight transition-colors flex items-center gap-1 ${
                isActive('/simulator')
                  ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulator</span>
            </Link>

            <Link
              to="/recommendations"
              className={`text-xs font-semibold tracking-tight transition-colors ${
                isActive('/recommendations')
                  ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recommendations
            </Link>

            <Link
              to="/compare"
              className={`text-xs font-semibold tracking-tight transition-colors ${
                isActive('/compare')
                  ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compare
            </Link>

            <Link
              to="/chat"
              className={`text-xs font-semibold tracking-tight transition-colors flex items-center gap-1 ${
                isActive('/chat')
                  ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Copilot</span>
            </Link>

            {user && (
              <Link
                to="/applications"
                className={`text-xs font-semibold tracking-tight transition-colors ${
                  isActive('/applications')
                    ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Applications
              </Link>
            )}

            <Link
              to="/viva-hub"
              className={`text-xs font-bold tracking-tight transition-colors flex items-center gap-1 ${
                isActive('/viva-hub')
                  ? 'text-blue-700 border-b-2 border-blue-700 pb-1'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
              <span>Viva & Architecture</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1 ${
                  isActive('/admin') ? 'border-b-2 border-amber-600 pb-1' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 relative transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-blue-600 hover:underline font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-xs text-slate-500 text-center">No notifications</p>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`p-3 text-xs ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}
                            >
                              <p className="font-semibold text-slate-900">{n.title}</p>
                              <p className="text-slate-600 text-[11px] mt-0.5">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Avatar Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-800">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Profile & Eligibility</span>
                      </Link>

                      <Link
                        to="/saved"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Schemes</span>
                      </Link>

                      <Link
                        to="/feedback"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <MessageSquareHeart className="w-4 h-4 text-slate-400" />
                        <span>Citizen Feedback</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-800 py-1.5"
          >
            Schemes Directory
          </Link>
          <Link
            to="/eligibility"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-800 py-1.5"
          >
            Eligibility Analyzer
          </Link>
          <Link
            to="/simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-800 py-1.5"
          >
            Real-Time Simulator
          </Link>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-800 py-1.5"
          >
            Recommendations
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-800 py-1.5"
          >
            Compare Schemes
          </Link>
          <Link
            to="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold text-slate-800 py-1.5"
          >
            AI Copilot
          </Link>
          <Link
            to="/viva-hub"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-bold text-blue-700 py-1.5"
          >
            Viva & Architecture Hub
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold text-amber-700 py-1.5"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
