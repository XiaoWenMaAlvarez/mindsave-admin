import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { getPaginationItems } from "../utils/pagination";

interface CustomPaginationProps {
  totalPages: number;
}

export const CustomPagination = ({ totalPages }: CustomPaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryPage = searchParams.get("page") ?? "1";
  const rawPage = Number.isNaN(Number(queryPage)) ? 1 : Number(queryPage);
  const page = Math.max(1, Math.min(rawPage, Math.max(1, totalPages)));

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("page", String(newPage));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="Paginación de usuarios">
      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => handlePageChange(1)} aria-label="Primera página">
        <ChevronsLeft />
        <span className="hidden md:inline">Primera</span>
      </Button>
      <Button variant="outline" size="sm" disabled={page === 1} onClick={() => handlePageChange(page - 1)} aria-label="Página anterior">
        <ChevronLeft />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      {getPaginationItems(page, totalPages).map((item, index) =>
        typeof item === "number" ? (
          <Button
            key={item}
            variant={item === page ? "default" : "outline"}
            size="icon-sm"
            onClick={() => handlePageChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Página ${item}`}
          >
            {item}
          </Button>
        ) : (
          <span key={`${item}-${index}`} className="flex size-8 items-center justify-center text-[#4a7070]" aria-hidden="true">
            <MoreHorizontal className="size-4" />
          </span>
        ),
      )}

      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => handlePageChange(page + 1)} aria-label="Página siguiente">
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight />
      </Button>
      <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => handlePageChange(totalPages)} aria-label="Última página">
        <span className="hidden md:inline">Última</span>
        <ChevronsRight />
      </Button>
    </nav>
  );
};
