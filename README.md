# RustHash 🦀⚡

Uma aplicação web moderna e de alta performance para gerar e comparar hashes localmente usando **Rust + WebAssembly** e **Web Workers** no navegador (privacy-first).

Todo o processamento de hashing acontece 100% localmente no navegador por meio de streaming incremental, garantindo que mesmo arquivos extremamente grandes possam ser processados de forma rápida, segura e sem estourar o limite de memória do navegador.

Aviso: 🔒 **Your data never leaves your browser.**

---

## Recursos

- **Processamento 100% Local (Privacy-First):** Seus arquivos ou strings nunca são enviados para um servidor ou backend.
- **Arquitetura Baseada em Web Workers:** O hashing de arquivos é executado em segundo plano em uma thread separada para manter a interface do usuário fluida e responsiva.
- **Streaming Incremental com Rust & Wasm:** Suporta hashing eficiente em chunks de arquivos de qualquer tamanho (incluindo múltiplos gigabytes).
- **Algoritmos Suportados:** SHA-256, SHA-512, MD5 e BLAKE3.
- **UI Moderna:** Interface elegante com seções dedicadas para Texto e Upload de Arquivos (com suporte a Drag & Drop), indicadores de progresso real-time e botões para copiar com feedback de sucesso.

---

## Development

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

## Production Build

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

---

## Deploy to Vercel

O projeto foi configurado com total compatibilidade para ser publicado no **Vercel** usando fluxo de build automático e servidor de arquivos estáticos.

### Como funciona no Vercel:

- **Conexão Direta ao GitHub:** Conecte este repositório diretamente ao seu projeto no painel do Vercel.
- **Compilado pelo Vercel:** O Vercel detecta a configuração e executa o comando `npm run build`, que instala o compilador de Rust e `wasm-pack` para gerar o WebAssembly durante a etapa de build.
- **Hospedagem Estática de Alta Performance:** O Vercel hospeda e serve todos os arquivos compilados (HTML, CSS, JS e `.wasm`) como ativos estáticos otimizados.
- **Hashing no Navegador:** Não há dependência de um backend de Rust rodando no Vercel Serverless. Todo o processamento de hashing é executado de forma privada no navegador do cliente.

### Configurações de Deploy no Vercel Dashboard (Auto-detectado por `vercel.json`):

- **Framework Preset:** `Vite` (ou `Other`)
- **Build Command:** `npm run build`
- **Output Directory:** `frontend/dist`
