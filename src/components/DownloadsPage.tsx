import React, { useEffect, useState } from "react";

interface DownloadItem {
  id: string;
  downloaded: number;
  total: number;
  percent: number;
  speed: number;
  path: string;
  status?: string;
}

export const DownloadsPage: React.FC = () => {
  const [items, setItems] = useState<DownloadItem[]>([]);

  useEffect(() => {
    const onProgress = (e: any) => {
      const p = e.detail;
      setItems((prev) => {
        const idx = prev.findIndex(x => x.id === p.id);
        const item = {
          id: p.id,
          downloaded: p.downloaded,
          total: p.total,
          percent: p.percent,
          speed: p.speed,
          path: p.path,
          status: 'downloading'
        };
        if (idx === -1) return [...prev, item];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...item };
        return copy;
      });
    };
    const onComplete = (e: any) => {
      const p = e.detail;
      setItems((prev) => prev.map(x => x.id === p.id ? { ...x, status: 'complete', path: p.path } : x));
    };
    const onCancelled = (e: any) => {
      const p = e.detail;
      setItems((prev) => prev.map(x => x.id === p.id ? { ...x, status: 'cancelled' } : x));
    };
    window.addEventListener('nile-download-progress', onProgress);
    window.addEventListener('nile-download-complete', onComplete);
    window.addEventListener('nile-download-cancelled', onCancelled);
    return () => {
      window.removeEventListener('nile-download-progress', onProgress);
      window.removeEventListener('nile-download-complete', onComplete);
      window.removeEventListener('nile-download-cancelled', onCancelled);
    };
  }, []);

  const cancel = async (id: string) => {
    try {
      // @ts-ignore - Tauri API may not be available in all environments
      const { invoke } = await import('@tauri-apps/api/tauri');
      await invoke('cancel_download', { id });
    } catch (e) {
      console.warn('Tauri cancel_download not available:', e);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Downloads</h3>
      {items.length === 0 && <div className="text-sm text-muted-foreground">No downloads</div>}
      <div className="flex flex-col gap-2">
        {items.map(item => (
          <div key={item.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="text-sm font-medium">{item.path.split('/').pop()}</div>
              <div className="text-xs text-muted-foreground">{item.status} — {Math.round(item.percent)}%</div>
            </div>
            <div className="flex items-center gap-2">
              {item.status === 'downloading' && <button className="px-3 py-1 border rounded" onClick={() => cancel(item.id)}>Cancel</button>}
              {item.status === 'complete' && <a className="px-3 py-1 border rounded" href={"file://" + item.path}>Open</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
