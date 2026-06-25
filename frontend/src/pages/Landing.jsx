import { useEffect, useRef, useState } from "react";
import {
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  ArrowRight,
  Scissors,
  TrendingUp,
  Users,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/Button";
import { useLang } from "../context/LanguageContext";

/* ── count-up hook ── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const inc = target / steps;
          let cur = 0;
          const id = setInterval(() => {
            cur += inc;
            if (cur >= target) { setCount(target); clearInterval(id); }
            else setCount(Math.floor(cur));
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

/* ── fade-in on scroll ── */
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── stat card ── */
function StatCard({ value, suffix, label }) {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="text-4xl font-extrabold text-rosewood">{count}{suffix}</span>
      <span className="mt-1 text-sm text-neutral-500">{label}</span>
    </div>
  );
}

/* ── feature card ── */
function FeatureCard({ icon: Icon, title, text, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`rounded-2xl border border-pink-100 bg-white p-7 shadow-sm transition-all duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="mb-4 inline-flex rounded-xl bg-pink-50 p-3">
        <Icon className="text-rosewood" size={24} />
      </div>
      <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
      <p className="mt-2 leading-relaxed text-neutral-600">{text}</p>
    </article>
  );
}

/* ── testimonial card ── */
function TestimonialCard({ name, role, quote, avatar, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`rounded-2xl bg-white border border-pink-100 p-6 shadow-sm transition-all duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-saffron text-saffron" />)}
      </div>
      <p className="text-neutral-700 leading-relaxed italic">"{quote}"</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rosewood to-amethyst flex items-center justify-center text-white font-bold text-sm">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-neutral-900 text-sm">{name}</p>
          <p className="text-xs text-neutral-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

/* ── step ── */
function Step({ n, title, text, delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex gap-4 transition-all duration-700
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
    >
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-rosewood text-white flex items-center justify-center font-extrabold text-sm">
        {n}
      </div>
      <div>
        <h4 className="font-bold text-neutral-900">{title}</h4>
        <p className="text-sm text-neutral-600 mt-1">{text}</p>
      </div>
    </div>
  );
}

/* ── service pill ── */
function ServicePill({ emoji, name, delay, onClick }) {
  const [ref, visible] = useFadeIn();
  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex flex-col items-center gap-2 rounded-2xl border border-pink-100 bg-white p-4 shadow-sm
        hover:border-rosewood hover:shadow-md hover:-translate-y-1 transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-xs font-semibold text-neutral-700 text-center">{name}</span>
    </button>
  );
}

/* ── CTA Banner ── */
function CtaBanner({ setPage, openAuth }) {
  const { t } = useLang();
  const [ref, visible] = useFadeIn();
  return (
    <section
      ref={ref}
      className={`mx-4 mb-16 rounded-3xl bg-gradient-to-br from-rosewood to-amethyst px-6 py-14 text-white text-center shadow-2xl transition-all duration-1000
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <div className="mx-auto max-w-2xl">
        <Scissors size={36} className="mx-auto mb-4 opacity-80" />
        <h2 className="text-3xl font-extrabold md:text-4xl">{t.ctaTitle}</h2>
        <p className="mt-3 text-pink-100 text-lg">{t.ctaDesc}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setPage("map")}
            className="flex items-center gap-2 rounded-xl bg-white text-rosewood font-bold px-8 py-3 hover:bg-pink-50 hover:scale-105 transition-all shadow-lg"
          >
            <MapPin size={17} /> {t.ctaCustomer}
          </button>
          <button
            onClick={() => openAuth("tailor")}
            className="flex items-center gap-2 rounded-xl bg-white/20 border border-white/40 text-white font-bold px-8 py-3 hover:bg-white/30 hover:scale-105 transition-all backdrop-blur-sm"
          >
            <Scissors size={17} /> {t.ctaTailor}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ════════════════ MAIN LANDING ════════════════ */
export function Landing({ setPage, openAuth }) {
  const { t } = useLang();
  const [heroRef, heroVisible] = useFadeIn();
  const [activeTab, setActiveTab] = useState("customer");

  const services = [
    { emoji: "👗", name: "Blouse / Choli" },
    { emoji: "👘", name: "Salwar Suit" },
    { emoji: "🥻", name: "Lehenga" },
    { emoji: "✂️", name: "Alteration" },
    { emoji: "🪡", name: "Embroidery" },
    { emoji: "🧵", name: "Custom Design" },
  ];

  const customerSteps = [
    { title: t.findTailorMap, text: t.findTailorMapDesc },
    { title: t.viewProfile, text: t.viewProfileDesc },
    { title: t.bookAppointment, text: t.bookAppointmentDesc },
    { title: t.pickupClothes, text: t.pickupClothesDesc },
  ];

  const tailorSteps = [
    { title: t.createProfile, text: t.createProfileDesc },
    { title: t.adminVerify, text: t.adminVerifyDesc },
    { title: t.receiveOrders, text: t.receiveOrdersDesc },
    { title: t.trackEarnings, text: t.trackEarningsDesc },
  ];

  const customerMini = [t.cStep1C, t.cStep2C, t.cStep3C, t.cStep4C];
  const tailorMini   = [t.cStep1T, t.cStep2T, t.cStep3T, t.cStep4T];

  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl" />

        <div
          ref={heroRef}
          className={`mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24 transition-all duration-1000
            ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* left */}
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-rosewood shadow-sm ring-1 ring-pink-100">
              <Sparkles size={15} className="animate-spin-slow" /> {t.badge}
            </span>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-neutral-950 md:text-6xl">
              {t.heroTitle1}{" "}
              <span className="bg-gradient-to-r from-rosewood to-amethyst bg-clip-text text-transparent">
                {t.heroTitle2}
              </span>{" "}
              {t.heroTitle3}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-neutral-600">{t.heroDesc}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setPage("map")} className="px-6 py-3 shadow-lg shadow-pink-200 hover:scale-105 transition-transform">
                <MapPin size={17} /> {t.findTailorBtn}
              </Button>
              <Button variant="secondary" onClick={() => openAuth("customer")} className="px-6 py-3 hover:scale-105 transition-transform">
                {t.customerLogin}
              </Button>
              <Button variant="dark" onClick={() => openAuth("tailor")} className="px-6 py-3 hover:scale-105 transition-transform">
                {t.tailorLogin}
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {[t.trust1, t.trust2, t.trust3].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 text-sm text-neutral-600">
                  <CheckCircle2 size={15} className="text-rosewood" /> {b}
                </span>
              ))}
            </div>
          </div>

          {/* right */}
          <div className="relative">
            <div className="absolute -top-4 -left-4 z-10 rounded-xl bg-white px-4 py-2 shadow-lg ring-1 ring-pink-100 flex items-center gap-2 animate-bounce-slow">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-neutral-700">{t.activeTailors}</span>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-2xl">
              <div className="rounded-xl bg-gradient-to-br from-rosewood to-amethyst p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-pink-200">{t.cardBadge}</p>
                <h2 className="mt-3 text-2xl font-extrabold leading-snug">{t.cardTitle}</h2>

                <div className="mt-6 grid gap-3">
                  {[
                    { Icon: ShieldCheck, text: t.feat1 },
                    { Icon: MapPin,      text: t.feat2 },
                    { Icon: TrendingUp,  text: t.feat3 },
                    { Icon: Users,       text: t.feat4 },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 rounded-lg bg-white/15 px-4 py-3 font-medium backdrop-blur-sm hover:bg-white/25 transition-colors cursor-default">
                      <Icon size={16} className="flex-shrink-0 text-pink-200" />
                      {text}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openAuth("tailor")}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-white text-rosewood font-bold py-3 hover:bg-pink-50 transition-colors"
                >
                  {t.joinTailorBtn} <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 z-10 rounded-xl bg-white px-4 py-2 shadow-lg ring-1 ring-pink-100">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-saffron text-saffron" />)}
              </div>
              <p className="text-xs font-semibold text-neutral-700 mt-0.5">{t.avgRating}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-8">
          <ChevronDown size={24} className="text-neutral-400 animate-bounce" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-pink-100">
        <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
          <StatCard value={1200} suffix="+" label={t.stat1Label} />
          <StatCard value={8500} suffix="+" label={t.stat2Label} />
          <StatCard value={42}   suffix=""  label={t.stat3Label} />
          <StatCard value={98}   suffix="%" label={t.stat4Label} />
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-rosewood uppercase tracking-widest">Services</span>
          <h2 className="mt-2 text-3xl font-extrabold text-neutral-900">{t.servicesTitle}</h2>
          <p className="mt-3 text-neutral-500">{t.servicesSubtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {services.map(({ emoji, name }, i) => (
            <ServicePill key={name} emoji={emoji} name={name} delay={i * 80} onClick={() => setPage("map")} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gradient-to-br from-pink-50 to-purple-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-rosewood uppercase tracking-widest">Process</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-900">{t.howTitle}</h2>
          </div>

          {/* tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-pink-100">
              {[
                ["customer", t.tabCustomer],
                ["tailor",   t.tabTailor],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
                    ${activeTab === key ? "bg-rosewood text-white shadow" : "text-neutral-600 hover:text-rosewood"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 items-center">
            <div className="grid gap-5">
              {(activeTab === "customer" ? customerSteps : tailorSteps).map((s, i) => (
                <Step key={i} n={i + 1} title={s.title} text={s.text} delay={i * 100} />
              ))}
            </div>

            <div className="rounded-2xl bg-white border border-pink-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rosewood to-amethyst flex items-center justify-center">
                  {activeTab === "customer"
                    ? <Users size={18} className="text-white" />
                    : <Scissors size={18} className="text-white" />}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-sm">
                    {activeTab === "customer" ? t.customerJourney : t.tailorJourney}
                  </p>
                  <p className="text-xs text-neutral-500">{t.simpleSteps}</p>
                </div>
              </div>
              <div className="grid gap-2">
                {(activeTab === "customer" ? customerMini : tailorMini).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-pink-50 px-4 py-2.5">
                    <span className="text-xs font-bold text-rosewood w-4">{i + 1}</span>
                    <span className="text-sm font-medium text-neutral-700">{s}</span>
                    <CheckCircle2 size={14} className="ml-auto text-rosewood" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => activeTab === "customer" ? setPage("map") : openAuth("tailor")}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg bg-rosewood text-white font-semibold py-2.5 hover:bg-pink-800 transition-colors text-sm"
              >
                {activeTab === "customer" ? t.findTailorCta : t.joinNowCta} <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-sm font-semibold text-rosewood uppercase tracking-widest">Features</span>
          <h2 className="mt-2 text-3xl font-extrabold text-neutral-900">{t.featuresTitle}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon={ShieldCheck}   title={t.f1Title} text={t.f1Desc} delay={0}   />
          <FeatureCard icon={HeartHandshake} title={t.f2Title} text={t.f2Desc} delay={150} />
          <FeatureCard icon={MapPin}         title={t.f3Title} text={t.f3Desc} delay={300} />
          <FeatureCard icon={Star}           title={t.f4Title} text={t.f4Desc} delay={0}   />
          <FeatureCard icon={TrendingUp}     title={t.f5Title} text={t.f5Desc} delay={150} />
          <FeatureCard icon={Sparkles}       title={t.f6Title} text={t.f6Desc} delay={300} />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gradient-to-br from-pink-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-10">
            <span className="text-sm font-semibold text-rosewood uppercase tracking-widest">Testimonials</span>
            <h2 className="mt-2 text-3xl font-extrabold text-neutral-900">{t.testimonialsTitle}</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { quote: t.t1Quote, name: t.t1Name, role: t.t1Role, avatar: "PS" },
              { quote: t.t2Quote, name: t.t2Name, role: t.t2Role, avatar: "RD" },
              { quote: t.t3Quote, name: t.t3Name, role: t.t3Role, avatar: "SM" },
              { quote: t.t4Quote, name: t.t4Name, role: t.t4Role, avatar: "GK" },
            ].map((item, i) => (
              <TestimonialCard key={i} {...item} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <CtaBanner setPage={setPage} openAuth={openAuth} />

    </main>
  );
}
