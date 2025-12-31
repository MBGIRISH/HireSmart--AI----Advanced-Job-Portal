
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { LogOut, Briefcase, User as UserIcon, LayoutDashboard, Search, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              H
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              HireSmart AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/jobs" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Find Jobs</Link>
            {user?.role === UserRole.RECRUITER && (
              <Link to="/recruiter" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Recruiter Hub</Link>
            )}
            {user?.role === UserRole.ADMIN && (
              <Link to="/admin" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Admin Panel</Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                    {user.name[0]}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2024 HireSmart AI. Powered by Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
