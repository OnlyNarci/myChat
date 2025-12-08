export default function CardsPage() {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-full flex items-center justify-center">
          <span className="text-4xl">🃏</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">卡牌收藏</h2>
        <div className="bg-sky-600/20 rounded-lg p-6 border border-sky-500/30 max-w-md">
          <p className="text-sky-200">卡牌收藏功能开发中...</p>
          <p className="text-sky-200 mt-2">收集稀有卡牌，构建你的套组！</p>
        </div>
      </div>
    </div>
  );
}