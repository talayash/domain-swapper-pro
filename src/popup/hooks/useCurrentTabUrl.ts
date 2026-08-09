import { useState, useEffect } from 'react';
import { getCurrentTabUrl } from '~/lib/urlUtils';

export function useCurrentTabUrl(): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    getCurrentTabUrl().then(setUrl);
  }, []);

  return url;
}
