import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  KeyRound,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Gift,
  Copy,
  Check,
  Heart,
  AlertCircle,
  Share2,
  CalendarPlus,
  Users,
  ChevronRight,
  ShieldCheck,
  Eye,
  Camera,
  Shirt,
  HelpCircle,
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { EventItem, GuestItem, RSVPStatus } from '../../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { EnvelopeCover } from './EnvelopeCover';
import { MusicPlayer } from '../common/MusicPlayer';
import confetti from 'canvas-confetti';

interface InvitationViewProps {
  event: EventItem;
  initialGuestCode?: string;
  onBackToAdmin?: () => void;
}

export const InvitationView: React.FC<InvitationViewProps> = ({
  event,
  initialGuestCode,
  onBackToAdmin,
}) => {
  const [accessCode, setAccessCode] = useState(initialGuestCode || '');
  const [authenticatedGuest, setAuthenticatedGuest] = useState<GuestItem | null>(null);
  const [hasOpenedEnvelope, setHasOpenedEnvelope] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockRemainingSec, setLockRemainingSec] = useState(0);

  // RSVP Form state
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus>('confirmed');
  const [confirmedPasses, setConfirmedPasses] = useState<number>(1);
  const [companionNames, setCompanionNames] = useState<string[]>(['']);
  const [dietary, setDietary] = useState('');
  const [message, setMessage] = useState('');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccessMessage, setRsvpSuccessMessage] = useState<string | null>(null);

  // Lightbox
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [copiedClabeId, setCopiedClabeId] = useState<string | null>(null);

  // Check if initialGuestCode was provided and auto-validate
  useEffect(() => {
    if (initialGuestCode) {
      handleCodeSubmit(initialGuestCode);
    }
  }, [initialGuestCode]);

  // Lock timer countdown
  useEffect(() => {
    if (lockRemainingSec > 0) {
      const timer = setInterval(() => {
        setLockRemainingSec((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAuthError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockRemainingSec]);

  const handleCodeSubmit = (overrideCode?: string) => {
    const codeToTest = overrideCode || accessCode;
    if (!codeToTest.trim()) {
      setAuthError('Por favor ingresa tu código de acceso.');
      return;
    }

    const result = storageService.validateAccessCode(event.id, codeToTest);
    if (result.success && result.guest) {
      setAuthenticatedGuest(result.guest);
      setAuthError(null);
      setConfirmedPasses(result.guest.confirmedPasses || result.guest.authorizedPasses || 1);
      setRsvpStatus(result.guest.rsvpStatus === 'declined' ? 'declined' : 'confirmed');
      setCompanionNames(
        result.guest.companionNames?.length
          ? result.guest.companionNames
          : Array(result.guest.authorizedPasses - 1).fill('')
      );
      setDietary(result.guest.dietaryRestrictions || '');
      setMessage(result.guest.guestMessage || '');
    } else {
      setAuthError(result.error || 'Código de acceso no válido.');
      if (result.lockedUntil && result.lockedUntil > Date.now()) {
        setIsLocked(true);
        setLockRemainingSec(Math.ceil((result.lockedUntil - Date.now()) / 1000));
      }
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedGuest) return;

    setRsvpSubmitting(true);
    const result = storageService.submitRsvp(
      authenticatedGuest.id,
      rsvpStatus,
      rsvpStatus === 'confirmed' ? confirmedPasses : 0,
      companionNames,
      dietary,
      message
    );

    setTimeout(() => {
      setRsvpSubmitting(false);
      if (result.success && result.guest) {
        setAuthenticatedGuest(result.guest);
        setRsvpSuccessMessage(result.message);

        if (rsvpStatus === 'confirmed') {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
            colors: [event.design.accentColor, '#ffd700', '#ffffff'],
          });
        }
      }
    }, 400);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClabeId(id);
    setTimeout(() => setCopiedClabeId(null), 2500);
  };

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`${event.welcomeMessage}\n\nUbicación: ${event.location.venueName}`);
    const location = encodeURIComponent(`${event.location.venueName}, ${event.location.address}, ${event.location.city}`);
    const startIso = `${event.eventDate.replace(/-/g, '')}T${event.startTime.replace(':', '')}00`;
    const endIso = event.endTime
      ? `${event.eventDate.replace(/-/g, '')}T${event.endTime.replace(':', '')}00`
      : `${event.eventDate.replace(/-/g, '')}T235900`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  };

  // Font family helper
  const getFontFamilyClass = () => {
    switch (event.design.fontFamily) {
      case 'royal':
        return 'font-serif font-display';
      case 'display':
        return 'font-serif';
      case 'script':
        return 'font-serif italic';
      default:
        return 'font-serif';
    }
  };

  // 1. GATEKEEPER: Code lock screen if not authenticated
  if (!authenticatedGuest) {
    const guestList = storageService.getGuestsByEvent(event.id);

    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-950 to-black text-stone-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-amber-500/10 blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="relative z-10 max-w-4xl w-full mx-auto flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">
              Acceso Privado & Seguro
            </span>
          </div>
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              Volver al Panel
            </button>
          )}
        </header>

        {/* Center Access Card */}
        <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-stone-900/80 backdrop-blur-xl border border-stone-800 shadow-2xl text-center"
          >
            {/* Lock emblem */}
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 bg-gradient-to-br from-amber-400/20 to-amber-600/5 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-amber-300" />
            </div>

            <p className="text-xs uppercase tracking-widest text-amber-400/90 font-semibold mb-2">
              Invitación Exclusiva
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 tracking-tight">
              {event.title}
            </h1>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              ¡Tenemos una invitación especial para ti! Ingresa tu código de acceso personal o familiar para descubrir todos los detalles.
            </p>

            {/* Error message */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-700/50 text-rose-200 text-xs flex items-center gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </motion.div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCodeSubmit();
              }}
              className="space-y-4"
            >
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={accessCode}
                  disabled={isLocked}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Ej. AC-001 ó BODA-VIP"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/50 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono tracking-wider uppercase text-center text-lg disabled:opacity-50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLocked || !accessCode.trim()}
                className="w-full py-3.5 px-6 rounded-xl font-medium text-stone-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Acceder a la Invitación</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo Quick-Selector */}
            <div className="mt-8 pt-6 border-t border-stone-800 text-left">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2.5 font-medium">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Códigos registrados para demostración:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {guestList.slice(0, 4).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setAccessCode(g.accessCode);
                      handleCodeSubmit(g.accessCode);
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-200/90 border border-stone-700 hover:border-amber-500/50 transition-colors cursor-pointer"
                  >
                    <span className="font-mono font-semibold text-white">{g.accessCode}</span>
                    <span className="text-[10px] text-stone-400 ml-1.5">({g.name.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center text-xs text-stone-500 py-4">
          Aurea · Sistema de Invitaciones Privadas con Cifrado de Acceso
        </footer>
      </div>
    );
  }

  // 2. ENVELOPE OPENING ANIMATION: If authenticated but hasn't opened envelope yet
  if (!hasOpenedEnvelope) {
    return (
      <EnvelopeCover
        event={event}
        guest={authenticatedGuest}
        onOpen={() => setHasOpenedEnvelope(true)}
      />
    );
  }

  // 3. FULL REVEALED INVITATION
  const design = event.design;
  const isDarkTheme = design.backgroundColor.startsWith('#0') || design.backgroundColor.startsWith('#1');

  return (
    <div
      className={`min-h-screen relative selection:bg-amber-200 selection:text-amber-950 transition-colors duration-500 ${
        isDarkTheme ? 'text-stone-100' : 'text-stone-900'
      }`}
      style={{
        backgroundColor: design.backgroundColor,
      }}
    >
      {/* Discreet floating music player */}
      {design.musicEnabled && (
        <MusicPlayer
          trackTitle={design.musicTrackTitle}
          musicUrl={design.musicUrl}
          accentColor={design.accentColor}
        />
      )}

      {/* Floating Admin Return Bar */}
      {onBackToAdmin && (
        <div className="fixed top-4 right-4 z-40">
          <button
            onClick={onBackToAdmin}
            className="px-3.5 py-2 rounded-full text-xs font-medium bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-md border border-white/20 shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Volver a Administración</span>
          </button>
        </div>
      )}

      {/* Background Subtle Pattern */}
      {design.backgroundPattern === 'botanical' && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
      )}
      {design.backgroundPattern === 'gold_dust' && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:20px_20px]" />
      )}

      {/* SECTION 1: HERO & COVER */}
      {design.sectionsVisibility.hero && (
        <section className="relative min-h-[92vh] flex flex-col justify-between items-center text-center p-6 pb-12 overflow-hidden">
          {/* Background Hero Image with Scrim */}
          {design.coverImageUrl && (
            <div className="absolute inset-0 z-0">
              <img
                src={design.coverImageUrl}
                alt={event.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-[0.78]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>
          )}

          {/* Top Decorative Header */}
          <div className="relative z-10 pt-10">
            <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-amber-200/95 font-semibold px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/30">
              {event.eventType.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Center Main Names & Title */}
          <div className="relative z-10 max-w-3xl mx-auto my-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className={`text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-4 leading-tight ${getFontFamilyClass()}`}
            >
              {event.hostNames}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-xl text-stone-200 font-serif italic max-w-xl mx-auto leading-relaxed"
            >
              &ldquo;{event.welcomeMessage}&rdquo;
            </motion.p>
          </div>

          {/* Bottom Date & Venue Strip */}
          <div className="relative z-10 w-full max-w-xl mx-auto">
            <div className="p-4 sm:p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 text-white flex flex-col sm:flex-row items-center justify-around gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-300 shrink-0" />
                <div className="text-left">
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider">Fecha</p>
                  <p className="text-sm font-semibold capitalize">
                    {new Date(event.eventDate + 'T12:00:00').toLocaleDateString('es-MX', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-white/20" />

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-300 shrink-0" />
                <div className="text-left">
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider">Hora</p>
                  <p className="text-sm font-semibold">{event.startTime} hrs</p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-white/20" />

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-300 shrink-0" />
                <div className="text-left">
                  <p className="text-[11px] text-stone-400 uppercase tracking-wider">Lugar</p>
                  <p className="text-sm font-semibold truncate max-w-[140px]">
                    {event.location.venueName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 2: PERSONALIZED GUEST PASS & WELCOME */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-xl text-stone-900 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">
                Pase de Entrada Reservado
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-0.5">
                {authenticatedGuest.name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  {authenticatedGuest.authorizedPasses}{' '}
                  {authenticatedGuest.authorizedPasses === 1 ? 'Pase Personal' : 'Pases Autorizados'}
                </span>
              </span>
              {authenticatedGuest.tableNumber && (
                <span className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
                  {authenticatedGuest.tableNumber}
                </span>
              )}
            </div>
          </div>

          <div className="pt-5 text-sm sm:text-base text-stone-700 leading-relaxed font-serif">
            {event.description}
          </div>

          {/* Parents & Honored Godparents if present */}
          {event.specialPersons && (
            <div className="mt-6 pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {event.specialPersons.parentsBride && (
                <div>
                  <p className="font-semibold text-amber-800 uppercase tracking-wider text-[10px]">
                    Padres de la Novia / Festejado
                  </p>
                  <p className="text-stone-700 mt-0.5 font-medium">
                    {event.specialPersons.parentsBride}
                  </p>
                </div>
              )}
              {event.specialPersons.parentsGroom && (
                <div>
                  <p className="font-semibold text-amber-800 uppercase tracking-wider text-[10px]">
                    Padres del Novio
                  </p>
                  <p className="text-stone-700 mt-0.5 font-medium">
                    {event.specialPersons.parentsGroom}
                  </p>
                </div>
              )}
              {event.specialPersons.godparents && (
                <div className="sm:col-span-2">
                  <p className="font-semibold text-amber-800 uppercase tracking-wider text-[10px]">
                    Padrinos de Honor
                  </p>
                  <p className="text-stone-700 mt-0.5 font-medium">
                    {event.specialPersons.godparents}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {/* SECTION 3: COUNTDOWN TIMER */}
      {design.sectionsVisibility.countdown && (
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold mb-3">
            Cuenta Regresiva
          </p>
          <h3 className="text-3xl font-serif font-bold mb-6">
            Esperando el Gran Momento
          </h3>
          <CountdownTimer
            targetDate={event.eventDate}
            startTime={event.startTime}
            endTime={event.endTime}
            accentColor={design.accentColor}
          />
        </section>
      )}

      {/* SECTION 4: ITINERARY / TIMELINE */}
      {design.sectionsVisibility.schedule && event.timeline.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold mb-2">
              Itinerario del Evento
            </p>
            <h3 className="text-3xl font-serif font-bold">
              Programa de Celebración
            </h3>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-300/60 space-y-8 ml-4 sm:ml-8">
            {event.timeline.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Node icon dot */}
                <div
                  className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow flex items-center justify-center text-xs text-white"
                  style={{ backgroundColor: design.accentColor }}
                >
                  <Clock className="w-3.5 h-3.5" />
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-xs font-bold text-amber-800 tabular-nums">
                    {item.time}
                  </span>
                  <h4 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="text-xs sm:text-sm text-stone-600 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: LOCATION & MAP */}
      {design.sectionsVisibility.location && (
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold mb-2">
              Ubicación
            </p>
            <h3 className="text-3xl font-serif font-bold">
              ¿Cómo Llegar?
            </h3>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-lg text-stone-900">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="space-y-2 max-w-md">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Lugar de Recepción
                </span>
                <h4 className="text-2xl font-serif font-bold text-stone-900">
                  {event.location.venueName}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {event.location.address}, {event.location.city}
                </p>
                {event.location.additionalNotes && (
                  <p className="text-xs text-amber-900/80 bg-amber-50 p-3 rounded-xl border border-amber-200/60 mt-3">
                    ℹ️ {event.location.additionalNotes}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <a
                  href={event.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-medium text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={generateGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl font-medium text-xs sm:text-sm text-stone-800 bg-amber-100 hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-amber-700" />
                  <span>Agregar al Calendario</span>
                </a>
              </div>
            </div>

            {/* Embedded interactive map if available */}
            {event.location.embedMapUrl && (
              <div className="mt-6 rounded-2xl overflow-hidden border border-stone-200 aspect-[16/9] max-h-72 w-full shadow-inner">
                <iframe
                  title="Ubicación del evento"
                  src={event.location.embedMapUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 6: PHOTO GALLERY */}
      {design.sectionsVisibility.gallery && event.gallery.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold mb-2">
              Galería de Recuerdos
            </p>
            <h3 className="text-3xl font-serif font-bold">
              Nuestra Historia en Imágenes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {event.gallery.map((photo) => (
              <motion.div
                key={photo.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedPhoto(photo.url)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md bg-stone-100 border border-stone-200"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Fotografía del evento'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-xs text-white font-medium">
                    {photo.caption || 'Ver fotografía'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lightbox Modal */}
          <AnimatePresence>
            {selectedPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPhoto(null)}
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-pointer"
              >
                <div className="relative max-w-4xl max-h-[90vh]">
                  <img
                    src={selectedPhoto}
                    alt="Fotografía ampliada"
                    referrerPolicy="no-referrer"
                    className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain mx-auto"
                  />
                  <p className="text-center text-xs text-stone-400 mt-3 font-sans">
                    Haz clic en cualquier parte para cerrar
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* SECTION 7: DRESS CODE */}
      {design.sectionsVisibility.dressCode && event.dressCode && (
        <section className="py-12 px-4 sm:px-6 max-w-3xl mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-stone-200 shadow-lg text-center text-stone-900">
            <Shirt className="w-8 h-8 text-amber-700 mx-auto mb-3" />
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold mb-1">
              Código de Vestimenta
            </p>
            <h4 className="text-2xl font-serif font-bold capitalize mb-3">
              {event.dressCode.type.replace('_', ' ')}
            </h4>
            <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
              {event.dressCode.details}
            </p>

            {/* Suggested color palette */}
            {event.dressCode.suggestedColors && event.dressCode.suggestedColors.length > 0 && (
              <div className="mt-6 pt-5 border-t border-stone-200">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                  Paleta de Color Sugerida
                </p>
                <div className="flex items-center justify-center gap-3">
                  {event.dressCode.suggestedColors.map((hex, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-md border-2 border-white transition-transform hover:scale-110"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 8: GIFT REGISTRY (MESA DE REGALOS / LLUVIA DE SOBRES) */}
      {design.sectionsVisibility.giftRegistry && event.giftRegistries.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Gift className="w-8 h-8 text-amber-700 mx-auto mb-2" />
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold mb-1">
              Mesa de Regalos & Agradecimiento
            </p>
            <h3 className="text-3xl font-serif font-bold">
              Muestras de Cariño
            </h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto mt-2">
              Tu presencia es nuestro mayor anhelo. Si deseas tener un detalle con nosotros, ponemos a tu disposición las siguientes opciones:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.giftRegistries.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm hover:shadow-md transition-shadow text-stone-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      {item.type === 'bank_transfer' ? 'Lluvia de Sobres / Transferencia' : 'Tienda Departamental'}
                    </span>
                  </div>
                  <h4 className="text-lg font-serif font-bold">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-stone-600 mt-1">{item.description}</p>
                  )}

                  {/* Bank transfer details */}
                  {item.clabe && (
                    <div className="mt-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                      {item.bankName && (
                        <p className="text-stone-500">
                          Banco: <span className="font-semibold text-stone-800">{item.bankName}</span>
                        </p>
                      )}
                      {item.beneficiaryName && (
                        <p className="text-stone-500">
                          Beneficiario:{' '}
                          <span className="font-semibold text-stone-800">{item.beneficiaryName}</span>
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">CLABE Interbancaria</p>
                          <p className="font-mono font-bold text-stone-900 text-sm tracking-wider">
                            {item.clabe}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.clabe!, item.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedClabeId === item.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* External store link */}
                {item.externalUrl && (
                  <div className="mt-5 pt-3 border-t border-stone-100">
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 transition-colors"
                    >
                      <span>Ir a la mesa de regalos en línea</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 9: RSVP FORM (CONFIRMACIÓN DE ASISTENCIA) */}
      {design.sectionsVisibility.rsvp && (
        <section id="rsvp-section" className="py-14 px-4 sm:px-6 max-w-2xl mx-auto">
          <div className="p-6 sm:p-10 rounded-3xl bg-white/95 backdrop-blur-xl border border-amber-300/80 shadow-2xl text-stone-900">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-bold mb-1 block">
                RSVP · Confirmación
              </span>
              <h3 className="text-3xl font-serif font-bold text-stone-900">
                Confirma tu Asistencia
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2">
                Favor de confirmar antes del{' '}
                <span className="font-semibold text-amber-900">
                  {new Date(event.rsvpDeadline + 'T12:00:00').toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                .
              </p>
            </div>

            {rsvpSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm flex items-start gap-3 shadow-sm"
              >
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Respuesta Registrada</p>
                  <p className="text-xs text-emerald-800 mt-0.5">{rsvpSuccessMessage}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleRsvpSubmit} className="space-y-6">
              {/* Decision Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  ¿Podrás acompañarnos?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRsvpStatus('confirmed')}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      rsvpStatus === 'confirmed'
                        ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-md'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Sí, asistiré con gusto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRsvpStatus('declined')}
                    className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      rsvpStatus === 'declined'
                        ? 'bg-stone-800 text-white border-stone-900 shadow-md'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>Lamentablemente no</span>
                  </button>
                </div>
              </div>

              {rsvpStatus === 'confirmed' && (
                <>
                  {/* Confirmed Passes selector */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                        Número de Asistentes
                      </label>
                      <span className="text-xs text-amber-800 font-medium">
                        Máximo autorizado: {authenticatedGuest.authorizedPasses} persona(s)
                      </span>
                    </div>

                    <select
                      value={confirmedPasses}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        setConfirmedPasses(count);
                        setCompanionNames((prev) => {
                          const updated = [...prev];
                          while (updated.length < count - 1) updated.push('');
                          return updated.slice(0, count - 1);
                        });
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                    >
                      {Array.from({ length: authenticatedGuest.authorizedPasses }, (_, i) => i + 1).map(
                        (num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'persona (Solo yo)' : `personas`}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Companion Names (if more than 1 pass) */}
                  {confirmedPasses > 1 && (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                        Nombres de tus Acompañantes
                      </label>
                      {Array.from({ length: confirmedPasses - 1 }, (_, i) => (
                        <input
                          key={i}
                          type="text"
                          required
                          value={companionNames[i] || ''}
                          onChange={(e) => {
                            const newNames = [...companionNames];
                            newNames[i] = e.target.value;
                            setCompanionNames(newNames);
                          }}
                          placeholder={`Nombre completo del acompañante #${i + 1}`}
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 text-sm"
                        />
                      ))}
                    </div>
                  )}

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Alergias o Preferencias Alimenticias (Opcional)
                    </label>
                    <input
                      type="text"
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      placeholder="Ej. 1 Vegetariano, intolerancia al gluten, sin mariscos"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                </>
              )}

              {/* Personal message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Mensaje para los Anfitriones
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe unas palabras de felicitación o buenos deseos..."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 text-sm resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={rsvpSubmitting}
                className="w-full py-4 px-6 rounded-xl font-serif font-bold text-stone-950 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 hover:from-amber-200 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-stone-950" />
                <span>
                  {rsvpSubmitting ? 'Enviando Confirmación...' : 'Enviar Confirmación de Asistencia'}
                </span>
              </button>
            </form>
          </div>
        </section>
      )}

      {/* SECTION 10: FAREWELL MESSAGE */}
      {design.sectionsVisibility.farewell && (
        <footer className="py-16 px-4 text-center border-t border-stone-200/50 mt-10">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-0.5 bg-amber-400 mx-auto" />
            <h4 className="text-2xl font-serif italic text-stone-800">
              {event.farewellMessage}
            </h4>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold pt-2">
              {event.hostNames} · {event.eventDate.substring(0, 4)}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
