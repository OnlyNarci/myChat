import React from 'react';
import { Link, useLocation } from 'react-router';

type TabType = 'profile' | 'restaurant' | 'cards' | 'shop' | 'chat' | 'ranking';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'restaurant' as TabType, name: '我的餐厅', icon: '🍽️', emoji: '🍽️', path: '/game/restaurant' },
  { id: 'cards' as TabType, name: '卡牌收藏', icon: '🃏', emoji: '🃏', path: '/game/cards' },
  { id: 'shop' as TabType, name: '卡牌商店', icon: '🛍️', emoji: '🛍️', path: '/game/shop' },
  { id: 'chat' as TabType, name: '聊天室', icon: '💬', emoji: '💬', path: '/game/chat' },
  { id: 'ranking' as TabType, name: '排行榜', icon: '🏆', emoji: '🏆', path: '/game/ranking' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() as TabType || 'chat';
  // 响应式样式计算
  const getButtonStyles = (item: typeof menuItems[0]) => {
    const baseStyles = `
      w-full flex items-center gap-2 sm:gap-3 rounded-lg
      transition-all duration-200 touch-feedback touch-target no-select
      border border-transparent
    `;
    
    const activeStyles = `
      bg-purple-600/40 text-white border border-purple-400/50 
      shadow-lg shadow-purple-500/20 glass-effect-hover
    `;
    
    const inactiveStyles = `
      text-purple-200 hover:text-white hover:bg-purple-600/20 
      hover:border-purple-500/30 glass-effect
    `;
    
    const collapsedStyles = collapsed ? 'justify-center px-2' : 'px-2 sm:px-3';
    const paddingStyles = typeof window !== 'undefined' && window.innerWidth <= 768 
      ? 'py-2' : 'py-2.5';
    
    return `${baseStyles} ${activeTab === item.id ? activeStyles : inactiveStyles} ${collapsedStyles} ${paddingStyles}`;
  };

  const getIconSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 'text-base sm:text-lg' : 'text-xl';
    }
    return 'text-xl';
  };

  const getTextSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 'text-xs' : 'text-sm';
    }
    return 'text-sm';
  };

  return (
    <div className="h-full flex flex-col">
      {/* 菜单列表 */}
      <div className="flex-1 p-1 sm:p-2 space-y-1 overflow-y-auto game-scrollbar">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={getButtonStyles(item)}
          >
            {/* 图标 */}
            <span className={`${getIconSize()} flex-shrink-0`}>
              {item.emoji}
            </span>
            
            {/* 文字标签 */}
            {!collapsed && (
              <span className={`font-medium ${getTextSize()}`}>
                {item.name}
              </span>
            )}
            
            {/* 激活状态指示器 */}
            {activeTab === item.id && !collapsed && !(typeof window !== 'undefined' && window.innerWidth <= 768) && (
              <div className="ml-auto">
                <div className="w-1 h-4 bg-purple-400 rounded-full"></div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* 收起/展开按钮 */}
      <div className="p-1 sm:p-2 border-t border-purple-500/20">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg
                   text-purple-200 hover:text-white hover:bg-purple-600/20
                   transition-all duration-200 border border-purple-500/20
                   touch-feedback touch-target glass-effect"
        >
          <span className={`${getTextSize()} sm:text-lg`}>
            {collapsed ? '▶' : '◀'}
          </span>
          {!collapsed && !(typeof window !== 'undefined' && window.innerWidth <= 768) && (
            <span className="text-sm">收起</span>
          )}
        </button>
      </div>
    </div>
  );
}