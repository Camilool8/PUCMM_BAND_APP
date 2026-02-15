"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Pencil, X, Navigation, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import MapPickerDynamic from "@/components/ui/MapPickerDynamic";
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from "@/hooks/use-locations";
import type { Location } from "@/lib/api";

interface LocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationsModal({ isOpen, onClose }: LocationsModalProps) {
  const { data: locations, isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radiusMeters, setRadiusMeters] = useState("200");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setShowForm(false);
    setEditingLocation(null);
    setName("");
    setAddress("");
    setLatitude(null);
    setLongitude(null);
    setRadiusMeters("200");
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setName(location.name);
    setAddress(location.address || "");
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    setRadiusMeters(String(location.radiusMeters));
    setShowForm(true);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleAddressFound = (foundAddress: string) => {
    if (!address.trim()) {
      setAddress(foundAddress.split(",").slice(0, 2).join(",").trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude === null || longitude === null) return;

    const data = {
      name: name.trim(),
      address: address.trim() || undefined,
      latitude,
      longitude,
      radiusMeters: parseInt(radiusMeters, 10) || 200,
    };

    if (editingLocation) {
      await updateLocation.mutateAsync({ id: editingLocation.id, data });
    } else {
      await createLocation.mutateAsync(data);
    }

    resetForm();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteLocation.mutateAsync(id);
    setDeletingId(null);
  };

  const isPending = createLocation.isPending || updateLocation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        icon={<MapPin size={24} />}
        subtitle="Ubicaciones predefinidas para ensayos"
      >
        Ubicaciones
      </Modal.Header>

      <Modal.Body className="space-y-4">
        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-surface-200 text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <Plus size={16} />
            <span className="text-sm">Agregar ubicación</span>
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-surface-100/50 border border-surface-200/50 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 font-medium">
                {editingLocation ? "Editar ubicación" : "Nueva ubicación"}
              </span>
              <button type="button" onClick={resetForm} className="p-1 text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre (ej: Auditorio PUCMM)"
              className="w-full bg-surface-100 border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
            />

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Dirección (opcional)"
              className="w-full bg-surface-100 border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
            />

            {/* Map Picker */}
            <div className="space-y-2">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">
                Ubicación en el mapa (haz clic o busca)
              </label>
              <MapPickerDynamic
                latitude={latitude}
                longitude={longitude}
                radiusMeters={parseInt(radiusMeters, 10) || 200}
                onLocationChange={handleMapLocationChange}
                onAddressFound={handleAddressFound}
              />

              {/* Coordinate display + Use my location */}
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] text-gray-600 font-mono">
                  {latitude !== null && longitude !== null
                    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    : "Sin coordenadas"}
                </div>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-[10px] transition-all disabled:opacity-50 shrink-0"
                >
                  {isGettingLocation ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Navigation size={12} />
                  )}
                  {isGettingLocation ? "Obteniendo..." : "Mi ubicación"}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">
                Radio de validación (metros)
              </label>
              <input
                type="number"
                min="50"
                max="1000"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                className="w-full bg-surface-100 border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !name.trim() || latitude === null || longitude === null}
              className="w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              {isPending ? "Guardando..." : editingLocation ? "Guardar cambios" : "Crear ubicación"}
            </button>
          </form>
        )}

        {/* Locations List */}
        {isLoading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-50 animate-shimmer" />
            ))}
          </div>
        )}

        {!isLoading && locations && locations.length > 0 && (
          <div className="space-y-1.5">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-100/50 border border-surface-200/30 group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium truncate">{location.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {location.address && (
                      <p className="text-xs text-gray-500 truncate">{location.address}</p>
                    )}
                    <span className="text-[10px] text-gray-600 shrink-0">{location.radiusMeters}m</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(location)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    disabled={deletingId === location.id}
                    className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!locations || locations.length === 0) && !showForm && (
          <div className="text-center py-6">
            <MapPin size={32} className="mx-auto text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">No hay ubicaciones definidas</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
