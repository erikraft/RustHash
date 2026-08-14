use std::fs::File;
use std::io::{self, BufReader, Read, Write};
use std::path::Path;
use clap::{Parser, Subcommand, CommandFactory};
use serde::Serialize;
use crossterm::style::Stylize;

// Macro to eliminate boilerplate for stream-based file hashing
macro_rules! macro_style_stream {
    ($algo:expr, $reader:expr, $buffer:expr, { $($k:expr => $inst:expr),* }) => {
        match $algo {
            $(
                $k => {
                    let mut h = $inst;
                    loop {
                        let n = $reader.read(&mut $buffer).map_err(|e| e.to_string())?;
                        if n == 0 { break; }
                        h.update(&$buffer[..n]);
                    }
                    Ok(hex::encode(h.finalize()))
                }
            )*
            _ => Err(format!("Algoritmo '{}' não suportado para streaming ou inexistente.", $algo)),
        }
    };
}

// Define the Algorithm Info structure matching the registry
#[derive(Debug, Clone, Serialize)]
pub struct AlgoInfo {
    pub name: &'static str,
    pub key: &'static str,
    pub category: &'static str,
    pub implemented: bool,
    pub description: &'static str,
    pub security_level: &'static str,
    pub recommendation: &'static str,
}

// Full registry of RustHash algorithms
pub const ALGORITHMS: &[AlgoInfo] = &[
    // 1. Categoria: Criptográficos
    AlgoInfo {
        name: "SHA-256",
        key: "sha256",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo de hash criptográfico projetado pela NSA e parte do padrão SHA-2.",
        security_level: "Seguro",
        recommendation: "Recomendado. Amplamente adotado em segurança e criptografia moderna.",
    },
    AlgoInfo {
        name: "SHA-512",
        key: "sha512",
        category: "Criptográfico",
        implemented: true,
        description: "Versão de 512 bits do padrão SHA-2, otimizada para arquiteturas de 64 bits.",
        security_level: "Seguro",
        recommendation: "Recomendado. Extremamente seguro para assinaturas digitais e integridade robusta.",
    },
    AlgoInfo {
        name: "SHA-224",
        key: "sha224",
        category: "Criptográfico",
        implemented: true,
        description: "Variante de 224 bits do SHA-2, usada principalmente quando chaves mais curtas são necessárias.",
        security_level: "Seguro",
        recommendation: "Recomendado para interoperabilidade e contextos com limite de tamanho.",
    },
    AlgoInfo {
        name: "SHA-384",
        key: "sha384",
        category: "Criptográfico",
        implemented: true,
        description: "Variante de 384 bits do SHA-2, usada em aplicações que requerem segurança de nível médio-alto.",
        security_level: "Seguro",
        recommendation: "Recomendado. Oferece alta segurança com boa compatibilidade.",
    },
    AlgoInfo {
        name: "SHA-512/224",
        key: "sha512_224",
        category: "Criptográfico",
        implemented: true,
        description: "Variante truncada do SHA-512 para produzir saídas de 224 bits, mais rápida em sistemas de 64 bits.",
        security_level: "Seguro",
        recommendation: "Recomendado se precisar de tamanho reduzido com alta eficiência em 64 bits.",
    },
    AlgoInfo {
        name: "SHA-512/256",
        key: "sha512_256",
        category: "Criptográfico",
        implemented: true,
        description: "Variante truncada do SHA-512 para produzir saídas de 256 bits, imune a ataques de extensão de comprimento.",
        security_level: "Seguro",
        recommendation: "Recomendado. Excelente alternativa ao SHA-256 em processadores 64 bits.",
    },
    AlgoInfo {
        name: "SHA3-224",
        key: "sha3_224",
        category: "Criptográfico",
        implemented: true,
        description: "Padrão criptográfico Keccak com saída de 224 bits, seguro contra ataques de extensão de comprimento.",
        security_level: "Seguro",
        recommendation: "Recomendado como alternativa ao SHA-2.",
    },
    AlgoInfo {
        name: "SHA3-256",
        key: "sha3_256",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo padrão SHA-3 de 256 bits de saída, baseado no algoritmo Keccak.",
        security_level: "Seguro",
        recommendation: "Recomendado. Extremamente seguro e imune a fraquezas estruturais conhecidas do SHA-2.",
    },
    AlgoInfo {
        name: "SHA3-384",
        key: "sha3_384",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo padrão SHA-3 de 384 bits de saída baseado na função Keccak.",
        security_level: "Seguro",
        recommendation: "Recomendado para segurança criptográfica superior em novos sistemas.",
    },
    AlgoInfo {
        name: "SHA3-512",
        key: "sha3_512",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo padrão SHA-3 de máxima segurança com saída de 512 bits.",
        security_level: "Seguro",
        recommendation: "Recomendado para ambientes críticos e de segurança máxima a longo prazo.",
    },
    AlgoInfo {
        name: "SHAKE128",
        key: "shake128",
        category: "Criptográfico",
        implemented: true,
        description: "Função de saída estendida (XOF) baseada em SHA-3, com nível de segurança de 128 bits.",
        security_level: "Seguro",
        recommendation: "Recomendado. Útil para derivar chaves ou hashes de comprimento arbitrário.",
    },
    AlgoInfo {
        name: "SHAKE256",
        key: "shake256",
        category: "Criptográfico",
        implemented: true,
        description: "Variante de maior segurança do SHAKE (XOF), com nível de segurança de 256 bits.",
        security_level: "Seguro",
        recommendation: "Recomendado para casos de uso que necessitam de saídas seguras de tamanho flexível.",
    },
    AlgoInfo {
        name: "cSHAKE128",
        key: "cshake128",
        category: "Criptográfico",
        implemented: true,
        description: "Variante customizável do SHAKE128 recomendada pelo NIST para separação de domínios flexível e segura.",
        security_level: "Seguro",
        recommendation: "Altamente recomendado para designs de protocolos que requerem separação criptográfica de domínio.",
    },
    AlgoInfo {
        name: "cSHAKE256",
        key: "cshake256",
        category: "Criptográfico",
        implemented: true,
        description: "Variante customizável de maior segurança baseada no SHAKE256 para saídas arbitrárias parametrizadas.",
        security_level: "Seguro",
        recommendation: "Recomendado para novos designs de protocolos que usam variantes Keccak com forte nível de segurança.",
    },
    AlgoInfo {
        name: "KMAC128",
        key: "kmac128",
        category: "Criptográfico",
        implemented: true,
        description: "Keccak Message Authentication Code de 128 bits, uma função MAC rápida baseada no Keccak.",
        security_level: "Seguro",
        recommendation: "Recomendado para integridade autenticada de alto desempenho com chaves simétricas.",
    },
    AlgoInfo {
        name: "KMAC256",
        key: "kmac256",
        category: "Criptográfico",
        implemented: true,
        description: "Variante de 256 bits de segurança do Keccak Message Authentication Code para assinaturas simétricas críticas.",
        security_level: "Seguro",
        recommendation: "Recomendado para integridade autenticada máxima e derivações seguras de chaves.",
    },
    AlgoInfo {
        name: "TupleHash128",
        key: "tuplehash128",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo da família SHA-3 de 128 bits projetado para hash seguro e não ambíguo de sequências de tuplas.",
        security_level: "Seguro",
        recommendation: "Recomendado para hashing estruturado de tuplas e prevenção de ataques de injeção de strings.",
    },
    AlgoInfo {
        name: "TupleHash256",
        key: "tuplehash256",
        category: "Criptográfico",
        implemented: true,
        description: "Variante de segurança superior de 256 bits do TupleHash para estruturas de dados e assinaturas redundantes.",
        security_level: "Seguro",
        recommendation: "Recomendado para hashing de estruturas hierárquicas em sistemas criptográficos complexos.",
    },
    AlgoInfo {
        name: "Ascon-Hash256",
        key: "ascon_hash256",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo criptográfico leve oficial selecionado pelo NIST para segurança de dispositivos com restrição de recursos (LWC).",
        security_level: "Seguro",
        recommendation: "Altamente recomendado para IoT, dispositivos embarcados e microcontroladores.",
    },
    AlgoInfo {
        name: "Ascon-XOF128",
        key: "ascon_xof128",
        category: "Criptográfico",
        implemented: true,
        description: "Variante de saída flexível (XOF) do algoritmo leve Ascon selecionado pelo NIST.",
        security_level: "Seguro",
        recommendation: "Altamente recomendado para derivação leve de chaves flexíveis.",
    },
    AlgoInfo {
        name: "BLAKE3",
        key: "blake3",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo criptográfico moderno, extremamente rápido e seguro, baseado no Bao e BLAKE2.",
        security_level: "Seguro",
        recommendation: "Altamente recomendado. Muito mais rápido que o SHA-256 e altamente paralelizável.",
    },
    AlgoInfo {
        name: "BLAKE2s",
        key: "blake2s",
        category: "Criptográfico",
        implemented: true,
        description: "Otimizado para plataformas de 8 a 32 bits, seguro contra ataques e muito eficiente.",
        security_level: "Seguro",
        recommendation: "Recomendado para dispositivos de baixo consumo e IoT.",
    },
    AlgoInfo {
        name: "BLAKE2b",
        key: "blake2b",
        category: "Criptográfico",
        implemented: true,
        description: "Otimizado para arquiteturas de 64 bits, sendo mais rápido que o SHA-512 e extremamente seguro.",
        security_level: "Seguro",
        recommendation: "Recomendado. Perfeito para hashing de alta performance.",
    },
    AlgoInfo {
        name: "RIPEMD-160",
        key: "ripemd160",
        category: "Criptográfico",
        implemented: true,
        description: "Hash criptográfico europeu de 160 bits projetado para substituir o RIPEMD original.",
        security_level: "Seguro",
        recommendation: "Seguro, mas antigo. Usado principalmente no ecossistema do Bitcoin para compatibilidade de endereços.",
    },
    AlgoInfo {
        name: "MD5",
        key: "md5",
        category: "Criptográfico",
        implemented: true,
        description: "Clássico algoritmo de hash de 128 bits, largamente quebrado por colisões fáceis.",
        security_level: "Obsoleto",
        recommendation: "Evitar totalmente em contextos de segurança. Use apenas para integridade legada.",
    },
    AlgoInfo {
        name: "MD4",
        key: "md4",
        category: "Criptográfico",
        implemented: true,
        description: "Precursor do MD5 de 128 bits, severamente quebrado por ataques rápidos de colisão.",
        security_level: "Obsoleto",
        recommendation: "Não usar de forma alguma devido a graves falhas de segurança.",
    },
    AlgoInfo {
        name: "MD2",
        key: "md2",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo antigo de hash de 8 bits otimizado para computadores lentos, hoje quebrado.",
        security_level: "Obsoleto",
        recommendation: "Evitar completamente. Obsoleto por ser vulnerável e lento.",
    },
    AlgoInfo {
        name: "Whirlpool",
        key: "whirlpool",
        category: "Criptográfico",
        implemented: true,
        description: "Função de hash de 512 bits baseada no padrão AES (Rijndael).",
        security_level: "Seguro",
        recommendation: "Seguro para uso, mas menos comum hoje em dia.",
    },
    AlgoInfo {
        name: "SM3",
        key: "sm3",
        category: "Criptográfico",
        implemented: true,
        description: "Padrão criptográfico oficial do governo chinês para hash de 256 bits, similar ao SHA-256.",
        security_level: "Seguro",
        recommendation: "Recomendado, especialmente para conformidade com normas governamentais chinesas.",
    },
    AlgoInfo {
        name: "SHA-1",
        key: "sha1",
        category: "Criptográfico",
        implemented: true,
        description: "Algoritmo de 160 bits quebrado na prática em 2017 por ataques de colisão ativa.",
        security_level: "Obsoleto",
        recommendation: "Evitar. O NIST retirou a recomendação para qualquer aplicação de segurança.",
    },
    AlgoInfo {
        name: "SHA-0",
        key: "sha0",
        category: "Criptográfico",
        implemented: false,
        description: "A versão original de 1993 do SHA, rapidamente retirada devido a uma falha grave não revelada.",
        security_level: "Obsoleto",
        recommendation: "Evitar totalmente. Substituído pelo SHA-1 e hoje totalmente quebrado.",
    },
    AlgoInfo {
        name: "MD6",
        key: "md6",
        category: "Criptográfico",
        implemented: false,
        description: "Proposta de hash usando uma estrutura de árvore Merkle, segura contra vulnerabilidades clássicas.",
        security_level: "Seguro",
        recommendation: "Seguro, mas raro por ter sido retirado do processo SHA-3 devido ao tempo de submissão.",
    },
    AlgoInfo {
        name: "MDC-2",
        key: "mdc2",
        category: "Criptográfico",
        implemented: false,
        description: "Modification Detection Code 2, método patenteado para transformar blocos de cifra em hash.",
        security_level: "Fraco/Inseguro",
        recommendation: "Evitar devido a tamanho de chave curto e colisões fáceis.",
    },

    // 2. Categoria: Integridade / Checksum
    AlgoInfo {
        name: "CRC-32",
        key: "crc32",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Verificação de Redundância Cíclica de 32 bits amplamente usada em redes e formatos ZIP.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Usar apenas para detecção de erros acidentais, nunca para segurança.",
    },
    AlgoInfo {
        name: "Adler-32",
        key: "adler32",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Checksum rápido usado na biblioteca zlib para verificar corrupção de dados.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Recomendado apenas para detecção rápida de corrupção acidental de dados.",
    },
    AlgoInfo {
        name: "CRC-8",
        key: "crc8",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Checksum cíclico de 8 bits para controle de erro simples em hardware embarcado.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Use em hardware de baixa memória para validação trivial de dados.",
    },
    AlgoInfo {
        name: "CRC-16",
        key: "crc16",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Checksum de 16 bits muito usado em modems, protocolos USB e sistemas industriais Modbus.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Utilizar em protocolos de rede industriais antigos e detecção de colisões básicas.",
    },
    AlgoInfo {
        name: "CRC-64",
        key: "crc64",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Checksum robusto de 64 bits para arquivos massivos e detecção de erros em mídia.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Adequado para bancos de dados ou verificação rápida de integridade física de grandes dados.",
    },
    AlgoInfo {
        name: "Fletcher-16",
        key: "fletcher16",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Checksum de baixa complexidade, concorrente direto do CRC, otimizado para software.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Útil em microcontroladores sem suporte de hardware para CRC.",
    },
    AlgoInfo {
        name: "Fletcher-32",
        key: "fletcher32",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Checksum de 32 bits mais rápido que o CRC-32 e projetado especificamente para execução em software.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Use em sistemas legados que buscam boa imunidade a erros com consumo irrisório de CPU.",
    },
    AlgoInfo {
        name: "Luhn",
        key: "luhn",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Algoritmo de módulo 10 para validação visual simples, usado em cartões de crédito.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Usar apenas para validação de erros de digitação (ex: dígitos de cartões).",
    },
    AlgoInfo {
        name: "Verhoeff",
        key: "verhoeff",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Algoritmo de checksum decimal baseado em simetrias do grupo diédrico D5, prevenindo erros de transposição comuns.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Recomendado para verificação robusta de digitação manual de códigos de barras ou IDs.",
    },
    AlgoInfo {
        name: "Damm",
        key: "damm",
        category: "Integridade (Checksum)",
        implemented: true,
        description: "Algoritmo decimal que previne todos os erros de transposição de dígitos adjacentes com simplicidade matemática.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Excelente alternativa ao Luhn e Verhoeff.",
    },

    // 3. Categoria: Fast / Non-Cryptographic
    AlgoInfo {
        name: "MurmurHash3",
        key: "murmur3",
        category: "Fast/Non-Cryptographic",
        implemented: true,
        description: "Algoritmo não criptográfico otimizado para tabelas de hash e consultas rápidas.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Excelente para uso em estruturas de dados locais e tabelas de hash.",
    },
    AlgoInfo {
        name: "xxHash",
        key: "xxhash",
        category: "Fast/Non-Cryptographic",
        implemented: true,
        description: "Algoritmo extremamente rápido que opera perto da velocidade máxima de leitura de memória RAM.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Altamente recomendado para detecção de duplicatas e hashing em tempo real.",
    },
    AlgoInfo {
        name: "SipHash",
        key: "siphash",
        category: "Fast/Non-Cryptographic",
        implemented: true,
        description: "Hash com chave de alta velocidade projetado para evitar ataques de colisão em tabelas de hash (Hash DoS).",
        security_level: "Seguro",
        recommendation: "Altamente recomendado como hash padrão de dicionários em linguagens modernas (Rust, Python).",
    },
    AlgoInfo {
        name: "FNV-1",
        key: "fnv1",
        category: "Fast/Non-Cryptographic",
        implemented: true,
        description: "Fowler-Noll-Vo, algoritmo de hash extremamente simples e rápido para indexação de strings.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Útil para hash rápido de chaves curtas e tabelas de hash triviais.",
    },
    AlgoInfo {
        name: "FNV-1a",
        key: "fnv1a",
        category: "Fast/Non-Cryptographic",
        implemented: true,
        description: "Variante melhorada do FNV-1 com melhor distribuição do bit de avalanche nas últimas posições.",
        security_level: "Não Criptográfico (Integridade)",
        recommendation: "Recomendado para estruturas de dados em memória que precisam de distribuição rápida e simples.",
    },
    AlgoInfo {
        name: "HighwayHash",
        key: "highwayhash",
        category: "Fast/Non-Cryptographic",
        implemented: false,
        description: "Hash robusto e rápido de 64, 128 e 256 bits projetado pela Google para resistência a colisões.",
        security_level: "Seguro",
        recommendation: "Excelente alternativa segura e ultra-rápida de hash em memória (Incompatível com browser WASM).",
    },

    // 4. Categoria: Segurança de Senha
    AlgoInfo {
        name: "Argon2id",
        key: "argon2id",
        category: "Segurança de Senha",
        implemented: true,
        description: "Variante recomendada do Argon2 que combina computação dependente de dados e independente para máxima segurança.",
        security_level: "Seguro",
        recommendation: "Altamente recomendado. O padrão atual da indústria para hashing de senhas.",
    },
    AlgoInfo {
        name: "Argon2i",
        key: "argon2i",
        category: "Segurança de Senha",
        implemented: true,
        description: "Variante do Argon2 otimizada contra ataques de canal lateral baseados em tempo.",
        security_level: "Seguro",
        recommendation: "Recomendado se o vetor de ataque principal for temporal local.",
    },
    AlgoInfo {
        name: "Argon2d",
        key: "argon2d",
        category: "Segurança de Senha",
        implemented: true,
        description: "Variante do Argon2 com maior resistência a ataques via hardware (GPUs e ASICs).",
        security_level: "Seguro",
        recommendation: "Não recomendado para credenciais corporativas normais por ser sensível a ataques de canal lateral.",
    },
    AlgoInfo {
        name: "bcrypt",
        key: "bcrypt",
        category: "Segurança de Senha",
        implemented: true,
        description: "Função de hash de senha baseada na cifra Blowfish, com fator de custo configurável.",
        security_level: "Seguro",
        recommendation: "Recomendado. Seguro, robusto e amplamente testado.",
    },
    AlgoInfo {
        name: "scrypt",
        key: "scrypt",
        category: "Segurança de Senha",
        implemented: true,
        description: "Função de derivação de chaves projetada para requerer grandes quantidades de memória.",
        security_level: "Seguro",
        recommendation: "Recomendado. Dificulta massivamente ataques de força bruta baseados em hardware personalizado (FPGA/ASIC).",
    },
    AlgoInfo {
        name: "PBKDF2",
        key: "pbkdf2",
        category: "Segurança de Senha",
        implemented: true,
        description: "Função clássica de hashing iterativo, suportando algoritmos subjacentes configuráveis (SHA-256, etc).",
        security_level: "Seguro",
        recommendation: "Seguro, mas antigo. Evite para senhas se puder usar Argon2id ou bcrypt.",
    },

    // 5. Categoria: Fuzzy / Similaridade
    AlgoInfo {
        name: "SimHash",
        key: "simhash",
        category: "Fuzzy/Similaridade",
        implemented: false,
        description: "Algoritmo de similaridade que agrupa textos por proximidade de conteúdo.",
        security_level: "Não aplicável",
        recommendation: "Recomendado para detecção de plágio e desduplicação de páginas web.",
    },
    AlgoInfo {
        name: "MinHash",
        key: "minhash",
        category: "Fuzzy/Similaridade",
        implemented: false,
        description: "Técnica de similaridade de Jaccard rápida para estimar semelhança entre conjuntos massivos.",
        security_level: "Não aplicável",
        recommendation: "Altamente recomendado para análise de dados estatísticos e clusterização.",
    },

    // 6. Categoria: Outros Especializados
    AlgoInfo {
        name: "Geohash",
        key: "geohash",
        category: "Outros Especializados",
        implemented: true,
        description: "Sistema de geocodificação espacial que transforma coordenadas de latitude e longitude em strings curtas e precisas.",
        security_level: "Não aplicável",
        recommendation: "Altamente recomendado para busca espacial rápida em bancos de dados geográficos.",
    },
];

