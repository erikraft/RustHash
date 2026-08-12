import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // Original Hashing States
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  const [progress, setProgress] = useState<number | null>(null);
  const [progressBytes, setProgressBytes] = useState<{ read: number; total: number } | null>(null);
  const [hashes, setHashes] = useState<{
    sha256: string;
    sha512: string;
    md5: string;
    blake3: string;
  } | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Hash Comparison State
  const [compareHash, setCompareHash] = useState('');

  // Terminal Booting States for Site Loader
  const [isBooting, setIsBooting] = useState(true);
  const [bootCommand, setBootCommand] = useState('');
  const [logSteps, setLogSteps] = useState<number>(0);
  const [bootProgress, setBootProgress] = useState(0);
  const [showFinalPrompt, setShowFinalPrompt] = useState(false);

  // Header Typing Animation States
  const [typingText, setTypingText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  // Favicon animation effect alternating every 1000ms
  useEffect(() => {
    let isPng = true;
    const interval = setInterval(() => {
      const link = document.getElementById('favicon') as HTMLLinkElement | null;
      if (link) {
        if (isPng) {
          link.href = '/favicon2.ico';
          link.type = 'image/x-icon';
        } else {
          link.href = '/favicon.png';
          link.type = 'image/png';
        }
        isPng = !isPng;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Loader Booting Simulation Sequence
  useEffect(() => {
    const commandText = "init --rust-hash";
    let cmdIndex = 0;

    // Phase 1: Type Command
    const typingInterval = setInterval(() => {
      if (cmdIndex < commandText.length) {
        setBootCommand(prev => prev + commandText[cmdIndex]);
        cmdIndex++;
      } else {
        clearInterval(typingInterval);

        // Phase 2: Start sequentially outputting log steps
        setTimeout(() => {
          setLogSteps(1); // Show first log
          setTimeout(() => {
            setLogSteps(2); // Show second log
            setTimeout(() => {
              setLogSteps(3); // Show third log

              // Phase 3: Increment progress bar
              let prog = 0;
              const progressInterval = setInterval(() => {
                if (prog < 100) {
                  prog += 5;
                  setBootProgress(prog);
                } else {
                  clearInterval(progressInterval);

                  // Phase 4: Final line and close loader
                  setLogSteps(4);
                  setTimeout(() => {
                    setShowFinalPrompt(true);
                    setTimeout(() => {
                      setIsBooting(false);
                    }, 500);
                  }, 300);
                }
              }, 40);
            }, 200);
          }, 200);
        }, 300);
      }
    }, 60);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  // Header Typing Phrases loop
  useEffect(() => {
    if (isBooting) return;

    const phrases = [
      'Privacy-first local hashing',
      'Built with Rust + WebAssembly',
      'Asynchronous Web Worker processing',
      'Drag & Drop modern visual interface'
    ];

    let timer: NodeJS.Timeout;

    const typePhrase = () => {
      const currentPhrase = phrases[phraseIndex];
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setTypingText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
          timer = setTimeout(typePhrase, 60);
        } else {
          timer = setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (charIndex > 0) {
          setTypingText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
          timer = setTimeout(typePhrase, 30);
        } else {
          setIsDeleting(false);
          setPhraseIndex(prev => (prev + 1) % phrases.length);
        }
      }
    };

    timer = setTimeout(typePhrase, isDeleting ? 30 : 60);
    return () => clearTimeout(timer);
  }, [phraseIndex, charIndex, isDeleting, isBooting]);

  // Hashing triggers
  const startHashing = (type: 'HASH_TEXT' | 'HASH_FILE', data: any) => {
    console.log("startHashing called with:", type, typeof data === 'string' ? `"${data}"` : 'File');
    setError(null);
    setIsComputing(true);
    setProgress(type === 'HASH_FILE' ? 0 : null);
    setProgressBytes(null);
    setHashes(null);

    // Terminate any previous worker running to cancel current operation immediately
    if (workerRef.current) {
      console.log("Terminating existing worker");
      workerRef.current.terminate();
    }

    // Spin up a new worker
    console.log("Instantiating new Worker...");
    const worker = new Worker(
      new URL('./hash.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { type: responseType, progress: resProgress, bytesRead, totalBytes, results, error: responseError } = event.data;
      console.log("Received worker message:", responseType, { resProgress, bytesRead, totalBytes, results, responseError });

      if (responseType === 'HASH_PROGRESS') {
        setProgress(resProgress);
        setProgressBytes({ read: bytesRead, total: totalBytes });
      } else if (responseType === 'HASH_SUCCESS') {
        console.log("Hashing SUCCESS! Results:", results);
        setHashes(results);
        setIsComputing(false);
        setProgress(null);
        setProgressBytes(null);
      } else if (responseType === 'HASH_ERROR') {
        console.error("Hashing ERROR!", responseError);
        setError(responseError);
        setIsComputing(false);
        setProgress(null);
        setProgressBytes(null);
      }
    };

    workerRef.current = worker;
    worker.postMessage({ type, data });
  };

  // Debounced hashing for text input
  useEffect(() => {
    if (activeTab === 'text') {
      const timer = setTimeout(() => {
        startHashing('HASH_TEXT', text);
      }, 250); // 250ms debounce
      return () => clearTimeout(timer);
    }
  }, [text, activeTab]);

  // Handle file select
  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    startHashing('HASH_FILE', selectedFile);
  };

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Copy to clipboard handler
  const copyToClipboard = (algo: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedAlgo(algo);
    setTimeout(() => {
      setCopiedAlgo(null);
    }, 1500);
  };

  // Render booting progress bar text helper
  const getProgressBarText = (percent: number) => {
    const totalBlocks = 20;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return "[" + "█".repeat(filledBlocks) + "░".repeat(emptyBlocks) + "]";
  };

  return (
    <>
      {/* Premium Loader Overlay */}
      <div className={`site-loader ${isBooting ? '' : 'hidden'}`}>
        <div className="loader-terminal">
          <div className="loader-line">
            <span className="prompt">guest@rusthash:~$</span>
            <span>{bootCommand}</span>
            {bootCommand.length < "init --rust-hash".length && <span className="loader-cursor" />}
          </div>

          <div className="loader-boot-logs">
            {logSteps >= 1 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="log-ok">[ OK ]</span>
                <span>Resolving WebAssembly compilation targets...</span>
              </div>
            )}
            {logSteps >= 2 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="log-ok">[ OK ]</span>
                <span>Wasm bindgen bindings verified.</span>
              </div>
            )}
            {logSteps >= 3 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="log-ok">[ OK ]</span>
                <span>Instantiating background Web Worker context...</span>
              </div>
            )}
            {bootProgress > 0 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="progress-bar">{getProgressBarText(bootProgress)}</span>
                <span className="progress-percent">{bootProgress}%</span>
              </div>
            )}
            {logSteps >= 4 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="log-ok">[ OK ]</span>
                <span>Bootstrap process completed successfully.</span>
              </div>
            )}
            {showFinalPrompt && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="prompt">guest@rusthash:~$</span>
                <span>ready --launch</span>
                <span className="final-cursor" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Background visual components */}
      <div className="ambient-background">
        <div className="glow-blob glow-blob-blue"></div>
        <div className="glow-blob glow-blob-purple"></div>
      </div>
      <div className="grid-overlay"></div>

      {/* Main app container */}
      <div className="app">
        <header className="site-header">
          <h1>RustHash</h1>
          <p>
            🔒 <span className="typing-text">{typingText}</span>
            <span className="cursor">|</span>
          </p>
        </header>

        {/* Tabs switcher */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('text');
              setFile(null);
              setProgress(null);
              setProgressBytes(null);
              setHashes(null);
            }}
          >
            ✍️ Text Input
          </button>
          <button
            className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('file');
              setText('');
              setProgress(null);
              setProgressBytes(null);
              setHashes(null);
            }}
          >
            📁 File Upload
          </button>
        </div>

        {/* Main application body */}
        <main>
          {activeTab === 'text' && (
            <section className="premium-card input-section">
              <h2>✍️ Input String</h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here to compute local cryptographic hashes..."
              />
              <div className="controls">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setText('');
                    setHashes(null);
                  }}
                  disabled={!text}
                >
                  Clear
                </button>
              </div>
            </section>
          )}

          {activeTab === 'file' && (
            <section className="premium-card input-section">
              <h2>📁 Select File</h2>
              <div
                className={`dropzone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <div className="dropzone-icon">📥</div>
                <p style={{ fontWeight: 700 }}>Drag & drop your file here, or click to browse</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Files are processed 100% locally inside your browser via WASM. They are never transmitted over the internet.
                </p>
                <input
                  id="fileInput"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </div>

              {file && (
                <div className="file-info">
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-meta">
                      Size: {formatBytes(file.size)} | Type: {file.type || 'unknown'}
                    </span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => {
                      setFile(null);
                      setHashes(null);
                      setProgress(null);
                      setProgressBytes(null);
                      if (workerRef.current) workerRef.current.terminate();
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {progress !== null && progressBytes && (
                <div className="progress-container">
                  <div className="progress-header">
                    <span>Hashing progress: {progress}%</span>
                    <span>
                      {formatBytes(progressBytes.read)} / {formatBytes(progressBytes.total)}
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              )}
            </section>
          )}

          {error && (
            <div className="error-msg">
              <span>⚠️</span>
              <span>Error: {error}</span>
            </div>
          )}

          {/* Results section rendered as a High Fidelity CLI panel */}
          <section className="cli-panel">
            <div className="cli-header">
              <div className="cli-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="cli-title">Hash Cryptographic Output</span>
              <div style={{ justifySelf: 'end' }}>
                {isComputing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                    <span className="computing-spinner" />
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Computing...</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Optional Hash Comparison section */}
              <div className="compare-box">
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--accent-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                  🔍 Compare / Match hash
                </span>
                <input
                  type="text"
                  placeholder="Paste external hash here to verify matches..."
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value.trim().toLowerCase())}
                />
              </div>

              <div className="results-grid">
                {['SHA-256', 'SHA-512', 'MD5', 'BLAKE3'].map((algo) => {
                  const key = algo.toLowerCase().replace('-', '') as 'sha256' | 'sha512' | 'md5' | 'blake3';
                  const value = hashes ? hashes[key] : '';
                  const hasMatchValue = compareHash.length > 0 && value.length > 0;
                  const isMatch = value.toLowerCase() === compareHash;

                  return (
                    <div className="result-card" key={algo}>
                      <div className="result-card-header">
                        <h3>{algo}</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {hasMatchValue && (
                            <span className={`compare-status ${isMatch ? 'match' : 'mismatch'}`}>
                              {isMatch ? '✓ Match' : '✗ Mismatch'}
                            </span>
                          )}
                          {value && (
                            <button
                              className={`copy-btn ${copiedAlgo === algo ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(algo, value)}
                            >
                              {copiedAlgo === algo ? '✓ Copied' : '📋 Copy'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className={`hash-container ${key}`}>
                        {value ? (
                          <span className="hash">{value}</span>
                        ) : (
                          <span className="hash-placeholder">
                            {isComputing ? 'Computing...' : 'No input generated yet'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <p>© {new Date().getFullYear()} RustHash | Local Hashing Sandbox. Powered by Vite + React + Rust WebAssembly.</p>
        </footer>
      </div>
    </>
  );
}
