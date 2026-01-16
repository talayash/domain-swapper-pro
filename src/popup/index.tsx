import { useEffect } from 'react';
import { useStore } from '~/store';
import { DomainList } from './components/DomainList';
import '~/styles/globals.css';

function Popup() {
  const isLoaded = useStore((state) => state.isLoaded);
  const loadState = useStore((state) => state.loadState);
  const theme = useStore((state) => state.settings.theme);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  if (!isLoaded) {
    return (
      <div className="popup-container flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <DomainList />
    </div>
  );
}

export default Popup;