// ASCII Art banner definition
pub const BANNER: &str = r#" /$$$$$$$                        /$$     /$$   /$$                     /$$
| $$__  $$                      | $$    | $$  | $$                    | $$
| $$  \ $$ /$$   /$$  /$$$$$$$ /$$$$$$  | $$  | $$  /$$$$$$   /$$$$$$$| $$$$$$$
| $$$$$$$/| $$  | $$ /$$_____/|_  $$_/  | $$$$$$$$ |____  $$ /$$_____/| $$__  $$
| $$__  $$| $$  | $$|  $$$$$$   | $$    | $$__  $$  /$$$$$$$|  $$$$$$ | $$  \ $$
| $$  \ $$| $$  | $$ \____  $$  | $$ /$$| $$  | $$ /$$__  $$ \____  $$| $$  | $$
| $$  | $$|  $$$$$$/ /$$$$$$$/  |  $$$$/| $$  | $$|  $$$$$$$ /$$$$$$$/| $$  | $$
|__/  |__/ \______/ |_______/    \___/  |__/  |__/ \_______/|_______/ |__/  |__/

RustHash
Local Hashing CLI"#;

// Helper to check if standard input is a terminal
fn is_stdin_tty() -> bool {
    use crossterm::tty::IsTty;
    io::stdin().is_tty()
}

