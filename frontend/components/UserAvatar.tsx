import type { User } from '../api/types';

interface UserAvatarProps {
  user: User | null;
  collapsed?: boolean;
}

export function UserAvatar({ user, collapsed = false }: UserAvatarProps) {
  const avatarUrl = user?.avatar || '/default-avatar.png';
  const displayName = user?.name || '游客';

  // 响应式头像尺寸
  const avatarSize = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const isLandscape = window.innerWidth > window.innerHeight;
      
      if (isMobile && isLandscape) {
        return 'w-8 h-8';
      } else if (isMobile) {
        return 'w-10 h-10';
      }
    }
    return 'w-12 h-12';
  };

  return (
    <div
      className={`
        group relative flex items-center gap-2 sm:gap-3 p-2 rounded-lg
        bg-purple-600/20 hover:bg-purple-600/30 
        border border-purple-500/30 hover:border-purple-400/50
        transition-all duration-200 hover:scale-105
        cursor-pointer touch-feedback touch-target no-select
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      {/* 头像 */}
      <div className="relative">
        <div className={`${avatarSize()} rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center`}>
          {user?.avatar ? (
            <img 
              src={avatarUrl} 
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span className={`${user?.avatar ? 'hidden' : ''} text-white font-bold ${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'text-sm' : 'text-lg'}`}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* 在线状态指示器 */}
        <div className={`absolute -bottom-1 -right-1 ${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'w-3 h-3' : 'w-4 h-4'} bg-green-400 rounded-full border-2 border-slate-900 status-indicator online`}></div>
      </div>

      {/* 用户信息 */}
      {!collapsed && (
        <div className="text-left">
          <div className={`font-semibold text-white ${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'text-xs' : 'text-sm'} truncate max-w-[100px] sm:max-w-[120px]`}>
            {displayName}
          </div>
          <div className={`text-purple-200 ${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'text-xs' : 'text-xs'}`}>
            Lv.{user?.level || 1}
          </div>
        </div>
      )}

      {/* 点击提示 */}
      {!collapsed && !(typeof window !== 'undefined' && window.innerWidth <= 768) && (
        <div className="ml-auto">
          <span className="text-xs text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
            个人主页
          </span>
        </div>
      )}
    </div>
  );
}