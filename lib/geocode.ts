export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

const CACHE = new Map<string, GeocodeResult>();

export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (CACHE.has(key)) return CACHE.get(key)!;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      key
    )}&format=json&limit=1&addressdetails=0`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const result: GeocodeResult = {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
    CACHE.set(key, result);
    return result;
  } catch {
    return null;
  }
}

export function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

export function interpolate(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
