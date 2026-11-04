import { useEffect, useRef, useState } from 'react';
import {
  Activity, AudioLines, BookOpen, BrainCircuit, Building2,
  Camera, CheckCircle2, ChevronRight, CircleHelp, Clock3,
  Download, GraduationCap, Hand, Home, Languages, LockKeyhole,
  Menu, MessageSquare, Mic, Network, Play, Search, Settings,
  ShieldCheck, Sparkles, Volume2, X, Zap, ArrowRight,
  Video, Accessibility, UserRound, Bell, Trash2, Database,
  CircleStop, Pencil, Save, Filter, BarChart3,
  AlertTriangle
} from 'lucide-react';
import {
  FilesetResolver,
  HandLandmarker
} from '@mediapipe/tasks-vision';
import {
  deleteStoredSample,
  getAllSamples,
  saveSample
} from './lib/datasetStorage';

type Module = {
  name: string;
  description: string;
  icon: typeof Hand;
  status: string;
  color: string;
};

type Landmark = { x: number; y: number; z: number };

type DatasetFrame = {
  timestampMs: number;
  hands: {
    handedness: string;
    landmarks: Landmark[];
  }[];
};

type DatasetSample = {
  id: string;
  schemaVersion: '1.0';
  project: 'SignBridge AI';
  language: 'ISL';
  label: string;
  signerId: string;
  recordedAt: string;
  durationMs: number;
  samplingRate: string;
  consentConfirmed: boolean;
  frames: DatasetFrame[];
};

type RecordingDraft = {
  label: string;
  signerId: string;
  startedAt: number;
  lastCapturedAt: number;
  frames: DatasetFrame[];
};

const modules: Module[] = [
  { name: 'Sign Intelligence', description: 'Recognise and interpret sign-language gestures through your camera.', icon: BrainCircuit, status: 'Dataset collection studio', color: 'violet' },
  { name: 'Communication Hub', description: 'Bring sign, text and speech together in one communication workspace.', icon: MessageSquare, status: 'Workspace ready', color: 'blue' },
  { name: 'AI Avatar Studio', description: 'Explore sign demonstrations and accessible visual communication.', icon: UserRound, status: 'Reference library setup', color: 'pink' },
  { name: 'Accessibility Network', description: 'Design inclusive communication workflows for public services.', icon: Network, status: 'Workspace ready', color: 'teal' },
  { name: 'Learning & Community', description: 'Learn Indian Sign Language through structured lessons and practice.', icon: GraduationCap, status: 'Learning centre ready', color: 'amber' },
  { name: 'Trust & AI Research', description: 'Evaluate model quality, fairness, reliability and transparency.', icon: ShieldCheck, status: 'Awaiting evaluation data', color: 'green' },
];

const navItems = [
  { label: 'Overview', icon: Home },
  { label: 'Sign Intelligence', icon: BrainCircuit },
  { label: 'Communication Hub', icon: MessageSquare },
  { label: 'AI Avatar Studio', icon: UserRound },
  { label: 'Accessibility Network', icon: Network },
  { label: 'Learning & Community', icon: GraduationCap },
  { label: 'Trust & AI Research', icon: ShieldCheck },
];

const networkFeatures = [
  { title: 'Healthcare communication', text: 'Structured, accessible patient communication workflows.', icon: Building2 },
  { title: 'Emergency assistance', text: 'Predefined emergency messages with deliberate confirmation.', icon: Zap },
  { title: 'Transport accessibility', text: 'Accessible public transport and travel announcements.', icon: Network },
  { title: 'Interpreter connection', text: 'A pathway to human interpreter support when needed.', icon: UserRound },
];

const learningFeatures = [
  { title: 'ISL foundations', text: 'Build familiarity with sign language basics.', icon: BookOpen },
  { title: 'Vocabulary practice', text: 'Learn everyday vocabulary with reviewed references.', icon: Languages },
  { title: 'Practice studio', text: 'A future space for guided webcam practice.', icon: GraduationCap },
  { title: 'Community contributions', text: 'Submit sign references for qualified expert review.', icon: GraduationCap },
];