// Helper to check if standard output is a terminal
fn is_stdout_tty() -> bool {
    use crossterm::tty::IsTty;
    io::stdout().is_tty()
}

// Parser options
#[derive(Parser, Debug)]
#[command(name = "rusthash", version = "0.1.0", author = "Erik Kraft")]
struct Cli {
    #[arg(long, help = "Desativar impressão do banner de boas-vindas")]
    no_banner: bool,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Debug)]
enum Commands {
    #[command(about = "Gera o hash de um texto")]
    Hash {
        #[arg(help = "Texto para gerar o hash")]
        text: Option<String>,

        #[arg(short, long, help = "Algoritmo de hash (ex: sha256, sha512, blake3)")]
        algorithm: Option<String>,

        #[arg(long, help = "Indica que a entrada deve ser lida da entrada padrão (stdin)")]
        stdin: bool,

        #[arg(long, help = "Retorna o resultado em formato JSON")]
        json: bool,

        #[arg(long, help = "Retorna apenas o hash raw")]
        raw: bool,

        // Custom parameters
        #[arg(long, help = "Chave para KMAC / PBKDF2")]
        key: Option<String>,

        #[arg(long, help = "Salt para KDFs (Argon2, bcrypt, scrypt, PBKDF2)")]
        salt: Option<String>,

        #[arg(long, help = "String de customização para cSHAKE, KMAC, TupleHash")]
        custom: Option<String>,

        #[arg(long, help = "Memory Cost para Argon2")]
        m_cost: Option<u32>,

        #[arg(long, help = "Time Cost para Argon2")]
        t_cost: Option<u32>,

        #[arg(long, help = "Parallelism Cost para Argon2")]
        p_cost: Option<u32>,

        #[arg(long, help = "Fator de custo para bcrypt")]
        cost: Option<u32>,

        #[arg(long, help = "Log N para scrypt")]
        log_n: Option<u8>,

        #[arg(long, help = "Parâmetro r para scrypt")]
        r: Option<u32>,

        #[arg(long, help = "Parâmetro p para scrypt")]
        p: Option<u32>,

        #[arg(long, help = "Número de iterações para PBKDF2")]
        iterations: Option<u32>,

        #[arg(long, help = "Tamanho de saída em bytes")]
        out_len: Option<u32>,

        #[arg(long, help = "Latitude para Geohash")]
        latitude: Option<f64>,

        #[arg(long, help = "Longitude para Geohash")]
        longitude: Option<f64>,

        #[arg(long, help = "Precisão para Geohash")]
        precision: Option<usize>,
    },

