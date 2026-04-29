import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { fetchSchool, fetchEventsForSchool, fileUrl } from "@/lib/api";
import { ArrowLeft, MapPin, Globe, Mail, Phone, Utensils, BedDouble, User, Hash, CalendarDays } from "lucide-react";
import { lazy, Suspense } from "react";

const SchoolsMap = lazy(() => import("@/components/SchoolsMap"));

export const Route = createFileRoute("/istituti/$id")({
  component: SchoolDetail,
  loader: async ({ params }) => {
    try {
      const [school, events] = await Promise.all([
        fetchSchool(params.id),
        fetchEventsForSchool(params.id).catch(() => []),
      ]);
      if (!school) throw notFound();
      return { school, events };
    } catch {
      throw notFound();
    }
  },
  notFoundComponent: () => (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-5xl mb-3">Scuola non trovata</h1>
        <Link to="/istituti" className="underline font-bold">← Torna agli istituti</Link>
      </div>
    </Layout>
  ),
  errorComponent: ({ error }) => (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-4xl mb-3">Ops, errore</h1>
        <p className="opacity-80 mb-4">{error.message}</p>
        <Link to="/istituti" className="underline font-bold">← Torna agli istituti</Link>
      </div>
    </Layout>
  ),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.school.name} — Non Scervellarti` },
          { name: "description", content: loaderData.school.description || `Info, contatti e open day di ${loaderData.school.name}` },
        ]
      : [{ title: "Istituto" }],
  }),
});

function SchoolDetail() {
  const { school, events } = Route.useLoaderData();
  const typeName = typeof school.type === "object" ? school.type?.name : null;
  const logo = fileUrl(school.logo, 240);

  return (
    <Layout>
      <article className="max-w-5xl mx-auto px-4 py-10">
        <Link to="/istituti" className="inline-flex items-center gap-1 font-bold text-sm uppercase mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Tutti gli istituti
        </Link>

        <header className="pop-card p-6 md:p-8 mb-6 bg-pop-yellow">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-28 h-28 bg-white pop-border rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
              {logo ? (
                <img src={logo} alt="" className="w-full h-full object-contain p-2" />
              ) : (
                <span className="font-display text-3xl">{(school.short_name || school.name).slice(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              {typeName && (
                <div className="text-[11px] font-bold uppercase tracking-wider bg-foreground text-background inline-block px-2 py-1 rounded mb-2">
                  {typeName}
                </div>
              )}
              <h1 className="font-display text-4xl md:text-5xl leading-none mb-2">{school.name}</h1>
              {school.address && (
                <p className="flex items-start gap-1 text-sm font-medium"><MapPin className="w-4 h-4 mt-0.5" />{school.address}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {school.canteen && (
                  <span className="text-[11px] font-bold uppercase bg-card pop-border rounded-full px-2 py-0.5 flex items-center gap-1"><Utensils className="w-3 h-3" /> Mensa</span>
                )}
                {school.boarding && (
                  <span className="text-[11px] font-bold uppercase bg-card pop-border rounded-full px-2 py-0.5 flex items-center gap-1"><BedDouble className="w-3 h-3" /> Convitto</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {school.description && (
              <section className="pop-card p-6">
                <h2 className="font-display text-2xl mb-2">📚 Cosa offre</h2>
                <p className="opacity-90">{school.description}</p>
              </section>
            )}
            {school.detailed_info && (
              <section className="pop-card p-6">
                <h2 className="font-display text-2xl mb-2">ℹ️ Info dettagliate</h2>
                <p className="whitespace-pre-line opacity-90">{school.detailed_info}</p>
              </section>
            )}

            <section className="pop-card p-6">
              <h2 className="font-display text-2xl mb-3 flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Open Day</h2>
              {events.length === 0 ? (
                <p className="opacity-70">Nessun evento programmato.</p>
              ) : (
                <ul className="space-y-3">
                  {events.map((e) => {
                    const d = new Date(e.start_date);
                    return (
                      <li key={e.id} className="flex gap-3 items-start border-t-2 border-foreground/20 pt-3 first:border-0 first:pt-0">
                        <div className="bg-pop-red text-white pop-border rounded-xl px-3 py-2 text-center shrink-0">
                          <div className="font-display text-xl leading-none">{d.getDate()}</div>
                          <div className="text-[10px] uppercase font-bold">{d.toLocaleDateString("it-IT", { month: "short" })}</div>
                        </div>
                        <div className="min-w-0">
                          <div className="font-display text-lg leading-tight">{e.title}</div>
                          <div className="text-xs opacity-70">
                            {d.toLocaleString("it-IT", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                            {e.location && ` · ${e.location}`}
                          </div>
                          {e.description && <p className="text-sm mt-1 opacity-90">{e.description}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {school.position && (
              <section className="pop-card p-6">
                <h2 className="font-display text-2xl mb-3">📍 Dove si trova</h2>
                <Suspense fallback={<div className="h-80 bg-muted rounded-xl animate-pulse" />}>
                  <SchoolsMap schools={[school]} focusId={school.id} height="320px" />
                </Suspense>
              </section>
            )}
          </div>

          <aside className="space-y-3 self-start">
            <div className="pop-card p-5 bg-pop-blue">
              <h3 className="font-display text-xl mb-3">Contatti</h3>
              <ul className="space-y-2 text-sm">
                {school.website_url && (
                  <li><a className="flex items-center gap-2 font-bold underline break-all" href={school.website_url} target="_blank" rel="noreferrer"><Globe className="w-4 h-4 shrink-0" /> Sito ufficiale</a></li>
                )}
                {school.email && <li className="flex items-center gap-2 break-all"><Mail className="w-4 h-4 shrink-0" /> {school.email}</li>}
                {school.phone && <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> {school.phone}</li>}
                {school.responsabile_orientamento && (
                  <li className="flex items-center gap-2"><User className="w-4 h-4 shrink-0" /> {school.responsabile_orientamento}</li>
                )}
                {school.miur_code && (
                  <li className="flex items-center gap-2 opacity-80"><Hash className="w-4 h-4 shrink-0" /> {school.miur_code}</li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
}
