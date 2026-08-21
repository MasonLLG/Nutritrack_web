/**
 * Standing health disclaimer.
 *
 * NutriTrack shows dietary scores and logged intake. It is informational only
 * and must never present itself as diagnosis or treatment advice. This
 * component is reused wherever health figures or generated text are shown.
 */
export function Disclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <p className="rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
      {children ?? (
        <>
          Informational only. NutriTrack does not provide medical diagnosis or
          treatment recommendations. Speak to a qualified health professional
          about your diet.
        </>
      )}
    </p>
  );
}
