import React from 'react';

export const DEFAULT_SETTINGS = {
  dailyGoalHours: 22,
  notificationsEnabled: true,
  reminderIntervals: [5, 15, 30, 60, 90, 120]
};

export const INITIAL_TRAY_CONFIG = {
  currentTray: 1,
  totalTrays: 30,
  daysPerTray: 10,
  startDate: Date.now()
};

// Colors for charts/visuals
export const COLORS = {
  wear: '#14b8a6',
  remove: '#ef4444',
  bg: '#f3f4f6'
};

// Helper to format duration
export const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { h, m, s, str: `${h}小时 ${m}分` };
};

export const formatDurationSimple = (ms: number) => {
    const totalMinutes = Math.floor(ms / 1000 / 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
}
