
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User, UserRole } from './types';
import { Storage } from './services/storage';
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
    const savedUser = Storage.getCurrentUser();
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  const handleLogin = (u: User) => {
    Storage.setCurrentUser(u);
    setUser(u);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobBoard user={user} />} />
          <Route path="/login" element={!user ? <AuthForm type="login" onAuth={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <AuthForm type="signup" onAuth={handleLogin} /> : <Navigate to="/" />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={user ? <Profile user={user} onUpdate={setUser} /> : <Navigate to="/login" />} />
          <Route 
            path="/recruiter" 
            element={user?.role === UserRole.RECRUITER ? <RecruiterDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin" 
            element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} 
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
