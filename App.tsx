
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { apiService } from './services/api';
import Layout from './components/Layout';
import Home from './components/Home';
import JobBoard from './components/JobBoard';
import Profile from './components/Profile';
import RecruiterDashboard from './components/RecruiterDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthForm from './components/AuthForm';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUserStr = localStorage.getItem('current_user');
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          // Verify token is still valid by fetching current user
          try {
            const currentUser = await apiService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token invalid or expired, use saved user for now
            setUser(savedUser);
          }
        }
      } catch (error) {
        // Error parsing or loading user
        console.error('Error loading user:', error);
        apiService.logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogin = (u: User) => {
    localStorage.setItem('current_user', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    apiService.logout();
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobBoard user={user} />} />
          <Route path="/login" element={!user ? <AuthForm type="login" onAuth={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <AuthForm type="signup" onAuth={handleLogin} /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={user ? <Profile user={user} onUpdate={setUser} /> : <Navigate to="/login" />} />
          <Route 
            path="/recruiter" 
            element={user?.role === UserRole.RECRUITER || user?.role === UserRole.ADMIN ? <RecruiterDashboard user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin" 
            element={user?.role === UserRole.ADMIN ? <AdminDashboard user={user} /> : <Navigate to="/" />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