function App() {
  const [active, setActive] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [speechText, setSpeechText] = useState('');
  const [listening, setListening] = useState(false);

  const selectPage = (page: string) => {
    setActive(page);
    setMobileOpen(false);
    setNotice('');
  };

  const filteredModules = modules.filter((item) =>
    `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessages((previous) => [...previous, message.trim()]);
    setMessage('');
  };

  const startSpeech = () => {
    type RecognitionResult = {
      results: ArrayLike<ArrayLike<{ transcript: string }>>;
    };

    type RecognitionInstance = {
      lang: string;
      onresult: ((event: RecognitionResult) => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };

    type RecognitionConstructor = new () => RecognitionInstance;

    const speechWindow = window as Window & {
      SpeechRecognition?: RecognitionConstructor;
      webkitSpeechRecognition?: RecognitionConstructor;
    };

    const Recognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setNotice('Speech recognition is not supported in this browser. Try a recent version of Chrome.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      setSpeechText(event.results[0][0].transcript);
    };
    recognition.onend = () => setListening(false);

    setListening(true);
    recognition.start();
  };

  const speakText = () => {
    if (!speechText.trim() || !('speechSynthesis' in window)) {
      setNotice('Enter some text first, or use a browser that supports speech synthesis.');
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(speechText));
  };

  const activeModule = modules.find((item) => item.name === active);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Accessibility size={24} /></div>
          <div>
            <div className="brand-name">SignBridge<span> AI</span></div>
            <div className="brand-caption">ACCESSIBILITY ECOSYSTEM</div>
          </div>
          <button className="mobile-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`nav-link ${active === item.label ? 'active' : ''}`}
                onClick={() => selectPage(item.label)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {active === item.label && <span className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={18} /></div>
            <strong>Need a hand?</strong>
            <p>Explore the platform and discover accessible communication tools.</p>
            <button onClick={() => setNotice('Help centre will be connected in a future release.')}>
              Visit help centre <ArrowRight size={14} />
            </button>
          </div>

          <button className="nav-link settings-link" onClick={() => setNotice('Settings are being prepared.')}>
            <Settings size={18} /><span>Settings</span>
          </button>

          <div className="profile">
            <div className="profile-avatar">SB</div>
            <div className="profile-info"><strong>My workspace</strong><span>Local preview</span></div>
            <div className="online-dot" />
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
            <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{active}</strong></div>
          </div>

          <div className="topbar-right">
            <div className="system-status"><span /> Platform preview</div>
            <button className="icon-button notification-button" onClick={() => setNotice('You are all caught up.')} aria-label="Notifications"><Bell size={18} /></button>
            <div className="top-avatar">SB</div>
          </div>
        </header>

        <div className="page-content">
          {notice && (
            <div className="notice">
              <CheckCircle2 size={17} />
              {notice}
              <button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16} /></button>
            </div>
          )}

          {active === 'Overview' ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><Sparkles size={14} /> COMMUNICATION WITHOUT BARRIERS</div>
                  <h1>Bridging communication.<br /><span>Empowering everyone.</span></h1>
                  <p className="welcome-copy">An intelligent accessibility ecosystem designed to bring sign language, speech and text closer together.</p>
                  <div className="welcome-actions">
                    <button className="primary-button" onClick={() => selectPage('Communication Hub')}>Open communication hub <ArrowRight size={17} /></button>
                    <button className="secondary-button" onClick={() => selectPage('Learning & Community')}>Explore learning</button>
                  </div>
                </div>

                <div className="hero-art" aria-label="Abstract accessibility illustration">
                  <div className="hero-orbit orbit-one" />
                  <div className="hero-orbit orbit-two" />
                  <div className="hero-core"><Hand size={65} strokeWidth={1.25} /></div>
                  <div className="float-chip chip-one"><AudioLines size={17} />Speech</div>
                  <div className="float-chip chip-two"><Languages size={17} /> Sign language</div>
                  <div className="float-chip chip-three"><MessageSquare size={16} /> Text</div>
                  <div className="hero-spark spark-one">✳</div>
                  <div className="hero-spark spark-two">✦</div>
                </div>
              </section>

              <section className="quick-stats">
                <div className="stat-card">
                  <div className="stat-icon purple"><BrainCircuit size={19} /></div>
                  <div><span>AI recognition</span><strong>Hand detection</strong><small>ISL classifier pending</small></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon cyan"><ShieldCheck size={19} /></div>
                  <div><span>Privacy approach</span><strong>Privacy-first</strong><small>Camera data not stored by default</small></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon orange"><Zap size={19} /></div>
                  <div><span>Platform status</span><strong>Local preview</strong><small>Development environment</small></div>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">YOUR ACCESSIBILITY TOOLKIT</div>
                    <h2>Explore the ecosystem</h2>
                    <p>Six connected divisions. One inclusive communication experience.</p>
                  </div>

                  <div className="section-tools">
                    <label className="search-box">
                      <Search size={15} />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search divisions..."
                        aria-label="Search divisions"
                      />
                      {search && (
                        <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                          <X size={14} />
                        </button>
                      )}
                    </label>
                    <div className="module-count">
                      {String(filteredModules.length).padStart(2, '0')}
                      <span>DIVISIONS</span>
                    </div>
                  </div>
                </div>

                <div className="module-grid">
                  {filteredModules.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button className="module-card" key={item.name} onClick={() => selectPage(item.name)}>
                        <div className={`module-icon ${item.color}`}><Icon size={22} /></div>
                        <div className="module-number">{String(index + 1).padStart(2, '0')}</div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                        <div className="module-footer"><span>{item.status}</span><ChevronRight size={17} /></div>
                      </button>
                    );
                  })}
                </div>

                {filteredModules.length === 0 && (
                  <div className="empty-state">No divisions match "{search}". Try another search.</div>
                )}
              </section>

              <section className="bottom-grid">
                <div className="panel">
                  <div className="panel-heading">
                    <div><span className="eyebrow">GET STARTED</span><h3>Your next steps</h3></div>
                    <Clock3 size={19} />
                  </div>

                  <div className="step-row">
                    <span className="step-number">01</span>
                    <div><strong>Explore the communication workspace</strong><p>Try text and speech tools in your browser.</p></div>
                    <button onClick={() => selectPage('Communication Hub')}><ChevronRight size={18} /></button>
                  </div>

                  <div className="step-row">
                    <span className="step-number">02</span>
                    <div><strong>Set up the ISL recognition pipeline</strong><p>Connect an expert-validated dataset and model.</p></div>
                    <button onClick={() => selectPage('Sign Intelligence')}><ChevronRight size={18} /></button>
                  </div>

                  <div className="step-row">
                    <span className="step-number">03</span>
                    <div><strong>Build your learning library</strong><p>Prepare lessons and reviewed sign references.</p></div>
                    <button onClick={() => selectPage('Learning & Community')}><ChevronRight size={18} /></button>
                  </div>
                </div>

                <div className="privacy-panel">
                  <div className="privacy-graphic"><LockKeyhole size={28} /></div>
                  <span className="eyebrow">BUILT AROUND TRUST</span>
                  <h3>Accessibility should never compromise privacy.</h3>
                  <p>SignBridge is being designed with consent, secure accounts, data minimisation and transparent AI evaluation at its core.</p>
                  <button onClick={() => selectPage('Trust & AI Research')}>Explore trust centre <ArrowRight size={15} /></button>
                </div>
              </section>
            </>
          ) : activeModule ? (
            <ModulePage
              module={activeModule}
              message={message}
              setMessage={setMessage}
              messages={messages}
              sendMessage={sendMessage}
              speechText={speechText}
              setSpeechText={setSpeechText}
              listening={listening}
              startSpeech={startSpeech}
              speakText={speakText}
            />
          ) : null}

          <footer className="footer">
            <span>© 2026 SignBridge AI</span>
            <span>Bridging Communication. Empowering Everyone.</span>
            <span>Built with accessibility in mind.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

type ModulePageProps = {
  module: Module;
  message: string;
  setMessage: (value: string) => void;
  messages: string[];
  sendMessage: () => void;
  speechText: string;
  setSpeechText: (value: string) => void;
  listening: boolean;
  startSpeech: () => void;
  speakText: () => void;
};

function ModulePage(props: ModulePageProps) {
  const {
    module, message, setMessage, messages, sendMessage,
    speechText, setSpeechText, listening, startSpeech, speakText
  } = props;

  const Icon = module.icon;

  return (
    <section className="module-page">
      <div className="eyebrow"><Sparkles size={14} /> SIGNBRIDGE AI / DIVISION</div>

      <div className="module-page-title">
        <div className={`module-icon large ${module.color}`}><Icon size={27} /></div>
        <div><h1>{module.name}</h1><p>{module.description}</p></div>
      </div>

      <div className="module-status"><span className="status-dot" /> {module.status}</div>

      {module.name === 'Communication Hub' ? (
        <div className="workspace-grid">
          <div className="panel communication-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">TEXT WORKSPACE</span><h3>Conversation studio</h3></div>
              <MessageSquare size={19} />
            </div>

            <p className="subtle-copy">Compose messages and build a conversation. Messages currently stay in this browser session.</p>

            <div className="chat-area">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <MessageSquare size={26} />
                  <strong>Your conversation starts here</strong>
                  <span>Type a message below to begin.</span>
                </div>
              ) : messages.map((item, index) => (
                <div className="chat-message" key={`${item}-${index}`}>{item}</div>
              ))}
            </div>

            <div className="message-compose">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
                placeholder="Write a message..."
              />
              <button className="primary-button" onClick={sendMessage}>Send <ArrowRight size={15} /></button>
            </div>
          </div>

          <div className="panel speech-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">VOICE TO TEXT</span><h3>Speech workspace</h3></div>
              <Mic size={19} />
            </div>

            <p className="subtle-copy">Use your browser's speech recognition where supported.</p>

            <textarea
              value={speechText}
              onChange={(event) => setSpeechText(event.target.value)}
              placeholder="Your recognised or typed speech will appear here..."
            />

            <div className="speech-actions">
              <button className="secondary-button" onClick={startSpeech}>
                <Mic size={16} /> {listening ? 'Listening...' : 'Start listening'}
              </button>
              <button className="primary-button" onClick={speakText}>
                <Volume2 size={16} /> Speak text
              </button>
            </div>

            <div className="support-note">Speech availability depends on your browser and its language support.</div>
          </div>
        </div>
      ) : module.name === 'Sign Intelligence' ? (
        <HandDetectionWorkspace />
      ) : module.name === 'AI Avatar Studio' ? (
        <div className="panel feature-panel">
          <div className="feature-illustration"><UserRound size={52} /></div>
          <div>
            <span className="eyebrow">SIGN DEMONSTRATION LIBRARY</span>
            <h3>Build an expressive sign avatar experience</h3>
            <p>Start with verified sign reference clips and curated vocabulary. Sentence-level avatar signing requires validated animation assets and expert review.</p>
          </div>
        </div>
      ) : module.name === 'Accessibility Network' ? (
        <div className="feature-grid">
          {networkFeatures.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div className="panel feature-tile" key={item.title}>
                <div className="module-icon teal"><ItemIcon size={21} /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            );
          })}
        </div>
      ) : module.name === 'Learning & Community' ? (
        <div className="feature-grid">
          {learningFeatures.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div className="panel feature-tile" key={item.title}>
                <div className="module-icon amber"><ItemIcon size={21} /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="research-layout">
          <div className="panel research-panel">
            <div className="panel-heading">
              <div><span className="eyebrow">MODEL EVALUATION</span><h3>Evidence before claims</h3></div>
              <Activity size={19} />
            </div>
            <div className="research-empty">
              <ShieldCheck size={34} />
              <strong>No evaluation results yet</strong>
              <p>Accuracy, precision, recall, macro F1, WER, CER and latency will appear here only after running reproducible evaluations on a held-out signer-independent test set.</p>
            </div>
          </div>

          <div className="panel">
            <span className="eyebrow">RESEARCH CHECKLIST</span>
            <h3>Trust requirements</h3>
            {[
              'Signer-independent testing',
              'Expert-reviewed ISL labels',
              'Fairness across signing conditions',
              'Confidence calibration',
              'Model version tracking',
              'Consent and data governance'
            ].map((item) => (
              <div className="check-row" key={item}>
                <CheckCircle2 size={17} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function HandDetectionWorkspace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const startingRef = useRef(false);
  const recordingRef = useRef<RecordingDraft | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('Camera is off');
  const [modelStatus, setModelStatus] = useState('AI model not loaded');
  const [handCount, setHandCount] = useState(0);
  const [error, setError] = useState('');

  const [signLabel, setSignLabel] = useState('');
  const [signerId, setSignerId] = useState('');
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const [samples, setSamples] = useState<DatasetSample[]>([]);
  const [collectionMessage, setCollectionMessage] = useState('');
  const [storageStatus, setStorageStatus] = useState('Loading saved samples...');

  // Dataset management state
  const [sampleSearch, setSampleSearch] = useState('');
  const [signFilter, setSignFilter] = useState('ALL');
  const [qualityFilter, setQualityFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [clearConfirmation, setClearConfirmation] = useState(false);
  const [managementMessage, setManagementMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSavedSamples = async () => {
      try {
        const savedSamples = await getAllSamples<DatasetSample>();

        if (cancelled) return;

        savedSamples.sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        );

        setSamples(savedSamples);
        setStorageStatus(
          `Local database ready · ${savedSamples.length} saved sample${savedSamples.length === 1 ? '' : 's'}`
        );
      } catch (caught) {
        if (cancelled) return;
        const detail = caught instanceof Error ? caught.message : 'Unknown database error';
        setStorageStatus('Local database unavailable');
        setCollectionMessage(`Could not load saved samples. ${detail}`);
      }
    };

    void loadSavedSamples();

    return () => {
      cancelled = true;
    };
  }, []);

  const stopCamera = () => {
    if (recordingRef.current) {
      recordingRef.current = null;
      setRecording(false);
      setCountdown(3);
      setCollectionMessage('Recording cancelled because the camera was stopped.');
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    landmarkerRef.current?.close();
    landmarkerRef.current = null;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    setCameraActive(false);
    setCameraStatus('Camera is off');
    setModelStatus('AI model not loaded');
    setHandCount(0);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      streamRef.current?.getTracks().forEach((track) => track.stop());
      landmarkerRef.current?.close();
    };
  }, []);

  const finishRecording = async (draft: RecordingDraft) => {
    recordingRef.current = null;
    setRecording(false);
    setCountdown(3);

    if (draft.frames.length === 0) {
      setCollectionMessage('No hands were captured. Please keep your hands visible and try again.');
      return;
    }

    const sample: DatasetSample = {
      id: `isl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      schemaVersion: '1.0',
      project: 'SignBridge AI',
      language: 'ISL',
      label: draft.label,
      signerId: draft.signerId,
      recordedAt: new Date().toISOString(),
      durationMs: 3000,
      samplingRate: 'Up to 10 frames per second',
      consentConfirmed: true,
      frames: draft.frames
    };

    try {
      await saveSample(sample);
      setSamples((previous) => [sample, ...previous]);
      setStorageStatus('Local database ready · Latest sample saved');
      setCollectionMessage(`Sample "${sample.label}" saved with ${sample.frames.length} frames.`);
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : 'Unknown database error';
      setSamples((previous) => [sample, ...previous]);
      setStorageStatus('Local database save failed');
      setCollectionMessage(`Sample is only available in this session. ${detail}`);
    }
  };

  const startRecording = () => {
    if (!cameraActive || !landmarkerRef.current) {
      setCollectionMessage('Start the camera and wait for the hand detection model to load first.');
      return;
    }

    if (!signLabel.trim() || !signerId.trim()) {
      setCollectionMessage('Enter both a sign label and a signer ID before recording.');
      return;
    }

    if (!consentConfirmed) {
      setCollectionMessage('Please confirm participant consent before collecting data.');
      return;
    }

    if (recordingRef.current) return;

    recordingRef.current = {
      label: signLabel.trim().toUpperCase(),
      signerId: signerId.trim(),
      startedAt: performance.now(),
      lastCapturedAt: 0,
      frames: []
    };

    setCountdown(3);
    setRecording(true);
    setCollectionMessage('Recording started. Keep your signing hand visible.');
  };

  const deleteSample = async (sampleId: string) => {
    try {
      await deleteStoredSample(sampleId);
      setSamples((previous) => previous.filter((sample) => sample.id !== sampleId));
      setStorageStatus('Local database ready · Sample deletion saved');
      setManagementMessage('Sample deleted successfully.');
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : 'Unknown database error';
      setManagementMessage(`Could not delete the sample. ${detail}`);
    }
  };

  const updateSampleLabel = async (sample: DatasetSample) => {
    const nextLabel = editingLabel.trim().toUpperCase();

    if (!nextLabel) {
      setManagementMessage('A sample label cannot be empty.');
      return;
    }

    const updatedSample = { ...sample, label: nextLabel };

    try {
      await saveSample(updatedSample);
      setSamples((previous) =>
        previous.map((item) => item.id === sample.id ? updatedSample : item)
      );
      setEditingId(null);
      setEditingLabel('');
      setManagementMessage(`Sample label updated to "${nextLabel}".`);
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : 'Unknown database error';
      setManagementMessage(`Could not update sample. ${detail}`);
    }
  };

  const clearEntireDataset = async () => {
    try {
      // Delete each sample through the existing persistent storage function.
      for (const sample of samples) {
        await deleteStoredSample(sample.id);
      }

      setSamples([]);
      setClearConfirmation(false);
      setStorageStatus('Local database ready · Dataset cleared');
      setManagementMessage('All dataset samples have been deleted from this browser.');
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : 'Unknown database error';
      setManagementMessage(`Dataset clearing was interrupted. ${detail}`);

      // Reload the database to show the actual remaining records.
      try {
        const remaining = await getAllSamples<DatasetSample>();
        setSamples(remaining);
      } catch {
        setStorageStatus('Could not reload the database.');
      }
    }
  };

  const downloadDataset = () => {
    if (samples.length === 0) {
      setCollectionMessage('There are no samples to export yet.');
      return;
    }

    const dataset = {
      datasetName: 'SignBridge AI - ISL Landmark Dataset',
      schemaVersion: '1.0',
      exportedAt: new Date().toISOString(),
      language: 'Indian Sign Language',
      sampleCount: samples.length,
      dataType: 'MediaPipe hand landmarks; no raw video or audio',
      samples
    };

    const blob = new Blob([JSON.stringify(dataset, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signbridge-isl-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setCollectionMessage('Dataset JSON exported successfully.');
  };

  const startCamera = async () => {
    if (startingRef.current || cameraActive) return;

    startingRef.current = true;
    setError('');
    setCameraStatus('Requesting camera permission...');
    setModelStatus('Waiting for camera');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access is unavailable. Use localhost or HTTPS in a supported browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error('Video preview element was not found.');

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      setCameraActive(true);
      setCameraStatus('Camera connected');
      setModelStatus('Loading MediaPipe hand detection model...');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm'
      );

      let landmarker: HandLandmarker;

      try {
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      } catch (gpuError) {
        console.warn('GPU delegate unavailable; trying CPU.', gpuError);

        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
      }

      landmarkerRef.current = landmarker;
      setModelStatus('Hand detection model ready');

      const connections = HandLandmarker.HAND_CONNECTIONS;

      const detectFrame = () => {
        const currentVideo = videoRef.current;
        const canvas = canvasRef.current;
        const detector = landmarkerRef.current;

        if (!currentVideo || !canvas || !detector) return;

        if (currentVideo.readyState >= 2 && currentVideo.videoWidth > 0) {
          const width = currentVideo.videoWidth;
          const height = currentVideo.videoHeight;

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
          }

          const context = canvas.getContext('2d');

          if (context) {
            context.clearRect(0, 0, width, height);

            const now = performance.now();
            const result = detector.detectForVideo(currentVideo, now);
            const hands = result.landmarks || [];

            setHandCount(hands.length);

            const draft = recordingRef.current;

            if (draft && now - draft.lastCapturedAt >= 100) {
              draft.lastCapturedAt = now;

              const frameHands = hands.map((landmarks, index) => ({
                handedness:
                  result.handednesses?.[index]?.[0]?.categoryName ?? 'Unknown',
                landmarks: landmarks.map((point) => ({
                  x: point.x,
                  y: point.y,
                  z: point.z
                }))
              }));

              if (frameHands.length > 0) {
                draft.frames.push({
                  timestampMs: Math.round(now - draft.startedAt),
                  hands: frameHands
                });
              }
            }

            if (draft) {
              const elapsed = now - draft.startedAt;
              const remaining = Math.max(0, Math.ceil((3000 - elapsed) / 1000));

              setCountdown((previous) => previous === remaining ? previous : remaining);

              if (elapsed >= 3000) {
                void finishRecording(draft);
              }
            }

            for (const landmarks of hands) {
              context.lineWidth = Math.max(2, width / 400);
              context.strokeStyle = '#39e6bd';
              context.fillStyle = '#ffffff';

              for (const connection of connections) {
                const start = landmarks[connection.start];
                const end = landmarks[connection.end];

                if (!start || !end) continue;

                context.beginPath();
                context.moveTo(start.x * width, start.y * height);
                context.lineTo(end.x * width, end.y * height);
                context.stroke();
              }

              for (const point of landmarks) {
                context.beginPath();
                context.arc(
                  point.x * width,
                  point.y * height,
                  Math.max(3, width / 220),
                  0,
                  2 * Math.PI
                );
                context.fill();
              }
            }
          }
        }

        animationRef.current = requestAnimationFrame(detectFrame);
      };

      detectFrame();
    } catch (caught) {
      const errorMessage = caught instanceof Error
        ? caught.message
        : 'An unexpected camera error occurred.';

      setError(errorMessage);

      if (streamRef.current && videoRef.current?.srcObject) {
        setCameraActive(true);
        setCameraStatus('Camera connected');
      } else {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraActive(false);
        setCameraStatus('Camera unavailable');
      }

      setModelStatus('Hand detection unavailable');
    } finally {
      startingRef.current = false;
    }
  };

  // Quality checks are descriptive checks, not a claim that a sign is correct.
  const getSampleQuality = (sample: DatasetSample) => {
    const issues: string[] = [];

    if (!sample.label.trim()) issues.push('Missing label');
    if (!sample.signerId.trim()) issues.push('Missing signer ID');
    if (!sample.consentConfirmed) issues.push('Consent not confirmed');
    if (!Array.isArray(sample.frames) || sample.frames.length === 0) {
      issues.push('No frames');
    }

    const validFrames = (sample.frames || []).filter((frame) =>
      Array.isArray(frame.hands) &&
      frame.hands.some((hand) =>
        Array.isArray(hand.landmarks) && hand.landmarks.length === 21
      )
    );

    if (sample.frames?.length > 0 && validFrames.length === 0) {
      issues.push('No valid 21-point hand landmarks');
    }

    if (sample.frames?.length > 0 && sample.frames.length < 10) {
      issues.push('Low frame count');
    }

    return {
      valid: issues.length === 0,
      issues,
      validFrames: validFrames.length
    };
  };

  const uniqueLabels = Array.from(new Set(samples.map((sample) => sample.label))).sort();
  const uniqueSigners = Array.from(new Set(samples.map((sample) => sample.signerId))).sort();

  const labelCounts = samples.reduce<Record<string, number>>((counts, sample) => {
    counts[sample.label] = (counts[sample.label] || 0) + 1;
    return counts;
  }, {});

  const signerCounts = samples.reduce<Record<string, number>>((counts, sample) => {
    counts[sample.signerId] = (counts[sample.signerId] || 0) + 1;
    return counts;
  }, {});

  const validCount = samples.filter((sample) => getSampleQuality(sample).valid).length;
  const needsReviewCount = samples.length - validCount;

  const visibleSamples = samples.filter((sample) => {
    const searchMatches =
      `${sample.label} ${sample.signerId}`.toLowerCase().includes(sampleSearch.toLowerCase());

    const signMatches = signFilter === 'ALL' || sample.label === signFilter;
    const quality = getSampleQuality(sample);
    const qualityMatches =
      qualityFilter === 'ALL' ||
      (qualityFilter === 'VALID' && quality.valid) ||
      (qualityFilter === 'REVIEW' && !quality.valid);

    return searchMatches && signMatches && qualityMatches;
  });

  return (
    <div className="dataset-workspace">
      <div className="panel recognition-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">LIVE CAMERA WORKSPACE</span>
            <h3>Real-time hand detection</h3>
          </div>
          <Camera size={19} />
        </div>

        <p className="subtle-copy">
          Start your camera to detect hands and collect landmark sequences.
          This system detects hand positions; it does not yet recognise ISL words.
        </p>

        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          borderRadius: '16px',
          background: '#101827',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              display: cameraActive ? 'block' : 'none'
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)',
              pointerEvents: 'none'
            }}
          />

          {!cameraActive && (
            <div style={{ textAlign: 'center', color: '#ffffff', padding: '24px' }}>
              <Video size={42} />
              <p style={{ marginTop: '12px' }}>Your camera preview will appear here.</p>
            </div>
          )}

          {recording && (
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: '#b42318',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff' }} />
              REC · {countdown}s
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '18px', alignItems: 'center' }}>
          <button
            className="primary-button"
            onClick={cameraActive ? stopCamera : startCamera}
            disabled={startingRef.current || recording}
          >
            <Camera size={16} />
            {cameraActive ? 'Stop camera' : 'Start camera'}
          </button>
          <span className="support-note">{cameraStatus}</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginTop: '18px'
        }}>
          <div className="stat-card">
            <div className="stat-icon purple"><Hand size={19} /></div>
            <div><span>Hands detected</span><strong>{handCount}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan"><Activity size={19} /></div>
            <div><span>MediaPipe status</span><strong style={{ fontSize: '13px' }}>{modelStatus}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Database size={19} /></div>
            <div><span>Collected samples</span><strong>{samples.length}</strong></div>
          </div>
        </div>

        {error && (
          <div className="notice" style={{ marginTop: '16px' }}>
            <CircleHelp size={17} />
            <span>{error}</span>
          </div>
        )}

        <div className="model-warning" style={{ marginTop: '18px' }}>
          <ShieldCheck size={19} />
          <div>
            <strong>Important: hand detection is not sign-language translation</strong>
            <p>
              MediaPipe identifies hand landmarks. It does not know what an ISL
              sign means. We need a properly trained and expert-validated ISL
              recognition model before displaying sign predictions.
            </p>
          </div>
        </div>
      </div>

      {/* COLLECTION FORM */}
      <div className="panel dataset-panel" style={{ marginTop: '22px' }}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">DATA COLLECTION STUDIO</span>
            <h3>Collect ISL landmark samples</h3>
          </div>
          <Database size={20} />
        </div>

        <p className="subtle-copy">
          Each recording captures landmark frames over three seconds.
          Samples are stored in this browser using IndexedDB.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginTop: '20px'
        }}>
          <label className="dataset-field">
            <strong>ISL sign label</strong>
            <input
              value={signLabel}
              onChange={(event) => setSignLabel(event.target.value)}
              placeholder="Example: HELLO"
              disabled={recording}
            />
            <span className="support-note">Use one consistent label for each sign.</span>
          </label>

          <label className="dataset-field">
            <strong>Signer ID</strong>
            <input
              value={signerId}
              onChange={(event) => setSignerId(event.target.value)}
              placeholder="Example: SIGNER_001"
              disabled={recording}
            />
            <span className="support-note">Use a pseudonymous ID, never a real name.</span>
          </label>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '20px', lineHeight: 1.5 }}>
          <input
            type="checkbox"
            checked={consentConfirmed}
            onChange={(event) => setConsentConfirmed(event.target.checked)}
            disabled={recording}
            style={{ marginTop: '4px' }}
          />
          <span>
            I confirm that the participant has given informed consent for
            collection and research use of their hand landmark data.
          </span>
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <button
            className="primary-button"
            onClick={startRecording}
            disabled={!cameraActive || modelStatus !== 'Hand detection model ready' || recording}
          >
            <Play size={16} /> Record 3-second sample
          </button>

          {recording && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <CircleStop size={17} /> Recording: {countdown} seconds remaining
            </span>
          )}
        </div>

        {collectionMessage && (
          <div className="notice" style={{ marginTop: '16px' }}>
            <CheckCircle2 size={17} />
            <span>{collectionMessage}</span>
            <button onClick={() => setCollectionMessage('')} aria-label="Dismiss"><X size={16} /></button>
          </div>
        )}

        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(100, 116, 139, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <LockKeyhole size={18} />
            <strong>Collection and privacy notes</strong>
          </div>
          <ul style={{ paddingLeft: '20px', lineHeight: 1.8, marginBottom: 0 }}>
            <li>Only landmark coordinates and metadata are saved in this browser's IndexedDB database.</li>
            <li>Raw camera video and audio are not saved or uploaded.</li>
            <li>Samples remain on this device in this browser profile; they are not cloud-synced.</li>
            <li>Use labels verified by an ISL educator or qualified interpreter.</li>
            <li>Obtain appropriate consent before collecting anyone's data.</li>
          </ul>
        </div>
      </div>

      {/* DATASET MANAGEMENT STUDIO */}
      <div className="panel dataset-history" style={{ marginTop: '22px' }}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">DATASET MANAGEMENT STUDIO</span>
            <h3>Manage your ISL dataset</h3>
          </div>
          <Database size={20} />
        </div>

        <p className="subtle-copy">
          Search, review, edit, validate and export your collected landmark samples.
        </p>

        <div className="support-note" role="status" aria-live="polite" style={{ marginTop: '10px' }}>
          <Database size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          {storageStatus}
        </div>

        {/* STATISTICS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: '12px',
          marginTop: '20px'
        }}>
          <div className="stat-card">
            <div className="stat-icon purple"><Database size={19} /></div>
            <div><span>Total samples</span><strong>{samples.length}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon cyan"><Languages size={19} /></div>
            <div><span>Unique signs</span><strong>{uniqueLabels.length}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><UserRound size={19} /></div>
            <div><span>Unique signers</span><strong>{uniqueSigners.length}</strong></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle2 size={19} /></div>
            <div><span>Passed basic checks</span><strong>{validCount}</strong></div>
          </div>
        </div>

        {/* QUALITY SUMMARY */}
        <div style={{
          marginTop: '18px',
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(100, 116, 139, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '8px' }}>
            <ShieldCheck size={19} />
            <strong>Basic dataset quality checks</strong>
          </div>

          <p className="subtle-copy">
            {needsReviewCount === 0
              ? 'All current samples passed the basic structural checks.'
              : `${needsReviewCount} sample${needsReviewCount === 1 ? '' : 's'} need review based on the basic structural checks.`}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '12px' }}>
            <span><CheckCircle2 size={15} style={{ verticalAlign: 'middle' }} /> {validCount} passed</span>
            <span><AlertTriangle size={15} style={{ verticalAlign: 'middle' }} /> {needsReviewCount} need review</span>
          </div>
        </div>

        {/* SIGN DISTRIBUTION */}
        <div style={{ marginTop: '22px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">DATASET DISTRIBUTION</span>
              <h3>Samples per sign</h3>
            </div>
            <BarChart3 size={19} />
          </div>

          {uniqueLabels.length === 0 ? (
            <p className="subtle-copy">Record samples to see the sign distribution.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
              {Object.entries(labelCounts).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '5px' }}>
                    <strong>{label}</strong>
                    <span>{count} sample{count === 1 ? '' : 's'}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(128,128,128,0.18)', borderRadius: '20px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(count / samples.length) * 100}%`,
                      height: '100%',
                      background: '#7662e8',
                      borderRadius: '20px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIGNER DISTRIBUTION */}
        <div style={{ marginTop: '22px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PARTICIPANT DISTRIBUTION</span>
              <h3>Samples per signer</h3>
            </div>
            <UserRound size={19} />
          </div>

          {uniqueSigners.length === 0 ? (
            <p className="subtle-copy">Signer statistics will appear after collecting samples.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              {Object.entries(signerCounts).sort((a, b) => b[1] - a[1]).map(([signer, count]) => (
                <div key={signer} style={{
                  padding: '10px 14px',
                  border: '1px solid rgba(128,128,128,0.25)',
                  borderRadius: '10px'
                }}>
                  <strong>{signer}</strong>
                  <div className="support-note">{count} sample{count === 1 ? '' : 's'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEARCH AND FILTER */}
        <div style={{ marginTop: '28px' }}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SAMPLE LIBRARY</span>
              <h3>Find and review samples</h3>
            </div>
            <Search size={19} />
          </div>

          <label className="search-box" style={{ display: 'flex', width: '100%', marginTop: '14px' }}>
            <Search size={16} />
            <input
              value={sampleSearch}
              onChange={(event) => setSampleSearch(event.target.value)}
              placeholder="Search by sign label or signer ID..."
              aria-label="Search dataset samples"
            />
            {sampleSearch && (
              <button onClick={() => setSampleSearch('')} aria-label="Clear sample search">
                <X size={14} />
              </button>
            )}
          </label>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginTop: '12px'
          }}>
            <label className="dataset-field">
              <strong><Filter size={14} style={{ verticalAlign: 'middle' }} /> Filter by sign</strong>
              <select value={signFilter} onChange={(event) => setSignFilter(event.target.value)}>
                <option value="ALL">All signs</option>
                {uniqueLabels.map((label) => <option key={label} value={label}>{label}</option>)}
              </select>
            </label>

            <label className="dataset-field">
              <strong><ShieldCheck size={14} style={{ verticalAlign: 'middle' }} /> Filter by quality</strong>
              <select value={qualityFilter} onChange={(event) => setQualityFilter(event.target.value)}>
                <option value="ALL">All samples</option>
                <option value="VALID">Passed basic checks</option>
                <option value="REVIEW">Needs review</option>
              </select>
            </label>
          </div>

          <div className="support-note" style={{ marginTop: '12px' }}>
            Showing {visibleSamples.length} of {samples.length} samples
          </div>
        </div>

        {/* SAMPLE LIST */}
        {visibleSamples.length === 0 ? (
          <div className="research-empty">
            <Database size={34} />
            <strong>No matching samples</strong>
            <p>Try changing your search or filters, or collect a new sample.</p>
          </div>
        ) : (
          <div style={{ marginTop: '14px' }}>
            {visibleSamples.map((sample) => {
              const quality = getSampleQuality(sample);
              const isEditing = editingId === sample.id;

              return (
                <div
                  key={sample.id}
                  style={{
                    padding: '16px 0',
                    borderBottom: '1px solid rgba(128,128,128,0.2)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ minWidth: '180px', flex: 1 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          <input
                            value={editingLabel}
                            onChange={(event) => setEditingLabel(event.target.value)}
                            placeholder="New sign label"
                            aria-label="Edit sign label"
                          />
                          <button
                            className="primary-button"
                            onClick={() => void updateSampleLabel(sample)}
                          >
                            <Save size={15} /> Save
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => {
                              setEditingId(null);
                              setEditingLabel('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <strong style={{ fontSize: '16px' }}>{sample.label}</strong>
                      )}

                      <p style={{ margin: '6px 0', opacity: 0.75 }}>
                        Signer: {sample.signerId}
                      </p>

                      <span className="support-note">
                        {sample.frames.length} frames · {new Date(sample.recordedAt).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: quality.valid ? 'rgba(22,163,74,0.12)' : 'rgba(234,179,8,0.14)'
                      }}>
                        {quality.valid
                          ? <><CheckCircle2 size={14} /> Passed</>
                          : <><AlertTriangle size={14} /> Review</>}
                      </span>

                      {!isEditing && (
                        <>
                          <button
                            className="secondary-button"
                            onClick={() => {
                              setEditingId(sample.id);
                              setEditingLabel(sample.label);
                              setManagementMessage('');
                            }}
                          >
                            <Pencil size={14} /> Edit
                          </button>

                          <button
                            className="secondary-button"
                            onClick={() => void deleteSample(sample.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!quality.valid && (
                    <div style={{ marginTop: '10px', color: '#b7791f', fontSize: '13px' }}>
                      <strong>Review:</strong> {quality.issues.join(' · ')}
                    </div>
                  )}

                  <div className="support-note" style={{ marginTop: '7px' }}>
                    Valid landmark frames: {quality.validFrames} / {sample.frames.length}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {managementMessage && (
          <div className="notice" style={{ marginTop: '16px' }} role="status">
            <CheckCircle2 size={17} />
            <span>{managementMessage}</span>
            <button onClick={() => setManagementMessage('')} aria-label="Dismiss"><X size={16} /></button>
          </div>
        )}

        {/* EXPORT AND CLEAR */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          marginTop: '24px'
        }}>
          <button
            className="primary-button"
            onClick={downloadDataset}
            disabled={samples.length === 0}
          >
            <Download size={16} /> Export dataset JSON
          </button>

          {!clearConfirmation ? (
            <button
              className="secondary-button"
              onClick={() => setClearConfirmation(true)}
              disabled={samples.length === 0}
            >
              <Trash2 size={16} /> Clear entire dataset
            </button>
          ) : (
            <div style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #d97706',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={19} />
                <strong>Delete all {samples.length} samples?</strong>
              </div>
              <p className="subtle-copy">
                This permanently deletes every collected sample from this browser's local database.
                Export your dataset first if you need a backup.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="primary-button" onClick={() => void clearEntireDataset()}>
                  <Trash2 size={15} /> Yes, delete everything
                </button>
                <button className="secondary-button" onClick={() => setClearConfirmation(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;