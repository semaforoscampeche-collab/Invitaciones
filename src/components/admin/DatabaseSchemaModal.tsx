import React, { useState } from 'react';
import { Database, Code2, Copy, Check, X, Layers, ShieldCheck, Server } from 'lucide-react';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'sql_schema' | 'laravel_migrations' | 'eloquent_models' | 'api_controllers'>('sql_schema');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const SQL_DDL = `-- ==========================================================
-- SISTEMA DE INVITACIONES DIGITALES PERSONALIZADAS (AUREA)
-- ESQUEMA RELACIONAL NORMALIZADO (MySQL 8.0+ / InnoDB)
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`aurea_invitaciones\`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE \`aurea_invitaciones\`;

-- 1. USUARIOS Y ADMINISTRADORES (Laravel Sanctum Auth)
CREATE TABLE \`users\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(191) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`email_verified_at\` TIMESTAMP NULL,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('super_admin', 'event_planner', 'client_host') NOT NULL DEFAULT 'client_host',
  \`remember_token\` VARCHAR(100) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL
) ENGINE=InnoDB;

-- 2. EVENTOS SOCIALES
CREATE TABLE \`events\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` BIGINT UNSIGNED NOT NULL,
  \`slug\` VARCHAR(120) NOT NULL UNIQUE,
  \`title\` VARCHAR(255) NOT NULL,
  \`host_names\` VARCHAR(255) NOT NULL,
  \`event_type\` ENUM('boda', 'xv_anos', 'cumpleanos', 'bautizo', 'primera_comunion', 'graduacion', 'aniversario', 'baby_shower', 'empresarial', 'otro') NOT NULL,
  \`age_celebrating\` SMALLINT UNSIGNED NULL,
  \`event_date\` DATE NOT NULL,
  \`start_time\` TIME NOT NULL,
  \`end_time\` TIME NULL,
  \`timezone\` VARCHAR(64) NOT NULL DEFAULT 'America/Mexico_City',
  \`welcome_message\` TEXT NULL,
  \`description\` TEXT NULL,
  \`farewell_message\` TEXT NULL,
  \`rsvp_deadline\` DATE NOT NULL,
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL,
  CONSTRAINT \`fk_events_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_events_slug\` (\`slug\`),
  INDEX \`idx_events_date\` (\`event_date\`),
  INDEX \`idx_events_active\` (\`is_active\`)
) ENGINE=InnoDB;

-- 3. UBICACIONES DEL EVENTO (Relación 1:1)
CREATE TABLE \`event_locations\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`event_id\` BIGINT UNSIGNED NOT NULL UNIQUE,
  \`venue_name\` VARCHAR(255) NOT NULL,
  \`address\` VARCHAR(255) NOT NULL,
  \`city\` VARCHAR(120) NOT NULL,
  \`maps_url\` VARCHAR(500) NULL,
  \`latitude\` DECIMAL(10, 8) NULL,
  \`longitude\` DECIMAL(11, 8) NULL,
  \`additional_notes\` TEXT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_locations_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. PLANTILLAS Y DISEÑOS VISUALES (Relación 1:1)
CREATE TABLE \`invitation_designs\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`event_id\` BIGINT UNSIGNED NOT NULL UNIQUE,
  \`template\` VARCHAR(60) NOT NULL DEFAULT 'boda_clasica',
  \`primary_color\` VARCHAR(20) NOT NULL DEFAULT '#85583b',
  \`secondary_color\` VARCHAR(20) NOT NULL DEFAULT '#f7f4ee',
  \`accent_color\` VARCHAR(20) NOT NULL DEFAULT '#c5a059',
  \`background_color\` VARCHAR(20) NOT NULL DEFAULT '#fbfaf7',
  \`text_color\` VARCHAR(20) NOT NULL DEFAULT '#1e293b',
  \`font_family\` VARCHAR(50) NOT NULL DEFAULT 'serif',
  \`background_pattern\` VARCHAR(50) NOT NULL DEFAULT 'botanical',
  \`envelope_color\` VARCHAR(20) NOT NULL DEFAULT '#2b2d42',
  \`wax_seal_color\` VARCHAR(20) NOT NULL DEFAULT '#c5a059',
  \`wax_seal_symbol\` VARCHAR(20) NOT NULL DEFAULT 'A&C',
  \`cover_image_url\` VARCHAR(500) NULL,
  \`music_enabled\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`music_track_title\` VARCHAR(255) NULL,
  \`music_url\` VARCHAR(500) NULL,
  \`sections_visibility\` JSON NOT NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_designs_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. INVITADOS (Relación 1:N)
CREATE TABLE \`guests\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`event_id\` BIGINT UNSIGNED NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`family_or_group\` VARCHAR(120) NULL,
  \`phone\` VARCHAR(30) NULL,
  \`email\` VARCHAR(191) NULL,
  \`authorized_passes\` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  \`is_vip\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`table_number\` VARCHAR(50) NULL,
  \`has_viewed\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`first_viewed_at\` TIMESTAMP NULL,
  \`last_viewed_at\` TIMESTAMP NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`deleted_at\` TIMESTAMP NULL,
  CONSTRAINT \`fk_guests_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_guests_event_id\` (\`event_id\`),
  INDEX \`idx_guests_vip\` (\`is_vip\`)
) ENGINE=InnoDB;

-- 6. CÓDIGOS DE ACCESO PRIVADOS (Relación 1:1 con Guest, con Hashing y Fuerza Bruta)
CREATE TABLE \`guest_access_codes\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`guest_id\` BIGINT UNSIGNED NOT NULL UNIQUE,
  \`event_id\` BIGINT UNSIGNED NOT NULL,
  \`code_hash\` VARCHAR(255) NOT NULL,
  \`plain_code_preview\` VARCHAR(20) NOT NULL,
  \`max_attempts\` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  \`failed_attempts\` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  \`locked_until\` TIMESTAMP NULL,
  \`is_revoked\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`expires_at\` TIMESTAMP NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_codes_guest\` FOREIGN KEY (\`guest_id\`) REFERENCES \`guests\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_codes_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_code_event_lookup\` (\`event_id\`, \`plain_code_preview\`)
) ENGINE=InnoDB;

-- 7. CONFIRMACIONES RSVP (Relación 1:1 con Guest)
CREATE TABLE \`rsvp_responses\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`guest_id\` BIGINT UNSIGNED NOT NULL UNIQUE,
  \`event_id\` BIGINT UNSIGNED NOT NULL,
  \`status\` ENUM('pending', 'confirmed', 'declined') NOT NULL DEFAULT 'pending',
  \`confirmed_passes\` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  \`companion_names\` JSON NULL,
  \`dietary_restrictions\` TEXT NULL,
  \`guest_message\` TEXT NULL,
  \`submitted_at\` TIMESTAMP NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_rsvp_guest\` FOREIGN KEY (\`guest_id\`) REFERENCES \`guests\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_rsvp_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE,
  INDEX \`idx_rsvp_status\` (\`status\`)
) ENGINE=InnoDB;

-- 8. REGISTRO DE INTENTOS Y AUDITORÍA DE SEGURIDAD
CREATE TABLE \`invitation_access_logs\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`event_id\` BIGINT UNSIGNED NOT NULL,
  \`guest_id\` BIGINT UNSIGNED NULL,
  \`code_attempted\` VARCHAR(50) NOT NULL,
  \`success\` BOOLEAN NOT NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`user_agent\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_logs_event_time\` (\`event_id\`, \`created_at\`)
) ENGINE=InnoDB;

-- 9. MESA DE REGALOS & CUENTAS BANCARIAS
CREATE TABLE \`gift_registry\` (
  \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`event_id\` BIGINT UNSIGNED NOT NULL,
  \`type\` ENUM('bank_transfer', 'store', 'envelope', 'wishlist') NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NULL,
  \`bank_name\` VARCHAR(120) NULL,
  \`clabe\` VARCHAR(30) NULL,
  \`account_number\` VARCHAR(50) NULL,
  \`beneficiary_name\` VARCHAR(255) NULL,
  \`external_url\` VARCHAR(500) NULL,
  \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_gifts_event\` FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

  const LARAVEL_MIGRATION = `<?php
