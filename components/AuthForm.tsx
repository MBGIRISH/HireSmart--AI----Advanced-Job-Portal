
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Storage } from '../services/storage';
import { Mail, Lock, User as UserIcon, ShieldCheck, Briefcase } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'signup';
  onAuth: (user: User) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ type, onAuth }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.JOB_SEEKER
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'signup') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      Storage.saveUser(newUser);
      onAuth(newUser);
    } else {
      const users = Storage.getUsers();
      const user = users.find(u => u.email === formData.email);
      if (user) {
        onAuth(user);
      } else {
        alert("User not found. Try signing up!");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 bg-indigo-600 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-2">{type === 'login' ? 'Welcome Back' : 'Join HireSmart'}</h2>
          <p className="opacity-80 text-sm font-medium">Access the future of talent acquisition.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {type === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {type === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-4 block">Select Your Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: UserRole.JOB_SEEKER})}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${formData.role === UserRole.JOB_SEEKER ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                >
                  <Briefcase size={24} className={formData.role === UserRole.JOB_SEEKER ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className={`text-xs font-bold mt-2 ${formData.role === UserRole.JOB_SEEKER ? 'text-indigo-600' : 'text-slate-400'}`}>Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: UserRole.RECRUITER})}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${formData.role === UserRole.RECRUITER ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}
                >
                  <ShieldCheck size={24} className={formData.role === UserRole.RECRUITER ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className={`text-xs font-bold mt-2 ${formData.role === UserRole.RECRUITER ? 'text-indigo-600' : 'text-slate-400'}`}>Recruiter</span>
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-extrabold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
          >
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
