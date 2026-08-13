import React, { useState, useEffect } from 'react';
import { detectBrowserCapabilities } from './nfcCapabilities';
import { NfcState, NfcOperationType, NfcTagMetadata } from './nfcControllerTypes';
import {
  WebNfcTransportAdapter,
  WebUsbTransportAdapter,
  WebHidTransportAdapter,
  WebSerialTransportAdapter,
  NfcTransportAdapter
} from './nfcTransports';

// WASM Imports
import init, { MifareClassic1k, MifareUltralight, MifareDesfire } from './pkg/hash_wasm';

export default function NfcSection() {
  const [capabilities, setCapabilities] = useState(detectBrowserCapabilities());
  const [selectedTransport, setSelectedTransport] = useState<string>('WebNFC');
  const [state, setState] = useState<NfcState>('Disconnected');
  const [tagInfo, setTagInfo] = useState<NfcTagMetadata | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read / Write Record Options
  const [recordType, setRecordType] = useState<'Text' | 'URI' | 'MIME' | 'Binary'>('Text');
  const [recordContent, setRecordContent] = useState<string>('');
  const [recordPreview, setRecordPreview] = useState<string>('');

  // MIFARE specific Options
  const [mifareKey, setMifareKey] = useState<string>('FFFFFFFFFFFF');
  const [selectedSector, setSelectedSector] = useState<number>(1);
  const [selectedBlock, setSelectedBlock] = useState<number>(4);
  const [blockData, setBlockData] = useState<string>('00000000000000000000000000000000');

  // Confirmation Modals
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [pendingOperation, setPendingOperation] = useState<{ type: NfcOperationType; execute: () => void } | null>(null);

  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    // Initializing WASM for any local MIFARE calculations/checks
    init().catch(console.error);
  }, []);

  // Update Record Preview dynamically
  useEffect(() => {
    if (recordType === 'Text') {
      setRecordPreview(`NDEF Text Record: "${recordContent}"`);
    } else if (recordType === 'URI') {
      setRecordPreview(`NDEF URI Record: ${recordContent}`);
    } else if (recordType === 'MIME') {
      setRecordPreview(`NDEF MIME Record (application/json): "${recordContent}"`);
    } else {
      setRecordPreview(`NDEF Binary Payload (hex): ${recordContent || '00'}`);
    }
  }, [recordType, recordContent]);

  // Translate errors into clear localized messages
  const getFriendlyError = (errCode: string): string => {
    switch (errCode) {
      case 'NFC_NOT_SUPPORTED':
        return 'WebNFC não é suportado pelo seu navegador/dispositivo. Tente usar o Chrome para Android!';
      case 'NFC_PERMISSION_DENIED':
        return 'Permissão para usar o leitor NFC foi negada pelo usuário.';
      case 'NFC_TIMEOUT':
        return 'Operação NFC expirou (tempo limite de 30s excedido).';
      case 'NFC_TAG_NOT_FOUND':
        return 'Nenhuma tag NFC foi encontrada no leitor.';
      case 'NFC_WRITE_FAILED':
        return 'Falha ao gravar os dados na tag NFC. Tente novamente.';
      case 'USB_NOT_SUPPORTED':
        return 'WebUSB/WebHID/WebSerial não é suportado neste navegador.';
      case 'USB_PERMISSION_DENIED':
        return 'Permissão para acessar o leitor USB foi negada.';
      case 'USB_DEVICE_NOT_FOUND':
        return 'Nenhum leitor NFC compatível via USB foi detectado.';
      case 'TAG_AUTH_FAILED':
        return 'Falha na autenticação do setor MIFARE Classic com a chave fornecida.';
      case 'TAG_READ_FAILED':
        return 'Erro ao ler os dados da tag NFC.';
      case 'TAG_WRITE_FAILED':
        return 'Erro ao gravar os dados na tag.';
      default:
        return `Erro inesperado: ${errCode}`;
    }
  };

  const getAdapter = (): NfcTransportAdapter => {
    if (selectedTransport === 'WebNFC') return new WebNfcTransportAdapter();
    if (selectedTransport === 'WebUSB') return new WebUsbTransportAdapter();
    if (selectedTransport === 'WebHID') return new WebHidTransportAdapter();
    return new WebSerialTransportAdapter();
  };

  const cancelActiveOperation = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setState('Cancelled');
    setErrorMsg(null);
  };

  const triggerScan = async () => {
    cancelActiveOperation();
    setErrorMsg(null);

    const controller = new AbortController();
    setAbortController(controller);
    setState('WaitingForTag');

    // 30s Timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      setState('Error');
      setErrorMsg(getFriendlyError('NFC_TIMEOUT'));
    }, 300); // Trigger timeout representation for non-supported or idle

    try {
      const adapter = getAdapter();
      clearTimeout(timeoutId);

      // Re-initialize timeout for real scan
      const realTimeout = setTimeout(() => {
        controller.abort();
      }, 30000);

      await adapter.scan((tag, ndefMessage) => {
        clearTimeout(realTimeout);
        setTagInfo(tag);
        setState('Connected');
      }, controller.signal);
    } catch (err: any) {
      setState('Error');
      setErrorMsg(getFriendlyError(err.message || 'TAG_READ_FAILED'));
    }
  };

  const requestConfirmation = (type: NfcOperationType, execute: () => void) => {
    setPendingOperation({ type, execute });
    setShowConfirmation(true);
  };

  const executePendingWrite = () => {
    if (pendingOperation) {
      setShowConfirmation(false);
      pendingOperation.execute();
      setPendingOperation(null);
    }
  };

  const triggerWrite = () => {
    const action = async () => {
      setErrorMsg(null);
      setState('Writing');

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const adapter = getAdapter();
        // Prepare NDEF payloads
        const records = [];
        if (recordType === 'Text') {
          records.push({ recordType: 'text', data: recordContent });
        } else if (recordType === 'URI') {
          records.push({ recordType: 'url', data: recordContent });
        } else if (recordType === 'MIME') {
          records.push({ recordType: 'mime', mediaType: 'application/json', data: recordContent });
        } else {
          records.push({ recordType: 'unknown', data: new TextEncoder().encode(recordContent) });
        }

        await adapter.write(records, controller.signal);
        setState('Success');
      } catch (err: any) {
        setState('Error');
        setErrorMsg(getFriendlyError(err.message || 'NFC_WRITE_FAILED'));
      }
    };

    requestConfirmation('Write', action);
  };

  const formatTag = () => {
    const action = async () => {
      setErrorMsg(null);
      setState('Writing');
      const controller = new AbortController();
      setAbortController(controller);

      try {
        const adapter = getAdapter();
        // Format means writing an empty NDEF record list
        await adapter.write([], controller.signal);
        setState('Success');
      } catch (err: any) {
        setState('Error');
        setErrorMsg(getFriendlyError('NFC_WRITE_FAILED'));
      }
    };

    requestConfirmation('Format', action);
  };

  const testMifareAuthentication = () => {
    if (!tagInfo) {
      setErrorMsg('Nenhuma tag detectada. Aproxime uma tag primeiro!');
      return;
    }
    try {
      setErrorMsg(null);
      // Instantiate backend WASM module representing the current card configuration
      const uidBytes = new TextEncoder().encode(tagInfo.uid);
      const classic = new MifareClassic1k(uidBytes);

      const keyBytes = new Uint8Array(
        mifareKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
      );

      const isAuthed = classic.authenticate(selectedSector, keyBytes, false);
      if (isAuthed) {
        setState('Connected');
        alert(`Sucesso! Setor MIFARE ${selectedSector} autenticado localmente com sucesso!`);
      }
    } catch (err: any) {
      setErrorMsg(getFriendlyError('TAG_AUTH_FAILED'));
    }
  };

  const testMifareWrite = () => {
    if (!tagInfo) {
      setErrorMsg('Nenhuma tag detectada. Aproxime uma tag primeiro!');
      return;
    }
    const action = () => {
      try {
        setErrorMsg(null);
        const uidBytes = new TextEncoder().encode(tagInfo.uid);
        const classic = new MifareClassic1k(uidBytes);

        const dataBytes = new Uint8Array(
          blockData.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
        );

        classic.write_block(selectedBlock, dataBytes);
        setState('Success');
        alert(`Sucesso! Bloco ${selectedBlock} gravado com sucesso!`);
      } catch (err: any) {
        setErrorMsg('Falha ao gravar bloco MIFARE Classic.');
      }
    };

    requestConfirmation('MifareClassicWrite', action);
  };

  return (
    <section className="premium-card nfc-section">
      <div className="explorer-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2 style={{ border: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-satellite-dish" aria-hidden="true"></i>Painel NFC / RFID
        </h2>
        <p style={{ margin: '8px 0 0 0' }}>
          Realize operações de leitura, gravação e formatação NDEF ou simulações seguras de cartões MIFARE localmente.
        </p>
      </div>

      {/* Capabilities Row */}
      <div className="capabilities-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div className={`badge-sec ${capabilities.secureContext ? 'badge-secure' : 'badge-weak'}`}>
          Secure Context: {capabilities.secureContext ? 'SIM' : 'NÃO'}
        </div>
        <div className={`badge-sec ${capabilities.webNfc ? 'badge-secure' : 'badge-na'}`}>
          WebNFC: {capabilities.webNfc ? 'DISPONÍVEL' : 'NÃO SUPORTADO'}
        </div>
        <div className={`badge-sec ${capabilities.webUsb ? 'badge-secure' : 'badge-na'}`}>
          WebUSB: {capabilities.webUsb ? 'DISPONÍVEL' : 'NÃO SUPORTADO'}
        </div>
        <div className={`badge-sec ${capabilities.webHid ? 'badge-secure' : 'badge-na'}`}>
          WebHID: {capabilities.webHid ? 'DISPONÍVEL' : 'NÃO SUPORTADO'}
        </div>
        <div className={`badge-sec ${capabilities.webSerial ? 'badge-secure' : 'badge-na'}`}>
          WebSerial: {capabilities.webSerial ? 'DISPONÍVEL' : 'NÃO SUPORTADO'}
        </div>
      </div>

      {/* Select Transport */}
      <div className="control-group" style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}>Escolha o Transporte de Comunicação:</label>
        <select
          value={selectedTransport}
          onChange={(e) => {
            setSelectedTransport(e.target.value);
            setTagInfo(null);
            setErrorMsg(null);
            setState('Disconnected');
          }}
          style={{
            width: '100%',
            background: 'rgba(3,3,5,0.7)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fff',
            fontFamily: 'var(--mono)'
          }}
        >
          <option value="WebNFC">Dispositivo Nativo (WebNFC Android / NDEF)</option>
          <option value="WebUSB">Leitor USB Externo (WebUSB Generic/ACR122U)</option>
          <option value="WebHID">Leitor USB HID (WebHID PCSC)</option>
          <option value="WebSerial">Leitor Serial (WebSerial PN532)</option>
        </select>
      </div>

      {/* Status Card */}
      <div
        className="status-card"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          fontFamily: 'var(--mono)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span>Status do Leitor:</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{state.toUpperCase()}</span>
        </div>

        {tagInfo && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
            <div><strong>UID da Tag:</strong> <span style={{ color: '#fff' }}>{tagInfo.uid}</span></div>
            <div><strong>Tipo da Tag:</strong> <span style={{ color: '#fff' }}>{tagInfo.type}</span></div>
            <div><strong>Tecnologia:</strong> <span style={{ color: '#fff' }}>{tagInfo.technology}</span></div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={triggerScan}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" style={{ marginRight: '8px' }}></i>Detectar / Escanear Tag
          </button>
          {(state === 'WaitingForTag' || state === 'Writing') && (
            <button className="btn btn-secondary" onClick={cancelActiveOperation}>
              <i className="fa-solid fa-circle-stop" aria-hidden="true" style={{ marginRight: '8px' }}></i>Cancelar Operação
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="error-msg" style={{ marginBottom: '20px' }}>
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Actions Section */}
      <div className="nfc-actions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        {/* NDEF WRITE SECTION */}
        <div
          className="action-block"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            background: 'rgba(3,3,5,0.3)',
            boxSizing: 'border-box',
            maxWidth: '100%'
          }}
        >
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>Gravação de Mensagem NDEF
          </h3>

          <div className="control-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Tipo de Registro:</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['Text', 'URI', 'MIME', 'Binary'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setRecordType(t)}
                  className={`filter-badge ${recordType === t ? 'active' : ''}`}
                  style={{
                    background: recordType === t ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'rgba(255,255,255,0.03)',
                    color: recordType === t ? '#050508' : 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Conteúdo do Registro:</label>
            <input
              type="text"
              value={recordContent}
              onChange={(e) => setRecordContent(e.target.value)}
              placeholder="Ex: 'Olá RustHash!' ou 'https://hash.erikraft.com/'"
              style={{
                width: '100%',
                background: 'rgba(3,3,5,0.7)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px 14px',
                color: '#fff',
                fontFamily: 'var(--mono)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div
            style={{
              background: 'rgba(0,0,0,0.15)',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '14px',
              fontSize: '0.8rem',
              color: 'var(--muted)',
              fontFamily: 'var(--mono)',
              wordBreak: 'break-all',
              overflowWrap: 'anywhere'
            }}
          >
            <strong>Pré-visualização do Registro:</strong>
            <div style={{ marginTop: '4px', color: '#fff' }}>{recordPreview}</div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={triggerWrite}>
              <i className="fa-solid fa-floppy-disk" aria-hidden="true" style={{ marginRight: '8px' }}></i>Gravar NDEF na Tag
            </button>
            <button className="btn btn-secondary" onClick={formatTag}>
              <i className="fa-solid fa-broom" aria-hidden="true" style={{ marginRight: '8px' }}></i>Formatar Tag
            </button>
          </div>
        </div>

        {/* MIFARE CLASSIC SECURE CONFIGURATOR */}
        <div
          className="action-block"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            background: 'rgba(3,3,5,0.3)',
            boxSizing: 'border-box',
            maxWidth: '100%'
          }}
        >
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-lock" aria-hidden="true"></i>Configurações Seguras MIFARE Classic
          </h3>

          <div
            style={{
              background: 'rgba(252,165,165,0.1)',
              border: '1px solid rgba(252,165,165,0.2)',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: '#fca5a5',
              lineHeight: '1.45'
            }}
          >
            <strong><i className="fa-solid fa-triangle-exclamation" aria-hidden="true" style={{ marginRight: '6px' }}></i>ALERTA DE SEGURANÇA:</strong> MIFARE Classic usa o algoritmo de criptografia proprietário Crypto1, que possui vulnerabilidades criptográficas conhecidas de alta criticidade e não deve ser considerado adequado para novas aplicações de alta segurança ou transações financeiras.
          </div>

          <div className="mifare-grid">
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Fator de Autenticação (Chave de 6 Bytes):</label>
              <input
                type="text"
                value={mifareKey}
                onChange={(e) => setMifareKey(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  background: 'rgba(3,3,5,0.7)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontFamily: 'var(--mono)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Setor a Autenticar:</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(3,3,5,0.7)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontFamily: 'var(--mono)',
                  boxSizing: 'border-box',
                  height: '46px'
                }}
              >
                {Array.from({ length: 16 }, (_, i) => (
                  <option key={i} value={i}>Setor {i}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mifare-grid">
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Bloco de Dados (0-63):</label>
              <input
                type="number"
                min="0"
                max="63"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(3,3,5,0.7)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontFamily: 'var(--mono)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Dados do Bloco (Hex 16 Bytes):</label>
              <input
                type="text"
                value={blockData}
                onChange={(e) => setBlockData(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  background: 'rgba(3,3,5,0.7)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontFamily: 'var(--mono)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={testMifareAuthentication}>
              <i className="fa-solid fa-key" aria-hidden="true" style={{ marginRight: '8px' }}></i>Autenticar Setor
            </button>
            <button className="btn btn-secondary" onClick={testMifareWrite}>
              <i className="fa-solid fa-floppy-disk" aria-hidden="true" style={{ marginRight: '8px' }}></i>Gravar Bloco MIFARE
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmation && (
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
        >
          <div
            className="modal-content"
            style={{
              background: 'var(--bg-panel-solid)',
              border: '1px solid var(--accent-light)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: 'var(--shadow), var(--glow-shadow)',
              fontFamily: 'var(--mono)',
              color: '#fff'
            }}
          >
            <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '12px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>Confirmar Operação de Gravação
            </h3>

            <p style={{ lineHeight: 1.6, fontSize: '0.9rem' }}>
              Esta operação irá alterar o conteúdo físico ou lógico da tag NFC selecionada.
            </p>

            <div
              style={{
                background: 'rgba(0,0,0,0.15)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '20px',
                fontSize: '0.85rem'
              }}
            >
              <div><strong>UID Detectado:</strong> {tagInfo?.uid || 'N/A'}</div>
              <div><strong>Fator de Destino:</strong> {selectedTransport}</div>
            </div>

            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '24px' }}>
              Deseja continuar com a gravação destrutiva de dados?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingOperation(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={executePendingWrite} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                Confirmar e Gravar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
