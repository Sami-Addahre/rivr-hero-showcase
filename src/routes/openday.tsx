import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { fetchEvents, type SchoolEvent } from "@/lib/api";
import { CalendarDays, MapPin, Wifi, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/openday")({
  component: OpenDayPage,
  loader: () => fetchEvents(),
  head: () => ({
    meta: [
      { title: "Open Day — Non Scervellarti" },
      { name: "description", content: "Calendario completo degli open day delle scuole superiori della Vallagarina." },
    ],
  }),
});

const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const DAYS_SHORT = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

function OpenDayPage() {
  const events = Route.useLoaderData() as SchoolEvent[];
  const today = new Date();
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, SchoolEvent[]>();
    for (const e of events) {
      const d = new Date(e.start_date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const monthGrid = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startWeekday = (first.getDay() + 6) % 7; // mon=0
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells: ({ date: Date } | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(view.y, view.m, d) });
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [view]);

  const upcoming = useMemo(
    () => events.filter((e: SchoolEvent) => new Date(e.start_date).getTime() >= Date.now() - 86400000)
      .sort((a: SchoolEvent, b: SchoolEvent) => +new Date(a.start_date) - +new Date(b.start_date)),
    [events]
  );

  const monthEvents = useMemo(
    () => events.filter((e: SchoolEvent) => {
      const d = new Date(e.start_date);
      return d.getFullYear() === view.y && d.getMonth() === view.m;
    }).sort((a: SchoolEvent, b: SchoolEvent) => +new Date(a.start_date) - +new Date(b.start_date)),
    [events, view]
  );

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-display text-5xl md:text-6xl mb-2 flex items-center gap-3">
          <CalendarDays className="w-10 h-10" /> Open Day
        </h1>
        <p className="text-lg opacity-80 mb-6">
          Tutti gli appuntamenti per visitare le scuole. Clicca su un giorno per vedere i dettagli.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="pop-card p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setView((v) => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))}
                className="bg-pop-yellow pop-border rounded-lg w-10 h-10 flex items-center justify-center hover:pop-shadow-sm"
                aria-label="Mese precedente"
              ><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="font-display text-3xl">{MONTHS[view.m]} {view.y}</h2>
              <button
                onClick={() => setView((v) => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))}
                className="bg-pop-yellow pop-border rounded-lg w-10 h-10 flex items-center justify-center hover:pop-shadow-sm"
                aria-label="Mese successivo"
              ><ChevronRight className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[11px] font-bold uppercase opacity-70">
              {DAYS_SHORT.map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((cell, i) => {
                if (!cell) return <div key={i} />;
                const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
                const dayEvents = eventsByDay.get(key) ?? [];
                const isToday =
                  cell.date.toDateString() === today.toDateString();
                return (
                  <div
                    key={i}
                    className={`aspect-square pop-border rounded-lg p-1 flex flex-col text-xs ${
                      dayEvents.length ? "bg-pop-pink" : "bg-card"
                    } ${isToday ? "ring-4 ring-pop-blue ring-offset-1 ring-offset-background" : ""}`}
                  >
                    <span className="font-bold">{cell.date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <span className="mt-auto self-end font-display text-base leading-none">{dayEvents.length}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <h3 className="font-display text-2xl mb-2">Eventi di {MONTHS[view.m]}</h3>
              {monthEvents.length === 0 ? (
                <p className="opacity-70 text-sm">Nessun evento questo mese.</p>
              ) : (
                <ul className="space-y-2">
                  {monthEvents.map((e: SchoolEvent) => <EventRow key={e.id} e={e} />)}
                </ul>
              )}
            </div>
          </div>

          <aside className="pop-card p-5 bg-pop-yellow self-start">
            <h3 className="font-display text-2xl mb-3">⚡ Prossimi eventi</h3>
            {upcoming.length === 0 ? (
              <p className="opacity-70 text-sm">Nessun evento in arrivo.</p>
            ) : (
              <ul className="space-y-2">
                {upcoming.slice(0, 8).map((e: SchoolEvent) => <EventRow key={e.id} e={e} compact />)}
              </ul>
            )}
          </aside>
        </div>
      </section>
    </Layout>
  );
}

type Ev = {
  id: string;
  title: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  is_online: boolean;
  online_link: string | null;
  description: string | null;
  school: string | { id: string; name: string; short_name?: string | null };
};

function EventRow({ e, compact = false }: { e: Ev; compact?: boolean }) {
  const d = new Date(e.start_date);
  const schoolName = typeof e.school === "object" ? e.school?.name : "Scuola";
  const schoolId = typeof e.school === "object" ? e.school?.id : (e.school as string);
  return (
    <li className="bg-card pop-border rounded-xl p-3 flex gap-3 items-start">
      <div className="bg-foreground text-background rounded-lg px-2 py-1 text-center shrink-0">
        <div className="font-display text-lg leading-none">{d.getDate()}</div>
        <div className="text-[9px] uppercase font-bold">{d.toLocaleDateString("it-IT", { month: "short" })}</div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-base leading-tight">{e.title}</div>
        {schoolId ? (
          <Link to="/istituti/$id" params={{ id: schoolId }} className="text-xs font-bold uppercase underline opacity-80">{schoolName}</Link>
        ) : (
          <div className="text-xs font-bold uppercase opacity-80">{schoolName}</div>
        )}
        {!compact && (
          <div className="text-xs mt-1 flex flex-wrap gap-x-3 gap-y-0.5 opacity-80">
            <span>{d.toLocaleString("it-IT", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
            {e.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</span>}
            {e.is_online && <span className="flex items-center gap-1"><Wifi className="w-3 h-3" />online</span>}
          </div>
        )}
      </div>
    </li>
  );
}
