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
      label: 'AI Query Studio',
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
  ];

  if (user) {
    return (
      <aside className="fixed left-0 top-0 bottom-0 z-50 w-[250px] border-r flex flex-col glass-panel border-b border-slate-800/80 backdrop-blur-md ">
        <div className="h-[72px] px-5 flex items-center border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#08090b] shadow-sm">
              <Database className="h-[17px] w-[17px]" />
            </div>
            <div className="text-left leading-none">
              <div className="text-md font-semibold text-white">
                Text2SQL
              </div>

              <div className="text-[12px] text-slate-400 mt-1 tracking-wide">
                Query. Analyze. Understand.
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 py-3">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500">
            Workspace
          </span>
        </div>
        <nav className="px-3 space-y-1">
          {appItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`relative w-full flex items-center gap-3 px-3 py-3 rounded-xl
                  text-left transition-all duration-150 group cursor-pointer
                  ${isActive
                    ? 'bg-white/[0.065] text-white'
                    : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
                  }
                `}
              >
                {isActive && (
                  <div className="
                  absolute left-0
                  w-[2px] h-5
                  rounded-full
                  bg-blue-400
                " />
                )}
                <div
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center
                    ${isActive
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'bg-transparent text-slate-500 group-hover:text-slate-300'
                    }
                  `}
                >
                  <Icon className="w-[17px] h-[17px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">
                    {item.label}
                  </div>
                  <div
                    className={`
                      text-[10px] mt-0.5
                      ${isActive
                        ? 'text-slate-400'
                        : 'text-slate-600 group-hover:text-slate-600'
                      }
                    `}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pb-3 pt-6">
          <div className="
          flex items-center gap-3
          px-3 py-3
          rounded-xl
          bg-white/[0.025]
          border border-white/[0.05]"
          >
            {user.picture && !imageError ? (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                onError={() => setImageError(true)}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="
              text-[12px]
              font-medium
              text-slate-200
              truncate
            ">
                {user.name}
              </div>
              <div className="
              text-[10px]
              text-slate-400
            ">
                Signed in
              </div>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="
              w-8 h-8
              rounded-lg
              flex items-center justify-center
              text-slate-600
              hover:text-red-400
              hover:bg-red-500/[0.08]
              transition
              cursor-pointer
            "
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="h-[72px] flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#08090b] shadow-sm"> <Database className="h-[17px] w-[17px]" /> </div>
            <div className="text-left">
              <div className="text-md font-semibold text-white">
                Text2SQL
              </div>
              <div className="hidden sm:block text-[12px] text-slate-400">
                Query. Analyze. Understand.
              </div>
            </div>
          </button>
          <nav className="hidden md:flex items-center gap-1 ">
            {landingItems.map((item) => {
              const isActive = activeTab === 'landing' && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative
                    px-4 py-2 rounded-md
                    text-[13px] font-medium
                    transition cursor-pointer
                    ${isActive
                      ? 'text-white bg-white/[0.06]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.035]'
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-blue-400" />
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/guest')}
              className="
                hidden sm:flex
                items-center gap-2
                px-3 py-2
                rounded-lg
                bg-white
                text-[#0b0d10]
                text-[12px]
                font-medium
                hover:bg-slate-300
                transition
                cursor-pointer
              "
            >
              <Zap className="w-3.5 h-3.5" />
              Try Now
            </button>
            {googleClientId && (
              <button
                type="button"
                onClick={() => login()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 transition hover:border-blue-500/50 hover:bg-blue-500/20 cursor-pointer shadow-sm"
              >
                <svg
                  className="h-6 w-6"
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
          </div>
        </div>
      </div>
    </header>
  );
}