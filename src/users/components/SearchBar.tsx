import { useRef, type KeyboardEvent } from "react"
import { useSearchParams } from "react-router";

const SearchBar = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const value = inputRef.current?.value ?? "";
    const query = value.trim().toLowerCase();

    setSearchParams((prev) => {
      if (query) {
        prev.set("query", query);
      } else {
        prev.delete("query");
      }
      prev.set("page", "1");
      return prev;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      handleSearch();
    }
  };

  return (
      <div>
        <input
        ref={inputRef}
        type="text"
        placeholder="Buscar por nombre o email"
        onKeyDown={handleKeyDown}
        defaultValue={searchParams.get("query") ?? ""}
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>
  );
};

export default SearchBar;