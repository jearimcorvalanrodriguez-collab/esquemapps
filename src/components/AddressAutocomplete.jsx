import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { PianoLoader } from './PianoLoader';

export const AddressAutocomplete = ({ value, onChange, placeholder, className, required }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&accept-language=es`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSuggestions(data.map(item => ({
          label: item.display_name,
          value: item.display_name
        })));
      }
    } catch (e) {
      console.error("Autocomplete error:", e);
    }
    setLoading(false);
  };

  const timeoutRef = useRef(null);
  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      searchAddress(val);
    }, 450);
  };

  const handleSelect = (item) => {
    onChange(item.value);
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="flex gap-2">
        <input 
          required={required}
          className={className}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => { if (value && value.length >= 3) setShowDropdown(true); }}
        />
        <button 
          type="button" 
          onClick={() => window.open(value ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}` : 'https://www.google.com/maps', '_blank')} 
          className="p-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors shrink-0" 
          title="Ver en Google Maps"
        >
          <MapPin size={14} />
        </button>
      </div>
      {showDropdown && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-[9999] w-full bg-slate-900 border border-slate-700 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-2xl text-left">
          {loading && (
            <li className="p-2.5 text-xs text-slate-400 flex items-center gap-2">
              <PianoLoader size={12} showLabel={false} />
              <span>Buscando sugerencias...</span>
            </li>
          )}
          {!loading && suggestions.map((item, idx) => (
            <li 
              key={idx} 
              onClick={() => handleSelect(item)}
              className="p-2.5 text-xs text-slate-200 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 leading-tight transition-colors"
            >
              📍 {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
