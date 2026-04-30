import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import {
  explainApiError,
  fetchSchool,
  fetchEventsForSchool,
  fileUrl,
  type SchoolEvent,
  type SchoolEmail,
  type SchoolPhone,
  type SchoolVideo,
} from "@/lib/api";
import {
  ArrowLeft,
  MapPin,
  Globe,
  Mail,
  Phone,
  Utensils,
  BedDouble,
  User,
  Hash,
  CalendarDays,
  PlayCircle,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { lazy, Suspense } from "react";

const SchoolsMap = lazy(() => import("@/components/SchoolsMap"));

export const Route = createFileRoute("/istituti/$id")({
  component: SchoolDetail,
  loader: async ({ params }) => {
    const school = await fetchSchool(params.id);
    const events = await fetchEventsForSchool(params.id).catch(() => [] as SchoolEvent[]);
    if (!school) throw notFound();
    return { school, events };
  },
  notFoundComponent: () => (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-5xl mb-3">Scuola non trovata</h1>
        <Link to="/istituti" className="underline font-bold">← Torna agli istituti</Link>
      </div>
    </Layout>
  ),
  errorComponent: SchoolDetailError,
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.school.name} — Non Scervellarti` },
          {
            name: "description",
            content:
              loaderData.school.description ||
              `Info, contatti, video e open day di ${loaderData.school.name}`,
          },
          { property: "og:title", content: loaderData.school.name },
          {
            property: "og:description",
            content:
              loaderData.school.description ||
              `Scopri ${loaderData.school.name} in Vallagarina.`,
          },
        ]
      : [{ title: "Istituto" }],
  }),
});

function SchoolDetailError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="pop-card bg-pop-yellow p-6 md:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-pop-red/30 halftone" />
          <AlertTriangle className="relative mx-auto mb-3 w-12 h-12 text-pop-red" />
          <h1 className="relative font-display text-4xl md:text-5xl mb-3">Errore nel caricamento</h1>
          <p className="relative text-lg font-bold mb-2">Non sono riuscito ad aprire i dettagli della scuola.</p>
          <p className="relative bg-card pop-border rounded-xl p-3 text-sm font-medium break-words">
            {explainApiError(error)}
          </p>
          {import.meta.env.DEV && error.message && (
            <pre className="relative mt-4 max-h-32 overflow-auto bg-foreground text-background pop-border rounded-xl p-3 text-left text-xs">
              {error.message}
            </pre>
          )}
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className="inline-flex items-center gap-2 bg-pop-red text-white pop-border pop-shadow rounded-xl px-5 py-3 font-display text-lg"
            >
              <RefreshCw className="w-4 h-4" /> Riprova
            </button>
            <Link to="/istituti" className="inline-flex items-center gap-2 bg-card pop-border pop-shadow rounded-xl px-5 py-3 font-display text-lg">
              <ArrowLeft className="w-4 h-4" /> Torna agli istituti
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

const TILE_BG = ["bg-pop-yellow", "bg-pop-pink", "bg-pop-blue"];

function SchoolDetail() {
  const { school, events } = Route.useLoaderData();
  const typeName = typeof school.type === "object" ? school.type?.name : null;
  const logo = fileUrl(school.logo, 300);

  const phones: SchoolPhone[] = school.school_phones ?? [];
  const emails: SchoolEmail[] = school.school_emails ?? [];
  const videos: SchoolVideo[] = school.videos ?? [];
  if (school.email && !emails.find((e) => e.email === school.email)) {
    emails.unshift({ id: "main", email: school.email, label: "principale" });
  }
  if (school.phone && !phones.find((p) => p.number === school.phone)) {
    phones.unshift({ id: "main", number: school.phone, label: "principale" });
  }

  return (
    <Layout>
      <article className="relative">
        {/* halftone bg blobs */}
        <div className="absolute inset-x-0 top-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-pop-pink/40 halftone" />
          <div className="absolute top-32 -right-20 w-96 h-96 rounded-full bg-pop-blue/30 halftone" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            to="/istituti"
            className="inline-flex items-center gap-1 font-bold text-sm uppercase mb-6 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Tutti gli istituti
          </Link>

          {/* HERO TITOLO */}
          <header className="pop-card p-6 md:p-8 mb-6 bg-pop-yellow relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-pop-red/30 halftone" />
            <div className="relative flex flex-col md:flex-row gap-6 items-start">
              <div className="w-28 h-28 md:w-32 md:h-32 bg-white pop-border rounded-2xl flex items-center justify-center overflow-hidden shrink-0 -rotate-3">
                {logo ? (
                  <img src={logo} alt={school.name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="font-display text-4xl">
                    {(school.short_name || school.name).slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {typeName && (
                  <div className="text-[11px] font-bold uppercase tracking-wider bg-foreground text-background inline-block px-2 py-1 rounded mb-2">
                    {typeName}
                  </div>
                )}
                <h1 className="font-display text-4xl md:text-6xl leading-[0.95] mb-2 break-words">
                  {school.name}
                </h1>
                {school.short_name && school.short_name !== school.name && (
                  <p className="text-lg font-bold opacity-70">"{school.short_name}"</p>
                )}
                {school.address && (
                  <p className="flex items-start gap-1 text-sm font-medium mt-2">
                    <MapPin className="w-4 h-4 mt-0.5" /> {school.address}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {school.canteen && (
                    <span className="text-[11px] font-bold uppercase bg-card pop-border rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Utensils className="w-3 h-3" /> Mensa
                    </span>
                  )}
                  {school.boarding && (
                    <span className="text-[11px] font-bold uppercase bg-card pop-border rounded-full px-2 py-0.5 flex items-center gap-1">
                      <BedDouble className="w-3 h-3" /> Convitto
                    </span>
                  )}
                  {school.main_campus && (
                    <span className="text-[11px] font-bold uppercase bg-pop-blue pop-border rounded-full px-2 py-0.5">
                      Sede principale
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* VIDEO */}
              {videos.length > 0 && (
                <section className="pop-card p-5 md:p-6">
                  <h2 className="font-display text-3xl mb-4 flex items-center gap-2">
                    <PlayCircle className="w-7 h-7 text-pop-red" /> Video presentazione
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {videos.map((v) => (
                      <VideoCard key={v.id} v={v} />
                    ))}
                  </div>
                </section>
              )}

              {school.description && (
                <section className="pop-card p-5 md:p-6 bg-pop-cream">
                  <h2 className="font-display text-3xl mb-2">📚 Cosa offre</h2>
                  <p className="opacity-90 text-lg">{school.description}</p>
                </section>
              )}

              {school.detailed_info && (
                <section className="pop-card p-5 md:p-6">
                  <h2 className="font-display text-3xl mb-2">ℹ️ Info dettagliate</h2>
                  <p className="whitespace-pre-line opacity-90">{school.detailed_info}</p>
                </section>
              )}

              {/* MAPPA */}
              {school.position && (
                <section className="pop-card p-5 md:p-6 bg-pop-blue/30">
                  <h2 className="font-display text-3xl mb-1">📍 Dove si trova</h2>
                  <p className="text-sm opacity-80 mb-4">
                    Clicca sul pin per vedere i dettagli o aprire la mappa completa.
                  </p>
                  <Suspense fallback={<div className="h-80 bg-muted rounded-xl animate-pulse" />}>
                    <SchoolsMap schools={[school]} focusId={school.id} height="380px" />
                  </Suspense>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${school.position.coordinates[1]}&mlon=${school.position.coordinates[0]}#map=17/${school.position.coordinates[1]}/${school.position.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm font-bold underline"
                  >
                    Apri in OpenStreetMap <ExternalLink className="w-3 h-3" />
                  </a>
                </section>
              )}

              {/* OPEN DAY */}
              <section className="pop-card p-5 md:p-6">
                <h2 className="font-display text-3xl mb-3 flex items-center gap-2">
                  <CalendarDays className="w-7 h-7" /> Open Day
                </h2>
                {events.length === 0 ? (
                  <p className="opacity-70">Nessun evento programmato.</p>
                ) : (
                  <ul className="space-y-3">
                    {events.map((e: SchoolEvent, i: number) => {
                      const d = new Date(e.start_date);
                      return (
                        <li
                          key={e.id}
                          className={`${TILE_BG[i % TILE_BG.length]} pop-border rounded-xl p-3 flex gap-3 items-start`}
                        >
                          <div className="bg-foreground text-background rounded-xl px-3 py-2 text-center shrink-0">
                            <div className="font-display text-2xl leading-none">{d.getDate()}</div>
                            <div className="text-[10px] uppercase font-bold">
                              {d.toLocaleDateString("it-IT", { month: "short" })}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-display text-xl leading-tight">{e.title}</div>
                            <div className="text-xs opacity-80 font-medium">
                              {d.toLocaleString("it-IT", {
                                weekday: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {e.location && ` · ${e.location}`}
                            </div>
                            {e.description && (
                              <p className="text-sm mt-1 opacity-90">{e.description}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>

            {/* SIDEBAR CONTATTI */}
            <aside className="space-y-4 self-start lg:sticky lg:top-24">
              {school.website_url && (
                <a
                  href={school.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="pop-card p-4 bg-pop-red text-white block hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-7 h-7" />
                    <div>
                      <div className="text-[10px] uppercase font-bold opacity-80">Sito web</div>
                      <div className="font-display text-lg leading-none">Visita il sito</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </div>
                </a>
              )}

              {emails.length > 0 && (
                <div className="pop-card p-4 bg-pop-cream">
                  <h3 className="font-display text-xl mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Email
                  </h3>
                  <ul className="space-y-2">
                    {emails.map((em) => (
                      <li key={em.id} className="text-sm">
                        {em.label && (
                          <div className="text-[10px] uppercase font-bold opacity-60">{em.label}</div>
                        )}
                        <a
                          href={`mailto:${em.email}`}
                          className="font-bold underline break-all hover:text-pop-red"
                        >
                          {em.email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {phones.length > 0 && (
                <div className="pop-card p-4 bg-pop-yellow">
                  <h3 className="font-display text-xl mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5" /> Telefono
                  </h3>
                  <ul className="space-y-2">
                    {phones.map((p) => (
                      <li key={p.id} className="text-sm">
                        {p.label && (
                          <div className="text-[10px] uppercase font-bold opacity-60">{p.label}</div>
                        )}
                        <a
                          href={`tel:${p.number.replace(/\s/g, "")}`}
                          className="font-bold underline hover:text-pop-red"
                        >
                          {p.number}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(school.responsabile_orientamento || school.miur_code) && (
                <div className="pop-card p-4 bg-pop-blue">
                  <h3 className="font-display text-xl mb-3">Info utili</h3>
                  <ul className="space-y-2 text-sm">
                    {school.responsabile_orientamento && (
                      <li className="flex items-start gap-2">
                        <User className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase font-bold opacity-70">
                            Resp. orientamento
                          </div>
                          <div className="font-bold">{school.responsabile_orientamento}</div>
                        </div>
                      </li>
                    )}
                    {school.miur_code && (
                      <li className="flex items-start gap-2 opacity-80">
                        <Hash className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] uppercase font-bold">Codice MIUR</div>
                          <div className="font-mono">{school.miur_code}</div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>
    </Layout>
  );
}

function VideoCard({ v }: { v: SchoolVideo }) {
  if (v.youtube_id) {
    return (
      <div className="pop-border rounded-xl overflow-hidden bg-foreground">
        <div className="aspect-video">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${v.youtube_id}`}
            title={v.title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {v.title && (
          <div className="bg-pop-yellow p-2 font-bold text-sm">{v.title}</div>
        )}
      </div>
    );
  }
  if (v.video_file) {
    const src = `https://made10.retescuolevallagarina.it/assets/${v.video_file}`;
    return (
      <div className="pop-border rounded-xl overflow-hidden bg-foreground">
        <video controls preload="metadata" className="w-full aspect-video bg-black">
          <source src={src} />
        </video>
        {v.title && (
          <div className="bg-pop-yellow p-2 font-bold text-sm">{v.title}</div>
        )}
      </div>
    );
  }
  return null;
}
