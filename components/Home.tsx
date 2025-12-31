
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Building2, TrendingUp, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-8">
            <Sparkles size={16} />
            <span>Next Generation Job Matching is Here</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Hire Faster with <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI Intelligence</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Revolutionizing the hiring process using Gemini-powered resume parsing, semantic matching, and predictive analytics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1">
              Start Your Journey
            </Link>
            <Link to="/jobs" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all">
              Browse All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Benefits */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, label: '98% Accuracy', desc: 'Our AI model precisely identifies skills and experience from raw text.' },
            { icon: Building2, label: '1,000+ Companies', desc: 'From startups to Fortune 500s trust our matching algorithms.' },
            { icon: TrendingUp, label: '3x Faster Hiring', desc: 'Reduce screening time by up to 70% with automatic ranking.' }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.label}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs Teaser */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-white mb-6">Built for the Modern Workforce</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Whether you are a job seeker looking for your dream role or a recruiter aiming to scale your team efficiently, HireSmart AI provides the tools you need to succeed.
            </p>
            <div className="space-y-4">
              {['Auto-parsing Resumes', 'Smart Match Scoring', 'Analytics Dashboard', 'Role-based Access'].map((feat, i) => (
                <div key={i} className="flex items-center space-x-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ChevronRight size={16} />
                  </div>
                  <span className="font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/2 bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm">
             <div className="space-y-4">
               {[1, 2, 3].map((_, i) => (
                 <div key={i} className="p-4 bg-white/10 rounded-xl border border-white/10 animate-pulse">
                    <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
                    <div className="h-3 w-48 bg-white/10 rounded"></div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
