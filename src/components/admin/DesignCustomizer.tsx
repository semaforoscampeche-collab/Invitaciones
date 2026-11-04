import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  Music,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Check,
  Eye,
  Sparkles,
  Upload,
  Trash2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { EventItem, InvitationDesign, TemplateStyle } from '../../types';
import { storageService } from '../../services/storage';

interface DesignCustomizerProps {
  event: EventItem;
  onSave: (updatedEvent: EventItem) => void;
  onPreview: (event: EventItem) => void;
  onClose: () => void;
}

const TEMPLATES_CONFIG: {
  id: TemplateStyle;
  name: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: 'serif' | 'display' | 'royal' | 'sans' | 'script';
  backgroundPattern: 'none' | 'botanical' | 'geometric' | 'stars' | 'damask' | 'gold_dust';
  envelopeColor: string;
  waxSealColor: string;
  waxSealSymbol: string;
  coverImage: string;
}[] = [
  {
    id: 'boda_clasica',
    name: 'Boda Clásica Toscana',
    category: 'Bodas',
    primaryColor: '#85583b',
    secondaryColor: '#f7f4ee',
    accentColor: '#c5a059',
    backgroundColor: '#fbfaf7',
    textColor: '#1e293b',
    fontFamily: 'serif',
    backgroundPattern: 'botanical',
    envelopeColor: '#2b2d42',
    waxSealColor: '#c5a059',
    waxSealSymbol: 'A&C',
    coverImage: '/src/assets/images/invitation_wedding_hero_1793809298901.jpg',
  },
  {
    id: 'xv_elegante',
    name: 'XV Años Esmeralda Real',
    category: 'XV Años',
    primaryColor: '#064e3b',
    secondaryColor: '#f0fdf4',
    accentColor: '#d97706',
    backgroundColor: '#fbfcfb',
    textColor: '#0f172a',
    fontFamily: 'royal',
    backgroundPattern: 'gold_dust',
    envelopeColor: '#064e3b',
    waxSealColor: '#d97706',
    waxSealSymbol: 'XV',
    coverImage: '/src/assets/images/invitation_xv_hero_1793809312049.jpg',
  },
  {
    id: 'cumpleanos_moderno',
    name: 'Cumpleaños Rooftop Night',
    category: 'Cumpleaños',
    primaryColor: '#09090b',
    secondaryColor: '#27272a',
    accentColor: '#f59e0b',
    backgroundColor: '#09090b',
    textColor: '#f4f4f5',
    fontFamily: 'display',
    backgroundPattern: 'stars',
    envelopeColor: '#18181b',
    waxSealColor: '#f59e0b',
    waxSealSymbol: '30',
    coverImage: '/src/assets/images/invitation_birthday_hero_1793809324256.jpg',
  },
  {
    id: 'floral_romantico',
    name: 'Floral & Jardín Botánico',
    category: 'Romántico / Bautizo',
    primaryColor: '#047857',
    secondaryColor: '#f0fdf4',
    accentColor: '#10b981',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    fontFamily: 'serif',
    backgroundPattern: 'botanical',
    envelopeColor: '#e2e8f0',
    waxSealColor: '#059669',
    waxSealSymbol: '🕊️',
    coverImage: '/src/assets/images/invitation_baptism_hero_1793809339476.jpg',
  },
  {
    id: 'dorado_lujo',
    name: 'Dorado Imperial & Ópalo',
    category: 'Gala / Boda',
    primaryColor: '#78350f',
    secondaryColor: '#fef3c7',
    accentColor: '#b45309',
    backgroundColor: '#fffdfa',
    textColor: '#292524',
    fontFamily: 'royal',
    backgroundPattern: 'gold_dust',
    envelopeColor: '#1c1917',
    waxSealColor: '#d97706',
    waxSealSymbol: '👑',
    coverImage: '/src/assets/images/invitation_wedding_hero_1793809298901.jpg',
  },
  {
    id: 'elegante_minimalista',
    name: 'Minimalista Noir & Ivory',
    category: 'Minimalista',
    primaryColor: '#0f172a',
    secondaryColor: '#f8fafc',
    accentColor: '#334155',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    fontFamily: 'sans',
    backgroundPattern: 'none',
    envelopeColor: '#0f172a',
    waxSealColor: '#475569',
    waxSealSymbol: 'M',
    coverImage: '/src/assets/images/invitation_wedding_hero_1793809298901.jpg',
  },
  {
    id: 'playero_tropical',
    name: 'Playero Brisa del Caribe',
    category: 'Playa',
    primaryColor: '#0e7490',
    secondaryColor: '#ecfeff',
    accentColor: '#f59e0b',
    backgroundColor: '#f0fdfa',
    textColor: '#164e63',
    fontFamily: 'display',
    backgroundPattern: 'none',
    envelopeColor: '#155e75',
    waxSealColor: '#f59e0b',
    waxSealSymbol: '🌴',
    coverImage: '/src/assets/images/invitation_wedding_hero_1793809298901.jpg',
  },
  {
    id: 'vintage',
    name: 'Vintage Cartas de Amor',
    category: 'Vintage',
    primaryColor: '#713f12',
    secondaryColor: '#fefce8',
    accentColor: '#a16207',
    backgroundColor: '#fefce8',
    textColor: '#422006',
    fontFamily: 'script',
    backgroundPattern: 'damask',
    envelopeColor: '#78350f',
    waxSealColor: '#b45309',
    waxSealSymbol: '💌',
    coverImage: '/src/assets/images/invitation_wedding_hero_1793809298901.jpg',
  },
  {
    id: 'princesas',
    name: 'Cuento de Hadas Rosa Pastel',
    category: 'Temático / XV',
    primaryColor: '#9d174d',
    secondaryColor: '#fdf2f8',
    accentColor: '#db2777',
    backgroundColor: '#fff1f2',
    textColor: '#831843',
    fontFamily: 'royal',
    backgroundPattern: 'stars',
    envelopeColor: '#831843',
    waxSealColor: '#be185d',
    waxSealSymbol: 'Tiara',
    coverImage: '/src/assets/images/invitation_xv_hero_1793809312049.jpg',
  },
  {
    id: 'infantil_colorido',
    name: 'Festivo Arcoíris Infantil',
    category: 'Infantil',
    primaryColor: '#0284c7',
    secondaryColor: '#f0f9ff',
    accentColor: '#e11d48',
    backgroundColor: '#ffffff',
    textColor: '#0c4a6e',
    fontFamily: 'sans',
    backgroundPattern: 'stars',
    envelopeColor: '#0284c7',
    waxSealColor: '#e11d48',
    waxSealSymbol: '🎈',
    coverImage: '/src/assets/images/invitation_baptism_hero_1793809339476.jpg',
  },
  {
    id: 'moderno_sofisticado',
    name: 'Arquitectura & Glamour Urbano',
    category: 'Moderno',
    primaryColor: '#18181b',
    secondaryColor: '#fafafa',
    accentColor: '#c084fc',
    backgroundColor: '#09090b',
    textColor: '#f4f4f5',
    fontFamily: 'sans',
    backgroundPattern: 'geometric',
    envelopeColor: '#27272a',
    waxSealColor: '#c084fc',
    waxSealSymbol: 'A',
    coverImage: '/src/assets/images/invitation_birthday_hero_1793809324256.jpg',
  },
];

