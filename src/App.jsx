// ---------------------------------------------------------------------------
// App shell: holds shared state (current analysis, history, settings) and
// shows the page that matches the URL hash.
//
// Who is using the app (see src/auth/AuthProvider.jsx):
//   - signed out          -> sign-in screen (with "Continue as Guest")
//   - guest               -> full app; history in this browser (localStorage)
//   - signed-in account   -> full app; history in Supabase (summaries only)
// The two histories are kept completely separate.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import PauseModal from './components/PauseModal.jsx';
import AccountBar from './components/AccountBar.jsx';
import Logo from './components/Logo.jsx';
import { LoaderCircle } from './components/Icons.js';
import OverviewPage from './pages/OverviewPage.jsx';
import AnalyzePage from './pages/AnalyzePage.jsx';
import XRayPage from './pages/XRayPage.jsx';
import SimulatorPage from './pages/SimulatorPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ActPage from './pages/ActPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import TrendsPage from './pages/TrendsPage.jsx';
import AuthScreen from './auth/AuthScreen.jsx';
import { useAuth } from './auth/AuthProvider.jsx';
import { analyzeMessage } from './utils/analyzer.js';
import { useHashRoute, navigate, AUTH_PAGES } from './utils/useHashRoute.js';
import {
  loadHistory,
  saveHistory,
  loadSettings,
  saveSettings,
  toRecord,
  clearAllJaalBreakData,
  DEFAULT_SETTINGS,
  MAX_RECORDS,
} from './utils/storage.js';
import {
  fetchCloudHistory,
  insertCloudRecord,
  insertCloudRecords,
  deleteCloudRecord,
  clearCloudHistory,
} from './lib/cloudHistory.js';
import { TRUST_STATEMENT } from './data/officialResources.js';

const EMPTY_DRAFT = { text: '', source: 'pasted', ocrConfidence: null };
const CLOUD_IDLE = { status: 'idle', error: '' };

