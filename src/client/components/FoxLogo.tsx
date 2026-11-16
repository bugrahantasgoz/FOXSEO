// The Fox SEO mark: a purple fox looking through a magnifying glass.
// Brand colors: Derin Mor #5B21B6, Gece #1A0B2E, lavender light tones.

export function FoxMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 112"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ears */}
      <path d="M14 10 L46 30 L20 52 Z" fill="#5B21B6" />
      <path d="M102 4 L98 50 L70 28 Z" fill="#5B21B6" />
      <path d="M21 21 L38 32 L24 44 Z" fill="#DDD6FE" />
      <path d="M95 15 L92 40 L77 29 Z" fill="#DDD6FE" />
      {/* head */}
      <path
        d="M16 44 C18 28 40 22 60 22 C82 22 104 28 106 46 L108 68 C106 86 86 102 60 104 C34 102 14 88 12 70 Z"
        fill="#5B21B6"
      />
      {/* muzzle */}
      <path
        d="M16 76 C30 70 46 72 60 80 C74 72 92 70 106 74 C102 92 84 104 60 106 C38 104 20 94 16 76 Z"
        fill="#FBF8FF"
      />
      {/* brow */}
      <path
        d="M30 46 C36 41 46 41 52 45"
        stroke="#C4B5FD"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* left eye */}
      <circle cx="41" cy="62" r="11" fill="#FFFFFF" />
      <circle cx="42" cy="61" r="6" fill="#1A0B2E" />
      <circle cx="44" cy="59" r="2" fill="#FFFFFF" />
      {/* magnifying glass over the right eye */}
      <circle cx="78" cy="55" r="20" fill="#EDE9FE" />
      <circle
        cx="78"
        cy="55"
        r="17"
        fill="#FFFFFF"
        stroke="#A78BFA"
        strokeWidth="6"
      />
      <circle cx="79" cy="53" r="8" fill="#1A0B2E" />
      <circle cx="82" cy="50" r="2.6" fill="#FFFFFF" />
      <path
        d="M92 70 L108 84"
        stroke="#1A0B2E"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* nose and mouth */}
      <path d="M50 78 C54 74 64 74 66 78 C63 84 53 85 50 78 Z" fill="#1A0B2E" />
      <ellipse cx="57" cy="94" rx="4" ry="4.5" fill="#1A0B2E" />
    </svg>
  );
}

/** Fox mark plus the "fox seo" wordmark (Inter ExtraBold + Light). */
export function FoxLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <FoxMark className="size-8 shrink-0" />
      <span className="text-xl leading-none tracking-tight">
        <span className="font-extrabold text-[#1A0B2E] dark:text-white">
          fox
        </span>{" "}
        <span className="font-light text-[#5B21B6] dark:text-[#C4B5FD]">
          seo
        </span>
      </span>
    </span>
  );
}
