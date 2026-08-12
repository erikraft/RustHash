export interface HashAlgorithmInfo {
  name: string;
  category: 'Criptográfico' | 'Integridade (Checksum)' | 'Fast/Non-Cryptographic' | 'Segurança de Senha' | 'Fuzzy/Similaridade' | 'Outros Especializados';
  description: string;
  securityLevel: 'Seguro' | 'Fraco/Inseguro' | 'Obsoleto' | 'Não Criptográfico (Integridade)' | 'Não aplicável';
  recommendation: string;
  implemented: boolean;
  citations: string[];
  key?: string;
  unimplementedReason?: string; // Reason why it remained unimplemented/informational
}

export const hashAlgorithms: HashAlgorithmInfo[] = [
  // 1. Categoria: Criptográficos
  {
    name: 'SHA-256',
    category: 'Criptográfico',
    description: 'Algoritmo de hash criptográfico projetado pela NSA e parte do padrão SHA-2.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Amplamente adotado em segurança e criptografia moderna.',
    implemented: true,
    citations: ['NIST FIPS 180-4'],
    key: 'sha256'
  },
  {
    name: 'SHA-512',
    category: 'Criptográfico',
    description: 'Versão de 512 bits do padrão SHA-2, otimizada para arquiteturas de 64 bits.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Extremamente seguro para assinaturas digitais e integridade robusta.',
    implemented: true,
    citations: ['NIST FIPS 180-4'],
    key: 'sha512'
  },
  {
    name: 'SHA-224',
    category: 'Criptográfico',
    description: 'Variante de 224 bits do SHA-2, usada principalmente quando chaves mais curtas são necessárias.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para interoperabilidade e contextos com limite de tamanho.',
    implemented: true,
    citations: ['NIST FIPS 180-4'],
    key: 'sha224'
  },
  {
    name: 'SHA-384',
    category: 'Criptográfico',
    description: 'Variante de 384 bits do SHA-2, usada em aplicações que requerem segurança de nível médio-alto.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Oferece alta segurança com boa compatibilidade.',
    implemented: true,
    citations: ['NIST FIPS 180-4'],
    key: 'sha384'
  },
  {
    name: 'SHA-512/224',
    category: 'Criptográfico',
    description: 'Variante truncada do SHA-512 para produzir saídas de 224 bits, mais rápida em sistemas de 64 bits.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado se precisar de tamanho reduzido com alta eficiência em 64 bits.',
    implemented: true,
    citations: ['NIST FIPS 180-4'],
    key: 'sha512_224'
  },
  {
    name: 'SHA-512/256',
    category: 'Criptográfico',
    description: 'Variante truncada do SHA-512 para produzir saídas de 256 bits, imune a ataques de extensão de comprimento.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Excelente alternativa ao SHA-256 em processadores 64 bits.',
    implemented: true,
    citations: ['NIST FIPS 180-4'],
    key: 'sha512_256'
  },
  {
    name: 'SHA3-224',
    category: 'Criptográfico',
    description: 'Padrão criptográfico Keccak com saída de 224 bits, seguro contra ataques de extensão de comprimento.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado como alternativa ao SHA-2.',
    implemented: true,
    citations: ['NIST FIPS 202'],
    key: 'sha3_224'
  },
  {
    name: 'SHA3-256',
    category: 'Criptográfico',
    description: 'Algoritmo padrão SHA-3 de 256 bits de saída, baseado no algoritmo Keccak.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Extremamente seguro e imune a fraquezas estruturais conhecidas do SHA-2.',
    implemented: true,
    citations: ['NIST FIPS 202'],
    key: 'sha3_256'
  },
  {
    name: 'SHA3-384',
    category: 'Criptográfico',
    description: 'Algoritmo padrão SHA-3 de 384 bits de saída baseado na função Keccak.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para segurança criptográfica superior em novos sistemas.',
    implemented: true,
    citations: ['NIST FIPS 202'],
    key: 'sha3_384'
  },
  {
    name: 'SHA3-512',
    category: 'Criptográfico',
    description: 'Algoritmo padrão SHA-3 de máxima segurança com saída de 512 bits.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para ambientes críticos e de segurança máxima a longo prazo.',
    implemented: true,
    citations: ['NIST FIPS 202'],
    key: 'sha3_512'
  },
  {
    name: 'SHAKE128',
    category: 'Criptográfico',
    description: 'Função de saída estendida (XOF) baseada em SHA-3, com nível de segurança de 128 bits.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Útil para derivar chaves ou hashes de comprimento arbitrário.',
    implemented: true,
    citations: ['NIST FIPS 202'],
    key: 'shake128'
  },
  {
    name: 'SHAKE256',
    category: 'Criptográfico',
    description: 'Variante de maior segurança do SHAKE (XOF), com nível de segurança de 256 bits.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para casos de uso que necessitam de saídas seguras de tamanho flexível.',
    implemented: true,
    citations: ['NIST FIPS 202'],
    key: 'shake256'
  },
  {
    name: 'cSHAKE128',
    category: 'Criptográfico',
    description: 'Variante customizável do SHAKE128 recomendada pelo NIST para separação de domínios flexível e segura.',
    securityLevel: 'Seguro',
    recommendation: 'Altamente recomendado para designs de protocolos que requerem separação criptográfica de domínio.',
    implemented: true,
    citations: ['NIST SP 800-185'],
    key: 'cshake128'
  },
  {
    name: 'cSHAKE256',
    category: 'Criptográfico',
    description: 'Variante customizável de maior segurança baseada no SHAKE256 para saídas arbitrárias parametrizadas.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para novos designs de protocolos que usam variantes Keccak com forte nível de segurança.',
    implemented: true,
    citations: ['NIST SP 800-185'],
    key: 'cshake256'
  },
  {
    name: 'KMAC128',
    category: 'Criptográfico',
    description: 'Keccak Message Authentication Code de 128 bits, uma função MAC rápida baseada no Keccak.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para integridade autenticada de alto desempenho com chaves simétricas.',
    implemented: true,
    citations: ['NIST SP 800-185'],
    key: 'kmac128'
  },
  {
    name: 'KMAC256',
    category: 'Criptográfico',
    description: 'Variante de 256 bits de segurança do Keccak Message Authentication Code para assinaturas simétricas críticas.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para integridade autenticada máxima e derivações seguras de chaves.',
    implemented: true,
    citations: ['NIST SP 800-185'],
    key: 'kmac256'
  },
  {
    name: 'TupleHash128',
    category: 'Criptográfico',
    description: 'Algoritmo da família SHA-3 de 128 bits projetado para hash seguro e não ambíguo de sequências de tuplas.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para hashing estruturado de tuplas e prevenção de ataques de injeção de strings.',
    implemented: true,
    citations: ['NIST SP 800-185'],
    key: 'tuplehash128'
  },
  {
    name: 'TupleHash256',
    category: 'Criptográfico',
    description: 'Variante de segurança superior de 256 bits do TupleHash para estruturas de dados e assinaturas redundantes.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para hashing de estruturas hierárquicas em sistemas criptográficos complexos.',
    implemented: true,
    citations: ['NIST SP 800-185'],
    key: 'tuplehash256'
  },
  {
    name: 'Ascon-Hash256',
    category: 'Criptográfico',
    description: 'Algoritmo criptográfico leve oficial selecionado pelo NIST para segurança de dispositivos com restrição de recursos (LWC).',
    securityLevel: 'Seguro',
    recommendation: 'Altamente recomendado para IoT, dispositivos embarcados e microcontroladores.',
    implemented: true,
    citations: ['NIST LWC Selection (2023)', 'NIST SP 800-232'],
    key: 'ascon_hash256'
  },
  {
    name: 'Ascon-XOF128',
    category: 'Criptográfico',
    description: 'Variante de saída flexível (XOF) do algoritmo leve Ascon selecionado pelo NIST.',
    securityLevel: 'Seguro',
    recommendation: 'Altamente recomendado para derivação leve de chaves flexíveis.',
    implemented: true,
    citations: ['NIST LWC Selection (2023)', 'NIST SP 800-232'],
    key: 'ascon_xof128'
  },
  {
    name: 'BLAKE3',
    category: 'Criptográfico',
    description: 'Algoritmo criptográfico moderno, extremamente rápido e seguro, baseado no Bao e BLAKE2.',
    securityLevel: 'Seguro',
    recommendation: 'Altamente recomendado. Muito mais rápido que o SHA-256 e altamente paralelizável.',
    implemented: true,
    citations: ['BLAKE3 team official spec'],
    key: 'blake3'
  },
  {
    name: 'BLAKE2s',
    category: 'Criptográfico',
    description: 'Otimizado para plataformas de 8 a 32 bits, seguro contra ataques e muito eficiente.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para dispositivos de baixo consumo e IoT.',
    implemented: true,
    citations: ['RFC 7693'],
    key: 'blake2s'
  },
  {
    name: 'BLAKE2b',
    category: 'Criptográfico',
    description: 'Otimizado para arquiteturas de 64 bits, sendo mais rápido que o SHA-512 e extremamente seguro.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Perfeito para hashing de alta performance.',
    implemented: true,
    citations: ['RFC 7693'],
    key: 'blake2b'
  },
  {
    name: 'RIPEMD-160',
    category: 'Criptográfico',
    description: 'Hash criptográfico europeu de 160 bits projetado para substituir o RIPEMD original.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro, mas antigo. Usado principalmente no ecossistema do Bitcoin para compatibilidade de endereços.',
    implemented: true,
    citations: ['ISO/IEC 10118-3'],
    key: 'ripemd160'
  },
  {
    name: 'MD5',
    category: 'Criptográfico',
    description: 'Clássico algoritmo de hash de 128 bits, largamente quebrado por colisões fáceis.',
    securityLevel: 'Obsoleto',
    recommendation: 'Evitar totalmente em contextos de segurança. Use apenas para integridade legada.',
    implemented: true,
    citations: ['RFC 1321', 'NIST SP 800-131A'],
    key: 'md5'
  },
  {
    name: 'MD4',
    category: 'Criptográfico',
    description: 'Precursor do MD5 de 128 bits, severamente quebrado por ataques rápidos de colisão.',
    securityLevel: 'Obsoleto',
    recommendation: 'Não usar de forma alguma devido a graves falhas de segurança.',
    implemented: true,
    citations: ['RFC 1320'],
    key: 'md4'
  },
  {
    name: 'MD2',
    category: 'Criptográfico',
    description: 'Algoritmo antigo de hash de 8 bits otimizado para computadores lentos, hoje quebrado.',
    securityLevel: 'Obsoleto',
    recommendation: 'Evitar completamente. Obsoleto por ser vulnerável e lento.',
    implemented: true,
    citations: ['RFC 1319'],
    key: 'md2'
  },
  {
    name: 'Whirlpool',
    category: 'Criptográfico',
    description: 'Função de hash de 512 bits baseada no padrão AES (Rijndael).',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para uso, mas menos comum hoje em dia.',
    implemented: true,
    citations: ['ISO/IEC 10118-3:2004'],
    key: 'whirlpool'
  },
  {
    name: 'SM3',
    category: 'Criptográfico',
    description: 'Padrão criptográfico oficial do governo chinês para hash de 256 bits, similar ao SHA-256.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado, especialmente para conformidade com normas governamentais chinesas.',
    implemented: true,
    citations: ['GB/T 32905-2016'],
    key: 'sm3'
  },
  {
    name: 'SHA-1',
    category: 'Criptográfico',
    description: 'Algoritmo de 160 bits quebrado na prática em 2017 por ataques de colisão ativa.',
    securityLevel: 'Obsoleto',
    recommendation: 'Evitar. O NIST retirou a recomendação para qualquer aplicação de segurança.',
    implemented: true,
    citations: ['NIST SP 800-131A', 'SHAttered publication (2017)'],
    key: 'sha1'
  },
  {
    name: 'SHA-0',
    category: 'Criptográfico',
    description: 'A versão original de 1993 do SHA, rapidamente retirada devido a uma falha grave não revelada.',
    securityLevel: 'Obsoleto',
    recommendation: 'Evitar totalmente. Substituído pelo SHA-1 e hoje totalmente quebrado.',
    implemented: false,
    citations: ['FIPS PUB 180 (1993)'],
    unimplementedReason: 'Substituído pelo SHA-1 e hoje totalmente quebrado. Não possui crate seguro ativo.'
  },
  {
    name: 'MD6',
    category: 'Criptográfico',
    description: 'Proposta de hash usando uma estrutura de árvore Merkle, segura contra vulnerabilidades clássicas.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro, mas raro por ter sido retirado do processo SHA-3 devido ao tempo de submissão.',
    implemented: false,
    citations: ['Rivest et al., MD6 proposal'],
    unimplementedReason: 'Crate obsoleto e sem manutenção para WASM.'
  },
  {
    name: 'MDC-2',
    category: 'Criptográfico',
    description: 'Modification Detection Code 2, método patenteado para transformar blocos de cifra em hash.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Evitar devido a tamanho de chave curto e colisões fáceis.',
    implemented: false,
    citations: ['ISO/IEC 10118-2'],
    unimplementedReason: 'Algoritmo obsoleto, lento, e sem crate Rust funcional.'
  },
  {
    name: 'N-Hash',
    category: 'Criptográfico',
    description: 'Algoritmo japonês baseado no FEAL, quebrado rapidamente por criptoanálise diferencial.',
    securityLevel: 'Obsoleto',
    recommendation: 'Evitar completamente. Totalmente quebrado na literatura.',
    implemented: false,
    citations: ['CRYPTO 1989'],
    unimplementedReason: 'Totalmente quebrado por criptoanálise diferencial e sem implementação Rust moderna.'
  },
  {
    name: 'Snefru',
    category: 'Criptográfico',
    description: 'Algoritmo projetado por Ralph Merkle, quebrado quase imediatamente após a publicação.',
    securityLevel: 'Obsoleto',
    recommendation: 'Não utilizar sob nenhuma circunstância.',
    implemented: false,
    citations: ['Merkle, 1990'],
    unimplementedReason: 'Totalmente quebrado e considerado inseguro na literatura.'
  },
  {
    name: 'Tiger',
    category: 'Criptográfico',
    description: 'Projetado em 1995 por Anderson e Biham para eficiência extrema em CPUs de 64 bits.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Não recomendado. Versões originais vulneráveis a ataques de colisão.',
    implemented: false,
    citations: ['Tiger spec 1996'],
    unimplementedReason: 'Vulnerável e sem crate Rust ativo e mantido.'
  },
  {
    name: 'Tiger2',
    category: 'Criptográfico',
    description: 'Variante modificada do Tiger com um padding ligeiramente diferente para corrigir um ataque.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Evitar. Ainda sofre das mesmas fraquezas estruturais centrais do Tiger.',
    implemented: false,
    citations: ['Tiger2 spec'],
    unimplementedReason: 'Vulnerável estruturalmente e sem suporte de biblioteca ativa.'
  },
  {
    name: 'ParallelHash',
    category: 'Criptográfico',
    description: 'Variante Keccak otimizada para hashing paralelo de arquivos massivos.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para sistemas concorrentes de alto desempenho.',
    implemented: false,
    citations: ['NIST SP 800-185'],
    unimplementedReason: 'Threading paralelo via Rayon em WASM monothread no navegador não é viável e violaria a integridade do worker.'
  },
  {
    name: 'BLAKE',
    category: 'Criptográfico',
    description: 'O algoritmo BLAKE original, finalista no concurso SHA-3 do NIST.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro, mas prefira BLAKE2 ou BLAKE3 para melhor performance.',
    implemented: false,
    citations: ['NIST SHA-3 Finalist Paper'],
    unimplementedReason: 'Substituído pelo BLAKE2 e BLAKE3. Crate sem manutenção para browser.'
  },
  {
    name: 'BLAKE2X',
    category: 'Criptográfico',
    description: 'Variante com tamanho de saída arbitrariamente longo (XOF) baseada no BLAKE2.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para derivar chaves ou entropia flexível.',
    implemented: false,
    citations: ['BLAKE2X official paper'],
    unimplementedReason: 'Não padronizado pela IETF e sem crate de produção para WASM.'
  },
  {
    name: 'RIPEMD-128',
    category: 'Criptográfico',
    description: 'Versão de 128 bits da família RIPEMD, vulnerável a colisões rápidas.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Não recomendado. Use RIPEMD-160 ou SHA-256.',
    implemented: false,
    citations: ['ISO/IEC 10118-3'],
    unimplementedReason: 'Vulnerável a colisões e sem crate ativo.'
  },
  {
    name: 'RIPEMD-256',
    category: 'Criptográfico',
    description: 'Extensão de 256 bits do RIPEMD que oferece o mesmo nível de segurança prática do RIPEMD-128.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Não recomendado. Projetado apenas para segurança redundante contra colisões acidentais.',
    implemented: false,
    citations: ['ISO/IEC 10118-3'],
    unimplementedReason: 'Fornece segurança fraca e redundante.'
  },
  {
    name: 'RIPEMD-320',
    category: 'Criptográfico',
    description: 'Extensão de 320 bits do RIPEMD, oferecendo segurança estrutural similar ao RIPEMD-160.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro, mas redundante e raramente suportado em bibliotecas criptográficas.',
    implemented: false,
    citations: ['ISO/IEC 10118-3'],
    unimplementedReason: 'Redundante e sem suporte de biblioteca ativa.'
  },
  {
    name: 'GOST R 34.11-94',
    category: 'Criptográfico',
    description: 'Padrão criptográfico russo clássico de 256 bits, hoje quebrado e considerado obsoleto.',
    securityLevel: 'Obsoleto',
    recommendation: 'Evitar totalmente. Quebrado estruturalmente.',
    implemented: false,
    citations: ['RFC 5831'],
    unimplementedReason: 'Quebrado estruturalmente e obsoleto.'
  },
  {
    name: 'Streebog',
    category: 'Criptográfico',
    description: 'Padrão de hash russo atual (GOST R 34.11-2012) que substituiu o obsoleto GOST de 1994.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para uso oficial em jurisdição russa, mas sob constante discussão acadêmica.',
    implemented: false,
    citations: ['RFC 6986'],
    unimplementedReason: 'Ausência de crate Rust de nível de produção para WASM.'
  },
  {
    name: 'Kupyna',
    category: 'Criptográfico',
    description: 'Padrão nacional de hash da Ucrânia (DSTU 7564:2014), baseado na cifra Even-Mansour.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado para conformidade com padrões militares e civis ucranianos.',
    implemented: false,
    citations: ['DSTU 7564:2014'],
    unimplementedReason: 'Sem crate Rust oficial estável.'
  },
  {
    name: 'HAS-160',
    category: 'Criptográfico',
    description: 'Padrão criptográfico coreano derivado do SHA-1, que herdou a maior parte de suas fraquezas.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Não recomendado devido a vulnerabilidades herdadas do design do SHA-1.',
    implemented: false,
    citations: ['KISA Standard (Korea)'],
    unimplementedReason: 'Obsoleto e herdou fraquezas do SHA-1.'
  },
  {
    name: 'HAVAL',
    category: 'Criptográfico',
    description: 'Algoritmo de hash de tamanho variável projetado em 1992, vulnerável a colisões fáceis.',
    securityLevel: 'Obsoleto',
    recommendation: 'Não utilizar sob nenhuma hipótese de segurança.',
    implemented: false,
    citations: ['HAVAL Specification 1992'],
    unimplementedReason: 'Vulnerável e obsoleto.'
  },

  // 2. Categoria: Integridade (Checksum)
  {
    name: 'CRC-32',
    category: 'Integridade (Checksum)',
    description: 'Verificação de Redundância Cíclica de 32 bits amplamente usada em redes e formatos ZIP.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Usar apenas para detecção de erros acidentais, nunca para segurança.',
    implemented: true,
    citations: ['ISO 3309'],
    key: 'crc32'
  },
  {
    name: 'Adler-32',
    category: 'Integridade (Checksum)',
    description: 'Checksum rápido usado na biblioteca zlib para verificar corrupção de dados.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Recomendado apenas para detecção rápida de corrupção acidental de dados.',
    implemented: true,
    citations: ['RFC 1950'],
    key: 'adler32'
  },
  {
    name: 'CRC-8',
    category: 'Integridade (Checksum)',
    description: 'Checksum cíclico de 8 bits para controle de erro simples em hardware embarcado.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Use em hardware de baixa memória para validação trivial de dados.',
    implemented: true,
    citations: ['ITU-T I.432.1'],
    key: 'crc8'
  },
  {
    name: 'CRC-16',
    category: 'Integridade (Checksum)',
    description: 'Checksum de 16 bits muito usado em modems, protocolos USB e sistemas industriais Modbus.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Utilizar em protocolos de rede industriais antigos e detecção de colisões básicas.',
    implemented: true,
    citations: ['ANSI MC1.1'],
    key: 'crc16'
  },
  {
    name: 'CRC-64',
    category: 'Integridade (Checksum)',
    description: 'Checksum robusto de 64 bits para arquivos massivos e detecção de erros em mídia.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Adequado para bancos de dados ou verificação rápida de integridade física de grandes dados.',
    implemented: true,
    citations: ['ISO 3309'],
    key: 'crc64'
  },
  {
    name: 'Fletcher-16',
    category: 'Integridade (Checksum)',
    description: 'Checksum de baixa complexidade, concorrente direto do CRC, otimizado para software.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Útil em microcontroladores sem suporte de hardware para CRC.',
    implemented: true,
    citations: ['Fletcher, 1982'],
    key: 'fletcher16'
  },
  {
    name: 'Fletcher-32',
    category: 'Integridade (Checksum)',
    description: 'Checksum de 32 bits mais rápido que o CRC-32 e projetado especificamente para execução em software.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Use em sistemas legados que buscam boa imunidade a erros com consumo irrisório de CPU.',
    implemented: true,
    citations: ['Fletcher, 1982'],
    key: 'fletcher32'
  },
  {
    name: 'Luhn',
    category: 'Integridade (Checksum)',
    description: 'Algoritmo de módulo 10 para validação visual simples, usado em cartões de crédito.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Usar apenas para validação de erros de digitação (ex: dígitos de cartões).',
    implemented: true,
    citations: ['ISO/IEC 7812'],
    key: 'luhn'
  },
  {
    name: 'Verhoeff',
    category: 'Integridade (Checksum)',
    description: 'Algoritmo de checksum decimal baseado em simetrias do grupo diédrico D5, prevenindo erros de transposição comuns.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Recomendado para verificação robusta de digitação manual de códigos de barras ou IDs.',
    implemented: true,
    citations: ['Verhoeff, 1969'],
    key: 'verhoeff'
  },
  {
    name: 'Damm',
    category: 'Integridade (Checksum)',
    description: 'Algoritmo decimal que previne todos os erros de transposição de dígitos adjacentes com simplicidade matemática.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Excelente alternativa ao Luhn e Verhoeff.',
    implemented: true,
    citations: ['Damm, 2004'],
    key: 'damm'
  },

  // 3. Categoria: Fast/Non-Cryptographic
  {
    name: 'MurmurHash3',
    category: 'Fast/Non-Cryptographic',
    description: 'Algoritmo não criptográfico otimizado para tabelas de hash e consultas rápidas.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Excelente para uso em estruturas de dados locais e tabelas de hash.',
    implemented: true,
    citations: ['Austin Appleby GitHub Spec'],
    key: 'murmur3'
  },
  {
    name: 'xxHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Algoritmo extremamente rápido que opera perto da velocidade máxima de leitura de memória RAM.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Altamente recomendado para detecção de duplicatas e hashing em tempo real.',
    implemented: true,
    citations: ['Yann Collet Official spec'],
    key: 'xxhash'
  },
  {
    name: 'SipHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Hash com chave de alta velocidade projetado para evitar ataques de colisão em tabelas de hash (Hash DoS).',
    securityLevel: 'Seguro',
    recommendation: 'Altamente recomendado como hash padrão de dicionários em linguagens modernas (Rust, Python).',
    implemented: true,
    citations: ['Aumasson & Bernstein (2012)'],
    key: 'siphash'
  },
  {
    name: 'FNV-1',
    category: 'Fast/Non-Cryptographic',
    description: 'Fowler-Noll-Vo, algoritmo de hash extremamente simples e rápido para indexação de strings.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Útil para hash rápido de chaves curtas e tabelas de hash triviais.',
    implemented: true,
    citations: ['IETF FNV Draft spec'],
    key: 'fnv1'
  },
  {
    name: 'FNV-1a',
    category: 'Fast/Non-Cryptographic',
    description: 'Variante melhorada do FNV-1 com melhor distribuição do bit de avalanche nas últimas posições.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Recomendado para estruturas de dados em memória que precisam de distribuição rápida e simples.',
    implemented: true,
    citations: ['IETF FNV Draft spec'],
    key: 'fnv1a'
  },
  {
    name: 'HighwayHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Hash robusto e rápido de 64, 128 and 256 bits projetado pela Google para resistência a colisões.',
    securityLevel: 'Seguro',
    recommendation: 'Excelente alternativa segura e ultra-rápida de hash em memória.',
    implemented: false,
    citations: ['Google GitHub Research'],
    unimplementedReason: 'Requer instruções assembly específicas de CPU que falham em sandbox WASM browser de forma nativa.'
  },
  {
    name: 'MurmurHash',
    category: 'Fast/Non-Cryptographic',
    description: 'A primeira especificação pública do MurmurHash projetada por Austin Appleby.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Evitar em novos projetos, use MurmurHash3 para melhor distribuição.',
    implemented: false,
    citations: ['Appleby 2008'],
    unimplementedReason: 'Substituído pelo MurmurHash3.'
  },
  {
    name: 'MurmurHash2',
    category: 'Fast/Non-Cryptographic',
    description: 'A segunda revisão do MurmurHash, sofrendo de fraca resistência a colisões em casos específicos.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Substituído pelo MurmurHash3.',
    implemented: false,
    citations: ['Appleby 2010'],
    unimplementedReason: 'Substituído pelo MurmurHash3.'
  },
  {
    name: 'CityHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Projetado pela Google para hashing rápido de strings longas em arquiteturas x86-64.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Recomendado para bancos de dados de Big Data.',
    implemented: false,
    citations: ['Google CityHash spec'],
    unimplementedReason: 'Otimizado especificamente para arquiteturas x64 com montagem nativa.'
  },
  {
    name: 'FarmHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Sucessor do CityHash criado também pela Google, incorporando otimizações avançadas de vetorização.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Excelente para indexação ultra-rápida em Big Data.',
    implemented: false,
    citations: ['Google FarmHash spec'],
    unimplementedReason: 'Dependente de montagem x86/SSE4 nativa, não compilável para WASM.'
  },
  {
    name: 'MetroHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Conjunto de algoritmos de hash rápido, alegando alta consistência e sem viés estatístico.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Bom para estruturas de busca que não requerem blindagem DoS.',
    implemented: false,
    citations: ['MetroHash spec'],
    unimplementedReason: 'Sem crate Rust moderno compatível com browser.'
  },
  {
    name: 'Jenkins',
    category: 'Fast/Non-Cryptographic',
    description: 'Coleção antiga de hashes não criptográficos criados por Bob Jenkins (como Lookup3).',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Usar em sistemas legados.',
    implemented: false,
    citations: ['Bob Jenkins lookup3'],
    unimplementedReason: 'Coleção obsoleta de Bob Jenkins.'
  },
  {
    name: 'SpookyHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Algoritmo não criptográfico de 128 bits criado por Bob Jenkins com foco em rapidez extrema.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Seguro para tabelas hash, mas prefira xxHash em novos desenvolvimentos.',
    implemented: false,
    citations: ['Jenkins Spooky spec'],
    unimplementedReason: 'Ausência de suporte confiável WASM.'
  },
  {
    name: 'T1ha',
    category: 'Fast/Non-Cryptographic',
    description: 'Fast Positive Hash, projetado para extrema performance em CPUs modernas.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Excelente opção para ambientes de CPU vetorizada moderna.',
    implemented: false,
    citations: ['t1ha spec'],
    unimplementedReason: 'Vetorização interna de assembly complexa incompatível com browser WASM.'
  },
  {
    name: 'WyHash',
    category: 'Fast/Non-Cryptographic',
    description: 'Algoritmo de hash de string extremamente portátil e rápido que passa em todos os testes SMHasher.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Altamente recomendado como hash geral para tabelas de alta velocidade.',
    implemented: false,
    citations: ['Wang, SMHasher 2020'],
    unimplementedReason: 'Ambíguo e sem crate robusto para targets web.'
  },

  // 4. Categoria: Segurança de Senha
  {
    name: 'Argon2id',
    category: 'Segurança de Senha',
    description: 'Variante recomendada do Argon2 que combina computação dependente de dados e independente para máxima segurança.',
    securityLevel: 'Seguro',
    recommendation: 'Altamente recomendado. O padrão atual da indústria para hashing de senhas.',
    implemented: true,
    citations: ['RFC 9106'],
    key: 'argon2id'
  },
  {
    name: 'Argon2i',
    category: 'Segurança de Senha',
    description: 'Variante do Argon2 otimizada contra ataques de canal lateral baseados em tempo.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado se o vetor de ataque principal for temporal local.',
    implemented: true,
    citations: ['RFC 9106'],
    key: 'argon2i'
  },
  {
    name: 'Argon2d',
    category: 'Segurança de Senha',
    description: 'Variante do Argon2 com maior resistência a ataques via hardware (GPUs e ASICs).',
    securityLevel: 'Seguro',
    recommendation: 'Não recomendado para credenciais corporativas normais por ser sensível a ataques de canal lateral.',
    implemented: true,
    citations: ['RFC 9106'],
    key: 'argon2d'
  },
  {
    name: 'bcrypt',
    category: 'Segurança de Senha',
    description: 'Função de hash de senha baseada na cifra Blowfish, com fator de custo configurável.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Seguro, robusto e amplamente testado.',
    implemented: true,
    citations: ['USENIX 1999'],
    key: 'bcrypt'
  },
  {
    name: 'scrypt',
    category: 'Segurança de Senha',
    description: 'Função de derivação de chaves projetada para requerer grandes quantidades de memória.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado. Dificulta massivamente ataques de força bruta baseados em hardware personalizado (FPGA/ASIC).',
    implemented: true,
    citations: ['RFC 7914'],
    key: 'scrypt'
  },
  {
    name: 'PBKDF2',
    category: 'Segurança de Senha',
    description: 'Função clássica de hashing iterativo, suportando algoritmos subjacentes configuráveis (SHA-256, etc).',
    securityLevel: 'Seguro',
    recommendation: 'Seguro, mas antigo. Evite para senhas se puder usar Argon2id ou bcrypt.',
    implemented: true,
    citations: ['NIST SP 800-132', 'RFC 2898'],
    key: 'pbkdf2'
  },
  {
    name: 'Crypt',
    category: 'Segurança de Senha',
    description: 'Interface histórica do Unix para criptografia de senhas (geralmente baseada em DES ou MD5).',
    securityLevel: 'Obsoleto',
    recommendation: 'Não utilizar. Oferece resistência nula a poder de processamento atual.',
    implemented: false,
    citations: ['POSIX Standard'],
    unimplementedReason: 'Interface POSIX nativa do sistema operacional Linux, não aplicável à sandbox WASM do browser.'
  },
  {
    name: 'LM hash',
    category: 'Segurança de Senha',
    description: 'LanMan hash antigo da Microsoft, divide a senha em dois blocos de 7 bytes e usa DES obsoleto.',
    securityLevel: 'Obsoleto',
    recommendation: 'Não utilizar de forma alguma devido a vulnerabilidade instantânea de quebra de senhas.',
    implemented: false,
    citations: ['Microsoft Support documentation'],
    unimplementedReason: 'Extremamente fraco e quebrado instantaneamente. Não recomendado expor.'
  },
  {
    name: 'NTLM',
    category: 'Segurança de Senha',
    description: 'Sucessor do LM hash baseado no algoritmo MD4, vulnerável a quebra rápida.',
    securityLevel: 'Obsoleto',
    recommendation: 'Não recomendado para segurança de redes modernas; suscetível a ataques Pass-the-Hash.',
    implemented: false,
    citations: ['MS-NLMP specification'],
    unimplementedReason: 'Obsoleto e vulnerável a ataques rápidos em rede.'
  },

  // 5. Categoria: Fuzzy/Similaridade
  {
    name: 'SimHash',
    category: 'Fuzzy/Similaridade',
    description: 'Algoritmo de similaridade que agrupa textos por proximidade de conteúdo.',
    securityLevel: 'Não aplicável',
    recommendation: 'Recomendado para detecção de plágio e desduplicação de páginas web.',
    implemented: false,
    citations: ['Charikar (STOC 2002)'],
    unimplementedReason: 'Técnica de fingerprinting de similaridade sem padrão único e não formatada como hash padrão.'
  },
  {
    name: 'MinHash',
    category: 'Fuzzy/Similaridade',
    description: 'Técnica de similaridade de Jaccard rápida para estimar semelhança entre conjuntos massivos.',
    securityLevel: 'Não aplicável',
    recommendation: 'Altamente recomendado para análise de dados estatísticos e clusterização.',
    implemented: false,
    citations: ['Broder, 1997'],
    unimplementedReason: 'Conceito matemático de agrupamento estatístico de conjuntos, não um hash binário simples.'
  },
  {
    name: 'Ssdeep',
    category: 'Fuzzy/Similaridade',
    description: 'Algoritmo de hash de contexto (CTPH) projetado para encontrar arquivos binários similares.',
    securityLevel: 'Não aplicável',
    recommendation: 'Recomendado para assinaturas de malware e análise forense digital.',
    implemented: false,
    citations: ['Kornblum, 2006'],
    unimplementedReason: 'Requer bibliotecas C nativas extensivas incompatíveis com WASM.'
  },
  {
    name: 'Nilsimsa',
    category: 'Fuzzy/Similaridade',
    description: 'Hash de assinatura anti-spam projetado para medir a similaridade entre e-mails.',
    securityLevel: 'Não aplicável',
    recommendation: 'Útil em sysetmas legados anti-spam baseados em heurística.',
    implemented: false,
    citations: ['Nilsimsa draft spec'],
    unimplementedReason: 'Sem biblioteca Rust ativa e com vulnerabilidades heurísticas comprovadas.'
  },
  {
    name: 'TLSH',
    category: 'Fuzzy/Similaridade',
    description: 'Trend Micro Locality Sensitive Hash, gera assinaturas baseadas na distância de similaridade.',
    securityLevel: 'Não aplicável',
    recommendation: 'Recomendado para inteligência contra ameaças digitais moderna.',
    implemented: false,
    citations: ['Oliver et al., TLSH paper'],
    unimplementedReason: 'Dependente de biblioteca C nativa complexa sem crate Rust WASM compatível.'
  },

  // 6. Categoria: Outros Especializados
  {
    name: 'BuzHash',
    category: 'Outros Especializados',
    description: 'Algoritmo de hash dinâmico (rolling hash) que processa dados através de uma janela móvel rápida.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Recomendado para segmentação inteligente de arquivos em blocos de tamanho variável.',
    implemented: false,
    citations: ['Buz, 1997'],
    unimplementedReason: 'Conceito de janela móvel dinâmica de tamanho variável, sem representação única.'
  },
  {
    name: 'Pearson',
    category: 'Outros Especializados',
    description: 'Algoritmo de hash simples projetado para execução ágil em microprocessadores de 8 bits.',
    securityLevel: 'Não Criptográfico (Integridade)',
    recommendation: 'Usar apenas em sistemas de hardware legados de baixíssimo recurso.',
    implemented: false,
    citations: ['Pearson, ACM 1990'],
    unimplementedReason: 'Lógica trivial de tabela de consulta de 8 bits para hardware legado.'
  },
  {
    name: 'Geohash',
    category: 'Outros Especializados',
    description: 'Sistema de geocodificação espacial que transforma coordenadas de latitude e longitude em strings curtas e precisas.',
    securityLevel: 'Não aplicável',
    recommendation: 'Altamente recomendado para busca espacial rápida em bancos de dados geográficos.',
    implemented: true,
    citations: ['Morton, 1966'],
    key: 'geohash'
  },
  {
    name: 'TLS-hash',
    category: 'Outros Especializados',
    description: 'Função pseudo-aleatória usada no protocolo TLS para derivação de chaves e handshake.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado apenas dentro da infraestrutura interna do protocolo TLS correspondente.',
    implemented: false,
    citations: ['RFC 8446 (TLS 1.3)'],
    unimplementedReason: 'Mecanismo interno do protocolo TLS, não um algoritmo de hash isolado.'
  },
  {
    name: 'RadioGatún',
    category: 'Outros Especializados',
    description: 'Antecessor do Keccak, estruturado em torno de uma esteira e moinho de bits de alta velocidade.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Evitar em novos designs; Keccak (SHA-3) é uma evolução madura e totalmente recomendada.',
    implemented: false,
    citations: ['RadioGatún Paper 2006'],
    unimplementedReason: 'Obsoleto e substituído pelo Keccak (SHA-3).'
  },
  {
    name: 'PANAMA',
    category: 'Outros Especializados',
    description: 'Algoritmo de hash clássico de 1998, quebrado por criptoanálise em 2001.',
    securityLevel: 'Obsoleto',
    recommendation: 'Não utilizar sob nenhuma circunstância.',
    implemented: false,
    citations: ['PANAMA spec, FSE 1998'],
    unimplementedReason: 'Totalmente quebrado por criptoanálise em 2001.'
  },
  {
    name: 'Lane',
    category: 'Outros Especializados',
    description: 'Submissão para o concurso SHA-3, retirada devido a ineficiências e vulnerabilidades estruturais.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Não recomendado.',
    implemented: false,
    citations: ['Lane SHA-3 Submission'],
    unimplementedReason: 'Submissão do SHA-3 retirada devido a falhas estruturais.'
  },
  {
    name: 'JH',
    category: 'Outros Especializados',
    description: 'Finalista de alta performance no concurso NIST SHA-3, baseado no método Sponge.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro, embora raramente adotado na indústria quando comparado ao SHA-3 real.',
    implemented: false,
    citations: ['JH SHA-3 finalist spec'],
    unimplementedReason: 'Raramente suportado e preterido comercialmente pelo SHA-3.'
  },
  {
    name: 'Spectral Hash',
    category: 'Outros Especializados',
    description: 'Submissão ao SHA-3 baseada na matemática de transformadas de Fourier e espectrais.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Evitar devido à complexidade matemática ineficiente e fraquezas descobertas no concurso.',
    implemented: false,
    citations: ['Spectral Hash SHA-3 submission'],
    unimplementedReason: 'Quebrado e matematicamente ineficiente.'
  },
  {
    name: 'LSH',
    category: 'Outros Especializados',
    description: 'Padrão criptográfico sul-coreano de alta performance para hashing otimizado em SIMD.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para uso oficial sob diretrizes governamentais sul-coreanas.',
    implemented: false,
    citations: ['LSH specification, Telecommunications Technology Association'],
    unimplementedReason: 'Sem crate Rust público ou estável.'
  },
  {
    name: 'CubeHash',
    category: 'Outros Especializados',
    description: 'Proposta submetida por Daniel J. Bernstein ao concurso SHA-3, extremamente parametrizável.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para uso acadêmico, mas pouco comum fora da literatura de Bernstein.',
    implemented: false,
    citations: ['CubeHash specification (Bernstein)'],
    unimplementedReason: 'Suporte ausente na biblioteca Rust criptográfica de produção.'
  },
  {
    name: 'ECOH',
    category: 'Outros Especializados',
    description: 'Elliptic Curve Only Hash, baseado em curvas elípticas, quebrado no concurso SHA-3 por colisão rápida.',
    securityLevel: 'Obsoleto',
    recommendation: 'Não utilizar de forma alguma por ser vulnerável e lento.',
    implemented: false,
    citations: ['ECOH SHA-3 submission'],
    unimplementedReason: 'Totalmente quebrado por colisões no concurso SHA-3.'
  },
  {
    name: 'FSB',
    category: 'Outros Especializados',
    description: 'Fast Syndrome-Based hash, algoritmo pós-quântico de base matemática rígida.',
    securityLevel: 'Seguro',
    recommendation: 'Recomendado apenas para estudos de hashing baseado em segurança pós-quântica.',
    implemented: false,
    citations: ['FSB specification'],
    unimplementedReason: 'Sem crate Rust mantido que compile estavelmente para WASM.'
  },
  {
    name: 'Fugue',
    category: 'Outros Especializados',
    description: 'Algoritmo de hash proposto pela IBM para o SHA-3, com forte distribuição estatística.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro, porém pouco utilizado fora do contexto histórico.',
    implemented: false,
    citations: ['Fugue SHA-3 submission'],
    unimplementedReason: 'Raramente suportado e obsoleto fora do contexto SHA-3.'
  },
  {
    name: 'Grostl',
    category: 'Outros Especializados',
    description: 'Finalista influente da competição SHA-3 do NIST, compartilhando operações e S-Boxes com o AES.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro. Pode ser usado para alta performance, especialmente se implementado em hardware AES-NI.',
    implemented: false,
    citations: ['Grostl specification (NIST SHA-3 finalist)'],
    unimplementedReason: 'Raramente suportado na web sem hardware específico AES-NI.'
  },
  {
    name: 'Hamsi',
    category: 'Outros Especializados',
    description: 'Algoritmo leve submetido ao concurso SHA-3, focado em alta velocidade por software.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para contextos específicos, mas preterido comercialmente por algoritmos maduros.',
    implemented: false,
    citations: ['Hamsi SHA-3 submission'],
    unimplementedReason: 'Preterido pelo SHA-3 oficial.'
  },
  {
    name: 'JSF',
    category: 'Outros Especializados',
    description: 'Joint Sparse Form, representação numérica para aceleração de multiplicações em curvas elípticas.',
    securityLevel: 'Não aplicável',
    recommendation: 'Usar apenas em otimização matemática interna de primitivas criptográficas.',
    implemented: false,
    citations: ['Solinas, 2001'],
    unimplementedReason: 'Apenas uma primitiva de aceleração matemática, não um algoritmo de hash de dados.'
  },
  {
    name: 'Shabal',
    category: 'Outros Especializados',
    description: 'Submissão ao concurso SHA-3 combinando alta velocidade com fortes propriedades de pseudo-aleatoriedade.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para uso acadêmico. Empregado em algumas blockchains (ex: Burstcoin).',
    implemented: false,
    citations: ['Shabal SHA-3 submission'],
    unimplementedReason: 'Sem suporte em crates ativos estáveis.'
  },
  {
    name: 'SIMD',
    category: 'Outros Especializados',
    description: 'Submissão ao SHA-3 projetada especificamente para aproveitar a aceleração SIMD por vetorização nativa.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para fins específicos, mas com implementação complexa.',
    implemented: false,
    citations: ['SIMD hash spec'],
    unimplementedReason: 'Incompatível com a execução monothread da Sandbox de WebAssembly no navegador.'
  },
  {
    name: 'Skein',
    category: 'Outros Especializados',
    description: 'Finalista de destaque do concurso SHA-3 projetado por Bruce Schneier, baseado na cifra Threefish.',
    securityLevel: 'Seguro',
    recommendation: 'Altamente recomendado caso queira um hash extremamente flexível fora do ecossistema oficial NIST.',
    implemented: false,
    citations: ['Skein specification (NIST SHA-3 finalist)'],
    unimplementedReason: 'Ausência de suporte de biblioteca estável e mantida para browser.'
  },
  {
    name: 'SWIFFT',
    category: 'Outros Especializados',
    description: 'Algoritmo baseado em redes matemáticas (lattices), com garantia de segurança pós-quântica provada teoricamente.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para cenários experimentais de segurança pós-quântica.',
    implemented: false,
    citations: ['SWIFFT spec, NIST 2008'],
    unimplementedReason: 'Algoritmo experimental pós-quântico sem biblioteca Rust disponível.'
  },
  {
    name: 'VSH',
    category: 'Outros Especializados',
    description: 'Very Smooth Hash, um algoritmo de hash provadamente seguro com base na fatoração de inteiros.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para validações onde a segurança matemática rígida é mais importante que a velocidade (extremamente lento).',
    implemented: false,
    citations: ['VSH publication, Contini et al.'],
    unimplementedReason: 'Extremamente lento e puramente conceitual acadêmico.'
  },
  {
    name: 'MASH-1',
    category: 'Outros Especializados',
    description: 'Modular Arithmetic Secure Hash, baseado em exponenciação modular e no problema RSA.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Evitar. Vulnerabilidades conhecidas de colisão prática publicadas pela comunidade acadêmica.',
    implemented: false,
    citations: ['ISO/IEC 10118-4'],
    unimplementedReason: 'Quebrado academicamente com colisões fáceis.'
  },
  {
    name: 'MASH-2',
    category: 'Outros Especializados',
    description: 'Variante melhorada do MASH-1 para modular arithmetic com um expoente de criptografia diferente.',
    securityLevel: 'Fraco/Inseguro',
    recommendation: 'Evitar. Ainda herdou vulnerabilidades estruturais similares ao MASH-1.',
    implemented: false,
    citations: ['ISO/IEC 10118-4'],
    unimplementedReason: 'Herdou fraquezas críticas do MASH-1.'
  },
  {
    name: 'Nonconcurring',
    category: 'Outros Especializados',
    description: 'Modelo teórico para hashing ou detecção de anomalias estatísticas sem replicação concorrente.',
    securityLevel: 'Não aplicável',
    recommendation: 'Usar apenas para pesquisa acadêmica matemática.',
    implemented: false,
    citations: ['IEEE Transactions on Information Theory'],
    unimplementedReason: 'Apenas um modelo teórico matemático sem especificação prática ou binária.'
  },
  {
    name: 'TLS-hash (Primitivas)',
    category: 'Outros Especializados',
    description: 'Uso interno de hashes encadeados no protocolo TLS para autenticação.',
    securityLevel: 'Seguro',
    recommendation: 'Seguro para uso automático por bibliotecas TLS.',
    implemented: false,
    citations: ['RFC 5246'],
    unimplementedReason: 'Uso interno de primitivas de handshakes TLS.'
  }
];
