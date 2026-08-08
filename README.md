# Hash Generator

Aplicação web para gerar e comparar hashes localmente usando Rust + WebAssembly.

Esta é a estrutura inicial do projeto com um crate Rust exposando APIs via `wasm-bindgen` e um frontend minimal em React + TypeScript. O principal objetivo é que todo o processamento ocorra localmente no navegador (privacy-first).

Aviso: 🔒 Your data never leaves your browser.

Desenvolvimento rápido:

Rust:

```bash
cd rust
cargo test
```

Frontend (exemplo minimal):

```bash
cd frontend
npm install
npm run dev
```

Próximos passos: integrar o build do Wasm com o frontend, adicionar Web Worker e streaming incremental.
Starting to do it
