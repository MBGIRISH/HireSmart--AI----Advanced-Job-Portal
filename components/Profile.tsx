import React, { useState, useEffect } from 'react';
import { User, UserRole, ParsedProfile } from '../types';
import { apiService } from '../services/api';
import { FileText, Upload, CheckCircle2, List, GraduationCap, Briefcase, Zap } from 'lucide-react';

interface ProfileProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<ParsedProfile | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const profile = await apiService.getProfile();
      setParsedProfile(profile);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Failed to load profile:', error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    try {
      const profile = await apiService.uploadResume(file);
      setParsedProfile(profile);
      alert('Resume uploaded and parsed successfully!');
      // Reload user to get updated info
      const updatedUser = await apiService.getCurrentUser();
      onUpdate(updatedUser);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.detail || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <div className="p-12 text-center">Please login to view profile.</div>;

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
              <span>Resume Upload</span>
            </h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                <p className="text-sm font-medium text-slate-700">Click or drag to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF files</p>
              </div>

              {uploading && (
                <div className="p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700 text-center">
                  <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
                  Uploading and parsing...
                </div>
              )}
            </div>
          </div>
          
          {parsedProfile && (
             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
               <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                 <CheckCircle2 size={18} className="text-green-600" />
                 <span>Skills Cloud</span>
               </h3>
               <div className="flex flex-wrap gap-2">
                 {parsedProfile.skills && parsedProfile.skills.length > 0 ? (
                   parsedProfile.skills.map((skill, idx) => (
                     <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                       {skill}
                     </span>
                   ))
                 ) : (
                   <p className="text-xs text-slate-400">No skills extracted yet</p>
                 )}
               </div>
             </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          {parsedProfile ? (
            <>
              {parsedProfile.summary && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <List size={22} className="text-indigo-600" />
                    <span>AI Summary</span>
                  </h3>
                  <p className="text-slate-600 leading-relaxed italic">"{parsedProfile.summary}"</p>
                </div>
              )}

              {parsedProfile.experience && parsedProfile.experience.length > 0 && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <Briefcase size={22} className="text-indigo-600" />
                    <span>Experience</span>
                  </h3>
                  <div className="space-y-8">
                    {parsedProfile.experience.map((exp: any, i: number) => (
                      <div key={i} className="relative pl-8 before:absolute before:left-0 before:top-2 before:w-3 before:h-3 before:bg-indigo-600 before:rounded-full before:z-10 after:absolute after:left-[5px] after:top-5 after:bottom-[-30px] after:w-[2px] after:bg-slate-100 last:after:hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                          <h4 className="font-bold text-slate-900">{exp.title || 'N/A'}</h4>
                          <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-md">{exp.duration || 'N/A'}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-2">{exp.company || 'N/A'}</p>
                        <p className="text-sm text-slate-500 leading-relaxed">{exp.description || ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedProfile.education && parsedProfile.education.length > 0 && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <GraduationCap size={22} className="text-indigo-600" />
                    <span>Education</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {parsedProfile.education.map((edu: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{edu.degree || 'N/A'}</h4>
                        <p className="text-xs text-slate-600">{edu.institution || 'N/A'}</p>
                        <p className="text-xs font-bold text-indigo-600 mt-2">{edu.year || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-indigo-50 rounded-2xl p-12 border border-dashed border-indigo-200 text-center flex flex-col items-center justify-center">
              <Zap className="text-indigo-400 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-indigo-900 mb-2">Upload Your Resume</h2>
              <p className="text-indigo-700 max-w-sm">Upload your resume PDF and let our AI parse your experience automatically to start matching you with the perfect jobs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
