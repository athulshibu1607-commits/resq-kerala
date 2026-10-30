'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/lib/store';
import { Incident, ReliefCamp } from '@/lib/types';

interface InteractiveMapProps {
  initialDistrict?: string;
  selectedCategory?: string;
  onSelectIncident?: (incident: Incident) => void;
  onSelectCamp?: (camp: ReliefCamp) => void;
  className?: string;
}

export default function InteractiveMap({
  initialDistrict,
  selectedCategory = 'all',
  onSelectIncident,
  onSelectCamp,
  className = 'h-[500px]',
}: InteractiveMapProps) {
  const { incidents, camps, selectedDistrict } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  const [activeFilter, setActiveFilter] = useState<string>(selectedCategory);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'incident' | 'camp';
    data: any;
  } | null>(null);

  // Filtered lists
  const filteredIncidents = incidents.filter((inc) => {
    if (activeFilter === 'flood') return inc.category === 'flood' || inc.category === 'boat_rescue';
    if (activeFilter === 'landslide') return inc.category === 'landslide';
    if (activeFilter === 'medical') return inc.category === 'medical';
    if (activeFilter === 'boats') return inc.category === 'boat_rescue';
    if (activeFilter === 'camps') return false; // Show only camps in camps filter
    return true;
  });

  const filteredCamps = camps.filter(() => {
    if (activeFilter === 'flood' || activeFilter === 'landslide' || activeFilter === 'boats') return false;
    return true;
  });

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Clean up previous map instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: Ernakulam / Aluva area (10.1076, 76.3516) or Kerala center (10.0, 76.4)
      const map = L.map(mapContainerRef.current, {
        center: [10.1076, 76.3516],
        zoom: 12,
        zoomControl: false,
      });

      // Add OpenStreetMap base tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control to top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Create GIS overlays (Periyar Flood Plain hazard polygon, safe island)
      const floodHazardCoords: [number, number][] = [
        [10.125, 76.335],
        [10.132, 76.365],
        [10.118, 76.382],
        [10.098, 76.362],
        [10.102, 76.332],
      ];

      L.polygon(floodHazardCoords, {
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.22,
        weight: 2,
        dashArray: '5, 5',
      })
        .addTo(map)
        .bindPopup('<strong class="text-red-700">Periyar Flood Plain Danger Zone</strong><br/>Water Level Surge: +2.4m');

      // Safe Elevation Plateau (Green Circle)
      L.circle([10.1112, 76.3548], {
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 0.18,
        radius: 800,
        weight: 2,
      })
        .addTo(map)
        .bindPopup('<strong class="text-emerald-700">Safe High Ground Island</strong><br/>Aluva HSS Emergency Camp & Relief Staging');

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Plot markers
      renderMarkers(L, map, markersLayer);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-render markers when filter or data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import('leaflet').then((LModule) => {
      const L = LModule.default;
      renderMarkers(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [activeFilter, incidents, camps]);

  const renderMarkers = (L: any, map: any, layer: any) => {
    layer.clearLayers();

    // Custom SVG Icon generators
    const createPin = (color: string, icon: string, isPulse = false) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
            ${isPulse ? `<span style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: ${color}; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ''}
            <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: ${color}; color: white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
              <span class="material-symbols-outlined" style="font-size: 18px;">${icon}</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });
    };

    // Plot Incidents
    filteredIncidents.forEach((inc) => {
      const isCritical = inc.severity === 'critical';
      const iconName = inc.category === 'boat_rescue' ? 'sailing' : inc.category === 'landslide' ? 'landslide' : inc.category === 'medical' ? 'medical_services' : 'tsunami';
      const color = isCritical ? '#dc2626' : inc.severity === 'high' ? '#d97706' : '#2563eb';

      const marker = L.marker([inc.lat, inc.lng], {
        icon: createPin(color, iconName, isCritical),
      });

      marker.bindPopup(`
        <div style="min-width: 220px; font-family: Inter, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; background-color: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 9999px;">
              ${inc.severity.toUpperCase()} ALERT
            </span>
            <span style="font-size: 10px; color: #64748b;">${inc.trackingCode}</span>
          </div>
          <strong style="font-size: 13px; color: #0f172a; display: block; line-height: 1.3;">${inc.title}</strong>
          <p style="font-size: 11px; color: #475569; margin: 4px 0;">${inc.locationDescription}</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span>People: <strong>${inc.peopleAffected}</strong></span>
            <span style="color: #dc2626; font-weight: bold;">${inc.status.toUpperCase()}</span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedItem({ type: 'incident', data: inc });
        if (onSelectIncident) onSelectIncident(inc);
      });

      layer.addLayer(marker);
    });

    // Plot Relief Camps
    filteredCamps.forEach((camp) => {
      const marker = L.marker([camp.lat, camp.lng], {
        icon: createPin('#16a34a', 'holiday_village', false),
      });

      marker.bindPopup(`
        <div style="min-width: 220px; font-family: Inter, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; background-color: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 9999px;">
              SAFE RELIEF CAMP
            </span>
            <span style="font-size: 10px; color: #16a34a; font-weight: bold;">${camp.availableBeds} Beds Open</span>
          </div>
          <strong style="font-size: 13px; color: #0f172a; display: block; line-height: 1.3;">${camp.name}</strong>
          <p style="font-size: 11px; color: #475569; margin: 4px 0;">${camp.address}</p>
          <div style="font-size: 11px; margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            <span>Coordinator: <strong>${camp.coordinatorName}</strong></span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedItem({ type: 'camp', data: camp });
        if (onSelectCamp) onSelectCamp(camp);
      });

      layer.addLayer(marker);
    });
  };

  const recenterToDistrict = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([10.1076, 76.3516], 13, { duration: 1.2 });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-xl border border-surface-container-high dark:border-command-border bg-surface-container-low flex flex-col ${className}`}>
      {/* Top Floating Telemetry & GIS status pill */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-command-card/90 backdrop-blur-md shadow-md pointer-events-auto border border-surface-container-high dark:border-command-border">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
          <span className="text-xs font-bold text-on-surface dark:text-white">Live GIS Mesh Sync</span>
          <span className="text-[10px] text-on-surface-variant dark:text-command-subtle border-l border-surface-container-high pl-1.5 ml-0.5">
            14.2 MB Cached
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1 rounded-full bg-white/90 dark:bg-command-card/90 backdrop-blur-md shadow-md text-xs font-semibold text-secondary flex items-center gap-1 border border-surface-container-high dark:border-command-border">
            <span className="material-symbols-outlined text-[15px]">water_voc</span>
            <span>+2.4m Surge Peak</span>
          </div>

          <button
            onClick={recenterToDistrict}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-command-card hover:bg-surface-container dark:hover:bg-command-navy text-on-surface dark:text-white text-xs font-bold shadow-md transition-colors border border-surface-container-high dark:border-command-border"
          >
            <span className="material-symbols-outlined text-[15px] text-secondary">my_location</span>
            <span>Recenter</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar (As in Stitch Screen 4) */}
      <div className="absolute top-14 left-3 right-3 z-20 overflow-x-auto no-scrollbar flex items-center gap-1.5 pb-1 pointer-events-auto">
        {[
          { id: 'all', label: 'All Zones', icon: 'layers' },
          { id: 'flood', label: 'Flood Risk (Red)', icon: 'tsunami', color: 'bg-red-600 text-white' },
          { id: 'landslide', label: 'Landslides (Amber)', icon: 'landslide', color: 'bg-amber-600 text-white' },
          { id: 'camps', label: 'Safe Shelters', icon: 'shield', color: 'bg-emerald-600 text-white' },
          { id: 'boats', label: 'Rescue Boats', icon: 'sailing' },
          { id: 'medical', label: 'Medical Units', icon: 'medical_services' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all active:scale-95 ${
              activeFilter === f.id
                ? f.color || 'bg-primary-container text-white ring-2 ring-white/50'
                : 'bg-white/90 dark:bg-command-card/90 text-on-surface dark:text-white hover:bg-white dark:hover:bg-command-card'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Actual Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Bottom Selected Drawer / Card */}
      {selectedItem && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 dark:bg-command-card/95 backdrop-blur-xl p-3 sm:p-4 rounded-xl shadow-2xl border border-surface-container-highest dark:border-command-border flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  selectedItem.type === 'camp'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {selectedItem.type === 'camp' ? 'Safe Camp' : `${selectedItem.data.severity} Emergency`}
              </span>
              <span className="text-xs font-mono font-bold text-on-surface-variant dark:text-command-subtle">
                {selectedItem.data.trackingCode || selectedItem.data.taluk}
              </span>
            </div>

            <h4 className="font-headline text-sm font-bold text-on-surface dark:text-white truncate">
              {selectedItem.data.title || selectedItem.data.name}
            </h4>
            <p className="text-xs text-on-surface-variant dark:text-command-subtle truncate mt-0.5">
              {selectedItem.data.locationDescription || selectedItem.data.address}
            </p>

            {selectedItem.type === 'incident' && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span>Trapped: <strong>{selectedItem.data.peopleAffected} persons</strong></span>
                <span className="text-secondary font-bold uppercase">{selectedItem.data.status}</span>
                {selectedItem.data.assignedVolunteerName && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                    Assigned: {selectedItem.data.assignedVolunteerName}
                  </span>
                )}
              </div>
            )}

            {selectedItem.type === 'camp' && (
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {selectedItem.data.availableBeds} beds available
                </span>
                <span>Coord: {selectedItem.data.coordinatorName} ({selectedItem.data.coordinatorPhone})</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedItem(null)}
            className="p-1 rounded-lg text-on-surface-variant dark:text-command-subtle hover:bg-surface-container dark:hover:bg-command-navy"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