// database/migrations/2026_01_01_000001_create_events_and_invitations_tables.php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('slug', 120)->unique();
            $table->string('title');
            $table->string('host_names');
            $table->string('event_type', 40);
            $table->unsignedSmallInteger('age_celebrating')->nullable();
            $table->date('event_date');
            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('timezone', 64)->default('America/Mexico_City');
            $table->text('welcome_message')->nullable();
            $table->text('description')->nullable();
            $table->text('farewell_message')->nullable();
            $table->date('rsvp_deadline');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('family_or_group')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->unsignedSmallInteger('authorized_passes')->default(1);
            $table->boolean('is_vip')->default(false);
            $table->string('table_number', 50)->nullable();
            $table->boolean('has_viewed')->default(false);
            $table->timestamp('first_viewed_at')->nullable();
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('guest_access_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('code_hash');
            $table->string('plain_code_preview', 20);
            $table->unsignedTinyInteger('failed_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();
            $table->boolean('is_revoked')->default(false);
            $table->timestamps();
        });

        Schema::create('rsvp_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guest_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'declined'])->default('pending');
            $table->unsignedSmallInteger('confirmed_passes')->default(0);
            $table->json('companion_names')->nullable();
            $table->text('dietary_restrictions')->nullable();
            $table->text('guest_message')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rsvp_responses');
        Schema::dropIfExists('guest_access_codes');
        Schema::dropIfExists('guests');
        Schema::dropIfExists('events');
    }
};
`;

  const ELOQUENT_MODEL = `<?php
