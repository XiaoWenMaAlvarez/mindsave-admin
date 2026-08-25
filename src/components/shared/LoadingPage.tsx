import BrandLogo from "./BrandLogo";

interface LoadingPageProps {
  message?: string;
}

const LoadingPage = ({ message = "Preparando tu panel" }: LoadingPageProps) => (
  <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6 py-16" role="status" aria-live="polite">
    <div className="ms-page-grid pointer-events-none absolute inset-0 opacity-70" />
    <div className="pointer-events-none absolute left-1/2 top-1/2 size-[min(82vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5" />
    <div className="pointer-events-none absolute left-1/2 top-1/2 size-[min(58vw,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />

    <div className="relative flex flex-col items-center text-center">
      <div className="animate-[ms-pulse_2s_ease-in-out_infinite]">
        <BrandLogo compact linkToHome={false} markSize={82} />
      </div>
      <p className="mt-4 font-heading text-xs uppercase tracking-[0.24em] text-[#4a8080]">Mind Save</p>
      <div className="ms-accent-line mt-3 h-0.5 w-12" />
      <p className="mt-4 text-sm text-[#4a7070]">{message}</p>
      <div className="mt-7 h-0.5 w-40 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-[ms-progress_1.65s_cubic-bezier(0.4,0,0.2,1)_infinite] rounded-full bg-linear-to-r from-primary to-[#00cacb] shadow-[0_0_8px_rgb(0_178_179/0.65)]" />
      </div>
    </div>
  </div>
);

export default LoadingPage;
