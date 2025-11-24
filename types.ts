
// Enums
export enum WearStatus {
  WEARING = 'WEARING',
  REMOVED = 'REMOVED'
}

export enum RemovalReason {
  EATING = '吃饭',
  BRUSHING = '刷牙',
  SPORTS = '运动',
  OTHER = '其他'
}

// Interfaces
export interface User {
  id: string;
  username: string;
  isDemo?: boolean;
}

export interface LogEntry {
  id: string;
  startTime: number; // timestamp
  endTime: number | null; // null if currently active
  status: WearStatus;
  reason?: RemovalReason; // Only for REMOVED status
  note?: string;
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  totalWearMs: number;
  goalMs: number;
  notes: string[];
  logs: LogEntry[];
}

export interface TrayConfig {
  currentTray: number;
  totalTrays: number;
  daysPerTray: number;
  startDate: number; // timestamp
}

export interface Settings {
  dailyGoalHours: number; // e.g., 22
  notificationsEnabled: boolean;
  reminderIntervals: number[]; // minutes, e.g. [15, 30, 60]
}

export interface PhotoRecord {
  id: string;
  timestamp: number;
  imageUrl: string; // Data URL
  type: 'FRONT' | 'UPPER' | 'LOWER';
  trayNumber: number;
}

export interface Appointment {
  id: string;
  timestamp: number;
  title: string;
  note?: string;
}
