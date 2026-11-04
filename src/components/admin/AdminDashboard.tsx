import React, { useState } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Palette,
  QrCode,
  Copy,
  Edit,
  Trash2,
  CopyPlus,
  Power,
  Search,
  PieChart,
  ChevronRight,
  Database,
  Eye,
} from 'lucide-react';
import { EventItem, GuestItem } from '../../types';
import { storageService } from '../../services/storage';

interface AdminDashboardProps {
  events: EventItem[];
  onOpenCreate: () => void;
  onOpenEdit: (event: EventItem) => void;
  onOpenDesigner: (event: EventItem) => void;
  onOpenGuests: (event: EventItem) => void;
  onOpenAnalytics: (event: EventItem) => void;
  onOpenDatabase: () => void;
  onPreviewEvent: (event: EventItem, sampleGuestCode?: string) => void;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  events,
  onOpenCreate,
  onOpenEdit,
  onOpenDesigner,
  onOpenGuests,
  onOpenAnalytics,
  onOpenDatabase,
  onPreviewEvent,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');
  const [search, setSearch] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const allGuests = storageService.getGuests();
  const totalGuestsCount = allGuests.length;
  const confirmedCount = allGuests.filter((g) => g.rsvpStatus === 'confirmed').length;
  const pendingCount = allGuests.filter((g) => g.rsvpStatus === 'pending').length;
  const declinedCount = allGuests.filter((g) => g.rsvpStatus === 'declined').length;

  const now = new Date();

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(search.toLowerCase()) ||
      evt.hostNames.toLowerCase().includes(search.toLowerCase()) ||
      evt.location.venueName.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const eventDate = new Date(`${evt.eventDate}T23:59:59`);
    if (filter === 'active') return evt.isActive;
    if (filter === 'upcoming') return eventDate >= now && evt.isActive;
    if (filter === 'past') return eventDate < now;
    return true;
  });

  const handleDuplicate = (id: string) => {
    storageService.duplicateEvent(id);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este evento y todos sus invitados?')) {
      storageService.deleteEvent(id);
      onRefresh();
    }
  };

  const handleToggleActive = (id: string) => {
    storageService.toggleEventStatus(id);
    onRefresh();
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}?evento=${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 text-white shadow-xl relative overflow-hidden border border-stone-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Panel de Control de Invitaciones Digitales</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight leading-snug">
            Crea momentos mágicos con invitaciones elegantes y privadas.
          </h1>

          <p className="text-sm text-stone-300 mt-2 leading-relaxed">
            Administra tus eventos sociales, personaliza sobre y lacre con animaciones interactivas, controla pases familiares con códigos cifrados y supervisa confirmaciones RSVP en tiempo real.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreate}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-stone-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-400 transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Crear Nueva Celebración</span>
            </button>

            <button
              onClick={onOpenDatabase}
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-stone-200 border border-white/15 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span>Ver Esquema MySQL & Laravel</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1">
            <span>Eventos Activos</span>
            <Calendar className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {events.filter((e) => e.isActive).length}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {events.length} celebraciones totales
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1">
            <span>Invitados Registrados</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {totalGuestsCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Códigos de acceso generados
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1">
            <span>Asistencias Confirmadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900 tabular-nums">
            {confirmedCount}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {totalGuestsCount > 0 ? Math.round((confirmedCount / totalGuestsCount) * 100) : 0}% tasa de confirmación
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium mb-1">
            <span>Pendientes por Confirmar</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tabular-nums">
            {pendingCount}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {declinedCount} no asistirán
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por anfitriones, salón o título..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['all', 'active', 'upcoming', 'past'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filter === st
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'all' && 'Todos los Eventos'}
              {st === 'active' && 'Activos'}
              {st === 'upcoming' && 'Próximos'}
              {st === 'past' && 'Finalizados'}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-400 bg-white rounded-3xl border border-stone-200">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-base font-serif font-bold text-stone-700">No se encontraron eventos</p>
            <p className="text-xs text-stone-400 mt-1">Prueba con otro término de búsqueda o crea un evento nuevo.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const eventStats = storageService.getEventStats(evt.id);
            const firstGuest = storageService.getGuestsByEvent(evt.id)[0];

            return (
              <div
                key={evt.id}
                className="rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Event Cover Photo with status badge */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-100">
                    <img
                      src={evt.design.coverImageUrl}
                      alt={evt.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30">
                          {evt.eventType.replace('_', ' ')}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${
                            evt.isActive
                              ? 'bg-emerald-500/80 text-white border-emerald-400/50'
                              : 'bg-stone-800/80 text-stone-300 border-stone-700'
                          }`}
                        >
                          {evt.isActive ? 'Activo' : 'Pausado'}
                        </span>
                      </div>

                      <div className="text-white">
                        <h3 className="text-xl font-serif font-bold leading-tight">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-stone-200 mt-0.5 font-medium">
                          {evt.hostNames}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-4 text-xs text-stone-600">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="font-semibold text-stone-800">
                          {new Date(evt.eventDate + 'T12:00:00').toLocaleDateString('es-MX', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-stone-400">·</span>
                        <span className="font-semibold text-stone-800">{evt.startTime} hrs</span>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 mt-0.5 text-amber-700 shrink-0">📍</div>
                      <div>
                        <p className="font-semibold text-stone-800">{evt.location.venueName}</p>
                        <p className="text-[11px] text-stone-500">{evt.location.city}</p>
                      </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Invitados</p>
                        <p className="font-serif font-bold text-stone-900 text-sm mt-0.5">
                          {eventStats.totalInvitations}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Confirmados</p>
                        <p className="font-serif font-bold text-emerald-800 text-sm mt-0.5">
                          {eventStats.totalConfirmedPeople} personas
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase tracking-wider">Vistos</p>
                        <p className="font-serif font-bold text-blue-800 text-sm mt-0.5">
                          {eventStats.openedInvitations}
                        </p>
                      </div>
                    </div>

                    {/* Private Link Box */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
                      <div className="truncate pr-2">
                        <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider">
                          Enlace Privado del Evento
                        </p>
                        <p className="font-mono text-[11px] text-stone-700 truncate">
                          /invitacion/{evt.slug}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyLink(evt.slug)}
                        title="Copiar enlace del evento"
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedSlug === evt.slug ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 bg-stone-50/70 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onPreviewEvent(evt, firstGuest?.accessCode)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ver Invitación</span>
                    </button>

                    <button
                      onClick={() => onOpenDesigner(evt)}
                      title="Personalizar diseño visual"
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-amber-700" />
                      <span>Diseñar</span>
                    </button>

                    <button
                      onClick={() => onOpenGuests(evt)}
                      title="Administrar invitados y códigos"
                      className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <span>Invitados</span>
                    </button>

                    <button
                      onClick={() => onOpenAnalytics(evt)}
                      title="Ver confirmaciones RSVP"
                      className="p-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <PieChart className="w-4 h-4 text-emerald-700" />
                    </button>
                  </div>

                  {/* Secondary actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEdit(evt)}
                      title="Editar información del evento"
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(evt.id)}
                      title="Duplicar evento e invitados"
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      <CopyPlus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleActive(evt.id)}
                      title={evt.isActive ? 'Desactivar invitación' : 'Activar invitación'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        evt.isActive ? 'text-emerald-700 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(evt.id)}
                      title="Eliminar evento"
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
