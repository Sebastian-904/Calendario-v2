
import React from 'react';
import { Shield, Bell, LogOut, HelpCircle, Globe, User as UserIcon } from 'lucide-react';
import type { Theme, User, TimeFormat } from '../../types';
import ThemeToggle from '../shared/ThemeToggle';
import { useTranslation } from '../../hooks/useTranslation';
import { useClock } from '../../hooks/useClock';
import Avatar from '../shared/Avatar';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
  timeFormat: TimeFormat;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, theme, toggleTheme, onOpenHelp, onOpenProfile, timeFormat }) => {
  const [isLangOpen, setLangOpen] = React.useState(false);
  const langMenuRef = React.useRef<HTMLDivElement>(null);

  const [isProfileOpen, setProfileOpen] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  
  const { t, setLanguage } = useTranslation();
  const currentTime = useClock(timeFormat);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          <span className="font-semibold tracking-wide text-lg text-zinc-900 dark:text-zinc-50">{t('header.title')}</span>
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          
          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setProfileOpen(prev => !prev)} className="hidden sm:flex items-center gap-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1 pr-3 transition-colors mr-2 border-r border-zinc-200 dark:border-zinc-700">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
                <div className="text-right">
                    <p className='text-sm font-semibold text-zinc-800 dark:text-zinc-100'>{user.name}</p>
                    <p className='text-xs text-zinc-500 dark:text-zinc-400 capitalize'>{t(`roles.${user.role}`)}</p>
                </div>
            </button>

            {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-in fade-in-0 zoom-in-95">
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => { onOpenProfile(); setProfileOpen(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            <UserIcon className="w-4 h-4 text-zinc-500" />
                            <span>{t('header.edit_profile')}</span>
                        </button>
                        <button
                            onClick={() => { onLogout(); setProfileOpen(false); }}
                            className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/50"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('header.logout')}</span>
                        </button>
                    </div>
                </div>
            )}
          </div>

          <div className="text-sm font-mono text-zinc-600 dark:text-zinc-300 tracking-wider mr-2 hidden md:block">
            {currentTime}
          </div>
          
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          <div className="relative" ref={langMenuRef}>
            <button onClick={() => setLangOpen(prev => !prev)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" title={t('header.language')}>
                <Globe className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
            </button>
            {isLangOpen && (
                 <div className="absolute right-0 mt-2 w-36 origin-top-right bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-in fade-in-0 zoom-in-95">
                    <div className="py-1">
                      <button
                        onClick={() => { setLanguage('es'); setLangOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        Español
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setLangOpen(false); }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        English
                      </button>
                    </div>
                  </div>
            )}
          </div>
          
          <button 
            data-tour-id="help-menu"
            onClick={onOpenHelp} 
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" 
            title={t('header.help_menu_title')}
          >
            <HelpCircle className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
          </button>

          <button className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" title={t('header.notifications')}>
            <Bell className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
