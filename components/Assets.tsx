import React from 'react';

// Cami Cat - Recreating the style from the description (White cat, black ears/spots, cute)
export const CamiCat = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body/Head base */}
    <path d="M15 80L20 40C20 40 10 30 15 15C18 5 25 2 30 5L35 15H65L70 5C75 2 82 5 85 15C90 30 80 40 80 40L85 80H15Z" fill="#FFFFFF" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
    
    {/* Left Ear Spot */}
    <path d="M15 15C18 5 25 2 30 5L35 15C25 20 18 18 15 15Z" fill="#000000"/>
    
    {/* Right Ear - White */}
    <path d="M65 15L70 5C75 2 82 5 85 15C82 18 75 20 65 15Z" fill="#FFFFFF" stroke="#000" strokeWidth="2"/>

    {/* Eyes */}
    <circle cx="35" cy="45" r="6" fill="#000"/>
    <circle cx="37" cy="43" r="2" fill="#FFF"/> {/* Shine */}
    
    <circle cx="65" cy="45" r="6" fill="#000"/>
    <circle cx="67" cy="43" r="2" fill="#FFF"/> {/* Shine */}

    {/* Cheeks */}
    <circle cx="25" cy="55" r="4" fill="#FFB6C1" opacity="0.6"/>
    <circle cx="75" cy="55" r="4" fill="#FFB6C1" opacity="0.6"/>

    {/* Nose & Mouth */}
    <path d="M48 52L50 54L52 52" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    <path d="M50 54V58" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    <path d="M50 58Q45 62 40 58" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
    <path d="M50 58Q55 62 60 58" stroke="#000" strokeWidth="2" strokeLinecap="round"/>

    {/* Black Spots on face/body */}
    <circle cx="80" cy="35" r="3" fill="#000"/>
    <ellipse cx="20" cy="70" rx="3" ry="5" fill="#000"/>

    {/* Paws holding the "ledge" */}
    <circle cx="25" cy="78" r="6" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <path d="M23 76L23 80M27 76L27 80" stroke="#000" strokeWidth="2"/>
    
    <circle cx="75" cy="78" r="6" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <path d="M73 76L73 80M77 76L77 80" stroke="#000" strokeWidth="2"/>
  </svg>
);

// Sleeping Version of Cami Cat
export const CamiCatSleeping = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
     {/* Flattened Body for lying down */}
     <path d="M10 80 L 15 50 C 15 50 10 40 20 30 C 25 25 35 25 40 30 L 45 40 H 65 L 70 30 C 75 25 85 25 90 30 C 100 40 95 50 95 50 L 100 80 H 10 Z" fill="#FFFFFF" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>

     {/* Ears - Lowered */}
     <path d="M18 32 C 15 25 20 20 25 22 L 30 30 Z" fill="#000000"/> {/* Left Spot Ear */}
     <path d="M82 32 C 85 25 80 20 75 22 L 70 30 Z" fill="#FFFFFF" stroke="#000" strokeWidth="2"/>

     {/* Closed Eyes (Curves) */}
     <path d="M30 50 Q 35 55 40 50" stroke="#000" strokeWidth="3" strokeLinecap="round" />
     <path d="M70 50 Q 75 55 80 50" stroke="#000" strokeWidth="3" strokeLinecap="round" />

     {/* Nose & Mouth */}
     <path d="M53 58 L 55 60 L 57 58" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
     <path d="M55 60 V 63" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
     <path d="M55 63 Q 50 66 45 63" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
     <path d="M55 63 Q 60 66 65 63" stroke="#000" strokeWidth="2" strokeLinecap="round"/>

     {/* Cheeks */}
     <circle cx="25" cy="58" r="4" fill="#FFB6C1" opacity="0.6"/>
     <circle cx="85" cy="58" r="4" fill="#FFB6C1" opacity="0.6"/>

     {/* Paws tucked in */}
     <ellipse cx="40" cy="75" rx="6" ry="4" fill="#FFF" stroke="#000" strokeWidth="2"/>
     <ellipse cx="70" cy="75" rx="6" ry="4" fill="#FFF" stroke="#000" strokeWidth="2"/>
  </svg>
);