export const DesignCustomizer: React.FC<DesignCustomizerProps> = ({
  event,
  onSave,
  onPreview,
  onClose,
}) => {
  const [design, setDesign] = useState<InvitationDesign>({ ...event.design });
  const [activeTab, setActiveTab] = useState<'templates' | 'palette' | 'typography' | 'sections' | 'media' | 'envelope'>('templates');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApplyTemplate = (tpl: typeof TEMPLATES_CONFIG[0]) => {
    setDesign((prev) => ({
      ...prev,
      template: tpl.id,
      primaryColor: tpl.primaryColor,
      secondaryColor: tpl.secondaryColor,
      accentColor: tpl.accentColor,
      backgroundColor: tpl.backgroundColor,
      textColor: tpl.textColor,
      fontFamily: tpl.fontFamily,
      backgroundPattern: tpl.backgroundPattern,
      envelopeColor: tpl.envelopeColor,
      waxSealColor: tpl.waxSealColor,
      waxSealSymbol: tpl.waxSealSymbol,
      coverImageUrl: tpl.coverImage,
    }));
  };

  const handleSave = () => {
    const updated: EventItem = {
      ...event,
      design,
    };
    storageService.saveEvent(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Handle local image file upload (converts to data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (isGallery) {
        // Add to event gallery
        const updatedGallery = [
          ...event.gallery,
          {
            id: `gal-${Date.now()}`,
            url: dataUrl,
            caption: 'Nueva fotografía subida',
          },
        ];
        const updatedEvent = { ...event, gallery: updatedGallery };
        storageService.saveEvent(updatedEvent);
        onSave(updatedEvent);
      } else {
        // Set cover image
        setDesign((prev) => ({ ...prev, coverImageUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 flex flex-col overflow-hidden text-stone-100">
      {/* Top Header */}
      <header className="h-16 px-6 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-white">
              Diseñador Visual de Invitación
            </h2>
            <p className="text-xs text-stone-400">
              Personalizando: <span className="text-amber-200">{event.title}</span>
            </p>
          </div>
        </div>

        {/* Viewport Mode Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-stone-800 rounded-xl border border-stone-700">
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                previewMode === 'mobile'
                  ? 'bg-amber-400 text-stone-950 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Vista Móvil</span>
            </button>
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                previewMode === 'desktop'
                  ? 'bg-amber-400 text-stone-950 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Vista Escritorio</span>
            </button>
          </div>

          <button
            onClick={() => onPreview({ ...event, design })}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Previsualizar</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </header>

      {/* Main Split Body: Left Controls, Right Live Preview */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL: Customization Tabs & Controls */}
        <div className="w-full md:w-[420px] lg:w-[460px] bg-stone-950 border-r border-stone-800 flex flex-col h-full overflow-hidden">
          {/* Tabs row */}
          <div className="flex items-center gap-1 p-2 bg-stone-900 border-b border-stone-800 overflow-x-auto">
            {[
              { id: 'templates', label: 'Plantillas', icon: Sparkles },
              { id: 'palette', label: 'Colores', icon: Palette },
              { id: 'typography', label: 'Tipografía', icon: Type },
              { id: 'sections', label: 'Secciones', icon: Layout },
              { id: 'envelope', label: 'Sobre & Sello', icon: Sparkles },
              { id: 'media', label: 'Música & Fotos', icon: Music },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-xs text-stone-300">
            {/* 1. PLANTILLAS PREDISEÑADAS */}
            {activeTab === 'templates' && (
              <div className="space-y-4">
                <p className="text-stone-400">
                  Selecciona un estilo arquitectónico prediseñado. Modificará colores, fuentes, patrones y sobre al instante.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TEMPLATES_CONFIG.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleApplyTemplate(tpl)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                        design.template === tpl.id
                          ? 'border-amber-400 bg-amber-500/10 shadow-md'
                          : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold text-amber-400">
                          {tpl.category}
                        </span>
                        {design.template === tpl.id && (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <p className="font-serif font-bold text-white text-sm">
                        {tpl.name}
                      </p>

                      {/* Swatches preview */}
                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-stone-800">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: tpl.primaryColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: tpl.accentColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: tpl.envelopeColor }}
                        />
                        <span className="text-[10px] text-stone-500 ml-1">
                          {tpl.fontFamily}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PALETA DE COLORES */}
            {activeTab === 'palette' && (
              <div className="space-y-5">
                <p className="text-stone-400">
                  Personaliza los tonos exactos según el código de color de tu festejo.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Color de Acento & Destellos (Dorado, Esmeralda, etc.)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={design.accentColor}
                        onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={design.accentColor}
                        onChange={(e) => setDesign({ ...design, accentColor: e.target.value })}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-xs w-28 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Color de Fondo de la Invitación
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={design.backgroundColor}
                        onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={design.backgroundColor}
                        onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-xs w-28 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Patrón de Fondo Discreto
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['none', 'botanical', 'gold_dust', 'stars', 'damask', 'geometric'] as const).map(
                        (pattern) => (
                          <button
                            key={pattern}
                            type="button"
                            onClick={() => setDesign({ ...design, backgroundPattern: pattern })}
                            className={`py-2 px-3 rounded-xl border text-center capitalize cursor-pointer transition-colors ${
                              design.backgroundPattern === pattern
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                                : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                            }`}
                          >
                            {pattern === 'none' ? 'Liso' : pattern.replace('_', ' ')}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TIPOGRAFÍA */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <p className="text-stone-400">
                  Elige la familia tipográfica principal para títulos y monogramas.
                </p>

                <div className="space-y-2.5">
                  {[
                    { id: 'serif', name: 'Cormorant Garamond (Serif Clásica de Lujo)', sample: 'Amor Eterno & Tradición' },
                    { id: 'royal', name: 'Cinzel (Imperial & Neoclásica)', sample: 'VALENTINA MIS XV AÑOS' },
                    { id: 'display', name: 'Playfair Display (Editorial y Sofisticada)', sample: 'Rooftop Soirée Glamour' },
                    { id: 'sans', name: 'Plus Jakarta Sans (Minimalista Contemporánea)', sample: 'Clean Modern Experience' },
                    { id: 'script', name: 'Great Vibes (Manuscrita Romántica)', sample: 'Nuestra Historia de Amor' },
                  ].map((font) => (
                    <div
                      key={font.id}
                      onClick={() =>
                        setDesign({
                          ...design,
                          fontFamily: font.id as typeof design.fontFamily,
                        })
                      }
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        design.fontFamily === font.id
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{font.name}</span>
                        {design.fontFamily === font.id && (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <p className="text-sm text-amber-200 font-serif">{font.sample}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. VISIBILIDAD DE SECCIONES */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                <p className="text-stone-400">
                  Activa o desactiva qué secciones se mostrarán en la invitación del invitado.
                </p>

                <div className="space-y-2">
                  {[
                    { key: 'hero', label: 'Portada y Fotografía Principal' },
                    { key: 'welcomeMessage', label: 'Mensaje de Bienvenida y Anfitriones' },
                    { key: 'countdown', label: 'Reloj y Contador Regresivo' },
                    { key: 'schedule', label: 'Itinerario / Programa del Evento' },
                    { key: 'location', label: 'Ubicación y Google Maps' },
                    { key: 'gallery', label: 'Galería de Recuerdos' },
                    { key: 'dressCode', label: 'Código de Vestimenta y Paleta' },
                    { key: 'giftRegistry', label: 'Mesa de Regalos / Lluvia de Sobres' },
                    { key: 'rsvp', label: 'Confirmación de Asistencia (RSVP)' },
                    { key: 'farewell', label: 'Mensaje de Despedida' },
                  ].map(({ key, label }) => {
                    const isVisible = design.sectionsVisibility[key as keyof typeof design.sectionsVisibility];
                    return (
                      <label
                        key={key}
                        className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 cursor-pointer"
                      >
                        <span className="text-stone-200 font-medium">{label}</span>
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={(e) =>
                            setDesign({
                              ...design,
                              sectionsVisibility: {
                                ...design.sectionsVisibility,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. SOBRE & SELLO DE CERA */}
            {activeTab === 'envelope' && (
              <div className="space-y-4">
                <p className="text-stone-400">
                  Personaliza la pantalla de bienvenida con sobre interactivo y sello de lacre.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Color del Sobre
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={design.envelopeColor}
                        onChange={(e) => setDesign({ ...design, envelopeColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={design.envelopeColor}
                        onChange={(e) => setDesign({ ...design, envelopeColor: e.target.value })}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-xs w-28 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Color del Sello de Cera
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={design.waxSealColor}
                        onChange={(e) => setDesign({ ...design, waxSealColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={design.waxSealColor}
                        onChange={(e) => setDesign({ ...design, waxSealColor: e.target.value })}
                        className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-mono text-xs w-28 uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Símbolo o Iniciales en el Sello (Máx 3 letras o emoji)
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={design.waxSealSymbol}
                      onChange={(e) => setDesign({ ...design, waxSealSymbol: e.target.value })}
                      placeholder="Ej. A&C ó XV"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-serif font-bold text-base focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. MÚSICA & MULTIMEDIA */}
            {activeTab === 'media' && (
              <div className="space-y-5">
                {/* Background music toggle */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Música Ambiental de Fondo</p>
                      <p className="text-[11px] text-stone-400">
                        Inicia tras la interacción de apertura del invitado respetando políticas de autoplay.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={design.musicEnabled}
                      onChange={(e) => setDesign({ ...design, musicEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                  </div>

                  {design.musicEnabled && (
                    <div className="pt-2 border-t border-stone-800 space-y-2">
                      <label className="block font-medium text-stone-300">
                        Título de la Canción
                      </label>
                      <input
                        type="text"
                        value={design.musicTrackTitle || ''}
                        onChange={(e) => setDesign({ ...design, musicTrackTitle: e.target.value })}
                        placeholder="Ej. Canon en Re Mayor"
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-amber-400"
                      />

                      <label className="block font-medium text-stone-300 pt-2">
                        URL de Audio Personalizada (Opcional)
                      </label>
                      <input
                        type="url"
                        value={design.musicUrl || ''}
                        onChange={(e) => setDesign({ ...design, musicUrl: e.target.value })}
                        placeholder="https://...mp3 (o dejar en blanco para sintetizador acústico nupcial)"
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block font-semibold text-white mb-2">
                    Fotografía de Portada
                  </label>
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-stone-700 bg-stone-900 relative group mb-2">
                    <img
                      src={design.coverImageUrl}
                      alt="Portada"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="px-3 py-1.5 rounded-xl bg-white text-stone-950 font-semibold cursor-pointer shadow flex items-center gap-1.5 text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Cambiar Portada</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, false)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Gallery Uploader */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-white">
                      Galería de Recuerdos ({event.gallery.length} fotos)
                    </label>
                    <label className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer text-[11px] font-medium flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Subir Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {event.gallery.map((photo) => (
                      <div
                        key={photo.id}
                        className="aspect-[4/3] rounded-xl overflow-hidden border border-stone-800 bg-stone-900 relative group"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Foto'}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = event.gallery.filter((p) => p.id !== photo.id);
                            const updatedEvent = { ...event, gallery: filtered };
                            storageService.saveEvent(updatedEvent);
                            onSave(updatedEvent);
                          }}
                          className="absolute top-1 right-1 p-1 rounded-md bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Live Interactive Preview */}
        <div className="flex-1 bg-stone-900 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          {previewMode === 'mobile' ? (
            /* Smartphone Mockup Frame */
            <div className="w-[375px] h-[720px] rounded-[48px] border-[10px] border-stone-800 bg-black shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-white/10">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-stone-900 z-30" />

              {/* Scrollable Viewport */}
              <div
                className="flex-1 overflow-y-auto text-stone-900"
                style={{ backgroundColor: design.backgroundColor }}
              >
                {/* Mini Hero */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img
                    src={design.coverImageUrl}
                    alt="Portada"
                    className="w-full h-full object-cover filter brightness-[0.8]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-5 text-center text-white">
                    <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-1">
                      {event.eventType.replace('_', ' ')}
                    </span>
                    <h3 className="text-xl font-serif font-bold leading-tight">
                      {event.hostNames}
                    </h3>
                    <p className="text-[11px] text-stone-200 mt-1">
                      {event.eventDate} · {event.location.venueName}
                    </p>
                  </div>
                </div>

                {/* Mini Content Mock */}
                <div className="p-5 space-y-4 text-center">
                  <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Pase Especial Reservado
                    </p>
                    <p className="text-sm font-serif font-bold text-stone-900 mt-0.5">
                      Familia Invitada de Honor
                    </p>
                    <p className="text-[11px] text-stone-600 mt-1">
                      2 Pases Autorizados · Mesa VIP
                    </p>
                  </div>

                  {design.sectionsVisibility.countdown && (
                    <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80">
                      <p className="text-[10px] uppercase font-bold text-amber-800 mb-2">
                        Cuenta Regresiva
                      </p>
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {['DÍAS', 'HRS', 'MIN', 'SEG'].map((lbl, idx) => (
                          <div key={lbl} className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                            <span className="font-serif font-bold text-sm text-stone-900">
                              {[24, 8, 30, 45][idx]}
                            </span>
                            <span className="block text-[8px] text-stone-400 font-semibold">{lbl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {design.sectionsVisibility.location && (
                    <div className="p-4 rounded-2xl bg-white/80 border border-stone-200/80 text-left">
                      <p className="text-[10px] uppercase font-bold text-amber-800">Ubicación</p>
                      <p className="text-xs font-serif font-bold text-stone-900 mt-1">
                        {event.location.venueName}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5">{event.location.city}</p>
                    </div>
                  )}

                  {design.sectionsVisibility.rsvp && (
                    <div className="p-4 rounded-2xl bg-white/90 border border-amber-300/80 text-center">
                      <p className="text-xs font-serif font-bold text-stone-900">
                        Confirmación de Asistencia
                      </p>
                      <button className="w-full mt-2 py-2 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs shadow-xs">
                        Confirmar Pases
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Desktop Mockup Frame */
            <div className="w-full max-w-3xl h-[680px] rounded-3xl border border-stone-700 bg-stone-950 shadow-2xl overflow-hidden flex flex-col">
              {/* Browser window top bar */}
              <div className="h-9 px-4 bg-stone-900 border-b border-stone-800 flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="mx-auto px-4 py-1 rounded-md bg-stone-950 text-[11px] text-stone-400 font-mono">
                  https://aurea.invitacion/{event.slug}
                </div>
              </div>

              {/* Scrollable Viewport */}
              <div
                className="flex-1 overflow-y-auto"
                style={{ backgroundColor: design.backgroundColor }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={design.coverImageUrl}
                    alt="Portada"
                    className="w-full h-full object-cover filter brightness-[0.75]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end pb-8 text-center text-white">
                    <span className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-2">
                      {event.eventType.replace('_', ' ')}
                    </span>
                    <h2 className="text-3xl font-serif font-bold">
                      {event.hostNames}
                    </h2>
                  </div>
                </div>

                <div className="p-8 max-w-xl mx-auto space-y-6 text-center text-stone-900">
                  <div className="p-6 rounded-3xl bg-white/90 border border-stone-200/80 shadow-sm">
                    <h4 className="text-lg font-serif font-bold text-stone-900">
                      {event.welcomeMessage}
                    </h4>
                    <p className="text-xs text-stone-600 mt-2">{event.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
