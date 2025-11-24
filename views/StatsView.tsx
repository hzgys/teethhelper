
import React, { useMemo, useState } from 'react';
import { LogEntry, TrayConfig, Settings, WearStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDurationSimple } from '../constants';
import { TrendingUp, Calendar, Clock, ShieldCheck, AlertTriangle, CheckCircle, Camera } from 'lucide-react';

interface StatsViewProps {
  logs: LogEntry[];
  trayConfig: TrayConfig;
  setTrayConfig: (c: TrayConfig) => void;
  settings: Settings;
  onNavigateToPhotos: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ logs, trayConfig, setTrayConfig, settings, onNavigateToPhotos }) => {
  const [showConfirmNext, setShowConfirmNext] = useState(false);
  const [showPhotoReminder, setShowPhotoReminder] = useState(false);

  // Calculate last 7 days data
  const data = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0,0,0,0);
        
        // Changed from weekday to date format (M/D)
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        
        let ms = 0;
        logs.forEach(log => {
            const start = Math.max(log.startTime, date.getTime());
            // Clamp log end to the end of this specific day
            const dayEnd = date.getTime() + 86400000;
            const logEnd = log.endTime || Date.now();
            const effectiveEnd = Math.min(logEnd, dayEnd);
            
            if (log.status === WearStatus.WEARING && effectiveEnd > start) {
                ms += (effectiveEnd - start);
            }
        });
        
        result.push({
            name: dateStr,
            hours: parseFloat((ms / (1000 * 60 * 60)).toFixed(1)),
            fullDate: date
        });
    }
    return result;
  }, [logs]);

  // Averages
  const avgHours = data.reduce((acc, curr) => acc + curr.hours, 0) / 7;
  const complianceCount = data.filter(d => d.hours >= settings.dailyGoalHours).length;
  const complianceRate = (complianceCount / 7) * 100;
  
  // Tray Progress
  // Calculate days since start.
  // If startDate is today, diff is 0, so Day 1.
  const diffTime = Math.abs(Date.now() - trayConfig.startDate);
  const daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const currentTrayProgress = Math.min(100, (daysSinceStart / trayConfig.daysPerTray) * 100);

  const confirmNextTray = () => {
      setTrayConfig({
          ...trayConfig,
          currentTray: trayConfig.currentTray + 1,
          startDate: Date.now()
      });
      setShowConfirmNext(false);
      setShowPhotoReminder(true);
  };

  return (
    <div className="p-4 h-full overflow-y-auto pb-24 relative">
      <h2 className="text-xl font-bold text-gray-800 mb-6 tracking-tight">数据统计</h2>

      {/* Tray Card */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-teal-100 text-sm font-medium">当前进度</p>
                <h3 className="text-3xl font-bold mt-1">第 {trayConfig.currentTray} <span className="text-lg font-normal text-teal-200">/ {trayConfig.totalTrays} 副</span></h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <ShieldCheck size={24} />
            </div>
        </div>
        
        <div className="mb-6 relative z-10">
            <div className="flex justify-between text-xs mb-1 opacity-90">
                <span>已佩戴 {daysSinceStart} 天</span>
                <span>建议周期 {trayConfig.daysPerTray} 天</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${currentTrayProgress}%` }}></div>
            </div>
        </div>

        <button 
            onClick={() => setShowConfirmNext(true)}
            className="relative z-20 w-full py-3 bg-white text-teal-600 font-bold rounded-xl text-sm hover:bg-teal-50 active:scale-[0.98] transition-all shadow-sm"
        >
            开始下一副
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock size={16} />
                <span className="text-xs">7日平均</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{avgHours.toFixed(1)}<span className="text-sm text-gray-400 ml-1">h</span></p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
                <TrendingUp size={16} />
                <span className="text-xs">达标率</span>
            </div>
            <p className={`text-2xl font-bold ${complianceRate >= 80 ? 'text-teal-600' : complianceRate > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                {isNaN(complianceRate) ? 0 : Math.round(complianceRate)}<span className="text-sm opacity-70 ml-1">%</span>
            </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64 mb-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-700">近7天佩戴趋势</h3>
            <span className="text-xs text-gray-400">目标: {settings.dailyGoalHours}h</span>
         </div>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: number) => [`${value} 小时`, '佩戴时长']}
                    labelStyle={{ color: '#6b7280', marginBottom: '0.25rem' }}
                />
                <Bar dataKey="hours" radius={[4, 4, 4, 4]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.hours >= settings.dailyGoalHours ? '#14b8a6' : '#ef4444'} />
                    ))}
                </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmNext && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl transform transition-all animate-scale-in">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">开始下一副?</h3>
                    <p className="text-sm text-gray-500">
                        即将开始第 <span className="font-bold text-teal-600 text-base">{trayConfig.currentTray + 1}</span> 副。
                        <br/>当前佩戴天数将重置。
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setShowConfirmNext(false)}
                        className="py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        再等等
                    </button>
                    <button 
                        onClick={confirmNextTray}
                        className="py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                    >
                        确认开始
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Photo Reminder Modal */}
      {showPhotoReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl transform transition-all animate-scale-in">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
                        <Camera size={30} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">新牙套，新记录！</h3>
                    <p className="text-sm text-gray-500">
                        第 <span className="font-bold text-teal-600">{trayConfig.currentTray}</span> 副已经开始。<br/>
                        拍张照片记录下现在的牙齿状态吧？
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => { setShowPhotoReminder(false); onNavigateToPhotos(); }}
                        className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200"
                    >
                        前往拍照
                    </button>
                    <button 
                        onClick={() => setShowPhotoReminder(false)}
                        className="w-full py-2 text-gray-400 font-medium text-sm hover:text-gray-600"
                    >
                        稍后再说
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