// Cozy Rug
export const Rug = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="30" rx="90" ry="25" fill="#166534" stroke="#14532d" strokeWidth="2"/>
      <ellipse cx="100" cy="30" rx="75" ry="18" fill="none" stroke="#FCD34D" strokeWidth="2" strokeDasharray="5 5"/>
      {/* Tassels */}
      <path d="M10 30 H 5" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
      <path d="M190 30 H 195" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// New Asset: Nhat Linh Character (Based on description/photo)
export const NhatLinhHero = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/>
      </filter>
      <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#172554" />
      </linearGradient>
    </defs>
    
    <g filter="url(#heroShadow)">
        {/* Shirt (Blue Polo) */}
        <path d="M20 120 V 90 Q 20 70 30 65 L 70 65 Q 80 70 80 90 V 120" fill="url(#shirtGrad)" />
        {/* Collar */}
        <path d="M30 65 L 50 80 L 70 65 L 65 55 L 50 65 L 35 55 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1"/>
        
        {/* Neck */}
        <rect x="42" y="50" width="16" height="15" fill="#f5d0b0" />

        {/* Head */}
        <rect x="30" y="15" width="40" height="45" rx="12" fill="#f5d0b0" />
        
        {/* Hair (Short Black, styled up) */}
        <path d="M28 25 C 28 10 35 5 50 5 C 65 5 72 10 72 25 C 72 30 70 35 70 35 H 30 C 30 35 28 30 28 25 Z" fill="#1a1a1a" />
        <path d="M50 5 Q 55 0 60 8" fill="#1a1a1a" /> {/* Tuft */}

        {/* Glasses (Black Rims) */}
        <rect x="32" y="32" width="16" height="10" rx="2" stroke="#000" strokeWidth="2" fill="rgba(255,255,255,0.2)"/>
        <rect x="52" y="32" width="16" height="10" rx="2" stroke="#000" strokeWidth="2" fill="rgba(255,255,255,0.2)"/>
        <line x1="48" y1="37" x2="52" y2="37" stroke="#000" strokeWidth="2"/>

        {/* Eyes */}
        <circle cx="40" cy="37" r="2" fill="#000"/>
        <circle cx="60" cy="37" r="2" fill="#000"/>

        {/* Smile */}
        <path d="M42 50 Q 50 55 58 50" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        
        {/* Ears */}
        <circle cx="28" cy="38" r="4" fill="#f5d0b0" />
        <circle cx="72" cy="38" r="4" fill="#f5d0b0" />
    </g>
  </svg>
);

// Special Summon Item
export const GoldenTicket = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FCD34D" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow)">
        <circle cx="50" cy="50" r="45" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="2"/>
        <circle cx="50" cy="50" r="38" fill="white" fillOpacity="0.2" stroke="#B45309" strokeWidth="1" strokeDasharray="4 2"/>
        
        {/* Mini Nhat Linh Icon inside */}
        <g transform="translate(25, 20) scale(0.5)">
            <rect x="30" y="15" width="40" height="45" rx="12" fill="#f5d0b0" />
            <path d="M28 25 C 28 10 35 5 50 5 C 65 5 72 10 72 25 C 72 30 70 35 70 35 H 30 Z" fill="#1a1a1a" />
            <rect x="32" y="32" width="16" height="10" rx="2" stroke="#000" strokeWidth="3" />
            <rect x="52" y="32" width="16" height="10" rx="2" stroke="#000" strokeWidth="3" />
        </g>
        
        {/* Star */}
        <path d="M50 75 L 45 85 L 50 82 L 55 85 Z" fill="#B45309" />
    </g>
  </svg>
);

