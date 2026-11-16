// The Fox SEO logo: the curious fox with a magnifying glass (from the Fox
// family brand sheet) plus the "fox seo" wordmark in Inter ExtraBold + Light.

/** Fox SEO logo for the sidebar. */
export function FoxLogo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <img
        src="/transparent-logo.png"
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0"
      />
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
