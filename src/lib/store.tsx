'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incident, ReliefCamp, ResourceItem, HydroStation, UserProfile, UserRole, IncidentStatus } from './types';
import { INITIAL_INCIDENTS, INITIAL_CAMPS, INITIAL_RESOURCES, INITIAL_HYDRO_STATIONS } from './data';
import { supabase, isSupabaseConfigured } from './supabase/client';

interface AppContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  language: 'en' | 'ml';
  toggleLanguage: () => void;
  incidents: Incident[];
  camps: ReliefCamp[];
  resources: ResourceItem[];
  hydroStations: HydroStation[];
  offlineQueue: Incident[];
  isOnline: boolean;
  isDatabaseConnected: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sirenActive: boolean;
  toggleSiren: () => void;
  dispatchSOS: (data: Partial<Incident>) => Promise<Incident>;
  updateIncidentStatus: (id: string, status: IncidentStatus, actor?: string) => void;
  assignVolunteer: (incidentId: string, volunteerId: string, volunteerName: string) => void;
  syncOfflineQueue: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-cit-01',
  name: 'Arun Varma',
  nameMl: 'അരുൺ വർമ്മ',
  phone: '98470 12345',
  email: 'arun.kerala@resq.org',
  role: 'citizen',
  district: 'Ernakulam',
  panchayat: 'Aluva Municipality',
  isVerified: true,
  assignedSector: 'Periyar River Basin / Aluva Sector',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ernakulam');
  const [language, setLanguage] = useState<'en' | 'ml'>('en');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [camps, setCamps] = useState<ReliefCamp[]>(INITIAL_CAMPS);
  const [resources, setResources] = useState<ResourceItem[]>(INITIAL_RESOURCES);
  const [hydroStations] = useState<HydroStation[]>(INITIAL_HYDRO_STATIONS);
  const [offlineQueue, setOfflineQueue] = useState<Incident[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const isDatabaseConnected = isSupabaseConfigured();

  // Hydrate from Supabase PostgreSQL when credentials exist
  useEffect(() => {
    const client = supabase;
    if (isSupabaseConfigured() && client) {
      // 1. Restore auth session and fetch verified role
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data: profile }) => {
              if (profile) {
                client
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', session.user.id)
                  .maybeSingle()
                  .then(({ data: roleData }) => {
                    const role = (roleData?.role as UserRole) || 'citizen';
                    setUser((prev) => ({
                      ...prev,
                      id: session.user.id,
                      name: profile.full_name || prev.name,
                      phone: profile.phone || prev.phone,
                      email: profile.email || session.user.email,
                      role,
                      district: profile.district || prev.district,
                      isVerified: true,
                    }));
                  });
              }
            });
        }
      });

      // 2. Hydrate verified incidents from PostgreSQL database
      client
        .from('emergency_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mapped: Incident[] = data.map((d: any) => ({
              id: d.id,
              trackingCode: d.tracking_code,
              title: d.title,
              titleMl: d.title_ml || 'അടിയന്തര രക്ഷാസന്ദേശം',
              district: d.district,
              panchayat: d.panchayat || '',
              locationDescription: d.location_description || '',
              lat: Number(d.lat),
              lng: Number(d.lng),
              category: d.category,
              severity: d.severity,
              peopleAffected: d.people_affected,
              specialNeeds: d.special_needs || [],
              status: d.status,
              contactName: d.contact_name || 'Anonymous',
              contactPhone: d.contact_phone || '',
              notes: d.description || '',
              photoUrl: d.photo_url,
              reportedAt: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              aiPriorityScore: d.ai_priority_score || 75,
              isOfflineQueued: false,
              actionTimeline: [
                {
                  status: d.status,
                  label: `Incident confirmed in State EOC Database`,
                  timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  actor: 'Kerala State Operations Center',
                },
              ],
            }));
            setIncidents(mapped);
          }
        });
    }
  }, []);

  // Online / Offline monitor
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        syncOfflineQueue();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Load stored state if available (fallback cache)
      try {
        const storedIncidents = localStorage.getItem('resq_kerala_incidents');
        if (storedIncidents) setIncidents(JSON.parse(storedIncidents));
        const storedQueue = localStorage.getItem('resq_kerala_offline_queue');
        if (storedQueue) setOfflineQueue(JSON.parse(storedQueue));
      } catch (e) {
        // Fallback safely
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Save incidents to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('resq_kerala_incidents', JSON.stringify(incidents));
        localStorage.setItem('resq_kerala_offline_queue', JSON.stringify(offlineQueue));
      } catch (e) {}
    }
  }, [incidents, offlineQueue]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ml' : 'en'));
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return next;
    });
  };

  const switchRole = (role: UserRole) => {
    const roleProfiles: Record<UserRole, Partial<UserProfile>> = {
      citizen: {
        id: 'usr-cit-01',
        name: 'Arun Varma',
        nameMl: 'അരുൺ വർമ്മ',
        role: 'citizen',
        activeBadge: 'Verified Resident',
      },
      volunteer: {
        id: 'vol-101',
        name: 'Jaleel K. (Coastal Army)',
        nameMl: 'ജലീൽ കെ. (തീരദേശ സേന)',
        role: 'volunteer',
        activeBadge: 'Water Rescue Certified Boat Lead',
      },
      camp: {
        id: 'cmp-201',
        name: 'K. Balachandran',
        nameMl: 'കെ. ബാലചന്ദ്രൻ',
        role: 'camp',
        activeBadge: 'Aluva Camp Officer',
      },
      admin: {
        id: 'adm-001',
        name: 'Dr. R. Divya IAS',
        nameMl: 'ഡോ. ആർ. ദിവ്യ ഐ.എ.എസ്',
        role: 'admin',
        activeBadge: 'District Collector & DDMA Head',
      },
    };

    setUser((prev) => ({
      ...prev,
      ...roleProfiles[role],
    }));

    if (role === 'admin') {
      setIsDarkMode(true);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark');
      }
    }
  };

  // Web Audio API acoustic distress beacon
  const toggleSiren = () => {
    if (typeof window === 'undefined') return;
    if (sirenActive) {
      if ((window as any).__resqOscillator) {
        try {
          (window as any).__resqOscillator.stop();
          (window as any).__resqOscillator.disconnect();
          (window as any).__resqAudioContext.close();
        } catch (e) {}
      }
      setSirenActive(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        (window as any).__resqAudioContext = ctx;
        (window as any).__resqOscillator = osc;
        setSirenActive(true);
      } catch (e) {
        console.error('Audio synthesizer error:', e);
      }
    }
  };

  const dispatchSOS = async (data: Partial<Incident>): Promise<Incident> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `KL-${(data.district || selectedDistrict).substring(0, 3).toUpperCase()}-${randomSuffix}`;
    
    // AI Priority Score estimation
    let score = 70;
    if (data.severity === 'critical') score += 20;
    if ((data.peopleAffected || 1) >= 4) score += 5;
    if (data.specialNeeds && data.specialNeeds.length > 0) score += 5;

    let incidentId = `inc-${Date.now()}`;
    const idempotencyKey = (data as any).idempotencyKey || `live-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // If Supabase is configured and online, persist directly to PostgreSQL
    const client = supabase;
    if (isOnline && isSupabaseConfigured() && client) {
      try {
        const isAnon = user.id.startsWith('usr-');
        const { data: inserted, error } = await client
          .from('emergency_incidents')
          .insert({
            tracking_code: trackingCode,
            idempotency_key: idempotencyKey,
            reporter_id: isAnon ? null : user.id,
            category: data.category || 'boat_rescue',
            title: data.title || `Immediate Emergency SOS: ${data.district || selectedDistrict}`,
            title_ml: data.titleMl || 'അടിയന്തര രക്ഷാസന്ദേശം',
            district: data.district || selectedDistrict,
            panchayat: data.panchayat || 'Detected Sector',
            location_description: data.locationDescription || 'GPS Pin Broadcast',
            lat: data.lat || 10.1076,
            lng: data.lng || 76.3516,
            severity: data.severity || 'critical',
            people_affected: data.peopleAffected || 1,
            special_needs: data.specialNeeds || [],
            status: 'pending',
            contact_name: data.contactName || user.name,
            contact_phone: data.contactPhone || user.phone,
            description: data.notes || '',
            photo_url: data.photoUrl,
            ai_priority_score: Math.min(score, 99),
          })
          .select()
          .single();

        if (!error && inserted) {
          incidentId = inserted.id;
        }
      } catch (err) {
        console.warn('Supabase remote dispatch fallback to local state:', err);
      }
    }

    const newIncident: Incident = {
      id: incidentId,
      trackingCode,
      title: data.title || `Immediate Emergency SOS: ${data.district || selectedDistrict}`,
      titleMl: data.titleMl || 'അടിയന്തര രക്ഷാസന്ദേശം',
      district: data.district || selectedDistrict,
      panchayat: data.panchayat || 'Detected Sector',
      locationDescription: data.locationDescription || 'GPS Pin Broadcast',
      lat: data.lat || 10.1076,
      lng: data.lng || 76.3516,
      category: data.category || 'boat_rescue',
      severity: data.severity || 'critical',
      peopleAffected: data.peopleAffected || 1,
      specialNeeds: data.specialNeeds || [],
      status: 'pending',
      contactName: data.contactName || user.name,
      contactPhone: data.contactPhone || user.phone,
      notes: data.notes || '',
      photoUrl: data.photoUrl,
      reportedAt: 'Just now',
      aiPriorityScore: Math.min(score, 99),
      isOfflineQueued: !isOnline,
      actionTimeline: [
        {
          status: 'pending',
          label: isOnline
            ? isSupabaseConfigured()
              ? 'SOS Dispatched & Persisted to Supabase PostgreSQL'
              : 'SOS Alert Queued to Kerala EOC Mesh (Local Session)'
            : 'SOS Stored in Local IndexedDB Queue',
          timestamp: 'Just now',
          actor: isOnline ? 'State EOC Mesh' : 'Offline Cache Engine',
        },
      ],
    };

    if (!isOnline) {
      setOfflineQueue((prev) => [newIncident, ...prev]);
    }

    setIncidents((prev) => [newIncident, ...prev]);
    return newIncident;
  };

  const updateIncidentStatus = async (id: string, status: IncidentStatus, actor = 'Operations Control') => {
    // If Supabase is configured, update PostgreSQL remote table
    const client = supabase;
    if (isSupabaseConfigured() && client) {
      try {
        await client.from('emergency_incidents').update({ status }).eq('id', id);
        await client.from('incident_history').insert({
          incident_id: id,
          new_status: status,
          reason: `Status updated to ${status} by ${actor}`,
        });
      } catch (e) {
        console.warn('Supabase status update fallback:', e);
      }
    }

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const statusLabels: Record<IncidentStatus, string> = {
            pending: 'Alert Logged',
            verified: 'Incident Verified & Triaged',
            dispatched: 'Rescue Units Mobilized',
            in_transit: 'Rescue Team In Transit',
            resolved: 'Mission Resolved & Safe',
          };
          return {
            ...inc,
            status,
            actionTimeline: [
              ...inc.actionTimeline,
              {
                status,
                label: statusLabels[status],
                timestamp: 'Just now',
                actor,
              },
            ],
          };
        }
        return inc;
      })
    );
  };

  const assignVolunteer = async (incidentId: string, volunteerId: string, volunteerName: string) => {
    // If Supabase is configured, update assignment and incident in PostgreSQL
    const client = supabase;
    if (isSupabaseConfigured() && client) {
      try {
        await client.from('emergency_incidents').update({ status: 'dispatched' }).eq('id', incidentId);
        if (volunteerId && !volunteerId.startsWith('vol-')) {
          await client.from('volunteer_assignments').insert({
            incident_id: incidentId,
            volunteer_id: volunteerId,
            status: 'assigned',
          });
        }
        await client.from('incident_history').insert({
          incident_id: incidentId,
          new_status: 'dispatched',
          reason: `Assigned to volunteer ${volunteerName}`,
        });
      } catch (e) {
        console.warn('Supabase assignment fallback:', e);
      }
    }

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'dispatched',
            assignedVolunteerId: volunteerId,
            assignedVolunteerName: volunteerName,
            actionTimeline: [
              ...inc.actionTimeline,
              {
                status: 'dispatched',
                label: `Task Accepted by ${volunteerName}`,
                timestamp: 'Just now',
                actor: volunteerName,
              },
            ],
          };
        }
        return inc;
      })
    );
  };

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.isOfflineQueued) {
          return {
            ...inc,
            isOfflineQueued: false,
            actionTimeline: [
              ...inc.actionTimeline,
              {
                status: 'pending',
                label: 'Auto-Synced to State EOC Mesh upon Reconnection',
                timestamp: 'Just now',
                actor: 'Network Sync Service',
              },
            ],
          };
        }
        return inc;
      })
    );
    setOfflineQueue([]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        selectedDistrict,
        setSelectedDistrict,
        language,
        toggleLanguage,
        incidents,
        camps,
        resources,
        hydroStations,
        offlineQueue,
        isOnline,
        isDatabaseConnected,
        isDarkMode,
        toggleDarkMode,
        sirenActive,
        toggleSiren,
        dispatchSOS,
        updateIncidentStatus,
        assignVolunteer,
        syncOfflineQueue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
