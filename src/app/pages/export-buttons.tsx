"use client";

import { useState } from "react";
import type {
  VoterExportData,
  ResultsExportData,
  ExportFormat,
} from "@/app/shared/export";
import {
  formatVoterExport,
  formatResultsExport,
  voterExportFilename,
  resultsExportFilename,
  mimeTypeForFormat,
} from "@/app/shared/export";

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const FORMAT_LABELS: { format: ExportFormat; label: string; icon: string }[] = [
  { format: "json", label: "JSON", icon: "📋" },
  { format: "csv", label: "CSV", icon: "📊" },
  { format: "md", label: "Markdown", icon: "📝" },
];

interface ExportDropdownProps {
  label: string;
  onExport: (format: ExportFormat) => void;
}

function ExportDropdown({ label, onExport }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-indigo-500 hover:text-indigo-300"
      >
        ⬇️ {label}
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-1 min-w-[140px] rounded-xl border border-gray-700 bg-gray-900 py-1 shadow-xl">
          {FORMAT_LABELS.map(({ format, label: fmtLabel, icon }) => (
            <button
              key={format}
              type="button"
              onClick={() => {
                onExport(format);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-indigo-300"
            >
              {icon} {fmtLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Voter export button ────────────────────────────────────────

interface VoterExportButtonsProps {
  data: VoterExportData;
}

export function VoterExportButtons({ data }: VoterExportButtonsProps) {
  const handleExport = (format: ExportFormat) => {
    const content = formatVoterExport(data, format);
    const filename = voterExportFilename(data, format);
    const mime = mimeTypeForFormat(format);
    triggerDownload(content, filename, mime);
  };

  return <ExportDropdown label="Download votes" onExport={handleExport} />;
}

// ── Results export button ──────────────────────────────────────

interface ResultsExportButtonsProps {
  data: ResultsExportData;
}

export function ResultsExportButtons({ data }: ResultsExportButtonsProps) {
  const handleExport = (format: ExportFormat) => {
    const content = formatResultsExport(data, format);
    const filename = resultsExportFilename(data, format);
    const mime = mimeTypeForFormat(format);
    triggerDownload(content, filename, mime);
  };

  return <ExportDropdown label="Download results" onExport={handleExport} />;
}