export const GiftRed = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradRed" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
      <linearGradient id="gradGold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FCD34D" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FCD34D" />
      </linearGradient>
      <filter id="shadowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
      </filter>
    </defs>
    
    <g filter="url(#shadowRed)">
      {/* Box */}
      <rect x="15" y="30" width="70" height="60" rx="6" fill="url(#gradRed)" stroke="#7F1D1D" strokeWidth="2"/>
      
      {/* Ribbons */}
      <rect x="42" y="30" width="16" height="60" fill="url(#gradGold)" />
      <rect x="15" y="52" width="70" height="16" fill="url(#gradGold)"/>
      
      {/* Bow */}
      <path d="M50 35 C 30 40, 20 10, 50 30 C 80 10, 70 40, 50 35" fill="url(#gradGold)" stroke="#B45309" strokeWidth="1"/>
      <circle cx="50" cy="32" r="5" fill="#FBBF24" stroke="#B45309" strokeWidth="1"/>
      
      {/* Sparkle */}
      <circle cx="20" cy="35" r="1" fill="white" opacity="0.6"/>
      <circle cx="80" cy="80" r="1" fill="white" opacity="0.6"/>
    </g>
  </svg>
);

export const GiftGreen = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <filter id="shadowGreen" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
      </filter>
    </defs>

    <g filter="url(#shadowGreen)">
      {/* Box */}
      <rect x="20" y="25" width="60" height="65" rx="4" fill="url(#gradGreen)" stroke="#064E3B" strokeWidth="2"/>
      
      {/* Dots Pattern */}
      <g fill="#FFF" opacity="0.25">
         <circle cx="30" cy="35" r="2.5"/> <circle cx="50" cy="35" r="2.5"/> <circle cx="70" cy="35" r="2.5"/>
         <circle cx="30" cy="55" r="2.5"/> <circle cx="50" cy="55" r="2.5"/> <circle cx="70" cy="55" r="2.5"/>
         <circle cx="30" cy="75" r="2.5"/> <circle cx="50" cy="75" r="2.5"/> <circle cx="70" cy="75" r="2.5"/>
      </g>

      {/* Ribbon */}
      <rect x="45" y="25" width="10" height="65" fill="#EF4444" stroke="#991B1B" strokeWidth="1"/>
      
      {/* Bow */}
      <path d="M50 25 L35 10 L50 15 L65 10 L50 25" fill="#EF4444" stroke="#991B1B" strokeWidth="1"/>
      <rect x="46" y="23" width="8" height="4" fill="#B91C1C"/>
    </g>
  </svg>
);

export const ChristmasSock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadowSock" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
      </filter>
    </defs>
    <g filter="url(#shadowSock)">
        {/* Sock shape */}
        <path d="M35 15 H65 V55 C65 70 75 75 65 85 C55 95 25 90 20 80 C15 70 20 60 35 55 V15" 
            fill="#DC2626" stroke="#991B1B" strokeWidth="2"/>
        
        {/* Pattern: Snowflakes */}
        <g stroke="#FFF" strokeWidth="2" opacity="0.6" strokeLinecap="round">
            <path d="M42 35 L58 35 M50 27 L50 43 M44 29 L56 41 M56 29 L44 41" /> 
            <path d="M45 70 L55 70 M50 65 L50 75" /> 
        </g>

        {/* Heel Patch */}
        <circle cx="65" cy="55" r="8" fill="#FFF"/>

        {/* Toe Patch */}
        <circle cx="22" cy="82" r="8" fill="#FFF"/>

        {/* Cuff */}
        <rect x="25" y="5" width="50" height="18" rx="6" fill="#FFF" stroke="#E5E7EB" strokeWidth="2"/>
        {/* Cuff Texture */}
        <circle cx="35" cy="14" r="2" fill="#E5E7EB"/>
        <circle cx="50" cy="12" r="2" fill="#E5E7EB"/>
        <circle cx="65" cy="14" r="2" fill="#E5E7EB"/>
    </g>
  </svg>
);

