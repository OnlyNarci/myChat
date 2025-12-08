import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import { registerService } from '../../services/userService';
import { useUserStore } from '../../stores';

interface SignupFormData {
  user_name: string;
  password: string;
  email: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    user_name: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { loading } = useUserStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.user_name || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }

    if (!formData.email) {
      setError('请输入邮箱');
      return;
    }

    try {
      const success = await registerService(formData);
      
      if (success) {
        setSuccess('注册成功，即将跳转登录页面');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        const store = useUserStore.getState();
        setError(store.error || '注册失败，请检查输入信息');
      }
    } catch (error: any) {
      console.error('注册请求失败:', error);
      setError(error.message || '注册失败，请检查输入信息');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center safe-top safe-bottom">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md mobile-card transition-all duration-300">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-[clamp(1.5rem,3vw,2rem)] font-bold text-gray-800 mb-2">
            Narcissus TCG
          </h1>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">注册</h2>
          <p className="text-sm sm:text-base text-gray-500">欢迎来到Narcisuss TCG</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 用户名输入 */}
          <div className="relative">
            <label htmlFor="user_name" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              用户名
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">
                👤
              </span>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-4 py-3 sm:py-3 text-base sm:text-base rounded-lg border border-gray-300 focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 focus:outline-none pl-10 sm:pl-12 transition-colors"
                placeholder="请输入用户名"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* 密码输入 */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">
                🔒
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-4 py-3 sm:py-3 text-base sm:text-base rounded-lg border border-gray-300 focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 focus:outline-none pl-10 sm:pl-12 transition-colors"
                placeholder="请输入密码"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {/* 邮箱输入 */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">
                📧
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-4 py-3 sm:py-3 text-base sm:text-base rounded-lg border border-gray-300 focus:border-[#165DFF] focus:ring-2 focus:ring-[#165DFF]/20 focus:outline-none pl-10 sm:pl-12 transition-colors"
                placeholder="请输入邮箱"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* 错误信息显示 */}
          {error && (
            <div className="text-red-500 text-sm mb-2 text-center">
              {error}
            </div>
          )}

          {/* 成功信息显示 */}
          {success && (
            <div className="text-green-500 text-sm mb-2 text-center">
              {success}
            </div>
          )}

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#165DFF] hover:bg-[#165DFF]/90 disabled:bg-gray-400 text-white font-medium py-3 sm:py-3.5 text-base sm:text-base rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-[#165DFF]/50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg min-h-[48px]"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin text-lg sm:text-xl">⏳</span>
                <span className="text-sm sm:text-base">注册中...</span>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-base">注册</span>
                <span className="text-lg sm:text-xl">👉</span>
              </>
            )}
          </button>

          {/* 登录链接 */}
          <div className="text-center mt-4 sm:mt-6">
            <Link 
              to="/login" 
              className="text-[#165DFF] text-sm sm:text-base hover:text-[#165DFF]/80 transition-colors duration-200 font-medium"
            >
              已经有账号？<span className="underline">点击登录</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}