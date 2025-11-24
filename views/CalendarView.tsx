
import React, { useState, useMemo } from 'react';
import { LogEntry, Settings, WearStatus } from '../types';
import { formatDurationSimple, COLORS } from '../constants';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

interface CalendarViewProps {
  logs: LogEntry[];
  settings: Settings;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ logs, settings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOffset = firstDayOfMonth.getDay(); // 0 = Sunday

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDayOffset }, (_, i) => i);

  // Calculate stats for a specific day
  const getStatsForDay = (day: number) => {
    const checkStart = new Date(year, month, day).getTime();
    const checkEnd = checkStart + 86400000;
    
    let wearMs = 0;
    logs.forEach(log => {
        const logEnd = log.endTime || Date.now();
        const start = Math.max(log.startTime, checkStart);
        const end = Math.min(logEnd, checkEnd);
        
        if (log.status === WearStatus.WEARING && end > start) {
            wearMs += (end - start);
        }
    });
    
    const hours = wearMs / (1000 * 60 * 60);
    return { hours, wearMs };
  };

  // Determine color based on goal
  const getDayColor = (hours: number) => {
    if (hours === 0 && new Date(year, month, 1) > new Date()) return 'bg-gray-100'; // Future
    if (hours >= settings.dailyGoalHours) return 'bg-teal-400 text-white'; // Greenish Teal
    if (hours >= settings.dailyGoalHours - 2) return 'bg-yellow-300 text-gray-800';
    if (hours > 0) return 'bg-red-300 text-white';
    return 'bg-gray-100 text-gray-400';
  };

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Filter logs for selected day details
  const selectedDayLogs = useMemo(() => {
    if (!selectedDate) return [];
    
    const dayStart = new Date(selectedDate).setHours(0,0,0,0);
    const dayEnd = dayStart + 86400000;
    
    return logs.filter(log => {
        const logEnd = log.endTime || Date.now();
        // Log overlaps with day
        return (log.startTime < dayEnd) && (logEnd > dayStart);
    }).sort((a, b) => a.startTime - b.startTime);
  }, [logs, selectedDate]);

  // Calculate daily summary for the panel
  const dailySummary = useMemo(() => {
    if (!selectedDate || selectedDayLogs.length === 0) return null;

    let totalWear = 0;
    let removeCount = 0;

    selectedDayLogs.forEach(log => {
        const dayStart = new Date(selectedDate).setHours(0,0,0,0);
        const dayEnd = dayStart + 86400000;
        const logEnd = log.endTime || Date.now();
        
        const effectiveStart = Math.max(log.startTime, dayStart);
        const effectiveEnd = Math.min(logEnd, dayEnd);
        
        if (effectiveEnd > effectiveStart) {
            if (log.status === WearStatus.WEARING) {
                totalWear += (effectiveEnd - effectiveStart);
            } else {
                removeCount++;
            }
        }
    });

    return { totalWear, removeCount };
  }, [selectedDate, selectedDayLogs]);

  const isSelectedDateToday = selectedDate && new Date().toDateString() === selectedDate.toDateString();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Calendar Header */}
      <div className="bg-white p-4 shadow-sm z-10">
        <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20} className="text-gray-600"/></button>
            <h2 className="text-lg font-bold text-gray-800">
            {currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
            </h2>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20} className="text-gray-600"/></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-gray-400 font-medium">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-2 auto-rows-fr">
            {blanks.map(b => <div key={`blank-${b}`} />)}
            {days.map(day => {
                const stats = getStatsForDay(day);
                const dateObj = new Date(year, month, day);
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
                const isToday = new Date().toDateString() === dateObj.toDateString();
                
                return (
                    <button
                        key={day}
                        onClick={() => setSelectedDate(dateObj)}
                        className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition-all
                            ${getDayColor(stats.hours)}
                            ${isSelected ? 'ring-2 ring-offset-2 ring-teal-500 scale-105 z-10 shadow-md' : 'hover:opacity-80'}
                            ${isToday && !isSelected ? 'border-2 border-teal-500/30' : ''}
                        `}
                    >
                        <span className="font-bold">{day}</span>
                        {stats.hours > 0 && (
                            <div className="w-full flex justify-center mt-0.5">
                                <span className="text-[0.6rem] leading-none opacity-90 scale-90">{stats.hours.toFixed(1)}</span>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
      </div>

      {/* Details Panel */}
      <div className="flex-1 overflow-hidden flex flex-col relative">
        {selectedDate ? (
            <>
                <div className="px-6 py-4 flex justify-between items-end bg-gray-50 border-b border-gray-100/50 shrink-0">
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                            {selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-gray-800">
                                {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                            </h3>
                            {isSelectedDateToday && <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">今天</span>}
                        </div>
                    </div>
                    {dailySummary && (
                        <div className="text-right">
                            <p className="text-xs text-gray-400 mb-1">有效佩戴</p>
                            <div className="flex items-baseline justify-end gap-1">
                                <p className={`text-xl font-bold font-mono ${dailySummary.totalWear >= settings.dailyGoalHours * 3600000 ? 'text-teal-600' : 'text-orange-500'}`}>
                                    {formatDurationSimple(dailySummary.totalWear).split(' ')[0]}
                                </p>
                                <span className="text-sm text-gray-500">{formatDurationSimple(dailySummary.totalWear).split(' ')[1]}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-0">
                    {selectedDayLogs.length > 0 ? (
                        selectedDayLogs.map((log, index) => {
                            const isLast = index === selectedDayLogs.length - 1;
                            const duration = (log.endTime || Date.now()) - log.startTime;
                            const isWearing = log.status === WearStatus.WEARING;

                            return (
                                <div key={log.id} className="relative pl-6 pb-6 last:pb-0">
                                    {/* Timeline Line */}
                                    {!isLast && (
                                        <div className="absolute left-[9px] top-4 bottom-0 w-0.5 bg-gray-200"></div>
                                    )}
                                    
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 box-content
                                        ${isWearing ? 'bg-teal-500' : 'bg-orange-400'}`}>
                                    </div>

                                    {/* Card */}
                                    <div className={`
                                        ml-3 p-3 rounded-xl border transition-all hover:shadow-sm
                                        ${isWearing ? 'bg-white border-teal-100' : 'bg-white border-orange-100'}
                                    `}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${isWearing ? 'text-teal-700' : 'text-orange-700'}`}>
                                                    {isWearing ? '佩戴中' : (log.reason || '取下')}
                                                </span>
                                                {!log.endTime && isWearing && (
                                                    <span className="animate-pulse w-2 h-2 bg-teal-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <span className="text-xs font-mono font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                                                {formatDurationSimple(duration)}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500 font-mono">
                                            <Clock size={12} className="mr-1.5 opacity-50"/>
                                            <span>
                                                {new Date(log.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="mx-2 text-gray-300">→</span>
                                            <span>
                                                {log.endTime ? new Date(log.endTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '进行中'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                         <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <CalendarIcon size={24} className="opacity-50"/>
                            </div>
                            <p className="text-sm">该日无记录</p>
                        </div>
                    )}
                    {/* Padding for bottom nav */}
                    <div className="h-20"></div>
                </div>
            </>
        ) : (
             <div className="flex items-center justify-center h-full text-gray-400">
                <p>请选择日期</p>
             </div>
        )}
      </div>
    </div>
  );
};
