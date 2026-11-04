import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  Plus,
  Search,
  QrCode,
  Share2,
  Trash2,
  Edit,
  Download,
  Upload,
  Check,
  X,
  Copy,
  ExternalLink,
  MessageCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { storageService } from '../../services/storage';
import { EventItem, GuestItem } from '../../types';

interface GuestManagerModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSelectGuestPreview?: (guest: GuestItem) => void;
}

export const GuestManagerModal: React.FC<GuestManagerModalProps> = ({
  event,
  isOpen,
  onClose,
  onSelectGuestPreview,
}) => {
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'declined' | 'vip'>('all');

  // New / Edit Guest Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formFamily, setFormFamily] = useState('');
  const [formPasses, setFormPasses] = useState(2);
  const [formCode, setFormCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTable, setFormTable] = useState('');
  const [formIsVip, setFormIsVip] = useState(false);

  // QR Modal
  const [qrGuest, setQrGuest] = useState<GuestItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // WhatsApp Message Modal
  const [whatsappGuest, setWhatsappGuest] = useState<GuestItem | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // CSV Import Modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importCount, setImportCount] = useState<number | null>(null);

  const loadGuests = () => {
    setGuests(storageService.getGuestsByEvent(event.id));
  };

  useEffect(() => {
    if (isOpen) {
      loadGuests();
    }
  }, [isOpen, event.id]);

  // Generate QR when guest selected
  useEffect(() => {
    if (qrGuest) {
      const inviteUrl = `${window.location.origin}?evento=${event.slug}&codigo=${qrGuest.accessCode}`;
      QRCode.toDataURL(inviteUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [qrGuest, event.slug]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormName('');
    setFormFamily('Familia');
    setFormPasses(2);
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = event.eventType === 'boda' ? 'BODA' : event.eventType === 'xv_anos' ? 'XV' : 'INV';
    setFormCode(`${prefix}-${randomCode}`);
    setFormPhone('');
    setFormEmail('');
    setFormTable('');
    setFormIsVip(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (guest: GuestItem) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormFamily(guest.familyOrGroup || '');
    setFormPasses(guest.authorizedPasses);
    setFormCode(guest.accessCode);
    setFormPhone(guest.phone || '');
    setFormEmail(guest.email || '');
    setFormTable(guest.tableNumber || '');
    setFormIsVip(guest.isVip);
    setIsFormOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    if (editingGuest) {
      storageService.saveGuest({
        ...editingGuest,
        name: formName.trim(),
        familyOrGroup: formFamily.trim() || 'Invitados',
        authorizedPasses: Number(formPasses) || 1,
        accessCode: formCode.trim().toUpperCase(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        tableNumber: formTable.trim(),
        isVip: formIsVip,
      });
    } else {
      storageService.saveGuest({
        id: `gst-${Date.now()}`,
        eventId: event.id,
        name: formName.trim(),
        familyOrGroup: formFamily.trim() || 'Invitados',
        authorizedPasses: Number(formPasses) || 1,
        accessCode: formCode.trim().toUpperCase(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        tableNumber: formTable.trim(),
        isVip: formIsVip,
        hasViewed: false,
        rsvpStatus: 'pending',
        confirmedPasses: 0,
        companionNames: [],
        createdAt: new Date().toISOString(),
      });
    }

    setIsFormOpen(false);
    loadGuests();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este invitado?')) {
      storageService.deleteGuest(id);
      loadGuests();
    }
  };

  const getWhatsappMessage = (guest: GuestItem) => {
    const inviteUrl = `${window.location.origin}?evento=${event.slug}&codigo=${guest.accessCode}`;
    const dateFormatted = new Date(event.eventDate + 'T12:00:00').toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `¡Hola ${guest.name}! ✨\n\nTenemos el gran honor y la alegría de invitarte a celebrar con nosotros:\n\n*${event.title}*\n📅 *Fecha:* ${dateFormatted} a las ${event.startTime} hrs\n📍 *Lugar:* ${event.location.venueName} (${event.location.city})\n\n🎟️ *Tu Invitación Digital Privada:*\n${inviteUrl}\n\n🔑 *Tu Código de Acceso Exclusivo:* *${guest.accessCode}*\n👥 *Pases Reservados:* ${guest.authorizedPasses} persona(s)\n\nPor favor confirma tu asistencia en el enlace antes del ${event.rsvpDeadline}. ¡Esperamos contar con tu presencia!`;
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Nombre,Grupo/Familia,Pases,Codigo,Telefono,Email,Mesa,VIP,Estado RSVP,Pases Confirmados,Acompañantes,Mensaje'];
    const rows = guests.map((g) =>
      [
        `"${g.name}"`,
        `"${g.familyOrGroup || ''}"`,
        g.authorizedPasses,
        `"${g.accessCode}"`,
        `"${g.phone || ''}"`,
        `"${g.email || ''}"`,
        `"${g.tableNumber || ''}"`,
        g.isVip ? 'SI' : 'NO',
        `"${g.rsvpStatus}"`,
        g.confirmedPasses,
        `"${(g.companionNames || []).join('; ')}"`,
        `"${(g.guestMessage || '').replace(/"/g, '""')}"`,
      ].join(',')
    );

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invitados_${event.slug}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // CSV Import
  const handleImportCsv = () => {
    if (!csvContent.trim()) return;

    const lines = csvContent.trim().split('\n');
    const parsedGuests: Partial<GuestItem>[] = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('nombre')) return; // skip header
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts[0]) {
        parsedGuests.push({
          name: parts[0],
          familyOrGroup: parts[1] || 'Invitados',
          authorizedPasses: Number(parts[2]) || 1,
          accessCode: parts[3] || undefined,
          phone: parts[4] || '',
          email: parts[5] || '',
          tableNumber: parts[6] || '',
          isVip: parts[7]?.toLowerCase() === 'si' || parts[7]?.toLowerCase() === 'true',
        });
      }
    });

    const count = storageService.bulkAddGuests(event.id, parsedGuests);
    setImportCount(count);
    loadGuests();
    setTimeout(() => {
      setIsCsvModalOpen(false);
      setImportCount(null);
      setCsvContent('');
    }, 1500);
  };

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.accessCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.familyOrGroup && g.familyOrGroup.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'confirmed') return g.rsvpStatus === 'confirmed';
    if (filterStatus === 'pending') return g.rsvpStatus === 'pending';
    if (filterStatus === 'declined') return g.rsvpStatus === 'declined';
    if (filterStatus === 'vip') return g.isVip;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                Gestor de Invitados y Códigos de Acceso
              </h2>
              <p className="text-xs text-stone-500">
                {event.title} · {guests.length} invitados registrados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              title="Descargar lista en CSV / Excel"
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={() => setIsCsvModalOpen(true)}
              title="Importar lista desde CSV"
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Invitado</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Segmented Filter */}
        <div className="p-4 border-b border-stone-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, código o grupo..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl w-full sm:w-auto overflow-x-auto">
            {(['all', 'confirmed', 'pending', 'declined', 'vip'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filterStatus === st
                    ? 'bg-white text-stone-900 shadow-sm font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st === 'all' && 'Todos'}
                {st === 'confirmed' && 'Confirmados'}
                {st === 'pending' && 'Pendientes'}
                {st === 'declined' && 'Declinados'}
                {st === 'vip' && 'VIP'}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Guests */}
        <div className="flex-1 overflow-y-auto">
          {filteredGuests.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No se encontraron invitados con los criterios actuales</p>
              <p className="text-xs text-stone-400 mt-1">Registra nuevos invitados o modifica los filtros</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4">Invitado / Familia</th>
                  <th className="py-3 px-3">Código Exclusivo</th>
                  <th className="py-3 px-3 text-center">Pases</th>
                  <th className="py-3 px-3">Estado RSVP</th>
                  <th className="py-3 px-3 text-center">Visto</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <span>{g.name}</span>
                        {g.isVip && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>{g.familyOrGroup || 'Invitados'}</span>
                        {g.tableNumber && (
                          <>
                            <span>·</span>
                            <span>{g.tableNumber}</span>
                          </>
                        )}
                        {g.phone && (
                          <>
                            <span>·</span>
                            <span>{g.phone}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded border border-stone-200 text-[11px]">
                        {g.accessCode}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="font-semibold text-stone-800 tabular-nums">
                        {g.rsvpStatus === 'confirmed' ? `${g.confirmedPasses} / ` : ''}
                        {g.authorizedPasses}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      {g.rsvpStatus === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirmado</span>
                        </span>
                      )}
                      {g.rsvpStatus === 'pending' && (
                        <span className="text-amber-700 font-medium text-[11px]">
                          Pendiente
                        </span>
                      )}
                      {g.rsvpStatus === 'declined' && (
                        <span className="text-stone-400 font-medium text-[11px]">
                          Rechazado
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      {g.hasViewed ? (
                        <span className="text-emerald-600 font-semibold text-[11px]" title={`Visto el ${g.firstViewedAt}`}>
                          Sí
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">No</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* WhatsApp Invite link */}
                        <button
                          onClick={() => setWhatsappGuest(g)}
                          title="Compartir por WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* QR Code */}
                        <button
                          onClick={() => setQrGuest(g)}
                          title="Generar Código QR"
                          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Test guest view */}
                        {onSelectGuestPreview && (
                          <button
                            onClick={() => {
                              onSelectGuestPreview(g);
                              onClose();
                            }}
                            title="Probar vista de este invitado"
                            className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(g)}
                          title="Editar invitado"
                          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(g.id)}
                          title="Eliminar invitado"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer Summary */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-600 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Total: <strong>{guests.length}</strong></span>
            <span>Confirmados: <strong>{guests.filter((g) => g.rsvpStatus === 'confirmed').length}</strong></span>
            <span>Pendientes: <strong>{guests.filter((g) => g.rsvpStatus === 'pending').length}</strong></span>
          </div>
          <p className="text-stone-400">Códigos únicos y cifrados contra ataques de fuerza bruta</p>
        </div>
      </div>

      {/* SUB-MODAL 1: ADD / EDIT GUEST */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 max-w-md w-full">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-4">
              {editingGuest ? 'Editar Invitado' : 'Registrar Nuevo Invitado'}
            </h3>

            <form onSubmit={handleSaveGuest} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nombre Completo o Familia *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Familia Morales Villaseñor"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Grupo / Parentesco
                  </label>
                  <input
                    type="text"
                    value={formFamily}
                    onChange={(e) => setFormFamily(e.target.value)}
                    placeholder="Ej. Familia Novia"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Pases Autorizados *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={formPasses}
                    onChange={(e) => setFormPasses(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Código de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Ej. BODA-001"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 uppercase font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Mesa Asignada
                  </label>
                  <input
                    type="text"
                    value={formTable}
                    onChange={(e) => setFormTable(e.target.value)}
                    placeholder="Ej. Mesa 3"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+52 55..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="invitado@ejemplo.com"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsVip}
                    onChange={(e) => setFormIsVip(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-stone-800">
                    Marcar como Invitado Especial / VIP
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 font-semibold text-stone-950 transition-colors shadow-sm cursor-pointer"
                >
                  Guardar Invitado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: QR CODE */}
      {qrGuest && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 max-w-sm w-full text-center">
            <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
              Código QR Personalizado
            </h3>
            <p className="text-xs text-stone-500 mb-4">{qrGuest.name}</p>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 inline-block shadow-inner mb-4">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR de ${qrGuest.name}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              )}
            </div>

            <div className="text-xs font-mono font-bold text-stone-700 mb-4">
              Código: <span className="text-amber-800">{qrGuest.accessCode}</span> · {qrGuest.authorizedPasses} pases
            </div>

            <div className="flex gap-2 justify-center">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`QR_${qrGuest.accessCode}_${qrGuest.name.replace(/\s+/g, '_')}.png`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Imagen QR</span>
                </a>
              )}
              <button
                onClick={() => setQrGuest(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: WHATSAPP GENERATOR */}
      {whatsappGuest && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 max-w-lg w-full">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Mensaje Personalizado para WhatsApp
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Envía la invitación directamente por WhatsApp a <strong>{whatsappGuest.name}</strong> con su código y enlace privado listo.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-stone-800 whitespace-pre-wrap font-sans leading-relaxed mb-4 max-h-56 overflow-y-auto">
              {getWhatsappMessage(whatsappGuest)}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getWhatsappMessage(whatsappGuest));
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-200 hover:bg-stone-50 text-stone-700 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copiado al portapapeles' : 'Copiar Texto'}</span>
              </button>

              <a
                href={`https://wa.me/${whatsappGuest.phone ? whatsappGuest.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(
                  getWhatsappMessage(whatsappGuest)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Abrir en WhatsApp</span>
              </a>

              <button
                onClick={() => setWhatsappGuest(null)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 4: CSV BULK IMPORT */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 max-w-xl w-full">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Importación Masiva de Invitados (CSV)
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              Pega las filas en formato CSV separadas por coma. Las columnas son: <br />
              <code className="text-amber-800 font-mono">Nombre, Familia, Pases, Codigo, Telefono, Email, Mesa, VIP(SI/NO)</code>
            </p>

            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Ejemplo:&#10;Lic. Carlos Fuentes,Amigos Novio,2,CF-01,+52 55 1122 3344,carlos@correo.com,Mesa 4,SI&#10;Familia Morales,Familia,4,FM-02,+52 55 9988 7766,morales@correo.com,Mesa 2,NO"
              className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-300 font-mono text-xs text-stone-800 focus:outline-none focus:border-amber-500 mb-4"
            />

            {importCount !== null && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>¡Se han importado exitosamente {importCount} invitados!</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setCsvContent(
                    'Lic. Roberto Garza,Colegas,2,RG-01,+52 55 8899 0011,roberto@empresa.com,Mesa 6,SI\nFamilia Jiménez,Familia,3,FJ-02,+52 55 3344 5566,jimenez@email.com,Mesa 3,NO'
                  )
                }
                className="text-xs text-amber-800 hover:underline font-medium cursor-pointer"
              >
                Cargar plantilla de ejemplo
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportCsv}
                  disabled={!csvContent.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  Procesar Importación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
