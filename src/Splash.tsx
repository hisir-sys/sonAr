import { useEffect } from "react";

export default function Splash() {
  useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `
      /* =========================================
         SONAR POSITION
         ========================================= */

      .sonar-stage {
        position: absolute;
        left: 50%;
        bottom: clamp(6rem, 10vh, 8rem);
        transform: translateX(-50%);
        transform-origin: center bottom;
      }

      /* =========================================
         ANIMATIONS
         ========================================= */

      .sonar-ring-outer {
        animation: sonar-pulse 4s cubic-bezier(.22,1,.36,1) infinite;
      }

      .sonar-ring-inner {
        animation: sonar-snap 4s cubic-bezier(.22,1,.36,1) infinite;
      }

      .sonar-arc {
        animation: sonar-orbit 4s linear infinite;
      }

      .sonar-mark {
        animation: sonar-mark 4s cubic-bezier(.22,1,.36,1) infinite;
      }

      .sonar-globe {
        opacity: .82;
      }

      .sonar-word {
        isolation: isolate;
      }

      .sonar-letter-left,
      .sonar-letter-right {
        position: relative;
        z-index: 1;
      }

      .sonar-a {
        position: relative;
        z-index: 2;
        animation: sonar-a-anchor 4s cubic-bezier(.22,1,.36,1) infinite;
      }

      /* =========================================
         GLOBE GRID
         ========================================= */

      .sonar-globe-lat {
        position: absolute;
        left: 50%;
        border: 1px solid color-mix(
          in srgb,
          var(--foreground) 60%,
          transparent
        );
        border-radius: 50%;
        transform: translateX(-50%);
      }

      .sonar-globe-lon {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        border: 1px solid color-mix(
          in srgb,
          var(--foreground) 52%,
          transparent
        );
        border-radius: 50%;
        transform: translateX(-50%);
      }

      /* =========================================
         PULSE
         ========================================= */

      @keyframes sonar-pulse {
        0%, 12% {
          opacity: 0;
          transform: scale(.78);
        }

        28%, 82% {
          opacity: 1;
          transform: scale(1);
        }

        100% {
          opacity: .3;
          transform: scale(1.08);
        }
      }

      /* =========================================
         INNER RING
         ========================================= */

      @keyframes sonar-snap {
        0%, 18% {
          opacity: 0;
          transform: scale(.55) rotate(-22deg);
        }

        34%, 84% {
          opacity: 1;
          transform: scale(1) rotate(0);
        }

        100% {
          opacity: .45;
          transform: scale(1.03) rotate(0);
        }
      }

      /* =========================================
         ROTATING ARC
         ========================================= */

      @keyframes sonar-orbit {
        0%, 25% {
          opacity: 0;
          transform: rotate(-110deg) scale(.75);
        }

        42%, 82% {
          opacity: 1;
          transform: rotate(322deg) scale(1);
        }

        100% {
          opacity: .3;
          transform: rotate(430deg) scale(1);
        }
      }

      /* =========================================
         MARKERS
         ========================================= */

      @keyframes sonar-mark {
        0%, 20% {
          opacity: 0;
          transform: scale(0);
        }

        34%, 80% {
          opacity: 1;
          transform: scale(1);
        }

        100% {
          opacity: .25;
          transform: scale(1);
        }
      }

      /* =========================================
         A
         ========================================= */

      @keyframes sonar-a-anchor {
        0%, 12% {
          opacity: 0;
          transform: scale(.72);
        }

        24%, 86% {
          opacity: 1;
          transform: scale(1);
        }

        100% {
          opacity: .6;
          transform: scale(1);
        }
      }

      /* =========================================
         LEFT LETTERS
         ========================================= */

      @keyframes sonar-letter-left {
        0%, 18% {
          opacity: 0;
          transform: translateX(78px) scale(.84);
        }

        34%, 86% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        100% {
          opacity: .6;
          transform: translateX(0) scale(1);
        }
      }

      /* =========================================
         RIGHT LETTERS
         ========================================= */

      @keyframes sonar-letter-right {
        0%, 18% {
          opacity: 0;
          transform: translateX(-78px) scale(.84);
        }

        34%, 86% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        100% {
          opacity: .6;
          transform: translateX(0) scale(1);
        }
      }

      /* =========================================
         RESPONSIVE
         ========================================= */

      @media (max-width: 1200px) {
        .sonar-stage {
          bottom: clamp(5rem, 9vh, 7rem);
          transform: translateX(-50%) scale(.9);
        }
      }

      @media (max-width: 900px) {
        .sonar-stage {
          bottom: clamp(4rem, 8vh, 6rem);
          transform: translateX(-50%) scale(.72);
        }
      }

      @media (max-width: 640px) {
        .sonar-stage {
          bottom: clamp(2rem, 6vh, 4rem);
          transform: translateX(-50%) scale(.55);
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      id="splash"
      className="fixed inset-0 h-full w-full overflow-hidden bg-background font-sans text-foreground"
    >

      {/* =========================================
          SONAR GLOBE
          ========================================= */}

      <div
        className="
          sonar-globe
          pointer-events-none
          absolute
          bottom-[-15rem]
          left-1/2
          z-0
          h-[28rem]
          w-[82rem]
          -translate-x-1/2
        "
        aria-hidden="true"
      >

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[44rem]
            rounded-[50%]
            border
            border-foreground/70
          "
        />

        {/* Latitude lines */}
        <div className="sonar-globe-lat top-[18%] h-[8rem] w-[92%]" />
        <div className="sonar-globe-lat top-[33%] h-[9rem] w-[98%]" />
        <div className="sonar-globe-lat top-[49%] h-[9rem] w-full" />
        <div className="sonar-globe-lat top-[65%] h-[8rem] w-[96%]" />
        <div className="sonar-globe-lat top-[80%] h-[7rem] w-[82%]" />

        {/* Longitude lines */}
        <div className="sonar-globe-lon h-[44rem] w-[22%]" />
        <div className="sonar-globe-lon h-[44rem] w-[46%]" />
        <div className="sonar-globe-lon h-[44rem] w-[72%]" />

        {/* Horizon */}
        <span
          className="
            absolute
            left-0
            right-0
            top-[49%]
            h-px
            bg-foreground/60
          "
        />

        {/* Center line */}
        <span
          className="
            absolute
            left-1/2
            top-0
            h-[22rem]
            w-px
            -translate-x-1/2
            bg-foreground/45
          "
        />
      </div>


      {/* =========================================
          CENTRAL SONAR
          ========================================= */}

      <section className="sonar-stage z-10 flex flex-col items-center">

        {/* Main circle */}
        <div
          className="
            relative
            flex
            h-[24rem]
            w-[24rem]
            items-center
            justify-center
            rounded-full
            border
            border-foreground/50
            shadow-md
            sonar-ring-outer
          "
        >

          {/* Inner circle */}
          <div
            className="
              absolute
              h-[16rem]
              w-[16rem]
              rounded-full
              border-2
              border-foreground/90
              sonar-ring-inner
            "
          />

          {/* Outer circle */}
          <div
            className="
              absolute
              h-[28rem]
              w-[28rem]
              rounded-full
              border
              border-foreground/30
              sonar-ring-outer
            "
          />

          {/* =====================================
              MARKERS
              ===================================== */}

          <span
            className="
              absolute
              -top-8
              h-3
              w-3
              rounded-full
              bg-foreground
              shadow-md
              sonar-mark
            "
          />

          <span
            className="
              absolute
              -top-4
              h-4
              w-1
              bg-foreground
              sonar-mark
            "
          />

          <span
            className="
              absolute
              -bottom-4
              h-4
              w-1
              bg-foreground
              sonar-mark
            "
          />

          <span
            className="
              absolute
              -left-4
              h-1
              w-4
              bg-foreground
              sonar-mark
            "
          />

          <span
            className="
              absolute
              -right-4
              h-1
              w-4
              bg-foreground
              sonar-mark
            "
          />

          <span
            className="
              absolute
              left-11
              top-14
              h-14
              w-1
              rotate-45
              bg-muted-foreground
              sonar-mark
            "
          />

          <span
            className="
              absolute
              right-11
              top-14
              h-14
              w-1
              -rotate-45
              bg-muted-foreground
              sonar-mark
            "
          />

          {/* =====================================
              ROTATING ARC
              ===================================== */}

          <div
            className="
              absolute
              h-[14rem]
              w-[14rem]
              rounded-full
              border-t-4
              border-foreground/90
              border-r
              border-transparent
              border-b
              border-muted-foreground/60
              border-l
              border-transparent
              rotate-[-38deg]
              sonar-arc
            "
          />

          {/* =====================================
              SONAR WORDMARK
              
              Sized to fit comfortably inside
              the inner circle with breathing room
              ===================================== */}

          <div
            className="
              sonar-word
              relative
              flex
              items-baseline
              justify-center
              whitespace-nowrap
              gap-[0.05rem]
            "
          >

            {/* SON */}
            <span
              className="
                sonar-letter-left
                text-[2.85rem]
                font-heading
                font-medium
                leading-none
                tracking-[0.01em]
                text-foreground
              "
            >
              son
            </span>

            {/* A */}
            <span
              className="
                sonar-a
                relative
                -ml-[0.15rem]
                mr-[-0.2rem]
                text-[4.25rem]
                font-heading
                font-bold
                leading-none
                tracking-[-0.08em]
                text-primary
              "
            >
              A
            </span>

            {/* R... */}
            <span
              className="
                sonar-letter-right
                ml-[0.05rem]
                text-[2.85rem]
                font-heading
                font-medium
                leading-none
                tracking-[0.01em]
                text-foreground
              "
            >
              r...
            </span>

          </div>
        </div>


        {/* =========================================
            TAGLINE
            ========================================= */}

        <div className="mt-5 flex items-center gap-5">

          <span className="h-px w-24 bg-border" />

          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-[0.48em]
              text-muted-foreground
            "
          >
            Signal Intelligence
          </p>

          <span className="h-px w-24 bg-border" />

        </div>

      </section>
    </div>
  );
}