
import React, { useState, useRef } from 'react';
import { PhotoRecord, TrayConfig } from '../types';
import { Camera, Image as ImageIcon, Layers, EyeOff, Eye } from 'lucide-react';

interface TeethieViewProps {
  photos: PhotoRecord[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoRecord[]>>;
  trayConfig: TrayConfig;
}

export const TeethieView: React.FC<TeethieViewProps> = ({ photos, setPhotos, trayConfig }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'compare'>('timeline');
  const [overlayPhoto, setOverlayPhoto] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: PhotoRecord = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          imageUrl: reader.result as string,
          type: 'FRONT',
          trayNumber: trayConfig.currentTray
        };
        setPhotos(prev => [newPhoto, ...prev]);
        setOverlayPhoto(null); // Clear overlay after taking
      };
      reader.readAsDataURL(file);
    }
  };

  const latestPhoto = photos[0];

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Teethie™ 记录</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
                className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'timeline' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                onClick={() => setViewMode('timeline')}
            >
                时间轴
            </button>
            <button 
                className={`px-3 py-1 text-xs rounded-md transition-all ${viewMode === 'compare' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                onClick={() => setViewMode('compare')}
            >
                对比
            </button>
        </div>
      </div>

      {/* Camera / Upload Area */}
      <div className="mb-6 relative group">
        <div 
            className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
        >
            {/* Previous Photo Overlay */}
            {overlayPhoto && (
                <div className="absolute inset-0 opacity-40 pointer-events-none z-10">
                    <img src={overlayPhoto} className="w-full h-full object-cover grayscale" alt="Overlay" />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">叠图模式</div>
                </div>
            )}

            {/* Dental Guide Overlay */}
            {showGuide && (
                <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center opacity-40 transition-opacity">
                     <svg width="240" height="160" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-600 drop-shadow-md">
                        {/* Outer Contour */}
                        <path d="M20 80C20 80 70 20 120 20C170 20 220 80 220 80C220 80 170 140 120 140C70 140 20 80 20 80Z" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6"/>
                        {/* Center Vertical Line */}
                        <line x1="120" y1="20" x2="120" y2="140" stroke="currentColor" strokeWidth="1.5"/>
                        {/* Center Horizontal Line */}
                        <line x1="20" y1="80" x2="220" y2="80" stroke="currentColor" strokeWidth="1.5"/>
                        {/* Inner Helper Arches */}
                        <path d="M40 80Q120 40 200 80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
                        <path d="M40 80Q120 120 200 80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
                     </svg>
                     <p className="text-teal-600 text-[10px] font-medium mt-2 bg-white/50 px-2 rounded backdrop-blur-sm">请将牙齿对齐框线</p>
                </div>
            )}

            <div className={`z-0 flex flex-col items-center text-gray-400 group-hover:text-teal-500 transition-colors ${overlayPhoto || showGuide ? 'opacity-30' : 'opacity-100'}`}>
                <Camera size={32} className="mb-2"/>
                <span className="text-sm font-medium">点击拍摄 / 上传</span>
                <span className="text-xs mt-1">当前第 {trayConfig.currentTray} 副</span>
            </div>
        </div>
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="environment" // Prioritize rear camera on mobile
            onChange={handleFileUpload}
        />
        
        {/* Controls Container */}
        <div className="absolute bottom-4 right-4 z-30 flex gap-2">
            {/* Guide Toggle */}
            <button
                onClick={(e) => { e.stopPropagation(); setShowGuide(!showGuide); }}
                className="bg-white/90 backdrop-blur p-2 rounded-lg shadow-md text-gray-600 hover:text-teal-600 active:scale-95 transition-all"
                title="切换辅助线"
            >
                {showGuide ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>

            {/* Overlay Toggle */}
            {latestPhoto && (
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setOverlayPhoto(overlayPhoto ? null : latestPhoto.imageUrl); 
                    }}
                    className={`text-xs font-medium px-3 py-2 rounded-lg shadow-md flex items-center gap-2 backdrop-blur transition-all ${
                        overlayPhoto 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-white/90 text-gray-700 hover:text-teal-600'
                    }`}
                >
                    <Layers size={14} />
                    {overlayPhoto ? '取消叠图' : '叠图对齐'}
                </button>
            )}
        </div>
      </div>

      {/* Gallery Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {viewMode === 'timeline' ? (
            <div className="space-y-6 pl-4 border-l-2 border-gray-100 ml-2">
                {photos.map((photo) => (
                    <div key={photo.id} className="relative">
                        <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-sm"></div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">第 {photo.trayNumber} 副</span>
                                <span className="text-xs text-gray-400">{new Date(photo.timestamp).toLocaleDateString()}</span>
                            </div>
                            <img src={photo.imageUrl} alt="Teeth record" className="w-full h-48 object-cover rounded-lg bg-gray-100" />
                        </div>
                    </div>
                ))}
                {photos.length === 0 && <p className="text-gray-400 text-sm ml-2">暂无照片记录</p>}
            </div>
        ) : (
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2 h-48">
                    <div className="bg-white border border-gray-100 rounded-lg p-2 flex flex-col shadow-sm">
                        <span className="text-xs text-gray-500 mb-1 font-medium">最早</span>
                         {photos.length > 0 ? (
                             <img src={photos[photos.length-1].imageUrl} className="w-full h-full object-cover rounded bg-gray-50" />
                         ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-gray-50 rounded">无数据</div>}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-lg p-2 flex flex-col shadow-sm">
                        <span className="text-xs text-gray-500 mb-1 font-medium">最新</span>
                         {photos.length > 0 ? (
                             <img src={photos[0].imageUrl} className="w-full h-full object-cover rounded bg-gray-50" />
                         ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-gray-50 rounded">无数据</div>}
                    </div>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl text-center border border-teal-100">
                    <p className="text-sm text-teal-800 font-bold">捏合手势对比功能 (Pro)</p>
                    <p className="text-xs text-teal-600 mt-1">已解锁基础对比视图</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
