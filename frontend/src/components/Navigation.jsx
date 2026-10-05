import React, { useState } from 'react';
import {
  Flame,
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
import { GoogleLogin } from '@react-oauth/google';

export function Navigation({
  activeTab,
  setActiveTab,
  onOpenUpload,
  user,
  onGoogleSuccess,
  onGoogleError,
  onSignOut,
  googleClientId,
}) {

  const [imageError, setImageError] = useState(false);

  const landingItems = [
    { id: 'landing', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'workflow', label: 'How It Works' },
    { id: 'examples', label: 'Examples' },
  ];

  const appItems = [
    {
      id: 'agent',
      label: 'AI Query Studio',
      description: 'Ask your database',
      icon: Sparkles,
    },
    {
      id: 'schema',
      label: 'Database Schema',
      description: 'Tables & columns',
      icon: Database,
    },
    {
      id: 'dashboard',
      label: 'Overview',
      description: 'Usage & costs',
      icon: LayoutDashboard,
    },

    {
      id: 'console',
      label: 'SQL Console',
      description: 'Run SQL directly',
      icon: Terminal,
    },
  ];

  if (user) {
    return (
      <aside className="fixed left-0 top-0 bottom-0 z-50 w-[250px] border-r flex flex-col glass-panel border-b border-slate-800/80 backdrop-blur-md ">

        <div className="h-[72px] px-5 flex items-center border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#15191f] border border-white/[0.08] flex items-center justify-center">
              <Flame className="w-[18px] h-[18px] text-blue-400" />
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
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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

        <div className="px-5 py-3">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-slate-500">
            Data
          </span>
        </div>

        <div className="px-3">
          <button
            onClick={() => {
              setActiveTab('import-data');
              onOpenUpload();
            }}
            className={`
    relative w-full flex items-center gap-3 px-3 py-3 rounded-xl
    text-left transition-all duration-150 group cursor-pointer
    ${activeTab === 'import-data'
                ? 'bg-white/[0.065] text-white'
                : 'text-slate-400 hover:bg-white/[0.035] hover:text-slate-200'
              }
  `}
          >
            {activeTab === 'import-data' && (
              <div className="
      absolute left-0
      w-[2px] h-5
      rounded-full
      bg-blue-400
    " />
            )}
            <div className={`
      w-8 h-8 rounded-md flex items-center justify-center
      ${activeTab === 'import-data'
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-transparent text-slate-500 group-hover:text-slate-300'
              }
    `}>
              <UploadCloud className="w-[17px] h-[17px]" />
            </div>

            <div className="text-left">
              <div className="text-[13px] font-medium">
                Import Data
              </div>
              <div
                className={`
        text-[10px] mt-0.5
        ${activeTab === 'import-data'
                    ? 'text-slate-400'
                    : 'text-slate-600'
                  }
      `}
              >
                CSV, Excel & JSON
              </div>
            </div>
            {activeTab === 'import-data' && (
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
            )}
          </button>
        </div>

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
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="
              w-9 h-9
              rounded-lg
              bg-[#15191f]
              border border-white/[0.08]
              flex items-center justify-center
              group-hover:border-white/[0.15]
              transition
            ">
              <Flame className="w-[18px] h-[18px] text-blue-400" />
            </div>

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
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
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
              onClick={() => setActiveTab('guest')}
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
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                type="icon"
                shape="circle"
                theme="filled_black"
                size="large"
              />
            )}

          </div>

        </div>
      </div>
    </header>
  );
}