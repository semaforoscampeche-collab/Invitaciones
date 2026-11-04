import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import { audioService } from '../../services/audioSynth';

interface MusicPlayerProps {
  trackTitle?: string;
  musicUrl?: string;
  accentColor?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  trackTitle = 'Melodía Ambiental',
  musicUrl,
  accentColor = '#c5a059',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsPlaying(audioService.getIsPlaying());
    setIsMuted(audioService.getIsMuted());

    const interval = setInterval(() => {
      setIsPlaying(audioService.getIsPlaying());
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioService.stop();
      setIsPlaying(false);
    } else {
      audioService.playAmbientLoop(musicUrl);
      setIsPlaying(true);
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-full bg-stone-900/90 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 ${
          isExpanded ? 'pr-4' : ''
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <button
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-inner"
          style={{ backgroundColor: accentColor }}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-stone-950 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 text-stone-950 fill-current ml-0.5" />
          )}
        </button>

        {/* Music note visualizer */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <Music className={`w-3.5 h-3.5 text-amber-300 ${isPlaying ? 'animate-bounce' : 'opacity-60'}`} />
          {isExpanded && (
            <span className="text-xs font-sans text-stone-200 max-w-[140px] truncate select-none">
              {trackTitle}
            </span>
          )}
        </div>

        {isPlaying && (
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="p-1 hover:text-amber-300 text-stone-400 transition-colors ml-1 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
