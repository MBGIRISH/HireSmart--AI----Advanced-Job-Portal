/**
 * API service for communicating with the backend
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { User, Job, Application, ParsedProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('current_user');
          window.location.href = '/#/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, role: string) {
    const response = await this.api.post('/api/v1/auth/register', {
      email,
      password,
      name,
      role,
    });
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('current_user', JSON.stringify(user));
    return { token: access_token, user };
  }

  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await this.api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('current_user', JSON.stringify(user));
    return { token: access_token, user };
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/api/v1/auth/me');
    return response.data;
  }

  // Profile endpoints
  async getProfile(): Promise<ParsedProfile> {
    const response = await this.api.get('/api/v1/profiles/me');
    return response.data;
  }

  async uploadResume(file: File): Promise<ParsedProfile> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post('/api/v1/profiles/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateProfile(data: { name?: string; avatar?: string }): Promise<ParsedProfile> {
    const response = await this.api.put('/api/v1/profiles/me', data);
    return response.data;
  }

  // Job endpoints
  async getJobs(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    location?: string;
    job_type?: string;
  }): Promise<Job[]> {
    const response = await this.api.get('/api/v1/jobs', { params });
    // Transform snake_case to camelCase
    return response.data.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements || [],
      salaryRange: job.salary_range || job.salaryRange || '',
      postedAt: job.posted_at || job.postedAt,
      recruiterId: job.recruiter_id || job.recruiterId
    }));
  }

  async getJob(jobId: string): Promise<Job> {
    const response = await this.api.get(`/api/v1/jobs/${jobId}`);
    return response.data;
  }

  async createJob(jobData: Omit<Job, 'id' | 'postedAt' | 'recruiterId'>): Promise<Job> {
    // Transform camelCase to snake_case for API
    const apiData = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      type: jobData.type,
      description: jobData.description,
      requirements: jobData.requirements,
      salary_range: jobData.salaryRange
    };
    const response = await this.api.post('/api/v1/jobs', apiData);
    const data = response.data;
    // Transform back to camelCase
    return {
      id: data.id,
      title: data.title,
      company: data.company,
      location: data.location,
      type: data.type,
      description: data.description,
      requirements: data.requirements || [],
      salaryRange: data.salary_range || '',
      postedAt: data.posted_at,
      recruiterId: data.recruiter_id
    };
  }

  async updateJob(jobId: string, jobData: Partial<Job>): Promise<Job> {
    const response = await this.api.put(`/api/v1/jobs/${jobId}`, jobData);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<void> {
    await this.api.delete(`/api/v1/jobs/${jobId}`);
  }

  async getMyJobs(): Promise<Job[]> {
    const response = await this.api.get('/api/v1/jobs/recruiter/my-jobs');
    return response.data;
  }

  // Application endpoints
  async applyToJob(jobId: string): Promise<Application> {
    const response = await this.api.post('/api/v1/applications', { job_id: jobId });
    const data = response.data;
    // Transform snake_case to camelCase
    return {
      id: data.id,
      jobId: data.job_id,
      userId: data.user_id,
      status: data.status,
      matchScore: data.match_score || 0,
      matchAnalysis: data.match_analysis || '',
      appliedAt: data.applied_at
    };
  }

  async getMyApplications(): Promise<Application[]> {
    const response = await this.api.get('/api/v1/applications/my-applications');
    // Transform snake_case to camelCase for all applications
    return response.data.map((app: any) => ({
      id: app.id,
      jobId: app.job_id,
      userId: app.user_id,
      status: app.status,
      matchScore: app.match_score || 0,
      matchAnalysis: app.match_analysis || '',
      appliedAt: app.applied_at
    }));
  }

  async getJobApplicants(jobId: string): Promise<Application[]> {
    const response = await this.api.get(`/api/v1/applications/job/${jobId}/applicants`);
    // Transform snake_case to camelCase
    return response.data.map((app: any) => ({
      id: app.id,
      jobId: app.job_id,
      userId: app.user_id,
      status: app.status,
      matchScore: app.match_score || 0,
      matchAnalysis: app.match_analysis || '',
      appliedAt: app.applied_at,
      candidate: app.candidate ? {
        id: app.candidate.id,
        email: app.candidate.email,
        name: app.candidate.name,
        role: app.candidate.role
      } : undefined,
      profile: app.profile ? {
        id: app.profile.id,
        userId: app.profile.user_id,
        skills: app.profile.skills || [],
        experience: app.profile.experience || [],
        education: app.profile.education || [],
        summary: app.profile.summary || ''
      } : undefined,
      resumeText: app.resume_text || undefined
    }));
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<Application> {
    const response = await this.api.put(`/api/v1/applications/${applicationId}`, {
      status,
    });
    const data = response.data;
    return {
      id: data.id,
      jobId: data.job_id,
      userId: data.user_id,
      status: data.status,
      matchScore: data.match_score || 0,
      matchAnalysis: data.match_analysis || '',
      appliedAt: data.applied_at
    };
  }

  async getApplication(applicationId: string): Promise<Application> {
    const response = await this.api.get(`/api/v1/applications/${applicationId}`);
    const data = response.data;
    return {
      id: data.id,
      jobId: data.job_id,
      userId: data.user_id,
      status: data.status,
      matchScore: data.match_score || 0,
      matchAnalysis: data.match_analysis || '',
      appliedAt: data.applied_at
    };
  }

  // Analytics endpoints
  async getDashboardAnalytics() {
    const response = await this.api.get('/api/v1/analytics/dashboard');
    return response.data;
  }

  async getRecruiterStats() {
    const response = await this.api.get('/api/v1/analytics/recruiter/stats');
    return response.data;
  }

  // Admin endpoints
  async getAllUsers(): Promise<User[]> {
    const response = await this.api.get('/api/v1/admin/users');
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/api/v1/admin/users/${userId}`);
  }

  async getAllJobs(): Promise<Job[]> {
    const response = await this.api.get('/api/v1/admin/jobs');
    return response.data;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
  }
}

export const apiService = new ApiService();

