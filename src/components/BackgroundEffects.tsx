import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Check, RefreshCw, Layers, Sliders, Play, Eye } from 'lucide-react';

export type BgEffectType = 'social_rain' | 'money_rain' | 'cyber_matrix' | 'confetti' | 'none';

export interface EffectOption {
  id: BgEffectType;
  name: string;
  nameHindi: string;
  description: string;
  icon: string;
  badge: string;
  color: string;
}

export const EFFECT_OPTIONS: EffectOption[] = [
  {
    id: 'social_rain',
    name: 'Social Media Rain',
    nameHindi: 'सोशल मीडिया लोगो बारिश',
    description: 'Instagram, YouTube, Telegram, Facebook & TikTok logos falling smoothly from top',
    icon: '📱',
    badge: 'Popular',
    color: 'from-pink-500 to-purple-600'
  },
  {
    id: 'money_rain',
    name: 'Money & Wealth Rain',
    nameHindi: 'पैसों और कॉइन्स की बारिश',
    description: 'Gold Rupees (₹), Dollar ($) notes, crowns and gems floating down',
    icon: '💰',
    badge: 'Wealth',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'cyber_matrix',
    name: 'Cyber Neon Matrix',
    nameHindi: 'साइबर नियॉन स्टार्स',
    description: 'Glowing neon code streams, cyber stars and electric matrix particles',
    icon: '⚡',
    badge: 'Tech',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'confetti',
    name: 'Celebration Confetti',
    nameHindi: 'कन्फ़ेट्टी और स्टार्स',
    description: 'Colorful festive celebration confetti rain with tumbling sparkles',
    icon: '🎉',
    badge: 'Festive',
    color: 'from-purple-500 to-rose-600'
  },
  {
    id: 'none',
    name: 'None (Clean Mode)',
    nameHindi: 'कोई इफ़ेक्ट नहीं',
    description: 'Disable all background animations for a minimal static view',
    icon: '🚫',
    badge: 'Static',
    color: 'from-gray-500 to-slate-600'
  }
];

// SVGs for Social Rain
const SOCIAL_SVGS = [
  // Instagram
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23f09433"/><stop offset="25%" stop-color="%23e6683c"/><stop offset="50%" stop-color="%23dc2743"/><stop offset="75%" stop-color="%23cc2366"/><stop offset="100%" stop-color="%23bc1888"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(%23ig)"/><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5.25-8.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" fill="%23fff"/></svg>`,
  // YouTube
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="%23FF0000"/><path d="M10 8l6 4-6 4V8z" fill="%23fff"/></svg>`,
  // Telegram
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="%230088cc"/><path d="M5.5 11.5l12.5-5-3.5 12-4.5-3.5-2.5 2.5v-3.5l8-7-10 6.5z" fill="%23fff"/></svg>`,
  // Facebook
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="%231877F2"/><path d="M14 8.5h2V6h-2.5C11.5 6 10 7.5 10 9.5V11H8v2.5h2V20h3v-6.5h2.5l.5-2.5H13V9.5c0-.6.4-1 1-1z" fill="%23fff"/></svg>`,
  // Twitter X
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="%23000000"/><path d="M16.5 6h2l-4.5 5.2L19.3 18h-4l-3.1-4.1L8.5 18h-2l4.8-5.5L6.3 6h4.1l2.8 3.7L16.5 6z" fill="%23fff"/></svg>`,
  // TikTok
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="%23111111"/><path d="M15 6a5 5 0 003 3v2.5a7.5 7.5 0 01-3-1V15a4.5 4.5 0 11-4.5-4.5c.3 0 .6 0 .9.1V13a2 2 0 101.6 2V6h2z" fill="%2300f2fe"/></svg>`,
  // WhatsApp
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="12" fill="%2325D366"/><path d="M12 5a7 7 0 00-6 10.5L5 19l3.6-1A7 7 0 1012 5zm3.5 10c-.2.5-1 1-1.5 1-.4 0-.9 0-2.8-.8-2.3-1-3.8-3.3-3.9-3.5-.1-.2-.9-1.2-.9-2.3 0-1.1.6-1.6.8-1.8.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.5.7 1.7.7 1.8 0 .1 0 .3-.1.4l-.3.4c-.1.1-.2.2 0 .5.3.5.9 1.4 1.8 2.2 1.1.9 2 1.2 2.3 1.3.3.1.5 0 .6-.1l.5-.6c.2-.2.4-.2.6-.1l1.5.7c.3.2.4.3.4.5s0 .9-.2 1.4z" fill="%23fff"/></svg>`
];

// SVGs for Money Rain
const MONEY_SVGS = [
  // Gold Rupee Coin
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="%23FFD700" stroke="%23B8860B" stroke-width="2"/><text x="12" y="16" font-size="12" font-weight="900" text-anchor="middle" fill="%237A4100">₹</text></svg>`,
  // Dollar Bill
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><rect width="24" height="16" x="0" y="4" rx="3" fill="%232e7d32" stroke="%231b5e20" stroke-width="1"/><circle cx="12" cy="12" r="4" fill="%2381c784"/><text x="12" y="15" font-size="10" font-weight="bold" text-anchor="middle" fill="%231b5e20">$</text></svg>`,
  // Crown
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M3 18h18v2H3v-2zm1.5-3l2.5-8 4 4 4-7 4 7 4-4 2.5 8h-17z" fill="%23FFD700" stroke="%23DAA520" stroke-width="1.5"/></svg>`,
  // Diamond
  `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="%2300e5ff" stroke="%230099ff" stroke-width="1.5"/></svg>`
];

