import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoCervello from "@/assets/logo-cervello.png";
import iconHome from "@/assets/icon-home.png";
import iconBook from "@/assets/icon-book.png";
import iconPin from "@/assets/icon-pin.png";
import iconCalendar from "@/assets/icon-calendar.png";

const links = [
  { to: "/", label: "Home", icon: iconHome },
  { to: "/istituti", label: "Istituti", icon: iconBook },
  { to: "/mappa", label: "Mappa", icon: iconPin },
  { to: "/openday", label: "Open Day", icon: iconCalendar },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-[1000] bg-pop-yellow pop-border-thick border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={logoCervello}
            alt="Cervello"
            className="w-12 h-12 object-contain -rotate-6 group-hover:rotate-0 transition-transform"
          />
          <div className="leading-none">
            <div className="font-display text-2xl tracking-wide">NON SCERVELLARTI!</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Orientamento Vallagarina</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-2 rounded-lg font-bold uppercase text-sm flex items-center gap-2 hover:bg-pop-pink hover:pop-border transition-all"
              activeProps={{ className: "bg-foreground text-background pop-border" }}
              activeOptions={{ exact: to === "/" }}
            >
              <img src={Icon} alt="" className="w-4 h-4 object-contain" /> {label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="Apri menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-10 h-10 rounded-lg pop-border bg-card flex items-center justify-center"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t-[3px] border-foreground bg-pop-cream px-4 py-3 flex flex-col gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg font-bold uppercase text-sm flex items-center gap-2 hover:bg-pop-pink"
              activeProps={{ className: "bg-foreground text-background" }}
              activeOptions={{ exact: to === "/" }}
            >
              <img src={Icon} alt="" className="w-4 h-4 object-contain" /> {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
