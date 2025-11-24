
import React, { useState } from 'react';
import { User } from '../types';
import { Smile, UserPlus, LogIn, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('ortho_users') || '[]');
    
    if (isRegister) {
      if (storedUsers.find((u: any) => u.username === username)) {
        setError('用户名已存在');
        return;
      }
      const newUser = { id: crypto.randomUUID(), username, password }; // In real app, hash password!
      localStorage.setItem('ortho_users', JSON.stringify([...storedUsers, newUser]));
      onLogin({ id: newUser.id, username: newUser.username });
    } else {
      const user = storedUsers.find((u: any) => u.username === username && u.password === password);
      if (user) {
        onLogin({ id: user.id, username: user.username });
      } else {
        setError('用户名或密码错误');
      }
    }
  };

  const handleDemoLogin = () => {
    onLogin({ id: 'demo_user', username: '体验用户', isDemo: true });
  };

  return (
    <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg rotate-3">
            <Smile className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">正畸伴侣</h1>
          <p className="text-gray-400 text-sm mt-1">您的隐形牙套贴身管家</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">账号</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              placeholder="请输入密码"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center justify-center gap-2"
          >
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {isRegister ? '注册并登录' : '登录'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-4">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-sm text-gray-500 hover:text-teal-600 text-center"
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400">或</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full py-3 bg-white border-2 border-teal-100 hover:border-teal-300 text-teal-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>体验测试账号</span>
            <ArrowRight size={16} />
          </button>
          <p className="text-center text-xs text-gray-400">
            包含30天模拟数据，即刻体验所有功能
          </p>
        </div>
      </div>
    </div>
  );
};
