```text
______          _   _   _           _     
| ___ \        | | | | | |         | |    
| |_/ /   _ ___| |_| |_| | __ _ ___| |__  
|    / | | / __| __|  _  |/ _` / __| '_ \ 
| |\ \ |_| \__ \ |_| | | | (_| \__ \ | | |
\_| \_\__,_|___/\__\_| |_/\__,_|___/_| |_|
                                          
                                          
```

# 🦀 RustHash

Uma aplicação web moderna e de alta performance para gerar e comparar hashes localmente usando **Rust + WebAssembly** e **Web Workers** no navegador (privacy-first).

Todo o processamento de hashing acontece 100% localmente no navegador por meio de streaming incremental, garantindo que mesmo arquivos extremamente grandes possam ser processados de forma rápida, segura e sem estourar o limite de memória do navegador.

Aviso: 🔒 **Your data never leaves your browser.**

---

## 🏗️ Arquitetura

O RustHash foi desenhado com uma separação clara entre a interface de usuário reativa do frontend e a execução pesada dos algoritmos criptográficos:

1. **Frontend (Vite + React + TypeScript):** Fornece um painel intuitivo e altamente interativo para entrada de texto, envio de arquivos com suporte a Drag & Drop, controle dinâmico de parâmetros de algoritmos e comparação/match de correspondências.
2. **Web Workers (`frontend/src/hash.worker.ts`):** Roda em uma thread separada em segundo plano para que as operações intensivas de computação não bloqueiem a renderização ou a interação do usuário.
3. **Rust + WebAssembly (`rust/src/lib.rs`):** Todo o processamento criptográfico, cálculo de somas de verificação, KDFs e codificações é executado via WASM usando crates oficiais de nível de produção mantidos pelo RustCrypto e pela comunidade Rust.

---

## ⚙️ Catálogo e Status dos Algoritmos

Aqui está o mapeamento detalhado dos algoritmos suportados pelo RustHash:

| Algoritmo | Categoria | Status | WASM | Entrada de Texto | Envio de Arquivo | Suporte a Streaming | Parâmetros Customizados |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **SHA-256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA-512** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA-224** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA-384** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA-512/224** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA-512/256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA3-224** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA3-256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA3-384** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA3-512** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHAKE128** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHAKE256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **cSHAKE128** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Customization String |
| **cSHAKE256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Customization String |
| **KMAC128** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Key, Customization |
| **KMAC256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Key, Customization |
| **TupleHash128** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Customization String |
| **TupleHash256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Customization String |
| **Ascon-Hash256** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Ascon-XOF128** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **BLAKE3** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **BLAKE2s** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **BLAKE2b** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **RIPEMD-160** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **MD5** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **MD4** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **MD2** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Whirlpool** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SM3** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SHA-1** | Criptográfico | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **CRC-32** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Adler-32** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **CRC-8** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **CRC-16** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **CRC-64** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Fletcher-16** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Fletcher-32** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Luhn** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Verhoeff** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Damm** | Checksum | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **MurmurHash3** | Fast Hash | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **xxHash** | Fast Hash | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **SipHash** | Fast Hash | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **FNV-1 / FNV-1a**| Fast Hash | ● IMPLEMENTADO | Sim | Sim | Sim | Sim | Não (Padrão) |
| **Argon2id** | KDF / Senha | ● IMPLEMENTADO | Sim | Sim | Não | Não | Salt, M-Cost, T-Cost, P-Cost, Out Len |
| **Argon2i** | KDF / Senha | ● IMPLEMENTADO | Sim | Sim | Não | Não | Salt, M-Cost, T-Cost, P-Cost, Out Len |
| **Argon2d** | KDF / Senha | ● IMPLEMENTADO | Sim | Sim | Não | Não | Salt, M-Cost, T-Cost, P-Cost, Out Len |
| **bcrypt** | KDF / Senha | ● IMPLEMENTADO | Sim | Sim | Não | Não | Cost factor |
| **scrypt** | KDF / Senha | ● IMPLEMENTADO | Sim | Sim | Não | Não | Salt, N, r, p, Out Len |
| **PBKDF2** | KDF / Senha | ● IMPLEMENTADO | Sim | Sim | Não | Não | Salt, Iterations, Out Len, PRF selection |
| **Geohash** | Geoespectral | ● IMPLEMENTADO | Sim | Sim | Não | Não | Latitude, Longitude, Precision |

---

### 🚫 Algoritmos Não Implementados (Fins Informativos)

Alguns algoritmos permanecem estritamente informativos devido a restrições técnicas inerentes ao ambiente do navegador ou limitações de design criptográfico:

- **ParallelHash:** Incompatível com o modelo de execução monothread ideal para Web Workers em navegadores, pois paralelização de CPU requer multithreading não padronizado na Web.
- **SHA-0, MDC-2, Snefru, N-Hash, Tiger, Tiger2:** Totalmente quebrados historicamente, considerados obsoletos e sem implementação/crates seguros mantidos em Rust.
- **MD6, BLAKE, BLAKE2X:** Substituídos por versões maduras (BLAKE2, BLAKE3, SHA-3) e sem manutenção ou empacotamento estável para browser WASM.
- **Streebog, Kupyna, HAS-160, HAVAL, LSH:** Falta de crates Rust amplamente adotados ou auditados.
- **HighwayHash, FarmHash, T1ha:** Altamente otimizados para instruções vetorizadas de assembly nativo de hardware (como SSE4/AVX), sendo incompatíveis ou lentos quando compilados para a sandbox restrita do WebAssembly.
- **Nilsimsa, TLSH, ssdeep, SimHash, MinHash:** Algoritmos fuzzy e de similaridade estatística sem especificação de hash tradicional ou que requerem bindings nativos pesados de C.
- **BuzHash, Pearson:** Fórmulas matemáticas legadas sem padrão ou representação binária unificada de hash.
- **TLS-hash / TLS-hash (Primitivas):** Mecanismos integrados proprietários do protocolo TLS, não concebidos como algoritmos de hash geral autônomos.

---

## 🔒 Diretrizes de Segurança

- **Evitar em Novos Sistemas (Totalmente Inseguros):** MD2, MD4, MD5, SHA-1, LM Hash e NTLM possuem vulnerabilidades matemáticas graves comprovadas (colisões de baixo custo e inversão rápida) e não oferecem proteção contra adversários modernos.
- **Não-Criptográficos:** Somas de verificação (CRC-8/16/32/64, Adler-32, Fletcher-16/32) e fórmulas de digitação (Luhn, Verhoeff, Damm) servem apenas para detectar corrupção de transmissão de dados acidental (física), nunca para blindagem contra ataques maliciosos ou hash de credenciais.
- **Recomendados:** Para hashing geral e integridade de arquivos, utilize **SHA-256, SHA-512, SHA-3 ou BLAKE3** (extremamente rápido e moderno). Para proteção de credenciais e senhas, utilize **Argon2id, bcrypt ou scrypt**.

---

## 🚀 Desenvolvimento

Para rodar o projeto localmente em modo de desenvolvimento, você só precisa ter o **Node.js** e o **Rust + wasm-pack** instalados em sua máquina.

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

Isso compilará automaticamente o código Rust para WebAssembly e iniciará o servidor de desenvolvimento do Vite.

---

## 📦 Build de Produção

Para gerar uma build otimizada de produção com todos os recursos compilados:

```bash
npm run build
```

Este comando executa o pipeline completo:
1. Compila o código Rust para WebAssembly com otimizações (`wasm-opt`).
2. Gera os bindings de JavaScript e as declarações de tipo do TypeScript.
3. Compila e minifica o frontend React + TS para o diretório final de produção `/frontend/dist` (incluindo o Web Worker e os arquivos `.wasm` otimizados).

Você pode visualizar a build de produção localmente usando:
```bash
npm run --prefix frontend preview
```
