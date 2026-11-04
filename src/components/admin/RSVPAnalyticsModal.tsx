import React, { useState } from 'react';
import {
  PieChart,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  X,
  Utensils,
  MessageSquare,
} from 'lucide-react';
import { EventItem, GuestItem } from '../../types';
import { storageService } from '../../services/storage';

interface RSVPAnalyticsModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
}

export const RSVPAnalyticsModal: React.FC<RSVPAnalyticsModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('confirmed');

  if (!isOpen) return null;

  const guests = storageService.getGuestsByEvent(event.id);
  const stats = storageService.getEventStats(event.id);

  const filteredGuests = guests.filter((g) => {
    if (filter === 'all') return true;
    return g.rsvpStatus === filter;
  });

  const guestsWithDietary = guests.filter((g) => g.dietaryRestrictions && g.dietaryRestrictions.trim().length > 0);
  const guestsWithMessages = guests.filter((g) => g.guestMessage && g.guestMessage.trim().length > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                Confirmaciones & Métricas RSVP
              </h2>
              <p className="text-xs text-stone-500">
                {event.title} · Fecha límite: {event.rsvpDeadline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Reporte</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 border-b border-stone-200 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
              <span>Tasa de Confirmación</span>
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-serif font-bold text-amber-950 tabular-nums">
              {stats.confirmationRate}%
            </p>
            <p className="text-[11px] text-amber-700/80 mt-1">
              {stats.confirmedCount} de {stats.totalInvitations} invitaciones
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-medium mb-1">
              <span>Personas Confirmadas</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-serif font-bold text-emerald-950 tabular-nums">
              {stats.totalConfirmedPeople}
            </p>
            <p className="text-[11px] text-emerald-700/80 mt-1">
              de {stats.totalAuthorizedPeople} lugares autorizados
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-1">
              <span>Lugares Pendientes</span>
              <Clock className="w-4 h-4 text-stone-500" />
            </div>
            <p className="text-2xl font-serif font-bold text-stone-900 tabular-nums">
              {stats.totalPendingPeople}
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              {stats.pendingCount} invitaciones sin responder
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80">
            <div className="flex items-center justify-between text-xs text-rose-800 font-medium mb-1">
              <span>Lugares Rechazados</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-serif font-bold text-rose-950 tabular-nums">
              {stats.totalDeclinedPeople}
            </p>
            <p className="text-[11px] text-rose-700/80 mt-1">
              {stats.declinedCount} avisaron no poder ir
            </p>
          </div>
        </div>

        {/* Dietary / Special Notes Pillbox */}
        {guestsWithDietary.length > 0 && (
          <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-200/60 text-xs flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 shrink-0">
              <Utensils className="w-3.5 h-3.5 text-amber-700" />
              <span>Alergias / Menús Especiales:</span>
            </div>
            <div className="flex items-center gap-2">
              {guestsWithDietary.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-stone-800 text-[11px] whitespace-nowrap"
                >
                  <strong>{g.name}:</strong> {g.dietaryRestrictions}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-stone-200 bg-white flex items-center gap-2">
          <span className="text-xs text-stone-500 font-medium mr-2">Filtrar respuestas:</span>
          {(['confirmed', 'pending', 'declined', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                filter === st
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st === 'confirmed' && 'Asistirán'}
              {st === 'pending' && 'Sin Confirmar'}
              {st === 'declined' && 'No Asistirán'}
              {st === 'all' && 'Todos'}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredGuests.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              No hay respuestas registradas bajo este filtro
            </div>
          ) : (
            filteredGuests.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 hover:border-stone-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-stone-900 text-sm">
                      {g.name}
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                      {g.accessCode}
                    </span>
                    {g.tableNumber && (
                      <span className="text-[10px] text-stone-600 bg-stone-200/70 px-1.5 py-0.5 rounded">
                        {g.tableNumber}
                      </span>
                    )}
                  </div>

                  {/* Companions list */}
                  {g.companionNames && g.companionNames.length > 0 && (
                    <p className="text-stone-600 mt-1">
                      Acompañantes: <span className="font-medium">{g.companionNames.join(', ')}</span>
                    </p>
                  )}

                  {/* Dietary */}
                  {g.dietaryRestrictions && (
                    <p className="text-amber-800 font-medium mt-1">
                      🍽️ {g.dietaryRestrictions}
                    </p>
                  )}

                  {/* Personal guest message */}
                  {g.guestMessage && (
                    <div className="mt-2 p-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 italic flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span>&ldquo;{g.guestMessage}&rdquo;</span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-stone-800 text-sm">
                    {g.rsvpStatus === 'confirmed' ? `${g.confirmedPasses} confirmados` : `${g.authorizedPasses} pases`}
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {g.rsvpSubmittedAt
                      ? `Confirmó el ${new Date(g.rsvpSubmittedAt).toLocaleDateString('es-MX')}`
                      : g.hasViewed
                      ? 'Invitación abierta'
                      : 'No ha ingresado'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
