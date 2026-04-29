import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { fetchSchools } from "@/lib/api";
import { lazy, Suspense } from "react";

const SchoolsMap = lazy(() => import("@/components/SchoolsMap"));

export const Route = createFileRoute("/mappa")({
  component: MapPage,
  loader: () => fetchSchools(),
  head: () => ({
    meta: [
      { title: "Mappa scuole — Non Scervellarti" },
      { name: "description", content: "Mappa interattiva di tutte le scuole superiori della Vallagarina." },
    ],
  }),
});

function MapPage() {
  const schools = Route.useLoaderData();
  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="font-display text-5xl md:text-6xl mb-2">📍 Mappa delle Scuole</h1>
        <p className="text-lg opacity-80 mb-6">
          Clicca su un pin per scoprire ogni istituto. {schools.length} scuole geolocalizzate.
        </p>
        <Suspense fallback={<div className="h-[70vh] bg-muted rounded-xl animate-pulse pop-border" />}>
          <SchoolsMap schools={schools} />
        </Suspense>
      </section>
    </Layout>
  );
}
