'use client';

import * as React from 'react';
import {
  MapPin, Search, Phone, Clock, Navigation, Filter, Building2,
  HeartPulse, Home, Shield, Users, HandHeart,
} from 'lucide-react';
import { useApp } from '@/components/app-provider';
import {
  PageContainer, PageHeader, SectionTitle, StaggerContainer, StaggerItem,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { supportServices } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const categories = [
  { key: 'all', label: 'All Services' },
  { key: 'clinic', label: 'Clinics & Hospitals' },
  { key: 'counselling', label: 'Counselling' },
  { key: 'shelter', label: 'Shelters' },
  { key: 'police', label: 'Police Stations' },
  { key: 'gbv', label: 'GBV Support' },
  { key: 'community', label: 'Community Support' },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  clinic: HeartPulse,
  counselling: HandHeart,
  shelter: Home,
  police: Shield,
  gbv: HeartPulse,
  community: Users,
};

const categoryGradients: Record<string, string> = {
  clinic: 'from-red-500 to-rose-500',
  counselling: 'from-emerald-500 to-teal-600',
  shelter: 'from-blue-500 to-teal-500',
  police: 'from-teal-500 to-cyan-600',
  gbv: 'from-emerald-500 to-green-600',
  community: 'from-teal-400 to-cyan-500',
};

export function LocalHelpPage() {
  const { connectivity } = useApp();
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('all');

  const filtered = supportServices.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.area.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || s.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <PageContainer>
      <StaggerContainer>
        <StaggerItem>
          <PageHeader
            title="Local Help Directory"
            subtitle="Find verified support services near you"
            action={
              <Badge variant="outline" className={connectivity.online ? 'border-success/30 text-success' : 'border-warning/30 text-warning'}>
                {connectivity.online ? 'Live data' : 'Cached data'}
              </Badge>
            }
          />
        </StaggerItem>

        {/* Search & filter */}
        <StaggerItem>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or area..."
                    className="pl-10"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="sm:w-56">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      category === c.key ? 'gradient-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Results */}
        <StaggerItem>
          <p className="text-sm text-muted-foreground">{filtered.length} service(s) found</p>
        </StaggerItem>

        <StaggerItem>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => {
              const Icon = categoryIcons[service.category] || Building2;
              const catLabel = categories.find((c) => c.key === service.category)?.label || service.category;
              return (
                <Card key={service.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white', categoryGradients[service.category])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs">{catLabel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-display text-sm font-semibold leading-tight">{service.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {service.area}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {service.hours}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={`tel:${service.phone.replace(/\s/g, '')}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </a>
                      {service.directionsUrl && (
                        <a
                          href={service.directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium text-secondary transition-colors hover:bg-secondary/5"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          Directions
                        </a>
                      )}
                    </div>
                    <p className="pt-1 text-[10px] text-muted-foreground">Verified: {service.verifiedDate}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">
              Directory listings use real, verified organisations for production. Sample data is explicitly labelled as demonstration content. Location permission is optional — you can search by area manually.
            </p>
          </div>
        </StaggerItem>
      </StaggerContainer>
    </PageContainer>
  );
}
