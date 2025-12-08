import type { Route } from "./+types/home";
import { Link } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Narcissus TCG" },
    { name: "description", content: "欢迎来到 Narcissus TCG" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center safe-top safe-bottom">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 w-full max-w-md mobile-card transition-all duration-300 text-center">
        {/* Logo区域 */}
        <div className="mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#165DFF] to-[#36CFC9] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl sm:text-4xl">🃏</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
            Narcissus TCG
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            欢迎来到集换式卡牌游戏
          </p>
        </div>
        
        {/* 按钮区域 */}
        <div className="space-y-3 sm:space-y-4">
          <Link
            to="/login"
            className="block w-full bg-[#165DFF] hover:bg-[#165DFF]/90 text-white font-medium py-3 sm:py-3.5 text-base sm:text-base rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg min-h-[48px] flex items-center justify-center"
          >
            登录
          </Link>
          
          <Link
            to="/signup"
            className="block w-full border-2 border-[#165DFF] text-[#165DFF] hover:bg-[#165DFF] hover:text-white font-medium py-3 sm:py-3.5 text-base sm:text-base rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] min-h-[48px] flex items-center justify-center"
          >
            注册
          </Link>
        </div>

        {/* 底部信息 */}
        <div className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-400">
          集换式卡牌游戏 v1.0.0
        </div>
      </div>
    </div>
  );
}
