interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export default function SectionHeader({ eyebrow, title, subtitle, align = "center" }: Props) {
  const cls = align === "center" ? "text-center" : "text-left";
  return (
    <div className={`mb-14 ${cls}`}>
      {eyebrow && (
        <p className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-3">{eyebrow}</p>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-white/50 mt-4 text-base leading-relaxed max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
