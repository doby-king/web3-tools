import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "./icons";

export interface SelectOption {
  value: string;
  label: string;
  /** Optional leading icon rendered before the label */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export type SelectOptionItem = SelectOption | SelectOptionGroup;

function isGroup(item: SelectOptionItem): item is SelectOptionGroup {
  return "options" in item;
}

/** Flatten groups into a plain list (for lookup and keyboard navigation) */
function flattenOptions(items: SelectOptionItem[]): SelectOption[] {
  return items.flatMap((item) => (isGroup(item) ? item.options : [item]));
}

/** Filter options / groups by a case-insensitive label match */
function filterOptions(
  items: SelectOptionItem[],
  query: string,
): SelectOptionItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items
    .map((item) => {
      if (!isGroup(item)) {
        return item.label.toLowerCase().includes(q) ? item : null;
      }
      const matched = item.options.filter((o) =>
        o.label.toLowerCase().includes(q),
      );
      return matched.length > 0 ? { ...item, options: matched } : null;
    })
    .filter((item): item is SelectOptionItem => item !== null);
}

export type SelectProps = {
  options: SelectOptionItem[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  /** Show a filter input inside the dropdown (useful for long lists) */
  searchable?: boolean;
} & (
  | { multiple?: false; value: string; onChange: (value: string) => void }
  | { multiple: true; value: string[]; onChange: (value: string[]) => void }
);

/**
 * Custom dropdown select matching the project's design language.
 * Supports single / multi select, option groups, type-to-filter search,
 * keyboard navigation, and closes on outside click or Escape.
 */
export function Select(props: SelectProps) {
  const { t } = useTranslation();
  const {
    options,
    placeholder,
    className,
    disabled = false,
    searchable = false,
  } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filtered view (search only applies while the panel is open)
  const visibleOptions = useMemo(
    () => (open && searchable ? filterOptions(options, query) : options),
    [options, open, searchable, query],
  );
  const flat = useMemo(() => flattenOptions(visibleOptions), [visibleOptions]);

  const selectedValues: string[] = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];

  const selectedOptions = flattenOptions(options).filter((o) =>
    selectedValues.includes(o.value),
  );

  // Reset filter and highlight when the panel closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setHighlightIndex(-1);
    }
  }, [open]);

  // Auto-focus the search input when the panel opens
  useEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keep the highlighted option visible while navigating with keyboard
  useEffect(() => {
    if (!open || highlightIndex < 0) return;
    listRef.current
      ?.querySelector('[data-highlighted="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, highlightIndex]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    if (props.multiple) {
      const current = props.value;
      const next = current.includes(option.value)
        ? current.filter((v) => v !== option.value)
        : [...current, option.value];
      props.onChange(next);
    } else {
      props.onChange(option.value);
      setOpen(false);
    }
  };

  const moveHighlight = (delta: number) => {
    if (flat.length === 0) return;
    setHighlightIndex((prev) => {
      let next = prev + delta;
      // Skip disabled options, wrapping around at the edges
      for (let i = 0; i < flat.length; i++) {
        if (next < 0) next = flat.length - 1;
        if (next >= flat.length) next = 0;
        if (!flat[next].disabled) return next;
        next += delta;
      }
      return prev;
    });
  };

  const openPanel = () => {
    setOpen(true);
    // Highlight the first selected (or first enabled) option
    const selectedIdx = flat.findIndex((o) => selectedValues.includes(o.value));
    setHighlightIndex(selectedIdx >= 0 ? selectedIdx : 0);
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) openPanel();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  /** Shared keyboard handling for the list (and the search input when searchable) */
  const handlePanelKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHighlight(-1);
    } else if (
      e.key === "Enter" &&
      highlightIndex >= 0 &&
      flat[highlightIndex]
    ) {
      e.preventDefault();
      handleSelect(flat[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Trigger label
  const triggerLabel =
    selectedOptions.length > 0
      ? selectedOptions.map((o) => o.label).join(", ")
      : placeholder;

  let flatIndex = -1;

  const renderOption = (option: SelectOption) => {
    flatIndex += 1;
    const index = flatIndex;
    const selected = selectedValues.includes(option.value);
    const highlighted = index === highlightIndex;

    return (
      <button
        key={option.value}
        type="button"
        role="option"
        aria-selected={selected}
        data-highlighted={highlighted || undefined}
        disabled={option.disabled}
        onClick={() => handleSelect(option)}
        onMouseEnter={() => setHighlightIndex(index)}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
          option.disabled
            ? "cursor-not-allowed text-text-muted opacity-50"
            : "cursor-pointer text-text",
          highlighted && !option.disabled && "bg-surface-hover",
          selected && "font-medium text-primary",
        )}
      >
        {option.icon && <span className="shrink-0">{option.icon}</span>}
        <span className="min-w-0 flex-1 truncate">{option.label}</span>
        {selected && <CheckIcon size={14} className="shrink-0 text-primary" />}
      </button>
    );
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openPanel())}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-border-strong bg-surface px-3 text-sm text-text",
          "transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-primary ring-2 ring-primary/25",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-left",
            selectedOptions.length === 0 && "text-text-muted",
          )}
        >
          {triggerLabel}
        </span>
        <ChevronDownIcon
          size={16}
          className={cn(
            "shrink-0 text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="animate-scale-in absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {/* Search filter */}
          {searchable && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <SearchIcon size={14} className="shrink-0 text-text-muted" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlightIndex(0);
                }}
                onKeyDown={handlePanelKeyDown}
                placeholder={t("common.search")}
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted"
              />
            </div>
          )}

          {/* Options list */}
          <div
            ref={listRef}
            role="listbox"
            aria-multiselectable={props.multiple || undefined}
            onKeyDown={searchable ? undefined : handlePanelKeyDown}
            tabIndex={searchable ? undefined : 0}
            className="max-h-64 overflow-y-auto py-1 outline-none"
          >
            {flat.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-text-muted">
                {t("common.noResults")}
              </p>
            ) : (
              visibleOptions.map((item) =>
                isGroup(item) ? (
                  <div key={item.label}>
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold text-text-muted">
                      {item.label}
                    </p>
                    {item.options.map(renderOption)}
                  </div>
                ) : (
                  renderOption(item)
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
