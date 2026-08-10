import React, { useState, useEffect, useRef } from 'react';

export default function App() {
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

  const workerRef = useRef<Worker | null>(null);

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

  return (
    <div className="app">
      <header>
        <h1>RustHash</h1>
        <p>🔒 Privacy-first local hashing powered by Rust & WebAssembly</p>
      </header>

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

      <main>
        {activeTab === 'text' && (
          <section className="card input-section">
            <h2>Input String</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
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
          <section className="card input-section">
            <h2>Select File</h2>
            <div
              className={`dropzone ${isDragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <div className="dropzone-icon">📥</div>
              <p style={{ fontWeight: 600 }}>Drag & drop your file here, or click to browse</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Files are processed 100% locally. They are never uploaded to any server.
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
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
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

        {error && <div className="error-msg">⚠️ Error: {error}</div>}

        <section className="card results-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Hashes</h2>
            {isComputing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span className="computing-spinner" />
                <span style={{ fontSize: '0.9rem' }}>Computing...</span>
              </div>
            )}
          </div>

          <div className="results-grid">
            {['SHA-256', 'SHA-512', 'MD5', 'BLAKE3'].map((algo) => {
              const key = algo.toLowerCase().replace('-', '') as 'sha256' | 'sha512' | 'md5' | 'blake3';
              const value = hashes ? hashes[key] : '';

              return (
                <div className="result-card" key={algo}>
                  <div className="result-card-header">
                    <h3>{algo}</h3>
                    {value && (
                      <button
                        className={`copy-btn ${copiedAlgo === algo ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(algo, value)}
                      >
                        {copiedAlgo === algo ? '✓ Copied' : '📋 Copy'}
                      </button>
                    )}
                  </div>
                  <div className="hash-container">
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
        </section>
      </main>
    </div>
  );
}
