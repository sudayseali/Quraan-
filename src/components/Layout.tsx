import { ReactNode, useState, useEffect } from 'react';
import { Moon, Sun, BookOpen, Bookmark, Search } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { AudioPlayer } from './AudioPlayer';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Layout({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <BookOpen className="h-6 w-6" />
            <span className="font-semibold text-lg tracking-tight">Quran</span>
          </Link>
          <div className="flex items-center flex-1 justify-end space-x-1 sm:space-x-2">
            <Link to="/search" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}>
               <Search className="h-5 w-5" />
               <span className="sr-only">Search</span>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleTheme}>
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>

      <AudioPlayer />
      
      {/* Mobile Bottom Nav */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex justify-around items-center px-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
         <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-medium">Read</span>
         </Link>
         <Link to="/bookmarks" className={`flex flex-col items-center gap-1 ${location.pathname === '/bookmarks' ? 'text-primary' : 'text-muted-foreground'}`}>
            <Bookmark className="h-5 w-5" />
            <span className="text-[10px] font-medium">Saved</span>
         </Link>
      </div>

    </div>
  );
}
