import { useEffect, useRef, useState } from "react";
import {
  HeartHandshake, MapPin, ShieldCheck, Sparkles, Star, ArrowRight,
  Scissors, TrendingUp, Users, ChevronDown, CheckCircle2, Zap,
  Globe, Award, MessageCircle, Phone, Mail, Instagram, Twitter,
  Facebook, ChevronRight,
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
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── stat card ── */
function StatCard({ value, suffix, label, icon: Icon }) {
  const [count, ref] = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
      {Icon && <Icon size={22} className="text-pink-200 mb-1" />}
      <span className="text-4xl font-extrabold text-white tabular-nums">{count.toLocaleString()}{suffix}</span>
      <span className="text-sm text-pink-200 font-medium text-center">{label}</span>
    </div>
  );
}

/* ── feature card ── */
function FeatureCard({ icon: Icon, title, text, accent = "pink", delay = 0 }) {
  const [ref, visible] = useFadeIn();
  const accents = {
    pink: "bg-pink-50 text-rosewood group-hover:bg-pink-100",
    purple: "bg-purple-50 text-amethyst group-hover:bg-purple-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  };
  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group rounded-2xl border border-neutral-100 bg-white p-7 shadow-sm hover:shadow-md
        hover:-translate-y-1 transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className={`mb-4 inline-flex rounded-xl p-3 transition-colors ${accents[accent]}`}>
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-500">{text}</p>
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
      className={`rounded-2xl bg-white border border-neutral-100 p-6 shadow-sm hover:shadow-md
        hover:-translate-y-1 transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-saffron text-saffron" />)}
      </div>
      <p className="text-neutral-600 leading-relaxed text-sm italic mb-5">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rosewood to-amethyst flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-neutral-900 text-sm">{name}</p>
          <p className="text-xs text-neutral-400">{role}</p>
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
      className={`flex gap-5 transition-all duration-600
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
    >
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-rosewood to-amethyst text-white flex items-center justify-center font-extrabold text-sm shadow-lg shadow-pink-200">
        {n}
      </div>
      <div className="pt-1">
        <h4 className="font-bold text-neutral-900 text-sm">{title}</h4>
        <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{text}</p>
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
      className={`group flex flex-col items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm
        hover:border-rosewood hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{emoji}</span>
      <span className="text-xs font-semibold text-neutral-600 text-center group-hover:text-rosewood transition-colors">{name}</span>
    </button>
  );
}

/* ── SectionLabel ── */
function SectionLabel({ text }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-xs font-bold text-rosewood uppercase tracking-widest">
      <Sparkles size={11} />
      {text}
    </span>
  );
}

/* ── Footer ── */
function Footer({ setPage }) {
  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-rosewood/20 text-rosewood">
                <Scissors size={18} />
              </span>
              <span className="text-xl font-extrabold text-white">Silrahi</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              Connecting women tailors with customers across India. Empowering livelihoods, one stitch at a time.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-5">Platform</p>
            <ul className="space-y-3 text-sm">
              {[
                ["Home", "landing"], ["Find Tailors", "map"], ["Become a Tailor", "auth"],
              ].map(([label, pg]) => (
                <li key={label}>
                  <button onClick={() => setPage(pg)} className="hover:text-white transition-colors flex items-center gap-1.5 group">
                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -ml-1 transition-opacity" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-5">Services</p>
            <ul className="space-y-3 text-sm">
              {["Blouse / Choli", "Salwar Suit", "Lehenga", "Alteration", "Embroidery"].map((s) => (
                <li key={s}><span className="hover:text-white transition-colors cursor-default">{s}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-5">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail size={13} /> <span>hello@silrahi.in</span></li>
              <li className="flex items-center gap-2"><Phone size={13} /> <span>+91 98765 43210</span></li>
              <li className="flex items-center gap-2"><Globe size={13} /> <span>silrahi.in</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2024 Silrahi. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
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
    <main className="overflow-x-hidden bg-[#fafafa]">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-[#1a0a1f] to-[#0f0a1e] flex items-center">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[700px] rounded-full bg-rosewood/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amethyst/15 blur-[80px]" />
        <div className="pointer-events-none absolute top-20 left-0 h-60 w-60 rounded-full bg-pink-600/10 blur-[60px]" />

        <div
          ref={heroRef}
          className={`relative mx-auto grid max-w-7xl gap-12 px-4 py-12 w-full
            md:grid-cols-[1.2fr_0.8fr] md:py-16 transition-all duration-1000
            ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          {/* left */}
          <div className="flex flex-col justify-center">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-xs font-bold text-pink-300 uppercase tracking-widest">
              <Sparkles size={11} className="animate-spin-slow" /> {t.badge}
            </span>

            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-7xl">
              {t.heroTitle1}{" "}
              <span className="bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                {t.heroTitle2}
              </span>
              <br />{t.heroTitle3}
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-300">{t.heroDesc}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => setPage("map")}
                className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-rosewood to-pink-600 text-white font-bold px-7 py-3.5 hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-pink-900/40 text-sm"
              >
                <MapPin size={16} /> {t.findTailorBtn}
              </button>
              <button
                onClick={() => openAuth("customer")}
                className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/8 text-white font-bold px-7 py-3.5 hover:bg-white/15 hover:scale-105 transition-all backdrop-blur-sm text-sm"
              >
                {t.customerLogin}
              </button>
              <button
                onClick={() => openAuth("tailor")}
                className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/8 text-white font-bold px-7 py-3.5 hover:bg-white/15 hover:scale-105 transition-all backdrop-blur-sm text-sm"
              >
                <Scissors size={15} /> {t.tailorLogin}
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-5">
              {[t.trust1, t.trust2, t.trust3].map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
                  <CheckCircle2 size={14} className="text-pink-400" /> {b}
                </span>
              ))}
            </div>
          </div>

          {/* right — floating card */}
          <div className="relative hidden md:block">
            {/* floating badge top */}
            <div className="absolute -top-4 -left-6 z-10 rounded-xl bg-white px-4 py-2.5 shadow-2xl flex items-center gap-2.5 animate-bounce-slow">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-neutral-700">{t.activeTailors}</span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-1.5 shadow-2xl">
              <div className="rounded-2xl bg-gradient-to-br from-rosewood via-pink-700 to-amethyst p-7 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-pink-200 mb-4">{t.cardBadge}</p>
                <h2 className="text-2xl font-extrabold leading-snug mb-7">{t.cardTitle}</h2>

                <div className="grid gap-3">
                  {[
                    { Icon: ShieldCheck, text: t.feat1 },
                    { Icon: MapPin,      text: t.feat2 },
                    { Icon: TrendingUp,  text: t.feat3 },
                    { Icon: Globe,       text: t.feat4 },
                  ].map(({ Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 rounded-xl bg-white/12 px-4 py-3 text-sm font-medium backdrop-blur-sm hover:bg-white/20 transition-colors cursor-default">
                      <Icon size={15} className="flex-shrink-0 text-pink-200" />
                      {text}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => openAuth("tailor")}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-white text-rosewood font-bold py-3 text-sm hover:bg-pink-50 transition-colors shadow-lg"
                >
                  {t.joinTailorBtn} <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* floating badge bottom */}
            <div className="absolute -bottom-4 -right-4 z-10 rounded-xl bg-white px-4 py-2.5 shadow-2xl">
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-saffron text-saffron" />)}
              </div>
              <p className="text-xs font-semibold text-neutral-700">{t.avgRating}</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <ChevronDown size={22} className="text-white/30 animate-bounce" />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-gradient-to-r from-rosewood via-pink-700 to-amethyst">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard value={1200} suffix="+" label={t.stat1Label} icon={Scissors} />
            <StatCard value={8500} suffix="+" label={t.stat2Label} icon={CheckCircle2} />
            <StatCard value={42}   suffix=""  label={t.stat3Label} icon={Globe} />
            <StatCard value={98}   suffix="%" label={t.stat4Label} icon={Award} />
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <SectionLabel text="Services" />
          <h2 className="mt-4 text-4xl font-extrabold text-neutral-900 tracking-tight">{t.servicesTitle}</h2>
          <p className="mt-3 text-neutral-500 max-w-md mx-auto">{t.servicesSubtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {services.map(({ emoji, name }, i) => (
            <ServicePill key={name} emoji={emoji} name={name} delay={i * 70} onClick={() => setPage("map")} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-neutral-950 py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(190,24,93,0.15),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-bold text-pink-300 uppercase tracking-widest">
              <Zap size={11} /> Process
            </span>
            <h2 className="mt-4 text-4xl font-extrabold text-white tracking-tight">{t.howTitle}</h2>
          </div>

          {/* tab switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl bg-white/8 p-1 border border-white/10">
              {[["customer", t.tabCustomer], ["tailor", t.tabTailor]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-7 py-2.5 rounded-lg text-sm font-semibold transition-all
                    ${activeTab === key
                      ? "bg-gradient-to-r from-rosewood to-pink-600 text-white shadow-lg"
                      : "text-neutral-400 hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="grid gap-6">
              {(activeTab === "customer" ? customerSteps : tailorSteps).map((s, i) => (
                <Step key={i} n={i + 1} title={s.title} text={s.text} delay={i * 100} />
              ))}
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-7 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rosewood to-amethyst flex items-center justify-center shadow-lg">
                  {activeTab === "customer"
                    ? <Users size={17} className="text-white" />
                    : <Scissors size={17} className="text-white" />}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {activeTab === "customer" ? t.customerJourney : t.tailorJourney}
                  </p>
                  <p className="text-xs text-neutral-500">{t.simpleSteps}</p>
                </div>
              </div>
              <div className="grid gap-2.5">
                {(activeTab === "customer" ? customerMini : tailorMini).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-white/8 border border-white/8 px-4 py-3">
                    <span className="text-xs font-bold text-pink-400 w-5">{i + 1}</span>
                    <span className="text-sm font-medium text-neutral-200">{s}</span>
                    <CheckCircle2 size={13} className="ml-auto text-pink-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
              <button
                onClick={() => activeTab === "customer" ? setPage("map") : openAuth("tailor")}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rosewood to-pink-600 text-white font-bold py-3 text-sm hover:opacity-90 transition-opacity shadow-lg"
              >
                {activeTab === "customer" ? t.findTailorCta : t.joinNowCta} <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center mb-12">
          <SectionLabel text="Features" />
          <h2 className="mt-4 text-4xl font-extrabold text-neutral-900 tracking-tight">{t.featuresTitle}</h2>
          <p className="mt-3 text-neutral-500 max-w-md mx-auto">Everything you need, built into one platform.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon={ShieldCheck}    title={t.f1Title} text={t.f1Desc} accent="pink"   delay={0}   />
          <FeatureCard icon={HeartHandshake} title={t.f2Title} text={t.f2Desc} accent="purple" delay={100} />
          <FeatureCard icon={MapPin}         title={t.f3Title} text={t.f3Desc} accent="amber"  delay={200} />
          <FeatureCard icon={Star}           title={t.f4Title} text={t.f4Desc} accent="amber"  delay={0}   />
          <FeatureCard icon={TrendingUp}     title={t.f5Title} text={t.f5Desc} accent="pink"   delay={100} />
          <FeatureCard icon={Sparkles}       title={t.f6Title} text={t.f6Desc} accent="purple" delay={200} />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-neutral-50 border-y border-neutral-100 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center mb-12">
            <SectionLabel text="Testimonials" />
            <h2 className="mt-4 text-4xl font-extrabold text-neutral-900 tracking-tight">{t.testimonialsTitle}</h2>
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

      {/* ── CTA BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-[#1a0a1f] to-amethyst py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(190,24,93,0.25),transparent_65%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Scissors size={40} className="mx-auto mb-5 text-pink-400 opacity-80" />
          <h2 className="text-4xl font-extrabold text-white md:text-5xl leading-tight">{t.ctaTitle}</h2>
          <p className="mt-4 text-lg text-neutral-300 max-w-xl mx-auto">{t.ctaDesc}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setPage("map")}
              className="flex items-center gap-2 rounded-xl bg-white text-rosewood font-bold px-9 py-3.5 hover:bg-pink-50 hover:scale-105 transition-all shadow-2xl text-sm"
            >
              <MapPin size={16} /> {t.ctaCustomer}
            </button>
            <button
              onClick={() => openAuth("tailor")}
              className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 text-white font-bold px-9 py-3.5 hover:bg-white/18 hover:scale-105 transition-all backdrop-blur-sm text-sm"
            >
              <Scissors size={16} /> {t.ctaTailor}
            </button>
          </div>

          {/* mini trust row */}
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            {[t.trust1, t.trust2, t.trust3].map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
                <CheckCircle2 size={14} className="text-pink-400" /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer setPage={setPage} />

    </main>
  );
}
