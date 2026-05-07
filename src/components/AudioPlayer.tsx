import { useEffect, useRef, useState } from 'react';
import { useQuran } from '../context/QuranContext';
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

export function AudioPlayer() {
  const { playingAyah, setPlayingAyah, currentSurahDetails } = useQuran();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (playingAyah && playingAyah.audio && audioRef.current) {
      audioRef.current.src = playingAyah.audio;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [playingAyah]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(p || 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    // Play next ayah if available
    if (currentSurahDetails && playingAyah) {
      const currentIndex = currentSurahDetails.ayahs.findIndex(a => a.number === playingAyah.number);
      if (currentIndex !== -1 && currentIndex < currentSurahDetails.ayahs.length - 1) {
        setPlayingAyah(currentSurahDetails.ayahs[currentIndex + 1]);
      } else {
        setPlayingAyah(null); // End of surah
      }
    } else {
      setPlayingAyah(null);
    }
  };

  const seek = (values: number[]) => {
    if (!audioRef.current) return;
    const time = (values[0] / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(values[0]);
  };
  
  const skip = (direction: 1 | -1) => {
    if (!currentSurahDetails || !playingAyah) return;
    const currentIndex = currentSurahDetails.ayahs.findIndex(a => a.number === playingAyah.number);
    if (currentIndex === -1) return;
    
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < currentSurahDetails.ayahs.length) {
       setPlayingAyah(currentSurahDetails.ayahs[nextIndex]);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
      <AnimatePresence>
        {playingAyah && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none"
          >
            <div className="max-w-md mx-auto pointer-events-auto bg-card border border-border shadow-2xl rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex-1 truncate pr-4">
                  <h4 className="font-semibold text-sm truncate">Surah {currentSurahDetails?.englishName}</h4>
                  <p className="text-xs text-muted-foreground truncate">Ayah {playingAyah.numberInSurah}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                   if(audioRef.current) audioRef.current.pause();
                   setPlayingAyah(null);
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Slider 
                value={[progress]} 
                max={100} 
                step={1} 
                onValueChange={seek} 
                className="my-1 cursor-pointer"
              />
              
              <div className="flex justify-center items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => skip(-1)} disabled={!currentSurahDetails}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" className="h-12 w-12 rounded-full shadow-md text-primary-foreground bg-primary hover:bg-primary/90" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => skip(1)} disabled={!currentSurahDetails}>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
