import { useEffect, useState, type KeyboardEvent } from "react"


interface Props {
  onQuery: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onQuery, placeholder = 'Buscar... ' }: Props) => {

  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onQuery(query);
    }, 700);
    return () => clearTimeout(timer);
  }, [query, onQuery]);

  const handleSearch = () => {
    onQuery(query);
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if(event.key === "Enter") {
      handleSearch();
    }
  };

  return (
      <div>
        <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch}>Buscar</button>
      </div>
  );
};

export default SearchBar;