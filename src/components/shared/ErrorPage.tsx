import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

const ErrorPage = ({ error }: { error: string }) => (
  <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16">
    <div className="ms-surface ms-enter w-full max-w-lg rounded-3xl p-7 text-center sm:p-10">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </div>
      <p className="ms-section-label mt-5">Algo no salió bien</p>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground">No pudimos cargar esta vista</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
      <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
        <Button type="button" onClick={() => window.location.reload()}>
          <RefreshCw />
          Reintentar
        </Button>
        <Link
          to="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-[#315858] hover:bg-secondary/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <Home className="size-4" />
          Ir al inicio
        </Link>
      </div>
    </div>
  </div>
);

export default ErrorPage;
