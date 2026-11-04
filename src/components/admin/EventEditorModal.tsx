import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Users,
  Shirt,
  Gift,
  Plus,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { EventItem, EventType, DressCodeType, TimelineItem, GiftRegistryItem } from '../../types';
import { storageService } from '../../services/storage';

interface EventEditorModalProps {
  initialEvent?: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (event: EventItem) => void;
}

export const EventEditorModal: React.FC<EventEditorModalProps> = ({
  initialEvent,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [activeStep, setActiveStep] = useState<'general' | 'date_place' | 'family' | 'timeline' | 'gifts'>('general');

  // Form State
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [slug, setSlug] = useState(initialEvent?.slug || '');
  const [hostNames, setHostNames] = useState(initialEvent?.hostNames || '');
  const [eventType, setEventType] = useState<EventType>(initialEvent?.eventType || 'boda');
  const [ageCelebrating, setAgeCelebrating] = useState<number | undefined>(initialEvent?.ageCelebrating);
  const [eventDate, setEventDate] = useState(initialEvent?.eventDate || '2026-12-15');
  const [startTime, setStartTime] = useState(initialEvent?.startTime || '18:00');
  const [endTime, setEndTime] = useState(initialEvent?.endTime || '02:00');
  const [rsvpDeadline, setRsvpDeadline] = useState(initialEvent?.rsvpDeadline || '2026-11-30');

  // Location
  const [venueName, setVenueName] = useState(initialEvent?.location.venueName || '');
  const [address, setAddress] = useState(initialEvent?.location.address || '');
  const [city, setCity] = useState(initialEvent?.location.city || 'Ciudad de México');
  const [mapsUrl, setMapsUrl] = useState(initialEvent?.location.mapsUrl || 'https://maps.google.com');
  const [additionalNotes, setAdditionalNotes] = useState(initialEvent?.location.additionalNotes || '');

  // Messages
  const [welcomeMessage, setWelcomeMessage] = useState(
    initialEvent?.welcomeMessage || '¡Acompáñanos a celebrar este momento tan especial en nuestras vidas!'
  );
  const [description, setDescription] = useState(
    initialEvent?.description || 'Queremos compartir contigo la alegría de esta ocasión única.'
  );
  const [farewellMessage, setFarewellMessage] = useState(
    initialEvent?.farewellMessage || '¡Tu presencia hace este día inolvidable!'
  );

  // Dress Code
  const [dressType, setDressType] = useState<DressCodeType>(initialEvent?.dressCode.type || 'formal');
  const [dressDetails, setDressDetails] = useState(
    initialEvent?.dressCode.details || 'Formal. Mujeres vestido de fiesta, hombres traje oscuro.'
  );

  // Special Persons
  const [parentsBride, setParentsBride] = useState(initialEvent?.specialPersons?.parentsBride || '');
  const [parentsGroom, setParentsGroom] = useState(initialEvent?.specialPersons?.parentsGroom || '');
  const [godparents, setGodparents] = useState(initialEvent?.specialPersons?.godparents || '');

  // Timeline & Gifts
  const [timeline, setTimeline] = useState<TimelineItem[]>(
    initialEvent?.timeline || [
      { id: '1', time: '18:00 hrs', title: 'Recepción y Cóctel' },
      { id: '2', time: '19:30 hrs', title: 'Cena de Gala' },
      { id: '3', time: '21:00 hrs', title: 'Apertura de Pista' },
    ]
  );
  const [giftRegistries, setGiftRegistries] = useState<GiftRegistryItem[]>(
    initialEvent?.giftRegistries || [
      {
        id: '1',
        type: 'bank_transfer',
        title: 'Transferencia Bancaria',
        bankName: 'BBVA',
        clabe: '012180001234567890',
        beneficiaryName: 'Nombre del Anfitrión',
      },
    ]
  );

  if (!isOpen) return null;

  const handleAutoSlug = (text: string) => {
    setHostNames(text);
    if (!initialEvent) {
      const generatedSlug = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug || 'nuevo-evento');
      setTitle(`Celebración: ${text}`);
    }
  };

  const handleAddTimeline = () => {
    setTimeline([
      ...timeline,
      {
        id: `t-${Date.now()}`,
        time: '20:00 hrs',
        title: 'Nuevo Momento Especial',
      },
    ]);
  };

  const handleRemoveTimeline = (id: string) => {
    setTimeline(timeline.filter((t) => t.id !== id));
  };

  const handleAddGift = () => {
    setGiftRegistries([
      ...giftRegistries,
      {
        id: `g-${Date.now()}`,
        type: 'store',
        title: 'Mesa de Regalos Liverpool',
        description: 'No. de Evento: 12345',
        externalUrl: 'https://liverpool.com.mx',
      },
    ]);
  };

  const handleRemoveGift = (id: string) => {
    setGiftRegistries(giftRegistries.filter((g) => g.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventToSave: EventItem = {
      id: initialEvent?.id || `evt-${Date.now()}`,
      slug: slug.trim().toLowerCase() || `evento-${Date.now()}`,
      title: title.trim() || 'Celebración Especial',
      hostNames: hostNames.trim() || 'Anfitriones',
      eventType,
      ageCelebrating: eventType === 'xv_anos' ? 15 : ageCelebrating,
      eventDate,
      startTime,
      endTime,
      timezone: 'America/Mexico_City',
      location: {
        venueName: venueName.trim() || 'Salón de Eventos',
        address: address.trim(),
        city: city.trim(),
        mapsUrl: mapsUrl.trim(),
        additionalNotes: additionalNotes.trim(),
      },
      welcomeMessage: welcomeMessage.trim(),
      description: description.trim(),
      farewellMessage: farewellMessage.trim(),
      dressCode: {
        type: dressType,
        details: dressDetails.trim(),
      },
      specialPersons: {
        parentsBride,
        parentsGroom,
        godparents,
      },
      timeline,
      giftRegistries,
      gallery: initialEvent?.gallery || [
        {
          id: 'g-initial',
          url: '/src/assets/images/invitation_wedding_hero_1793809298901.jpg',
          caption: 'Fotografía principal',
          isCover: true,
        },
      ],
      design: initialEvent?.design || {
        template: 'boda_clasica',
        primaryColor: '#85583b',
        secondaryColor: '#f7f4ee',
        accentColor: '#c5a059',
        backgroundColor: '#fbfaf7',
        textColor: '#1e293b',
        fontFamily: 'serif',
        fontSizeScale: 'medium',
        backgroundPattern: 'botanical',
        envelopeColor: '#2b2d42',
        waxSealColor: '#c5a059',
        waxSealSymbol: 'A&C',
        coverImageUrl: '/src/assets/images/invitation_wedding_hero_1793809298901.jpg',
        musicEnabled: true,
        musicTrackTitle: 'Melodía Nupcial Clásica',
        sectionsVisibility: {
          hero: true,
          welcomeMessage: true,
          countdown: true,
          schedule: true,
          location: true,
          gallery: true,
          dressCode: true,
          giftRegistry: true,
          rsvp: true,
          farewell: true,
        },
      },
      rsvpDeadline,
      isActive: initialEvent ? initialEvent.isActive : true,
      createdAt: initialEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = storageService.saveEvent(eventToSave);
    onSaved(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                {initialEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
              </h2>
              <p className="text-xs text-stone-500">
                Configura los datos oficiales, ubicación, programa y mesa de regalos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-stone-100 border-b border-stone-200 overflow-x-auto text-xs font-medium">
          {[
            { id: 'general', label: '1. Información General' },
            { id: 'date_place', label: '2. Fecha & Salón' },
            { id: 'family', label: '3. Anfitriones & Vestimenta' },
            { id: 'timeline', label: '4. Itinerario' },
            { id: 'gifts', label: '5. Mesa de Regalos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStep(tab.id as typeof activeStep)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                activeStep === tab.id
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* STEP 1: GENERAL INFO */}
          {activeStep === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nombre del Festejado(a) o Pareja *
                </label>
                <input
                  type="text"
                  required
                  value={hostNames}
                  onChange={(e) => handleAutoSlug(e.target.value)}
                  placeholder="Ej. Andrea Morales & Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-medium text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-medium text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="boda">Boda</option>
                    <option value="xv_anos">XV Años</option>
                    <option value="cumpleanos">Cumpleaños</option>
                    <option value="bautizo">Bautizo</option>
                    <option value="primera_comunion">Primera Comunión</option>
                    <option value="graduacion">Graduación</option>
                    <option value="aniversario">Aniversario</option>
                    <option value="baby_shower">Baby Shower</option>
                    <option value="empresarial">Evento Empresarial</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Enlace Exclusivo (Slug / Identificador URL) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2.5 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl text-stone-500 font-mono text-[11px]">
                      /invitacion/
                    </span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-3 py-2.5 rounded-r-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Título de la Invitación *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Nuestra Boda: Andrea & Carlos"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Mensaje de Bienvenida / Frase Célebre
                </label>
                <textarea
                  rows={2}
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 resize-none font-serif"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Descripción o Invitación Formal
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DATE & PLACE */}
          {activeStep === 'date_place' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Fecha del Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Fecha Límite para RSVP *
                  </label>
                  <input
                    type="date"
                    required
                    value={rsvpDeadline}
                    onChange={(e) => setRsvpDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nombre del Salón o Recinto *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="Ej. Hacienda San José de las Flores"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Ciudad / Estado *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Cuernavaca, Morelos"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Dirección Completa
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, colonia, código postal"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Enlace de Google Maps / Coordenadas
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Indicaciones Adicionales (Valet parking, hotel, acceso)
                </label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ej. Servicio de Valet parking sin costo en la entrada principal."
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: FAMILY & DRESS CODE */}
          {activeStep === 'family' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Código de Vestimenta
                </label>
                <select
                  value={dressType}
                  onChange={(e) => setDressType(e.target.value as DressCodeType)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 capitalize font-medium mb-2"
                >
                  <option value="rigurosa_etiqueta">Rigurosa Etiqueta / Black Tie</option>
                  <option value="formal">Formal</option>
                  <option value="formal_playa">Formal Guayabera / Playa</option>
                  <option value="cocktail">Cocktail Chic</option>
                  <option value="casual_elegante">Casual Elegante</option>
                  <option value="tematico">Temático</option>
                  <option value="color_especifico">Color Específico</option>
                </select>

                <textarea
                  rows={2}
                  value={dressDetails}
                  onChange={(e) => setDressDetails(e.target.value)}
                  placeholder="Detalles sobre trajes, vestidos o colores a evitar"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-stone-200">
                <p className="font-semibold text-stone-800 mb-2">
                  Personas Especiales (Opcional)
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-stone-600 mb-1">Padres de la Novia / Festejado(a)</label>
                    <input
                      type="text"
                      value={parentsBride}
                      onChange={(e) => setParentsBride(e.target.value)}
                      placeholder="Ej. Roberto Morales & Elena Sánchez"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1">Padres del Novio</label>
                    <input
                      type="text"
                      value={parentsGroom}
                      onChange={(e) => setParentsGroom(e.target.value)}
                      placeholder="Ej. Carlos Mendoza Garza & Patricia De la Vega"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-600 mb-1">Padrinos de Velación / Honor</label>
                    <input
                      type="text"
                      value={godparents}
                      onChange={(e) => setGodparents(e.target.value)}
                      placeholder="Ej. Fernando Morales & Sofía Castillo"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TIMELINE */}
          {activeStep === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">Cronograma del Evento</p>
                  <p className="text-stone-500">Agrega los momentos clave de la celebración</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTimeline}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Momento</span>
                </button>
              </div>

              <div className="space-y-2">
                {timeline.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={item.time}
                      onChange={(e) => {
                        const copy = [...timeline];
                        copy[idx].time = e.target.value;
                        setTimeline(copy);
                      }}
                      className="w-24 px-2 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-medium text-center"
                      placeholder="18:00 hrs"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const copy = [...timeline];
                        copy[idx].title = e.target.value;
                        setTimeline(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-medium"
                      placeholder="Título del momento"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => {
                        const copy = [...timeline];
                        copy[idx].description = e.target.value;
                        setTimeline(copy);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-600"
                      placeholder="Detalles breves"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTimeline(item.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: GIFT REGISTRIES */}
          {activeStep === 'gifts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800">Mesa de Regalos / Cuentas Bancarias</p>
                  <p className="text-stone-500">Configura transferencias o enlaces de tiendas</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddGift}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Opción</span>
                </button>
              </div>

              <div className="space-y-3">
                {giftRegistries.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <select
                        value={item.type}
                        onChange={(e) => {
                          const copy = [...giftRegistries];
                          copy[idx].type = e.target.value as GiftRegistryItem['type'];
                          setGiftRegistries(copy);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-800 font-semibold text-xs"
                      >
                        <option value="bank_transfer">Transferencia Bancaria (Lluvia de Sobres)</option>
                        <option value="store">Tienda Departamental (Liverpool, etc.)</option>
                        <option value="wishlist">Wishlist Online (Amazon, etc.)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveGift(item.id)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const copy = [...giftRegistries];
                        copy[idx].title = e.target.value;
                        setGiftRegistries(copy);
                      }}
                      placeholder="Título (Ej. Cuenta BBVA Novios)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-medium"
                    />

                    {item.type === 'bank_transfer' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={item.bankName || ''}
                          onChange={(e) => {
                            const copy = [...giftRegistries];
                            copy[idx].bankName = e.target.value;
                            setGiftRegistries(copy);
                          }}
                          placeholder="Banco (Ej. BBVA)"
                          className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800"
                        />
                        <input
                          type="text"
                          value={item.clabe || ''}
                          onChange={(e) => {
                            const copy = [...giftRegistries];
                            copy[idx].clabe = e.target.value;
                            setGiftRegistries(copy);
                          }}
                          placeholder="CLABE (18 dígitos)"
                          className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-mono text-xs"
                        />
                      </div>
                    )}

                    {item.type === 'store' && (
                      <input
                        type="url"
                        value={item.externalUrl || ''}
                        onChange={(e) => {
                          const copy = [...giftRegistries];
                          copy[idx].externalUrl = e.target.value;
                          setGiftRegistries(copy);
                        }}
                        placeholder="Enlace web (https://liverpool.com.mx/...)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-mono text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Publicar Evento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
