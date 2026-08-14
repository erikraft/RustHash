import React, { useState, useEffect, useRef } from 'react';
import { hashAlgorithms, HashAlgorithmInfo } from './hashRegistry';
import NfcSection from './NfcSection';

// Safe helper to access GSAP from window context without breaking the app if CDN fails
const getGSAP = () => {
  if (typeof window === 'undefined') return null;
  const g = (window as any).gsap;
  if (!g) {
    console.warn("GSAP CDN is not available.");
    return null;
  }
  return g;
};

// Motion reduction preference utility
const isReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Safe hover micro-interaction for button scaling
const handleButtonHover = (e: React.MouseEvent<HTMLElement>, isEnter: boolean) => {
  const gsap = getGSAP();
  if (!gsap || isReducedMotion()) return;
  gsap.to(e.currentTarget, {
    scale: isEnter ? 1.03 : 1,
    duration: 0.3,
    ease: "power2.out"
  });
};

// Safe active/press micro-interaction for buttons
const handleButtonPress = (e: React.MouseEvent<HTMLElement>) => {
  const gsap = getGSAP();
  if (!gsap || isReducedMotion()) return;
  gsap.to(e.currentTarget, {
    scale: 0.97,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power1.inOut"
  });
};

// Safe card hover interaction
const handleCardHover = (e: React.MouseEvent<HTMLElement>, isEnter: boolean) => {
  const gsap = getGSAP();
  if (!gsap || isReducedMotion()) return;
  gsap.to(e.currentTarget, {
    y: isEnter ? -4 : 0,
    borderColor: isEnter ? "var(--border-glow)" : "var(--border)",
    boxShadow: isEnter ? "0 20px 45px -15px rgba(0,0,0,0.9), var(--glow-shadow)" : "none",
    duration: 0.4,
    ease: "power2.out"
  });
};

