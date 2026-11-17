import { FileText, Upload, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { documentApi } from "@/apis/document.api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { KnowledgeDocument } from "@/types/document.type";
import { getErrorMessage } from "@/utils/api-error";
import { cn } from "@/utils/cn";
import { formatBytes } from "@/utils/format";

const MAX_MB = 20; // giả định, cần khớp giới hạn của backend

interface UploadDocumentModalProps {
  onClose: () => void;
  onUploaded: (doc: KnowledgeDocument) => void;
}

export default function UploadDocumentModal({
  onClose,
  onUploaded,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const choose = (candidate: File | undefined) => {
    if (!candidate) return;
    const isPdf =
      candidate.type === "application/pdf" ||
      candidate.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return reject("Only PDF files are supported.");
    if (candidate.size === 0) return reject("This file is empty.");
    if (candidate.size > MAX_MB * 1024 * 1024)
      return reject(`This file is larger than ${MAX_MB} MB.`);
    setError(null);
    setFile(candidate);
  };
  const reject = (message: string) => {
    setFile(null);
    setError(message);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (!uploading) choose(event.dataTransfer.files[0]);
  };

  const submit = async () => {
    if (!file) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      onUploaded(
        await documentApi.upload(file, {
          onProgress: setProgress,
          signal: controller.signal,
        }),
      );
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(getErrorMessage(err));
      setUploading(false);
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    onClose();
  };

  return (
    <Modal
      open
      title="Upload document"
      description="Add a PDF for the assistant to learn from."
      onClose={cancel}
      dismissible={!uploading}
      footer={
        <>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
          <Button onClick={submit} loading={uploading} disabled={!file}>
            Upload
          </Button>
        </>
      }
    >
      {!file ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging
              ? "border-primary-500 bg-primary-50"
              : "border-line bg-slate-50",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Upload className="size-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-ink">
            Drag and drop a PDF here
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            PDF only, up to {MAX_MB} MB
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => inputRef.current?.click()}
          >
            Browse files
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(event) => choose(event.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="rounded-card border border-line p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-50 text-primary-600">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {file.name}
              </p>
              <p className="text-xs text-ink-muted">
                PDF · {formatBytes(file.size)}
              </p>
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => setFile(null)}
              aria-label="Remove file"
              className="flex size-8 items-center justify-center rounded-control text-ink-muted hover:bg-slate-100 hover:text-ink disabled:opacity-40"
            >
              <X className="size-4" />
            </button>
          </div>
          {uploading && (
            <div
              className="mt-4"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-600 transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">
                {progress < 100 ? `Uploading… ${progress}%` : "Finishing up…"}
              </p>
            </div>
          )}
        </div>
      )}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-control bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </Modal>
  );
}
