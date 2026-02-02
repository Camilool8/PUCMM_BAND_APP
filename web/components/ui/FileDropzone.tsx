"use client";

import { useCallback, useState, useRef, type ReactNode } from "react";
import { Upload, X, FileImage, FileText, Film, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUpload,
  validateFile,
  formatFileSize,
  FILE_LIMITS,
  ALLOWED_TYPES,
} from "@/hooks/use-upload";
import type { UploadResponse } from "@/lib/api";

// ============================================================================
// Types
// ============================================================================

type UploadType = "image" | "pdf" | "video";

interface FileDropzoneProps {
  type: UploadType;
  onUploadComplete?: (response: UploadResponse) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

interface FilePreviewProps {
  file: File;
  type: UploadType;
  onRemove: () => void;
  progress: number;
  isUploading: boolean;
  error: string | null;
}

// ============================================================================
// File Type Config
// ============================================================================

const FILE_CONFIG: Record<
  UploadType,
  {
    icon: typeof FileImage;
    label: string;
    accept: string;
    description: string;
  }
> = {
  image: {
    icon: FileImage,
    label: "Imagen",
    accept: ALLOWED_TYPES.image.join(","),
    description: "JPG, PNG, WebP o GIF",
  },
  pdf: {
    icon: FileText,
    label: "PDF",
    accept: ALLOWED_TYPES.pdf.join(","),
    description: "Archivo PDF",
  },
  video: {
    icon: Film,
    label: "Video",
    accept: ALLOWED_TYPES.video.join(","),
    description: "MP4, WebM, MOV o AVI",
  },
};

// ============================================================================
// File Preview Component
// ============================================================================

function FilePreview({
  file,
  type,
  onRemove,
  progress,
  isUploading,
  error,
}: FilePreviewProps) {
  const Icon = FILE_CONFIG[type].icon;
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Generate image preview
  if (type === "image" && !imagePreview) {
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-surface-100/50 border",
        error
          ? "border-red-500/50 bg-red-500/10"
          : progress === 100
          ? "border-green-500/50 bg-green-500/10"
          : "border-surface-200/50"
      )}
    >
      {/* Preview / Icon */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-200/50 flex items-center justify-center shrink-0">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon size={24} className="text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mt-2 h-1.5 bg-surface-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-yellow transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </p>
        )}
      </div>

      {/* Status / Remove */}
      <div className="shrink-0">
        {isUploading ? (
          <span className="text-sm text-brand-yellow font-medium">{progress}%</span>
        ) : error ? (
          <button
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <X size={18} />
          </button>
        ) : progress === 100 ? (
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check size={16} className="text-green-400" />
          </div>
        ) : (
          <button
            onClick={onRemove}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Dropzone Component
// ============================================================================

export function FileDropzone({
  type,
  onUploadComplete,
  onError,
  className,
  disabled = false,
  label,
  description,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, progress, error, upload, reset } = useUpload(type);

  const config = FILE_CONFIG[type];
  const Icon = config.icon;
  const maxSize = formatFileSize(FILE_LIMITS[type]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file
      const validation = validateFile(file, type);
      if (!validation.valid) {
        onError?.(validation.error || "Archivo inválido");
        return;
      }

      setSelectedFile(file);
      reset();

      // Start upload
      const response = await upload(file);
      if (response) {
        onUploadComplete?.(response);
      }
    },
    [type, upload, reset, onUploadComplete, onError]
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, handleFileSelect]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
      // Reset input so the same file can be selected again
      e.target.value = "";
    },
    [handleFileSelect]
  );

  // Remove selected file
  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    reset();
  }, [reset]);

  // Open file picker
  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Dropzone */}
      {!selectedFile ? (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 p-8",
            "border-2 border-dashed rounded-2xl",
            "transition-all duration-200 cursor-pointer",
            isDragging
              ? "border-brand-yellow bg-brand-yellow/10 scale-[1.02]"
              : "border-surface-200 hover:border-white/30 hover:bg-surface-100/30",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Icon */}
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              "transition-colors duration-200",
              isDragging
                ? "bg-brand-yellow/20 text-brand-yellow"
                : "bg-surface-100 text-gray-400"
            )}
          >
            {isDragging ? (
              <Upload size={32} className="animate-bounce" />
            ) : (
              <Icon size={32} />
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            <p className="text-white font-medium">
              {label || `Subir ${config.label}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {description || `Arrastra y suelta o haz clic para seleccionar`}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              {config.description} - Máximo {maxSize}
            </p>
          </div>
        </div>
      ) : (
        // File Preview
        <FilePreview
          file={selectedFile}
          type={type}
          onRemove={handleRemove}
          progress={progress}
          isUploading={isUploading}
          error={error}
        />
      )}
    </div>
  );
}

export default FileDropzone;
