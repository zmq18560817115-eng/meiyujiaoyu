import React, { useEffect, useId, useRef, useState } from "react";

export interface NupulSelectOption {
  value: string;
  label: string;
}

interface NupulSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: NupulSelectOption[];
  className?: string;
  "aria-label"?: string;
}

export const NupulSelect: React.FC<NupulSelectProps> = ({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected =
    options.find((opt) => opt.value === value)?.label ?? options[0]?.label ?? "";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={`nupul-select-wrap ${className ?? ""}`}>
      <button
        type="button"
        className="nupul-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="nupul-select-value">{selected}</span>
        <span className="nupul-select-chevron" aria-hidden />
      </button>

      {open && (
        <ul id={listId} className="nupul-select-menu" role="listbox">
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`nupul-select-option${isActive ? " is-active" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
