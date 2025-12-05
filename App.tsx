import React, { useState } from 'react';
import { GameLoop } from './components/GameLoop';
import { Facebook, ShoppingBag } from 'lucide-react';
import { ChristmasTree, Snowman, CandyCane, CamiCat } from './components/Assets';

// Variable for the logo image path
// Using absolute path assuming 'public' is the root
const logoCamiKids = "dist/media/img/logo_cami_kids.png";

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// Helper component to handle image loading errors gracefully
const LogoImage = () => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <CamiCat className="w-24 h-24 drop-shadow-md" />
    );
  }

  return (
    <img 
      src={logoCamiKids}
      alt="Cami Kids Logo" 
      className="w-24 h-auto drop-shadow-md object-contain"
      onError={() => setImgError(true)}
    />
  );
};

function App() {
  return (
    // h-[100dvh] ensures the app fits exactly in the visible viewport on mobile Safari/Chrome
    // Updated Background: #fff6ea with festive decorations
    <div className="h-[100dvh] w-full bg-[#fff6ea] flex items-center justify-center p-0 sm:p-4 overflow-hidden relative">
      
      {/* --- SCENIC BACKGROUND ELEMENTS --- */}

      {/* Snowy Ground Curve */}
      <div className="fixed bottom-0 left-0 right-0 h-[25vh] bg-white rounded-t-[100%] scale-150 translate-y-[10vh] pointer-events-none shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"></div>

      {/* Decorative Background Blobs for Festive Feel */}
      <div className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] bg-red-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-green-600/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Pattern Overlay */}
      <div className="fixed inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] pointer-events-none mix-blend-multiply"></div>

      <style>{`
        @keyframes shine-sweep {
          0% { transform: translateX(-100%) skewX(-25deg); }
          100% { transform: translateX(200%) skewX(-25deg); }
        }
      `}</style>
      
      {/* Bottom Left Decoration */}
      <div className="fixed bottom-[-20px] left-[-20px] p-4 pointer-events-none hidden md:block z-10">
         <div className="relative">
            <ChristmasTree className="w-64 h-64 -mb-10 drop-shadow-xl" />
            <CandyCane className="absolute bottom-8 -right-12 w-32 h-32 -rotate-12 drop-shadow-lg" />
         </div>
      </div>

      {/* Bottom Right Decoration */}
      <div className="fixed bottom-[-20px] right-[-20px] p-4 pointer-events-none hidden md:block z-10">
         <div className="relative">
            <ChristmasTree className="absolute bottom-6 -left-20 w-40 h-40 drop-shadow-md brightness-90" />
            <Snowman className="relative w-56 h-56 drop-shadow-xl z-10 transform rotate-3" />
         </div>
      </div>

      {/* --- FACEBOOK PROMOTIONAL BANNER (LEFT) (Desktop > 1280px) --- */}
      <a 
        href="https://www.facebook.com/profile.php?id=61576193061980" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hidden xl:flex fixed left-12 top-1/2 -translate-y-1/2 flex-col items-center gap-4 group z-20"
      >
        <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-4 border-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
             {/* Shine Effect */}
             <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <LogoImage />
        </div>
        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border-2 border-blue-100 group-hover:border-blue-500 transition-all flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-full text-white">
            <Facebook size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Follow us on</span>
            <span className="text-lg font-black text-gray-800 group-hover:text-blue-600">Facebook</span>
          </div>
        </div>
      </a>

      {/* --- TIKTOK PROMOTIONAL BANNER (RIGHT) (Desktop > 1280px) --- */}
      <a 
        href="https://www.tiktok.com/@cami.kids.baby" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hidden xl:flex fixed right-12 top-1/2 -translate-y-1/2 flex-col items-center gap-4 group z-20"
      >
        <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-4 border-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 overflow-hidden">
             <div className="absolute inset-0 bg-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <LogoImage />
        </div>
        <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border-2 border-pink-100 group-hover:border-pink-500 transition-all flex items-center gap-3">
          <div className="bg-black p-2 rounded-full text-white">
            <TikTokIcon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Follow us on</span>
            <span className="text-lg font-black text-gray-800 group-hover:text-pink-600">TikTok</span>
          </div>
        </div>
      </a>

      <GameLoop />
    </div>
  );
}

export default App;