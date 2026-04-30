import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ArrowRight, MapPin, CalendarDays, GraduationCap, Sparkles } from "lucide-react";
import brainBurst from "@/assets/brain-burst.png";
import { fetchSchools, fetchEvents, type SchoolEvent } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [schools, events] = await Promise.all([
      fetchSchools().catch(() => []),
      fetchEvents().catch(() => []),
    ]);
    const upcoming = events
      .filter((e: SchoolEvent) => new Date(e.start_date).getTime() >= Date.now())
      .sort((a: SchoolEvent, b: SchoolEvent) => +new Date(a.start_date) - +new Date(b.start_date))
      .slice(0, 3);
    return { schoolsCount: schools.length, upcoming };
  },
});

function Home() {
  const { schoolsCount, upcoming } = Route.useLoaderData();
  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-pop-pink/60 halftone" />
          <div className="absolute bottom-10 right-20 w-56 h-56 rounded-full bg-pop-blue/50 halftone" />
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-pop-yellow pop-border rounded-full text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3 h-3" /> Per chi fa la 3ª media
            </span>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-5">
              NON <span className="text-pop-red">SCERVELLARTI</span>,<br />
              TI AIUTIAMO <span className="bg-foreground text-background px-2 inline-block -rotate-2">NOI!</span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-foreground/80 max-w-lg mb-8">
              Tutte le scuole superiori della <strong>Vallagarina</strong> in un colpo solo:
              mappa interattiva, open day e info su ogni istituto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/istituti"
                className="inline-flex items-center gap-2 bg-pop-red text-white pop-border pop-shadow rounded-xl px-5 py-3 font-display text-xl tracking-wide hover:-translate-y-0.5 transition-transform"
              >
                <GraduationCap className="w-5 h-5" /> Esplora le scuole <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/mappa"
                className="inline-flex items-center gap-2 bg-pop-yellow pop-border pop-shadow rounded-xl px-5 py-3 font-display text-xl tracking-wide hover:-translate-y-0.5 transition-transform"
              >
                <MapPin className="w-5 h-5" /> Apri la mappa
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute inset-0 m-auto w-72 h-72 md:w-96 md:h-96 rounded-full bg-pop-yellow halftone -z-10" />
            <img
              src={brainBurst}
              alt="Cervello pop art con esplosione rosa"
              width={520}
              height={520}
              className="w-72 md:w-[28rem] animate-[float_6s_ease-in-out_infinite]"
            />
            <div className="absolute -top-4 right-2 md:right-10 bg-pop-pink pop-border pop-shadow rounded-2xl px-4 py-2 font-display text-2xl rotate-6">
              BOOM!
            </div>
            <div className="absolute bottom-0 -left-2 bg-pop-blue pop-border pop-shadow rounded-2xl px-4 py-2 font-display text-xl -rotate-6">
              Wow!
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 grid sm:grid-cols-3 gap-5 mt-2">
        {[
          { n: schoolsCount || "—", l: "Istituti in rete", c: "bg-pop-pink" },
          { n: upcoming.length, l: "Open Day in arrivo", c: "bg-pop-blue" },
          { n: "100%", l: "Gratis & senza account", c: "bg-pop-yellow" },
        ].map((s, i) => (
          <div key={i} className={`${s.c} pop-border pop-shadow rounded-2xl p-6`}>
            <div className="font-display text-5xl">{s.n}</div>
            <div className="text-sm font-bold uppercase tracking-wider mt-1">{s.l}</div>
          </div>
        ))}
      </section>

      {/* COMING UP */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-4xl md:text-5xl">📅 Prossimi Open Day</h2>
          <Link to="/openday" className="font-bold uppercase text-sm underline underline-offset-4">Vedi tutti →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="pop-card p-6">Nessun open day in programma al momento.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {upcoming.map((e: SchoolEvent) => {
              const d = new Date(e.start_date);
              const schoolName = typeof e.school === "object" ? e.school?.name : "Scuola";
              return (
                <article key={e.id} className="pop-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-pop-red text-white pop-border rounded-xl px-3 py-2 text-center">
                      <div className="font-display text-2xl leading-none">{d.getDate()}</div>
                      <div className="text-[10px] uppercase font-bold">{d.toLocaleDateString("it-IT", { month: "short" })}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold opacity-70">{schoolName}</div>
                      <div className="font-display text-xl leading-tight">{e.title}</div>
                    </div>
                  </div>
                  {e.location && <p className="text-sm flex items-center gap-1 opacity-80"><MapPin className="w-3 h-3" />{e.location}</p>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-foreground text-background pop-border-thick rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-pop-yellow halftone opacity-30" />
          <div className="relative">
            <CalendarDays className="w-10 h-10 mb-3" />
            <h3 className="font-display text-4xl md:text-5xl mb-3">PRONTO A SCEGLIERE?</h3>
            <p className="text-lg max-w-xl mb-6 opacity-90">
              Apri la mappa, trova la scuola più vicina, controlla quando puoi visitarla.
              Facile, no?
            </p>
            <Link to="/mappa" className="inline-flex items-center gap-2 bg-pop-yellow text-foreground pop-border rounded-xl px-5 py-3 font-display text-xl">
              <MapPin className="w-5 h-5" /> VAI ALLA MAPPA <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
      `}</style>
    </Layout>
  );
}
