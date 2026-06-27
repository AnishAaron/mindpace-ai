
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Activity, MessageSquare, LogOut, LayoutDashboard } from 'lucide-react';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useAppContext } from '../context/AppContext';
import { EXAM_DATA } from '../config/examData';
import { ExamType } from '../types';

export const Navigation = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const examInfo = user?.targetExam ? EXAM_DATA[user.targetExam as ExamType] : null;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
      isActive
        ? 'border-brand-500 text-slate-900'
        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="text-xl font-bold text-brand-600 tracking-tight">MindPace AI</span>
              {examInfo && (
                <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${examInfo.bgColor} ${examInfo.color} border ${examInfo.borderColor}`}>
                  {examInfo.icon} {examInfo.name}
                </span>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </NavLink>
              <NavLink to="/daily-vent" className={navLinkClass}>
                <BookOpen className="w-4 h-4 mr-2" />
                Daily Vent
              </NavLink>
              <NavLink to="/trigger-matrix" className={navLinkClass}>
                <Activity className="w-4 h-4 mr-2" />
                Trigger Matrix
              </NavLink>
              <NavLink to="/calm-companion" className={navLinkClass}>
                <MessageSquare className="w-4 h-4 mr-2" />
                CalmCompanion
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.name && (
              <span className="hidden md:block text-sm text-slate-500">Hi, <span className="font-medium text-slate-700">{user.name.split(' ')[0]}</span></span>
            )}
            <button 
              onClick={handleSignOut}
              className="text-slate-500 hover:text-red-600 transition-colors flex items-center text-sm font-medium"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav */}
      <div className="sm:hidden border-t border-slate-200">
        <div className="pt-2 pb-3 space-y-1 flex justify-around">
          <NavLink to="/dashboard" className="p-2 text-slate-600 hover:text-brand-600" aria-label="Dashboard">
            <LayoutDashboard className="w-6 h-6" />
          </NavLink>
          <NavLink to="/daily-vent" className="p-2 text-slate-600 hover:text-brand-600" aria-label="Daily Vent">
            <BookOpen className="w-6 h-6" />
          </NavLink>
          <NavLink to="/trigger-matrix" className="p-2 text-slate-600 hover:text-brand-600" aria-label="Trigger Matrix">
            <Activity className="w-6 h-6" />
          </NavLink>
          <NavLink to="/calm-companion" className="p-2 text-slate-600 hover:text-brand-600" aria-label="CalmCompanion">
            <MessageSquare className="w-6 h-6" />
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
