import { useQuran } from '../context/QuranContext';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Bookmark, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSurahs, SurahOverview } from '../services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function Bookmarks() {
  const { bookmarks, toggleBookmark } = useQuran();
  const [surahs, setSurahs] = useState<SurahOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSurahs()
      .then(data => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4">
      {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
    </div>;
  }

  if (bookmarks.length === 0) {
    return (
       <div className="text-center py-20 px-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
             <Bookmark className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No Bookmarks Yet</h2>
          <p className="text-muted-foreground mb-6">Save ayahs to read them later or keep your place.</p>
          <Link to="/" className={cn(buttonVariants({ variant: "default" }), "rounded-full px-8")}>
             Start Reading
          </Link>
       </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Saved Ayahs</h1>
      <div className="grid gap-3">
         {bookmarks.map((b) => {
            const surah = surahs.find(s => s.number === b.surahId);
            if (!surah) return null;
            return (
               <Card key={`${b.surahId}-${b.ayahNumberInSurah}`} className="p-4 sm:p-5 rounded-2xl flex items-center justify-between group">
                  <div className="flex flex-col">
                     <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Surah {surah.englishName}</span>
                     <span className="font-semibold text-lg">Ayah {b.ayahNumberInSurah}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => toggleBookmark(b.surahId, b.ayahNumberInSurah)}>
                        <Bookmark className="h-5 w-5 fill-primary text-primary" />
                     </Button>
                     <Link to={`/surah/${b.surahId}#ayah-${b.ayahNumberInSurah}`} className={cn(buttonVariants({ variant: "outline", size: "icon" }), "h-10 w-10 rounded-full")}>
                        <ChevronRight className="h-5 w-5" />
                     </Link>
                  </div>
               </Card>
            )
         })}
      </div>
    </div>
  );
}
