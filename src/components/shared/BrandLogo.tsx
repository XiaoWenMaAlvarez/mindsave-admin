import { Link } from "react-router";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  compact?: boolean;
  linkToHome?: boolean;
  markSize?: number;
  showAdmin?: boolean;
}

const BrandContent = ({ compact, markSize = 32, showAdmin = true }: Omit<BrandLogoProps, "className" | "linkToHome">) => (
  <>
    <img
      src="/favicon.png"
      alt=""
      aria-hidden="true"
      width={markSize}
      height={markSize}
      className="shrink-0 object-contain drop-shadow-[0_0_10px_rgb(0_178_179/0.22)]"
    />
    {!compact && (
      <>
        <span className="font-heading text-lg font-bold tracking-[-0.02em] text-foreground">MindSave</span>
        {showAdmin && (
          <>
            <span aria-hidden="true" className="text-xl font-light text-border">|</span>
            <span className="text-[0.8125rem] text-[#4a7070]">Admin</span>
          </>
        )}
      </>
    )}
  </>
);

const BrandLogo = ({
  className,
  compact = false,
  linkToHome = true,
  markSize = 32,
  showAdmin = true,
}: BrandLogoProps) => {
  const classes = cn("inline-flex items-center gap-2.5 whitespace-nowrap", className);
  const content = <BrandContent compact={compact} markSize={markSize} showAdmin={showAdmin} />;

  if (!linkToHome) {
    return <div className={classes} aria-label="MindSave Admin">{content}</div>;
  }

  return (
    <Link to="/" className={cn(classes, "rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/70")} aria-label="Ir al inicio">
      {content}
    </Link>
  );
};

export default BrandLogo;
