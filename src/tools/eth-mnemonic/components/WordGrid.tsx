/** Mnemonic word grid: one numbered mini-card per word */
export function WordGrid({ words }: { words: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {words.map((word, index) => (
        <div
          key={`${index}-${word}`}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface-hover px-3 py-2"
        >
          <span className="w-5 shrink-0 text-right font-mono text-xs text-text-muted">
            {index + 1}
          </span>
          <span className="font-mono text-sm text-text">{word}</span>
        </div>
      ))}
    </div>
  );
}
