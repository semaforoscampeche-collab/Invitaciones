export type EventType =
  | 'boda'
  | 'xv_anos'
  | 'cumpleanos'
  | 'bautizo'
  | 'primera_comunion'
  | 'graduacion'
  | 'aniversario'
  | 'baby_shower'
  | 'empresarial'
  | 'otro';

export type TemplateStyle =
  | 'elegante_minimalista'
  | 'floral_romantico'
  | 'moderno_sofisticado'
  | 'dorado_lujo'
  | 'infantil_colorido'
  | 'vintage'
  | 'playero_tropical'
  | 'princesas'
  | 'xv_elegante'
  | 'boda_clasica'
  | 'cumpleanos_moderno';

export type DressCodeType =
  | 'rigurosa_etiqueta'
  | 'formal'
  | 'formal_playa'
  | 'cocktail'
  | 'casual_elegante'
  | 'tematico'
  | 'color_especifico';

export interface EventLocation {
  venueName: string;
  address: string;
  city: string;
  mapsUrl: string;
  embedMapUrl?: string;
  latitude?: number;
  longitude?: number;
  additionalNotes?: string;
}

export interface GiftRegistryItem {
  id: string;
  type: 'store' | 'bank_transfer' | 'envelope' | 'wishlist';
  title: string;
  description?: string;
  accountNumber?: string;
  clabe?: string;
  bankName?: string;
  beneficiaryName?: string;
  externalUrl?: string;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  isCover?: boolean;
}

export interface InvitationDesign {
  template: TemplateStyle;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: 'serif' | 'display' | 'royal' | 'sans' | 'script';
  fontSizeScale: 'small' | 'medium' | 'large';
  backgroundPattern: 'none' | 'botanical' | 'geometric' | 'stars' | 'damask' | 'gold_dust';
  envelopeColor: string;
  waxSealColor: string;
  waxSealSymbol: string;
  coverImageUrl: string;
  musicEnabled: boolean;
  musicTrackTitle?: string;
  musicUrl?: string;
  sectionsVisibility: {
    hero: boolean;
    welcomeMessage: boolean;
    countdown: boolean;
    schedule: boolean;
    location: boolean;
    gallery: boolean;
    dressCode: boolean;
    giftRegistry: boolean;
    rsvp: boolean;
    farewell: boolean;
  };
}

export interface SpecialPersons {
  parentsBride?: string;
  parentsGroom?: string;
  godparents?: string;
  honoredGuests?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  hostNames: string;
  eventType: EventType;
  ageCelebrating?: number;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  timezone: string;
  location: EventLocation;
  welcomeMessage: string;
  description: string;
  farewellMessage: string;
  dressCode: {
    type: DressCodeType;
    details: string;
    suggestedColors?: string[];
  };
  specialPersons?: SpecialPersons;
  timeline: TimelineItem[];
  giftRegistries: GiftRegistryItem[];
  gallery: GalleryPhoto[];
  design: InvitationDesign;
  rsvpDeadline: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RSVPStatus = 'pending' | 'confirmed' | 'declined';

export interface GuestAccessCode {
  id: string;
  code: string;
  isHashed: boolean;
  maxAttempts: number;
  currentAttempts: number;
  isRevoked: boolean;
  expiresAt?: string;
}

export interface GuestItem {
  id: string;
  eventId: string;
  name: string;
  familyOrGroup?: string;
  phone?: string;
  email?: string;
  accessCode: string;
  authorizedPasses: number; // Maximum persons allowed
  isVip: boolean;
  tableNumber?: string;
  hasViewed: boolean;
  firstViewedAt?: string;
  lastViewedAt?: string;
  rsvpStatus: RSVPStatus;
  confirmedPasses: number;
  companionNames: string[];
  dietaryRestrictions?: string;
  guestMessage?: string;
  rsvpSubmittedAt?: string;
  createdAt: string;
}

export interface AccessAttemptLog {
  id: string;
  eventId: string;
  guestId?: string;
  codeAttempted: string;
  success: boolean;
  timestamp: string;
  ipAddress?: string;
}
