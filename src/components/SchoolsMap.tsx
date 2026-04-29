import { useEffect, useRef } from "react";
import type { School } from "@/lib/api";

type Props = {
  schools: School[];
  height?: string;
  focusId?: string;
};

export default function SchoolsMap({ schools, height = "70vh", focusId }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      const points = schools
        .filter((s) => s.position?.coordinates)
        .map((s) => ({
          s,
          // Directus stores [lng, lat]
          lat: s.position!.coordinates[1],
          lng: s.position!.coordinates[0],
        }));

      const center: [number, number] =
        points.length > 0
          ? [
              points.reduce((a, p) => a + p.lat, 0) / points.length,
              points.reduce((a, p) => a + p.lng, 0) / points.length,
            ]
          : [45.89, 11.04];

      const map = L.map(ref.current, { scrollWheelZoom: true }).setView(center, 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const colors = ["#ff3b30", "#ffcc00", "#34c2ff", "#ff5fa2", "#000"];

      const markers: any[] = [];
      points.forEach((p, i) => {
        const color = colors[i % colors.length];
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:34px;height:34px;border-radius:50%;background:${color};border:3px solid #1a1a1a;box-shadow:3px 3px 0 #1a1a1a;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-family:Bangers,Impact,sans-serif;font-size:14px;">${(p.s.short_name || p.s.name).slice(0, 2).toUpperCase()}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        const m = L.marker([p.lat, p.lng], { icon }).addTo(map);
        const popup = `
          <div style="font-family:'Space Grotesk',sans-serif;min-width:200px;">
            <div style="font-family:Bangers,Impact,sans-serif;font-size:18px;line-height:1.1;margin-bottom:4px;">${escapeHtml(p.s.name)}</div>
            ${p.s.address ? `<div style="font-size:12px;color:#444;margin-bottom:6px;">${escapeHtml(p.s.address)}</div>` : ""}
            <a href="/istituti/${p.s.id}" style="display:inline-block;background:#000;color:#fff;font-weight:700;text-transform:uppercase;font-size:11px;padding:6px 10px;border-radius:6px;text-decoration:none;">Scopri →</a>
          </div>`;
        m.bindPopup(popup);
        if (focusId && p.s.id === focusId) {
          map.setView([p.lat, p.lng], 16);
          m.openPopup();
        }
        markers.push(m);
      });

      if (!focusId && points.length > 1) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [schools, focusId]);

  return (
    <div
      ref={ref}
      style={{ height }}
      className="w-full pop-border-thick rounded-xl overflow-hidden pop-shadow-lg bg-card"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
