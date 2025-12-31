
import { User, Job, Application, UserRole } from "../types";

const KEYS = {
  USERS: 'hs_users',
  JOBS: 'hs_jobs',
  APPLICATIONS: 'hs_applications',
  CURRENT_USER: 'hs_current_user'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const set = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initial Sample Data
const initialJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechFlow',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for a React expert to lead our dashboard revamp.',
    requirements: ['React', 'TypeScript', 'Tailwind', 'System Design'],
    salaryRange: '$140k - $180k',
    postedAt: new Date().toISOString(),
    recruiterId: 'rec-1'
  },
  {
    id: '2',
    title: 'AI Product Manager',
    company: 'Neural Labs',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Drive the roadmap for our next-gen generative AI platforms.',
    requirements: ['Product Strategy', 'LLMs', 'Analytics', 'Agile'],
    salaryRange: '$160k - $220k',
    postedAt: new Date().toISOString(),
    recruiterId: 'rec-1'
  }
];

export const Storage = {
  getUsers: () => get<User[]>(KEYS.USERS, []),
  saveUser: (user: User) => {
    const users = Storage.getUsers();
    const existing = users.findIndex(u => u.id === user.id);
    if (existing > -1) users[existing] = user;
    else users.push(user);
    set(KEYS.USERS, users);
  },
  
  getJobs: () => get<Job[]>(KEYS.JOBS, initialJobs),
  addJob: (job: Job) => {
    const jobs = Storage.getJobs();
    jobs.push(job);
    set(KEYS.JOBS, jobs);
  },
  deleteJob: (id: string) => {
    const jobs = Storage.getJobs().filter(j => j.id !== id);
    set(KEYS.JOBS, jobs);
  },

  getApplications: () => get<Application[]>(KEYS.APPLICATIONS, []),
  addApplication: (app: Application) => {
    const apps = Storage.getApplications();
    apps.push(app);
    set(KEYS.APPLICATIONS, apps);
  },

  getCurrentUser: () => get<User | null>(KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => set(KEYS.CURRENT_USER, user),

  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};
