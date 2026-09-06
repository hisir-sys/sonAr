import { useEffect } from "react";

export default function Splash() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .sonar-ring-outer { animation: sonar-pulse 4s cubic-bezier(.22,1,.36,1) infinite; }
      .sonar-ring-inner { animation: sonar-snap 4s cubic-bezier(.22,1,.36,1) infinite; }
      .sonar-arc { animation: sonar-orbit 4s linear infinite; }
      .sonar-mark { animation: sonar-mark 4s cubic-bezier(.22,1,.36,1) infinite; }
      .sonar-globe { opacity: .82; }
      .sonar-word { isolation: isolate; }
      .sonar-letter-left, .sonar-letter-right { position: relative; z-index: 1; }
      .sonar-a { position: relative; z-index: 2; animation: sonar-a-anchor 4s cubic-bezier(.22,1,.36,1) infinite; }
      .sonar-letter-left { animation: sonar-letter-left 4s cubic-bezier(.22,1,.36,1) infinite; }
      .sonar-letter-right { animation: sonar-letter-right 4s cubic-bezier(.22,1,.36,1) infinite; }
      .sonar-globe-lat { position: absolute; left: 50%; border: 1px solid color-mix(in srgb, var(--foreground) 42%, transparent); border-radius: 50%; transform: translateX(-50%); }
      .sonar-globe-lon { position: absolute; top: 0; bottom: 0; left: 50%; border: 1px solid color-mix(in srgb, var(--foreground) 34%, transparent); border-radius: 50%; transform: translateX(-50%); }
      @keyframes sonar-pulse { 0%, 12% { opacity: 0; transform: scale(.72); } 28%, 82% { opacity: 1; transform: scale(1); } 100% { opacity: .3; transform: scale(1.12); } }
      @keyframes sonar-snap { 0%, 18% { opacity: 0; transform: scale(.55) rotate(-22deg); } 34%, 84% { opacity: 1; transform: scale(1) rotate(0); } 100% { opacity: .45; transform: scale(1.04) rotate(0); } }
      @keyframes sonar-orbit { 0%, 25% { opacity: 0; transform: rotate(-110deg) scale(.75); } 42%, 82% { opacity: 1; transform: rotate(322deg) scale(1); } 100% { opacity: .3; transform: rotate(430deg) scale(1); } }
      @keyframes sonar-mark { 0%, 20% { opacity: 0; transform: scale(0); } 34%, 80% { opacity: 1; transform: scale(1); } 100% { opacity: .25; transform: scale(1); } }
      @keyframes sonar-a-anchor { 0%, 12% { opacity: 0; transform: scale(.72); } 24%, 86% { opacity: 1; transform: scale(1); } 100% { opacity: .6; transform: scale(1); } }
      @keyframes sonar-letter-left { 0%, 18% { opacity: 0; transform: translateX(78px) scale(.84); } 34%, 86% { opacity: 1; transform: translateX(0) scale(1); } 100% { opacity: .6; transform: translateX(0) scale(1); } }
      @keyframes sonar-letter-right { 0%, 18% { opacity: 0; transform: translateX(-78px) scale(.84); } 34%, 86% { opacity: 1; transform: translateX(0) scale(1); } 100% { opacity: .6; transform: translateX(0) scale(1); } }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      id="splash"
      className="fixed inset-0 w-full h-full bg-background flex items-center justify-center relative overflow-hidden font-sans text-foreground"
    >
      {/* Sonar Globe Background */}
      <div
        className="sonar-globe pointer-events-none absolute bottom-[-8rem] left-1/2 z-0 h-[22rem] w-[50rem] -translate-x-1/2 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 top-0 h-[44rem] rounded-[50%] border border-foreground/50"></div>
        <div className="sonar-globe-lat top-[18%] h-[8rem] w-[92%]"></div>
        <div className="sonar-globe-lat top-[33%] h-[9rem] w-[98%]"></div>
        <div className="sonar-globe-lat top-[49%] h-[9rem] w-full"></div>
        <div className="sonar-globe-lat top-[65%] h-[8rem] w-[96%]"></div>
        <div className="sonar-globe-lat top-[80%] h-[7rem] w-[82%]"></div>
        <div className="sonar-globe-lon h-[44rem] w-[22%]"></div>
        <div className="sonar-globe-lon h-[44rem] w-[46%]"></div>
        <div className="sonar-globe-lon h-[44rem] w-[72%]"></div>
        <span className="absolute left-0 right-0 top-[49%] h-px bg-foreground/60"></span>
        <span className="absolute left-1/2 top-0 h-[22rem] w-px -translate-x-1/2 bg-foreground/45"></span>
      </div>

      {/* Central Sonar Ring & Typography Lockup */}
      <section className="relative z-10 flex flex-col items-center">
        <div className="relative flex h-[30rem] w-[30rem] items-center justify-center rounded-full border border-foreground/50 shadow-md sonar-ring-outer">
          <div className="absolute h-[25rem] w-[25rem] rounded-full border-2 border-foreground/90 sonar-ring-inner"></div>
          <div className="absolute h-[34rem] w-[34rem] rounded-full border border-foreground/30 sonar-ring-outer"></div>

          <span className="absolute -top-12 h-3 w-3 rounded-full bg-foreground shadow-md sonar-mark"></span>
          <span className="absolute -top-4 h-4 w-1 bg-foreground sonar-mark"></span>
          <span className="absolute -bottom-4 h-4 w-1 bg-foreground sonar-mark"></span>
          <span className="absolute -left-4 h-1 w-4 bg-foreground sonar-mark"></span>
          <span className="absolute -right-4 h-1 w-4 bg-foreground sonar-mark"></span>
          <span className="absolute left-12 top-20 h-16 w-1 rotate-45 bg-muted-foreground sonar-mark"></span>
          <span className="absolute right-12 top-20 h-16 w-1 -rotate-45 bg-muted-foreground sonar-mark"></span>

          <div className="absolute h-[20rem] w-[20rem] rounded-full border-t-4 border-foreground/90 border-r border-transparent border-b border-muted-foreground/60 border-l border-transparent rotate-[-38deg] sonar-arc"></div>

          <div className="sonar-word relative flex items-baseline justify-center">
            <span className="sonar-letter-left text-6xl font-heading font-medium tracking-tight text-foreground">
              son
            </span>
            <span className="sonar-a mx-1 text-8xl font-heading font-bold tracking-[-0.16em] text-primary">
              A
            </span>
            <span className="sonar-letter-right text-6xl font-heading font-medium tracking-tight text-foreground">
              r...
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-5">
          <span className="h-px w-28 bg-border"></span>
          <p className="text-xs font-medium uppercase tracking-[0.48em] text-muted-foreground">
            Signal Intelligence
          </p>
          <span className="h-px w-28 bg-border"></span>
        </div>
      </section>
    </div>
  );
}