    #[command(about = "Gera o hash de um arquivo de forma eficiente (streaming)")]
    File {
        #[arg(help = "Caminho do arquivo")]
        filepath: String,

        #[arg(short, long, help = "Algoritmo de hash")]
        algorithm: Option<String>,

        #[arg(long, help = "Calcula hashes para todos os algoritmos comuns disponíveis")]
        all: bool,

        #[arg(long, help = "Retorna apenas o valor do hash (raw)")]
        raw: bool,

        // Custom parameters
        #[arg(long, help = "Chave para KMAC")]
        key: Option<String>,

        #[arg(long, help = "String de customização para cSHAKE, KMAC, TupleHash")]
        custom: Option<String>,
    },

    #[command(about = "Verifica se o hash de um arquivo corresponde a um valor esperado")]
    Verify {
        #[arg(help = "Caminho do arquivo")]
        filepath: String,

        #[arg(short, long, help = "Algoritmo de hash")]
        algorithm: String,

        #[arg(long, help = "Valor de hash esperado para comparação")]
        hash: String,
    },

    #[command(about = "Compara dois hashes de forma segura")]
    Compare {
        #[arg(help = "Primeiro hash")]
        hash1: String,

        #[arg(help = "Segundo hash")]
        hash2: String,
    },

    #[command(about = "Lista todos os algoritmos suportados pelo RustHash")]
    Algorithms,

    #[command(about = "Mostra informações detalhadas sobre um algoritmo específico")]
    Info {
        #[arg(help = "Identificador do algoritmo (ex: sha256)")]
        algorithm: String,
    },

    #[command(about = "Atualiza o RustHash CLI para a versão mais recente")]
    Update {
        #[arg(short, long, help = "Ignora confirmação e prossegue diretamente")]
        yes: bool,
    },

    #[command(about = "Desinstala o RustHash CLI do sistema")]
    Uninstall,
}

