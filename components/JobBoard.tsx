
import React, { useState, useEffect } from 'react';
import { Job, User, Application } from '../types';
import { Storage } from '../services/storage';
import { Search, MapPin, Briefcase, DollarSign, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { matchJobAndResume } from '../services/gemini';

interface JobBoardProps {
  user: User | null;
}

const JobBoard: React.FC<JobBoardProps> = ({ user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [applying, setApplying] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setJobs(Storage.getJobs());
    // In a real app, we'd pre-calculate or lazy-load match scores
  }, []);

  const handleApply = async (job: Job) => {
    if (!user) {
      alert("Please login to apply");
      return;
    }
    if (!user.resumeText) {
      alert("Please upload your resume in your profile first!");
      return;
    }

    setApplying(job.id);
    try {
      const result = await matchJobAndResume(job.description + " requirements: " + job.requirements.join(", "), user.resumeText);
      const app: Application = {
        id: Math.random().toString(36).substr(2, 9),
        jobId: job.id,
        userId: user.id,
        status: 'Pending',
        matchScore: result.score,
        matchAnalysis: result.analysis,
        appliedAt: new Date().toISOString()
      };
      Storage.addApplication(app);
      setScores(prev => ({ ...prev, [job.id]: result.score }));
      alert(`Application sent! Match Score: ${result.score}%`);
    } catch (error) {
      console.error(error);
      alert("AI Analysis failed. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Available Opportunities</h1>
          <p className="text-slate-500 mt-1">Discover roles that match your unique skill set.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by title or company..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-24 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <Filter size={18} className="text-indigo-600" />
              <h3 className="font-bold text-lg">Quick Filters</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Job Type</label>
                <div className="space-y-2">
                  {['Full-time', 'Remote', 'Contract', 'Part-time'].map(type => (
                    <label key={type} className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <hr className="border-slate-100" />
              {!user?.resumeText && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-3">
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Upload your resume in Profile to see <strong>AI Match Scores</strong> for these roles!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {filteredJobs.length > 0 ? filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-400 transition-all shadow-sm group">
              <div className="flex justify-between items-start">
                <div className="flex space-x-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {job.company[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                    <p className="text-slate-600 font-medium">{job.company}</p>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center space-x-1 text-slate-500 text-sm">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500 text-sm">
                        <Briefcase size={14} />
                        <span>{job.type}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-500 text-sm">
                        <DollarSign size={14} />
                        <span>{job.salaryRange}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {scores[job.id] && (
                   <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-1 text-indigo-600 font-bold">
                        <Sparkles size={16} />
                        <span>{scores[job.id]}% Match</span>
                      </div>
                      <span className="text-xs text-slate-400">AI Verified</span>
                   </div>
                )}
              </div>

              <div className="mt-6">
                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.requirements.slice(0, 4).map(req => (
                    <span key={req} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end items-center space-x-4">
                <button 
                  onClick={() => handleApply(job)}
                  disabled={applying === job.id}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {applying === job.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <span>Quick Apply</span>
                  )}
                </button>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center">
              <p className="text-slate-500">No jobs found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBoard;