export default function App() {
  const auth = useAuth();
  const route = useHashRoute();
  const isAccount = auth.status === 'authenticated';

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [analysis, setAnalysis] = useState(null);
  // Guest / browser-only history (unchanged behaviour: localStorage).
  const [localHistory, setLocalHistory] = useState(() => loadHistory());
  // Signed-in history (Supabase). Never written to localStorage.
  const [cloudHistory, setCloudHistory] = useState([]);
  const [cloud, setCloud] = useState(CLOUD_IDLE);
  const [settings, setSettings] = useState(() => loadSettings());
  const [pauseOpen, setPauseOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const history = isAccount ? cloudHistory : localHistory;

  // Keep localStorage in sync whenever guest history or settings change.
  useEffect(() => {
    saveHistory(localHistory);
  }, [localHistory]);
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // When the person using the app changes (sign in, sign out), forget the
  // message on screen so it never carries over to someone else.
  useEffect(() => {
    setDraft(EMPTY_DRAFT);
    setAnalysis(null);
  }, [auth.userId]);

  // Load account history after sign-in / session restore.
  useEffect(() => {
    if (!auth.userId) {
      setCloudHistory([]);
      setCloud(CLOUD_IDLE);
      return undefined;
    }
    let active = true;
    setCloud({ status: 'loading', error: '' });
    fetchCloudHistory()
      .then((records) => {
        if (!active) return;
        setCloudHistory(records);
        setCloud({ status: 'ready', error: '' });
      })
      .catch((err) => {
        if (active) setCloud({ status: 'offline', error: err.message });
      });
    return () => {
      active = false;
    };
  }, [auth.userId]);

  // A signed-in person who lands on #/login or #/signup goes to Overview.
  useEffect(() => {
    if (isAccount && !auth.recovery && AUTH_PAGES.includes(route.page)) navigate('overview');
  }, [isAccount, auth.recovery, route.page]);

  const saveToAccount = useCallback(async (record) => {
    const tempId = `pending-${record.id}`;
    setCloudHistory((prev) => [{ ...record, id: tempId, pending: true }, ...prev].slice(0, MAX_RECORDS));
    try {
      const saved = await insertCloudRecord(record);
      setCloudHistory((prev) => prev.map((r) => (r.id === tempId ? saved : r)));
      setCloud((c) => (c.status === 'offline' ? { status: 'ready', error: '' } : c));
    } catch (err) {
      setCloudHistory((prev) => prev.filter((r) => r.id !== tempId));
      setCloud((c) => ({ ...c, error: `This check wasn’t saved to your history. ${err.message}` }));
    }
  }, []);

  /**
   * Run the deterministic analyzer. Returns the result, or throws an Error
   * with a friendly message (for example, empty input).
   */
  const runAnalysis = useCallback(
    (text, source = 'pasted', { save = true } = {}) => {
      const result = analyzeMessage(text, { source });
      setAnalysis(result);
      if (save && settings.saveHistory) {
        if (isAccount) {
          // Account history stores summaries only — never the message text.
          saveToAccount(toRecord(result, { ...settings, saveFullText: false }));
        } else {
          setLocalHistory((prev) => [toRecord(result, settings), ...prev].slice(0, MAX_RECORDS));
        }
      }
      return result;
    },
    [settings, isAccount, saveToAccount]
  );

  const analyzeAndShow = useCallback(
    (text, source) => {
      setDraft({ text, source, ocrConfidence: null });
      runAnalysis(text, source);
      navigate('analyze');
    },
    [runAnalysis]
  );

  const openRecord = useCallback(
    (record) => {
      if (!record.text) return;
      setDraft({ text: record.text, source: record.source || 'pasted', ocrConfidence: null });
      runAnalysis(record.text, record.source || 'pasted', { save: false });
      navigate('xray');
    },
    [runAnalysis]
  );

  const deleteRecord = useCallback(
    async (id) => {
      if (!isAccount) {
        setLocalHistory((prev) => prev.filter((r) => r.id !== id));
        return;
      }
      if (String(id).startsWith('pending-')) return;
      const before = cloudHistory;
      setCloudHistory((prev) => prev.filter((r) => r.id !== id));
      try {
        await deleteCloudRecord(id);
      } catch (err) {
        setCloudHistory(before);
        setCloud((c) => ({ ...c, error: err.message }));
      }
    },
    [isAccount, cloudHistory]
  );

  const clearHistory = useCallback(async () => {
    if (!isAccount) {
      setLocalHistory([]);
      return;
    }
    const before = cloudHistory;
    setCloudHistory([]);
    try {
      await clearCloudHistory(auth.userId);
    } catch (err) {
      setCloudHistory(before);
      setCloud((c) => ({ ...c, error: err.message }));
    }
  }, [isAccount, cloudHistory, auth.userId]);

  /** Explicit, confirmed copy of this browser's guest history into the account. */
  const importLocalHistory = useCallback(async () => {
    const saved = await insertCloudRecords(localHistory);
    setCloudHistory((prev) =>
      [...saved, ...prev].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, MAX_RECORDS)
    );
    setLocalHistory([]);
    return saved.length;
  }, [localHistory]);

  // Deletes data stored in THIS BROWSER (guest history + settings).
  const clearEverything = useCallback(() => {
    clearAllJaalBreakData();
    setLocalHistory([]);
    setSettings(DEFAULT_SETTINGS);
    setAnalysis(null);
    setDraft(EMPTY_DRAFT);
  }, []);

  const openPause = useCallback(() => setPauseOpen(true), []);
  const closePause = useCallback(() => setPauseOpen(false), []);
  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const dismissCloudError = useCallback(() => setCloud((c) => ({ ...c, error: '' })), []);

  // ---- Which screen? -------------------------------------------------------
  if (auth.status === 'loading') return <LoadingScreen />;

  const onAuthRoute = AUTH_PAGES.includes(route.page);
  const needsAuthScreen =
    auth.status === 'signedOut' || auth.recovery || (auth.status === 'guest' && onAuthRoute);

  if (needsAuthScreen) {
    return (
      <AuthScreen
        initialView={onAuthRoute ? route.page : 'login'}
        // After sign-in / guest, leave the auth URL; otherwise stay where the person was going.
        onDone={() => {
          if (AUTH_PAGES.includes(route.page)) navigate('overview');
        }}
      />
    );
  }

  let content;
  switch (route.page) {
    case 'analyze':
      content = (
        <AnalyzePage
          draft={draft}
          setDraft={setDraft}
          analysis={analysis}
          simple={settings.simpleMode}
          onAnalyze={runAnalysis}
          onClear={() => {
            setDraft(EMPTY_DRAFT);
            setAnalysis(null);
          }}
        />
      );
      break;
    case 'xray':
      content = <XRayPage analysis={analysis} selectedFromUrl={route.param} onAnalyzeExample={analyzeAndShow} />;
      break;
    case 'trends':
      content = <TrendsPage history={history} />;
      break;
    case 'library':
      content = <LibraryPage focus={route.param} onAnalyzeExample={analyzeAndShow} />;
      break;
    case 'simulator':
      content = <SimulatorPage scenarioId={route.param} />;
      break;
    case 'history':
      content = (
        <HistoryPage
          history={history}
          settings={settings}
          onDelete={deleteRecord}
          onClearAll={clearHistory}
          onOpen={openRecord}
          storageMode={isAccount ? 'account' : 'local'}
          cloudStatus={cloud.status}
          importableCount={isAccount && cloud.status === 'ready' ? localHistory.length : 0}
          onImportLocal={importLocalHistory}
        />
      );
      break;
    case 'act':
      content = <ActPage analysis={analysis} onPause={openPause} />;
      break;
    case 'privacy':
      content = (
        <PrivacyPage
          settings={settings}
          onSettingsChange={setSettings}
          historyCount={history.length}
          localCount={localHistory.length}
          storageMode={isAccount ? 'account' : 'local'}
          onClearEverything={clearEverything}
        />
      );
      break;
    default:
      content = (
        <OverviewPage
          history={history}
          draft={draft}
          setDraft={setDraft}
          onAnalyze={analyzeAndShow}
          onPause={openPause}
          storageMode={isAccount ? 'account' : 'local'}
        />
      );
  }

  return (
    <div className={`app ${settings.simpleMode ? 'app--simple' : ''}`}>
      {/* A button, not an anchor: "#main" would be read as a route by the hash router. */}
      <button type="button" className="skip-link" onClick={() => document.getElementById('main')?.focus()}>
        Skip to content
      </button>
      <Sidebar
        page={route.page}
        open={navOpen}
        onOpen={openNav}
        onClose={closeNav}
        onPause={openPause}
        simpleMode={settings.simpleMode}
        onToggleSimple={() => setSettings((st) => ({ ...st, simpleMode: !st.simpleMode }))}
      />
      <main id="main" className="main" tabIndex={-1}>
        <AccountBar cloudState={isAccount ? cloud : null} onDismissNotice={dismissCloudError} />
        <div className="main__inner">
          {content}
          <footer className="site-footer">
            <p>{TRUST_STATEMENT}</p>
            <p className="fine-print">
              JaalBreak is a hackathon prototype using deterministic rules. It can make mistakes and is not a
              production fraud-prevention service.
            </p>
          </footer>
        </div>
      </main>
      <PauseModal open={pauseOpen} onClose={closePause} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <Logo inverse={false} />
      <p>
        <LoaderCircle size={16} className="spin" aria-hidden="true" /> Restoring your session…
      </p>
    </div>
  );
}
