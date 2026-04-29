import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { fetchSchools, fetchSchoolTypes, fileUrl, type School, type SchoolType } from "@/lib/api";
import { Search, MapPin, ArrowUpRight, Utensils, BedDouble } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/istituti")({
  component: IstitutiPage,
  loader: async () => {
    const [schools, types] = await Promise.all([fetchSchools(), fetchSchoolTypes()]);
    return { schools, types };
  },
  head: () => ({
    meta: [
      { title: "Istituti — Non Scervellarti" },
      { name: "description", content: "Tutte le scuole superiori della Vallagarina, filtra per tipologia e trova quella adatta a te." },
    ],
  }),
});

function IstitutiPage() {
  const { schools, types } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [typeId, setTypeId] = useState<string>("all");

  const typeName = (s: School) =>
    typeof s.type === "object" ? s.type?.name : types.find((t: SchoolType) => t.id === s.type)?.name;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return (schools as School[]).filter((s: School) => {
      const t = typeof s.type === "object" ? s.type?.id : s.type;
      if (typeId !== "all" && t !== typeId) return false;
      if (!ql) return true;
      return (
        s.name.toLowerCase().includes(ql) ||
        (s.short_name?.toLowerCase().includes(ql) ?? false) ||
        (s.address?.toLowerCase().includes(ql) ?? false) ||
        (s.description?.toLowerCase().includes(ql) ?? false)
      );
    });
  }, [schools, q, typeId, types]);

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-display text-5xl md:text-6xl mb-2">🎓 Tutti gli Istituti</h1>
        <p className="text-lg opacity-80 mb-6">
          {schools.length} scuole superiori in Vallagarina. Filtra per tipologia o cerca quella che ti interessa.
        </p>

        <div className="grid md:grid-cols-[1fr_auto] gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca scuola, città, indirizzo…"
              className="w-full pl-10 pr-4 py-3 bg-card pop-border rounded-xl font-medium focus:outline-none focus:pop-shadow-sm"
            />
          </div>
          <TypeFilter types={types} value={typeId} onChange={setTypeId} />
        </div>

        {filtered.length === 0 ? (
          <div className="pop-card p-6 text-center">Nessuna scuola trovata.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s: School, i: number) => (
              <SchoolCard key={s.id} s={s} typeName={typeName(s)} colorIdx={i} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

function TypeFilter({
  types,
  value,
  onChange,
}: {
  types: SchoolType[];
  value: string;
  onChange: (v: string) => void;
}) {
  const opts = [{ id: "all", name: "Tutti i tipi" }, ...types];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-pop-yellow pop-border rounded-xl px-4 py-3 font-bold uppercase text-sm focus:outline-none cursor-pointer"
    >
      {opts.map((t) => (
        <option key={t.id} value={t.id}>{t.name}</option>
      ))}
    </select>
  );
}

const TILES = ["bg-pop-yellow", "bg-pop-pink", "bg-pop-blue", "bg-pop-cream"];

function SchoolCard({ s, typeName, colorIdx }: { s: School; typeName?: string | null; colorIdx: number }) {
  const logo = fileUrl(s.logo, 200);
  return (
    <Link
      to="/istituti/$id"
      params={{ id: s.id }}
      className="pop-card p-5 flex flex-col gap-3 group"
    >
      <div className={`${TILES[colorIdx % TILES.length]} pop-border rounded-xl p-3 flex items-center gap-3`}>
        <div className="w-14 h-14 bg-white pop-border rounded-xl flex items-center justify-center overflow-hidden shrink-0">
          {logo ? (
            <img src={logo} alt="" loading="lazy" className="w-full h-full object-contain p-1" />
          ) : (
            <span className="font-display text-xl">{(s.short_name || s.name).slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          {typeName && (
            <div className="text-[10px] font-bold uppercase tracking-wider bg-foreground text-background inline-block px-2 py-0.5 rounded mb-1">
              {typeName}
            </div>
          )}
          <div className="font-display text-xl leading-tight truncate">{s.name}</div>
        </div>
      </div>

      {s.description && <p className="text-sm opacity-80 line-clamp-3">{s.description}</p>}

      {s.address && (
        <p className="text-xs flex items-start gap-1 opacity-70">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {s.address}
        </p>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2">
        {s.canteen && (
          <span className="text-[10px] font-bold uppercase bg-pop-yellow pop-border rounded-full px-2 py-0.5 flex items-center gap-1">
            <Utensils className="w-3 h-3" /> Mensa
          </span>
        )}
        {s.boarding && (
          <span className="text-[10px] font-bold uppercase bg-pop-pink pop-border rounded-full px-2 py-0.5 flex items-center gap-1">
            <BedDouble className="w-3 h-3" /> Convitto
          </span>
        )}
        <span className="ml-auto text-xs font-bold uppercase flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          Scopri <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
