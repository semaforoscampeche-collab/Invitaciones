import { INITIAL_EVENTS, INITIAL_GUESTS } from '../data/initialData';
import { AccessAttemptLog, EventItem, GuestItem, RSVPStatus } from '../types';

const STORAGE_KEYS = {
  EVENTS: 'aurea_events_v1',
  GUESTS: 'aurea_guests_v1',
  LOGS: 'aurea_access_logs_v1',
  ATTEMPTS: 'aurea_failed_attempts_v1',
};

class StorageService {
  private events: EventItem[] = [];
  private guests: GuestItem[] = [];
  private logs: AccessAttemptLog[] = [];
  private failedAttempts: Record<string, { count: number; lockedUntil: number }> = {};

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const storedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
      const storedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);

      this.events = storedEvents ? JSON.parse(storedEvents) : [...INITIAL_EVENTS];
      this.guests = storedGuests ? JSON.parse(storedGuests) : [...INITIAL_GUESTS];
      this.logs = storedLogs ? JSON.parse(storedLogs) : [];

      if (!storedEvents) {
        this.saveEvents();
      }
      if (!storedGuests) {
        this.saveGuests();
      }
    } catch {
      this.events = [...INITIAL_EVENTS];
      this.guests = [...INITIAL_GUESTS];
    }
  }

  private saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    } catch {
      // Storage full or unavailable
    }
  }

  private saveGuests() {
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    } catch {
      // Storage full or unavailable
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(this.logs.slice(-200)));
    } catch {
      // ignore
    }
  }

  // --- EVENTS ---
  getEvents(): EventItem[] {
    return [...this.events];
  }

  getEventById(id: string): EventItem | undefined {
    return this.events.find((e) => e.id === id);
  }

  getEventBySlug(slug: string): EventItem | undefined {
    return this.events.find((e) => e.slug.toLowerCase() === slug.toLowerCase());
  }

  saveEvent(event: EventItem): EventItem {
    const index = this.events.findIndex((e) => e.id === event.id);
    const updated = {
      ...event,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      this.events[index] = updated;
    } else {
      this.events.unshift(updated);
    }
    this.saveEvents();
    return updated;
  }

  deleteEvent(id: string): boolean {
    this.events = this.events.filter((e) => e.id !== id);
    this.guests = this.guests.filter((g) => g.eventId !== id);
    this.saveEvents();
    this.saveGuests();
    return true;
  }

  duplicateEvent(id: string): EventItem | null {
    const original = this.getEventById(id);
    if (!original) return null;

    const newId = `evt-${Date.now()}`;
    const newSlug = `${original.slug}-copia-${Math.random().toString(36).substring(2, 6)}`;
    const duplicated: EventItem = {
      ...original,
      id: newId,
      slug: newSlug,
      title: `${original.title} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.events.unshift(duplicated);
    this.saveEvents();

    // Duplicate guests
    const originalGuests = this.getGuestsByEvent(id);
    const duplicatedGuests = originalGuests.map((g, i) => ({
      ...g,
      id: `gst-${Date.now()}-${i}`,
      eventId: newId,
      accessCode: `${g.accessCode}-C`,
      hasViewed: false,
      firstViewedAt: undefined,
      lastViewedAt: undefined,
      rsvpStatus: 'pending' as RSVPStatus,
      confirmedPasses: 0,
      companionNames: [],
      rsvpSubmittedAt: undefined,
      createdAt: new Date().toISOString(),
    }));

    this.guests.push(...duplicatedGuests);
    this.saveGuests();

    return duplicated;
  }

  toggleEventStatus(id: string): boolean {
    const evt = this.getEventById(id);
    if (!evt) return false;
    evt.isActive = !evt.isActive;
    this.saveEvents();
    return evt.isActive;
  }

  // --- GUESTS ---
  getGuests(): GuestItem[] {
    return [...this.guests];
  }

  getGuestsByEvent(eventId: string): GuestItem[] {
    return this.guests.filter((g) => g.eventId === eventId);
  }

  getGuestById(id: string): GuestItem | undefined {
    return this.guests.find((g) => g.id === id);
  }

  saveGuest(guest: GuestItem): GuestItem {
    const index = this.guests.findIndex((g) => g.id === guest.id);
    if (index >= 0) {
      this.guests[index] = guest;
    } else {
      this.guests.push(guest);
    }
    this.saveGuests();
    return guest;
  }

  deleteGuest(id: string): boolean {
    this.guests = this.guests.filter((g) => g.id !== id);
    this.saveGuests();
    return true;
  }

  bulkAddGuests(eventId: string, newGuests: Partial<GuestItem>[]): number {
    let addedCount = 0;
    const now = new Date().toISOString();

    for (const g of newGuests) {
      if (!g.name) continue;
      const id = `gst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      const code = g.accessCode?.trim().toUpperCase() || `INV-${randomCode}`;

      const fullGuest: GuestItem = {
        id,
        eventId,
        name: g.name.trim(),
        familyOrGroup: g.familyOrGroup?.trim() || 'Invitados',
        phone: g.phone?.trim() || '',
        email: g.email?.trim() || '',
        accessCode: code,
        authorizedPasses: Number(g.authorizedPasses) || 1,
        isVip: Boolean(g.isVip),
        tableNumber: g.tableNumber?.trim() || '',
        hasViewed: false,
        rsvpStatus: 'pending',
        confirmedPasses: 0,
        companionNames: [],
        createdAt: now,
      };

      this.guests.push(fullGuest);
      addedCount++;
    }

    this.saveGuests();
    return addedCount;
  }

  // --- AUTHENTICATION & ACCESS VERIFICATION ---
  validateAccessCode(
    eventId: string,
    rawCode: string
  ): {
    success: boolean;
    guest?: GuestItem;
    error?: string;
    lockedUntil?: number;
    remainingAttempts?: number;
  } {
    const cleanCode = rawCode.trim().toUpperCase();
    const lockKey = `${eventId}_client`;
    const now = Date.now();

    // Check lock
    const attemptData = this.failedAttempts[lockKey];
    if (attemptData && attemptData.lockedUntil > now) {
      const waitSeconds = Math.ceil((attemptData.lockedUntil - now) / 1000);
      return {
        success: false,
        error: `Acceso bloqueado por seguridad tras múltiples intentos. Espera ${waitSeconds} segundos.`,
        lockedUntil: attemptData.lockedUntil,
      };
    }

    // Match code for this event
    const guest = this.guests.find(
      (g) => g.eventId === eventId && g.accessCode.trim().toUpperCase() === cleanCode
    );

    if (guest) {
      // Reset failed attempts on success
      delete this.failedAttempts[lockKey];

      // Mark as viewed
      const timestamp = new Date().toISOString();
      if (!guest.hasViewed) {
        guest.hasViewed = true;
        guest.firstViewedAt = timestamp;
      }
      guest.lastViewedAt = timestamp;
      this.saveGuests();

      // Log success
      this.logs.push({
        id: `log-${Date.now()}`,
        eventId,
        guestId: guest.id,
        codeAttempted: cleanCode,
        success: true,
        timestamp,
      });
      this.saveLogs();

      return { success: true, guest };
    } else {
      // Register failed attempt
      const prev = this.failedAttempts[lockKey] || { count: 0, lockedUntil: 0 };
      const newCount = prev.count + 1;
      let lockedUntil = 0;
      let error = 'El código de acceso no es válido para este evento.';

      if (newCount >= 5) {
        lockedUntil = now + 60 * 1000; // 60 seconds lockout
        error = 'Demasiados intentos erróneos. Por seguridad tu acceso ha sido suspendido por 60 segundos.';
      } else {
        const remaining = 5 - newCount;
        error = `Código incorrecto. Te quedan ${remaining} intento(s) antes del bloqueo temporal.`;
      }

      this.failedAttempts[lockKey] = {
        count: newCount,
        lockedUntil,
      };

      // Log failure
      this.logs.push({
        id: `log-${Date.now()}`,
        eventId,
        codeAttempted: cleanCode,
        success: false,
        timestamp: new Date().toISOString(),
      });
      this.saveLogs();

      return {
        success: false,
        error,
        remainingAttempts: Math.max(0, 5 - newCount),
        lockedUntil,
      };
    }
  }

  // --- SUBMIT RSVP ---
  submitRsvp(
    guestId: string,
    status: RSVPStatus,
    confirmedPasses: number,
    companionNames: string[],
    dietaryRestrictions?: string,
    guestMessage?: string
  ): { success: boolean; message: string; guest?: GuestItem } {
    const guest = this.getGuestById(guestId);
    if (!guest) {
      return { success: false, message: 'Invitado no encontrado.' };
    }

    if (status === 'confirmed' && confirmedPasses > guest.authorizedPasses) {
      return {
        success: false,
        message: `El número máximo de pases autorizados para tu invitación es ${guest.authorizedPasses}.`,
      };
    }

    guest.rsvpStatus = status;
    guest.confirmedPasses = status === 'confirmed' ? Math.max(1, confirmedPasses) : 0;
    guest.companionNames = status === 'confirmed' ? companionNames.filter((n) => n.trim().length > 0) : [];
    guest.dietaryRestrictions = dietaryRestrictions?.trim() || '';
    guest.guestMessage = guestMessage?.trim() || '';
    guest.rsvpSubmittedAt = new Date().toISOString();

    this.saveGuests();

    return {
      success: true,
      message:
        status === 'confirmed'
          ? '¡Confirmación registrada con éxito! Nos honra contar con tu presencia.'
          : 'Agradecemos que nos hayas avisado. Te extrañaremos mucho en nuestra celebración.',
      guest,
    };
  }

  // --- STATISTICS FOR EVENT ---
  getEventStats(eventId: string) {
    const guests = this.getGuestsByEvent(eventId);
    const totalInvitations = guests.length;
    const openedInvitations = guests.filter((g) => g.hasViewed).length;
    const unopenedInvitations = totalInvitations - openedInvitations;

    const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'confirmed');
    const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');
    const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending');

    const totalAuthorizedPeople = guests.reduce((sum, g) => sum + g.authorizedPasses, 0);
    const totalConfirmedPeople = confirmedGuests.reduce((sum, g) => sum + g.confirmedPasses, 0);
    const totalDeclinedPeople = declinedGuests.reduce((sum, g) => sum + g.authorizedPasses, 0);
    const totalPendingPeople = pendingGuests.reduce((sum, g) => sum + g.authorizedPasses, 0);

    return {
      totalInvitations,
      openedInvitations,
      unopenedInvitations,
      confirmedCount: confirmedGuests.length,
      declinedCount: declinedGuests.length,
      pendingCount: pendingGuests.length,
      totalAuthorizedPeople,
      totalConfirmedPeople,
      totalDeclinedPeople,
      totalPendingPeople,
      confirmationRate: totalInvitations > 0 ? Math.round((confirmedGuests.length / totalInvitations) * 100) : 0,
    };
  }

  // Reset to factory demo data
  resetAll() {
    this.events = [...INITIAL_EVENTS];
    this.guests = [...INITIAL_GUESTS];
    this.logs = [];
    this.failedAttempts = {};
    this.saveEvents();
    this.saveGuests();
    this.saveLogs();
  }
}

export const storageService = new StorageService();
