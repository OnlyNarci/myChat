import React from 'react';

export function TopBar() {
  // 响应式高度和内边距
  const getBarHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 'h-12 sm:h-14' : 'h-16';
    }
    return 'h-16';
  };

  const getPadding = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 'px-3 sm:px-4' : 'px-6';
    }
    return 'px-6';
  };

  const getTitleSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 'text-lg sm:text-xl' : 'text-xl';
    }
    return 'text-xl';
  };

  return (
    <div className={`${getBarHeight()} bg-black/30 backdrop-blur-md border-b border-purple-500/20 flex items-center ${getPadding()} glass-effect`}>
      {/* 暂留空间，可添加游戏标题、通知、设置等功能 */}
      <div className="flex-1"></div>
      
      {/* 游戏标题 - 可选 */}
      <div className="text-center">
        <h1 className={`${getTitleSize()} font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
          Narcissus TCG
        </h1>
      </div>
      
      <div className="flex-1 flex justify-end">
        {/* 右侧功能区域暂留 */}
      </div>
    </div>
  );
}