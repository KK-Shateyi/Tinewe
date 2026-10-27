import 'leaflet/dist/leaflet.css';
import * as React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

function FitBounds({
  positions,
  follow,
  followPosition,
}: {
  positions: [number, number][];
  follow?: boolean;
  followPosition?: [number, number];
}) {
  const map = useMap();

  React.useEffect(() => {
    if (follow && followPosition) {
      map.setView(followPosition, Math.max(map.getZoom(), 15), { animate: true });
      return;
    }
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(positions.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
  }, [positions, follow, followPosition, map]);

  return null;
}

export interface MapViewProps {
  origin: [number, number];
  destination: [number, number];
  currentPosition?: [number, number];
  showRoute?: boolean;
  routePoints?: [number, number][];
  className?: string;
  followCurrent?: boolean;
}

export function MapViewInner({
  origin,
  destination,
  currentPosition,
  showRoute = true,
  routePoints,
  className,
  followCurrent = false,
}: MapViewProps) {
  const defaultIcon = React.useMemo(
    () =>
      L.divIcon({
        html: `<div style="width:28px;height:28px;background:hsl(187 100% 31%);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        className: 'tinewe-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    []
  );

  const destinationIcon = React.useMemo(
    () =>
      L.divIcon({
        html: `<div style="width:28px;height:28px;background:hsl(166 75% 44%);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        className: 'tinewe-marker-dest',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    []
  );

  const currentPosIcon = React.useMemo(
    () =>
      L.divIcon({
        html: `<div style="width:20px;height:20px;background:hsl(349 61% 57%);border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        className: 'tinewe-marker-current',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    []
  );

  const center = React.useMemo(() => {
    const lat = (origin[0] + destination[0]) / 2;
    const lng = (origin[1] + destination[1]) / 2;
    return [lat, lng] as [number, number];
  }, [origin, destination]);

  const route = routePoints || [origin, destination];

  const boundsPositions = React.useMemo(() => {
    const points: [number, number][] = [origin, destination];
    if (currentPosition) points.push(currentPosition);
    return points;
  }, [origin, destination, currentPosition]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom
      zoomControl={false}
      className={className}
      style={{ height: '100%', width: '100%', borderRadius: 'inherit', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={boundsPositions} follow={followCurrent} followPosition={currentPosition} />
      <Marker position={origin} icon={defaultIcon} />
      <Marker position={destination} icon={destinationIcon} />
      {currentPosition && <Marker position={currentPosition} icon={currentPosIcon} />}
      {showRoute && (
        <Polyline
          positions={route}
          pathOptions={{ color: 'hsl(187 100% 31%)', weight: 4, opacity: 0.7, dashArray: '8 6' }}
        />
      )}
      {currentPosition && (
        <Circle
          center={currentPosition}
          radius={300}
          pathOptions={{ color: 'hsl(349 61% 57%)', fillColor: 'hsl(349 61% 57%)', fillOpacity: 0.1 }}
        />
      )}
    </MapContainer>
  );
}
