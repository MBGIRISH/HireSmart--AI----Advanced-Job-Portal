
export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  resumeText?: string;
  parsedProfile?: ParsedProfile;
}

export interface ParsedProfile {
  skills: string[];
  experience: { title: string; company: string; duration: string; description: string }[];
  education: { degree: string; institution: string; year: string }[];
  summary: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Remote' | 'Contract';
  description: string;
  requirements: string[];
  salaryRange: string;
  postedAt: string;
  recruiterId: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: 'Pending' | 'Reviewing' | 'Interviewed' | 'Rejected' | 'Accepted';
  matchScore: number;
  matchAnalysis: string;
  appliedAt: string;
}

export interface MatchResult {
  score: number;
  analysis: string;
  missingSkills: string[];
}
