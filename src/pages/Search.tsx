import { useState, useEffect, useMemo } from 'react';
import { getSurahs, SurahOverview } from '../services/api';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Search() {
  const [surahs, setSurahs] = useState<SurahOverview[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getSurahs().then(setSurahs).catch(console.error);
  }, []);

  const filteredSurahs = useMemo(() => {
    if (!query) return [];
    return surahs.filter(s => 
      s.englishName.toLowerCase().includes(query.toLowerCase()) || 
      s.englishNameTranslation.toLowerCase().includes(query.toLowerCase()) ||
      s.number.toString() === query ||
      s.name.includes(query)
    );
  }, [query, surahs]);

  return (
    <div className="space-y-6">
       <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
             autoFocus
             value={query} 
             onChange={e => setQuery(e.target.value)} 
             placeholder="Search Surah by name or number..." 
             className="pl-12 h-14 rounded-full bg-card border-border shadow-sm text-lg"
          />
       </div>

       <div className="grid gap-3">
          {query && filteredSurahs.length === 0 && (
             <div className="text-center py-10 text-muted-foreground">
                No surahs found matching "{query}"
             </div>
          )}
          {filteredSurahs.map(surah => (
             <Link key={surah.number} to={`/surah/${surah.number}`}>
               <Card className="p-4 rounded-2xl flex items-center justify-between hover:bg-primary/5 transition-colors border-border/50">
                 <div>
                   <h3 className="font-semibold">{surah.englishName}</h3>
                   <p className="text-xs text-muted-foreground">{surah.englishNameTranslation} • {surah.numberOfAyahs} Ayahs</p>
                 </div>
                 <div className="text-right">
                    <p className="font-arabic text-lg">{surah.name}</p>
                 </div>
               </Card>
             </Link>
          ))}
       </div>
    </div>
  );
}
