import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ayah, SurahDetails } from '../services/api';

interface QuranContextType {
  playingAyah: Ayah | null;
  setPlayingAyah: (ayah: Ayah | null) => void;
  bookmarks: { surahId: number; ayahNumberInSurah: number }[];
  toggleBookmark: (surahId: number, ayahNumberInSurah: number) => void;
  isBookmarked: (surahId: number, ayahNumberInSurah: number) => boolean;
  currentSurahDetails: SurahDetails | null;
  setCurrentSurahDetails: (details: SurahDetails | null) => void;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export function QuranProvider({ children }: { children: ReactNode }) {
  const [playingAyah, setPlayingAyah] = useState<Ayah | null>(null);
  const [currentSurahDetails, setCurrentSurahDetails] = useState<SurahDetails | null>(null);
  const [bookmarks, setBookmarks] = useState<{ surahId: number; ayahNumberInSurah: number }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quran_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load bookmarks');
      }
    }
  }, []);

  const saveBookmarks = (newBookmarks: { surahId: number; ayahNumberInSurah: number }[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('quran_bookmarks', JSON.stringify(newBookmarks));
  };

  const toggleBookmark = (surahId: number, ayahNumberInSurah: number) => {
    const exists = bookmarks.find(b => b.surahId === surahId && b.ayahNumberInSurah === ayahNumberInSurah);
    if (exists) {
      saveBookmarks(bookmarks.filter(b => b !== exists));
    } else {
      saveBookmarks([...bookmarks, { surahId, ayahNumberInSurah }]);
    }
  };

  const isBookmarked = (surahId: number, ayahNumberInSurah: number) => {
    return !!bookmarks.find(b => b.surahId === surahId && b.ayahNumberInSurah === ayahNumberInSurah);
  };

  return (
    <QuranContext.Provider
      value={{
        playingAyah,
        setPlayingAyah,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        currentSurahDetails,
        setCurrentSurahDetails
      }}
    >
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran() {
  const context = useContext(QuranContext);
  if (context === undefined) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
}
