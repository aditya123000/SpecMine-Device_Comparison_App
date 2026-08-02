import React, { useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  suggestions = [],
  onSuggestionSelect,
  placeholder = "Search by brand or model",
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;
  const normalizedInput = inputValue.trim();
  const visibleSuggestions = useMemo(
    () => (normalizedInput ? suggestions : []),
    [normalizedInput, suggestions]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSubmit) {
      onSubmit(inputValue.trim());
    }
  };

  const handleChange = (e) => {
    const nextValue = e.target.value;
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    if (onChange) {
      onChange(nextValue);
    }
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedValue = typeof suggestion === "string" ? suggestion : suggestion.value;
    if (!isControlled) {
      setInternalValue(selectedValue);
    }
    if (onChange) {
      onChange(selectedValue);
    }
    setShowSuggestions(false);
    if (onSuggestionSelect) {
      onSuggestionSelect(selectedValue);
      return;
    }
    if (onSubmit) {
      onSubmit(selectedValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          autoComplete="off"
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder-slate-500 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-400"
        />
      </div>
      {showSuggestions && visibleSuggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900/95">
          {visibleSuggestions.map((suggestion) => {
            const key = typeof suggestion === "string" ? suggestion : suggestion.id;
            const label = typeof suggestion === "string" ? suggestion : suggestion.label;
            return (
              <li key={key}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
};

export default SearchBar;
