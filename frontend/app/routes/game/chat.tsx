export default function ChatPage() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
          <span className="text-4xl">💬</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">聊天室</h2>
        <div className="bg-purple-600/20 rounded-lg p-6 border border-purple-500/30 max-w-md">
          <p className="text-purple-200">聊天室功能开发中...</p>
          <p className="text-purple-200 mt-2">与其他玩家交流互动！</p>
        </div>
      </div>
    </div>
  );
}