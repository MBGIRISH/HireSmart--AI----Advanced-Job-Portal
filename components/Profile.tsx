
import React, { useState } from 'react';
import { User, UserRole, ParsedProfile } from '../types';
import { Storage } from '../services/storage';
import { parseResume } from '../services/gemini';
import { FileText, Upload, CheckCircle2, List, GraduationCap, Briefcase, Zap } from 'lucide-react';

interface ProfileProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');

  if (!user) return <div className="p-12 text-center">Please login to view profile.</div>;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleParse = async () => {
    if (!resumeText) return;
    setLoading(true);
    try {
      const parsedData = await parseResume(resumeText);
      const updatedUser = { ...user, resumeText, parsedProfile: parsedData };
      Storage.saveUser(updatedUser);
      onUpdate(updatedUser);
      alert("Resume parsed successfully!");
    } catch (err) {
      console.error(err);
      alert("Parsing failed. Ensure your resume content is readable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-8">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex items-end justify-between mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg border border-slate-100 flex items-center justify-center">
              <div className="w-full h-full rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 text-4xl font-bold">
                {user.name[0]}
              </div>
            </div>
            <div className="flex space-x-3">
               <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 uppercase tracking-wider">
                 {user.role}
               </span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
              <FileText size={18} className="text-indigo-600" />
              <span>Resume Source</span>
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".txt,.md" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
                <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                <p className="text-sm font-medium text-slate-700">Click or drag to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports TXT, Markdown</p>
              </div>
              
              {resumeText && (
                <div className="p-3 bg-slate-50 rounded-lg text-xs font-mono text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
                  {resumeText.substring(0, 100)}...
                </div>
              )}

              <button 
                onClick={handleParse}
                disabled={loading || !resumeText}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Zap size={18} />
                )}
                <span>{loading ? 'AI Parsing...' : 'Parse with Gemini'}</span>
              </button>
            </div>
          </div>
          
          {user.parsedProfile && (
             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
               <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                 <CheckCircle2 size={18} className="text-green-600" />
                 <span>Skills Cloud</span>
               </h3>
               <div className="flex flex-wrap gap-2">
                 {user.parsedProfile.skills.map(skill => (
                   <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                     {skill}
                   </span>
                 ))}
               </div>
             </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          {user.parsedProfile ? (
            <>
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <List size={22} className="text-indigo-600" />
                  <span>AI Summary</span>
                </h3>
                <p className="text-slate-600 leading-relaxed italic">"{user.parsedProfile.summary}"</p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <Briefcase size={22} className="text-indigo-600" />
                  <span>Experience</span>
                </h3>
                <div className="space-y-8">
                  {user.parsedProfile.experience.map((exp, i) => (
                    <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-indigo-600 before:rounded-full before:z-10 after:absolute after:left-[5px] after:top-5 after:bottom-[-30px] after:w-[2px] after:bg-slate-100 last:after:hidden">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                        <h4 className="font-bold text-slate-900">{exp.title}</h4>
                        <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-md">{exp.duration}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">{exp.company}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                  <GraduationCap size={22} className="text-indigo-600" />
                  <span>Education</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.parsedProfile.education.map((edu, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">{edu.degree}</h4>
                      <p className="text-xs text-slate-600">{edu.institution}</p>
                      <p className="text-xs font-bold text-indigo-600 mt-2">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-indigo-50 rounded-2xl p-12 border border-dashed border-indigo-200 text-center flex flex-col items-center justify-center">
              <Zap className="text-indigo-400 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Ready to unleash Gemini?</h2>
              <p className="text-indigo-700 max-w-sm">Upload your resume and let our AI parse your experience automatically to start matching you with the perfect jobs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
