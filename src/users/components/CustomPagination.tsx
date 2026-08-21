import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useSearchParams } from 'react-router';
import { getPaginationItems } from '../utils/pagination';

interface Props {
  totalPages: number;
}

export const CustomPagination = ({ totalPages }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryPage = searchParams.get('page') ?? '1';
  const rawPage = isNaN(Number(queryPage)) ? 1 : Number(queryPage);
  const page = Math.max(1, Math.min(rawPage, Math.max(1, totalPages)));

  if (totalPages <= 0) return null;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setSearchParams((prev) => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const paginationItems = getPaginationItems(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 my-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => handlePageChange(1)}
        title="Primera página"
        aria-label="Primera página"
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Primera</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
        title="Página anterior"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      {paginationItems.map((item, index) => {
        if (item === 'ellipsis-left' || item === 'ellipsis-right') {
          return (
            <span
              key={`${item}-${index}`}
              className="flex h-7 w-7 items-center justify-center text-muted-foreground select-none"
              aria-hidden="true"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        return (
          <Button
            key={item}
            variant={page === item ? 'default' : 'outline'}
            size="sm"
            className="min-w-7 sm:min-w-8"
            aria-current={page === item ? 'page' : undefined}
            onClick={() => handlePageChange(item)}
          >
            {item}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
        title="Página siguiente"
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => handlePageChange(totalPages)}
        title="Última página"
        aria-label="Última página"
      >
        <span className="hidden sm:inline">Última</span>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
};