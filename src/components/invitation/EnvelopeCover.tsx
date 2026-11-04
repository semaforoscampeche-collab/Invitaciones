import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { audioService } from '../../services/audioSynth';
import { EventItem, GuestItem } from '../../types';
import { Sparkles } from 'lucide-react';

interface EnvelopeCoverProps {
  event: EventItem;
  guest?: GuestItem;
  onOpen: () => void;
}

export const EnvelopeCover: React.FC<EnvelopeCoverProps> = ({
  event,
  guest,
  onOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);

    // Audio chime
    audioService.playCelebrationChime();

    // Start background music if enabled
    if (event.design.musicEnabled) {
      setTimeout(() => {
        audioService.playAmbientLoop(event.design.musicUrl);
      }, 1000);
    }

    // Elegant gold confetti burst
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: [event.design.accentColor || '#c5a059', '#ffd700', '#ffffff', '#e2e8f0'],
      });
    } catch {
      // Ignore
    }

    // Give time for envelope unfold animation before revealing full page
    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  const envelopeBg = event.design.envelopeColor || '#1e293b';
  const waxColor = event.design.waxSealColor || '#c5a059';
  const sealSymbol = event.design.waxSealSymbol || '✨';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white">
      {/* Ambient background particles / glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-200/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Welcome Greeting Kicker */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-200 uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Invitación Privada Exclusiva</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif text-white tracking-wide">
            ¡Estás Cordialmente Invitado!
          </h2>

          {guest && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-100"
            >
              <p className="text-xs uppercase tracking-wider text-amber-400/90 font-medium">
                Especialmente preparado para
              </p>
              <p className="text-lg font-serif font-semibold mt-0.5 text-white">
                {guest.name}
              </p>
              <p className="text-xs text-stone-300 mt-1">
                {guest.authorizedPasses}{' '}
                {guest.authorizedPasses === 1 ? 'Pase Personal' : 'Pases Familiares Autorizados'}
                {guest.isVip && ' · Invitado Especial VIP'}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* 3D Envelope Presentation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative w-full aspect-[4/3] max-w-md mx-auto perspective-1000"
        >
          {/* Main Envelope Body */}
          <div
            className="w-full h-full rounded-2xl relative shadow-2xl overflow-hidden border border-white/20 flex flex-col justify-end p-6"
            style={{ backgroundColor: envelopeBg }}
          >
            {/* Subtle paper grain texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Diagonal envelope fold lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-0 w-full h-full border-b-[180px] sm:border-b-[210px] border-b-black/20 border-l-[190px] sm:border-l-[220px] border-l-transparent border-r-[190px] sm:border-r-[220px] border-r-transparent" />
            </div>

            {/* Inner Invitation Card Peak (sliding up on open) */}
            <motion.div
              animate={
                isOpening
                  ? { y: -160, scale: 1.05, opacity: 1 }
                  : { y: 0, scale: 0.95, opacity: 0.85 }
              }
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-6 left-6 right-6 bottom-10 bg-stone-50 text-stone-900 rounded-xl p-5 shadow-lg border border-stone-200 flex flex-col items-center justify-center text-center z-10"
            >
              <div className="w-10 h-0.5 bg-amber-600/40 mb-3" />
              <p className="text-[11px] uppercase tracking-widest text-amber-800 font-semibold mb-1">
                {event.eventType.replace('_', ' ').toUpperCase()}
              </p>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
                {event.hostNames}
              </h3>
              <p className="text-xs text-stone-600 font-medium mt-2">
                {new Date(event.eventDate + 'T12:00:00').toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">
                {event.location.venueName} · {event.location.city}
              </p>
            </motion.div>

            {/* Triangular Flap (Rotates on Open) */}
            <motion.div
              animate={isOpening ? { rotateX: 180, zIndex: 0 } : { rotateX: 0, zIndex: 20 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              style={{
                transformOrigin: 'top center',
                borderTopColor: envelopeBg,
              }}
              className="absolute top-0 left-0 right-0 w-full h-0 border-l-[190px] sm:border-l-[220px] border-l-transparent border-r-[190px] sm:border-r-[220px] border-r-transparent border-t-[140px] sm:border-t-[160px] filter drop-shadow-md z-20 pointer-events-none"
            />

            {/* Wax Seal / Center Emblem */}
            <AnimatePresence>
              {!isOpening && (
                <motion.button
                  key="seal"
                  onClick={handleOpenClick}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  exit={{ scale: 0, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.3 }}
                  aria-label="Abrir invitación con sello de cera"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-transform wax-seal-shadow border-2 border-amber-300/60"
                  style={{ backgroundColor: waxColor }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-black/20 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-base sm:text-xl font-serif font-black text-amber-950 tracking-wider">
                      {sealSymbol}
                    </span>
                    <span className="text-[8px] uppercase tracking-tighter text-amber-950/70 font-bold">
                      TOCAR
                    </span>
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Primary CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <button
            onClick={handleOpenClick}
            disabled={isOpening}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full font-serif font-semibold text-stone-900 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 hover:from-amber-100 hover:to-amber-300 shadow-xl shadow-amber-500/20 active:scale-95 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-800 group-hover:rotate-12 transition-transform" />
            <span className="tracking-wide text-sm sm:text-base">
              {isOpening ? 'REVELANDO INVITACIÓN...' : 'ABRIR INVITACIÓN'}
            </span>
          </button>
          <p className="text-[11px] text-stone-400 font-sans tracking-wide">
            Haz clic en el sello o en el botón para descubrir la experiencia
          </p>
        </motion.div>
      </div>
    </div>
  );
};
