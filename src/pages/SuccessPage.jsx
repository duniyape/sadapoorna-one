import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const title = location.state?.title || 'Success!';
  const message = location.state?.message || 'Action completed successfully.';
  const redirectUrl = location.state?.redirectUrl || '/';
  const duration = location.state?.duration || 3000;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectUrl, { replace: true });
    }, duration);

    return () => clearTimeout(timer);
  }, [navigate, redirectUrl, duration]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-emerald-50 rounded-full flex items-center justify-center border-[6px] border-emerald-100 shadow-xl shadow-emerald-500/20 relative z-10 animate-in zoom-in duration-500">
          <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500" />
        </div>
      </div>
      <h1 className="mt-10 text-3xl sm:text-5xl font-black text-slate-800 tracking-tight animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100 text-center px-4">
        {title}
      </h1>
      <p className="mt-4 text-base sm:text-lg font-medium text-slate-500 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200 text-center px-4">
        {message}
      </p>
    </div>
  );
}