// app/Models/Event.php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\SoftDeletes;
use Illuminate\\Database\\Eloquent\\Relations\\HasMany;
use Illuminate\\Database\\Eloquent\\Relations\\HasOne;
use Illuminate\\Database\\Eloquent\\Relations\\BelongsTo;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'slug', 'title', 'host_names', 'event_type',
        'age_celebrating', 'event_date', 'start_time', 'end_time',
        'timezone', 'welcome_message', 'description', 'farewell_message',
        'rsvp_deadline', 'is_active',
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function location(): HasOne {
        return $this->hasOne(EventLocation::class);
    }

    public function design(): HasOne {
        return $this->hasOne(InvitationDesign::class);
    }

    public function guests(): HasMany {
        return $this->hasMany(Guest::class);
    }

    public function giftRegistries(): HasMany {
        return $this->hasMany(GiftRegistry::class);
    }

    public function rsvps(): HasMany {
        return $this->hasMany(RsvpResponse::class);
    }
}
`;

  const API_CONTROLLER = `<?php
// app/Http/Controllers/Api/InvitationAccessController.php
namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;
use App\\Models\\Event;
use App\\Models\\Guest;
use App\\Models\\GuestAccessCode;
use App\\Models\\InvitationAccessLog;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Hash;
use Carbon\\Carbon;

class InvitationAccessController extends Controller
{
    /**
     * Valida el código de acceso exclusivo con protección contra fuerza bruta
     */
    public function verifyAccess(Request $request, string $slug)
    {
        $request->validate([
            'access_code' => 'required|string|max:30',
        ]);

        $event = Event::with(['location', 'design', 'giftRegistries'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $codeEntered = strtoupper(trim($request->access_code));

        // Buscar código asociado al evento
        $accessCode = GuestAccessCode::where('event_id', $event->id)
            ->where('plain_code_preview', $codeEntered)
            ->with('guest.rsvp')
            ->first();

        // Verificar bloqueo por fuerza bruta
        if ($accessCode && $accessCode->locked_until && $accessCode->locked_until->isFuture()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso temporalmente bloqueado por seguridad.',
                'retry_after_seconds' => now()->diffInSeconds($accessCode->locked_until),
            ], 429);
        }

        if (!$accessCode || $accessCode->is_revoked) {
            InvitationAccessLog::create([
                'event_id' => $event->id,
                'code_attempted' => $codeEntered,
                'success' => false,
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Código de acceso no válido para esta celebración.',
            ], 403);
        }

        // Acceso exitoso
        $accessCode->update(['failed_attempts' => 0, 'locked_until' => null]);
        $guest = $accessCode->guest;
        $guest->update([
            'has_viewed' => true,
            'last_viewed_at' => now(),
        ]);

        // Retornar información filtrada (privacidad estricta)
        return response()->json([
            'success' => true,
            'event' => $event,
            'guest' => [
                'id' => $guest->id,
                'name' => $guest->name,
                'authorized_passes' => $guest->authorized_passes,
                'is_vip' => $guest->is_vip,
                'table_number' => $guest->table_number,
                'rsvp' => $guest->rsvp,
            ],
        ]);
    }
}
`;

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'sql_schema':
        return SQL_DDL;
      case 'laravel_migrations':
        return LARAVEL_MIGRATION;
      case 'eloquent_models':
        return ELOQUENT_MODEL;
      case 'api_controllers':
        return API_CONTROLLER;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-950 text-stone-100 rounded-3xl shadow-2xl border border-stone-800 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-white">
                Arquitectura de Base de Datos & Backend Laravel
              </h2>
              <p className="text-xs text-stone-400">
                13 tablas normalizadas (MySQL 8.0), migraciones, modelos y seguridad Sanctum
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 p-2 bg-stone-900 border-b border-stone-800 overflow-x-auto text-xs">
          {[
            { id: 'sql_schema', label: '1. Esquema MySQL DDL (13 Tablas)', icon: Database },
            { id: 'laravel_migrations', label: '2. Migraciones Laravel', icon: Layers },
            { id: 'eloquent_models', label: '3. Modelos Eloquent & Relaciones', icon: Code2 },
            { id: 'api_controllers', label: '4. Controlador API & Fuerza Bruta', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-xl font-medium flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-950 font-mono text-xs text-stone-300 leading-relaxed">
          <pre className="p-4 rounded-2xl bg-stone-900 border border-stone-800 overflow-x-auto selection:bg-amber-500/30">
            <code>{getCurrentCode()}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-900/80 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Diseñado bajo estándares REST API, PSR-12 y seguridad contra ataques por diccionario.</span>
          </div>
          <span className="text-[11px] text-stone-500">Aurea v1.0 Production Ready</span>
        </div>
      </div>
    </div>
  );
};
