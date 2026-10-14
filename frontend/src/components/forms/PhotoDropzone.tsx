// Zona para subir fotos arrastrando o seleccionando archivos

import { useState, useCallback, useRef, type DragEvent } from "react";
import inlineSvg0 from "@/img/photo.svg";
import clsx from "@/lib/clsx";

type PhotoDropzoneProps = {
  maxFiles?: number;
  maxSizeMB?: number;
  onPrimaryImageChange?: (imageUrl: string | undefined) => void;
  showPreviews?: boolean;
};

type PreviewFile = {
  file: File;
  url: string;
};

export function PhotoDropzone({ maxFiles = 3, maxSizeMB = 5, onPrimaryImageChange, showPreviews = true }: PhotoDropzoneProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newPreviews: PreviewFile[] = [];
      const remaining = maxFiles - previews.length;

      for (let i = 0; i < Math.min(files.length, remaining); i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        if (file.size > maxSizeMB * 1024 * 1024) continue;
        newPreviews.push({ file, url: URL.createObjectURL(file) });
      }

      setPreviews((prev) => {
        const next = [...prev, ...newPreviews];
        const primary = next[0]?.file;
        if (primary && onPrimaryImageChange) {
          const reader = new FileReader();
          reader.onload = () => onPrimaryImageChange(reader.result as string);
          reader.readAsDataURL(primary);
        }
        return next;
      });
    },
    [maxFiles, maxSizeMB, onPrimaryImageChange, previews.length]
  );

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      const next = prev.filter((_, i) => i !== index);
      if (onPrimaryImageChange) {
        const primary = next[0]?.file;
        if (primary) {
          const reader = new FileReader();
          reader.onload = () => onPrimaryImageChange(reader.result as string);
          reader.readAsDataURL(primary);
        } else {
          onPrimaryImageChange(undefined);
        }
      }
      return next;
    });
  };

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      {/* Vista previa de las fotos subidas */}
      {showPreviews && previews.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {previews.map((p, i) => (
            <div key={p.url} className="relative group">
              <img
                src={p.url}
                alt={p.file.name}
                className="h-20 w-20 rounded-lg object-cover border border-surface-200"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-signal-error text-white
                           flex items-center justify-center text-xs opacity-0 group-hover:opacity-100
                           transition-opacity"
                aria-label={`Eliminar ${p.file.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zona para arrastrar o seleccionar archivos */}
      {previews.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx("dropzone", isDragOver && "dropzone-active")}
        >
          {/* Icono de subida */}
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-forest-700/10 text-forest-700">
            <img src={inlineSvg0} width={"24"} height={"24"} alt="" />
          </div>

          <p className="text-sm font-medium text-ink-700">
            Arrastra tus fotografías aquí
          </p>
          <p className="text-xs text-ink-300 mt-1">
            JPG o PNG · Máximo {maxSizeMB} MB por archivo
          </p>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 btn-secondary text-sm !py-2 !px-4"
          >
            Seleccionar archivos
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
