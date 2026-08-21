"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  HEIFA_CATEGORY_LABELS,
  HEIFA_COMPONENT_CATEGORIES,
} from "@/lib/domain/heifa";

interface FormState {
  foodName: string;
  heifaCategory: string;
  servingQty: string;
  servingUnit: string;
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  sugarG: string;
}

const EMPTY: FormState = {
  foodName: "",
  heifaCategory: "",
  servingQty: "1",
  servingUnit: "serve",
  calories: "0",
  proteinG: "0",
  carbsG: "0",
  fatG: "0",
  sugarG: "0",
};

/** Empty string means "not entered"; the API applies its own defaults. */
function toNumber(value: string): number {
  const parsed = Number(value.trim());

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

const inputClass =
  "w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-white/20 dark:bg-white/5 dark:focus:border-emerald-400";

const labelClass = "flex flex-col gap-1 text-sm";

interface LookupResponse {
  fruit: { id: number; name: string };
  basisGrams: number;
  grams: number;
  macros: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    sugarG: number;
  };
}

function isLookupResponse(value: unknown): value is LookupResponse {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Partial<LookupResponse>;

  return (
    typeof candidate.fruit?.id === "number" &&
    typeof candidate.fruit.name === "string" &&
    typeof candidate.macros?.calories === "number"
  );
}

export function RecordForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [lookupTerm, setLookupTerm] = useState("");
  const [lookupState, setLookupState] = useState<
    { status: "idle" | "loading" } | { status: "error"; message: string } | { status: "filled"; name: string }
  >({ status: "idle" });
  /** Set when values came from FruityVice; cleared as soon as a field is edited. */
  const [fruityviceId, setFruityviceId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));

    // Once any field is edited by hand the values are no longer verbatim from
    // FruityVice, so the record must not claim that provenance.
    if (fruityviceId !== null) {
      setFruityviceId(null);
      setLookupState({ status: "idle" });
    }
  }

  async function handleLookup() {
    const term = lookupTerm.trim();
    if (term === "") return;

    setLookupState({ status: "loading" });

    try {
      const response = await fetch(
        `/api/nutrition/search?q=${encodeURIComponent(term)}`,
      );
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Lookup failed.";

        setLookupState({ status: "error", message });
        return;
      }

      if (!isLookupResponse(body)) {
        setLookupState({
          status: "error",
          message: "Unexpected response from the nutrition service.",
        });
        return;
      }

      // Prefill. FruityVice quotes per 100 g, so the serving is set to match.
      setForm((current) => ({
        ...current,
        foodName: body.fruit.name,
        heifaCategory: "fruit",
        servingQty: String(body.grams),
        servingUnit: "g",
        calories: String(body.macros.calories),
        proteinG: String(body.macros.proteinG),
        carbsG: String(body.macros.carbsG),
        fatG: String(body.macros.fatG),
        sugarG: String(body.macros.sugarG),
      }));
      setFruityviceId(body.fruit.id);
      setLookupState({ status: "filled", name: body.fruit.name });
    } catch {
      setLookupState({
        status: "error",
        message: "Could not reach the nutrition service.",
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: form.foodName,
          heifaCategory: form.heifaCategory === "" ? null : form.heifaCategory,
          servingQty: toNumber(form.servingQty),
          servingUnit: form.servingUnit,
          calories: toNumber(form.calories),
          proteinG: toNumber(form.proteinG),
          carbsG: toNumber(form.carbsG),
          fatG: toNumber(form.fatG),
          sugarG: toNumber(form.sugarG),
          source: fruityviceId === null ? "manual" : "fruityvice",
          fruityviceId,
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Could not save the record.";

        setError(message);
        return;
      }

      // Server Components hold the list, so refresh before navigating.
      router.push("/records");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/*
        Lookup is an optional convenience that sits above the form. Every field
        below stays editable whether or not it succeeds, so an upstream outage
        degrades to plain manual entry rather than blocking the page.
      */}
      <div className="flex flex-col gap-2 rounded-xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/15 dark:bg-white/[0.03]">
        <span className="text-sm font-medium">Look up a fruit</span>
        <p className="text-xs text-black/55 dark:text-white/55">
          Fills the fields below from FruityVice, per 100 g. Optional — you can
          type everything by hand.
        </p>

        <div className="flex gap-2">
          <input
            className={inputClass}
            value={lookupTerm}
            onChange={(e) => {
              setLookupTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              // The lookup button is type="button", but Enter in this field
              // would still submit the form; run the lookup instead.
              if (e.key === "Enter") {
                e.preventDefault();
                void handleLookup();
              }
            }}
            placeholder="banana"
            aria-label="Fruit name to look up"
          />
          <button
            type="button"
            onClick={() => void handleLookup()}
            disabled={lookupState.status === "loading" || lookupTerm.trim() === ""}
            className="shrink-0 rounded-md border border-black/15 px-3 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
          >
            {lookupState.status === "loading" ? "Looking up…" : "Look up"}
          </button>
        </div>

        {lookupState.status === "error" && (
          <p
            role="status"
            className="text-xs text-amber-700 dark:text-amber-300"
          >
            {lookupState.message} You can still enter the values manually.
          </p>
        )}

        {lookupState.status === "filled" && (
          <p
            role="status"
            className="text-xs text-emerald-700 dark:text-emerald-300"
          >
            Filled from FruityVice: {lookupState.name} (per 100 g). Edit
            anything below as needed.
          </p>
        )}
      </div>

      <label className={labelClass}>
        <span>Food name</span>
        <input
          className={inputClass}
          value={form.foodName}
          onChange={(e) => update("foodName", e.target.value)}
          required
          maxLength={200}
          placeholder="e.g. Banana"
        />
      </label>

      <label className={labelClass}>
        <span>
          HEIFA category{" "}
          <span className="text-black/45 dark:text-white/45">(optional)</span>
        </span>
        <select
          className={inputClass}
          value={form.heifaCategory}
          onChange={(e) => update("heifaCategory", e.target.value)}
        >
          <option value="">Uncategorised</option>
          {HEIFA_COMPONENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {HEIFA_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className={labelClass}>
          <span>Serving quantity</span>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            min="0.01"
            value={form.servingQty}
            onChange={(e) => update("servingQty", e.target.value)}
            required
          />
        </label>

        <label className={labelClass}>
          <span>Serving unit</span>
          <input
            className={inputClass}
            value={form.servingUnit}
            onChange={(e) => update("servingUnit", e.target.value)}
            required
            maxLength={32}
            placeholder="cup, g, medium"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/15">
        <legend className="px-1 text-sm text-black/60 dark:text-white/60">
          Nutrition (per serving)
        </legend>

        <label className={labelClass}>
          <span>Calories (kcal)</span>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            min="0"
            value={form.calories}
            onChange={(e) => update("calories", e.target.value)}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["proteinG", "Protein (g)"],
              ["carbsG", "Carbs (g)"],
              ["fatG", "Fat (g)"],
              ["sugarG", "Sugar (g)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={labelClass}>
              <span>{label}</span>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {error !== null && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black"
      >
        {submitting ? "Saving…" : "Save record"}
      </button>
    </form>
  );
}
