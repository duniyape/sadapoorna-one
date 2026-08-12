import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SadapoornaLogo from '../components/SadapoornaLogo';
import { User, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap, Moon } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // If there's a token, you could store it in localStorage here:
        if (data.access_token) localStorage.setItem('token', data.access_token);
        else if (data.token) localStorage.setItem('token', data.token);
        navigate('/');
      } else {
        let errMsg = 'Invalid email or password';
        if (data.detail) {
          if (typeof data.detail === 'string') errMsg = data.detail;
          else if (Array.isArray(data.detail)) errMsg = data.detail.map(e => `${e.loc?.join('.')} — ${e.msg}`).join('; ');
          else errMsg = JSON.stringify(data.detail);
        } else if (data.message) {
          errMsg = data.message;
        }
        setError(errMsg);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f8f9fc] selection:bg-red-500/30 font-sans">
      
      {/* Left Column - Brand & Product Experience */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#060B19] overflow-hidden flex-col p-12">
        
        {/* Animated Background Gradients & Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-glow-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-glow-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-indigo-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-orbital-spin pointer-events-none"></div>

        {/* Top Header */}
        <div className="relative z-20 flex items-center justify-between mb-16">
          <div className="scale-110 origin-top-left bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-xl">
            <SadapoornaLogo />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-20 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Smarter.</span><br/>
            Grow <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Faster.</span>
          </h1>
          <p className="text-slate-400 text-sm xl:text-base font-medium mb-6 leading-relaxed">
            One platform to streamline operations, manage your team, and grow your business with confidence.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm text-[11px] font-semibold text-slate-300 shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm text-[11px] font-semibold text-slate-300 shadow-lg">
              <Zap className="w-3.5 h-3.5 text-purple-400" /> Fast
            </div>
          </div>
        </div>

        {/* Floating Dashboard Illustration */}
        <div className="absolute right-[-20%] bottom-[-15%] z-10 w-[600px] xl:w-[650px] animate-float-slow pointer-events-none perspective-[1000px]">
          <div className="relative transform rotate-y-[-10deg] rotate-x-[5deg]">
            {/* Main Dashboard Window */}
            <div className="bg-[#0f1528]/90 backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-indigo-500/20 bg-[#161c32]/50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                <div className="ml-3 h-1.5 w-24 bg-indigo-500/20 rounded-full"></div>
              </div>
              <div className="flex p-3 gap-3 h-[300px]">
                {/* Sidebar Mock */}
                <div className="w-1/4 space-y-2 border-r border-indigo-500/10 pr-3">
                  <div className="h-6 bg-indigo-500/20 rounded-lg"></div>
                  <div className="h-3 bg-indigo-500/10 rounded w-3/4 mt-4"></div>
                  <div className="h-3 bg-indigo-500/10 rounded w-1/2"></div>
                  <div className="h-3 bg-indigo-500/10 rounded w-5/6"></div>
                  <div className="h-3 bg-indigo-500/10 rounded w-2/3"></div>
                </div>
                {/* Content Mock */}
                <div className="w-3/4 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1 bg-[#1a2138] rounded-xl p-3 border border-indigo-500/10 shadow-sm">
                      <div className="h-2 w-12 bg-slate-500/40 rounded mb-2"></div>
                      <div className="h-5 w-20 bg-white/80 rounded"></div>
                    </div>
                    <div className="flex-1 bg-[#1a2138] rounded-xl p-3 border border-indigo-500/10 shadow-sm">
                      <div className="h-2 w-16 bg-slate-500/40 rounded mb-2"></div>
                      <div className="h-5 w-16 bg-white/80 rounded"></div>
                    </div>
                  </div>
                  <div className="h-36 bg-[#1a2138] rounded-xl p-3 border border-indigo-500/10 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between">
                       <div className="h-2 w-20 bg-slate-500/40 rounded"></div>
                       <div className="h-2 w-10 bg-slate-500/20 rounded"></div>
                    </div>
                    {/* Mock chart lines */}
                    <div className="flex items-end gap-1.5 h-20">
                      <div className="w-1/6 bg-indigo-500/40 rounded-t h-[40%]"></div>
                      <div className="w-1/6 bg-indigo-500/60 rounded-t h-[60%]"></div>
                      <div className="w-1/6 bg-indigo-500/80 rounded-t h-[30%]"></div>
                      <div className="w-1/6 bg-indigo-500/90 rounded-t h-[80%]"></div>
                      <div className="w-1/6 bg-indigo-400 rounded-t h-[100%]"></div>
                      <div className="w-1/6 bg-indigo-500/70 rounded-t h-[70%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto relative z-20">
          <p className="text-slate-500 text-[10px]">
            © 2026 Sadapoorna AI Suite. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative animate-slide-up-fade overflow-y-auto custom-scrollbar">
        
        {/* Dark Mode Toggle (Decorative) */}
        <div className="absolute top-6 right-6">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200 shadow-sm">
            <Moon className="w-3.5 h-3.5" /> Dark Mode
          </button>
        </div>

        <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 p-8 relative">
          
          <div className="lg:hidden mb-6 flex justify-center">
             <div className="scale-110">
               <SadapoornaLogo />
             </div>
          </div>

          {/* Avatar Icon */}
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5 shadow-inner border border-red-100 hidden lg:flex">
            <User className="w-6 h-6" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back!</h2>
            <p className="text-slate-500 mt-1.5 text-xs font-medium">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-[11px] font-bold text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Email or Username</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 group-focus-within:text-red-500 transition-colors pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm placeholder-slate-400 font-medium text-slate-800"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 group-focus-within:text-red-500 transition-colors pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm placeholder-slate-400 font-medium text-slate-800"
                  placeholder="Enter your password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors border ${rememberMe ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300 group-hover:border-red-400'}`}>
                  {rememberMe && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-[11px] font-semibold text-slate-600 select-none">Remember me</span>
              </label>
              <a href="#" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-700 hover:via-pink-700 hover:to-purple-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group mt-3 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] font-medium text-slate-500">
            Don't have an account? <a href="#" className="text-indigo-600 font-bold hover:underline">Contact Admin</a>
          </p>
        </div>
        
        {/* Mobile Copyright */}
        <div className="mt-6 lg:hidden text-center opacity-60">
          <p className="text-slate-400 text-[10px]">
            © 2026 Sadapoorna AI Suite. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
