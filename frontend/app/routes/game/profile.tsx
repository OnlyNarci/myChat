import { useUserStore } from '../../../stores';

export default function ProfilePage() {
  const { user } = useUserStore();

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">个人主页</h2>
        <div className="bg-purple-600/20 rounded-lg p-6 border border-purple-500/30">
          <p className="text-purple-200">玩家个人主页 - 功能开发中...</p>
          {user && (
            <div className="mt-4 text-left">
              <p className="text-white">用户名: {user.name}</p>
              <p className="text-white">等级: {user.level}</p>
              {user.signature && (
                <p className="text-white">签名: {user.signature}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}