export default function App() {
  // Tabs: 'text', 'file', 'nfc', or 'cli'
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'nfc' | 'cli'>('text');

  // Original Hashing States
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [progress, setProgress] = useState<number | null>(null);
  const [progressBytes, setProgressBytes] = useState<{ read: number; total: number } | null>(null);

  // Dynamic hashes map supporting all algorithms
  const [hashes, setHashes] = useState<Record<string, string> | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAlgo, setCopiedAlgo] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Hash Comparison State
  const [compareHash, setCompareHash] = useState('');

  // UI Search and Filter States for Algorithms
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Selected Algorithm detail modal/tooltip state
  const [activeInfoAlgo, setActiveInfoAlgo] = useState<HashAlgorithmInfo | null>(null);

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

  // --- Parameter Configuration States ---
  const [cshakeCustomization, setCshakeCustomization] = useState('');
  const [kmacKey, setKmacKey] = useState('key');
  const [kmacCustomization, setKmacCustomization] = useState('');
  const [tuplehashCustomization, setTuplehashCustomization] = useState('');

  const [argon2Salt, setArgon2Salt] = useState('salt12345');
  const [argon2m, setArgon2m] = useState(4096);
  const [argon2t, setArgon2t] = useState(3);
  const [argon2p, setArgon2p] = useState(1);
  const [argon2len, setArgon2outLen] = useState(32);

  const [bcryptCost, setBcryptCost] = useState(10);

  const [scryptSalt, setScryptSalt] = useState('scrypt_salt');
  const [scryptN, setScryptN] = useState(10);
  const [scryptR, setScryptR] = useState(8);
  const [scryptP, setScryptP] = useState(1);
  const [scryptLen, setScryptLen] = useState(32);

  const [pbkdf2Salt, setPbkdf2Salt] = useState('salt');
  const [pbkdf2Iter, setPbkdf2Iter] = useState(1000);
  const [pbkdf2Len, setPbkdf2Len] = useState(32);
  const [pbkdf2Prf, setPbkdf2Prf] = useState('sha256');

  const [geoLat, setGeoLat] = useState(37.8324);
  const [geoLon, setGeoLon] = useState(112.5584);
  const [geoPrecision, setGeoPrecision] = useState(9);

  const [showParams, setShowParams] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  // Favicon animation effect alternating every 1000ms
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('dev') === 'true') {
      setShowDevPanel(true);
    }
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

    const typingInterval = setInterval(() => {
      if (cmdIndex < commandText.length) {
        setBootCommand(prev => prev + commandText[cmdIndex]);
        cmdIndex++;
      } else {
        clearInterval(typingInterval);

        setTimeout(() => {
          setLogSteps(1);
          setTimeout(() => {
            setLogSteps(2);
            setTimeout(() => {
              setLogSteps(3);

              let prog = 0;
              const progressInterval = setInterval(() => {
                if (prog < 100) {
                  prog += 5;
                  setBootProgress(prog);
                } else {
                  clearInterval(progressInterval);

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

  // Entrance animations after booting completes
  useEffect(() => {
    if (isBooting) return;
    const gsap = getGSAP();
    if (!gsap || isReducedMotion()) return;

    // Animate header, tabs, sections and cards with staggering using fromTo for deterministic rendering in React
    const tl = gsap.timeline();
    tl.fromTo(".site-header",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
    .fromTo(".tabs",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.3"
    )
    .fromTo(".input-section",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.2"
    )
    .fromTo(".cli-panel",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(".algos-explorer",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(".result-card",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "power1.out" },
      "-=0.3"
    );

    return () => {
      tl.revert(); // Revert GSAP inline style properties to prevent stuck opacity on React double-mount (StrictMode)
    };
  }, [isBooting]);

  // Modal display entrance animation
  useEffect(() => {
    if (!activeInfoAlgo) return;
    const gsap = getGSAP();
    if (!gsap || isReducedMotion()) return;

    // Smooth modal dialog pop-in
    const tl = gsap.fromTo(".modal-content",
      {
        opacity: 0,
        scale: 0.9,
        y: 20
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.2)"
      }
    );

    return () => {
      tl.revert(); // Cleanly revert modal animation styles on close/unmount
    };
  }, [activeInfoAlgo]);

  // Header Typing Phrases loop
  useEffect(() => {
    if (isBooting) return;

    const phrases = [
      'Privacidade em primeiro lugar: processamento local',
      'Construído com Rust + WebAssembly ultra-rápido',
      'Execução paralela assíncrona via Web Workers',
      'Interface moderna com Drag & Drop de arquivos'
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

    if (workerRef.current) {
      console.log("Terminating existing worker");
      workerRef.current.terminate();
    }

    console.log("Instantiating new Worker...");
    const worker = new Worker(
      new URL('./hash.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      const { type: responseType, progress: resProgress, bytesRead, totalBytes, results, error: responseError } = event.data;

      if (responseType === 'HASH_PROGRESS') {
        setProgress(resProgress);
        setProgressBytes({ read: bytesRead, total: totalBytes });
      } else if (responseType === 'HASH_SUCCESS') {
        console.log("Hashing SUCCESS!");
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

    // Gather parameter block to send to the worker
    const params = {
      cshake_customization: cshakeCustomization,
      kmac_key: kmacKey,
      kmac_customization: kmacCustomization,
      tuplehash_customization: tuplehashCustomization,
      argon2_salt: argon2Salt,
      argon2_m_cost: argon2m,
      argon2_t_cost: argon2t,
      argon2_p_cost: argon2p,
      argon2_out_len: argon2len,
      bcrypt_cost: bcryptCost,
      scrypt_salt: scryptSalt,
      scrypt_log_n: scryptN,
      scrypt_r: scryptR,
      scrypt_p: scryptP,
      scrypt_out_len: scryptLen,
      pbkdf2_salt: pbkdf2Salt,
      pbkdf2_iterations: pbkdf2Iter,
      pbkdf2_out_len: pbkdf2Len,
      pbkdf2_prf: pbkdf2Prf,
      geohash_latitude: geoLat,
      geohash_longitude: geoLon,
      geohash_precision: geoPrecision
    };

    worker.postMessage({ type, data, params });
  };

  // Debounced hashing for text input and parameters
  useEffect(() => {
    if (activeTab === 'text') {
      const timer = setTimeout(() => {
        startHashing('HASH_TEXT', text);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [
    text, activeTab,
    cshakeCustomization, kmacKey, kmacCustomization, tuplehashCustomization,
    argon2Salt, argon2m, argon2t, argon2p, argon2len,
    bcryptCost,
    scryptSalt, scryptN, scryptR, scryptP, scryptLen,
    pbkdf2Salt, pbkdf2Iter, pbkdf2Len, pbkdf2Prf,
    geoLat, geoLon, geoPrecision
  ]);

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

  // Get Security Color helper
  const getSecurityBadgeInfo = (level: HashAlgorithmInfo['securityLevel']) => {
    switch (level) {
      case 'Seguro':
        return { text: 'SEGURO', className: 'badge-secure' };
      case 'Fraco/Inseguro':
        return { text: 'FRACASSO/VULNERÁVEL', className: 'badge-weak' };
      case 'Obsoleto':
        return { text: 'OBSOLETO/EVITAR', className: 'badge-obsolete' };
      case 'Não Criptográfico (Integridade)':
        return { text: 'NÃO-CRIPTOGRÁFICO', className: 'badge-checksum' };
      default:
        return { text: 'N/A', className: 'badge-na' };
    }
  };

  // Fallback helpers for 13 technical fields
  const getFallbackYear = (name: string): string => {
    const n = name.toUpperCase();
    if (n.includes('SHA-256') || n.includes('SHA-512') || n.includes('SHA-384')) return '2001';
    if (n.includes('SHA-224')) return '2004';
    if (n.includes('SHA-512/')) return '2012';
    if (n.includes('SHA3-') || n.includes('SHAKE')) return '2015';
    if (n.includes('CSHAKE') || n.includes('KMAC') || n.includes('TUPLEHASH')) return '2016';
    if (n.includes('ASCON')) return '2023';
    if (n.includes('BLAKE3')) return '2020';
    if (n.includes('BLAKE2')) return '2012';
    if (n.includes('RIPEMD-160')) return '1996';
    if (n.includes('MD5')) return '1992';
    if (n.includes('MD4')) return '1990';
    if (n.includes('MD2')) return '1989';
    if (n.includes('WHIRLPOOL')) return '2000';
    if (n.includes('SM3')) return '2010';
    if (n.includes('SHA-1')) return '1995';
    if (n.includes('CRC-32')) return '1975';
    if (n.includes('ADLER-32')) return '1995';
    if (n.includes('CRC-8')) return '1992';
    if (n.includes('CRC-16')) return '1962';
    if (n.includes('CRC-64')) return '1993';
    if (n.includes('FLETCHER')) return '1982';
    if (n.includes('LUHN')) return '1954';
    if (n.includes('VERHOEFF')) return '1969';
    if (n.includes('DAMM')) return '2004';
    if (n.includes('MURMURHASH3')) return '2011';
    if (n.includes('XXHASH')) return '2012';
    if (n.includes('SIPHASH')) return '2012';
    if (n.includes('FNV')) return '1991';
    if (n.includes('ARGON2')) return '2015';
    if (n.includes('BCRYPT')) return '1999';
    if (n.includes('SCRYPT')) return '2009';
    if (n.includes('PBKDF2')) return '2000';
    if (n.includes('GEOHASH')) return '2008';
    return 'N/A';
  };

  const getFallbackOutputSize = (name: string): string => {
    const n = name.toUpperCase();
    if (n.includes('SHA-256') || n.includes('SHA3-256') || n.includes('BLAKE2S') || n.includes('ASCON-HASH256') || n.includes('SM3')) return '256 bits (32 bytes)';
    if (n.includes('SHA-512') || n.includes('SHA3-512') || n.includes('BLAKE2B') || n.includes('WHIRLPOOL')) return '512 bits (64 bytes)';
    if (n.includes('SHA-384') || n.includes('SHA3-384')) return '384 bits (48 bytes)';
    if (n.includes('SHA-224') || n.includes('SHA3-224')) return '224 bits (28 bytes)';
    if (n.includes('SHA-512/224')) return '224 bits (28 bytes)';
    if (n.includes('SHA-512/256')) return '256 bits (32 bytes)';
    if (n.includes('MD5') || n.includes('MD4') || n.includes('MD2') || n.includes('RIPEMD-128')) return '128 bits (16 bytes)';
    if (n.includes('SHA-1') || n.includes('RIPEMD-160')) return '160 bits (20 bytes)';
    if (n.includes('SHAKE') || n.includes('CSHAKE') || n.includes('KMAC') || n.includes('TUPLEHASH') || n.includes('ASCON-XOF') || n.includes('ARGON2') || n.includes('SCRYPT') || n.includes('PBKDF2')) return 'Flexível (Tamanho customizável)';
    if (n.includes('CRC-32') || n.includes('ADLER-32') || n.includes('FLETCHER-32')) return '32 bits (4 bytes)';
    if (n.includes('CRC-16') || n.includes('FLETCHER-16')) return '16 bits (2 bytes)';
    if (n.includes('CRC-8') || n.includes('LUHN') || n.includes('VERHOEFF') || n.includes('DAMM')) return '8 bits (1 byte)';
    if (n.includes('CRC-64')) return '64 bits (8 bytes)';
    if (n.includes('MURMURHASH3') || n.includes('FNV')) return '32 bits (4 bytes)';
    if (n.includes('XXHASH')) return '32 bits (4 bytes)';
    if (n.includes('SIPHASH')) return '64 bits (8 bytes)';
    if (n.includes('BCRYPT')) return '184 bits (Cifra Blowfish)';
    if (n.includes('GEOHASH')) return 'Variável (String de precisão espacial)';
    return 'N/A';
  };

  const getFallbackType = (category: string, name: string): string => {
    if (category === 'Integridade (Checksum)') return 'Algoritmo de Soma de Verificação (Checksum)';
    if (category === 'Fast/Non-Cryptographic') return 'Função Hash Não Criptográfica Rápida';
    if (category === 'Segurança de Senha') return 'Função de Derivação de Chaves (KDF) / Senhas';
    if (category === 'Fuzzy/Similaridade') return 'Fuzzy Hash / Algoritmo de Similaridade';
    if (name.toUpperCase().includes('KMAC')) return 'Código de Autenticação de Mensagem (MAC)';
    return 'Função Hash Criptográfica';
  };

  const getFallbackAuthor = (name: string): string => {
    const n = name.toUpperCase();
    if (n.includes('SHA-256') || n.includes('SHA-512') || n.includes('SHA-384') || n.includes('SHA-224') || n.includes('SHA-1')) return 'NSA / NIST';
    if (n.includes('SHA3-') || n.includes('SHAKE') || n.includes('KMAC') || n.includes('TUPLEHASH')) return 'Guido Bertoni, Joan Daemen, Michaël Peeters, Gilles Van Assche (Equipe Keccak)';
    if (n.includes('ASCON')) return 'Christoph Dobraunig, Maria Eichlseder, Florian Mendel, Martin Schläffer';
    if (n.includes('BLAKE3')) return 'Jack O\'Connor, Jean-Philippe Aumasson, Samuel Neves, Zooko Wilcox-O\'Hearn';
    if (n.includes('BLAKE2')) return 'Jean-Philippe Aumasson, Samuel Neves, Zooko Wilcox-O\'Hearn, Christian Winnerlein';
    if (n.includes('RIPEMD-160')) return 'Hans Dobbertin, Antoon Bosselaers, Bart Preneel';
    if (n.includes('MD5') || n.includes('MD4') || n.includes('MD2') || n.includes('MD6')) return 'Ronald Rivest (MIT)';
    if (n.includes('WHIRLPOOL')) return 'Vincent Rijmen, Paulo Barreto';
    if (n.includes('SM3')) return 'Governo Chinês / TC 260';
    if (n.includes('CRC-') || n.includes('ADLER')) return 'W. Wesley Peterson / Comunidade IETF';
    if (n.includes('FLETCHER')) return 'John G. Fletcher';
    if (n.includes('LUHN')) return 'Hans Peter Luhn';
    if (n.includes('VERHOEFF')) return 'Jacobus Verhoeff';
    if (n.includes('DAMM')) return 'H. Michael Damm';
    if (n.includes('MURMURHASH')) return 'Austin Appleby';
    if (n.includes('XXHASH')) return 'Yann Collet';
    if (n.includes('SIPHASH')) return 'Jean-Philippe Aumasson, Daniel J. Bernstein';
    if (n.includes('FNV')) return 'Glenn Fowler, Landon Curt Noll, Phong Vo';
    if (n.includes('ARGON2')) return 'Alex Biryukov, Daniel Dinu, Dmitry Khovratovich';
    if (n.includes('BCRYPT')) return 'Niels Provos, David Mazières';
    if (n.includes('SCRYPT')) return 'Colin Percival';
    if (n.includes('PBKDF2')) return 'RSA Laboratories (PKCS #5)';
    if (n.includes('GEOHASH')) return 'Gustavo Niemeyer';
    return 'Pesquisadores / Comunidade Criptográfica';
  };

  // Filter categories
  const categories = ['Todos', 'Criptográfico', 'Integridade (Checksum)', 'Fast/Non-Cryptographic', 'Segurança de Senha', 'Fuzzy/Similaridade', 'Outros Especializados'];

  // Filter & Search Logic
  const filteredAlgorithms = hashAlgorithms.filter(algo => {
    const matchesSearch = algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          algo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || algo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                <span>Resolvendo alvos de compilação WebAssembly...</span>
              </div>
            )}
            {logSteps >= 2 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="log-ok">[ OK ]</span>
                <span>Bindings do wasm-bindgen verificados com sucesso.</span>
              </div>
            )}
            {logSteps >= 3 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="log-ok">[ OK ]</span>
                <span>Instanciando contexto assíncrono do Web Worker...</span>
              </div>
            )}
            {bootProgress > 0 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="progress-bar">
                  {"[" + "█".repeat(Math.round(bootProgress / 5)) + "░".repeat(20 - Math.round(bootProgress / 5)) + "]"}
                </span>
                <span className="progress-percent">{bootProgress}%</span>
              </div>
            )}
            {logSteps >= 4 && (
              <div className="loader-line" style={{ display: 'flex', opacity: 1 }}>
                <span className="log-ok">[ OK ]</span>
                <span>Processo de inicialização concluído com sucesso.</span>
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
            <i className="fa-solid fa-lock" aria-hidden="true" style={{ marginRight: '6px' }}></i>
            <span className="typing-text">{typingText}</span>
            <span className="cursor">|</span>
          </p>
        </header>

        {/* Tabs switcher */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
            onMouseDown={handleButtonPress}
            onClick={() => {
              setActiveTab('text');
              setFile(null);
              setProgress(null);
              setProgressBytes(null);
              setHashes(null);
            }}
          >
            <i className="fa-solid fa-pen-to-square" aria-hidden="true" style={{ marginRight: '8px' }}></i>Entrada de Texto
          </button>
          <button
            className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
            onMouseDown={handleButtonPress}
            onClick={() => {
              setActiveTab('file');
              setText('');
              setProgress(null);
              setProgressBytes(null);
              setHashes(null);
            }}
          >
            <i className="fa-solid fa-file-arrow-up" aria-hidden="true" style={{ marginRight: '8px' }}></i>Envio de Arquivo
          </button>
          <button
            className={`tab-btn ${activeTab === 'nfc' ? 'active' : ''}`}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
            onMouseDown={handleButtonPress}
            onClick={() => {
              setActiveTab('nfc');
              setText('');
              setFile(null);
              setProgress(null);
              setProgressBytes(null);
              setHashes(null);
            }}
          >
            <i className="fa-solid fa-satellite-dish" aria-hidden="true" style={{ marginRight: '8px' }}></i>Painel NFC / RFID
          </button>
          <button
            className={`tab-btn ${activeTab === 'cli' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('cli');
              setText('');
              setFile(null);
              setProgress(null);
              setProgressBytes(null);
              setHashes(null);
            }}
          >
            💻 RustHash CLI
          </button>
        </div>

        {/* Main application body */}
        <main>
          {activeTab === 'text' && (
            <section className="premium-card input-section">
              <h2><i className="fa-solid fa-pen-nib" aria-hidden="true" style={{ marginRight: '10px' }}></i>String de Entrada</h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite ou cole seu texto aqui para computar os hashes criptográficos localmente..."
              />
              <div className="controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                  onMouseDown={handleButtonPress}
                  onClick={() => {
                    setText('');
                    setHashes(null);
                  }}
                  disabled={!text}
                >
                  Limpar
                </button>

                <button
                  className="btn btn-secondary"
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                  onMouseDown={handleButtonPress}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'var(--accent)',
                    color: 'var(--accent-light)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onClick={() => setShowParams(!showParams)}
                >
                  <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                  <span>{showParams ? 'Ocultar Parâmetros' : 'Configurar Parâmetros de Algoritmos'}</span>
                </button>
              </div>

              {/* Collapsible Parameter Adjustment Panel */}
              {showParams && (
                <div
                  className="parameter-panel"
                  style={{
                    marginTop: '20px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'rgba(5,5,10,0.85)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ gridColumn: '1 / -1', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-sliders" aria-hidden="true"></i>Ajustar Parâmetros Customizados</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      Personalize as chaves, salts e custos de processamento. Os hashes correspondentes atualizarão em tempo real.
                    </p>
                  </div>

                  {/* cSHAKE & KMAC params */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#fff' }}>cSHAKE & KMAC</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>cSHAKE Customization String:</span>
                        <input type="text" value={cshakeCustomization} onChange={(e) => setCshakeCustomization(e.target.value)} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>KMAC Key (chave simétrica):</span>
                        <input type="text" value={kmacKey} onChange={(e) => setKmacKey(e.target.value)} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>KMAC Customization:</span>
                        <input type="text" value={kmacCustomization} onChange={(e) => setKmacCustomization(e.target.value)} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>TupleHash Customization:</span>
                        <input type="text" value={tuplehashCustomization} onChange={(e) => setTuplehashCustomization(e.target.value)} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                    </div>
                  </div>

                  {/* Argon2 parameters */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#fff' }}>Argon2 (id/i/d)</h4>
                    <div className="param-grid-argon" style={{ fontSize: '0.8rem' }}>
                      <label className="salt-label" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Salt:</span>
                        <input type="text" value={argon2Salt} onChange={(e) => setArgon2Salt(e.target.value)} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Memory Cost (KB):</span>
                        <input type="number" value={argon2m} onChange={(e) => setArgon2m(Math.max(1, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Iterations:</span>
                        <input type="number" value={argon2t} onChange={(e) => setArgon2t(Math.max(1, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Parallelism:</span>
                        <input type="number" value={argon2p} onChange={(e) => setArgon2p(Math.max(1, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Out Length (Bytes):</span>
                        <input type="number" value={argon2len} onChange={(e) => setArgon2outLen(Math.max(4, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                    </div>
                  </div>

                  {/* scrypt, bcrypt, PBKDF2 */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#fff' }}>scrypt, bcrypt & PBKDF2</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                      <div className="param-grid-2">
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: 'var(--muted)' }}>bcrypt Cost:</span>
                          <input type="number" value={bcryptCost} onChange={(e) => setBcryptCost(Math.max(4, Math.min(31, Number(e.target.value))))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: 'var(--muted)' }}>scrypt Log(N):</span>
                          <input type="number" value={scryptN} onChange={(e) => setScryptN(Math.max(1, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                        </label>
                      </div>
                      <div className="param-grid-3">
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: 'var(--muted)' }}>scrypt r:</span>
                          <input type="number" value={scryptR} onChange={(e) => setScryptR(Math.max(1, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: 'var(--muted)' }}>scrypt p:</span>
                          <input type="number" value={scryptP} onChange={(e) => setScryptP(Math.max(1, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: 'var(--muted)' }}>scrypt out len:</span>
                          <input type="number" value={scryptLen} onChange={(e) => setScryptLen(Math.max(4, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                        </label>
                      </div>
                      <div className="param-grid-2">
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: 'var(--muted)' }}>PBKDF2 Iterations:</span>
                          <input type="number" value={pbkdf2Iter} onChange={(e) => setPbkdf2Iter(Math.max(1, Number(e.target.value)))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ color: 'var(--muted)' }}>PBKDF2 PRF:</span>
                          <select value={pbkdf2Prf} onChange={(e) => setPbkdf2Prf(e.target.value)} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', height: '37px', width: '100%', boxSizing: 'border-box' }}>
                            <option value="sha256">SHA-256</option>
                            <option value="sha512">SHA-512</option>
                            <option value="sha1">SHA-1</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Geohash Parameters */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#fff' }}>Geohash (Sistema Espacial)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Latitude (-90.0 a 90.0):</span>
                        <input type="number" step="0.0001" value={geoLat} onChange={(e) => setGeoLat(Number(e.target.value))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Longitude (-180.0 a 180.0):</span>
                        <input type="number" step="0.0001" value={geoLon} onChange={(e) => setGeoLon(Number(e.target.value))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ color: 'var(--muted)' }}>Precisão (tamanho da string):</span>
                        <input type="number" value={geoPrecision} onChange={(e) => setGeoPrecision(Math.max(1, Math.min(12, Number(e.target.value))))} style={{ background: '#000', border: '1px solid var(--border)', color: '#fff', padding: '8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'file' && (
            <section className="premium-card input-section">
              <h2><i className="fa-solid fa-file-arrow-up" aria-hidden="true" style={{ marginRight: '10px' }}></i>Selecionar Arquivo</h2>
              <div
                className={`dropzone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <div className="dropzone-icon"><i className="fa-solid fa-cloud-arrow-up fa-3x" aria-hidden="true"></i></div>
                <p style={{ fontWeight: 700 }}>Arraste e solte seu arquivo aqui, ou clique para procurar</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Os arquivos são processados 100% localmente no seu navegador via WASM, sem nunca trafegar pela internet.
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
                      Tamanho: {formatBytes(file.size)} | Tipo: {file.type || 'desconhecido'}
                    </span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    onMouseDown={handleButtonPress}
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    onClick={() => {
                      setFile(null);
                      setHashes(null);
                      setProgress(null);
                      setProgressBytes(null);
                      if (workerRef.current) workerRef.current.terminate();
                    }}
                  >
                    Remover
                  </button>
                </div>
              )}

              {progress !== null && progressBytes && (
                <div className="progress-container">
                  <div className="progress-header">
                    <span>Progresso do Hashing: {progress}%</span>
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

          {activeTab === 'nfc' && <NfcSection />}

          {activeTab === 'cli' && (
            <section className="premium-card cli-section" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ border: 'none', margin: 0, paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-terminal" aria-hidden="true" style={{ color: 'var(--accent)' }}></i>
                <span>RustHash CLI</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '1.05rem', lineHeight: '1.5' }}>
                Hashing poderoso e de alta performance diretamente no seu terminal, sem necessidade de downloads manuais ou configurações complexas. Reutiliza o mesmo core de algoritmos em Rust do site oficial.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }} className="install-grid">
                <div className="cli-install-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-brands fa-windows" style={{ color: '#0078d4' }}></i> Windows (PowerShell)
                  </h3>
                  <div style={{ display: 'flex', background: '#0a0a0c', padding: '12px 15px', borderRadius: '6px', border: '1px solid var(--accent)', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ color: 'var(--text-highlight)', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'nowrap', marginRight: '10px', fontFamily: 'var(--mono)' }}>
                      irm https://hash.erikraft.com/install.ps1 | iex
                    </code>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.8rem', minWidth: '75px', height: '30px' }}
                      onClick={(e) => {
                        navigator.clipboard.writeText("irm https://hash.erikraft.com/install.ps1 | iex");
                        const target = e.currentTarget;
                        target.innerText = "Copiado!";
                        setTimeout(() => { target.innerText = "Copiar"; }, 2000);
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="cli-install-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-brands fa-linux" style={{ color: '#fda110' }}></i> / <i className="fa-brands fa-apple" style={{ color: '#fff' }}></i> Linux & macOS
                  </h3>
                  <div style={{ display: 'flex', background: '#0a0a0c', padding: '12px 15px', borderRadius: '6px', border: '1px solid var(--accent)', alignItems: 'center', justifyContent: 'space-between' }}>
                    <code style={{ color: 'var(--text-highlight)', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'nowrap', marginRight: '10px', fontFamily: 'var(--mono)' }}>
                      curl -fsSL https://hash.erikraft.com/install.sh | sh
                    </code>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.8rem', minWidth: '75px', height: '30px' }}
                      onClick={(e) => {
                        navigator.clipboard.writeText("curl -fsSL https://hash.erikraft.com/install.sh | sh");
                        const target = e.currentTarget;
                        target.innerText = "Copiado!";
                        setTimeout(() => { target.innerText = "Copiar"; }, 2000);
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-light)' }}>
                <i className="fa-solid fa-circle-info"></i> Exemplos de Uso no Terminal
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: '#0a0a0c', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', margin: '0 0 8px 0' }}>Visualizar comandos e ajuda</h4>
                  <pre style={{ margin: 0, color: 'var(--text-highlight)', fontFamily: 'var(--mono)' }}><code>rusthash --help</code></pre>
                </div>

                <div style={{ background: '#0a0a0c', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', margin: '0 0 8px 0' }}>Hash de texto com algoritmo padrão (SHA256, SHA512 e BLAKE3)</h4>
                  <pre style={{ margin: 0, color: 'var(--text-highlight)', fontFamily: 'var(--mono)' }}><code>rusthash hash "Olá RustHash!"</code></pre>
                </div>

                <div style={{ background: '#0a0a0c', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', margin: '0 0 8px 0' }}>Hash de texto com algoritmo específico</h4>
                  <pre style={{ margin: 0, color: 'var(--text-highlight)', fontFamily: 'var(--mono)' }}><code>rusthash hash --algorithm sha256 "Olá RustHash!"</code></pre>
                </div>

                <div style={{ background: '#0a0a0c', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', margin: '0 0 8px 0' }}>Hash de arquivos grandes (Streaming de alta performance)</h4>
                  <pre style={{ margin: 0, color: 'var(--text-highlight)', fontFamily: 'var(--mono)' }}><code>rusthash file ./arquivo.iso --algorithm sha256</code></pre>
                </div>

                <div style={{ background: '#0a0a0c', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px', margin: '0 0 8px 0' }}>Verificação de integridade de arquivos</h4>
                  <pre style={{ margin: 0, color: 'var(--text-highlight)', fontFamily: 'var(--mono)' }}><code>rusthash verify ./arquivo.iso --algorithm sha256 --hash &lt;HASH&gt;</code></pre>
                </div>
              </div>
            </section>
          )}

          {error && (
            <div className="error-msg">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
              <span>Erro: {error}</span>
            </div>
          )}

          {/* Core hashes panel highlighting preserved structures */}
          {(activeTab === 'text' || activeTab === 'file') && (
            <section className="cli-panel">
            <div className="cli-header">
              <div className="cli-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <span className="cli-title">Hashes Principais (Estáveis)</span>
              <div style={{ justifySelf: 'end' }}>
                {isComputing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                    <span className="computing-spinner" />
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', textTransform: 'uppercase' }}>Computando...</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="compare-box">
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--accent-light)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>Comparar / Verificar Match do Hash
                </span>
                <input
                  type="text"
                  placeholder="Cole um hash externo para verificar se há correspondência automática..."
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value.trim().toLowerCase())}
                />
              </div>

              {[
                { label: 'SHA-256', key: 'sha256' },
                { label: 'SHA-512', key: 'sha512' },
                { label: 'BLAKE3', key: 'blake3' },
                { label: 'MD5', key: 'md5' },
                { label: 'SHA-1', key: 'sha1' },
              ].map(({ label, key }) => {
                const val = hashes ? hashes[key] : '';
                const isMatch = compareHash && val && val.toLowerCase() === compareHash;
                const hasMatchValue = !!(compareHash && val);

                return (
                  <div
                    className="result-card"
                    key={label}
                    onMouseEnter={(e) => handleCardHover(e, true)}
                    onMouseLeave={(e) => handleCardHover(e, false)}
                  >
                    <div className="result-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3>{label}</h3>
                        <button
                          className="info-icon-btn"
                          aria-label="Ver detalhes do algoritmo"
                          onMouseEnter={(e) => handleButtonHover(e, true)}
                          onMouseLeave={(e) => handleButtonHover(e, false)}
                          onMouseDown={handleButtonPress}
                          onClick={() => {
                            const match = hashAlgorithms.find(a => a.name === label);
                            if (match) setActiveInfoAlgo(match);
                          }}
                        >
                          <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {hasMatchValue && (
                          <span className={`compare-status ${isMatch ? 'match' : 'mismatch'}`}>
                            {isMatch ? <i className="fa-solid fa-circle-check" aria-hidden="true"></i> : <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>} {isMatch ? 'Match' : 'Different'}
                          </span>
                        )}
                        {val && (
                          <button
                            className={`copy-btn ${copiedAlgo === label ? 'copied' : ''}`}
                            onMouseEnter={(e) => handleButtonHover(e, true)}
                            onMouseLeave={(e) => handleButtonHover(e, false)}
                            onMouseDown={handleButtonPress}
                            onClick={() => copyToClipboard(label, val)}
                          >
                            {copiedAlgo === label ? <i className="fa-solid fa-circle-check" aria-hidden="true"></i> : <i className="fa-solid fa-copy" aria-hidden="true"></i>} {copiedAlgo === label ? 'Copiado' : 'Copiar'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`hash-container ${key}`}>
                      {val ? (
                        <span className="hash">{val}</span>
                      ) : (
                        <span className="hash-placeholder">
                          {isComputing ? 'Processando...' : 'Nenhuma entrada ainda gerada'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          )}

          {/* New Expanded Algorithms Explorer Interface hidden for NFC and CLI tab */}
          {(activeTab === 'text' || activeTab === 'file') && (
            <section className="premium-card algos-explorer">
              <div className="explorer-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ border: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><i className="fa-solid fa-compass" aria-hidden="true"></i>Explorer de Algoritmos Completo</h2>
                <p style={{ margin: '8px 0 0 0' }}>
                  Pesquise e compare os {hashAlgorithms.length} algoritmos de hashing criptográficos, somas de verificação, hashes rápidos e fuzzy.
                </p>
              </div>

              <div className="category-filters-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onMouseEnter={(e) => handleButtonHover(e, true)}
                      onMouseLeave={(e) => handleButtonHover(e, false)}
                      onMouseDown={handleButtonPress}
                      onClick={() => setSelectedCategory(cat)}
                      className={`filter-badge ${selectedCategory === cat ? 'active' : ''}`}
                      style={{
                        background: selectedCategory === cat ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'rgba(255,255,255,0.03)',
                        color: selectedCategory === cat ? '#050508' : 'var(--muted)',
                        border: '1px solid var(--border)',
                        borderRadius: '20px',
                        padding: '10px 16px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--mono)',
                        fontWeight: selectedCategory === cat ? 700 : 500,
                        transition: 'all 0.2s ease',
                        flex: '1 1 auto',
                        textAlign: 'center',
                        minWidth: '100px'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

              {/* Algorithms Grid */}
              <div className="explorer-grid">
              {filteredAlgorithms.map(algo => {
                const badge = getSecurityBadgeInfo(algo.securityLevel);
                const resultsKey = algo.key || algo.name.toLowerCase().replace(/-|\//g, '_');
                const val = hashes ? hashes[resultsKey] : '';
                const hasMatchValue = compareHash.length > 0 && val && val.length > 0;

                // Categorize verification types cleanly
                const isValidationDecimal = algo.category === 'Integridade (Checksum)' && ['Luhn', 'Verhoeff', 'Damm'].includes(algo.name);
                const isMatch = val && val.toLowerCase() === compareHash;

                return (
                  <div
                    className={`explorer-card ${algo.implemented ? 'implemented' : 'not-implemented'}`}
                    key={algo.name}
                    onMouseEnter={(e) => handleCardHover(e, true)}
                    onMouseLeave={(e) => handleCardHover(e, false)}
                    style={{
                      background: 'rgba(3,3,5,0.4)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{algo.name}</h4>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--muted)' }}>
                          {algo.category}
                        </span>
                        <span className={`badge-sec ${badge.className}`}>
                          {badge.text}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {algo.implemented ? (
                          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}><i className="fa-solid fa-circle" aria-hidden="true" style={{ fontSize: '8px', marginRight: '4px', verticalAlign: 'middle' }}></i>IMPLEMENTADO</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic' }}><i className="fa-regular fa-circle" aria-hidden="true" style={{ fontSize: '8px', marginRight: '4px', verticalAlign: 'middle' }}></i>Não implementado (Info)</span>
                        )}
                        <button
                          className="info-icon-btn"
                          type="button"
                          onMouseEnter={(e) => handleButtonHover(e, true)}
                          onMouseLeave={(e) => handleButtonHover(e, false)}
                          onMouseDown={handleButtonPress}
                          onClick={() => setActiveInfoAlgo(algo)}
                          aria-label="Ver detalhes do algoritmo"
                        >
                          <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {algo.description}
                    </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-light)', fontWeight: 700 }}>Recomendação:</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{algo.recommendation}</span>
                      </div>

                    {/* Rendering the actual hash if implemented */}
                    {algo.implemented && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted-dark)', fontFamily: 'var(--mono)' }}>
                            {isValidationDecimal ? 'DÍGITO VERIFICADOR / CHECKSUM:' : 'OUTPUT:'}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {hasMatchValue && (
                              <span className={`compare-status ${isMatch ? 'match' : 'mismatch'}`} style={{ fontSize: '0.75rem' }}>
                                {isValidationDecimal ? (
                                  isMatch ? '✓ Válido (Check Digit Match)' : '✗ Check Digit Mismatch'
                                ) : (
                                  isMatch ? '✓ Match' : '✗ Mismatch'
                                )}
                              </span>
                            )}
                            {val && (
                              <button
                                className={`copy-btn ${copiedAlgo === algo.name ? 'copied' : ''}`}
                                onMouseEnter={(e) => handleButtonHover(e, true)}
                                onMouseLeave={(e) => handleButtonHover(e, false)}
                                onMouseDown={handleButtonPress}
                                onClick={() => copyToClipboard(algo.name, val)}
                                style={{ padding: '2px 8px', fontSize: '10px' }}
                              >
                                {copiedAlgo === algo.name ? <i className="fa-solid fa-circle-check" aria-hidden="true"></i> : <i className="fa-solid fa-copy" aria-hidden="true"></i>} {copiedAlgo === algo.name ? 'Copiado' : 'Copiar'}
                              </button>
                            )}
                          </div>
                        </div>

                        <div
                          className="mini-hash-container"
                            style={{
                              background: 'rgba(3,3,5,0.7)',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              fontFamily: 'var(--mono)',
                              fontSize: '0.8rem',
                              wordBreak: 'break-all',
                              color: val ? 'var(--text)' : 'var(--muted-dark)',
                              border: '1px solid rgba(255,255,255,0.02)'
                            }}
                          >
                            {val ? val : (isComputing ? 'Processando...' : 'Nenhuma entrada gerada')}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredAlgorithms.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                    Nenhum algoritmo encontrado para "{searchQuery}" nesta categoria.
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {/* Algorithm Detail Dialog/Modal popup */}
        {activeInfoAlgo && (
          <div
            className="modal-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(2, 2, 4, 0.85)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setActiveInfoAlgo(null)}
          >
            <div
              className="modal-content"
              style={{
                background: 'var(--bg-panel-solid)',
                border: '1px solid var(--accent-light)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '600px',
                width: '100%',
                boxShadow: 'var(--shadow), var(--glow-shadow)',
                position: 'relative',
                fontFamily: 'var(--mono)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '1.2rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
                onMouseDown={handleButtonPress}
                onClick={() => setActiveInfoAlgo(null)}
                aria-label="Fechar"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>

              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', color: '#fff' }}>
                {activeInfoAlgo.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', lineHeight: 1.5, maxHeight: '70vh', overflowY: 'auto', paddingRight: '6px' }}>
                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Nome:</strong> {activeInfoAlgo.name}
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Ano de Lançamento:</strong> {activeInfoAlgo.year || getFallbackYear(activeInfoAlgo.name)}
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Autor(es):</strong> {activeInfoAlgo.author || getFallbackAuthor(activeInfoAlgo.name)}
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Categoria:</strong> {activeInfoAlgo.category}
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Tamanho da Saída:</strong> {activeInfoAlgo.outputSize || getFallbackOutputSize(activeInfoAlgo.name)}
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Tipo:</strong> {activeInfoAlgo.algorithmType || getFallbackType(activeInfoAlgo.category, activeInfoAlgo.name)}
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Status no RustHash:</strong>{' '}
                  {activeInfoAlgo.implemented ? (
                    <span style={{ color: '#10b981', fontWeight: 700 }}>● IMPLEMENTADO (Calculado localmente em tempo real)</span>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>○ NÃO IMPLEMENTADO (Fins informativos)</span>
                  )}
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Segurança Atual:</strong>{' '}
                  <span className={`badge-sec ${getSecurityBadgeInfo(activeInfoAlgo.securityLevel).className}`}>
                    {getSecurityBadgeInfo(activeInfoAlgo.securityLevel).text}
                  </span>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Histórico:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                    {activeInfoAlgo.history || activeInfoAlgo.description}
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Uso Original:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                    {activeInfoAlgo.originalUse || 'Integridade geral de dados e autenticação legada.'}
                  </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--accent)' }}>
                  <strong style={{ color: 'var(--accent-light)', display: 'block', marginBottom: '4px' }}>Uso Recomendado Atualmente:</strong>
                  <span style={{ color: 'var(--text)' }}>{activeInfoAlgo.recommendedUse || activeInfoAlgo.recommendation}</span>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>RFC / Padrão:</strong>{' '}
                  <span style={{ color: 'var(--text)' }}>{activeInfoAlgo.rfcStandard || activeInfoAlgo.citations.join(', ') || 'N/A'}</span>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-light)' }}>Observações Importantes:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text)' }}>
                    {activeInfoAlgo.notes || 'Nenhuma observação adicional fornecida.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dev Validation Panel */}
        <div style={{ maxWidth: '800px', margin: '24px auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="info-icon-btn"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px dashed var(--accent)',
                color: 'var(--accent-light)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'var(--mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="fa-solid fa-code" aria-hidden="true"></i>
              {showDevPanel ? 'Ocultar Painel de Validação' : 'Mostrar Painel de Validação de Vetores (Dev)'}
            </button>
          </div>

          {showDevPanel && (
            <div
              className="premium-card"
              style={{
                background: 'rgba(10,12,18,0.8)',
                border: '1px solid var(--accent)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left',
                fontFamily: 'var(--mono)',
                fontSize: '0.85rem'
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent-light)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <i className="fa-solid fa-flask" aria-hidden="true" style={{ marginRight: '8px' }}></i>Área Interna: Validação de Vetores de Teste Criptográficos
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Selecione um vetor de teste para carregar no campo de entrada de texto e validar se a saída computada pelo backend Rust/WASM confere com o padrão oficial.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'SHA-0 (Vazio)', input: '', algo: 'sha0', expected: 'f96cea198ad1dd5617ac084a3d92c6107708c0ef' },
                  { name: 'SHA-0 ("abc")', input: 'abc', algo: 'sha0', expected: '0164b8a914cd2a5e74c4f7ff082c4d97f1edf880' },
                  { name: 'SHA-0 (Fox)', input: 'The quick brown fox jumps over the lazy dog', algo: 'sha0', expected: 'b03b401ba92d77666221e843feebf8c561cea5f7' },
                  { name: 'Tiger (Fox)', input: 'The quick brown fox jumps over the lazy dog', algo: 'tiger', expected: '6d12a41e72e644f017b6f0e2f7b44c6285f06dd5d2c5b075' },
                  { name: 'Tiger2 (Fox)', input: 'The quick brown fox jumps over the lazy dog', algo: 'tiger2', expected: '976abff8062a2e9dcea3a1ace966ed9c19cb85558b4976d8' },
                  { name: 'RIPEMD-128 (Fox)', input: 'The quick brown fox jumps over the lazy dog', algo: 'ripemd128', expected: '3fa9b57f053c053fbe2735b2380db596' },
                  { name: 'GOST R 34.11-94 (Fox)', input: 'The quick brown fox jumps over the lazy dog', algo: 'gost94', expected: '9004294a361a508c586fe53d1f1b02746765e71b765472786e4770d565830a76' },
                  { name: 'Streebog-256 (Fox)', input: 'The quick brown fox jumps over the lazy dog', algo: 'streebog256', expected: '3e7dea7f2384b6c5a3d0e24aaa29c05e89ddd762145030ec22c71a6db8b2c1f4' }
                ].map((tc, idx) => {
                  const currentVal = hashes ? hashes[tc.algo] : '';
                  const isInputMatch = text === tc.input && activeTab === 'text';
                  const isHashMatch = currentVal?.toLowerCase() === tc.expected.toLowerCase();

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '10px',
                        borderRadius: '6px',
                        border: isInputMatch ? '1px solid var(--accent)' : '1px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '70%' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{tc.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Input: <code style={{ color: 'var(--accent-light)' }}>"{tc.input}"</code></span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Esperado: <code style={{ color: 'var(--muted-dark)' }}>{tc.expected}</code></span>
                        {isInputMatch && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Computado: <code style={{ color: isHashMatch ? '#10b981' : '#ef4444' }}>{currentVal || 'Calculando...'}</code></span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isInputMatch ? (
                          isHashMatch ? (
                            <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              <i className="fa-solid fa-check" aria-hidden="true" style={{ marginRight: '4px' }}></i>PASS
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              <i className="fa-solid fa-xmark" aria-hidden="true" style={{ marginRight: '4px' }}></i>FAIL
                            </span>
                          )
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>Não carregado</span>
                        )}

                        <button
                          onClick={() => {
                            setActiveTab('text');
                            setText(tc.input);
                          }}
                          style={{
                            background: 'var(--accent)',
                            border: 'none',
                            color: '#000',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                        >
                          Carregar e Validar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Informational Security Footer as requested */}
        <footer className="site-footer">
          <div className="security-summary-footer" style={{
            maxWidth: '800px',
            margin: '0 auto 24px auto',
            background: 'rgba(13,14,20,0.6)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Diretrizes de Segurança de Algoritmos de Hash:
            </p>
            <p style={{ margin: '0 0 6px 0', fontSize: '0.82rem', color: '#fca5a5' }}>
              <strong>Algoritmos inseguros (Evitar em novos sistemas):</strong> MD2, MD4, MD5, SHA-1, LM Hash e NTLM possuem vulnerabilidades críticas comprovadas (como colisões ativas e inversão rápida) e não oferecem garantia criptográfica. Checksums como Adler-32 e CRC-32 não são criptográficos e servem apenas para detectar corrupção de transmissão de rede ou disco física.
            </p>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#a7f3d0' }}>
              <strong>Algoritmos recomendados para novos projetos:</strong> SHA-256, SHA-512, SHA-3, BLAKE3 (hashing geral rápido e robusto), e Argon2id, bcrypt ou scrypt para armazenamento e segurança de senhas.
            </p>
          </div>

          <p>© {new Date().getFullYear()} RustHash | Local Hashing Sandbox. Powered by Vite + React + Rust WebAssembly.</p>
        </footer>
      </div>
    </>
  );
}
