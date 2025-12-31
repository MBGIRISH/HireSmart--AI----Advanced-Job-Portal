import React, { useState, useEffect } from 'react';
import { Job, Application, User, UserRole, ParsedProfile } from '../types';
import { apiService } from '../services/api';
import { Plus, Users, Trash2, ChevronRight, BarChart3, TrendingUp, Sparkles, Mail, FileText, Eye, X } from 'lucide-react';

interface RecruiterDashboardProps {
  user: User | null;
}

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationsByJob, setApplicationsByJob] = useState<Record<string, Application[]>>({});
  const [showAddJob, setShowAddJob] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<{ application: Application; profile?: ParsedProfile; resumeText?: string } | null>(null);
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
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, statsData] = await Promise.all([
        apiService.getMyJobs(),
        apiService.getRecruiterStats()
      ]);
      setJobs(jobsData);
      setStats(statsData);
      
      // Load applications for each job
      const appsMap: Record<string, Application[]> = {};
      for (const job of jobsData) {
        try {
          const apps = await apiService.getJobApplicants(job.id);
          appsMap[job.id] = apps;
        } catch (error) {
          appsMap[job.id] = [];
        }
      }
      setApplicationsByJob(appsMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.company || !newJob.description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const requirements = typeof newJob.requirements === 'string' 
        ? (newJob.requirements as string).split(',').map(s => s.trim()).filter(s => s)
        : (newJob.requirements || []);
      
      const jobData = {
        title: newJob.title,
        company: newJob.company,
        location: newJob.location || '',
        type: newJob.type,
        description: newJob.description,
        requirements,
        salaryRange: newJob.salaryRange || ''
      };
      
      await apiService.createJob(jobData);
      await loadData();
      setShowAddJob(false);
      setNewJob({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: '',
        requirements: [],
        salaryRange: ''
      });
    } catch (error: any) {
      console.error('Create job error:', error);
      // Handle validation errors from FastAPI
      if (error.response?.status === 422) {
        const errors = error.response?.data?.detail;
        if (Array.isArray(errors)) {
          // FastAPI validation errors format
          const errorMessages = errors.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join('\n');
          alert(errorMessages);
        } else if (typeof errors === 'string') {
          alert(errors);
        } else if (errors && typeof errors === 'object') {
          // Handle object errors
          const errorStr = JSON.stringify(errors, null, 2);
          alert(`Validation error:\n${errorStr}`);
        } else {
          alert('Validation failed. Please check your input.');
        }
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          alert(detail);
        } else {
          alert(`Error: ${JSON.stringify(detail, null, 2)}`);
        }
      } else if (error.message) {
        alert(error.message);
      } else {
        alert('Failed to create job. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await apiService.deleteJob(id);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete job');
    }
  };

  const getAppsForJob = (jobId: string) => {
    return (applicationsByJob[jobId] || []).sort((a, b) => b.matchScore - a.matchScore);
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

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
            <p className="text-2xl font-bold text-slate-900">{stats?.jobs?.active || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Applicants</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.applications?.total || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Match</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats?.applications?.average_match_score || 0}%
            </p>
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl border border-indigo-500 flex items-center space-x-4 text-white shadow-xl shadow-indigo-200">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">AI Matching</p>
            <p className="text-2xl font-bold">Enabled</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Postings</h2>
        {jobs.length > 0 ? jobs.map(job => (
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
                  <div key={app.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {app.candidate?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800">{app.candidate?.name || `Application ID: ${app.id.substring(0, 8)}`}</p>
                          <p className="text-sm text-slate-500">{app.candidate?.email || 'No email available'}</p>
                          <p className="text-xs text-slate-400">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-1 text-indigo-600 font-bold text-lg">
                            <Sparkles size={16} />
                            <span>{app.matchScore}%</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">AI Match Score</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {app.candidate?.email && (
                            <a 
                              href={`mailto:${app.candidate.email}?subject=Regarding Your Application`}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Contact candidate"
                            >
                              <Mail size={18} />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedCandidate({ application: app, profile: app.profile, resumeText: app.resumeText })}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View resume and details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </div>
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
        )) : (
          <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center">
            <p className="text-slate-500">No jobs posted yet. Create your first job posting!</p>
          </div>
        )}
      </div>

      {showAddJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddJob(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100">
              <h2 className="text-2xl font-bold">Post a New Role</h2>
              <p className="text-slate-500 text-sm">Enter the job details and let AI handle the matching.</p>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Title *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newJob.title}
                  onChange={e => setNewJob({...newJob, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Company *</label>
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
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Type</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newJob.type}
                  onChange={e => setNewJob({...newJob, type: e.target.value as any})}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Remote">Remote</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Description *</label>
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
                  value={typeof newJob.requirements === 'string' ? newJob.requirements : (newJob.requirements || []).join(', ')}
                  onChange={e => setNewJob({...newJob, requirements: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Salary Range</label>
                <input 
                  type="text" 
                  placeholder="$80,000 - $120,000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newJob.salaryRange || ''}
                  onChange={e => setNewJob({...newJob, salaryRange: e.target.value})}
                />
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex items-center justify-end space-x-3">
              <button onClick={() => setShowAddJob(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button onClick={handleAddJob} disabled={loading} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)}></div>
          <div className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedCandidate.application.candidate?.name || 'Candidate Details'}
                </h2>
                <p className="text-slate-500 text-sm">{selectedCandidate.application.candidate?.email}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              {/* Match Score */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 uppercase tracking-wider">AI Match Score</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Sparkles size={20} className="text-indigo-600" />
                      <span className="text-3xl font-bold text-indigo-600">{selectedCandidate.application.matchScore}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="text-lg font-bold text-slate-800">{selectedCandidate.application.status}</p>
                  </div>
                </div>
                {selectedCandidate.application.matchAnalysis && (
                  <div className="mt-4 pt-4 border-t border-indigo-200">
                    <p className="text-sm text-slate-700">{selectedCandidate.application.matchAnalysis}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {selectedCandidate.application.candidate && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Mail size={18} className="text-slate-400" />
                      <a 
                        href={`mailto:${selectedCandidate.application.candidate.email}?subject=Regarding Your Application`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {selectedCandidate.application.candidate.email}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedCandidate.profile?.skills && selectedCandidate.profile.skills.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedCandidate.profile?.experience && selectedCandidate.profile.experience.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Experience</h3>
                  <div className="space-y-3">
                    {selectedCandidate.profile.experience.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-indigo-200 pl-4">
                        <p className="font-bold text-slate-800">{exp.title}</p>
                        <p className="text-sm text-slate-600">{exp.company} • {exp.duration}</p>
                        {exp.description && (
                          <p className="text-sm text-slate-500 mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedCandidate.profile?.education && selectedCandidate.profile.education.length > 0 && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Education</h3>
                  <div className="space-y-2">
                    {selectedCandidate.profile.education.map((edu, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                        <div>
                          <p className="font-medium text-slate-800">{edu.degree}</p>
                          <p className="text-sm text-slate-600">{edu.institution} • {edu.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {selectedCandidate.profile?.summary && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Summary</h3>
                  <p className="text-slate-700">{selectedCandidate.profile.summary}</p>
                </div>
              )}

              {/* Resume Text */}
              {selectedCandidate.resumeText && (
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                      <FileText size={16} />
                      <span>Resume Text</span>
                    </h3>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans">
                      {selectedCandidate.resumeText}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex items-center justify-end space-x-3 border-t border-slate-200">
              {selectedCandidate.application.candidate?.email && (
                <a
                  href={`mailto:${selectedCandidate.application.candidate.email}?subject=Regarding Your Application`}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <Mail size={18} />
                  <span>Contact Candidate</span>
                </a>
              )}
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
