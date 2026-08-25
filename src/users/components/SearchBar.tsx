import { Search, X } from "lucide-react";
import { useRef, type FormEvent } from "react";
import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeQuery = searchParams.get("query") ?? "";

  const updateQuery = (query: string) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (query) next.set("query", query);
      else next.delete("query");
      next.set("page", "1");
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateQuery(inputRef.current?.value.trim().toLowerCase() ?? "");
  };

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = "";
    updateQuery("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex flex-col gap-2.5 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#4a7070]" aria-hidden="true" />
        <Input
          ref={inputRef}
          type="search"
          defaultValue={activeQuery}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios por nombre o correo"
          className="pr-11 pl-11"
        />
        {activeQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-[#4a7070] transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
            aria-label="Limpiar búsqueda"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button type="submit" variant="outline" className="sm:w-auto">
        <Search />
        Buscar
      </Button>
    </form>
  );
};

export default SearchBar;
