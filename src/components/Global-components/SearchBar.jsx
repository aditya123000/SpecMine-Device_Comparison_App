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
    () => (normalizedInput ? suggestions.slice(0, 6) : []),
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
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
          autoComplete="off"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400"
        />
      </div>
      {showSuggestions && visibleSuggestions.length > 0 && (
        <ul className="mt-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/95 shadow-lg">
          {visibleSuggestions.map((suggestion) => {
            const key = typeof suggestion === "string" ? suggestion : suggestion.id;
            const label = typeof suggestion === "string" ? suggestion : suggestion.label;
            return (
              <li key={key}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
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
