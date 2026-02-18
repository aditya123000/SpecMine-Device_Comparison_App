import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search by brand or model",
}) => {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  const handleSubmit = (e) => {
    e.preventDefault();
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
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400"
        />
      </div>
    </form>
  );
};

export default SearchBar;
