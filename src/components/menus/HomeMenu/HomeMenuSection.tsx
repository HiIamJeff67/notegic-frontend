export const HomeMenuSection = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <section className="relative">
    <div className="mb-2 break-words capitalize text-sm font-bold tracking-[0.2em] text-foreground">
      {label}
    </div>
    <div className="relative">{children}</div>
  </section>
);

export const HomeMenuFrame = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative bg-background/5 px-4 py-3 backdrop-blur-[1px] ${className}`}
  >
    {children}
  </div>
);
