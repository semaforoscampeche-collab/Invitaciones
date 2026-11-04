import React, { useState, useEffect } from 'react';
import { storageService } from './services/storage';
import { EventItem, GuestItem } from './types';
import { Navbar } from './components/common/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { EventEditorModal } from './components/admin/EventEditorModal';
import { DesignCustomizer } from './components/admin/DesignCustomizer';
import { GuestManagerModal } from './components/admin/GuestManagerModal';
import { RSVPAnalyticsModal } from './components/admin/RSVPAnalyticsModal';
import { DatabaseSchemaModal } from './components/admin/DatabaseSchemaModal';
import { InvitationView } from './components/invitation/InvitationView';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentView, setCurrentView] = useState<'admin' | 'invitation'>('admin');
  const [initialGuestCode, setInitialGuestCode] = useState<string | undefined>(undefined);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'events' | 'designer' | 'guests' | 'analytics' | 'database'>('events');

  const refreshEvents = () => {
    const list = storageService.getEvents();
    setEvents(list);
    if (!selectedEvent && list.length > 0) {
      setSelectedEvent(list[0]);
    } else if (selectedEvent) {
      const refreshed = list.find((e) => e.id === selectedEvent.id);
      if (refreshed) setSelectedEvent(refreshed);
    }
  };

  useEffect(() => {
    refreshEvents();

    // Check URL parameters (e.g. ?evento=boda-andrea-y-carlos&codigo=AC-001)
    const urlParams = new URLSearchParams(window.location.search);
    const eventSlug = urlParams.get('evento');
    const guestCode = urlParams.get('codigo');

    if (eventSlug) {
      const targetEvent = storageService.getEventBySlug(eventSlug);
      if (targetEvent) {
        setSelectedEvent(targetEvent);
        if (guestCode) {
          setInitialGuestCode(guestCode);
        }
        setCurrentView('invitation');
      }
    }
  }, []);

  const handlePreviewEvent = (event: EventItem, sampleGuestCode?: string) => {
    setSelectedEvent(event);
    setInitialGuestCode(sampleGuestCode);
    setCurrentView('invitation');
  };

  const handleSelectNavTab = (tab: 'events' | 'designer' | 'guests' | 'analytics' | 'database') => {
    setActiveNavTab(tab);
    if (tab === 'events') {
      // Stay on dashboard
    } else if (tab === 'designer') {
      if (selectedEvent) setIsDesignerOpen(true);
    } else if (tab === 'guests') {
      if (selectedEvent) setIsGuestsOpen(true);
    } else if (tab === 'analytics') {
      if (selectedEvent) setIsAnalyticsOpen(true);
    } else if (tab === 'database') {
      setIsDatabaseOpen(true);
    }
  };

  // 1. PUBLIC GUEST INVITATION VIEW
  if (currentView === 'invitation' && selectedEvent) {
    return (
      <InvitationView
        event={selectedEvent}
        initialGuestCode={initialGuestCode}
        onBackToAdmin={() => {
          setCurrentView('admin');
          setInitialGuestCode(undefined);
          // Clean URL params without page reload
          window.history.pushState({}, '', window.location.pathname);
        }}
      />
    );
  }

  // 2. ADMIN DASHBOARD & CONTROLS VIEW
  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col">
      {/* Strict 3-zone Top Bar Contract */}
      <Navbar
        activeTab={activeNavTab}
        onSelectTab={handleSelectNavTab}
        onCreateEvent={() => {
          setEditingEvent(null);
          setIsCreateOpen(true);
        }}
      />

      {/* Main Administrative Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboard
          events={events}
          onOpenCreate={() => {
            setEditingEvent(null);
            setIsCreateOpen(true);
          }}
          onOpenEdit={(event) => {
            setEditingEvent(event);
            setIsCreateOpen(true);
          }}
          onOpenDesigner={(event) => {
            setSelectedEvent(event);
            setIsDesignerOpen(true);
          }}
          onOpenGuests={(event) => {
            setSelectedEvent(event);
            setIsGuestsOpen(true);
          }}
          onOpenAnalytics={(event) => {
            setSelectedEvent(event);
            setIsAnalyticsOpen(true);
          }}
          onOpenDatabase={() => setIsDatabaseOpen(true)}
          onPreviewEvent={handlePreviewEvent}
          onRefresh={refreshEvents}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Aurea Invitaciones Digitales. Arquitectura Modular & Segura.</p>
          <div className="flex items-center gap-4 text-stone-600 font-medium">
            <button
              onClick={() => setIsDatabaseOpen(true)}
              className="hover:text-stone-900 cursor-pointer"
            >
              Esquema de Base de Datos
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                if (confirm('¿Restablecer datos de demostración a valores de fábrica?')) {
                  storageService.resetAll();
                  refreshEvents();
                }
              }}
              className="text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              Restablecer Demos
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL: CREATE / EDIT EVENT */}
      {isCreateOpen && (
        <EventEditorModal
          initialEvent={editingEvent}
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingEvent(null);
          }}
          onSaved={(saved) => {
            setSelectedEvent(saved);
            refreshEvents();
          }}
        />
      )}

      {/* MODAL: VISUAL DESIGNER */}
      {isDesignerOpen && selectedEvent && (
        <DesignCustomizer
          event={selectedEvent}
          onSave={(updated) => {
            setSelectedEvent(updated);
            refreshEvents();
          }}
          onPreview={(evt) => {
            setIsDesignerOpen(false);
            handlePreviewEvent(evt);
          }}
          onClose={() => setIsDesignerOpen(false)}
        />
      )}

      {/* MODAL: GUEST & CODES MANAGER */}
      {isGuestsOpen && selectedEvent && (
        <GuestManagerModal
          event={selectedEvent}
          isOpen={isGuestsOpen}
          onClose={() => setIsGuestsOpen(false)}
          onSelectGuestPreview={(guest) => {
            setIsGuestsOpen(false);
            handlePreviewEvent(selectedEvent, guest.accessCode);
          }}
        />
      )}

      {/* MODAL: RSVP ANALYTICS */}
      {isAnalyticsOpen && selectedEvent && (
        <RSVPAnalyticsModal
          event={selectedEvent}
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
        />
      )}

      {/* MODAL: DATABASE SCHEMA & LARAVEL BACKEND SPECIFICATION */}
      {isDatabaseOpen && (
        <DatabaseSchemaModal
          isOpen={isDatabaseOpen}
          onClose={() => setIsDatabaseOpen(false)}
        />
      )}
    </div>
  );
}
