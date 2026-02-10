'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    // Mock login - accept any credentials
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl" />
      <div className="absolute top-[30%] left-[10%] w-64 h-64 rounded-full bg-blue-300/10 blur-2xl" />

      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-2xl font-bold text-primary">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">销售红宝书</h1>
          <p className="text-sm text-slate-500 mt-1">智能运营系统</p>
        </div>

        {/* Login card */}
        <form onSubmit={handleLogin} className="glass-card p-6 space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="用户名"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className="absolute right-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Input
                label="密码"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-danger text-center">{error}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary/50" />
              <span className="text-slate-600">记住我</span>
            </label>
            <button type="button" className="text-primary hover:text-primary/80 transition-colors">
              忘记密码？
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                登录中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                登录
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2024 销售红宝书智能运营系统
        </p>
      </div>
    </div>
  );
}
