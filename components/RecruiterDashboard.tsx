
import React, { useState, useEffect } from 'react';
import { Job, Application, User, UserRole } from '../types';
import { Storage } from '../services/storage';
import { Plus, Users, Trash2, ChevronRight, BarChart3, TrendingUp, Sparkles } from 'lucide-react';

const RecruiterDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [showAddJob, setShowAddJob] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: [],
    salaryRange: ''
  });

  useEffect(() => {
    setJobs(Storage.getJobs());
    setApps(Storage.getApplications());
  }, []);

  const handleAddJob = () => {
    if (!newJob.title || !newJob.company) return;
    const job: Job = {
      ...newJob as Job,
      id: Math.random().toString(36).substr(2, 9),
      postedAt: new Date().toISOString(),
      recruiterId: 'rec-1',
      requirements: (newJob.requirements as any).split(',').map((s: string) => s.trim())
    };
    Storage.addJob(job);
    setJobs(prev => [...prev, job]);
    setShowAddJob(false);
    setNewJob({ title: '', company: '', location: '', type: 'Full-time', description: '', requirements: [], salaryRange: '' });
  };

  const deleteJob = (id: string) => {
    Storage.deleteJob(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const getAppsForJob = (jobId: string) => apps.filter(a => a.jobId === jobId).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-500">Managing your active postings and AI-ranked applicants.</p>
        </div>
        <button 
          onClick={() => setShowAddJob(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          <Plus size={20} />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Jobs</p>
            <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Applicants</p>
            <p className="text-2xl font-bold text-slate-900">{apps.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Match</p>
            <p className="text-2xl font-bold text-slate-900">
              {apps.length ? (apps.reduce((acc, a) => acc + a.matchScore, 0) / apps.length).toFixed(1) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl border border-indigo-500 flex items-center space-x-4 text-white shadow-xl shadow-indigo-200">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Gemini Power</p>
            <p className="text-2xl font-bold">Enabled</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Postings</h2>
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                <p className="text-slate-500 text-sm">{job.location} • {job.type}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Ranked Candidates</h4>
              <div className="space-y-3">
                {getAppsForJob(job.id).length > 0 ? getAppsForJob(job.id).map(app => (
                  <div key={app.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        ?
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Candidate ID: {app.userId.substring(0, 5)}</p>
                        <p className="text-xs text-slate-400">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-1 text-indigo-600 font-bold text-lg">
                          <Sparkles size={16} />
                          <span>{app.matchScore}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">AI Match Score</p>
                      </div>
                      <ChevronRight className="text-slate-300" size={20} />
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-400 italic text-sm">No applications yet for this position.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddJob(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-bold">Post a New Role</h2>
              <p className="text-slate-500 text-sm">Enter the job details and let Gemini handle the matching.</p>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newJob.title}
                  onChange={e => setNewJob({...newJob, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Company</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.company}
                    onChange={e => setNewJob({...newJob, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Location</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newJob.location}
                    onChange={e => setNewJob({...newJob, location: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Description</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  value={newJob.description}
                  onChange={e => setNewJob({...newJob, description: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Requirements (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="React, AWS, Node.js..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={e => setNewJob({...newJob, requirements: e.target.value as any})}
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex items-center justify-end space-x-3">
              <button onClick={() => setShowAddJob(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button onClick={handleAddJob} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Create Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