export const HeartItem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadowHeart" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
      </filter>
      <linearGradient id="gradHeart" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#BE185D" />
      </linearGradient>
    </defs>
    <g filter="url(#shadowHeart)">
      {/* Heart Shape */}
      <path d="M50 88 C20 70 5 50 5 35 C5 20 15 10 30 10 C40 10 45 15 50 22 C55 15 60 10 70 10 C85 10 95 20 95 35 C95 50 80 70 50 88 Z" 
            fill="url(#gradHeart)" stroke="#9D174D" strokeWidth="3"/>
      {/* Shine */}
      <path d="M20 30 Q 30 20 40 25" stroke="white" strokeWidth="3" opacity="0.6" strokeLinecap="round"/>
      
      {/* Plus Sign */}
      <path d="M50 35 V 55 M 40 45 H 60" stroke="white" strokeWidth="4" strokeLinecap="round"/>
    </g>
  </svg>
);

export const SnowflakeItem = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadowFlake" x="-20%" y="-20%" width="140%" height="140%">
         <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
      </filter>
    </defs>
    <g filter="url(#shadowFlake)">
        {/* Main Hex Lines */}
        <path d="M50 10 V 90 M 15 30 L 85 70 M 15 70 L 85 30" stroke="#38BDF8" strokeWidth="6" strokeLinecap="round"/>
        {/* Tips */}
        <path d="M50 10 L 40 25 M 50 10 L 60 25" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round"/>
        <path d="M50 90 L 40 75 M 50 90 L 60 75" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round"/>
        
        <path d="M15 30 L 25 40 M 15 30 L 30 30" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round"/>
        <path d="M85 70 L 75 60 M 85 70 L 70 70" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round"/>
        
        <path d="M15 70 L 30 70 M 15 70 L 25 60" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round"/>
        <path d="M85 30 L 70 30 M 85 30 L 75 40" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round"/>

        <circle cx="50" cy="50" r="5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2"/>
    </g>
  </svg>
);

export const Ornament = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ornamentGrad" cx="0.3" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#FDE047" /> {/* Bright Yellow */}
            <stop offset="60%" stopColor="#EAB308" /> {/* Gold */}
            <stop offset="100%" stopColor="#854D0E" /> {/* Dark Gold */}
        </radialGradient>
        <filter id="shadowOrn" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
        </filter>
      </defs>
      <g filter="url(#shadowOrn)">
        {/* Cap */}
        <rect x="42" y="10" width="16" height="10" rx="2" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2"/>
        <circle cx="50" cy="8" r="4" stroke="#4B5563" strokeWidth="2" fill="none"/>
        
        {/* Ball */}
        <circle cx="50" cy="55" r="35" fill="url(#ornamentGrad)" stroke="#A16207" strokeWidth="2"/>
        
        {/* Decor: Stripes */}
        <path d="M20 55 Q 50 75 80 55" stroke="#A855F7" strokeWidth="4" fill="none" opacity="0.8"/>
        <path d="M22 45 Q 50 65 78 45" stroke="#A855F7" strokeWidth="4" fill="none" opacity="0.8"/>
        
        {/* Shine */}
        <circle cx="35" cy="40" r="5" fill="white" opacity="0.6"/>
      </g>
    </svg>
);

export const GingerbreadMan = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
       <defs>
           <filter id="shadowCookie" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
           </filter>
       </defs>
       <g filter="url(#shadowCookie)">
          {/* Body */}
          <path d="M30 35 C20 35 15 45 15 50 C15 55 20 60 25 55 L35 50 V70 L25 85 C20 90 25 95 30 95 C35 95 40 90 45 80 V70 H55 V80 C60 90 65 95 70 95 C75 95 80 90 75 85 L65 70 V50 L75 55 C80 60 85 55 85 50 C85 45 80 35 70 35 L65 40 V30 C65 15 55 10 50 10 C45 10 35 15 35 30 V40 L30 35Z"
                fill="#D97706" stroke="#92400E" strokeWidth="2"/>
          
          {/* Icing decorations */}
          <path d="M40 70 H60 M20 50 L30 50 M70 50 L80 50" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="50" cy="45" r="2" fill="white"/>
          <circle cx="50" cy="55" r="2" fill="white"/>

          {/* Face */}
          <circle cx="45" cy="25" r="2" fill="#000"/>
          <circle cx="55" cy="25" r="2" fill="#000"/>
          <path d="M45 32 Q 50 35 55 32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
       </g>
    </svg>
);

