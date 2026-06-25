import { HeartHandshake, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "../components/Button";

export function Landing({ setPage, openAuth }) {
  return (
    <main>
      <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-rosewood shadow-sm">
              <Sparkles size={16} /> Silai se swarozgar
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-950 md:text-6xl">
              Find trusted women tailors near you.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              Silrahi helps customers book blouse, suit, lehenga, alteration, and embroidery work from verified women tailors.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => setPage("map")} className="px-6 py-3">
                <MapPin size={18} /> Find Tailors Near Me
              </Button>
              <Button variant="secondary" onClick={() => openAuth("customer")} className="px-6 py-3">
                Login as Customer
              </Button>
              <Button variant="dark" onClick={() => openAuth("tailor")} className="px-6 py-3">
                Login as Tailor
              </Button>
            </div>
          </div>
          <div className="rounded-lg border border-pink-100 bg-white p-5 shadow-xl">
            <div className="rounded-lg bg-gradient-to-br from-rosewood to-amethyst p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide text-pink-100">Women-led work</p>
              <h2 className="mt-3 text-3xl font-extrabold">Earn, grow, and manage orders in one place.</h2>
              <div className="mt-8 grid gap-3">
                {["Verified profiles", "Nearby map discovery", "Simple booking flow", "Hindi/English friendly"].map((item) => (
                  <div key={item} className="rounded-lg bg-white/15 p-4 font-semibold">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 md:grid-cols-3">
        {[
          [ShieldCheck, "Verified Tailors", "Admin verification helps customers book with confidence."],
          [HeartHandshake, "Empowerment First", "Designed for women tailors to manage income and availability."],
          [MapPin, "Map Based Search", "Customers can discover nearby tailors and book quickly."]
        ].map(([Icon, title, text]) => (
          <article key={title} className="rounded-lg border border-pink-100 bg-white p-6 shadow-sm">
            <Icon className="text-rosewood" />
            <h3 className="mt-4 text-xl font-bold">{title}</h3>
            <p className="mt-2 text-neutral-600">{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
