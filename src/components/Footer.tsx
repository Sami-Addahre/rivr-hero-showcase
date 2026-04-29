import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-foreground text-background pop-border-thick border-x-0 border-b-0">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-bold uppercase tracking-wider text-sm">
          Non Scervellarti — Orientamento Scuole Vallagarina
        </p>
        <p className="text-xs flex items-center gap-1 opacity-80">
          Dati da <a className="underline" href="https://made10.retescuolevallagarina.it" target="_blank" rel="noreferrer">Rete Scuole Vallagarina</a> · fatto con <Heart className="w-3 h-3 fill-pop-red text-pop-red" /> per la 3ª media
        </p>
      </div>
    </footer>
  );
}