export const ChristmasTree = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Tree Levels */}
    <path d="M50 15 L20 45 H80 L50 15Z" fill="#15803d" stroke="#14532d" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M50 35 L15 70 H85 L50 35Z" fill="#166534" stroke="#14532d" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M50 60 L10 90 H90 L50 60Z" fill="#14532d" stroke="#052e16" strokeWidth="2" strokeLinejoin="round"/>
    
    {/* Trunk */}
    <rect x="42" y="90" width="16" height="10" fill="#78350f" stroke="#451a03" strokeWidth="1"/>
    
    {/* Star */}
    <path d="M50 5 L53 15 H63 L55 21 L58 30 L50 25 L42 30 L45 21 L37 15 H47 L50 5Z" fill="#FACC15" stroke="#B45309" strokeWidth="1"/>
    
    {/* Ornaments */}
    <circle cx="30" cy="40" r="3" fill="#EF4444" stroke="#991B1B" strokeWidth="0.5"/>
    <circle cx="70" cy="40" r="3" fill="#3B82F6" stroke="#1E40AF" strokeWidth="0.5"/>
    <circle cx="40" cy="65" r="3" fill="#FCD34D" stroke="#D97706" strokeWidth="0.5"/>
    <circle cx="60" cy="65" r="3" fill="#EF4444" stroke="#991B1B" strokeWidth="0.5"/>
    <circle cx="25" cy="85" r="3" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.5"/>
    <circle cx="75" cy="85" r="3" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.5"/>
  </svg>
);

export const Snowman = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
     {/* Arms */}
     <path d="M25 45 L10 35" stroke="#78350f" strokeWidth="3" strokeLinecap="round"/>
     <path d="M75 45 L90 35" stroke="#78350f" strokeWidth="3" strokeLinecap="round"/>

     {/* Body */}
     <circle cx="50" cy="75" r="22" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
     <circle cx="50" cy="40" r="16" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
     
     {/* Buttons */}
     <circle cx="50" cy="68" r="2" fill="#1F2937" />
     <circle cx="50" cy="78" r="2" fill="#1F2937" />
     
     {/* Scarf */}
     <path d="M36 50 H64 C64 50 64 58 50 58 C36 58 36 50 36 50" fill="#DC2626" />
     <rect x="52" y="50" width="8" height="15" fill="#DC2626" />

     {/* Face */}
     <circle cx="45" cy="38" r="2" fill="#000" />
     <circle cx="55" cy="38" r="2" fill="#000" />
     <path d="M50 42 L60 45 L50 48" fill="#F97316" /> {/* Carrot Nose */}
     
     {/* Hat */}
     <rect x="35" y="22" width="30" height="4" fill="#1F2937" />
     <rect x="40" y="8" width="20" height="15" fill="#1F2937" />
     <rect x="40" y="18" width="20" height="3" fill="#DC2626" />
  </svg>
);

export const AngryEyes = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 30" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Eye */}
    <path d="M20 20 L 40 10" stroke="#000" strokeWidth="5" strokeLinecap="round" />
    {/* Right Eye */}
    <path d="M60 10 L 80 20" stroke="#000" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export const Snowball = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="snowGrad" cx="0.4" cy="0.4" r="0.6">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#A5F3FC" />
      </radialGradient>
      <filter id="shadowSnow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#0891B2" floodOpacity="0.4"/>
      </filter>
    </defs>
    <g filter="url(#shadowSnow)">
      <circle cx="50" cy="50" r="45" fill="url(#snowGrad)" />
      {/* Motion lines */}
      <path d="M20 30 Q 50 10 80 30" stroke="#E0F2FE" strokeWidth="3" fill="none" opacity="0.6"/>
      <circle cx="35" cy="40" r="5" fill="#FFF"/>
    </g>
  </svg>
);

