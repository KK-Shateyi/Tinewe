'use client';

import * as React from 'react';
import { Plus, Minus, Locate } from 'lucide-react';
import type { MapViewProps } from '@/components/map-view-inner';

type LeafletMap = {
  zoomIn: () => void;
  zoomOut: () => void;
  setView: (center: [number, number], zoom: number, options?: { animate?: boolean }) => void;
  fitBounds: (bounds: unknown, options?: { padding?: [number, number]; maxZoom?: number; animate?: boolean }) => void;
  getZoom: () => number;
};

function useLeafletMap(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [map, setMap] = React.useState<LeafletMap | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const find = () => {
      const el = containerRef.current?.querySelector<HTMLElement>('.leaflet-container');
      if (!el) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (el as any)._leaflet_map as LeafletMap | undefined;
    };
    const interval = window.setInterval(() => {
      if (cancelled) return;
      const found = find();
      if (found) {
        setMap(found);
        window.clearInterval(interval);
      }
    }, 100);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [containerRef]);

  return map;
}

export function MapView(props: MapViewProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const map = useLeafletMap(containerRef);

  const zoomIn = () => map?.zoomIn();
  const zoomOut = () => map?.zoomOut();
  const recenter = () => {
    if (!map) return;
    const points: [number, number][] = [props.origin, props.destination];
    if (props.currentPosition) points.push(props.currentPosition);
    if (points.length <= 1) {
      map.setView(props.origin, 14, { animate: true });
      return;
    }
    void import('leaflet').then((L) => {
      map.fitBounds(L.latLngBounds(points.map((p) => L.latLng(p[0], p[1]))), {
        padding: [60, 60],
        maxZoom: 15,
        animate: true,
      });
    });
  };

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <MapViewLoader {...props} />
      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={zoomIn}
          disabled={!map}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-md backdrop-blur transition-colors hover:bg-card disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={zoomOut}
          disabled={!map}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-md backdrop-blur transition-colors hover:bg-card disabled:opacity-50"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Fit all markers"
          onClick={recenter}
          disabled={!map}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/90 text-foreground shadow-md backdrop-blur transition-colors hover:bg-card disabled:opacity-50"
        >
          <Locate className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MapViewLoader(props: MapViewProps) {
  const [MapComponent, setMapComponent] = React.useState<React.ComponentType<MapViewProps> | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import('@/components/map-view-inner').then((mod) => {
      if (mounted) setMapComponent(() => mod.MapViewInner);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!MapComponent) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <div className="text-sm text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return <MapComponent {...props} />;
}
