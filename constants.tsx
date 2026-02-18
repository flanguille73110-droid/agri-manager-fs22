
import React from 'react';

export const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export const Icons = {
  Tractor: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 11 11 0"/><path d="M7 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M20 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M10 15v6"/><path d="M10 11V5a1 1 0 0 1 1-1h4"/><path d="M7 15V9a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v6"/></svg>
  ),
  Cow: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 13V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8"/><path d="M10 11H6"/><path d="M14 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"/><path d="M10 17v4"/><path d="M6 17v4"/></svg>
  ),
  Pig: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-2c-1.1 0-2-.9-2-2v-2h-6v2c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-5c0-2.8 2.2-5 5-5h1c.6-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5h2.5c2.5 0 4.5 2 4.5 4.5z"/><path d="M10 13a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>
  ),
  Chicken: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 14.5a3.5 3.5 0 1 0-2.5-6.3"/><path d="M7 11.5a3.5 3.5 0 1 1 5.6 4.3"/><path d="M13 19h-2"/><path d="M8 19h-2"/><path d="M10.5 16.5c-1.5 2-4 2.5-6 1.5 1.5-2.5 3.5-2.5 4.5-2"/><path d="M16 11c1.5 0 3-1 3-2.5"/></svg>
  ),
  Wallet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15"/><path d="M18 12v.01"/></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Pencil: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  )
};