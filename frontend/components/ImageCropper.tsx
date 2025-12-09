import { useState, useRef, useEffect } from 'react';

interface ImageCropperProps {
  file: File;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      // 初始化裁切区域为正方形，取最小边
      const size = Math.min(img.width, img.height);
      setCrop({
        x: (img.width - size) / 2,
        y: (img.height - size) / 2,
        width: size,
        height: size
      });
    };
    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleCrop = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小为正方形
    canvas.width = 200;
    canvas.height = 200;

    // 计算缩放比例
    const scaleX = imageSize.width / imageRef.current.width;
    const scaleY = imageSize.height / imageRef.current.height;

    // 绘制裁切后的图像
    ctx.drawImage(
      imageRef.current,
      crop.x / scaleX,
      crop.y / scaleY,
      crop.width / scaleX,
      crop.height / scaleY,
      0,
      0,
      200,
      200
    );

    // 转换为文件
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, { type: 'image/jpeg' });
        onCrop(croppedFile);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 更新裁切区域（这里简化处理，实际应该支持拖拽调整）
    const size = 100;
    const newX = Math.max(0, Math.min(x - size / 2, imageSize.width - size));
    const newY = Math.max(0, Math.min(y - size / 2, imageSize.height - size));
    
    setCrop({
      x: newX,
      y: newY,
      width: size,
      height: size
    });
  };

  if (!imageUrl) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">裁切头像</h3>
        
        <div className="mb-4">
          <div 
            className="relative inline-block cursor-crosshair"
            onMouseMove={handleMouseMove}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="原始图片"
              className="max-w-full max-h-96 block"
              style={{ width: 'auto', height: 'auto' }}
            />
            {/* 裁切区域指示器 */}
            <div
              className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
              style={{
                left: `${(crop.x / imageSize.width) * 100}%`,
                top: `${(crop.y / imageSize.height) * 100}%`,
                width: `${(crop.width / imageSize.width) * 100}%`,
                height: `${(crop.height / imageSize.height) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* 隐藏的画布用于裁切 */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            确认裁切
          </button>
        </div>
      </div>
    </div>
  );
}