export const CandyCane = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
       <filter id="shadowCane" x="-20%" y="-20%" width="140%" height="140%">
         <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
       </filter>
    </defs>
    <g filter="url(#shadowCane)">
        {/* Base White */}
        <path d="M70 20 C 70 5, 30 5, 30 20 V 90" stroke="white" strokeWidth="14" strokeLinecap="round" />
        
        {/* Red Stripes - Manually placed for 'wrapping' effect */}
        <mask id="caneMask">
             <path d="M70 20 C 70 5, 30 5, 30 20 V 90" stroke="white" strokeWidth="14" strokeLinecap="round" />
        </mask>
        
        <g mask="url(#caneMask)">
            <path d="M20 90 L 40 100" stroke="#DC2626" strokeWidth="14" />
            <path d="M20 70 L 40 80" stroke="#DC2626" strokeWidth="14" />
            <path d="M20 50 L 40 60" stroke="#DC2626" strokeWidth="14" />
            <path d="M20 30 L 40 40" stroke="#DC2626" strokeWidth="14" />
            {/* Curve stripes */}
            <path d="M25 15 L 45 25" stroke="#DC2626" strokeWidth="14" />
            <path d="M40 5 L 60 15" stroke="#DC2626" strokeWidth="14" />
            <path d="M60 0 L 80 10" stroke="#DC2626" strokeWidth="14" />
        </g>
    </g>
  </svg>
);

// Cute Yarn Ball Projectile
export const YarnBall = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" fill="#F472B6" />
    <path d="M20 50 Q 50 20 80 50" stroke="#EC4899" strokeWidth="4" fill="none"/>
    <path d="M25 60 Q 50 90 75 60" stroke="#EC4899" strokeWidth="4" fill="none"/>
    <path d="M40 20 Q 80 50 40 80" stroke="#EC4899" strokeWidth="4" fill="none"/>
    <path d="M60 20 Q 20 50 60 80" stroke="#EC4899" strokeWidth="4" fill="none"/>
    <path d="M50 10 L 50 20" stroke="#BE185D" strokeWidth="2" /> {/* Loose thread */}
  </svg>
);

export const Logo = ({ className, scale = 1 }: { className?: string, scale?: number }) => (
  <div className={`flex flex-col items-center select-none ${className}`} style={{ transform: `scale(${scale})` }}>
    <div className="flex items-end justify-center -mb-4 z-10 w-full px-2">
      {/* Tree Left */}
      <div className="relative z-0 -mr-6 mb-2">
         <ChristmasTree className="w-16 h-16 drop-shadow-md transform -rotate-6" />
      </div>
      
      {/* Cami Cat Center - Peeking */}
      <div className="relative z-10 mx-[-5px]">
         <CamiCat className="w-24 h-24 drop-shadow-lg" />
      </div>
      
      {/* Snowman Right */}
      <div className="relative z-0 -ml-6 mb-2">
         <Snowman className="w-16 h-16 drop-shadow-md transform rotate-6" />
      </div>
    </div>
    
    <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-xl flex relative z-20" style={{
      textShadow: '3px 3px 0px #166534, 5px 5px 0px #000',
      fontFamily: 'Fredoka, sans-serif'
    }}>
      <span className="text-red-500" style={{ textShadow: '2px 2px 0px #FFF, 4px 4px 0px #000' }}>CAMI</span>
      <span className="w-2"></span>
      <span className="text-green-600" style={{ textShadow: '2px 2px 0px #FFF, 4px 4px 0px #000' }}>KIDS HD</span>
    </h1>
    
    <div className="flex items-center gap-2 mt-2 bg-white/95 px-5 py-1.5 rounded-full border-2 border-red-200 shadow-md transform -rotate-1 relative z-20">
      <span className="text-xl font-bold text-gray-700 uppercase">Minigame</span>
    </div>
  </div>
);