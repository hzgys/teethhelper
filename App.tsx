
import React, { useState, useEffect } from 'react';
import { LoginView } from './views/LoginView';
import { AuthenticatedApp } from './views/AuthenticatedApp';
import { User } from './types';
import { generateMockData } from './utils/mockData';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const savedUser = localStorage.getItem('ortho_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    // Setup demo data if demo user
    if (loggedInUser.isDemo) {
        const hasData = localStorage.getItem(`${loggedInUser.id}_logs`);
        if (!hasData) {
            const mockData = generateMockData();
            localStorage.setItem(`${loggedInUser.id}_logs`, JSON.stringify(mockData.logs));
            localStorage.setItem(`${loggedInUser.id}_tray_config`, JSON.stringify(mockData.trayConfig));
            localStorage.setItem(`${loggedInUser.id}_settings`, JSON.stringify(mockData.settings));
        }
    }

    setUser(loggedInUser);
    localStorage.setItem('ortho_current_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ortho_current_user');
  };

  if (isLoading) {
      return <div className="h-screen w-full bg-gray-50 flex items-center justify-center text-teal-600">加载中...</div>
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return <AuthenticatedApp user={user} onLogout={handleLogout} />;
};

export default App;
