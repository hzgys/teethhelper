import React from 'react';
import { Clock, Calendar, Camera, PieChart, Settings } from 'lucide-react';

type Tab = 'timer' | 'calendar' | 'photo' | 'stats';

interface BottomNavProps {
  currentTab: Tab;
  setTab: (t: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { id: 'timer', icon: Clock, label: '计时' },
    { id: 'calendar', icon: Calendar, label: '日历' },
    { id: 'photo', icon: Camera, label: '记录' },
    { id: 'stats', icon: PieChart, label: '统计' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-safe flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id as Tab)}
            className={`flex flex-col items-center justify-center w-16 h-14 transition-all duration-200 ${
              isActive ? 'text-primary transform -translate-y-1' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};