import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSurahDetails, SurahDetails } from '../services/api';
import { useQuran } from '../context/QuranContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Bookmark, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function SurahView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playingAyah, setPlayingAyah, toggleBookmark, isBookmarked, setCurrentSurahDetails } = useQuran();
  
  const [surah, setSurah] = useState<SurahDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSurahDetails(Number(id))
      .then(data => {
        setSurah(data);
        setCurrentSurahDetails(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, setCurrentSurahDetails]);

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate(-1)} className="mt-4 rounded-full">Go Back</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
           <Skeleton className="h-10 w-10 rounded-full" />
           <Skeleton className="h-8 w-48" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-6 rounded-3xl">
             <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
             </div>
             <div className="space-y-3 flex flex-col items-end">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6" />
             </div>
             <Skeleton className="h-4 w-2/3 mt-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (!surah) return null;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-4 mb-6">
         <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
         </Button>
         <div>
            <h1 className="text-2xl font-bold tracking-tight">{surah.englishName}</h1>
            <p className="text-sm text-muted-foreground">{surah.englishNameTranslation}</p>
         </div>
      </div>

      {surah.number !== 1 && surah.number !== 9 && (
         <div className="py-8 text-center bg-card rounded-3xl border border-border/50 mb-8 shadow-sm">
            <h2 className="font-arabic text-3xl sm:text-4xl leading-loose">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</h2>
         </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {surah.ayahs.map((ayah) => {
          const isPlaying = playingAyah?.number === ayah.number;
          const bookmarked = isBookmarked(surah.number, ayah.numberInSurah);
          
          return (
            <Card 
              key={ayah.number} 
              className={`p-5 sm:p-6 rounded-3xl transition-colors duration-300 ${isPlaying ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : 'bg-card border-border/50'}`}
              id={`ayah-${ayah.numberInSurah}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                  <span className="font-semibold text-sm text-primary">{surah.number}:{ayah.numberInSurah}</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" onClick={() => toggleBookmark(surah.number, ayah.numberInSurah)}>
                     <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${bookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                   </Button>
                   {ayah.audio && (
                     <Button 
                        variant={isPlaying ? 'default' : 'ghost'} 
                        size="icon" 
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" 
                        onClick={() => setPlayingAyah(isPlaying ? null : ayah)}
                     >
                       {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />}
                     </Button>
                   )}
                </div>
              </div>
              
              <div className="flex flex-col gap-6">
                 <p className="font-arabic text-right leading-loose text-2xl sm:text-3xl md:text-4xl" dir="rtl">
                    {ayah.text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '')} <span className="inline-flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 text-primary text-sm sm:text-base mr-2">{ayah.numberInSurah}</span>
                 </p>
                 {ayah.translation && (
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mt-2 border-t border-border/30 pt-4">
                       {ayah.translation}
                    </p>
                 )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
