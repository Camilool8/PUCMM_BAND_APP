"use client";

import { useState, useEffect } from "react";
import {
  User,
  Camera,
  Music2,
  Phone,
  FileText,
  X,
  Check,
  Plus,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/hooks/use-users";
import { useUpload } from "@/hooks/use-upload";
import type { UploadResponse } from "@/lib/api";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Common band instruments
const INSTRUMENT_OPTIONS = [
  "Trompeta",
  "Trombón",
  "Saxofón Alto",
  "Saxofón Tenor",
  "Saxofón Barítono",
  "Clarinete",
  "Flauta",
  "Tuba",
  "Bombardino",
  "Percusión",
  "Batería",
  "Bajo",
  "Guitarra",
  "Piano/Teclado",
  "Voz",
];

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { dbUser, canEditProfile } = useAuth();
  const updateProfile = useUpdateProfile();
  const avatarUpload = useUpload("image");

  // Form state
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [instruments, setInstruments] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [showUploader, setShowUploader] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (dbUser) {
      setName(dbUser.name || "");
      setAvatarUrl(dbUser.avatarUrl || null);
      setInstruments(dbUser.instruments || []);
      setPhone(dbUser.phone || "");
      setBio(dbUser.bio || "");
    }
  }, [dbUser]);

  const handleAvatarUpload = (response: UploadResponse) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${response.file.url}`;
    setAvatarUrl(fullUrl);
    setShowUploader(false);
  };

  const handleToggleInstrument = (instrument: string) => {
    if (instruments.includes(instrument)) {
      setInstruments(instruments.filter((i) => i !== instrument));
    } else {
      setInstruments([...instruments, instrument]);
    }
  };

  const handleAddCustomInstrument = () => {
    if (customInstrument.trim() && !instruments.includes(customInstrument.trim())) {
      setInstruments([...instruments, customInstrument.trim()]);
      setCustomInstrument("");
    }
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      name: name || undefined,
      avatarUrl: avatarUrl || undefined,
      instruments,
      phone: phone || undefined,
      bio: bio || undefined,
    });
    onClose();
  };

  const hasChanges =
    name !== (dbUser?.name || "") ||
    avatarUrl !== (dbUser?.avatarUrl || null) ||
    JSON.stringify(instruments) !== JSON.stringify(dbUser?.instruments || []) ||
    phone !== (dbUser?.phone || "") ||
    bio !== (dbUser?.bio || "");

  if (!dbUser) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header icon={<User size={24} />} subtitle={dbUser.email}>
        Mi Perfil
      </Modal.Header>

      <Modal.Body className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          {/* Current Avatar */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-100 border-4 border-surface-200/50 shadow-xl">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name || "Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-brand-blue-primary to-indigo-600">
                  <span className="text-4xl font-bold text-white">
                    {(name || dbUser.email)[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Edit Overlay */}
            {canEditProfile && (
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Camera size={24} className="text-white" />
              </button>
            )}
          </div>

          {/* Avatar Uploader */}
          {showUploader && canEditProfile && (
            <div className="w-full max-w-sm animate-fade-in">
              <FileDropzone
                type="image"
                label="Cambiar foto de perfil"
                description="Sube una imagen cuadrada"
                onUploadComplete={handleAvatarUpload}
              />
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canEditProfile}
            placeholder="Tu nombre completo"
            className="w-full bg-surface-100/50 border border-surface-200 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Instruments */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
            <Music2 size={16} />
            Instrumentos que tocas
          </label>

          {/* Selected Instruments */}
          {instruments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {instruments.map((instrument) => (
                <span
                  key={instrument}
                  className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue-primary/20 text-brand-blue-primary border border-brand-blue-primary/30 rounded-full text-sm font-medium"
                >
                  {instrument}
                  {canEditProfile && (
                    <button
                      onClick={() => handleToggleInstrument(instrument)}
                      className="ml-1 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Instrument Options */}
          {canEditProfile && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {INSTRUMENT_OPTIONS.filter((i) => !instruments.includes(i)).map(
                  (instrument) => (
                    <button
                      key={instrument}
                      onClick={() => handleToggleInstrument(instrument)}
                      className="px-3 py-1.5 bg-surface-100/50 text-gray-400 border border-surface-200 rounded-full text-sm hover:border-white/30 hover:text-white transition-all"
                    >
                      {instrument}
                    </button>
                  )
                )}
              </div>

              {/* Custom Instrument */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInstrument}
                  onChange={(e) => setCustomInstrument(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomInstrument()}
                  placeholder="Agregar otro instrumento..."
                  className="flex-1 bg-surface-100/50 border border-surface-200 rounded-xl px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none"
                />
                <button
                  onClick={handleAddCustomInstrument}
                  disabled={!customInstrument.trim()}
                  className="px-3 py-2 bg-surface-100 border border-surface-200 rounded-xl text-gray-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-50"
                >
                  <Plus size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
            <Phone size={16} />
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={!canEditProfile}
            placeholder="+1 (809) 000-0000"
            className="w-full bg-surface-100/50 border border-surface-200 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
            <FileText size={16} />
            Biografía
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!canEditProfile}
            placeholder="Cuéntanos sobre ti y tu experiencia musical..."
            rows={3}
            className="w-full bg-surface-100/50 border border-surface-200 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow/50 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Read-only notice for guests */}
        {!canEditProfile && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-sm">
            Solo los miembros activos de la banda pueden editar su perfil.
          </div>
        )}
      </Modal.Body>

      {/* Footer */}
      {canEditProfile && (
        <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-surface-100/30 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending || !hasChanges}
            className="flex items-center gap-2 px-5 py-2 bg-brand-yellow text-brand-blue-primary font-medium rounded-lg hover:bg-brand-yellow/90 transition-all disabled:opacity-50"
          >
            {updateProfile.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-brand-blue-primary/30 border-t-brand-blue-primary rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check size={18} />
                Guardar
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}
