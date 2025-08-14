
import React, { useState } from 'react';
import { Shield, Mail, Lock } from 'lucide-react';
import type { User } from '../../types';
import { mockLoginUsers } from '../../data/seedData';
import Button from '../ui/Button';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = mockLoginUsers.find(u => u.email === email);

    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Invalid email or password.');
    }
  };

  const commonInputStyles = "w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-lg px-4 py-3 pl-11 outline-none focus:ring-2 ring-emerald-500 border border-zinc-300 dark:border-zinc-700 transition-all";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
            <Shield className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mb-3" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Compliance Calendar</h1>
            <p className="text-zinc-600 dark:text-zinc-400">Please sign in to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={commonInputStyles}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={commonInputStyles}
              required
            />
          </div>
          
          {error && <p className="text-sm text-center text-rose-600 dark:text-rose-400 animate-in fade-in-0">{error}</p>}

          <div>
             <Button type="submit" className="w-full !py-3 !text-base">
                Sign In
             </Button>
          </div>
        </form>
         <div className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-600">
            <p>&copy; {new Date().getFullYear()} Compliance Calendar Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;