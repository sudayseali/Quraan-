import { useEffect, useState } from 'react';
import { getSurahs, getSurahDetails, SurahOverview } from '../services/api';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DownloadCloud, CheckCircle2, Loader2 } from 'lucide-react';

export function Home() {
  const [surahs, setSurahs] = useState<SurahOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

  useEffect(() => {
    getSurahs()
      .then(data => {
        setSurahs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
      
    // Check if fully downloaded
    const checkDownloaded = async () => {
      const cached = localStorage.getItem('quran_fully_downloaded');
      if (cached === 'true') {
        setDownloadComplete(true);
      }
    };
    checkDownloaded();
  }, []);

  const downloadAllText = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      let count = 0;
      for (const surah of surahs) {
        await getSurahDetails(surah.number);
        count++;
        setDownloadProgress(Math.round((count / surahs.length) * 100));
      }
      setDownloadComplete(true);
      localStorage.setItem('quran_fully_downloaded', 'true');
    } catch (e) {
      console.error("Failed to download all", e);
    } finally {
      setIsDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-full">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-primary/5 rounded-3xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
         <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Read Quran</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Explore all 114 Surahs offline-ready.</p>
         </div>
         {surahs.length > 0 && !downloadComplete ? (
           <Button 
             variant="outline" 
             className="rounded-full gap-2 w-full sm:w-auto mt-4 sm:mt-0" 
             onClick={downloadAllText}
             disabled={isDownloading}
           >
             {isDownloading ? (
               <>
                 <Loader2 className="h-4 w-4 animate-spin" />
                 {downloadProgress}% <span className="hidden sm:inline">Downloading</span>
               </>
             ) : (
               <>
                 <DownloadCloud className="h-4 w-4" />
                 Download All Text
               </>
             )}
           </Button>
         ) : downloadComplete ? (
            <div className="flex items-center gap-2 text-primary font-medium text-sm bg-primary/10 px-4 py-2 rounded-full cursor-default">
              <CheckCircle2 className="h-4 w-4" />
              Available Offline
            </div>
         ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="p-4 rounded-2xl flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-12" />
              </Card>
            ))
          : surahs.map(surah => (
              <Link key={surah.number} to={`/surah/${surah.number}`}>
                <Card className="p-4 rounded-2xl hover:shadow-md transition-all sm:hover:-translate-y-0.5 border-border/50 flex items-center gap-4 cursor-pointer h-full group">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {surah.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{surah.englishName}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{surah.revelationType} • {surah.numberOfAyahs} Ayahs</p>
                  </div>
                  <div className="text-right">
                     <p className="font-arabic text-xl font-bold">{surah.name}</p>
                  </div>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  );
}
