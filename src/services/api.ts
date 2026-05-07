import localforage from 'localforage';

export interface SurahOverview {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  audio?: string;
  translation?: string;
}

export interface SurahDetails extends SurahOverview {
  ayahs: Ayah[];
}

const PRIMARY_API = 'https://api.alquran.cloud/v1';

// Setup localforage instances
const metaCache = localforage.createInstance({ name: 'quran-meta' });
const surahCache = localforage.createInstance({ name: 'quran-surahs' });

const MAX_RETRIES = 2;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (e) {
      if (i === retries - 1) throw e;
    }
  }
  throw new Error('Failed to fetch after retries');
}

export async function getSurahs(): Promise<SurahOverview[]> {
  try {
    // Check cache first for faster offline support
    const cached = await metaCache.getItem<SurahOverview[]>('surahs_list');
    if (cached) {
      // Refresh cache in background if online
      if (navigator.onLine) {
        fetchWithRetry(`${PRIMARY_API}/surah`).then(res => res.json()).then(data => {
          if (data && data.code === 200) {
            metaCache.setItem('surahs_list', data.data);
          }
        }).catch(console.error);
      }
      return cached;
    }

    if (!navigator.onLine) {
       throw new Error("You are offline and data is not cached.");
    }

    // Fetch from primary
    const res = await fetchWithRetry(`${PRIMARY_API}/surah`);
    const data = await res.json();
    if (data && data.code === 200) {
      await metaCache.setItem('surahs_list', data.data);
      return data.data;
    }
    throw new Error('Invalid response from primary API');
  } catch (error) {
    console.error('Error fetching surahs:', error);
    // Secondary API Fallback
    try {
       const res = await fetchWithRetry(`https://api.quran.com/api/v4/chapters`);
       const data = await res.json();
       if (data && data.chapters) {
          const mapped: SurahOverview[] = data.chapters.map((c: any) => ({
             number: c.id,
             name: c.name_arabic,
             englishName: c.name_simple,
             englishNameTranslation: c.translated_name.name,
             numberOfAyahs: c.verses_count,
             revelationType: c.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'
          }));
          await metaCache.setItem('surahs_list', mapped);
          return mapped;
       }
       throw new Error('Invalid secondary API structure');
    } catch (fallbackError) {
       console.error("Secondary API also failed", fallbackError);
       throw new Error("Unable to fetch Quran data. Please check your internet connection.");
    }
  }
}

export async function getSurahDetails(id: number): Promise<SurahDetails> {
  const cacheKey = `surah_${id}`;
  
  try {
    const cached = await surahCache.getItem<SurahDetails>(cacheKey);
    if (cached) {
       if (navigator.onLine) {
           // We could optionally do background refresh here too, but for offline reliability
           // and performance we might just rely on cache once we have it, to save bandwidth.
       }
       return cached;
    }

    if (!navigator.onLine) {
       throw new Error("You are offline and this Surah is not cached.");
    }

    // Try fetching Arabic details (ar.alafasy includes audio)
    const [arRes, enRes] = await Promise.all([
      fetchWithRetry(`${PRIMARY_API}/surah/${id}/ar.alafasy`),
      fetchWithRetry(`${PRIMARY_API}/surah/${id}/en.asad`)
    ]);

    const arData = await arRes.json();
    const enData = await enRes.json();

    if (arData.code === 200 && enData.code === 200) {
      const result: SurahDetails = {
        ...arData.data,
        ayahs: arData.data.ayahs.map((ayah: any, index: number) => ({
          ...ayah,
          translation: enData.data.ayahs[index].text
        }))
      };
      await surahCache.setItem(cacheKey, result);
      return result;
    }
    throw new Error('Invalid response from primary API for Surah details');

  } catch (error) {
    console.error(`Error fetching surah ${id}:`, error);
    throw new Error(`Unable to fetch Surah ${id}. Please check your internet connection.`);
  }
}
