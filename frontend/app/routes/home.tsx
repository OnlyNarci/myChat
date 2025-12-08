import type { Route } from "./+types/home";
import { useNavigate } from 'react-router';
import { useUserStore } from '../../stores';
import { getCurrentUserService } from '../../services/userService';
import { useEffect, useState } from 'react';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Narcissus TCG - 游戏主页" },
    { name: "description", content: "TCG卡牌游戏主页" },
  ];
}

export default function Home() {
  const { isAuthenticated, loading } = useUserStore();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  // 初始化时检查用户状态
  useEffect(() => {
    const checkUserStatus = async () => {
      // 设置超时，避免长时间卡住
      const timeout = setTimeout(() => {
        console.log('用户状态检查超时，直接跳转到登录页面');
        setHasChecked(true);
      }, 2000); // 2秒超时

      try {
        // 尝试获取用户信息
        const success = await getCurrentUserService();
        clearTimeout(timeout);
        console.log('用户状态检查结果:', success);
        setHasChecked(true);
      } catch (error) {
        clearTimeout(timeout);
        console.error('用户状态检查失败:', error);
        setHasChecked(true);
      }
    };

    // 只有在还未检查过时才检查
    if (!hasChecked) {
      checkUserStatus();
    }
  }, [hasChecked]);

  // 根据认证状态决定跳转
  useEffect(() => {
    if (hasChecked) {
      console.log('开始跳转，认证状态:', isAuthenticated);
      if (isAuthenticated) {
        // 已认证，直接跳转到游戏页面
        navigate('/game', { replace: true });
      } else {
        // 未认证，跳转到登录页面
        navigate('/login', { replace: true });
      }
    }
  }, [hasChecked, isAuthenticated, navigate]);

  // 显示加载页面
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">🎮</div>
        <h1 className="text-2xl font-bold text-white mb-2">Narcissus TCG</h1>
        <p className="text-purple-200">
          {!hasChecked ? '正在检查用户状态...' : '正在进入游戏...'}
        </p>
      </div>
    </div>
  );
}