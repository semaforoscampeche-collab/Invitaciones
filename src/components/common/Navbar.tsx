import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'events' | 'designer' | 'guests' | 'analytics' | 'database';
  onSelectTab: (tab: 'events' | 'designer' | 'guests' | 'analytics' | 'database') => void;
  onCreateEvent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onCreateEvent,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div
          onClick={() => onSelectTab('events')}
          className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-100" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-stone-900">
            Aurea
          </span>
          <span className="text-xs uppercase tracking-widest text-stone-400 font-sans hidden sm:inline-block">
            Invitaciones
          </span>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onSelectTab('events')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
              activeTab === 'events'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            Panel de Eventos
          </button>
          <button
            onClick={() => onSelectTab('designer')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
              activeTab === 'designer'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            Diseñador Visual
          </button>
          <button
            onClick={() => onSelectTab('guests')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
              activeTab === 'guests'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            Gestor de Invitados
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            Confirmaciones RSVP
          </button>
          <button
            onClick={() => onSelectTab('database')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
              activeTab === 'database'
                ? 'text-amber-800 font-semibold border-b-2 border-amber-600'
                : 'hover:text-stone-900'
            }`}
          >
            Arquitectura DB & API
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onCreateEvent}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-400 rounded-lg shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Crear Evento</span>
          </button>
        </div>
      </div>
    </header>
  );
};