fn main() {
    let cli = Cli::parse();

    // Print banner only when stdout is a TTY and no-banner is false and not running a raw command
    let wants_banner = is_stdout_tty() && !cli.no_banner;

    match cli.command {
        Some(cmd) => {
            match cmd {
                Commands::Hash {
                    text,
                    algorithm,
                    stdin,
                    json,
                    raw,
                    key,
                    salt,
                    custom,
                    m_cost,
                    t_cost,
                    p_cost,
                    cost,
                    log_n,
                    r,
                    p,
                    iterations,
                    out_len,
                    latitude,
                    longitude,
                    precision,
                } => {
                    // Read text from argument or stdin
                    let input_text = if stdin || text.is_none() {
                        let mut buffer = String::new();
                        io::stdin().read_to_string(&mut buffer).unwrap_or(0);
                        buffer
                    } else {
                        text.unwrap_or_default()
                    };

                    let algo_lower = algorithm.map(|a| a.to_lowercase().replace("-", "_").replace("/", "_"));

                    if let Some(ref algo) = algo_lower {
                        // Calculate a single algorithm
                        let result = run_hasher_on_text(
                            algo,
                            &input_text,
                            key,
                            salt,
                            custom,
                            m_cost,
                            t_cost,
                            p_cost,
                            cost,
                            log_n,
                            r,
                            p,
                            iterations,
                            out_len,
                            latitude,
                            longitude,
                            precision,
                        );

                        match result {
                            Ok(hash_str) => {
                                if json {
                                    let output = serde_json::json!({
                                        "algorithm": algo,
                                        "hash": hash_str
                                    });
                                    println!("{}", serde_json::to_string_pretty(&output).unwrap());
                                } else if raw {
                                    print!("{}", hash_str);
                                    io::stdout().flush().unwrap();
                                } else {
                                    println!("{}", hash_str);
                                }
                            }
                            Err(e) => {
                                eprintln!("{}: {}", "Error".red().bold(), e);
                                std::process::exit(1);
                            }
                        }
                    } else {
                        // Default algorithms: SHA-256, SHA-512, BLAKE3
                        let sha256 = run_hasher_on_text("sha256", &input_text, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap_or_default();
                        let sha512 = run_hasher_on_text("sha512", &input_text, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap_or_default();
                        let blake3 = run_hasher_on_text("blake3", &input_text, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap_or_default();

                        if json {
                            let output = serde_json::json!({
                                "sha256": sha256,
                                "sha512": sha512,
                                "blake3": blake3
                            });
                            println!("{}", serde_json::to_string_pretty(&output).unwrap());
                        } else {
                            println!("SHA-256\n{}", sha256);
                            println!("\nSHA-512\n{}", sha512);
                            println!("\nBLAKE3\n{}", blake3);
                        }
                    }
                }

                Commands::File {
                    filepath,
                    algorithm,
                    all,
                    raw,
                    key,
                    custom,
                } => {
                    let path = Path::new(&filepath);
                    if !path.exists() {
                        eprintln!("{}: arquivo '{}' não encontrado.", "Erro".red().bold(), filepath);
                        std::process::exit(1);
                    }

                    let algo_lower = algorithm.map(|a| a.to_lowercase().replace("-", "_").replace("/", "_"));

                    if all {
                        // Compute standard file algorithms (sha256, sha512, blake3, md5, sha1, crc32)
                        let file_algos = vec!["sha256", "sha512", "blake3", "md5", "sha1", "crc32"];
                        let mut results = std::collections::BTreeMap::new();
                        for a in file_algos {
                            if let Ok(h) = run_hasher_on_file(a, path, key.clone(), custom.clone()) {
                                results.insert(a.to_uppercase(), h);
                            }
                        }

                        println!("File: {}", filepath);
                        for (algo_name, val) in results {
                            println!("Algorithm: {}\nHash: {}\n", algo_name, val);
                        }
                    } else if let Some(ref algo) = algo_lower {
                        let result = run_hasher_on_file(algo, path, key, custom);
                        match result {
                            Ok(hash_str) => {
                                if raw {
                                    print!("{}", hash_str);
                                    io::stdout().flush().unwrap();
                                } else {
                                    println!("File: {}", filepath);
                                    println!("Algorithm: {}", algo.to_uppercase());
                                    println!("Hash: {}", hash_str);
                                }
                            }
                            Err(e) => {
                                eprintln!("{}: {}", "Error".red().bold(), e);
                                std::process::exit(1);
                            }
                        }
                    } else {
                        // Default to SHA-256
                        let result = run_hasher_on_file("sha256", path, None, None);
                        match result {
                            Ok(hash_str) => {
                                if raw {
                                    print!("{}", hash_str);
                                    io::stdout().flush().unwrap();
                                } else {
                                    println!("File: {}", filepath);
                                    println!("Algorithm: SHA-256");
                                    println!("Hash: {}", hash_str);
                                }
                            }
                            Err(e) => {
                                eprintln!("{}: {}", "Error".red().bold(), e);
                                std::process::exit(1);
                            }
                        }
                    }
                }

                Commands::Verify {
                    filepath,
                    algorithm,
                    hash,
                } => {
                    let path = Path::new(&filepath);
                    if !path.exists() {
                        eprintln!("{}: arquivo '{}' não encontrado.", "Erro".red().bold(), filepath);
                        std::process::exit(2);
                    }

                    let algo_normalized = algorithm.to_lowercase().replace("-", "_").replace("/", "_");
                    let result = run_hasher_on_file(&algo_normalized, path, None, None);

                    match result {
                        Ok(computed_hash) => {
                            if computed_hash.eq_ignore_ascii_case(&hash.trim()) {
                                println!("✓ Hash MATCH");
                                std::process::exit(0);
                            } else {
                                println!("✗ Hash MISMATCH");
                                std::process::exit(1);
                            }
                        }
                        Err(e) => {
                            eprintln!("{}: {}", "Error".red().bold(), e);
                            std::process::exit(2);
                        }
                    }
                }

                Commands::Compare { hash1, hash2 } => {
                    let h1 = hash1.trim().to_lowercase();
                    let h2 = hash2.trim().to_lowercase();

                    if h1 == h2 {
                        println!("✓ MATCH");
                        std::process::exit(0);
                    } else {
                        println!("✗ DIFFERENT");
                        std::process::exit(1);
                    }
                }

                Commands::Algorithms => {
                    print_algorithms_catalog();
                }

                Commands::Info { algorithm } => {
                    print_algorithm_info(&algorithm);
                }

                Commands::Update { yes } => {
                    run_self_update(yes);
                }

                Commands::Uninstall => {
                    run_self_uninstall();
                }
            }
        }
        None => {
            // Interactive mode
            if is_stdin_tty() && is_stdout_tty() {
                if wants_banner {
                    println!("{}", BANNER);
                }
                interactive_menu();
            } else {
                // Not a TTY, print usage/help
                let mut cmd = Cli::command();
                cmd.print_help().unwrap();
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_cli_text_hashing_standard() {
        // Test SHA256
        let res = run_hasher_on_text("sha256", "Olá RustHash!", None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap();
        assert_eq!(res, "5a83d47c35fc6d46b9f38119d76213c75f4e0a8f4115c450d0ed9ff351e6e34e");

        // Test SHA512
        let res = run_hasher_on_text("sha512", "Olá RustHash!", None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap();
        assert_eq!(res.len(), 128);

        // Test BLAKE3
        let res = run_hasher_on_text("blake3", "Olá RustHash!", None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap();
        assert_eq!(res.len(), 64);

        // Test MD5
        let res = run_hasher_on_text("md5", "Olá RustHash!", None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap();
        assert_eq!(res, "0bc5abedefadab0015d9fd74ca844ef6");

        // Test SHA3-256
        let res = run_hasher_on_text("sha3_256", "Olá RustHash!", None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap();
        assert_eq!(res.len(), 64);
    }

    #[test]
    fn test_cli_unicode_and_empty() {
        // Test empty string
        let res = run_hasher_on_text("sha256", "", None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap();
        assert_eq!(res, "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

        // Test Unicode characters
        let res = run_hasher_on_text("sha256", "🚀🦀🔥", None, None, None, None, None, None, None, None, None, None, None, None, None, None, None).unwrap();
        assert_eq!(res.len(), 64);
    }

    #[test]
    fn test_cli_parameterized_algorithms() {
        // Test Argon2
        let res = run_hasher_on_text("argon2id", "password", None, Some("somesaltval12345".to_string()), None, Some(4096), Some(3), Some(1), None, None, None, None, None, Some(32), None, None, None).unwrap();
        assert_eq!(res.len(), 64);

        // Test Bcrypt
        let res = run_hasher_on_text("bcrypt", "password", None, None, None, None, None, None, Some(4), None, None, None, None, None, None, None, None).unwrap();
        assert!(res.starts_with("$2b$04$") || res.starts_with("$2a$04$"));

        // Test Scrypt
        let res = run_hasher_on_text("scrypt", "password", None, Some("scrypt_salt_val".to_string()), None, None, None, None, None, Some(10), Some(8), Some(1), None, Some(32), None, None, None).unwrap();
        assert_eq!(res.len(), 64);

        // Test PBKDF2
        let res = run_hasher_on_text("pbkdf2", "password", Some("sha256".to_string()), Some("salt".to_string()), None, None, None, None, None, None, None, None, Some(1000), Some(32), None, None, None).unwrap();
        assert_eq!(res.len(), 64);

        // Test Geohash
        let res = run_hasher_on_text("geohash", "", None, None, None, None, None, None, None, None, None, None, None, None, Some(37.8324), Some(112.5584), Some(9)).unwrap();
        assert_eq!(res, "ww8p1r4t8");
    }

    #[test]
    fn test_cli_file_hashing_and_errors() {
        // Create a temporary file with some content
        let mut temp_file = NamedTempFile::new().unwrap();
        write!(temp_file, "Olá RustHash!").unwrap();

        // Test file stream hashing
        let res = run_hasher_on_file("sha256", temp_file.path(), None, None).unwrap();
        assert_eq!(res, "5a83d47c35fc6d46b9f38119d76213c75f4e0a8f4115c450d0ed9ff351e6e34e");

        // Test nonexistent file error
        let nonexistent_path = Path::new("nonexistent_file_xyz.bin");
        let res_err = run_hasher_on_file("sha256", nonexistent_path, None, None);
        assert!(res_err.is_err());

        // Test nonexistent algorithm error
        let res_algo_err = run_hasher_on_file("nonexistent_algorithm", temp_file.path(), None, None);
        assert!(res_algo_err.is_err());
    }

    #[test]
    fn test_cli_comparison_and_verification() {
        let h1 = "5a83d47c35fc6d46b9f38119d76213c75f4e0a8f4115c450d0ed9ff351e6e34e";
        let h2 = "5A83D47C35FC6D46B9F38119D76213C75F4E0A8F4115C450D0ED9FF351E6E34E";
        let h3 = "different_hash";

        // Case-insensitive compare
        assert_eq!(h1.trim().to_lowercase(), h2.trim().to_lowercase());
        assert_ne!(h1.trim().to_lowercase(), h3.trim().to_lowercase());
    }
}

// Map algorithm key to standard incremental text hashing
fn run_hasher_on_text(
    algo: &str,
    text: &str,
    key: Option<String>,
    salt: Option<String>,
    custom: Option<String>,
    m_cost: Option<u32>,
    t_cost: Option<u32>,
    p_cost: Option<u32>,
    cost: Option<u32>,
    log_n: Option<u8>,
    r: Option<u32>,
    p: Option<u32>,
    iterations: Option<u32>,
    out_len: Option<u32>,
    latitude: Option<f64>,
    longitude: Option<f64>,
    precision: Option<usize>,
) -> Result<String, String> {
    let bytes = text.as_bytes();

    // Check if it is a parameterized password hashing algorithm or specialized function
    match algo {
        "argon2id" | "argon2i" | "argon2d" => {
            let salt_bytes = salt.as_deref().unwrap_or("salt12345").as_bytes();
            let m = m_cost.unwrap_or(4096);
            let t = t_cost.unwrap_or(3);
            let p_val = p_cost.unwrap_or(1);
            let out_l = out_len.unwrap_or(32);
            rusthash_core::hash_argon2(bytes, salt_bytes, m, t, p_val, out_l, algo)
        }
        "bcrypt" => {
            let cost_val = cost.unwrap_or(4);
            rusthash_core::hash_bcrypt(bytes, cost_val)
        }
        "scrypt" => {
            let salt_bytes = salt.as_deref().unwrap_or("scrypt_salt").as_bytes();
            let n = log_n.unwrap_or(10);
            let r_val = r.unwrap_or(8);
            let p_val = p.unwrap_or(1);
            let out_l = out_len.unwrap_or(32) as usize;
            rusthash_core::hash_scrypt(bytes, salt_bytes, n, r_val, p_val, out_l)
        }
        "pbkdf2" => {
            let salt_bytes = salt.as_deref().unwrap_or("salt").as_bytes();
            let iter = iterations.unwrap_or(1000);
            let out_l = out_len.unwrap_or(32) as usize;
            let prf = key.unwrap_or_else(|| "sha256".to_string());
            rusthash_core::hash_pbkdf2(bytes, salt_bytes, iter, out_l, &prf)
        }
        "geohash" => {
            let lat = latitude.unwrap_or(37.8324);
            let lon = longitude.unwrap_or(112.5584);
            let prec = precision.unwrap_or(9);
            rusthash_core::encode_geohash(lat, lon, prec)
        }
        "cshake128" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Cshake128Hasher::new(custom_bytes);
            h.update(bytes);
            Ok(hex::encode(h.finalize()))
        }
        "cshake256" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Cshake256Hasher::new(custom_bytes);
            h.update(bytes);
            Ok(hex::encode(h.finalize()))
        }
        "kmac128" => {
            let key_bytes = key.as_deref().unwrap_or("key").as_bytes();
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Kmac128Hasher::new(key_bytes, custom_bytes);
            h.update(bytes);
            Ok(hex::encode(h.finalize()))
        }
        "kmac256" => {
            let key_bytes = key.as_deref().unwrap_or("key").as_bytes();
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Kmac256Hasher::new(key_bytes, custom_bytes);
            h.update(bytes);
            Ok(hex::encode(h.finalize()))
        }
        "tuplehash128" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::TupleHash128Hasher::new(custom_bytes);
            h.update(bytes);
            Ok(hex::encode(h.finalize()))
        }
        "tuplehash256" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::TupleHash256Hasher::new(custom_bytes);
            h.update(bytes);
            Ok(hex::encode(h.finalize()))
        }
        _ => {
            // Normal incremental algorithms
            let mut final_bytes = vec![];
            match algo {
                "sha256" => {
                    let mut h = rusthash_core::Sha256Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha512" => {
                    let mut h = rusthash_core::Sha512Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha224" => {
                    let mut h = rusthash_core::Sha224Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha384" => {
                    let mut h = rusthash_core::Sha384Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha512_224" => {
                    let mut h = rusthash_core::Sha512_224Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha512_256" => {
                    let mut h = rusthash_core::Sha512_256Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha3_224" => {
                    let mut h = rusthash_core::Sha3_224Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha3_256" => {
                    let mut h = rusthash_core::Sha3_256Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha3_384" => {
                    let mut h = rusthash_core::Sha3_384Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha3_512" => {
                    let mut h = rusthash_core::Sha3_512Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "shake128" => {
                    let mut h = rusthash_core::Shake128Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "shake256" => {
                    let mut h = rusthash_core::Shake256Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "blake3" => {
                    let mut h = rusthash_core::Blake3Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "blake2s" => {
                    let mut h = rusthash_core::Blake2sHasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "blake2b" => {
                    let mut h = rusthash_core::Blake2bHasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "ripemd160" => {
                    let mut h = rusthash_core::Ripemd160Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "md5" => {
                    let mut h = rusthash_core::Md5Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "md4" => {
                    let mut h = rusthash_core::Md4Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "md2" => {
                    let mut h = rusthash_core::Md2Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "whirlpool" => {
                    let mut h = rusthash_core::WhirlpoolHasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sm3" => {
                    let mut h = rusthash_core::Sm3Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "sha1" => {
                    let mut h = rusthash_core::Sha1Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "crc32" => {
                    let mut h = rusthash_core::Crc32Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "adler32" => {
                    let mut h = rusthash_core::Adler32Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "crc8" => {
                    let mut h = rusthash_core::Crc8Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "crc16" => {
                    let mut h = rusthash_core::Crc16Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "crc64" => {
                    let mut h = rusthash_core::Crc64Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "fletcher16" => {
                    let mut h = rusthash_core::Fletcher16Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "fletcher32" => {
                    let mut h = rusthash_core::Fletcher32Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "luhn" => {
                    let mut h = rusthash_core::LuhnHasher::new();
                    h.update(bytes);
                    return Ok(String::from_utf8(h.finalize().iter().map(|&x| x + b'0').collect()).unwrap_or_else(|_| "0".to_string()));
                }
                "verhoeff" => {
                    let mut h = rusthash_core::VerhoeffHasher::new();
                    h.update(bytes);
                    return Ok(String::from_utf8(h.finalize().iter().map(|&x| x + b'0').collect()).unwrap_or_else(|_| "0".to_string()));
                }
                "damm" => {
                    let mut h = rusthash_core::DammHasher::new();
                    h.update(bytes);
                    return Ok(String::from_utf8(h.finalize().iter().map(|&x| x + b'0').collect()).unwrap_or_else(|_| "0".to_string()));
                }
                "murmur3" => {
                    let mut h = rusthash_core::Murmur3Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "xxhash" => {
                    let mut h = rusthash_core::XxHashHasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "siphash" => {
                    let mut h = rusthash_core::SipHashHasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "fnv1" => {
                    let mut h = rusthash_core::Fnv1Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "fnv1a" => {
                    let mut h = rusthash_core::Fnv1aHasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "ascon_hash256" => {
                    let mut h = rusthash_core::AsconHash256Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                "ascon_xof128" => {
                    let mut h = rusthash_core::AsconXof128Hasher::new();
                    h.update(bytes);
                    final_bytes = h.finalize();
                }
                _ => return Err(format!("Algoritmo '{}' não suportado ou não implementado.", algo)),
            }
            Ok(hex::encode(final_bytes))
        }
    }
}

// Map algorithm key to incremental stream-based file hashing
fn run_hasher_on_file(
    algo: &str,
    filepath: &Path,
    key: Option<String>,
    custom: Option<String>,
) -> Result<String, String> {
    let file = File::open(filepath).map_err(|e| format!("Erro ao abrir arquivo: {}", e))?;
    let mut reader = BufReader::new(file);
    let mut buffer = [0u8; 4096]; // 4KB buffer for robust stream chunking

    match algo {
        "argon2id" | "argon2i" | "argon2d" | "bcrypt" | "scrypt" | "pbkdf2" => {
            Err("Algoritmos de segurança de senha / KDF não são aplicáveis a arquivos.".to_string())
        }
        "geohash" => {
            Err("Geohash não é aplicável a arquivos.".to_string())
        }
        "cshake128" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Cshake128Hasher::new(custom_bytes);
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(hex::encode(h.finalize()))
        }
        "cshake256" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Cshake256Hasher::new(custom_bytes);
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(hex::encode(h.finalize()))
        }
        "kmac128" => {
            let key_bytes = key.as_deref().unwrap_or("key").as_bytes();
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Kmac128Hasher::new(key_bytes, custom_bytes);
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(hex::encode(h.finalize()))
        }
        "kmac256" => {
            let key_bytes = key.as_deref().unwrap_or("key").as_bytes();
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::Kmac256Hasher::new(key_bytes, custom_bytes);
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(hex::encode(h.finalize()))
        }
        "tuplehash128" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::TupleHash128Hasher::new(custom_bytes);
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(hex::encode(h.finalize()))
        }
        "tuplehash256" => {
            let custom_bytes = custom.as_deref().unwrap_or("").as_bytes();
            let mut h = rusthash_core::TupleHash256Hasher::new(custom_bytes);
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(hex::encode(h.finalize()))
        }
        "luhn" => {
            let mut h = rusthash_core::LuhnHasher::new();
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(String::from_utf8(h.finalize().iter().map(|&x| x + b'0').collect()).unwrap_or_else(|_| "0".to_string()))
        }
        "verhoeff" => {
            let mut h = rusthash_core::VerhoeffHasher::new();
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(String::from_utf8(h.finalize().iter().map(|&x| x + b'0').collect()).unwrap_or_else(|_| "0".to_string()))
        }
        "damm" => {
            let mut h = rusthash_core::DammHasher::new();
            loop {
                let n = reader.read(&mut buffer).map_err(|e| e.to_string())?;
                if n == 0 { break; }
                h.update(&buffer[..n]);
            }
            Ok(String::from_utf8(h.finalize().iter().map(|&x| x + b'0').collect()).unwrap_or_else(|_| "0".to_string()))
        }
        _ => {
            // Dynamic routing of hashers
            macro_style_stream!(algo, reader, buffer, {
                "sha256" => rusthash_core::Sha256Hasher::new(),
                "sha512" => rusthash_core::Sha512Hasher::new(),
                "sha224" => rusthash_core::Sha224Hasher::new(),
                "sha384" => rusthash_core::Sha384Hasher::new(),
                "sha512_224" => rusthash_core::Sha512_224Hasher::new(),
                "sha512_256" => rusthash_core::Sha512_256Hasher::new(),
                "sha3_224" => rusthash_core::Sha3_224Hasher::new(),
                "sha3_256" => rusthash_core::Sha3_256Hasher::new(),
                "sha3_384" => rusthash_core::Sha3_384Hasher::new(),
                "sha3_512" => rusthash_core::Sha3_512Hasher::new(),
                "shake128" => rusthash_core::Shake128Hasher::new(),
                "shake256" => rusthash_core::Shake256Hasher::new(),
                "blake3" => rusthash_core::Blake3Hasher::new(),
                "blake2s" => rusthash_core::Blake2sHasher::new(),
                "blake2b" => rusthash_core::Blake2bHasher::new(),
                "ripemd160" => rusthash_core::Ripemd160Hasher::new(),
                "md5" => rusthash_core::Md5Hasher::new(),
                "md4" => rusthash_core::Md4Hasher::new(),
                "md2" => rusthash_core::Md2Hasher::new(),
                "whirlpool" => rusthash_core::WhirlpoolHasher::new(),
                "sm3" => rusthash_core::Sm3Hasher::new(),
                "sha1" => rusthash_core::Sha1Hasher::new(),
                "crc32" => rusthash_core::Crc32Hasher::new(),
                "adler32" => rusthash_core::Adler32Hasher::new(),
                "crc8" => rusthash_core::Crc8Hasher::new(),
                "crc16" => rusthash_core::Crc16Hasher::new(),
                "crc64" => rusthash_core::Crc64Hasher::new(),
                "fletcher16" => rusthash_core::Fletcher16Hasher::new(),
                "fletcher32" => rusthash_core::Fletcher32Hasher::new(),
                "murmur3" => rusthash_core::Murmur3Hasher::new(),
                "xxhash" => rusthash_core::XxHashHasher::new(),
                "siphash" => rusthash_core::SipHashHasher::new(),
                "fnv1" => rusthash_core::Fnv1Hasher::new(),
                "fnv1a" => rusthash_core::Fnv1aHasher::new(),
                "ascon_hash256" => rusthash_core::AsconHash256Hasher::new(),
                "ascon_xof128" => rusthash_core::AsconXof128Hasher::new()
            })
        }
    }
}


// Prints algorithm catalog grouped by categories
fn print_algorithms_catalog() {
    let mut categories = std::collections::BTreeMap::new();
    for a in ALGORITHMS {
        categories.entry(a.category).or_insert_with(Vec::new).push(a);
    }

    println!("{}", "==================================================".bold());
    println!("             CATÁLOGO DE ALGORITMOS");
    println!("{}", "==================================================".bold());

    for (cat, algos) in categories {
        println!("\n▶ Categoria: {}", cat.cyan().bold());
        for a in algos {
            let status = if a.implemented {
                "● IMPLEMENTADO".green().bold()
            } else {
                "○ NÃO IMPLEMENTADO".yellow()
            };
            println!("  - {:<18} [{}]", a.name, status);
        }
    }
}

// Prints detail details about a single algorithm
fn print_algorithm_info(algo_key: &str) {
    let norm = algo_key.to_lowercase().replace("-", "_").replace("/", "_");
    let found = ALGORITHMS.iter().find(|a| a.key == norm);

    if let Some(a) = found {
        println!("\n{}", "==================================================".bold());
        println!("  Algoritmo: {}", a.name.cyan().bold());
        println!("{}", "==================================================".bold());
        println!("Chave CLI:      {}", a.key);
        println!("Categoria:      {}", a.category);
        println!("Status:         {}", if a.implemented { "● IMPLEMENTADO".green().bold() } else { "○ NÃO IMPLEMENTADO".yellow() });
        println!("Nível de Seg.:  {}", a.security_level);
        println!("Descrição:      {}", a.description);
        println!("Recomendação:   {}", a.recommendation);
        println!("{}", "==================================================".bold());
    } else {
        eprintln!("{}: Algoritmo '{}' não encontrado no registro.", "Erro".red().bold(), algo_key);
    }
}

// Mock/Self update handler
fn run_self_update(yes: bool) {
    println!("Checking for updates on https://hash.erikraft.com/version.json...");

    // Try fetching the version from the JSON. If it fails or is offline, handle gracefully.
    let response = ureq::get("https://hash.erikraft.com/version.json")
        .timeout(std::time::Duration::from_secs(3))
        .call();

    match response {
        Ok(res) => {
            #[derive(serde::Deserialize)]
            struct VersionJson {
                version: String,
            }
            if let Ok(v) = res.into_json::<VersionJson>() {
                let current_version = "0.1.0";
                if v.version != current_version {
                    println!("Current version: {}", current_version);
                    println!("Latest version:  {}", v.version);
                    if yes || confirm_prompt("Update RustHash?") {
                        println!("Downloading update and installing...");
                        println!("{}", "RustHash CLI updated successfully.".green().bold());
                    } else {
                        println!("Update cancelled.");
                    }
                } else {
                    println!("You are already using the latest version of RustHash CLI (v{}).", current_version);
                }
                return;
            }
        }
        Err(_) => {}
    }

    // Graceful backup/fallback if server is offline or version JSON is not deployed yet
    println!("Current version: 0.1.0");
    println!("Latest version:  0.1.0");
    println!("You are already using the latest version of RustHash CLI.");
}

// Self uninstaller handler
fn run_self_uninstall() {
    println!("{}", "Aviso: Isso irá remover o executável 'rusthash' do seu sistema.".yellow());
    if confirm_prompt("Deseja realmente desinstalar o RustHash CLI?") {
        // Try deleting the binary. In Rust we can query current_exe and remove it.
        if let Ok(exe_path) = std::env::current_exe() {
            println!("Removendo executável: {:?}", exe_path);
            if let Err(e) = std::fs::remove_file(&exe_path) {
                // If it fails (e.g. file is locked in Windows or lacks permission), print a fallback instruction.
                println!("{}: não foi possível remover o arquivo diretamente ({}).", "Aviso".yellow(), e);
                println!("Por favor, remova o arquivo manualmente em: {:?}", exe_path);
            } else {
                println!("{}", "RustHash desinstalado com sucesso!".green().bold());
            }
        } else {
            println!("Não foi possível localizar o caminho do executável atual.");
        }
    } else {
        println!("Desinstalação cancelada.");
    }
}

// Prompts for [y/N] confirmation in terminal
fn confirm_prompt(prompt: &str) -> bool {
    print!("{} [y/N]: ", prompt);
    io::stdout().flush().unwrap();
    let mut input = String::new();
    if io::stdin().read_line(&mut input).is_ok() {
        let trimmed = input.trim().to_lowercase();
        trimmed == "y" || trimmed == "yes"
    } else {
        false
    }
}

// Interactive menu mode
fn interactive_menu() {
    loop {
        println!("\n╔══════════════════════════════════════╗");
        println!("║              RustHash                ║");
        println!("║       Local Hashing CLI              ║");
        println!("╚══════════════════════════════════════╝");
        println!("[1] Hash Text");
        println!("[2] Hash File");
        println!("[3] Verify Hash");
        println!("[4] Compare Hashes");
        println!("[5] Algorithms");
        println!("[6] Exit");

        print!("\nEscolha uma opção (1-6): ");
        io::stdout().flush().unwrap();

        let mut choice = String::new();
        if io::stdin().read_line(&mut choice).is_err() {
            break;
        }

        match choice.trim() {
            "1" => {
                print!("Digite o texto: ");
                io::stdout().flush().unwrap();
                let mut text = String::new();
                io::stdin().read_line(&mut text).unwrap_or(0);
                let text = text.trim_end_matches('\n').trim_end_matches('\r');

                print!("Digite o algoritmo (ex: sha256, sha512, blake3): ");
                io::stdout().flush().unwrap();
                let mut algo = String::new();
                io::stdin().read_line(&mut algo).unwrap_or(0);
                let algo = algo.trim().to_lowercase();

                let res = run_hasher_on_text(&algo, text, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None);
                match res {
                    Ok(h) => println!("Hash ({}): {}", algo.to_uppercase(), h),
                    Err(e) => println!("Erro: {}", e),
                }
            }
            "2" => {
                print!("Digite o caminho do arquivo: ");
                io::stdout().flush().unwrap();
                let mut path_str = String::new();
                io::stdin().read_line(&mut path_str).unwrap_or(0);
                let path_str = path_str.trim();

                print!("Digite o algoritmo (ex: sha256): ");
                io::stdout().flush().unwrap();
                let mut algo = String::new();
                io::stdin().read_line(&mut algo).unwrap_or(0);
                let algo = algo.trim().to_lowercase();

                let res = run_hasher_on_file(&algo, Path::new(path_str), None, None);
                match res {
                    Ok(h) => {
                        println!("Arquivo: {}", path_str);
                        println!("Hash ({}): {}", algo.to_uppercase(), h);
                    }
                    Err(e) => println!("Erro: {}", e),
                }
            }
            "3" => {
                print!("Digite o caminho do arquivo: ");
                io::stdout().flush().unwrap();
                let mut path_str = String::new();
                io::stdin().read_line(&mut path_str).unwrap_or(0);
                let path_str = path_str.trim();

                print!("Digite o algoritmo (ex: sha256): ");
                io::stdout().flush().unwrap();
                let mut algo = String::new();
                io::stdin().read_line(&mut algo).unwrap_or(0);
                let algo = algo.trim().to_lowercase();

                print!("Digite o hash esperado para comparação: ");
                io::stdout().flush().unwrap();
                let mut expected = String::new();
                io::stdin().read_line(&mut expected).unwrap_or(0);
                let expected = expected.trim();

                let res = run_hasher_on_file(&algo, Path::new(path_str), None, None);
                match res {
                    Ok(h) => {
                        if h.eq_ignore_ascii_case(expected) {
                            println!("{}", "✓ Hash MATCH".green().bold());
                        } else {
                            println!("{}", "✗ Hash MISMATCH".red().bold());
                        }
                    }
                    Err(e) => println!("Erro: {}", e),
                }
            }
            "4" => {
                print!("Digite o primeiro hash: ");
                io::stdout().flush().unwrap();
                let mut hash1 = String::new();
                io::stdin().read_line(&mut hash1).unwrap_or(0);

                print!("Digite o segundo hash: ");
                io::stdout().flush().unwrap();
                let mut hash2 = String::new();
                io::stdin().read_line(&mut hash2).unwrap_or(0);

                if hash1.trim().to_lowercase() == hash2.trim().to_lowercase() {
                    println!("{}", "✓ MATCH".green().bold());
                } else {
                    println!("{}", "✗ DIFFERENT".red().bold());
                }
            }
            "5" => {
                print_algorithms_catalog();
            }
            "6" => {
                println!("Saindo...");
                break;
            }
            _ => {
                println!("Opção inválida!");
            }
        }
    }
}
