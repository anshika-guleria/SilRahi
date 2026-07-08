import { Loader2, Send, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { Field, inputClass } from "../components/Field";
import { api } from "../services/api";

const initialForm = {
  prompt: "Mujhe summer wedding ke liye lightweight lehenga chahiye",
  budget: "",
  ageGroup: "",
  location: "",
  comfort: "",
  bodyType: ""
};

function DetailPill({ label, value }) {
  if (!value) return null;
  return (
    <span className="rounded-lg border border-pink-100 bg-pink-50 px-3 py-2 text-xs font-bold text-rosewood">
      {label}: <span className="text-neutral-700">{value}</span>
    </span>
  );
}

function ResultList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 ring-1 ring-pink-100">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function StyleAdvisor({ setPage }) {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = Object.fromEntries(
      Object.entries(form).filter(([, value]) => String(value || "").trim() !== "")
    );

    try {
      setResult(await api.styleAdvisor(payload));
    } catch (err) {
      setError(err.message || "Style advisor failed.");
    } finally {
      setLoading(false);
    }
  }

  const recommendation = result?.recommendation || {};
  const extracted = result?.extracted || {};

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-950 via-[#1a0a1f] to-[#0f0a1e] px-4 py-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(190,24,93,0.18),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-pink-400">Ask SilRahi AI</p>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">AI Style Advisor</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">
              Natural language fashion query se fabric, color, design, budget range aur tailor category suggest karo.
            </p>
          </div>
          <button
            onClick={() => setPage("map")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/15 sm:w-fit"
          >
            Find Tailors
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-pink-50 text-rosewood">
              <Wand2 size={20} />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-neutral-950">Describe your outfit</h2>
              <p className="text-sm text-neutral-500">Optional details se recommendation aur accurate hogi.</p>
            </div>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            <Field label="Prompt">
              <textarea
                className={`${inputClass} min-h-32 resize-y`}
                value={form.prompt}
                onChange={(event) => update("prompt", event.target.value)}
                placeholder="Mujhe summer wedding ke liye lightweight lehenga chahiye"
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Budget">
                <input className={inputClass} type="number" min="1" value={form.budget} onChange={(event) => update("budget", event.target.value)} placeholder="1500" />
              </Field>
              <Field label="Age group">
                <select className={inputClass} value={form.ageGroup} onChange={(event) => update("ageGroup", event.target.value)}>
                  <option value="">Any</option>
                  <option value="teen">Teen</option>
                  <option value="young adult">Young adult</option>
                  <option value="adult">Adult</option>
                  <option value="senior">Senior</option>
                </select>
              </Field>
              <Field label="Location">
                <input className={inputClass} value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Jaunpur" />
              </Field>
              <Field label="Comfort">
                <select className={inputClass} value={form.comfort} onChange={(event) => update("comfort", event.target.value)}>
                  <option value="">Any</option>
                  <option value="high">High comfort</option>
                  <option value="medium">Medium</option>
                  <option value="low">Style first</option>
                </select>
              </Field>
              <Field label="Body type">
                <select className={inputClass} value={form.bodyType} onChange={(event) => update("bodyType", event.target.value)}>
                  <option value="">Any</option>
                  <option value="petite">Petite</option>
                  <option value="curvy">Curvy</option>
                  <option value="tall">Tall</option>
                  <option value="plus size">Plus size</option>
                </select>
              </Field>
            </div>

            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

            <Button disabled={loading} className="w-full sm:w-fit">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? "Thinking..." : "Ask SilRahi AI"}
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-6">
          {!result ? (
            <div className="grid min-h-96 place-items-center rounded-xl border border-dashed border-pink-100 bg-pink-50/60 p-8 text-center">
              <div>
                <Sparkles size={36} className="mx-auto text-rosewood" />
                <h2 className="mt-4 text-xl font-extrabold text-neutral-950">Recommendation card yaha dikhega</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
                  Prompt submit karte hi AI extracted style details aur final suggestion clean card me show karega.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="rounded-xl bg-gradient-to-r from-rosewood to-pink-600 p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-100">SilRahi recommendation</p>
                <h2 className="mt-2 text-2xl font-extrabold">{recommendation.design}</h2>
                <p className="mt-3 text-sm leading-6 text-pink-50">{recommendation.reason}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <DetailPill label="Occasion" value={extracted.occasion} />
                <DetailPill label="Season" value={extracted.season} />
                <DetailPill label="Garment" value={extracted.garment} />
                <DetailPill label="Style" value={extracted.style} />
                <DetailPill label="Comfort" value={extracted.comfort} />
                <DetailPill label="Source" value={result.source} />
              </div>

              <div className="grid gap-4 rounded-xl bg-neutral-50 p-4">
                <ResultList title="Fabric" items={recommendation.fabric} />
                <ResultList title="Colors" items={recommendation.color} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-white p-4 ring-1 ring-pink-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Estimated price</p>
                    <p className="mt-1 text-lg font-extrabold text-neutral-950">{recommendation.estimatedPrice}</p>
                  </div>
                  <div className="rounded-lg bg-white p-4 ring-1 ring-pink-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Tailor type</p>
                    <p className="mt-1 text-lg font-extrabold text-neutral-950">{recommendation.tailorType}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
