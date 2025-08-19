import React, { useState, useEffect, useRef } from 'react';
import { Shield, Bell, LogOut, HelpCircle, Globe } from 'lucide-react';
import type { Theme, User } from '../../types';
import ThemeToggle from '../shared/ThemeToggle';
import { useTranslation } from '../../hooks/useTranslation';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, theme, toggleTheme }) => {
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [isLangOpen, setLangOpen] = useState(false);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setHelpOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangOpen(false);
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
          
          <div className="flex items-center gap-3 mr-2">
            <div className='text-right'>
                <p className='text-sm font-semibold text-zinc-800 dark:text-zinc-100'>{user.name}</p>
                <p className='text-xs text-zinc-500 dark:text-zinc-400 capitalize'>{t(`roles.${user.role}`)}</p>
            </div>
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
          
          <div className="relative" ref={helpMenuRef} data-tour-id="help-menu">
            <button onClick={() => setHelpOpen(prev => !prev)} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" title={t('header.help_menu_title')}>
                <HelpCircle className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
            </button>
            {isHelpOpen && (
                 <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-in fade-in-0 zoom-in-95">
                    <div className="py-1">
                      <a
                        href="/INSTRUCTIONS_CONSULTANT.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        {t('header.consultant_manual')}
                      </a>
                      <a
                        href="/INSTRUCTIONS_CLIENT.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        {t('header.client_manual')}
                      </a>
                    </div>
                  </div>
            )}
          </div>

          <button className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" title={t('header.notifications')}>
            <Bell className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
          </button>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors" title={t('header.logout')}>
            <LogOut className="w-5 h-5 text-zinc-500 dark:text-zinc-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;