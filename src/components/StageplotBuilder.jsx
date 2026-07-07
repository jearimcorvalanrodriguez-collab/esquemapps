// Force HMR reload: v1.0.1
import React, { useState, useEffect, useRef } from 'react';
import { 
  Minimize, Maximize, RotateCw, Trash2, MapPin, 
  ChevronLeft, ArrowUp, ArrowDown, Copy
} from 'lucide-react';
import { Button } from './Button';
import { PianoLoader } from './PianoLoader';

export const STAGE_ITEMS = {
  DRUMS: {
    label: "Batería", width: 22, height: 22, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Bombo / Bass Drum */}
        <circle cx="50" cy="46" r="22" strokeWidth="3" className="fill-slate-800 stroke-slate-400 print:fill-slate-100 print:stroke-black"/>
        {/* Tom de Piso / Floor Tom */}
        <circle cx="72" cy="65" r="15" strokeWidth="2.5" className="fill-slate-700 stroke-slate-500 print:fill-slate-200 print:stroke-black"/>
        {/* Caja / Snare */}
        <circle cx="28" cy="68" r="12" strokeWidth="2.5" className="fill-slate-700 stroke-slate-500 print:fill-slate-200 print:stroke-black"/>
        {/* Tom de Aire / Rack Tom */}
        <circle cx="38" cy="22" r="9" strokeWidth="2" className="fill-slate-700 stroke-slate-500 print:fill-slate-200 print:stroke-black"/>
      </svg>
    )
  },
  PIANO: {
    label: "Piano de Cola", width: 24, height: 24, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Grand piano body silhouette from above */}
        <path d="M12,82 L12,28 C12,14 36,4 62,8 C82,12 88,28 88,58 L88,82 Z" strokeWidth="3" className="fill-slate-900 stroke-slate-500 print:fill-white print:stroke-black"/>
        {/* Keyboard keys */}
        <rect x="18" y="78" width="64" height="10" strokeWidth="1.5" rx="1" className="fill-slate-100 stroke-slate-800 print:fill-white print:stroke-black"/>
        <line x1="26" y1="78" x2="26" y2="88" className="stroke-slate-400 print:stroke-black" strokeWidth="1"/>
        <line x1="34" y1="78" x2="34" y2="88" className="stroke-slate-400 print:stroke-black" strokeWidth="1"/>
        <line x1="42" y1="78" x2="42" y2="88" className="stroke-slate-400 print:stroke-black" strokeWidth="1"/>
        <line x1="50" y1="78" x2="50" y2="88" className="stroke-slate-400 print:stroke-black" strokeWidth="1"/>
        <line x1="58" y1="78" x2="58" y2="88" className="stroke-slate-400 print:stroke-black" strokeWidth="1"/>
        <line x1="66" y1="78" x2="66" y2="88" className="stroke-slate-400 print:stroke-black" strokeWidth="1"/>
        <line x1="74" y1="78" x2="74" y2="88" className="stroke-slate-400 print:stroke-black" strokeWidth="1"/>
        {/* Black keys */}
        <rect x="24" y="78" width="3" height="6" className="fill-slate-955 print:fill-black"/>
        <rect x="32" y="78" width="3" height="6" className="fill-slate-955 print:fill-black"/>
        <rect x="40" y="78" width="3" height="6" className="fill-slate-955 print:fill-black"/>
        <rect x="48" y="78" width="3" height="6" className="fill-slate-955 print:fill-black"/>
        <rect x="56" y="78" width="3" height="6" className="fill-slate-955 print:fill-black"/>
        <rect x="64" y="78" width="3" height="6" className="fill-slate-955 print:fill-black"/>
        <rect x="72" y="78" width="3" height="6" className="fill-slate-955 print:fill-black"/>
      </svg>
    )
  },
  KEYS: {
    label: "Teclados", width: 20, height: 16, defaultRotation: 180,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Support stand legs (X-stand structure) */}
        <path d="M20,38 L38,70 M80,38 L62,70" strokeWidth="3" strokeLinecap="round" className="stroke-slate-655 print:stroke-black"/>
        <rect x="30" y="68" width="40" height="6" rx="1.5" className="fill-slate-800 stroke-slate-600 print:fill-white print:stroke-black" strokeWidth="1.5"/>
        
        {/* Lower Keyboard */}
        <rect x="5" y="32" width="90" height="15" rx="2" strokeWidth="2" className="fill-slate-900 stroke-slate-500 print:fill-white print:stroke-black"/>
        <rect x="10" y="38" width="80" height="7" className="fill-slate-100 print:fill-white"/>
        <line x1="20" y1="38" x2="20" y2="45" className="stroke-slate-500 print:stroke-black"/>
        <line x1="30" y1="38" x2="30" y2="45" className="stroke-slate-500 print:stroke-black"/>
        <line x1="40" y1="38" x2="40" y2="45" className="stroke-slate-500 print:stroke-black"/>
        <line x1="50" y1="38" x2="50" y2="45" className="stroke-slate-500 print:stroke-black"/>
        <line x1="60" y1="38" x2="60" y2="45" className="stroke-slate-500 print:stroke-black"/>
        <line x1="70" y1="38" x2="70" y2="45" className="stroke-slate-500 print:stroke-black"/>
        <line x1="80" y1="38" x2="80" y2="45" className="stroke-slate-500 print:stroke-black"/>
        
        {/* Upper Keyboard */}
        <rect x="15" y="15" width="70" height="13" rx="1.5" className="fill-slate-955 stroke-slate-600 print:fill-white print:stroke-black" strokeWidth="1"/>
        <rect x="20" y="21" width="60" height="5" className="fill-slate-100 print:fill-white"/>
      </svg>
    )
  },
  GUITAR: {
    label: "Guitarra", width: 13, height: 13, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Telecaster Guitar only (no stand/bracket) - Centered and parallel (horizontal) */}
        <g transform="translate(50, 50) rotate(-90 50 57.5) scale(0.8) translate(-50, -57.5)">
          {/* Neck */}
          <rect x="47" y="10" width="6" height="50" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Headstock */}
          <path d="M47,10 Q45,2 50,0 Q55,0 55,6 L53,10 Z" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Pegs */}
          <circle cx="56" cy="2" r="1" className="fill-slate-500 print:fill-black"/>
          <circle cx="56" cy="4" r="1" className="fill-slate-500 print:fill-black"/>
          <circle cx="56" cy="6" r="1" className="fill-slate-500 print:fill-black"/>
          <circle cx="56" cy="8" r="1" className="fill-slate-500 print:fill-black"/>
          
          {/* Telecaster Body */}
          <path d="M 45,55 C 33,55 28,60 28,68 C 28,75 35,78 35,82 C 35,86 23,90 23,100 C 23,110 33,115 50,115 C 67,115 77,110 77,100 C 77,90 65,86 65,82 C 65,78 62,75 62,68 C 62,62 69,60 69,54 C 58,54 55,60 50,60 L 45,55 Z" className="fill-red-600 stroke-red-800 print:fill-white print:stroke-black" strokeWidth="2.5"/>
          {/* Pickguard */}
          <path d="M 50,60 C 42,60 38,65 38,72 L 48,85 L 58,82 Z" className="fill-slate-950 print:fill-slate-200"/>
          {/* Control Plate */}
          <rect x="58" y="85" width="6" height="20" rx="1" className="fill-slate-300 stroke-slate-500 print:fill-white print:stroke-black" strokeWidth="1" transform="rotate(-15 61 95)"/>
          {/* Bridge & Pickups */}
          <rect x="45" y="80" width="10" height="12" className="fill-slate-400 stroke-slate-600 print:fill-white print:stroke-black" strokeWidth="1"/>
        </g>
      </svg>
    )
  },
  TELECASTER: {
    label: "Guitarra Telecaster", width: 13, height: 13, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Telecaster Guitar only - Centered and parallel (horizontal) */}
        <g transform="translate(50, 50) rotate(-90 50 57.5) scale(0.8) translate(-50, -57.5)">
          {/* Neck */}
          <rect x="47" y="10" width="6" height="50" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Headstock */}
          <path d="M47,10 Q45,2 50,0 Q55,0 55,6 L53,10 Z" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Pegs */}
          <circle cx="56" cy="2" r="1" className="fill-slate-500 print:fill-black"/>
          <circle cx="56" cy="4" r="1" className="fill-slate-500 print:fill-black"/>
          <circle cx="56" cy="6" r="1" className="fill-slate-500 print:fill-black"/>
          <circle cx="56" cy="8" r="1" className="fill-slate-500 print:fill-black"/>
          
          {/* Telecaster Body - Butterscotch Blonde */}
          <path d="M 45,55 C 33,55 28,60 28,68 C 28,75 35,78 35,82 C 35,86 23,90 23,100 C 23,110 33,115 50,115 C 67,115 77,110 77,100 C 77,90 65,86 65,82 C 65,78 62,75 62,68 C 62,62 69,60 69,54 C 58,54 55,60 50,60 L 45,55 Z" fill="#e8c87d" stroke="#bc9f63" className="print:fill-white print:stroke-black" strokeWidth="2.5"/>
          {/* Pickguard - Black */}
          <path d="M 50,60 C 42,60 38,65 38,72 L 48,85 L 58,82 Z" className="fill-slate-950 print:fill-slate-200"/>
          {/* Control Plate */}
          <rect x="58" y="85" width="6" height="20" rx="1" className="fill-slate-300 stroke-slate-500 print:fill-white print:stroke-black" strokeWidth="1" transform="rotate(-15 61 95)"/>
          {/* Bridge & Pickups */}
          <rect x="45" y="80" width="10" height="12" className="fill-slate-400 stroke-slate-600 print:fill-white print:stroke-black" strokeWidth="1"/>
        </g>
      </svg>
    )
  },
  BASS: {
    label: "Bajo", width: 13, height: 13, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Fender Jazz Bass only (no stand/bracket) - Centered and parallel (horizontal) */}
        <g transform="translate(50, 50) rotate(-90 50 51.5) scale(0.73) translate(-50, -51.5)">
          {/* Neck */}
          <rect x="47" y="0" width="6" height="60" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Jazz Bass Headstock */}
          <path d="M47,0 Q43,-10 49,-12 Q56,-12 55,-4 L53,0 Z" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* 4 large tuning pegs */}
          <circle cx="56" cy="-10" r="1.5" className="fill-slate-400 print:fill-black"/>
          <circle cx="56" cy="-7" r="1.5" className="fill-slate-400 print:fill-black"/>
          <circle cx="56" cy="-4" r="1.5" className="fill-slate-400 print:fill-black"/>
          <circle cx="56" cy="-1" r="1.5" className="fill-slate-400 print:fill-black"/>
          
          {/* Jazz Bass Body */}
          <path d="M 46,55 C 38,55 30,42 30,42 C 30,42 35,62 34,68 C 33,74 23,80 23,94 C 23,108 33,115 50,115 C 67,115 77,108 77,94 C 77,80 67,74 66,68 C 65,62 70,46 70,46 C 70,46 62,55 54,55 L 46,55 Z" className="fill-blue-600 stroke-blue-800 print:fill-white print:stroke-black" strokeWidth="2.5"/>
          {/* Curved Jazz Bass Pickguard */}
          <path d="M 48,56 C 42,56 36,62 36,70 C 36,82 48,86 48,94 L 54,94 L 54,70 Z" className="fill-slate-950 print:fill-slate-200"/>
          {/* Curved Chrome Control Plate */}
          <path d="M 56,88 C 56,88 64,88 66,96 C 68,104 60,110 54,110 L 52,98 Z" className="fill-slate-300 stroke-slate-500 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Two Jazz Bass Pickups */}
          <rect x="42" y="74" width="16" height="3" rx="0.5" className="fill-slate-900 print:fill-black"/>
          <rect x="42" y="82" width="16" height="3" rx="0.5" className="fill-slate-900 print:fill-black"/>
          {/* Bridge */}
          <rect x="44" y="96" width="12" height="8" className="fill-slate-400 stroke-slate-600 print:fill-white print:stroke-black" strokeWidth="1"/>
        </g>
      </svg>
    )
  },
  JAZZBASS: {
    label: "Bajo Jazz Bass", width: 13, height: 13, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Fender Jazz Bass only - Centered and parallel (horizontal) */}
        <g transform="translate(50, 50) rotate(-90 50 51.5) scale(0.73) translate(-50, -51.5)">
          {/* Neck */}
          <rect x="47" y="0" width="6" height="60" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Jazz Bass Headstock */}
          <path d="M47,0 Q43,-10 49,-12 Q56,-12 55,-4 L53,0 Z" className="fill-amber-200 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* 4 large tuning pegs */}
          <circle cx="56" cy="-10" r="1.5" className="fill-slate-400 print:fill-black"/>
          <circle cx="56" cy="-7" r="1.5" className="fill-slate-400 print:fill-black"/>
          <circle cx="56" cy="-4" r="1.5" className="fill-slate-400 print:fill-black"/>
          <circle cx="56" cy="-1" r="1.5" className="fill-slate-400 print:fill-black"/>
          
          {/* Jazz Bass Body - Sunburst / Amber Center */}
          <path d="M 46,55 C 38,55 30,42 30,42 C 30,42 35,62 34,68 C 33,74 23,80 23,94 C 23,108 33,115 50,115 C 67,115 77,108 77,94 C 77,80 67,74 66,68 C 65,62 70,46 70,46 C 70,46 62,55 54,55 L 46,55 Z" fill="#c25123" stroke="#6c2810" className="print:fill-white print:stroke-black" strokeWidth="2.5"/>
          {/* Curved Jazz Bass Pickguard - White/Cream */}
          <path d="M 48,56 C 42,56 36,62 36,70 C 36,82 48,86 48,94 L 54,94 L 54,70 Z" className="fill-slate-100 print:fill-slate-200"/>
          {/* Curved Chrome Control Plate */}
          <path d="M 56,88 C 56,88 64,88 66,96 C 68,104 60,110 54,110 L 52,98 Z" className="fill-slate-300 stroke-slate-500 print:fill-white print:stroke-black" strokeWidth="1"/>
          {/* Two Jazz Bass Pickups */}
          <rect x="42" y="74" width="16" height="3" rx="0.5" className="fill-slate-900 print:fill-black"/>
          <rect x="42" y="82" width="16" height="3" rx="0.5" className="fill-slate-900 print:fill-black"/>
          {/* Bridge */}
          <rect x="44" y="96" width="12" height="8" className="fill-slate-400 stroke-slate-600 print:fill-white print:stroke-black" strokeWidth="1"/>
        </g>
      </svg>
    )
  },
  VOCALS: {
    label: "Voz Principal", width: 11, height: 11, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Handheld Dynamic Microphone */}
        {/* Grille */}
        <circle cx="50" cy="30" r="16" strokeWidth="3" className="fill-slate-300 stroke-slate-500 print:fill-slate-100 print:stroke-black"/>
        <ellipse cx="50" cy="30" rx="16" ry="6" strokeWidth="1.2" className="fill-none stroke-slate-500 print:stroke-black"/>
        <line x1="50" y1="14" x2="50" y2="46" strokeWidth="1.2" className="stroke-slate-500 print:stroke-black"/>
        {/* Handle */}
        <path d="M44,46 L56,46 L54,82 C54,85 46,85 46,82 Z" strokeWidth="2.5" className="fill-slate-800 stroke-slate-655 print:fill-white print:stroke-black"/>
        {/* Chrome collar */}
        <rect x="43" y="44" width="14" height="4" rx="0.5" className="fill-slate-400 print:fill-black"/>
        {/* On/Off Switch */}
        <rect x="48" y="55" width="4" height="8" rx="0.5" className="fill-slate-955 print:fill-black"/>
        <circle cx="50" cy="57" r="1" className="fill-red-500 print:fill-white"/>
      </svg>
    )
  },
  BACKING_VOCALS: {
    label: "Coros", width: 11, height: 11, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Handheld Dynamic Microphone */}
        {/* Grille */}
        <circle cx="50" cy="30" r="16" strokeWidth="3" className="fill-slate-300 stroke-slate-500 print:fill-slate-100 print:stroke-black"/>
        <ellipse cx="50" cy="30" rx="16" ry="6" strokeWidth="1.2" className="fill-none stroke-slate-500 print:stroke-black"/>
        <line x1="50" y1="14" x2="50" y2="46" strokeWidth="1.2" className="stroke-slate-500 print:stroke-black"/>
        {/* Handle */}
        <path d="M44,46 L56,46 L54,82 C54,85 46,85 46,82 Z" strokeWidth="2.5" className="fill-slate-800 stroke-slate-655 print:fill-white print:stroke-black"/>
        {/* Green collar to distinguish backing vocals */}
        <rect x="43" y="44" width="14" height="4" rx="0.5" className="fill-emerald-500 print:fill-black"/>
        {/* On/Off Switch */}
        <rect x="48" y="55" width="4" height="8" rx="0.5" className="fill-slate-955 print:fill-black"/>
        <circle cx="50" cy="57" r="1" className="fill-emerald-400 print:fill-white"/>
      </svg>
    )
  },
  HORNS: {
    label: "Vientos", width: 12, height: 12, defaultRotation: 180,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="25" y="45" width="50" height="16" rx="8" className="fill-amber-500 stroke-amber-700 print:fill-white print:stroke-black" strokeWidth="2"/> 
        <circle cx="50" cy="50" r="16" className="fill-slate-100 stroke-slate-700 print:fill-white print:stroke-black" strokeWidth="2.5"/> 
        <path d="M50,40 L44,14 L56,14 Z" className="fill-amber-500 print:fill-black"/> 
        {/* Bell flare */}
        <ellipse cx="50" cy="14" rx="9" ry="3.5" className="fill-amber-400 stroke-amber-600 print:fill-white print:stroke-black" strokeWidth="1.5"/>
      </svg>
    )
  },
  PERC: {
    label: "Percusión", width: 18, height: 18, defaultRotation: 180,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <circle cx="35" cy="35" r="14" strokeWidth="2" className="fill-amber-300 stroke-amber-700 print:fill-white print:stroke-black"/> 
        <circle cx="65" cy="35" r="14" strokeWidth="2" className="fill-amber-300 stroke-amber-700 print:fill-white print:stroke-black"/> 
        <rect x="30" y="60" width="40" height="15" rx="7" className="fill-slate-500 stroke-slate-700 print:fill-white print:stroke-black" strokeWidth="1.5"/> 
        <circle cx="50" cy="65" r="14" strokeWidth="2" className="fill-slate-100 stroke-slate-700 print:fill-white print:stroke-black"/> 
      </svg>
    )
  },
  MONITOR: {
    label: "Monitor", width: 12, height: 8, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        <polygon points="10,20 90,20 80,80 20,80" strokeWidth="3.5" className="fill-slate-900 stroke-slate-700 print:fill-white print:stroke-black"/>
        <rect x="30" y="35" width="40" height="30" rx="1.5" strokeWidth="1.5" className="fill-slate-800 stroke-slate-600 print:fill-slate-100 print:stroke-black"/>
      </svg>
    )
  },
  AMP: {
    label: "Amp / Cab", width: 12, height: 8, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
        {/* Outer frame */}
        <rect x="5" y="8" width="90" height="84" rx="4" strokeWidth="3.5" className="fill-slate-900 stroke-slate-600 print:fill-white print:stroke-black"/>
        {/* Grille mesh */}
        <rect x="12" y="28" width="76" height="56" rx="2" className="fill-slate-955 stroke-slate-700 print:fill-slate-100 print:stroke-black"/>
        {/* Twin speaker cones */}
        <circle cx="32" cy="56" r="14" strokeWidth="1" className="fill-slate-900 stroke-slate-600 print:fill-slate-200 print:stroke-black"/>
        <circle cx="68" cy="56" r="14" strokeWidth="1" className="fill-slate-900 stroke-slate-600 print:fill-slate-200 print:stroke-black"/>
        {/* Control panel strip */}
        <rect x="12" y="14" width="76" height="10" className="fill-slate-800 print:fill-black"/>
        <circle cx="22" cy="19" r="2.5" className="fill-slate-400 print:fill-white"/>
        <circle cx="32" cy="19" r="2.5" className="fill-slate-400 print:fill-white"/>
        <circle cx="42" cy="19" r="2.5" className="fill-slate-400 print:fill-white"/>
        <circle cx="52" cy="19" r="2.5" className="fill-slate-400 print:fill-white"/>
        <rect x="74" y="17" width="6" height="4" className="fill-red-555 print:fill-white"/>
      </svg>
    )
  },
  POWER: {
    label: "Toma 220V", width: 3, height: 3, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Red square background */}
        <rect x="5" y="5" width="90" height="90" strokeWidth="3" rx="12" className="fill-red-650 stroke-red-750 print:fill-white print:stroke-black"/>
        {/* Lightning bolt (Rayo) */}
        <path d="M55,10 L30,52 L48,52 L40,90 L70,44 L52,44 Z" className="fill-yellow-400 stroke-yellow-500 print:fill-black print:stroke-black"/>
      </svg>
    )
  },
  DI: {
    label: "D.I. Box", width: 3, height: 2, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="8" y="20" width="84" height="60" rx="8" strokeWidth="3" className="fill-slate-855 stroke-slate-600 print:fill-white print:stroke-black"/>
        {/* XLR output on right */}
        <circle cx="78" cy="50" r="10" strokeWidth="1.5" className="fill-slate-955 stroke-slate-655 print:fill-slate-200 print:stroke-black"/>
        <circle cx="78" cy="50" r="4" className="fill-slate-400 print:fill-black"/>
        {/* Jack input on left */}
        <rect x="18" y="44" width="12" height="12" rx="2" className="fill-slate-700 print:fill-black"/>
        <circle cx="24" cy="50" r="3" className="fill-slate-955 print:fill-white"/>
        {/* Center D.I text */}
        <text x="43" y="62" textAnchor="middle" className="fill-white print:fill-black font-sans font-black select-none text-[34px] tracking-tight">D.I</text>
      </svg>
    )
  },
  MIC_STAND: {
    label: "Mic. Atril", width: 6, height: 6, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="28" strokeWidth="2" className="fill-slate-800 stroke-slate-600 print:fill-white print:stroke-black"/>
        <circle cx="50" cy="50" r="10" className="fill-slate-500 print:fill-black"/>
        <line x1="50" y1="50" x2="50" y2="10" strokeWidth="6" strokeLinecap="round" className="stroke-slate-400 print:stroke-black"/>
        <circle cx="50" cy="6" r="6" className="fill-slate-955 print:fill-black"/>
      </svg>
    )
  },
  DJ_BOOTH: {
    label: "DJ Booth", width: 20, height: 13, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        {/* Table Base */}
        <rect x="5" y="10" width="90" height="80" rx="4" strokeWidth="3" className="fill-slate-900 stroke-slate-600 print:fill-white print:stroke-black"/>
        {/* Left CDJ Player */}
        <rect x="12" y="24" width="22" height="34" rx="2" strokeWidth="1.5" className="fill-slate-955 stroke-slate-700 print:fill-slate-100 print:stroke-black"/>
        <circle cx="23" cy="41" r="7" strokeWidth="1" className="fill-slate-800 stroke-slate-500 print:fill-slate-200 print:stroke-black"/>
        <circle cx="23" cy="41" r="2" className="fill-slate-400 print:fill-black"/>
        {/* Right CDJ Player */}
        <rect x="66" y="24" width="22" height="34" rx="2" strokeWidth="1.5" className="fill-slate-955 stroke-slate-700 print:fill-slate-100 print:stroke-black"/>
        <circle cx="77" cy="41" r="7" strokeWidth="1" className="fill-slate-800 stroke-slate-500 print:fill-slate-200 print:stroke-black"/>
        <circle cx="77" cy="41" r="2" className="fill-slate-400 print:fill-black"/>
        {/* Mixer in middle */}
        <rect x="39" y="24" width="22" height="34" rx="2" strokeWidth="1.5" className="fill-slate-955 stroke-slate-700 print:fill-slate-100 print:stroke-black"/>
        <line x1="45" y1="30" x2="45" y2="45" strokeWidth="1.5" className="stroke-slate-500 print:stroke-black"/>
        <line x1="55" y1="30" x2="55" y2="45" strokeWidth="1.5" className="stroke-slate-500 print:stroke-black"/>
        <line x1="44" y1="50" x2="56" y2="50" strokeWidth="2" className="stroke-slate-400 print:stroke-black"/>
        {/* Laptop stand/screen */}
        <rect x="30" y="65" width="40" height="18" rx="2" strokeWidth="1.5" className="fill-slate-800 stroke-slate-600 print:fill-white print:stroke-black"/>
        <rect x="35" y="68" width="30" height="6" className="fill-slate-955 print:fill-black"/>
      </svg>
    )
  },
  SUBWOOFER: {
    label: "Subbajo", width: 11, height: 11, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <rect x="5" y="5" width="90" height="90" rx="8" strokeWidth="3" className="fill-slate-900 stroke-slate-600 print:fill-white print:stroke-black"/>
        <circle cx="50" cy="50" r="32" strokeWidth="2" className="fill-slate-955 stroke-slate-700 print:fill-slate-100 print:stroke-black"/>
        <circle cx="50" cy="50" r="20" strokeWidth="1.5" className="fill-slate-800 stroke-slate-600 print:fill-slate-50 print:stroke-black"/>
        <circle cx="50" cy="50" r="8" className="fill-slate-955 print:fill-black"/>
        <circle cx="15" cy="15" r="2.5" className="fill-slate-600 print:fill-black"/>
        <circle cx="85" cy="15" r="2.5" className="fill-slate-600 print:fill-black"/>
        <circle cx="15" cy="85" r="2.5" className="fill-slate-600 print:fill-black"/>
        <circle cx="85" cy="85" r="2.5" className="fill-slate-600 print:fill-black"/>
      </svg>
    )
  },
  RISER: {
    label: "Tarima Riser", width: 22, height: 22, defaultRotation: 0,
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Stage platform riser panel */}
        <rect x="5" y="5" width="90" height="90" strokeWidth="3" rx="4" className="fill-slate-900/10 stroke-slate-500 print:fill-white print:stroke-black"/>
        <line x1="5" y1="35" x2="95" y2="35" strokeWidth="1" className="stroke-slate-750 print:stroke-black"/>
        <line x1="5" y1="65" x2="95" y2="65" strokeWidth="1" className="stroke-slate-750 print:stroke-black"/>
        <line x1="35" y1="5" x2="35" y2="95" strokeWidth="1" className="stroke-slate-750 print:stroke-black"/>
        <line x1="65" y1="5" x2="65" y2="95" strokeWidth="1" className="stroke-slate-750 print:stroke-black"/>
      </svg>
    )
  }
};

