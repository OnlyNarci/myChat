import { useState, useRef } from 'react';
import { useUserStore, useStoreStore } from '../../../stores';
import { updateUser } from '../../../api';
import { getBuyRecordsService, getSellRecordsService, uploadAvatarService } from '../../../services';
import { ImageCropper } from '../../../components/ImageCropper';
import type { UserSelfParams, StoreRecord } from '../../../api/types';
import { LoadingState } from '../../../stores/types';

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const {
    buyRecords,
    sellRecords,
    setBuyRecordsLoading,
    setBuyRecordsError,
    setBuyRecordsData,
    setSellRecordsLoading,
    setSellRecordsError,
    setSellRecordsData
  } = useStoreStore();

  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    title: user?.title || '',
    signature: user?.signature || ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  const [showBuyRecords, setShowBuyRecords] = useState(false);
  const [showSellRecords, setShowSellRecords] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理表单输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 提交编辑表单
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setEditLoading(true);
    setEditMessage('');

    try {
      const updateData: UserSelfParams = {
        uid: user.uid,
        name: editFormData.name,
        title: editFormData.title,
        signature: editFormData.signature,
        avatar: user.avatar,
        level: user.level,
        email: user.email,
        exp: user.exp,
        byte: user.byte
      };

      const response = await updateUser(updateData);

      if (response.success) {
        setUser({ ...user, ...editFormData });
        setEditMessage('个人信息修改成功，刷新页面后显示');
        setTimeout(() => {
          setShowEditForm(false);
          setEditMessage('');
        }, 2000);
      } else {
        setEditMessage(response.message || '修改失败');
      }
    } catch (error: any) {
      setEditMessage(error.message || '修改失败');
    } finally {
      setEditLoading(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowCropper(true);
    }
  };

  // 处理裁切确认
  const handleCropConfirm = async (croppedFile: File) => {
    if (!user) return;

    setUploadLoading(true);
    setShowCropper(false);

    try {
      const success = await uploadAvatarService(croppedFile);
      if (success) {
        alert('头像上传成功');
      }
    } catch (error) {
      console.error('头像上传失败:', error);
      alert(error instanceof Error ? error.message : '头像上传失败');
    } finally {
      setUploadLoading(false);
      setSelectedFile(null);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理裁切取消
  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 获取购买记录
  const handleGetBuyRecords = async () => {
    if (buyRecords.data && buyRecords.data.length > 0) {
      // 已有数据，直接显示
      setShowBuyRecords(true);
      return;
    }

    try {
      await getBuyRecordsService();
      setShowBuyRecords(true);
    } catch (error) {
      console.error('获取购买记录失败:', error);
    }
  };

  // 获取出售记录
  const handleGetSellRecords = async () => {
    if (sellRecords.data && sellRecords.data.length > 0) {
      // 已有数据，直接显示
      setShowSellRecords(true);
      return;
    }

    try {
      await getSellRecordsService();
      setShowSellRecords(true);
    } catch (error) {
      console.error('获取出售记录失败:', error);
    }
  };

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${minutes}`;
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-white">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 核心信息区域 */}
        <div className="bg-sky-600/20 rounded-lg p-6 border border-sky-500/30">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">个人信息</h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              {uploadLoading ? '上传中...' : '更换头像'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sky-300 text-sm">用户名</p>
              <p className="text-white font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sky-300 text-sm">称号</p>
              <p className="text-white font-medium">{user.title}</p>
            </div>
            <div>
              <p className="text-sky-300 text-sm">等级</p>
              <p className="text-white font-medium">{user.level}</p>
            </div>
            <div>
              <p className="text-sky-300 text-sm">经验值</p>
              <p className="text-white font-medium">{user.exp || 0}</p>
            </div>
            <div>
              <p className="text-sky-300 text-sm">游戏币</p>
              <p className="text-white font-medium">{user.byte || 0} 比特</p>
            </div>
            <div>
              <p className="text-sky-300 text-sm">邮箱</p>
              <p className="text-white font-medium">{user.email || '未绑定'}</p>
            </div>
            {user.signature && (
              <div className="md:col-span-2">
                <p className="text-sky-300 text-sm">个性签名</p>
                <p className="text-white font-medium">{user.signature}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
          >
            {showEditForm ? '取消编辑' : '编辑信息'}
          </button>
        </div>

        {/* 编辑信息表单 */}
        {showEditForm && (
          <div className="bg-sky-600/20 rounded-lg p-6 border border-sky-500/30">
            <h3 className="text-lg font-bold text-white mb-4">编辑个人信息</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sky-300 text-sm mb-1">用户名</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-sky-800/50 border border-sky-500/30 rounded-lg text-white focus:border-sky-400 focus:outline-none"
                  maxLength={16}
                  required
                />
              </div>
              <div>
                <label className="block text-sky-300 text-sm mb-1">称号</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-sky-800/50 border border-sky-500/30 rounded-lg text-white focus:border-sky-400 focus:outline-none"
                  maxLength={16}
                />
              </div>
              <div>
                <label className="block text-sky-300 text-sm mb-1">个性签名</label>
                <textarea
                  name="signature"
                  value={editFormData.signature}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-sky-800/50 border border-sky-500/30 rounded-lg text-white focus:border-sky-400 focus:outline-none resize-none"
                  rows={3}
                  maxLength={255}
                />
              </div>
              {editMessage && (
                <p className={`text-sm ${editMessage.includes('成功') ? 'text-green-400' : 'text-red-400'}`}>
                  {editMessage}
                </p>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {editLoading ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 近期活动区域 */}
        <div className="bg-sky-600/20 rounded-lg p-6 border border-sky-500/30">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">近期活动</h2>

          {/* 购买记录 */}
          <div className="mb-4">
            <button
              onClick={handleGetBuyRecords}
              className="w-full flex items-center justify-between p-3 bg-sky-800/50 hover:bg-sky-800/70 rounded-lg transition-colors"
            >
              <span className="text-white font-medium">购买记录</span>
              <span className="text-sky-300">{showBuyRecords ? '▼' : '▶'}</span>
            </button>
            {showBuyRecords && (
              <div className="mt-2 p-3 bg-sky-800/30 rounded-lg max-h-60 overflow-y-auto">
                {buyRecords.loading === LoadingState.LOADING && (
                  <p className="text-sky-300 text-center">加载中...</p>
                )}
                {buyRecords.error && (
                  <p className="text-red-400 text-center">{buyRecords.error}</p>
                )}
                {buyRecords.data && buyRecords.data.length > 0 ? (
                  <div className="space-y-2">
                    {buyRecords.data.map((record: StoreRecord, index: number) => (
                      <p key={index} className="text-sm text-gray-200">
                        您在<span className="text-blue-400">{formatTime(record.trade_time)}</span>
                        向<span className="text-blue-400">{record.seller_name}</span>
                        购买了<span className="text-blue-400">{record.number}</span>张
                        <span className="text-blue-400">{record.card_name}</span>，
                        花费<span className="text-red-400">{record.number * record.price}</span>比特
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sky-300 text-center">暂无购买记录</p>
                )}
              </div>
            )}
          </div>

          {/* 出售记录 */}
          <div>
            <button
              onClick={handleGetSellRecords}
              className="w-full flex items-center justify-between p-3 bg-sky-800/50 hover:bg-sky-800/70 rounded-lg transition-colors"
            >
              <span className="text-white font-medium">出售记录</span>
              <span className="text-sky-300">{showSellRecords ? '▼' : '▶'}</span>
            </button>
            {showSellRecords && (
              <div className="mt-2 p-3 bg-sky-800/30 rounded-lg max-h-60 overflow-y-auto">
                {sellRecords.loading === LoadingState.LOADING && (
                  <p className="text-sky-300 text-center">加载中...</p>
                )}
                {sellRecords.error && (
                  <p className="text-red-400 text-center">{sellRecords.error}</p>
                )}
                {sellRecords.data && sellRecords.data.length > 0 ? (
                  <div className="space-y-2">
                    {sellRecords.data.map((record: StoreRecord, index: number) => (
                      <p key={index} className="text-sm text-gray-200">
                        <span className="text-blue-400">{record.buyer_name}</span>在
                        <span className="text-blue-400">{formatTime(record.trade_time)}</span>
                        向您购买了<span className="text-blue-400">{record.number}</span>张
                        <span className="text-blue-400">{record.card_name}</span>，
                        获得<span className="text-green-400">{record.number * record.price}</span>比特
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sky-300 text-center">暂无出售记录</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 成就系统 */}
        <div className="bg-sky-600/20 rounded-lg p-6 border border-sky-500/30">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">成就系统</h2>
          <div className="text-center py-8">
            <p className="text-sky-200">成就系统开发中...</p>
          </div>
        </div>

      </div>

      {/* 图像裁切组件 */}
      {showCropper && selectedFile && (
        <ImageCropper
          file={selectedFile}
          onCrop={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}