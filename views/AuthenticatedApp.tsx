
import React, { useState } from 'react';
import { TimerView } from './TimerView';
import { CalendarView } from './CalendarView';
import { TeethieView } from './TeethieView';
import { StatsView } from './StatsView';
import { BottomNav } from '../components/BottomNav';
import { LogEntry, PhotoRecord, TrayConfig, Settings, User } from '../types';
import { DEFAULT_SETTINGS, INITIAL_TRAY_CONFIG } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LogOut, User as UserIcon } from 'lucide-react';

interface AuthenticatedAppProps {
  user: User;
  onLogout: () => void;
}

export const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'calendar' | 'photo' | 'stats'>('timer');

  // User-scoped Storage
  const [logs, setLogs] = useLocalStorage<LogEntry[]>(`${user.id}_logs`, []);
  const [photos, setPhotos] = useLocalStorage<PhotoRecord[]>(`${user.id}_photos`, []);
  const [settings, setSettings] = useLocalStorage<Settings>(`${user.id}_settings`, DEFAULT_SETTINGS);
  const [trayConfig, setTrayConfig] = useLocalStorage<TrayConfig>(`${user.id}_tray_config`, INITIAL_TRAY_CONFIG);

  return (
    <div className="h-full w-full max-w-md mx-auto bg-gray-50 relative flex flex-col sm:border-x sm:border-gray-200 shadow-2xl">
      {/* Top Header for User Info */}
      <div className="bg-white px-4 py-2 border-b border-gray-100 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-gray-400">欢迎回来</span>
                <span className="text-sm font-bold text-gray-800">{user.username} {user.isDemo && '(测试)'}</span>
            </div>
        </div>
        <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
        </button>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'timer' && (
          <div className="h-full animate-fade-in">
             <TimerView logs={logs} setLogs={setLogs} settings={settings} setSettings={setSettings} />
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="h-full animate-fade-in">
            <CalendarView logs={logs} settings={settings} />
          </div>
        )}
        {activeTab === 'photo' && (
           <div className="h-full animate-fade-in">
             <TeethieView photos={photos} setPhotos={setPhotos} trayConfig={trayConfig} />
           </div>
        )}
        {activeTab === 'stats' && (
           <div className="h-full animate-fade-in">
             <StatsView 
                logs={logs} 
                trayConfig={trayConfig} 
                setTrayConfig={setTrayConfig} 
                settings={settings} 
                onNavigateToPhotos={() => setActiveTab('photo')} 
             />
           </div>
        )}
      </main>

      {/* Navigation */}
      <BottomNav currentTab={activeTab} setTab={setActiveTab} />
    </div>
  );
};
