import { useEffect } from 'react';
import {
  LayoutDashboard,
  ScanSearch,
  Layers,
  GitBranch,
  History,
  FileText,
  Lock,
  Menu,
  X,
  CirclePause,
  Type,
  Library,
  TrendingUp,
} from './Icons.js';
import Logo from './Logo.jsx';
import { RULES_VERSION } from '../utils/analyzer.js';

export const NAV_ITEMS = [
  { page: 'overview', label: 'Overview', icon: LayoutDashboard },
  { page: 'analyze', label: 'Message Analysis', icon: ScanSearch },
  { page: 'xray', label: 'Manipulation X-Ray', icon: Layers },
  { page: 'simulator', label: 'Scam Journey Simulator', icon: GitBranch },
  { page: 'library', label: 'Scam Library', icon: Library },
  { page: 'trends', label: 'Scam Trends', icon: TrendingUp },
  { page: 'history', label: 'Analysis History', icon: History },
  { page: 'act', label: 'Report & Next Steps', icon: FileText },
  { page: 'privacy', label: 'Privacy & Method', icon: Lock },
];

export default function Sidebar({ page, open, onOpen, onClose, onPause, simpleMode = false, onToggleSimple = () => {} }) {
  // Close the mobile drawer with the Escape key.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <header className="mobile-bar">
        <a href="#/overview" className="mobile-bar__brand" aria-label="JaalBreak home">
          <Logo />
        </a>
        <button type="button" className="icon-button icon-button--inverse" onClick={onOpen} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </header>

      <div className={`sidebar-scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar__top">
          <a href="#/overview" className="sidebar__brand" onClick={onClose} aria-label="JaalBreak home">
            <Logo />
          </a>
          <button type="button" className="icon-button icon-button--inverse sidebar__close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const active = page === item.page;
            return (
              <a
                key={item.page}
                href={`#/${item.page}`}
                className={`nav-link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
              >
                <span className="nav-link__num">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className="pause-button"
            onClick={() => {
              onClose();
              onPause();
            }}
          >
            <CirclePause size={18} aria-hidden="true" />
            <span>
              <strong>I feel pressured</strong>
              <small>Take a 60-second pause</small>
            </span>
          </button>
          <button
            type="button"
            className={`simple-toggle ${simpleMode ? 'is-on' : ''}`}
            aria-pressed={simpleMode}
            onClick={onToggleSimple}
          >
            <Type size={16} aria-hidden="true" />
            <span>{simpleMode ? 'Simple view: ON' : 'Simple view (bigger text)'}</span>
          </button>
          <div className="sidebar__meta">
            <span className="status-dot" aria-hidden="true" />
            Rules-only mode · v{RULES_VERSION}
          </div>
          <p className="sidebar__note">Prototype. It can make mistakes.</p>
        </div>
      </aside>
    </>
  );
}
