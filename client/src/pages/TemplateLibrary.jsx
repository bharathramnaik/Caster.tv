import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TemplateCard from '../components/templates/TemplateCard';
import TemplatePreview from '../components/templates/TemplatePreview';
import TemplateImportExport from '../components/templates/TemplateImportExport';
import TemplateCategories from '../components/templates/TemplateCategories';
import TemplateVersions from '../components/templates/TemplateVersions';
import TemplateSharing from '../components/templates/TemplateSharing';

const API = import.meta.env.VITE_API_URL || '';

const CATEGORIES = ['all', 'lower-third', 'full-screen', 'ticker', 'scoreboard', 'player-card', 'common'];
const SPORTS = ['all', 'generic', 'cricket', 'football', 'basketball', 'tennis'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'category', label: 'Category' },
  { value: 'sport', label: 'Sport' }
];


const DEMO_TEMPLATES = [
  {
    id: 't1', name: 'Classic Scorebug', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 20, y: 15, width: 50, height: 120 }, style: { backgroundColor: 'linear-gradient(135deg, #1a5e1f, #0d3d12)', borderRadius: 12, boxShadow: '0 2px 10px rgba(26,94,31,0.5)' }, content: '' },
      { id: 'e3', type: 'text', position: { x: 20, y: 40, width: 50, height: 70 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', lineHeight: 1 }, content: 'IND' },
      { id: 'e4', type: 'text', position: { x: 85, y: 15, width: 150, height: 50 }, style: { color: '#E3B23C', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'INDIA' },
      { id: 'e5', type: 'text', position: { x: 85, y: 55, width: 200, height: 65 }, style: { color: '#ffffff', fontSize: 56, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }, content: '186/4' },
      { id: 'e6', type: 'text', position: { x: 85, y: 115, width: 150, height: 30 }, style: { color: '#64748b', fontSize: 16, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1 }, content: '15.2 Overs' },
      { id: 'e7', type: 'shape', position: { x: 310, y: 55, width: 2, height: 40 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e8', type: 'text', position: { x: 330, y: 30, width: 200, height: 35 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BATTERS' },
      { id: 'e9', type: 'text', position: { x: 330, y: 55, width: 200, height: 35 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '700', fontFamily: 'Teko' }, content: 'V. Kohli 67*' },
      { id: 'e10', type: 'text', position: { x: 330, y: 90, width: 200, height: 35 }, style: { color: '#94a3b8', fontSize: 20, fontWeight: '600', fontFamily: 'Teko' }, content: 'R. Pant 23' },
      { id: 'e11', type: 'shape', position: { x: 580, y: 55, width: 2, height: 40 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e12', type: 'text', position: { x: 600, y: 30, width: 180, height: 35 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BOWLER' },
      { id: 'e13', type: 'text', position: { x: 600, y: 55, width: 200, height: 35 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '700', fontFamily: 'Teko' }, content: 'P. Cummins' },
      { id: 'e14', type: 'text', position: { x: 600, y: 90, width: 200, height: 35 }, style: { color: '#ef4444', fontSize: 20, fontWeight: '700', fontFamily: 'Teko' }, content: '0-42 (3.2 ov)' },
      { id: 'e15', type: 'shape', position: { x: 850, y: 55, width: 2, height: 40 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e16', type: 'text', position: { x: 870, y: 30, width: 200, height: 35 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'LAST 5 BALLS' },
      { id: 'e17', type: 'shape', position: { x: 870, y: 65, width: 36, height: 36 }, style: { backgroundColor: '#16a34a', borderRadius: 6 }, content: '' },
      { id: 'e18', type: 'text', position: { x: 870, y: 68, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '4' },
      { id: 'e19', type: 'shape', position: { x: 912, y: 65, width: 36, height: 36 }, style: { backgroundColor: '#16a34a', borderRadius: 6 }, content: '' },
      { id: 'e20', type: 'text', position: { x: 912, y: 68, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '6' },
      { id: 'e21', type: 'shape', position: { x: 954, y: 65, width: 36, height: 36 }, style: { backgroundColor: '#475569', borderRadius: 6 }, content: '' },
      { id: 'e22', type: 'text', position: { x: 954, y: 68, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '•' },
      { id: 'e23', type: 'shape', position: { x: 996, y: 65, width: 36, height: 36 }, style: { backgroundColor: '#dc2626', borderRadius: 6 }, content: '' },
      { id: 'e24', type: 'text', position: { x: 996, y: 68, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: 'W' },
      { id: 'e25', type: 'shape', position: { x: 1038, y: 65, width: 36, height: 36 }, style: { backgroundColor: '#475569', borderRadius: 6 }, content: '' },
      { id: 'e26', type: 'text', position: { x: 1038, y: 68, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '1' },
      { id: 'e27', type: 'shape', position: { x: 1150, y: 15, width: 320, height: 120 }, style: { backgroundColor: 'linear-gradient(135deg, #1a3c5e, #0d1e30)', borderRadius: 12, boxShadow: '0 2px 10px rgba(26,60,94,0.5)' }, content: '' },
      { id: 'e28', type: 'text', position: { x: 1160, y: 15, width: 300, height: 40 }, style: { color: '#60a5fa', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'AUSTRALIA' },
      { id: 'e29', type: 'text', position: { x: 1160, y: 45, width: 300, height: 65 }, style: { color: '#ffffff', fontSize: 48, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }, content: '0/0' },
      { id: 'e30', type: 'text', position: { x: 1160, y: 110, width: 300, height: 25 }, style: { color: '#64748b', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Yet to bat' },
      { id: 'e31', type: 'shape', position: { x: 1500, y: 15, width: 400, height: 120 }, style: { backgroundColor: 'linear-gradient(135deg, #7c3aed, #4c1d95)', borderRadius: 12, boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }, content: '' },
      { id: 'e32', type: 'text', position: { x: 1510, y: 20, width: 380, height: 35 }, style: { color: '#c4b5fd', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'MATCH STATUS' },
      { id: 'e33', type: 'text', position: { x: 1510, y: 50, width: 380, height: 45 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }, content: 'INDIA WON TOSS' },
      { id: 'e34', type: 'text', position: { x: 1510, y: 95, width: 380, height: 30 }, style: { color: '#a78bfa', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'T20I · 3rd Match · Wankhede' },
    ], createdAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 't2', name: 'Player Lower Third', category: 'lower-third', sport: 'cricket', canvas: { width: 1920, height: 120 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 120 }, style: { backgroundColor: 'linear-gradient(180deg, #1a5e1f 0%, #0d3d12 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 0, width: 8, height: 120 }, style: { backgroundColor: '#E3B23C' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 40, y: 20, width: 80, height: 80 }, style: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 40, border: '3px solid #E3B23C' }, content: '' },
      { id: 'e4', type: 'text', position: { x: 40, y: 35, width: 80, height: 50 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', lineHeight: 1 }, content: '7' },
      { id: 'e5', type: 'text', position: { x: 140, y: 15, width: 400, height: 30 }, style: { color: '#E3B23C', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'BATSMAN' },
      { id: 'e6', type: 'text', position: { x: 140, y: 40, width: 500, height: 50 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 8px rgba(0,0,0,0.4)', letterSpacing: 1 }, content: 'VIRAT KOHLI' },
      { id: 'e7', type: 'text', position: { x: 140, y: 85, width: 300, height: 25 }, style: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Right-Hand Bat · India' },
      { id: 'e8', type: 'shape', position: { x: 700, y: 15, width: 2, height: 90 }, style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 1 }, content: '' },
      { id: 'e9', type: 'text', position: { x: 730, y: 15, width: 120, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'RUNS' },
      { id: 'e10', type: 'text', position: { x: 730, y: 35, width: 120, height: 45 }, style: { color: '#ffffff', fontSize: 38, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }, content: '67' },
      { id: 'e11', type: 'text', position: { x: 860, y: 15, width: 120, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BALLS' },
      { id: 'e12', type: 'text', position: { x: 860, y: 35, width: 120, height: 45 }, style: { color: '#ffffff', fontSize: 38, fontWeight: '900', fontFamily: 'Teko' }, content: '48' },
      { id: 'e13', type: 'text', position: { x: 990, y: 15, width: 120, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'S/R' },
      { id: 'e14', type: 'text', position: { x: 990, y: 35, width: 120, height: 45 }, style: { color: '#ffffff', fontSize: 38, fontWeight: '900', fontFamily: 'Teko' }, content: '139' },
      { id: 'e15', type: 'text', position: { x: 1120, y: 15, width: 120, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: '4s' },
      { id: 'e16', type: 'text', position: { x: 1120, y: 35, width: 120, height: 45 }, style: { color: '#ffffff', fontSize: 38, fontWeight: '900', fontFamily: 'Teko' }, content: '6' },
      { id: 'e17', type: 'text', position: { x: 1250, y: 15, width: 120, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: '6s' },
      { id: 'e18', type: 'text', position: { x: 1250, y: 35, width: 120, height: 45 }, style: { color: '#ffffff', fontSize: 38, fontWeight: '900', fontFamily: 'Teko' }, content: '2' },
      { id: 'e19', type: 'shape', position: { x: 1450, y: 20, width: 440, height: 80 }, style: { backgroundColor: 'rgba(227,178,60,0.15)', borderRadius: 10, border: '1px solid rgba(227,178,60,0.3)' }, content: '' },
      { id: 'e20', type: 'text', position: { x: 1460, y: 25, width: 420, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'PARTNERSHIP' },
      { id: 'e21', type: 'text', position: { x: 1460, y: 48, width: 200, height: 40 }, style: { color: '#ffffff', fontSize: 34, fontWeight: '900', fontFamily: 'Teko' }, content: '87' },
      { id: 'e22', type: 'text', position: { x: 1680, y: 48, width: 200, height: 40 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '600', fontFamily: 'Outfit' }, content: 'of 52 balls' },
    ], createdAt: '2025-01-14T08:30:00Z'
  },
  {
    id: 't3', name: 'Full Scorecard', category: 'full-screen', sport: 'cricket', canvas: { width: 1920, height: 1080 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 1080 }, style: { backgroundColor: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 100 }, style: { backgroundColor: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 0, y: 96, width: 1920, height: 4 }, style: { backgroundColor: '#E3B23C' }, content: '' },
      { id: 'e4', type: 'text', position: { x: 40, y: 15, width: 800, height: 35 }, style: { color: '#E3B23C', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'IPL 2025 · MATCH 45' },
      { id: 'e5', type: 'text', position: { x: 40, y: 45, width: 800, height: 50 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko', letterSpacing: 1 }, content: 'FULL SCORECARD' },
      { id: 'e6', type: 'text', position: { x: 1400, y: 20, width: 500, height: 30 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit', textAlign: 'right' }, content: 'Wankhede Stadium, Mumbai' },
      { id: 'e7', type: 'text', position: { x: 1400, y: 50, width: 500, height: 35 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'right' }, content: 'CSK 192/4 (20 ov)' },
      { id: 'e8', type: 'shape', position: { x: 40, y: 120, width: 900, height: 45 }, style: { backgroundColor: 'rgba(227,178,60,0.1)', borderRadius: 8, border: '1px solid rgba(227,178,60,0.2)' }, content: '' },
      { id: 'e9', type: 'text', position: { x: 60, y: 128, width: 300, height: 30 }, style: { color: '#E3B23C', fontSize: 18, fontWeight: '800', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BATTING · CSK' },
      { id: 'e10', type: 'text', position: { x: 40, y: 185, width: 300, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BATSMAN' },
      { id: 'e11', type: 'text', position: { x: 400, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'R' },
      { id: 'e12', type: 'text', position: { x: 520, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'B' },
      { id: 'e13', type: 'text', position: { x: 640, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: '4s' },
      { id: 'e14', type: 'text', position: { x: 760, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: '6s' },
      { id: 'e15', type: 'text', position: { x: 880, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'S/R' },
      { id: 'e16', type: 'shape', position: { x: 40, y: 220, width: 900, height: 40 }, style: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4 }, content: '' },
      { id: 'e17', type: 'text', position: { x: 60, y: 225, width: 300, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Teko' }, content: 'Ruturaj Gaikwad *' },
      { id: 'e18', type: 'text', position: { x: 400, y: 225, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '72' },
      { id: 'e19', type: 'text', position: { x: 520, y: 225, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '600', fontFamily: 'Outfit', textAlign: 'center' }, content: '52' },
      { id: 'e20', type: 'text', position: { x: 640, y: 225, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '7' },
      { id: 'e21', type: 'text', position: { x: 760, y: 225, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '3' },
      { id: 'e22', type: 'text', position: { x: 880, y: 225, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '138.4' },
      { id: 'e23', type: 'shape', position: { x: 40, y: 265, width: 900, height: 40 }, style: { backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: 4 }, content: '' },
      { id: 'e24', type: 'text', position: { x: 60, y: 270, width: 300, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Teko' }, content: 'Devon Conway' },
      { id: 'e25', type: 'text', position: { x: 400, y: 270, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '34' },
      { id: 'e26', type: 'text', position: { x: 520, y: 270, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '600', fontFamily: 'Outfit', textAlign: 'center' }, content: '28' },
      { id: 'e27', type: 'text', position: { x: 640, y: 270, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '4' },
      { id: 'e28', type: 'text', position: { x: 760, y: 270, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '1' },
      { id: 'e29', type: 'text', position: { x: 880, y: 270, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '121.4' },
      { id: 'e30', type: 'shape', position: { x: 40, y: 310, width: 900, height: 40 }, style: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4 }, content: '' },
      { id: 'e31', type: 'text', position: { x: 60, y: 315, width: 300, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Teko' }, content: 'Shivam Dube' },
      { id: 'e32', type: 'text', position: { x: 400, y: 315, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '28' },
      { id: 'e33', type: 'text', position: { x: 520, y: 315, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '600', fontFamily: 'Outfit', textAlign: 'center' }, content: '18' },
      { id: 'e34', type: 'text', position: { x: 640, y: 315, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '3' },
      { id: 'e35', type: 'text', position: { x: 760, y: 315, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '2' },
      { id: 'e36', type: 'text', position: { x: 880, y: 315, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '155.5' },
      { id: 'e37', type: 'shape', position: { x: 40, y: 355, width: 900, height: 40 }, style: { backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: 4 }, content: '' },
      { id: 'e38', type: 'text', position: { x: 60, y: 360, width: 300, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Teko' }, content: 'Ravindra Jadeja *' },
      { id: 'e39', type: 'text', position: { x: 400, y: 360, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '18' },
      { id: 'e40', type: 'text', position: { x: 520, y: 360, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '600', fontFamily: 'Outfit', textAlign: 'center' }, content: '14' },
      { id: 'e41', type: 'text', position: { x: 640, y: 360, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '2' },
      { id: 'e42', type: 'text', position: { x: 760, y: 360, width: 100, height: 30 }, style: { color: '#16a34a', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '1' },
      { id: 'e43', type: 'text', position: { x: 880, y: 360, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '128.5' },
      { id: 'e44', type: 'shape', position: { x: 980, y: 120, width: 900, height: 45 }, style: { backgroundColor: 'rgba(96,165,250,0.1)', borderRadius: 8, border: '1px solid rgba(96,165,250,0.2)' }, content: '' },
      { id: 'e45', type: 'text', position: { x: 1000, y: 128, width: 300, height: 30 }, style: { color: '#60a5fa', fontSize: 18, fontWeight: '800', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BOWLING · MI' },
      { id: 'e46', type: 'text', position: { x: 980, y: 185, width: 300, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BOWLER' },
      { id: 'e47', type: 'text', position: { x: 1340, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'O' },
      { id: 'e48', type: 'text', position: { x: 1460, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'M' },
      { id: 'e49', type: 'text', position: { x: 1580, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'R' },
      { id: 'e50', type: 'text', position: { x: 1700, y: 185, width: 100, height: 30 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'W' },
      { id: 'e51', type: 'shape', position: { x: 980, y: 220, width: 900, height: 40 }, style: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4 }, content: '' },
      { id: 'e52', type: 'text', position: { x: 1000, y: 225, width: 300, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Teko' }, content: 'Jasprit Bumrah' },
      { id: 'e53', type: 'text', position: { x: 1340, y: 225, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '4' },
      { id: 'e54', type: 'text', position: { x: 1460, y: 225, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '1' },
      { id: 'e55', type: 'text', position: { x: 1580, y: 225, width: 100, height: 30 }, style: { color: '#ef4444', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '28' },
      { id: 'e56', type: 'text', position: { x: 1700, y: 225, width: 100, height: 30 }, style: { color: '#ef4444', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '2' },
      { id: 'e57', type: 'shape', position: { x: 980, y: 265, width: 900, height: 40 }, style: { backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: 4 }, content: '' },
      { id: 'e58', type: 'text', position: { x: 1000, y: 270, width: 300, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Teko' }, content: 'Trent Boult' },
      { id: 'e59', type: 'text', position: { x: 1340, y: 270, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '4' },
      { id: 'e60', type: 'text', position: { x: 1460, y: 270, width: 100, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '0' },
      { id: 'e61', type: 'text', position: { x: 1580, y: 270, width: 100, height: 30 }, style: { color: '#ef4444', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '36' },
      { id: 'e62', type: 'text', position: { x: 1700, y: 270, width: 100, height: 30 }, style: { color: '#ef4444', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center' }, content: '1' },
      { id: 'e63', type: 'shape', position: { x: 40, y: 420, width: 1840, height: 2 }, style: { backgroundColor: '#1e293b' }, content: '' },
      { id: 'e64', type: 'text', position: { x: 40, y: 440, width: 600, height: 35 }, style: { color: '#E3B23C', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'EXTRAS' },
      { id: 'e65', type: 'text', position: { x: 40, y: 475, width: 800, height: 30 }, style: { color: '#94a3b8', fontSize: 16, fontFamily: 'Outfit' }, content: 'Wide: 3  |  No Ball: 1  |  Bye: 2  |  Leg Bye: 1  |  Total Extras: 7' },
      { id: 'e66', type: 'text', position: { x: 40, y: 530, width: 600, height: 35 }, style: { color: '#E3B23C', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'DID NOT BAT' },
      { id: 'e67', type: 'text', position: { x: 40, y: 565, width: 800, height: 30 }, style: { color: '#94a3b8', fontSize: 16, fontFamily: 'Outfit' }, content: 'MS Dhoni, Moeen Ali, Deepak Chahar, Tushar Deshpande, Matheesha Pathirana' },
      { id: 'e68', type: 'shape', position: { x: 40, y: 620, width: 1840, height: 2 }, style: { backgroundColor: '#1e293b' }, content: '' },
      { id: 'e69', type: 'text', position: { x: 40, y: 650, width: 300, height: 40 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '900', fontFamily: 'Teko' }, content: 'TOTAL: 192/4' },
      { id: 'e70', type: 'text', position: { x: 350, y: 650, width: 400, height: 40 }, style: { color: '#94a3b8', fontSize: 18, fontFamily: 'Outfit' }, content: '(20.0 Overs · RR: 9.60)' },
      { id: 'e71', type: 'shape', position: { x: 40, y: 710, width: 400, height: 60 }, style: { backgroundColor: 'linear-gradient(135deg, #1a5e1f, #0d3d12)', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }, content: '' },
      { id: 'e72', type: 'text', position: { x: 60, y: 715, width: 360, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'TARGET' },
      { id: 'e73', type: 'text', position: { x: 60, y: 735, width: 360, height: 30 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '900', fontFamily: 'Teko' }, content: '193 Runs from 120 Balls' },
    ], createdAt: '2025-01-13T15:00:00Z'
  },
  {
    id: 't4', name: 'Breaking News Ticker', category: 'ticker', sport: 'generic', canvas: { width: 1920, height: 60 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 60 }, style: { backgroundColor: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', boxShadow: '0 4px 15px rgba(220,38,38,0.4)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 0, width: 240, height: 60 }, style: { backgroundColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }, content: '' },
      { id: 'e3', type: 'text', position: { x: 20, y: 12, width: 200, height: 36 }, style: { color: '#1a1a2e', fontSize: 24, fontWeight: '900', fontFamily: 'Teko', letterSpacing: 3, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }, content: 'BREAKING' },
      { id: 'e4', type: 'shape', position: { x: 260, y: 15, width: 4, height: 30 }, style: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 }, content: '' },
      { id: 'e5', type: 'text', position: { x: 280, y: 15, width: 1600, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 0.5, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }, content: 'Virat Kohli smashes century as India posts 287/5 in the first innings at Wankhede Stadium' },
      { id: 'e6', type: 'shape', position: { x: 1880, y: 10, width: 30, height: 40 }, style: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }, content: '' },
      { id: 'e7', type: 'text', position: { x: 1882, y: 16, width: 26, height: 28 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '700', fontFamily: 'Teko', textAlign: 'center' }, content: '>' },
    ], createdAt: '2025-01-12T12:00:00Z'
  },
  {
    id: 't5', name: 'Batter Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 0, width: 280, height: 150 }, style: { backgroundColor: 'linear-gradient(135deg, #1a5e1f 0%, #0d3d12 100%)' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 280, y: 0, width: 6, height: 150 }, style: { backgroundColor: '#E3B23C' }, content: '' },
      { id: 'e4', type: 'shape', position: { x: 30, y: 25, width: 100, height: 100 }, style: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50, border: '3px solid rgba(227,178,60,0.6)' }, content: '' },
      { id: 'e5', type: 'text', position: { x: 30, y: 45, width: 100, height: 60 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', lineHeight: 1 }, content: '18' },
      { id: 'e6', type: 'text', position: { x: 145, y: 30, width: 120, height: 25 }, style: { color: '#E3B23C', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'BATTER' },
      { id: 'e7', type: 'text', position: { x: 145, y: 55, width: 120, height: 50 }, style: { color: '#ffffff', fontSize: 32, fontWeight: '900', fontFamily: 'Teko', letterSpacing: 1 }, content: 'ROHIT' },
      { id: 'e8', type: 'text', position: { x: 145, y: 95, width: 120, height: 30 }, style: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit' }, content: 'Sharma' },
      { id: 'e9', type: 'shape', position: { x: 310, y: 15, width: 180, height: 120 }, style: { backgroundColor: 'rgba(227,178,60,0.08)', borderRadius: 12, border: '1px solid rgba(227,178,60,0.15)' }, content: '' },
      { id: 'e10', type: 'text', position: { x: 320, y: 20, width: 160, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'RUNS' },
      { id: 'e11', type: 'text', position: { x: 320, y: 40, width: 160, height: 70 }, style: { color: '#E3B23C', fontSize: 64, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', textShadow: '0 4px 15px rgba(227,178,60,0.3)' }, content: '87' },
      { id: 'e12', type: 'text', position: { x: 320, y: 105, width: 160, height: 25 }, style: { color: '#64748b', fontSize: 12, fontWeight: '500', fontFamily: 'Outfit', textAlign: 'center' }, content: 'not out' },
      { id: 'e13', type: 'shape', position: { x: 520, y: 25, width: 2, height: 100 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e14', type: 'text', position: { x: 550, y: 20, width: 150, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BALLS' },
      { id: 'e15', type: 'text', position: { x: 550, y: 40, width: 150, height: 40 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '62' },
      { id: 'e16', type: 'text', position: { x: 550, y: 90, width: 150, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'S/R' },
      { id: 'e17', type: 'text', position: { x: 550, y: 110, width: 150, height: 30 }, style: { color: '#16a34a', fontSize: 28, fontWeight: '900', fontFamily: 'Teko' }, content: '140.3' },
      { id: 'e18', type: 'shape', position: { x: 730, y: 25, width: 2, height: 100 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e19', type: 'text', position: { x: 760, y: 20, width: 100, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: '4s' },
      { id: 'e20', type: 'text', position: { x: 760, y: 40, width: 100, height: 40 }, style: { color: '#16a34a', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '8' },
      { id: 'e21', type: 'text', position: { x: 880, y: 20, width: 100, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: '6s' },
      { id: 'e22', type: 'text', position: { x: 880, y: 40, width: 100, height: 40 }, style: { color: '#16a34a', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '4' },
      { id: 'e23', type: 'text', position: { x: 1000, y: 20, width: 150, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'DOTS' },
      { id: 'e24', type: 'text', position: { x: 1000, y: 40, width: 150, height: 40 }, style: { color: '#94a3b8', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '22' },
      { id: 'e25', type: 'shape', position: { x: 1180, y: 15, width: 700, height: 120 }, style: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }, content: '' },
      { id: 'e26', type: 'text', position: { x: 1200, y: 25, width: 300, height: 25 }, style: { color: '#64748b', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BOUNDARY MAP' },
      { id: 'e27', type: 'shape', position: { x: 1200, y: 55, width: 660, height: 70 }, style: { backgroundColor: 'rgba(26,94,31,0.15)', borderRadius: 8, border: '1px solid rgba(26,94,31,0.2)' }, content: '' },
      { id: 'e28', type: 'text', position: { x: 1220, y: 65, width: 200, height: 25 }, style: { color: '#16a34a', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'LEG SIDE: 9' },
      { id: 'e29', type: 'text', position: { x: 1440, y: 65, width: 200, height: 25 }, style: { color: '#60a5fa', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'OFF SIDE: 3' },
      { id: 'e30', type: 'text', position: { x: 1220, y: 95, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Straight: 5' },
      { id: 'e31', type: 'text', position: { x: 1440, y: 95, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Square: 4' },
      { id: 'e32', type: 'text', position: { x: 1660, y: 95, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Fine: 3' },
    ], createdAt: '2025-01-11T09:00:00Z'
  },
  {
    id: 't6', name: 'IPL Scoreboard', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: 'linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 146, width: 1920, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #818cf8, #6366f1, #818cf8)' }, content: '' },
      { id: 'e3', type: 'text', position: { x: 30, y: 10, width: 200, height: 35 }, style: { color: '#818cf8', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'IPL 2025' },
      { id: 'e4', type: 'text', position: { x: 30, y: 40, width: 150, height: 55 }, style: { color: '#ffffff', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'MATCH 45' },
      { id: 'e5', type: 'shape', position: { x: 250, y: 15, width: 2, height: 120 }, style: { backgroundColor: 'rgba(129,140,248,0.3)', borderRadius: 1 }, content: '' },
      { id: 'e6', type: 'text', position: { x: 280, y: 10, width: 300, height: 35 }, style: { color: '#fbbf24', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'CHENNAI SUPER KINGS' },
      { id: 'e7', type: 'text', position: { x: 280, y: 45, width: 250, height: 70 }, style: { color: '#ffffff', fontSize: 64, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }, content: '192/4' },
      { id: 'e8', type: 'text', position: { x: 540, y: 60, width: 120, height: 35 }, style: { color: '#64748b', fontSize: 16, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1 }, content: '(20 ov)' },
      { id: 'e9', type: 'text', position: { x: 280, y: 115, width: 300, height: 25 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'RR: 9.60 · RR req: 9.65' },
      { id: 'e10', type: 'shape', position: { x: 720, y: 50, width: 480, height: 50 }, style: { backgroundColor: 'rgba(251,191,36,0.1)', borderRadius: 10, border: '1px solid rgba(251,191,36,0.2)' }, content: '' },
      { id: 'e11', type: 'text', position: { x: 740, y: 55, width: 440, height: 40 }, style: { color: '#fbbf24', fontSize: 24, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', letterSpacing: 2 }, content: 'VS' },
      { id: 'e12', type: 'text', position: { x: 1250, y: 10, width: 300, height: 35 }, style: { color: '#60a5fa', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'right' }, content: 'MUMBAI INDIANS' },
      { id: 'e13', type: 'text', position: { x: 1250, y: 45, width: 300, height: 70 }, style: { color: '#ffffff', fontSize: 64, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'right' }, content: '0/0' },
      { id: 'e14', type: 'text', position: { x: 1250, y: 115, width: 300, height: 25 }, style: { color: '#64748b', fontSize: 13, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1, textAlign: 'right' }, content: 'Yet to bat' },
      { id: 'e15', type: 'shape', position: { x: 1650, y: 15, width: 240, height: 120 }, style: { backgroundColor: 'linear-gradient(135deg, #7c3aed, #4c1d95)', borderRadius: 12, boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }, content: '' },
      { id: 'e16', type: 'text', position: { x: 1660, y: 20, width: 220, height: 25 }, style: { color: '#c4b5fd', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'POWERPLAY' },
      { id: 'e17', type: 'text', position: { x: 1660, y: 45, width: 220, height: 45 }, style: { color: '#ffffff', fontSize: 32, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }, content: '58/1' },
      { id: 'e18', type: 'text', position: { x: 1660, y: 95, width: 220, height: 25 }, style: { color: '#a78bfa', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Overs 1-6' },
    ], createdAt: '2025-01-10T14:00:00Z'
  },
  {
    id: 't7', name: 'Football Scorebug', category: 'scoreboard', sport: 'football', canvas: { width: 1920, height: 120 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 120 }, style: { backgroundColor: 'linear-gradient(180deg, #065f46 0%, #064e3b 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 116, width: 1920, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #10b981, #34d399, #10b981)' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 30, y: 20, width: 50, height: 80 }, style: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }, content: '' },
      { id: 'e4', type: 'text', position: { x: 30, y: 35, width: 50, height: 50 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center' }, content: 'MU' },
      { id: 'e5', type: 'text', position: { x: 100, y: 15, width: 350, height: 35 }, style: { color: '#fbbf24', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'MANCHESTER UNITED' },
      { id: 'e6', type: 'text', position: { x: 100, y: 50, width: 250, height: 50 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '600', fontFamily: 'Outfit' }, content: 'HOME' },
      { id: 'e7', type: 'shape', position: { x: 580, y: 10, width: 240, height: 100 }, style: { backgroundColor: 'linear-gradient(135deg, #14532d, #0a3020)', borderRadius: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '2px solid rgba(251,191,36,0.3)' }, content: '' },
      { id: 'e8', type: 'text', position: { x: 590, y: 15, width: 100, height: 35 }, style: { color: '#10b981', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'LIVE' },
      { id: 'e9', type: 'text', position: { x: 590, y: 35, width: 220, height: 60 }, style: { color: '#ffffff', fontSize: 56, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center' }, content: '2 - 1' },
      { id: 'e10', type: 'text', position: { x: 590, y: 90, width: 220, height: 20 }, style: { color: '#6ee7b7', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', textAlign: 'center', letterSpacing: 1 }, content: "72' SECOND HALF" },
      { id: 'e11', type: 'shape', position: { x: 880, y: 10, width: 160, height: 45 }, style: { backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.3)' }, content: '' },
      { id: 'e12', type: 'text', position: { x: 890, y: 16, width: 140, height: 32 }, style: { color: '#fbbf24', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center', letterSpacing: 2 }, content: "HT 1-0" },
      { id: 'e13', type: 'text', position: { x: 1420, y: 15, width: 400, height: 35 }, style: { color: '#60a5fa', fontSize: 18, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3, textAlign: 'right' }, content: 'LIVERPOOL FC' },
      { id: 'e14', type: 'text', position: { x: 1470, y: 50, width: 250, height: 50 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '600', fontFamily: 'Outfit', textAlign: 'right' }, content: 'AWAY' },
      { id: 'e15', type: 'shape', position: { x: 1830, y: 20, width: 50, height: 80 }, style: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 }, content: '' },
      { id: 'e16', type: 'text', position: { x: 1830, y: 35, width: 50, height: 50 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center' }, content: 'LI' },
    ], createdAt: '2025-01-09T11:00:00Z'
  },
  {
    id: 't8', name: 'Basketball Scorebug', category: 'scoreboard', sport: 'basketball', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: 'linear-gradient(180deg, #991b1b 0%, #7f1d1d 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 146, width: 1920, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 30, y: 15, width: 80, height: 120 }, style: { backgroundColor: 'rgba(251,191,36,0.15)', borderRadius: 12, border: '2px solid rgba(251,191,36,0.4)' }, content: '' },
      { id: 'e4', type: 'text', position: { x: 30, y: 35, width: 80, height: 80 }, style: { color: '#fbbf24', fontSize: 36, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', lineHeight: 1 }, content: 'LAL' },
      { id: 'e5', type: 'text', position: { x: 140, y: 10, width: 350, height: 35 }, style: { color: '#fbbf24', fontSize: 20, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'LOS ANGELES LAKERS' },
      { id: 'e6', type: 'text', position: { x: 140, y: 45, width: 350, height: 65 }, style: { color: '#ffffff', fontSize: 72, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '98' },
      { id: 'e7', type: 'text', position: { x: 140, y: 115, width: 200, height: 25 }, style: { color: '#fca5a5', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Home · FG: 48.2%' },
      { id: 'e8', type: 'shape', position: { x: 680, y: 15, width: 560, height: 120 }, style: { backgroundColor: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.05))', borderRadius: 16, border: '2px solid rgba(251,191,36,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }, content: '' },
      { id: 'e9', type: 'text', position: { x: 700, y: 18, width: 200, height: 30 }, style: { color: '#fbbf24', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'Q4 · 4:32' },
      { id: 'e10', type: 'text', position: { x: 700, y: 45, width: 520, height: 70 }, style: { color: '#ffffff', fontSize: 64, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 20px rgba(0,0,0,0.5)', textAlign: 'center', letterSpacing: 8 }, content: '98 - 102' },
      { id: 'e11', type: 'shape', position: { x: 700, y: 115, width: 520, height: 3 }, style: { backgroundColor: 'rgba(251,191,36,0.3)', borderRadius: 2 }, content: '' },
      { id: 'e12', type: 'text', position: { x: 1280, y: 10, width: 350, height: 35 }, style: { color: '#86efac', fontSize: 20, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3, textAlign: 'right' }, content: 'BOSTON CELTICS' },
      { id: 'e13', type: 'text', position: { x: 1280, y: 45, width: 350, height: 65 }, style: { color: '#ffffff', fontSize: 72, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 20px rgba(0,0,0,0.5)', textAlign: 'right' }, content: '102' },
      { id: 'e14', type: 'text', position: { x: 1380, y: 115, width: 250, height: 25 }, style: { color: '#86efac', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1, textAlign: 'right' }, content: 'Away · FG: 51.3%' },
      { id: 'e15', type: 'shape', position: { x: 1800, y: 15, width: 80, height: 120 }, style: { backgroundColor: 'rgba(134,239,172,0.15)', borderRadius: 12, border: '2px solid rgba(134,239,172,0.4)' }, content: '' },
      { id: 'e16', type: 'text', position: { x: 1800, y: 35, width: 80, height: 80 }, style: { color: '#86efac', fontSize: 36, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', lineHeight: 1 }, content: 'BOS' },
    ], createdAt: '2025-01-08T16:00:00Z'
  },
  {
    id: 't9', name: 'Bowler Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 0, width: 280, height: 150 }, style: { backgroundColor: 'linear-gradient(135deg, #1a3c5e 0%, #0d1e30 100%)' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 280, y: 0, width: 6, height: 150 }, style: { backgroundColor: '#60a5fa' }, content: '' },
      { id: 'e4', type: 'shape', position: { x: 30, y: 25, width: 100, height: 100 }, style: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 50, border: '3px solid rgba(96,165,250,0.6)' }, content: '' },
      { id: 'e5', type: 'text', position: { x: 30, y: 45, width: 100, height: 60 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', lineHeight: 1 }, content: '11' },
      { id: 'e6', type: 'text', position: { x: 145, y: 30, width: 120, height: 25 }, style: { color: '#60a5fa', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'BOWLER' },
      { id: 'e7', type: 'text', position: { x: 145, y: 55, width: 120, height: 50 }, style: { color: '#ffffff', fontSize: 32, fontWeight: '900', fontFamily: 'Teko', letterSpacing: 1 }, content: 'PAT' },
      { id: 'e8', type: 'text', position: { x: 145, y: 95, width: 120, height: 30 }, style: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit' }, content: 'Cummins' },
      { id: 'e9', type: 'shape', position: { x: 310, y: 15, width: 180, height: 120 }, style: { backgroundColor: 'rgba(96,165,250,0.08)', borderRadius: 12, border: '1px solid rgba(96,165,250,0.15)' }, content: '' },
      { id: 'e10', type: 'text', position: { x: 320, y: 20, width: 160, height: 25 }, style: { color: '#60a5fa', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'FIGURES' },
      { id: 'e11', type: 'text', position: { x: 320, y: 40, width: 160, height: 70 }, style: { color: '#ef4444', fontSize: 64, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', textShadow: '0 4px 15px rgba(239,68,68,0.3)' }, content: '2-34' },
      { id: 'e12', type: 'text', position: { x: 320, y: 105, width: 160, height: 25 }, style: { color: '#64748b', fontSize: 12, fontWeight: '500', fontFamily: 'Outfit', textAlign: 'center' }, content: '4.0 - 1 - 28 - 2' },
      { id: 'e13', type: 'shape', position: { x: 520, y: 25, width: 2, height: 100 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e14', type: 'text', position: { x: 550, y: 20, width: 120, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'OVERS' },
      { id: 'e15', type: 'text', position: { x: 550, y: 40, width: 120, height: 40 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '4' },
      { id: 'e16', type: 'text', position: { x: 690, y: 20, width: 120, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'MAIDENS' },
      { id: 'e17', type: 'text', position: { x: 690, y: 40, width: 120, height: 40 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '0' },
      { id: 'e18', type: 'text', position: { x: 830, y: 20, width: 120, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'RUNS' },
      { id: 'e19', type: 'text', position: { x: 830, y: 40, width: 120, height: 40 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '34' },
      { id: 'e20', type: 'text', position: { x: 970, y: 20, width: 120, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'WKTS' },
      { id: 'e21', type: 'text', position: { x: 970, y: 40, width: 120, height: 40 }, style: { color: '#ef4444', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '2' },
      { id: 'e22', type: 'text', position: { x: 550, y: 90, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'ECON' },
      { id: 'e23', type: 'text', position: { x: 550, y: 110, width: 200, height: 30 }, style: { color: '#16a34a', fontSize: 28, fontWeight: '900', fontFamily: 'Teko' }, content: '8.50' },
      { id: 'e24', type: 'text', position: { x: 830, y: 90, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'AVG' },
      { id: 'e25', type: 'text', position: { x: 830, y: 110, width: 200, height: 30 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '900', fontFamily: 'Teko' }, content: '17.00' },
      { id: 'e26', type: 'text', position: { x: 1100, y: 20, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'LAST 5 BALLS' },
      { id: 'e27', type: 'shape', position: { x: 1100, y: 50, width: 36, height: 36 }, style: { backgroundColor: '#475569', borderRadius: 6 }, content: '' },
      { id: 'e28', type: 'text', position: { x: 1100, y: 53, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '4' },
      { id: 'e29', type: 'shape', position: { x: 1142, y: 50, width: 36, height: 36 }, style: { backgroundColor: '#16a34a', borderRadius: 6 }, content: '' },
      { id: 'e30', type: 'text', position: { x: 1142, y: 53, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '•' },
      { id: 'e31', type: 'shape', position: { x: 1184, y: 50, width: 36, height: 36 }, style: { backgroundColor: '#dc2626', borderRadius: 6 }, content: '' },
      { id: 'e32', type: 'text', position: { x: 1184, y: 53, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: 'W' },
      { id: 'e33', type: 'shape', position: { x: 1226, y: 50, width: 36, height: 36 }, style: { backgroundColor: '#16a34a', borderRadius: 6 }, content: '' },
      { id: 'e34', type: 'text', position: { x: 1226, y: 53, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '6' },
      { id: 'e35', type: 'shape', position: { x: 1268, y: 50, width: 36, height: 36 }, style: { backgroundColor: '#475569', borderRadius: 6 }, content: '' },
      { id: 'e36', type: 'text', position: { x: 1268, y: 53, width: 36, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '1' },
      { id: 'e37', type: 'shape', position: { x: 1400, y: 15, width: 480, height: 120 }, style: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }, content: '' },
      { id: 'e38', type: 'text', position: { x: 1420, y: 25, width: 200, height: 25 }, style: { color: '#64748b', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BOWLING ANALYSIS' },
      { id: 'e39', type: 'text', position: { x: 1420, y: 55, width: 440, height: 30 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit' }, content: 'Good length · Pace: 142-148 km/h' },
      { id: 'e40', type: 'text', position: { x: 1420, y: 90, width: 440, height: 30 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit' }, content: 'Bouncers: 3 · Yorkers: 2 · Slower balls: 1' },
    ], createdAt: '2025-01-07T10:00:00Z'
  },
  {
    id: 't10', name: 'Over Summary', category: 'ticker', sport: 'cricket', canvas: { width: 1920, height: 80 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 80 }, style: { backgroundColor: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)', boxShadow: '0 2px 15px rgba(0,0,0,0.4)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 76, width: 1920, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #E3B23C, transparent)' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 20, y: 10, width: 180, height: 60 }, style: { backgroundColor: 'rgba(227,178,60,0.12)', borderRadius: 10, border: '1px solid rgba(227,178,60,0.25)' }, content: '' },
      { id: 'e4', type: 'text', position: { x: 30, y: 12, width: 160, height: 25 }, style: { color: '#E3B23C', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'OVER 16' },
      { id: 'e5', type: 'text', position: { x: 30, y: 38, width: 160, height: 30 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '800', fontFamily: 'Teko' }, content: '15 Runs' },
      { id: 'e6', type: 'shape', position: { x: 220, y: 20, width: 2, height: 40 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e7', type: 'text', position: { x: 250, y: 12, width: 300, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'BALL-BY-BALL' },
      { id: 'e8', type: 'shape', position: { x: 250, y: 42, width: 36, height: 30 }, style: { backgroundColor: '#16a34a', borderRadius: 6 }, content: '' },
      { id: 'e9', type: 'text', position: { x: 250, y: 44, width: 36, height: 26 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '4' },
      { id: 'e10', type: 'shape', position: { x: 292, y: 42, width: 36, height: 30 }, style: { backgroundColor: '#16a34a', borderRadius: 6 }, content: '' },
      { id: 'e11', type: 'text', position: { x: 292, y: 44, width: 36, height: 26 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '6' },
      { id: 'e12', type: 'shape', position: { x: 334, y: 42, width: 36, height: 30 }, style: { backgroundColor: '#475569', borderRadius: 6 }, content: '' },
      { id: 'e13', type: 'text', position: { x: 334, y: 44, width: 36, height: 26 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '•' },
      { id: 'e14', type: 'shape', position: { x: 376, y: 42, width: 36, height: 30 }, style: { backgroundColor: '#475569', borderRadius: 6 }, content: '' },
      { id: 'e15', type: 'text', position: { x: 376, y: 44, width: 36, height: 26 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '2' },
      { id: 'e16', type: 'shape', position: { x: 418, y: 42, width: 36, height: 30 }, style: { backgroundColor: '#dc2626', borderRadius: 6 }, content: '' },
      { id: 'e17', type: 'text', position: { x: 418, y: 44, width: 36, height: 26 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: 'W' },
      { id: 'e18', type: 'shape', position: { x: 460, y: 42, width: 36, height: 30 }, style: { backgroundColor: '#475569', borderRadius: 6 }, content: '' },
      { id: 'e19', type: 'text', position: { x: 460, y: 44, width: 36, height: 26 }, style: { color: '#ffffff', fontSize: 16, fontWeight: '800', fontFamily: 'Teko', textAlign: 'center' }, content: '1' },
      { id: 'e20', type: 'shape', position: { x: 540, y: 20, width: 2, height: 40 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e21', type: 'text', position: { x: 570, y: 12, width: 250, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'CUMULATIVE' },
      { id: 'e22', type: 'text', position: { x: 570, y: 38, width: 120, height: 28 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '800', fontFamily: 'Teko' }, content: '186/4' },
      { id: 'e23', type: 'text', position: { x: 700, y: 38, width: 200, height: 28 }, style: { color: '#64748b', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit' }, content: '(15.2 ov)' },
      { id: 'e24', type: 'shape', position: { x: 930, y: 20, width: 2, height: 40 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e25', type: 'text', position: { x: 960, y: 12, width: 250, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'RUN RATE' },
      { id: 'e26', type: 'text', position: { x: 960, y: 38, width: 120, height: 28 }, style: { color: '#E3B23C', fontSize: 22, fontWeight: '800', fontFamily: 'Teko' }, content: '12.16' },
      { id: 'e27', type: 'text', position: { x: 1090, y: 38, width: 200, height: 28 }, style: { color: '#16a34a', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit' }, content: '↑ 0.8 from last over' },
      { id: 'e28', type: 'shape', position: { x: 1320, y: 20, width: 2, height: 40 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e29', type: 'text', position: { x: 1350, y: 12, width: 300, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'PARTNERSHIP' },
      { id: 'e30', type: 'text', position: { x: 1350, y: 38, width: 120, height: 28 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '800', fontFamily: 'Teko' }, content: '87 (52)' },
      { id: 'e31', type: 'text', position: { x: 1480, y: 38, width: 200, height: 28 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit' }, content: 'Kohli-Pant' },
    ], createdAt: '2025-01-06T08:00:00Z'
  },
  {
    id: 't11', name: 'Team Intro', category: 'full-screen', sport: 'generic', canvas: { width: 1920, height: 1080 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 1080 }, style: { backgroundColor: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 460, width: 1920, height: 160 }, style: { backgroundColor: 'rgba(227,178,60,0.08)', boxShadow: '0 0 100px rgba(227,178,60,0.1)' }, content: '' },
      { id: 'e3', type: 'shape', position: { x: 0, y: 458, width: 1920, height: 4 }, style: { backgroundColor: '#E3B23C' }, content: '' },
      { id: 'e4', type: 'shape', position: { x: 0, y: 618, width: 1920, height: 4 }, style: { backgroundColor: '#E3B23C' }, content: '' },
      { id: 'e5', type: 'text', position: { x: 460, y: 280, width: 1000, height: 60 }, style: { color: '#E3B23C', fontSize: 20, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 8, textAlign: 'center' }, content: 'PROFESSIONAL BROADCAST' },
      { id: 'e6', type: 'text', position: { x: 360, y: 340, width: 1200, height: 130 }, style: { color: '#ffffff', fontSize: 110, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.5)', letterSpacing: 6 }, content: 'TEAM INTRO' },
      { id: 'e7', type: 'shape', position: { x: 860, y: 490, width: 200, height: 3 }, style: { backgroundColor: '#E3B23C', borderRadius: 2 }, content: '' },
      { id: 'e8', type: 'text', position: { x: 560, y: 520, width: 800, height: 50 }, style: { color: '#E3B23C', fontSize: 32, fontWeight: '700', fontFamily: 'Outfit', textAlign: 'center', letterSpacing: 4 }, content: 'WANKHEDE STADIUM, MUMBAI' },
      { id: 'e9', type: 'text', position: { x: 660, y: 570, width: 600, height: 40 }, style: { color: '#94a3b8', fontSize: 18, fontWeight: '500', fontFamily: 'Outfit', textAlign: 'center', letterSpacing: 2 }, content: 'IPL 2025 · MATCH 45 · 7:30 PM IST' },
      { id: 'e10', type: 'shape', position: { x: 0, y: 0, width: 6, height: 1080 }, style: { backgroundColor: 'rgba(227,178,60,0.3)' }, content: '' },
      { id: 'e11', type: 'shape', position: { x: 1914, y: 0, width: 6, height: 1080 }, style: { backgroundColor: 'rgba(227,178,60,0.3)' }, content: '' },
      { id: 'e12', type: 'text', position: { x: 60, y: 920, width: 400, height: 30 }, style: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'SPORTSCASTER' },
      { id: 'e13', type: 'text', position: { x: 60, y: 950, width: 400, height: 30 }, style: { color: 'rgba(255,255,255,0.15)', fontSize: 12, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'LIVE BROADCAST GRAPHICS' },
    ], createdAt: '2025-01-05T13:00:00Z'
  },
  {
    id: 't12', name: 'Match Info', category: 'lower-third', sport: 'generic', canvas: { width: 1920, height: 100 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 100 }, style: { backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 0, width: 6, height: 100 }, style: { backgroundColor: '#E3B23C' }, content: '' },
      { id: 'e3', type: 'text', position: { x: 30, y: 12, width: 200, height: 25 }, style: { color: '#E3B23C', fontSize: 13, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'MATCH INFO' },
      { id: 'e4', type: 'text', position: { x: 30, y: 40, width: 600, height: 35 }, style: { color: '#ffffff', fontSize: 26, fontWeight: '800', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'IPL 2025 · Match 45' },
      { id: 'e5', type: 'text', position: { x: 30, y: 72, width: 400, height: 22 }, style: { color: '#64748b', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit' }, content: 'Chennai Super Kings vs Mumbai Indians' },
      { id: 'e6', type: 'shape', position: { x: 600, y: 20, width: 2, height: 60 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e7', type: 'text', position: { x: 630, y: 12, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'VENUE' },
      { id: 'e8', type: 'text', position: { x: 630, y: 38, width: 400, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '700', fontFamily: 'Outfit' }, content: 'Wankhede Stadium' },
      { id: 'e9', type: 'text', position: { x: 630, y: 65, width: 300, height: 22 }, style: { color: '#64748b', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit' }, content: 'Mumbai, Maharashtra' },
      { id: 'e10', type: 'shape', position: { x: 1100, y: 20, width: 2, height: 60 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e11', type: 'text', position: { x: 1130, y: 12, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'DATE & TIME' },
      { id: 'e12', type: 'text', position: { x: 1130, y: 38, width: 350, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '700', fontFamily: 'Outfit' }, content: 'May 10, 2025 · 7:30 PM' },
      { id: 'e13', type: 'text', position: { x: 1130, y: 65, width: 200, height: 22 }, style: { color: '#64748b', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit' }, content: 'IST (UTC +5:30)' },
      { id: 'e14', type: 'shape', position: { x: 1550, y: 20, width: 2, height: 60 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'e15', type: 'text', position: { x: 1580, y: 12, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'TOSS' },
      { id: 'e16', type: 'text', position: { x: 1580, y: 38, width: 300, height: 30 }, style: { color: '#ffffff', fontSize: 20, fontWeight: '700', fontFamily: 'Outfit' }, content: 'CSK won, elected to bat' },
    ], createdAt: '2025-01-04T09:30:00Z'
  },
  {
    id: 't13', name: 'Tennis Scorebug', category: 'scoreboard', sport: 'tennis', canvas: { width: 1920, height: 120 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 120 }, style: { backgroundColor: 'linear-gradient(180deg, #14532d 0%, #0a3020 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 116, width: 1920, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #22c55e, #16a34a, #22c55e)' }, content: '' },
      { id: 'e3', type: 'text', position: { x: 40, y: 12, width: 300, height: 30 }, style: { color: '#4ade80', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'N. DJOKOVIC' },
      { id: 'e4', type: 'text', position: { x: 40, y: 42, width: 100, height: 25 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'SRB [1]' },
      { id: 'e5', type: 'text', position: { x: 40, y: 72, width: 200, height: 40 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }, content: '6 4 3' },
      { id: 'e6', type: 'text', position: { x: 280, y: 72, width: 120, height: 40 }, style: { color: '#22c55e', fontSize: 20, fontWeight: '700', fontFamily: 'Teko' }, content: '*' },
      { id: 'e7', type: 'shape', position: { x: 500, y: 15, width: 920, height: 90 }, style: { backgroundColor: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))', borderRadius: 14, border: '2px solid rgba(34,197,94,0.3)' }, content: '' },
      { id: 'e8', type: 'text', position: { x: 520, y: 18, width: 150, height: 25 }, style: { color: '#4ade80', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'LIVE · SET 3' },
      { id: 'e9', type: 'text', position: { x: 700, y: 18, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'MEN SINGLES SF' },
      { id: 'e10', type: 'text', position: { x: 520, y: 45, width: 880, height: 50 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'center', letterSpacing: 6 }, content: '6 - 4  4 - 6  3 - 2' },
      { id: 'e11', type: 'shape', position: { x: 520, y: 95, width: 880, height: 3 }, style: { backgroundColor: 'rgba(34,197,94,0.3)', borderRadius: 2 }, content: '' },
      { id: 'e12', type: 'text', position: { x: 1580, y: 12, width: 300, height: 30 }, style: { color: '#fbbf24', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3, textAlign: 'right' }, content: 'C. ALCARAZ' },
      { id: 'e13', type: 'text', position: { x: 1680, y: 42, width: 200, height: 25 }, style: { color: '#94a3b8', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1, textAlign: 'right' }, content: 'ESP [3]' },
      { id: 'e14', type: 'text', position: { x: 1580, y: 72, width: 300, height: 40 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 10px rgba(0,0,0,0.4)', textAlign: 'right' }, content: '4 6 2' },
    ], createdAt: '2025-01-03T11:00:00Z'
  },
  {
    id: 't14', name: 'Sponsor Band', category: 'common', sport: 'generic', canvas: { width: 1920, height: 200 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 200 }, style: { backgroundColor: 'linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 100%)', boxShadow: '0 -4px 30px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'e2', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #818cf8, #a78bfa, #818cf8)' }, content: '' },
      { id: 'e3', type: 'text', position: { x: 60, y: 25, width: 300, height: 30 }, style: { color: '#818cf8', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'PRESENTED BY' },
      { id: 'e4', type: 'text', position: { x: 60, y: 55, width: 400, height: 50 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 10px rgba(0,0,0,0.3)', letterSpacing: 2 }, content: 'DREAM11' },
      { id: 'e5', type: 'text', position: { x: 60, y: 105, width: 300, height: 25 }, style: { color: '#a78bfa', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Official Fantasy Partner' },
      { id: 'e6', type: 'shape', position: { x: 520, y: 20, width: 2, height: 160 }, style: { backgroundColor: 'rgba(129,140,248,0.3)', borderRadius: 1 }, content: '' },
      { id: 'e7', type: 'text', position: { x: 560, y: 25, width: 300, height: 30 }, style: { color: '#818cf8', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'POWERED BY' },
      { id: 'e8', type: 'text', position: { x: 560, y: 55, width: 400, height: 50 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 10px rgba(0,0,0,0.3)', letterSpacing: 2 }, content: 'TATA IPL' },
      { id: 'e9', type: 'text', position: { x: 560, y: 105, width: 300, height: 25 }, style: { color: '#a78bfa', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Season 2025' },
      { id: 'e10', type: 'shape', position: { x: 1020, y: 20, width: 2, height: 160 }, style: { backgroundColor: 'rgba(129,140,248,0.3)', borderRadius: 1 }, content: '' },
      { id: 'e11', type: 'text', position: { x: 1060, y: 25, width: 300, height: 30 }, style: { color: '#818cf8', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'BROADCAST PARTNER' },
      { id: 'e12', type: 'text', position: { x: 1060, y: 55, width: 400, height: 50 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 10px rgba(0,0,0,0.3)', letterSpacing: 2 }, content: 'STAR SPORTS' },
      { id: 'e13', type: 'text', position: { x: 1060, y: 105, width: 300, height: 25 }, style: { color: '#a78bfa', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Official TV Partner' },
      { id: 'e14', type: 'shape', position: { x: 1520, y: 20, width: 2, height: 160 }, style: { backgroundColor: 'rgba(129,140,248,0.3)', borderRadius: 1 }, content: '' },
      { id: 'e15', type: 'text', position: { x: 1560, y: 25, width: 300, height: 30 }, style: { color: '#818cf8', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: 'DIGITAL PARTNER' },
      { id: 'e16', type: 'text', position: { x: 1560, y: 55, width: 320, height: 50 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 10px rgba(0,0,0,0.3)', letterSpacing: 2 }, content: 'JIOCINEMA' },
      { id: 'e17', type: 'text', position: { x: 1560, y: 105, width: 300, height: 25 }, style: { color: '#a78bfa', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 1 }, content: 'Streaming Free' },
      { id: 'e18', type: 'shape', position: { x: 0, y: 140, width: 1920, height: 2 }, style: { backgroundColor: 'rgba(129,140,248,0.15)' }, content: '' },
      { id: 'e19', type: 'text', position: { x: 60, y: 155, width: 800, height: 30 }, style: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'SPORTSCASTER · PROFESSIONAL BROADCAST GRAPHICS' },
      { id: 'e20', type: 'text', position: { x: 1200, y: 155, width: 660, height: 30 }, style: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 3, textAlign: 'right' }, content: 'WANKHEDE STADIUM · MUMBAI' },
    ], createdAt: '2025-01-02T14:30:00Z'
  },
];

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all');
  const [sport, setSport] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [versionsTemplate, setVersionsTemplate] = useState(null);
  const [sharingTemplate, setSharingTemplate] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/templates`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.templates || []);
        setTemplates(list.length > 0 ? list : DEMO_TEMPLATES);
        setLoading(false);
      })
      .catch(() => {
        setTemplates(DEMO_TEMPLATES);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = templates.filter(t => {
      if (category !== 'all' && t.category !== category) return false;
      if (sport !== 'all' && t.sport !== sport) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'sport':
          return (a.sport || 'generic').localeCompare(b.sport || 'generic');
        default:
          return 0;
      }
    });

    return result;
  }, [templates, category, sport, search, sortBy]);

  const handleImport = useCallback((template) => {
    setTemplates(prev => [...prev, template]);
  }, []);

  const handleDelete = useCallback((template) => {
    if (window.confirm(`Delete "${template.name}"?`)) {
      setTemplates(prev => prev.filter(t => t.id !== template.id));
    }
  }, []);

  const handleDuplicate = useCallback((template) => {
    const dupe = {
      ...template,
      id: `dup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, dupe]);
  }, []);

  const handleExport = useCallback((template) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name || 'template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates-library.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [templates]);

  const toggleBulkSelect = useCallback((id) => {
    setSelectedTemplates(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const bulkDelete = useCallback(() => {
    if (window.confirm(`Delete ${selectedTemplates.length} templates?`)) {
      setTemplates(prev => prev.filter(t => !selectedTemplates.includes(t.id)));
      setSelectedTemplates([]);
      setBulkMode(false);
    }
  }, [selectedTemplates]);

  const bulkExport = useCallback(() => {
    const selected = templates.filter(t => selectedTemplates.includes(t.id));
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates-selected.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [templates, selectedTemplates]);

  return (
    <div className="tl-layout">
      <div className="tl-topbar">
        <Link to="/" className="te-back">← Home</Link>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-100)' }}>Template Library</h2>
        <div className="tl-topbar-right">
          {bulkMode && selectedTemplates.length > 0 && (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>
                {selectedTemplates.length} selected
              </span>
              <button className="btn btn-sm btn-secondary" onClick={bulkExport}>📤 Export</button>
              <button className="btn btn-sm btn-danger" onClick={bulkDelete}>🗑 Delete</button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setBulkMode(false); setSelectedTemplates([]); }}>
                Cancel
              </button>
            </>
          )}
          <button
            className={`btn btn-sm ${bulkMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setBulkMode(!bulkMode); setSelectedTemplates([]); }}
          >
            {bulkMode ? '✓ Bulk' : '☑ Bulk'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowCategories(!showCategories)}>
            📂 Categories
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowImportExport(true)}>
            📥 Import/Export
          </button>
          <button className="btn btn-sm btn-secondary" onClick={handleExportAll}>
            📤 Export All
          </button>
          <Link to="/editor" className="btn btn-sm btn-primary">+ New Template</Link>
        </div>
      </div>

      <div className="tl-filters">
        <div className="tl-filters-top">
          <div className="tl-search-wrap">
            <span className="tl-search-icon">🔍</span>
            <input
              className="tl-search"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tl-view-toggle">
            <button
              className={`tl-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ▦
            </button>
            <button
              className={`tl-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 140 }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="tl-filters-row">
          <div className="tl-filter-group">
            <span className="tl-filter-label">Category</span>
            <div className="tl-filter-chips">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`tl-chip ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>
          <div className="tl-filter-group">
            <span className="tl-filter-label">Sport</span>
            <div className="tl-filter-chips">
              {SPORTS.map(s => (
                <button
                  key={s}
                  className={`tl-chip ${sport === s ? 'active' : ''}`}
                  onClick={() => setSport(s)}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
          <div className="tl-count">{filtered.length} templates</div>
        </div>
      </div>

      {showCategories && (
        <div className="tl-categories-panel">
          <TemplateCategories
            categories={categories}
            templates={templates}
            onUpdate={setCategories}
          />
        </div>
      )}

      <div className={viewMode === 'grid' ? 'tl-grid' : 'tl-list'}>
        {loading ? (
          <div className="tl-empty">Loading templates...</div>
        ) : filtered.length === 0 ? (
          <div className="tl-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p>No templates found matching your filters.</p>
            <Link to="/editor" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Create New Template</Link>
          </div>
        ) : (
          filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              viewMode={viewMode}
              onEdit={() => {}}
              onDelete={() => handleDelete(t)}
              onDuplicate={() => handleDuplicate(t)}
              onExport={() => handleExport(t)}
              onPreview={() => setPreviewTemplate(t)}
            />
          ))
        )}
      </div>

      {showImportExport && (
        <TemplateImportExport
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onEdit={() => {}}
          onDuplicate={() => handleDuplicate(previewTemplate)}
        />
      )}

      {versionsTemplate && (
        <TemplateVersions
          template={versionsTemplate}
          onClose={() => setVersionsTemplate(null)}
          onRestore={() => {}}
        />
      )}

      {sharingTemplate && (
        <TemplateSharing
          template={sharingTemplate}
          onClose={() => setSharingTemplate(null)}
        />
      )}
    </div>
  );
}
