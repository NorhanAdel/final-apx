"use client";

import { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

interface CategoryDropdownProps {
  categories: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function CategoryDropdown({
  categories,
  selected,
  onSelect,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = categories.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative w-60 text-black">
      <div
        className="p-3 bg-white rounded-lg cursor-pointer flex justify-between items-center shadow"
        onClick={() => setOpen(!open)}
      >
        {selected.toUpperCase()}
        <FaChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center bg-gray-100 rounded px-2">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search category..."
                className="w-full outline-none bg-transparent py-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <ul>
            {filtered.length ? (
              filtered.map((c) => (
                <li
                  key={c}
                  className="px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer"
                  onClick={() => {
                    onSelect(c);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {c.toUpperCase()}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No category found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}