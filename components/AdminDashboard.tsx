import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, Users, Briefcase, Activity, AlertTriangle, FileCheck } from 'lucide-react';
import { apiService } from '../services/api';
import { User } from '../types';

interface AdminDashboardProps {
  user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await apiService.getDashboardAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Mock chart data (in production, this would come from analytics)
  const chartData = [
    { name: 'Jan', apps: analytics?.applications?.total || 0, jobs: analytics?.jobs?.total || 0 },
    { name: 'Feb', apps: (analytics?.applications?.total || 0) * 0.8, jobs: (analytics?.jobs?.total || 0) * 0.9 },
    { name: 'Mar', apps: (analytics?.applications?.total || 0) * 1.2, jobs: (analytics?.jobs?.total || 0) * 1.1 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-4">
          <Shield className="text-indigo-600" size={36} />
          <span>System Administration</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Infrastructure health, user growth, and AI performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { 
            label: 'Total Users', 
            val: analytics?.users?.total || 0, 
            icon: Users, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50' 
          },
          { 
            label: 'Platform Jobs', 
            val: analytics?.jobs?.total || 0, 
            icon: Briefcase, 
            color: 'text-violet-600', 
            bg: 'bg-violet-50' 
          },
          { 
            label: 'AI Success Rate', 
            val: analytics?.applications?.average_match_score 
              ? `${analytics.applications.average_match_score}%` 
              : 'N/A', 
            icon: Activity, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
          },
          { 
            label: 'System Uptime', 
            val: '99.9%', 
            icon: Shield, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-extrabold text-slate-900">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center space-x-3">
            <Activity className="text-indigo-600" size={20} />
            <span>Application Growth & Trends</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="apps" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-lg mb-6 flex items-center space-x-3">
               <AlertTriangle className="text-amber-500" size={18} />
               <span>User Statistics</span>
             </h3>
             <div className="space-y-4">
                {analytics?.users?.by_role && Object.entries(analytics.users.by_role).map(([role, count]: [string, any]) => (
                  <div key={role} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-sm">{role}</p>
                      <p className="text-xs text-slate-500">{count} users</p>
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl text-white">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
               <FileCheck className="text-indigo-400" size={24} />
             </div>
             <h3 className="text-xl font-bold mb-2">Analytics</h3>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">
               Total Applications: {analytics?.applications?.total || 0}
               <br />
               Average Match Score: {analytics?.applications?.average_match_score || 0}%
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