export const StageplotBuilder = ({ items, onChange, config, onConfigChange, readOnly = false, projectName = "" }) => {
  const canvasRef = useRef(null);
  const [draggedId, setDraggedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(600);

  const [customPresets, setCustomPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_stageplot_presets');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [newPresetName, setNewPresetName] = useState('');

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      alert("Por favor ingresa un nombre para el preset.");
      return;
    }
    const name = newPresetName.trim();
    if (['rock_band', 'acoustic_duo', 'trio_jazz'].includes(name.toLowerCase())) {
      alert("No puedes usar un nombre de preset por defecto.");
      return;
    }
    // Copy the current items but map to strip original IDs to avoid clashes
    const presetItems = items.map(({ id, ...rest }) => rest);
    const updatedPresets = {
      ...customPresets,
      [name]: presetItems
    };
    setCustomPresets(updatedPresets);
    localStorage.setItem('custom_stageplot_presets', JSON.stringify(updatedPresets));
    setNewPresetName('');
    alert(`Preset "${name}" guardado con éxito!`);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setCanvasWidth(entry.contentRect.width || entry.target.clientWidth);
      }
    });
    observer.observe(canvasRef.current);
    setCanvasWidth(canvasRef.current.clientWidth || 600);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (e, id) => {
    if (readOnly) return;
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggedId(id);
    setSelectedId(id);
  };

  const handlePointerMove = (e) => {
    if (!draggedId || readOnly || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    onChange(items.map(item => item.id === draggedId ? { ...item, x, y } : item));
  };

  const handlePointerUp = (e) => {
    if (draggedId) {
      e.target.releasePointerCapture(e.pointerId);
      setDraggedId(null);
    }
  };

  const addItem = (typeKey) => {
    const defaultItem = STAGE_ITEMS[typeKey];
    const newItem = {
      id: Date.now().toString(),
      type: typeKey,
      label: defaultItem.label,
      x: 50, 
      y: 50,
      rotation: defaultItem.defaultRotation || 0,
      scale: 1.0
    };
    onChange([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const updateSelected = (updates) => {
    onChange(items.map(item => item.id === selectedId ? { ...item, ...updates } : item));
  };

  const removeSelected = () => {
    onChange(items.filter(item => item.id !== selectedId));
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const itemToDuplicate = items.find(item => item.id === selectedId);
    if (!itemToDuplicate) return;
    const newItem = {
      ...itemToDuplicate,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      x: Math.min(95, itemToDuplicate.x + 5),
      y: Math.min(95, itemToDuplicate.y + 5),
      label: itemToDuplicate.label ? `${itemToDuplicate.label} (Copia)` : `${STAGE_ITEMS[itemToDuplicate.type].label} (Copia)`
    };
    onChange([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const nudgeItem = (dx, dy) => {
    if (readOnly || !selectedId) return;
    onChange(items.map(item => {
      if (item.id === selectedId) {
        const x = Math.max(0, Math.min(100, item.x + dx));
        const y = Math.max(0, Math.min(100, item.y + dy));
        return { ...item, x, y };
      }
      return item;
    }));
  };

  const loadPreset = (presetName) => {
    let presetItems = [];
    if (presetName === 'rock_band') {
      presetItems = [
        { id: '1', type: 'DRUMS', label: 'Batería', x: 50, y: 30, rotation: 0, scale: 1.0 },
        { id: '4', type: 'VOCALS', label: 'Voz Principal', x: 50, y: 75, rotation: 0, scale: 1.0 },
        { id: '5', type: 'MONITOR', label: 'Mon Escenario', x: 50, y: 88, rotation: 0, scale: 1.0 }
      ];
    } else if (presetName === 'acoustic_duo') {
      presetItems = [
        { id: '3', type: 'VOCALS', label: 'Voz 1', x: 40, y: 78, rotation: 0, scale: 1.0 },
        { id: '4', type: 'VOCALS', label: 'Voz 2', x: 60, y: 78, rotation: 0, scale: 1.0 },
        { id: '5', type: 'MONITOR', label: 'Mon 1', x: 38, y: 88, rotation: 0, scale: 1.0 },
        { id: '6', type: 'MONITOR', label: 'Mon 2', x: 62, y: 88, rotation: 0, scale: 1.0 }
      ];
    } else if (presetName === 'trio_jazz') {
      presetItems = [
        { id: '1', type: 'DRUMS', label: 'Batería', x: 75, y: 40, rotation: 0, scale: 1.0 },
        { id: '2', type: 'PIANO', label: 'Piano de Cola', x: 25, y: 50, rotation: 0, scale: 1.0 },
        { id: '4', type: 'MONITOR', label: 'Mon Piano', x: 25, y: 70, rotation: 0, scale: 1.0 },
        { id: '5', type: 'MONITOR', label: 'Mon Batería', x: 75, y: 65, rotation: 0, scale: 1.0 }
      ];
    } else if (customPresets[presetName]) {
      presetItems = customPresets[presetName].map((item, idx) => ({
        ...item,
        id: `${Date.now()}-${idx}`
      }));
    }
    onChange(presetItems);
    setSelectedId(null);
  };

  const containerClasses = isFullscreen 
    ? "fixed inset-0 md:inset-4 z-[200] bg-slate-900 border border-slate-700 md:rounded-xl shadow-2xl p-2 md:p-4 flex flex-col md:flex-row gap-4"
    : "flex flex-col md:flex-row gap-4 h-full print:block";

  // Risers are sorted to render at the bottom of the SVG stack (so other items can superimpose on them)
  const sortedItems = [...items].sort((a, b) => {
    const orderA = a.type === 'RISER' ? 0 : 10;
    const orderB = b.type === 'RISER' ? 0 : 10;
    return orderA - orderB;
  });

  return (
    <div className="space-y-4 w-full">
      <div className={containerClasses}>
        {!readOnly && (
          <div className="w-full md:w-56 bg-slate-955 md:bg-slate-900 border border-slate-800 md:border-slate-700 rounded-xl p-3 shrink-0 print:hidden flex flex-col gap-3 h-auto max-h-[35vh] md:max-h-none overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Equipos</h3>
              <Button variant="ghost" className="px-1 py-1" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize size={16}/> : <Maximize size={16}/>}
              </Button>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2 flex-1 overflow-y-auto custom-scrollbar">
              {Object.entries(STAGE_ITEMS)
                .filter(([key]) => ['DRUMS', 'KEYS', 'MONITOR', 'AMP', 'POWER', 'DI', 'MIC_STAND'].includes(key))
                .map(([key, def]) => (
                  <button 
                    key={key} type="button" onClick={() => addItem(key)}
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-6 h-6 pointer-events-none">{def.render()}</div>
                    <span className="text-[8px] font-bold text-slate-300 leading-tight text-center">{def.label}</span>
                  </button>
                ))
              }
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Músicos</h3>
              <select 
                onChange={(e) => { if (e.target.value) { addItem(e.target.value); e.target.value = ''; } }}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-[10px] text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Añadir músico...</option>
                <option value="TELECASTER">Guitarra Telecaster</option>
                <option value="JAZZBASS">Bajo Jazz Bass</option>
                <option value="VOCALS">Voz Principal</option>
                <option value="BACKING_VOCALS">Coros</option>
                <option value="HORNS">Vientos</option>
                <option value="PERC">Percusión</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Presets</h3>
              <select 
                onChange={(e) => { if (e.target.value) { loadPreset(e.target.value); e.target.value = ''; } }}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-[10px] text-white outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">Cargar preset...</option>
                <option value="rock_band">Banda de Rock</option>
                <option value="acoustic_duo">Dúo Acústico</option>
                <option value="trio_jazz">Jazz Trío</option>
                {Object.keys(customPresets).map((name) => (
                  <option key={name} value={name}>{name} (Usuario)</option>
                ))}
              </select>

              <div className="flex flex-col gap-1.5 pt-1">
                <input 
                  type="text" 
                  value={newPresetName} 
                  onChange={(e) => setNewPresetName(e.target.value)} 
                  placeholder="Nombre de Preset..."
                  className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-[10px] text-white outline-none focus:border-emerald-500"
                />
                <button 
                  type="button" 
                  onClick={handleSavePreset}
                  className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-[10px] font-bold text-white rounded transition-colors"
                >
                  Guardar como Preset
                </button>
              </div>

              {Object.keys(customPresets).length > 0 && (
                <div className="flex gap-1 pt-1">
                  <select 
                    id="delete-preset-select"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded p-1 text-[9px] text-slate-400 outline-none cursor-pointer"
                  >
                    <option value="">Eliminar preset...</option>
                    {Object.keys(customPresets).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => {
                      const sel = document.getElementById('delete-preset-select');
                      if (sel && sel.value) {
                        const name = sel.value;
                        if (confirm(`¿Estás seguro de eliminar el preset "${name}"?`)) {
                          const updated = { ...customPresets };
                          delete updated[name];
                          setCustomPresets(updated);
                          localStorage.setItem('custom_stageplot_presets', JSON.stringify(updated));
                          sel.value = '';
                        }
                      }
                    }}
                    className="px-2 py-1 bg-red-650 hover:bg-red-700 text-[9px] font-bold text-white rounded transition-colors"
                  >
                    Borrar
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2 mt-auto">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dimensiones Stage</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-550 font-bold uppercase">Ancho (m)</label>
                  <input type="number" min="2" max="50" className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white outline-none focus:border-emerald-500" value={config.width} onChange={e=>onConfigChange({...config, width: e.target.value.replace(/[^0-9]/g, '')})} onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} />
                </div>
                <div>
                  <label className="text-[9px] text-slate-550 font-bold uppercase">Fondo (m)</label>
                  <input type="number" min="2" max="50" className="w-full bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white outline-none focus:border-emerald-500" value={config.depth} onChange={e=>onConfigChange({...config, depth: e.target.value.replace(/[^0-9]/g, '')})} onKeyDown={e => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 bg-slate-800 p-2 md:p-4 rounded-xl border border-slate-700 print:bg-white print:border-none print:p-0 flex items-center justify-center overflow-hidden relative">
          <div 
            id="canvas-bg"
            ref={canvasRef}
            className="relative w-full max-h-full bg-slate-955 print:bg-white border-2 border-slate-700 print:border-black touch-none shadow-inner"
            style={{ 
              aspectRatio: `${config.width} / ${config.depth}`,
              maxHeight: isFullscreen ? '85vh' : 'auto'
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerDown={(e) => {
              if (e.target.id === 'canvas-bg') setSelectedId(null);
            }}
          >
            {projectName && (
              <div className="absolute top-2 md:top-4 left-3 md:left-5 text-sm md:text-lg font-black text-slate-500 print:text-black uppercase tracking-widest pointer-events-none opacity-50 print:opacity-100 z-0">
                {projectName}
              </div>
            )}

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:5%_5%] opacity-20 print:opacity-10 pointer-events-none z-0"></div>
            
            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-0">
              <span className="text-[9px] md:text-xs font-black tracking-widest text-slate-500 print:text-black uppercase">Público / Front of Stage</span>
            </div>

            {sortedItems.map((item) => {
              const def = STAGE_ITEMS[item.type];
              if (!def) return null;
              const isSelected = selectedId === item.id && !readOnly;

              const w = Number(config.width) || 10;
              const d = Number(config.depth) || 8;
              const sizeScale = Math.max(0.6, Math.min(2.0, 10 / w));
              
              let deviceScale = 1.0;
              if (canvasWidth) {
                if (canvasWidth < 500) {
                  deviceScale = 0.65;
                } else if (canvasWidth < 850) {
                  deviceScale = 0.82;
                }
              }
              const itemScale = item.scale !== undefined ? item.scale : 1.0;
              const scale = sizeScale * deviceScale * itemScale;

              const itemWidthPercent = def.width * scale;
              const itemHeightPercent = itemWidthPercent * (def.height / def.width) * (w / d);

              let sidePlacement = 'right';
              if (item.x > 70) {
                sidePlacement = 'left';
              } else {
                const itemToRight = items.some(other => {
                  if (other.id === item.id) return false;
                  const dx = other.x - item.x;
                  const dy = Math.abs(item.y - other.y);
                  return dx > 0 && dx < 24 && dy < 15;
                });
                if (itemToRight) {
                  sidePlacement = 'left';
                }
              }
              const labelPosClass = sidePlacement === 'right'
                ? 'absolute left-[calc(100%+2px)] top-1/2 -translate-y-1/2'
                : 'absolute right-[calc(100%+2px)] top-1/2 -translate-y-1/2';

              const originalIdx = items.findIndex(it => it.id === item.id);

              return (
                <div 
                  key={item.id}
                  className="absolute flex flex-col items-center justify-center print:cursor-default touch-none"
                  style={{ 
                    left: `${item.x}%`, top: `${item.y}%`, 
                    width: `${itemWidthPercent}%`, height: `${itemHeightPercent}%`,
                    transform: `translate(-50%, -50%)`, 
                    zIndex: isSelected ? 50 : (item.type === 'RISER' ? 5 : 10)
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-[-52px] left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-1.5 flex items-center gap-1.5 z-[60] cursor-default pointer-events-auto"
                         onPointerDown={e => e.stopPropagation()}>
                      <input 
                        className="bg-slate-955 text-white border border-slate-800 rounded px-2.5 py-1 text-[11px] font-bold w-28 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                        value={item.label} 
                        onChange={e => updateSelected({ label: e.target.value })}
                        placeholder="Nombre..."
                      />
                      <button type="button" onClick={() => updateSelected({ rotation: (item.rotation + 45) % 360 })} className="p-1.5 bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors" title="Girar 45º"><RotateCw size={12}/></button>
                      <button type="button" onClick={duplicateSelected} className="p-1.5 bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors" title="Duplicar"><Copy size={12}/></button>
                      <button type="button" onClick={removeSelected} className="p-1.5 bg-slate-800 hover:bg-red-600 rounded text-white border border-slate-700 transition-colors" title="Eliminar"><Trash2 size={12}/></button>
                    </div>
                  )}

                  <div 
                    className={`w-full h-full cursor-move transition-transform flex items-center justify-center ${isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-955 rounded-sm' : ''} print:ring-0`}
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                    onPointerDown={(e) => handlePointerDown(e, item.id)}
                  >
                    {def.render()}
                  </div>
                  
                  {item.label && (!isSelected || readOnly) && (
                    <div className={`${labelPosClass} bg-white text-black border border-slate-300 px-1.5 py-0.5 rounded text-[8px] font-black pointer-events-none shadow-md flex items-center gap-1 z-40 whitespace-nowrap print:bg-white print:text-black print:border-black`}>
                      <span className="text-emerald-655 font-black">#{originalIdx + 1}</span>
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* D-Pad & Scale Controller for mobile precise nudge and scaling adjustments */}
          {selectedId && !readOnly && (
            <div className="absolute bottom-10 right-4 bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-xl flex flex-col gap-2 items-center z-[70] shadow-2xl print:hidden animate-fade-in touch-none w-28 text-slate-100">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">Ajuste Fino</span>
              
              <div className="grid grid-cols-3 gap-1 w-24">
                <div></div>
                <button 
                  type="button" 
                  onClick={() => nudgeItem(0, -1)} 
                  className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors active:bg-emerald-700 text-xs"
                >
                  ▲
                </button>
                <div></div>
                
                <button 
                  type="button" 
                  onClick={() => nudgeItem(-1, 0)} 
                  className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors active:bg-emerald-700 text-xs"
                >
                  ◀
                </button>
                <div className="w-7 h-7 bg-slate-955 border border-slate-850 rounded flex items-center justify-center text-[9px] font-bold text-slate-500">
                  {Math.round(items.find(it => it.id === selectedId)?.x)}%
                </div>
                <button 
                  type="button" 
                  onClick={() => nudgeItem(1, 0)} 
                  className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors active:bg-emerald-700 text-xs"
                >
                  ▶
                </button>
                
                <div></div>
                <button 
                  type="button" 
                  onClick={() => nudgeItem(0, 1)} 
                  className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 transition-colors active:bg-emerald-700 text-xs"
                >
                  ▼
                </button>
                <div></div>
              </div>

              {/* Stash scaling slider/control */}
              <div className="border-t border-slate-800 pt-1.5 w-full flex flex-col items-center gap-1.5">
                <span className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider">Escala</span>
                <div className="flex gap-1.5 w-full justify-between">
                  <button 
                    type="button" 
                    onClick={() => updateSelected({ scale: Math.max(0.4, Number((items.find(it => it.id === selectedId)?.scale || 1.0) - 0.1).toFixed(1)) })}
                    className="flex-1 py-0.5 bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 text-[10px] font-black active:bg-emerald-700"
                  >
                    -
                  </button>
                  <span className="text-[9px] font-mono font-bold text-slate-300 self-center">
                    {Math.round((items.find(it => it.id === selectedId)?.scale || 1.0) * 100)}%
                  </span>
                  <button 
                    type="button" 
                    onClick={() => updateSelected({ scale: Math.min(2.5, Number((items.find(it => it.id === selectedId)?.scale || 1.0) + 0.1).toFixed(1)) })}
                    className="flex-1 py-0.5 bg-slate-800 hover:bg-emerald-600 rounded text-white border border-slate-700 text-[10px] font-black active:bg-emerald-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-2 print:mt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Leyenda y Control de Escenario</h4>
          <span className="text-[10px] text-slate-500 font-bold">{items.length} {items.length === 1 ? 'objeto' : 'objetos'}</span>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center p-6 text-xs text-slate-500 italic">No hay equipos agregados en el escenario.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 print:grid-cols-3 gap-2 text-xs">
            {items.map((item, idx) => {
              const def = STAGE_ITEMS[item.type];
              if (!def) return null;
              return (
                <div 
                  key={item.id} 
                  onClick={() => !readOnly && setSelectedId(item.id)}
                  className={`flex items-center justify-between gap-2 p-1.5 rounded-lg border transition-colors ${selectedId === item.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/20'} print:border-black print:bg-white`}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[10px] border border-emerald-500/30 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-4 h-4 shrink-0 text-slate-400">{def.render()}</div>
                    <div className="flex-1 min-w-0 text-left">
                      {readOnly ? (
                        <p className="text-[11px] text-slate-300 font-bold truncate leading-none">{item.label || def.label}</p>
                      ) : (
                        <input 
                          className="w-full bg-white text-black border border-slate-300 focus:border-emerald-500 rounded px-1.5 py-0.5 text-[11px] font-bold outline-none transition-colors leading-none"
                          value={item.label}
                          onChange={(e) => {
                            onChange(items.map(it => it.id === item.id ? { ...it, label: e.target.value } : it));
                          }}
                          placeholder={def.label}
                        />
                      )}
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0 print:hidden">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(items.map(it => it.id === item.id ? { ...it, rotation: (it.rotation + 45) % 360 } : it));
                        }} 
                        className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded transition-colors"
                        title={`Rotar: ${item.rotation}°`}
                      >
                        <RotateCw size={10}/>
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(items.filter(it => it.id !== item.id));
                          if (selectedId === item.id) setSelectedId(null);
                        }} 
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={10}/>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StageplotBuilder;
