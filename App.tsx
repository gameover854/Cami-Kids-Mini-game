import React from 'react';
import { GameLoop } from './components/GameLoop';
import { Facebook, ShoppingBag } from 'lucide-react';

// Custom TikTok Icon since it might not be in the lucide version
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

function App() {
  return (
    // h-[100dvh] ensures the app fits exactly in the visible viewport on mobile Safari/Chrome
    // Updated Background: #fff6ea with festive decorations
    <div className="h-[100dvh] w-full bg-[#fff6ea] flex items-center justify-center p-0 sm:p-4 overflow-hidden relative">
      
      {/* Decorative Background Blobs for Festive Feel */}
      <div className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] bg-red-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-green-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Pattern Overlay */}
      <div className="fixed inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] pointer-events-none mix-blend-multiply"></div>

      {/* Snowfall Effect - Adjusted color for visibility on light background */}
      <div className="fixed inset-0 pointer-events-none opacity-60" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #cbd5e1 2px, transparent 2.5px)',
        backgroundSize: '40px 40px',
        animation: 'snowfall 8s linear infinite'
      }}></div>
      
       <div className="fixed inset-0 pointer-events-none opacity-40" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #94a3b8 3px, transparent 3.5px)',
        backgroundSize: '80px 80px',
        animation: 'snowfall 12s linear infinite',
        animationDelay: '-5s'
      }}></div>

      <style>{`
        @keyframes snowfall {
          from { background-position: 0 0; }
          to { background-position: 20px 80px; }
        }
      `}</style>

      {/* --- FACEBOOK PROMOTIONAL BANNER (LEFT) (Desktop > 1280px) --- */}
      <a 
        href="https://www.facebook.com/profile.php?id=61576193061980" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hidden xl:flex fixed left-12 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-1 p-6 bg-white/95 backdrop-blur-md rounded-[2rem] border-4 border-green-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:scale-105 hover:-rotate-1 group max-w-[300px] text-center no-underline cursor-pointer"
      >
        {/* Festive Decoration Top */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
             <div className="w-4 h-16 bg-red-600 rounded-b-lg shadow-sm"></div>
             <div className="w-4 h-12 bg-green-600 rounded-b-lg shadow-sm"></div>
        </div>

        {/* LOGO AVATAR REPLACEMENT */}
        <div className="mt-4 mb-2 origin-bottom">
           <div className="bg-blue-50 p-4 rounded-3xl shadow-inner border-2 border-blue-100 transform -rotate-3 transition-transform group-hover:rotate-0">
              <ShoppingBag className="w-16 h-16 text-blue-600 drop-shadow-sm" />
           </div>
        </div>

        <div className="w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Facebook Page</p>
        </div>

        <div className="w-full border-t-2 border-dashed border-gray-200 my-2"></div>

        <p className="text-sm text-gray-700 font-bold leading-snug">
            Chuyên thời trang <br/>
            <span className="text-green-600 text-base">Trẻ em Cao cấp</span>
        </p>

        <div className="mt-3 bg-[#1877F2] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 w-full group-hover:bg-[#166fe5] transition-colors border-b-4 border-[#0e52a8] active:border-b-0 active:translate-y-1">
            <Facebook className="w-5 h-5" fill="currentColor" />
            Ghé thăm Shop
        </div>
      </a>

      {/* --- TIKTOK PROMOTIONAL BANNER (RIGHT) (Desktop > 1280px) --- */}
      <a 
        href="https://www.tiktok.com/@camikidshd" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hidden xl:flex fixed right-12 top-1/2 -translate-y-1/2 z-50 flex-col items-center gap-1 p-6 bg-white/95 backdrop-blur-md rounded-[2rem] border-4 border-red-700 shadow-[-8px_8px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:scale-105 hover:rotate-1 group max-w-[300px] text-center no-underline cursor-pointer"
      >
        {/* Festive Decoration Top */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
             <div className="w-4 h-12 bg-green-600 rounded-b-lg shadow-sm"></div>
             <div className="w-4 h-16 bg-red-600 rounded-b-lg shadow-sm"></div>
        </div>

        {/* LOGO AVATAR REPLACEMENT */}
        <div className="mt-4 mb-2 origin-bottom">
           <div className="bg-black p-4 rounded-3xl shadow-inner border-2 border-gray-700 transform rotate-3 transition-transform group-hover:rotate-0">
               <TikTokIcon className="w-16 h-16 text-white drop-shadow-sm" />
           </div>
        </div>

        <div className="w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">TikTok Channel</p>
        </div>

        <div className="w-full border-t-2 border-dashed border-gray-200 my-2"></div>

        <p className="text-sm text-gray-700 font-bold leading-snug">
            Video mới nhất <br/>
            <span className="text-pink-500 text-base">Trending & Hot</span>
        </p>

        <div className="mt-3 bg-black text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 w-full group-hover:bg-gray-900 transition-colors border-b-4 border-gray-800 active:border-b-0 active:translate-y-1">
            <TikTokIcon className="w-5 h-5" />
            Xem Video Ngay
        </div>
      </a>

      {/* --- MOBILE/TABLET BUTTONS (< 1280px) --- */}
      
      {/* Facebook Button (Top Left) */}
      <a 
        href="https://www.facebook.com/profile.php?id=61576193061980" 
        target="_blank" 
        rel="noopener noreferrer"
        className="xl:hidden absolute top-4 left-4 z-50 bg-white/90 pl-2 pr-4 py-2 rounded-full border-2 border-blue-500 shadow-lg flex items-center gap-2 transition-transform active:scale-95 group cursor-pointer"
      >
          <div className="bg-[#1877F2] rounded-full p-1.5 shadow-sm">
             <Facebook className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div className="flex flex-col items-start leading-none">
             <span className="text-[10px] font-bold text-gray-500 uppercase">Shop</span>
             <span className="text-xs font-black text-blue-600">Facebook</span>
          </div>
      </a>

      {/* TikTok Button (Top Right) */}
      <a 
        href="https://www.tiktok.com/@camikidshd" 
        target="_blank" 
        rel="noopener noreferrer"
        className="xl:hidden absolute top-4 right-4 z-50 bg-white/90 pl-4 pr-2 py-2 rounded-full border-2 border-pink-500 shadow-lg flex items-center gap-2 transition-transform active:scale-95 group cursor-pointer"
      >
          <div className="flex flex-col items-end leading-none">
             <span className="text-[10px] font-bold text-gray-500 uppercase">Shop</span>
             <span className="text-xs font-black text-pink-600">TikTok</span>
          </div>
          <div className="bg-black rounded-full p-1.5 shadow-sm">
             <TikTokIcon className="w-4 h-4 text-white" />
          </div>
      </a>

      <GameLoop />
    </div>
  );
}

export default App;