export const BackgroundEffects: React.FC = () => {
  const [activeEffect, setActiveEffect] = useState<BgEffectType>(() => {
    return (localStorage.getItem('ag_bg_effect') as BgEffectType) || 'social_rain';
  });

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preloaded images
  const socialImagesRef = useRef<HTMLImageElement[]>([]);
  const moneyImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    // Preload social images
    socialImagesRef.current = SOCIAL_SVGS.map((svg) => {
      const img = new Image();
      img.src = svg;
      return img;
    });

    // Preload money images
    moneyImagesRef.current = MONEY_SVGS.map((svg) => {
      const img = new Image();
      img.src = svg;
      return img;
    });
  }, []);

  const changeEffect = (effect: BgEffectType) => {
    setActiveEffect(effect);
    localStorage.setItem('ag_bg_effect', effect);
  };

  useEffect(() => {
    if (activeEffect === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle definition
    interface Particle {
      x: number;
      y: number;
      speedY: number;
      speedX: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      imgIndex: number;
      sway: number;
      swaySpeed: number;
      color?: string;
      char?: string;
    }

    const particleCount = activeEffect === 'cyber_matrix' ? 45 : 28;
    const particles: Particle[] = [];

    const matrixChars = ['0', '1', 'AG', 'SMM', '⚡', '★', '⚡', '₹'];
    const matrixColors = ['#00f2fe', '#4facfe', '#00f0ff', '#7000ff', '#ff007f'];
    const confettiColors = ['#FF2D55', '#5856D6', '#007AFF', '#4CD964', '#FF9500', '#FFCC00', '#FF3B30'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        speedY: 0.8 + Math.random() * 1.8,
        speedX: (Math.random() - 0.5) * 0.5,
        size: activeEffect === 'social_rain' ? 24 + Math.random() * 16 : 16 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        opacity: 0.55 + Math.random() * 0.4,
        imgIndex: Math.floor(Math.random() * 7),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.02,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)]
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.sway += p.swaySpeed;
        p.x += Math.sin(p.sway) * 0.6 + p.speedX;
        p.rotation += p.rotationSpeed;

        // Reset particle if off bottom
        if (p.y > height + 40) {
          p.y = -40;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (activeEffect === 'social_rain') {
          const imgs = socialImagesRef.current;
          const img = imgs[p.imgIndex % imgs.length];
          if (img && img.complete) {
            ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
          }
        } else if (activeEffect === 'money_rain') {
          const imgs = moneyImagesRef.current;
          const img = imgs[p.imgIndex % imgs.length];
          if (img && img.complete) {
            ctx.drawImage(img, -p.size / 2, -p.size / 2, p.size, p.size);
          }
        } else if (activeEffect === 'cyber_matrix') {
          ctx.font = `bold ${Math.round(p.size)}px monospace`;
          ctx.fillStyle = p.color || matrixColors[p.imgIndex % matrixColors.length];
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8;
          ctx.textAlign = 'center';
          ctx.fillText(p.char || '1', 0, 0);
        } else if (activeEffect === 'confetti') {
          ctx.fillStyle = p.color || '#FF0055';
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeEffect]);

  return (
    <>
      {/* Canvas Effect Layer */}
      {activeEffect !== 'none' && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-30 opacity-80"
          style={{ width: '100vw', height: '100vh' }}
        />
      )}

      {/* Floating Effect Switcher Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-slate-900/90 hover:bg-slate-900 text-white p-3 rounded-full shadow-2xl border border-slate-700 backdrop-blur-md flex items-center space-x-2 group hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Change Background Animation Effect"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-amber-400 flex items-center justify-center text-white animate-spin-slow">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-xs font-black tracking-wide pr-1 hidden sm:inline text-amber-200">
          Effects
        </span>
        <span className="bg-pink-500 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md group-hover:bg-pink-600 transition-colors">
          4 Options
        </span>
      </button>

      {/* Effect Chooser Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center space-x-2">
                    <span>Background Animation Effects</span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Select your preferred falling animation effect anytime
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Effect Grid */}
            <div className="space-y-3">
              {EFFECT_OPTIONS.map((opt) => {
                const isSelected = activeEffect === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => changeEffect(opt.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between space-x-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-200'
                        : 'border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${opt.color} text-white flex items-center justify-center text-xl shadow-md shrink-0`}
                      >
                        {opt.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-gray-900 text-sm truncate">
                            {opt.name}
                          </h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200 shadow-2xs shrink-0">
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {opt.nameHindi} • {opt.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200/80 text-gray-400 flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                          <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-400">
                Your choice is saved automatically
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Apply Effect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
