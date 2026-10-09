import React, { useState } from 'react';
import {
  Sparkles,
  Database,
  Terminal,
  UploadCloud,
  Zap,
  LogOut,
  User,
  LayoutDashboard,
  ChevronRight,
  History,
  Menu,
  X,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router-dom';

export function Navigation({
  activeTab,
  activeSection,
  onNavigate,
  user,
  onGoogleSuccess,
  onGoogleError,
  onSignOut,
  googleClientId,
}) {
  const login = useGoogleLogin({
    onSuccess: onGoogleSuccess,
    onError: onGoogleError,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const landingItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'workflow', label: 'How It Works' },
    { id: 'observability', label: 'Observability' },
  ];

  const appItems = [
    {
      id: 'agent',
      path: '/query',
      label: 'AI Query',
      description: 'Ask your database',
      icon: Sparkles,
    },
    {
      id: 'schema',
      path: '/schema',
      label: 'Database Schema',
      description: 'Tables & columns',
      icon: Database,
    },
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'Overview',
      description: 'Usage & costs',
      icon: LayoutDashboard,
    },
    {
      id: 'console',
      path: '/sql-console',
      label: 'SQL Console',
      description: 'Run SQL directly',
      icon: Terminal,
    },
    {
      id: 'dataset',
      path: '/dataset',
      label: 'Import Data',
      description: 'CSV, Excel & JSON',
      icon: UploadCloud,
    },
    {
      id: 'history',
      path: '/history',
      label: 'Query History',
      description: 'Past queries & sessions',
      icon: History,
    },
  ];

  const handleLandingNavigation = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleAppNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  if (user) {
    return (
      <>
        <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center border-b border-slate-800/80 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-slate-300 transition hover:bg-white/[0.06]"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        <aside
          className={`fixed bottom-0 left-0 top-0 z-50 flex w-[270px] flex-col border-r border-slate-800/80 glass-panel backdrop-blur-md transition-transform duration-300 lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#08090b] shadow-sm">
                <Database className="h-[17px] w-[17px]" />
              </div>

              <div className="text-left leading-none">
                <div className="text-md font-semibold text-white">
                  Text2SQL
                </div>

                <div className="mt-1 text-[12px] tracking-wide text-slate-400">
                  Query. Analyze. Track Costs.
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-white/[0.05] hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-5 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Workspace
            </span>
          </div>

          <nav className="space-y-1 px-3">
            {appItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => handleAppNavigation(item.path)}
                  className={`group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-white/[0.065] text-white'
                      : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 h-5 w-[2px] rounded-full bg-blue-400" />
                  )}

                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-transparent text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-[17px] w-[17px]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium">
                      {item.label}
                    </div>

                    <div
                      className={`mt-0.5 text-[10px] ${
                        isActive ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto px-3 pb-3 pt-6">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-3">
              {user.picture && !imageError ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  onError={() => setImageError(true)}
                  className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-slate-200">
                  {user.name}
                </div>

                <div className="text-[10px] text-slate-400">
                  Signed in
                </div>
              </div>

              <button
                onClick={onSignOut}
                title="Sign Out"
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/[0.08] hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
            mobileMenuOpen
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className="h-14 lg:hidden" />
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 glass-panel backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="flex h-[64px] items-center justify-between sm:h-[72px]">
          <button
            onClick={() => handleLandingNavigation('home')}
            className="group flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#08090b] shadow-sm">
              <Database className="h-[17px] w-[17px]" />
            </div>

            <div className="text-left">
              <div className="text-md font-semibold text-white">
                Text2SQL
              </div>

              <div className="text-[12px] text-slate-400">
                Query. Analyze. Track Costs.
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {landingItems.map((item) => {
              const isActive =
                activeTab === 'landing' && activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleLandingNavigation(item.id)}
                  className={`relative cursor-pointer rounded-md px-4 py-2 text-[13px] font-medium transition ${
                    isActive
                      ? 'bg-white/[0.06] text-white'
                      : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-blue-400" />
                  )}

                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/guest')}
              className="hidden cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-[12px] font-medium text-[#0b0d10] transition hover:bg-slate-300 sm:flex"
            >
              <Zap className="h-3.5 w-3.5" />
              Try Now
            </button>

            {googleClientId && (
              <button
                type="button"
                onClick={() => login()}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-sm transition hover:border-blue-500/50 hover:bg-blue-500/20 sm:h-10 sm:w-10"
              >
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-slate-300 transition hover:bg-white/[0.06] md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 md:hidden ${
            mobileMenuOpen
              ? 'max-h-96 border-t border-white/[0.06] py-3 opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="space-y-1">
            {landingItems.map((item) => {
              const isActive =
                activeTab === 'landing' && activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleLandingNavigation(item.id)}
                  className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/[0.06] text-white'
                      : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}