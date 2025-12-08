import { Outlet, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../../stores';
import { getCurrentUserService } from '../../services/userService';
import { UserAvatar } from '../../components/UserAvatar';
import { Sidebar } from '../../components/Sidebar';
import { TopBar } from '../../components/TopBar';


export default function GameLayout() {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, isAuthenticated } = useUserStore();

  // 初始化时获取玩家信息（只在真正需要时获取）
  useEffect(() => {
    if (!isAuthenticated) {
      const checkUser = async () => {
        try {
          await getCurrentUserService();
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      };
      checkUser();
    }
  }, [isAuthenticated]);

  // 处理侧边栏收起/展开
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // 响应式侧边栏宽度计算
  const sidebarWidth = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const isLandscape = window.innerWidth > window.innerHeight;
      
      if (isMobile && isLandscape) {
        return isSidebarCollapsed ? 'w-12' : 'w-48';
      } else if (isMobile) {
        return isSidebarCollapsed ? 'w-12' : 'w-56';
      }
    }
    return isSidebarCollapsed ? 'w-16' : 'w-64';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white safe-top safe-bottom">
      {/* 游戏主页容器 */}
      <div className="flex h-screen overflow-hidden">
        
        {/* 左侧区域 - 包含头像和侧边栏 */}
        <div className={`${sidebarWidth()} transition-all duration-300 bg-black/30 backdrop-blur-md border-r border-purple-500/20 flex flex-col`}>

          {/* 用户头像区域 */}
          <div className={`p-2 sm:p-4 border-b border-purple-500/20`}>
            <Link to="/game/profile" className="block">
              <UserAvatar 
                user={user} 
                collapsed={isSidebarCollapsed}
              />
            </Link>
          </div>
          
          {/* 侧边栏 */}
          <div className="flex-1 overflow-hidden">
            <Sidebar 
              collapsed={isSidebarCollapsed}
              onToggle={toggleSidebar}
            />
          </div>
        </div>

        {/* 右侧主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* 顶部菜单栏 - 暂留空间 */}
          <TopBar />
          
          {/* 主要内容展示区域 - 使用Outlet渲染子路由 */}
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
          
          {/* 底部空间 */}
          <div className={`h-6 sm:h-8 bg-black/20 border-t border-purple-500/10`}></div>
        </div>
      </div>
    </div>
  );
}