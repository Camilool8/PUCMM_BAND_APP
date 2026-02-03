"use client";

import { useState } from "react";
import {
  Play,
  X,
  Trash2,
  Video,
  Image as ImageIcon,
  FileText,
  Maximize2,
} from "lucide-react";
import type { Asset } from "@/lib/api";

interface MediaGalleryProps {
  assets: Asset[];
  onDelete?: (assetId: string) => void;
  isDeleting?: boolean;
  canDelete?: boolean;
}

export default function MediaGallery({
  assets,
  onDelete,
  isDeleting,
  canDelete = false,
}: MediaGalleryProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const videos = assets.filter((a) => a.type === "VIDEO");
  const images = assets.filter((a) => a.type === "AUDIO"); // Images stored as AUDIO type? Or we need IMAGE type
  const scores = assets.filter((a) => a.type === "SCORE");

  // For now, treat all non-SCORE assets as media (videos)
  const mediaAssets = assets.filter((a) => a.type !== "SCORE");

  const handleDelete = async (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    setDeletingId(assetId);
    await onDelete(assetId);
    setDeletingId(null);
  };

  const getAssetUrl = (asset: Asset) => {
    // If URL starts with /, prepend API URL
    if (asset.url.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_API_URL}${asset.url}`;
    }
    return asset.url;
  };

  const isVideo = (url: string) => {
    const videoExts = [".mp4", ".webm", ".mov", ".avi"];
    return videoExts.some((ext) => url.toLowerCase().includes(ext));
  };

  const isImage = (url: string) => {
    const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    return imageExts.some((ext) => url.toLowerCase().includes(ext));
  };

  if (mediaAssets.length === 0) {
    return (
      <div className="text-center py-8">
        <Video size={32} className="mx-auto text-gray-600 mb-2" />
        <p className="text-sm text-gray-500">No hay archivos multimedia</p>
      </div>
    );
  }

  return (
    <>
      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {mediaAssets.map((asset) => {
          const url = getAssetUrl(asset);
          const isVideoFile = isVideo(url);
          const isImageFile = isImage(url);
          const isCurrentlyDeleting = deletingId === asset.id;

          return (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className={`relative aspect-video rounded-xl overflow-hidden bg-surface-200 cursor-pointer group ${
                isCurrentlyDeleting ? "opacity-50" : ""
              }`}
            >
              {isVideoFile ? (
                <>
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={20} className="text-white ml-1" />
                    </div>
                  </div>
                </>
              ) : isImageFile ? (
                <>
                  <img
                    src={url}
                    alt={asset.name || "Image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <Maximize2
                      size={20}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText size={24} className="text-gray-500" />
                </div>
              )}

              {/* Asset name overlay */}
              {asset.name && (
                <div className="absolute bottom-0 inset-x-0 p-2 bg-linear-to-t from-black/70 to-transparent">
                  <p className="text-xs text-white truncate">{asset.name}</p>
                </div>
              )}

              {/* Delete button */}
              {canDelete && onDelete && (
                <button
                  onClick={(e) => handleDelete(asset.id, e)}
                  disabled={isCurrentlyDeleting}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                >
                  <Trash2 size={14} className="text-white" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox / Video Player Modal */}
      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedAsset(null)}
        >
          <button
            onClick={() => setSelectedAsset(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div
            className="max-w-4xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideo(getAssetUrl(selectedAsset)) ? (
              <video
                src={getAssetUrl(selectedAsset)}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-lg"
              />
            ) : isImage(getAssetUrl(selectedAsset)) ? (
              <img
                src={getAssetUrl(selectedAsset)}
                alt={selectedAsset.name || "Image"}
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            ) : null}

            {selectedAsset.name && (
              <p className="text-white text-center mt-4">{selectedAsset.name}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
