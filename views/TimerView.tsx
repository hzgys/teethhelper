
import React, { useState, useEffect, useMemo } from 'react';
import { CircleTimer } from '../components/CircleTimer';
import { LogEntry, WearStatus, RemovalReason, Settings } from '../types';
import { formatDuration, formatDurationSimple } from '../constants';
import { Play, Pause, Edit2, Plus, Minus, AlertCircle } from 'lucide-react';

interface TimerViewProps {
  logs: LogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const TimerView: React.FC<TimerViewProps> = ({ logs, setLogs, settings, setSettings }) => {
  const [now, setNow] = useState(Date.now());
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState(settings.dailyGoalHours);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get current active status
  const lastLog = logs[logs.length - 1];
  const isWearing = lastLog?.status === WearStatus.WEARING && !lastLog.endTime;

  // Calculate today's stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayTimestamp = todayStart.getTime();

  const todayStats = useMemo(() => {
    let wearMs = 0;
    let removeMs = 0;

    logs.forEach(log => {
      // Intersection with today
      const logStart = Math.max(log.startTime, todayTimestamp);
      const logEnd = log.endTime ? Math.min(log.endTime, todayTimestamp + 86400000) : now;

      if (logEnd > logStart) {
        if (log.status === WearStatus.WEARING) {
          wearMs += (logEnd - logStart);
        } else {
          removeMs += (logEnd - logStart);
        }
      }
    });

    return { wearMs, removeMs };
  }, [logs, now, todayTimestamp]);

  const goalMs = settings.dailyGoalHours * 60 * 60 * 1000;
  const progress = Math.min(100, (todayStats.wearMs / goalMs) * 100);
  const remainingMs = Math.max(0, goalMs - todayStats.wearMs);
  const formattedRemaining = formatDuration(remainingMs);

  const toggleTimer = (reason?: RemovalReason) => {
    const currentTime = Date.now();

    if (lastLog && !lastLog.endTime) {
      // Close previous log
      const updatedLogs = [...logs];
      updatedLogs[updatedLogs.length - 1].endTime = currentTime;
      setLogs(updatedLogs);
    }

    // Create new log
    const newStatus = isWearing ? WearStatus.REMOVED : WearStatus.WEARING;
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      startTime: currentTime,
      endTime: null,
      status: newStatus,
      reason: newStatus === WearStatus.REMOVED ? reason : undefined
    };
    setLogs(prev => [...prev, newLog]);
    setShowReasonModal(false);
  };

  const handleRemoveClick = () => {
    if (isWearing) {
      setShowReasonModal(true);
    } else {
      toggleTimer();
    }
  };

  const handleGoalSave = () => {
    setSettings({ ...settings, dailyGoalHours: tempGoal });
    setShowGoalModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-start h-full p-6 overflow-y-auto pb-24">
      
      {/* Header Stats */}
      <div className="w-full flex justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">已戴时长</p>
          <p className="text-xl font-bold text-primary">{formatDurationSimple(todayStats.wearMs)}</p>
        </div>
        <div className="h-10 w-[1px] bg-gray-200 self-center"></div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">已摘时长</p>
          <p className="text-xl font-bold text-danger">{formatDurationSimple(todayStats.removeMs)}</p>
        </div>
        <div className="h-10 w-[1px] bg-gray-200 self-center"></div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">距离目标</p>
          <p className="text-xl font-bold text-gray-700">{formattedRemaining.h}h {formattedRemaining.m}m</p>
        </div>
      </div>

      {/* Main Timer */}
      <div className="relative mb-10">
        <CircleTimer
          percentage={progress}
          color={isWearing ? '#14b8a6' : '#ef4444'}
          size={260}
          strokeWidth={16}
        >
          <div className="text-center flex flex-col items-center">
            <span className={`text-sm font-medium mb-2 px-3 py-1 rounded-full ${isWearing ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-700'}`}>
              {isWearing ? '佩戴中' : '已取下'}
            </span>
            <span className="text-5xl font-bold tracking-tighter text-gray-800 font-sans">
               {isWearing 
                ? formatDuration(todayStats.wearMs).str.split(' ')[0] + ':' + formatDuration(todayStats.wearMs).m.toString().padStart(2, '0')
                : formatDuration(todayStats.removeMs).str.split(' ')[0] + ':' + formatDuration(todayStats.removeMs).m.toString().padStart(2, '0')
               }
            </span>
            <span className="text-gray-400 text-sm mt-1">
              今日概览
            </span>
          </div>
        </CircleTimer>

        {/* Floating Action Button centered below timer */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleRemoveClick}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform active:scale-95 ${
              isWearing ? 'bg-danger text-white hover:bg-red-600' : 'bg-primary text-white hover:bg-teal-600'
            }`}
          >
            {isWearing ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
        </div>
      </div>

      {/* Sub-actions */}
      <div className="w-full mt-4 grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <span className="text-gray-500 text-sm mb-1">当前状态</span>
            <span className="font-semibold text-gray-800">{isWearing ? '表现不错' : '记得戴回'}</span>
        </div>
        <div 
            onClick={() => { setTempGoal(settings.dailyGoalHours); setShowGoalModal(true); }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative cursor-pointer hover:border-teal-200 transition-colors group"
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={12} className="text-gray-400"/>
            </div>
            <span className="text-gray-500 text-sm mb-1">每日目标</span>
            <div className="flex items-center gap-1">
                 <span className="font-semibold text-gray-800">{settings.dailyGoalHours}小时/天</span>
                 <Edit2 size={12} className="text-gray-300 sm:hidden"/>
            </div>
        </div>
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 animate-slide-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">为什么要取下?</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.values(RemovalReason).map((reason) => (
                <button
                  key={reason}
                  onClick={() => toggleTimer(reason)}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-200 text-gray-700 hover:text-teal-700 transition-colors font-medium"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReasonModal(false)}
              className="w-full py-3 text-gray-500 font-medium"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">修改每日目标</h3>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <button 
                onClick={() => setTempGoal(prev => Math.max(1, prev - 0.5))}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-transform"
              >
                <Minus size={20} />
              </button>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-teal-600 min-w-[3rem] text-center">{tempGoal}</span>
                <span className="text-sm text-gray-500 mb-1">小时</span>
              </div>
              <button 
                onClick={() => setTempGoal(prev => Math.min(24, prev + 0.5))}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-transform"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {[18, 20, 22].map(g => (
                <button
                  key={g}
                  onClick={() => setTempGoal(g)}
                  className={`py-1.5 rounded-lg text-sm border font-medium transition-colors ${tempGoal === g ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {g}h
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowGoalModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleGoalSave} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
