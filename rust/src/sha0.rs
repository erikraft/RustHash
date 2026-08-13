// Pure Rust implementation of the SHA-0 cryptographic hash algorithm.
// SHA-0 is identical to SHA-1 except that SHA-0's message schedule (W[t]) does NOT use a 1-bit left rotation.

#[derive(Clone)]
pub struct Sha0 {
    h: [u32; 5],
    block: [u8; 64],
    block_len: usize,
    total_len: u64,
}

impl Sha0 {
    pub fn new() -> Self {
        Self {
            h: [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0],
            block: [0; 64],
            block_len: 0,
            total_len: 0,
        }
    }

    pub fn update(&mut self, data: &[u8]) {
        self.total_len += data.len() as u64 * 8;
        let mut offset = 0;
        while offset < data.len() {
            let space = 64 - self.block_len;
            let chunk_len = std::cmp::min(space, data.len() - offset);
            self.block[self.block_len..self.block_len + chunk_len].copy_from_slice(&data[offset..offset + chunk_len]);
            self.block_len += chunk_len;
            offset += chunk_len;

            if self.block_len == 64 {
                self.process_block();
                self.block_len = 0;
            }
        }
    }

    pub fn finalize(mut self) -> [u8; 20] {
        // Append padding bit
        self.block[self.block_len] = 0x80;
        self.block_len += 1;

        if self.block_len > 56 {
            while self.block_len < 64 {
                self.block[self.block_len] = 0;
                self.block_len += 1;
            }
            self.process_block();
            self.block_len = 0;
        }

        while self.block_len < 56 {
            self.block[self.block_len] = 0;
            self.block_len += 1;
        }

        // Append the total bit length as 64-bit big endian integer
        let bits_bytes = self.total_len.to_be_bytes();
        self.block[56..64].copy_from_slice(&bits_bytes);
        self.process_block();

        let mut out = [0u8; 20];
        for i in 0..5 {
            out[i * 4..(i + 1) * 4].copy_from_slice(&self.h[i].to_be_bytes());
        }
        out
    }

    fn process_block(&mut self) {
        let mut w = [0u32; 80];
        for i in 0..16 {
            w[i] = u32::from_be_bytes([
                self.block[i * 4],
                self.block[i * 4 + 1],
                self.block[i * 4 + 2],
                self.block[i * 4 + 3],
            ]);
        }

        for i in 16..80 {
            // SHA-0: NO left rotation here! W[i] = W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16]
            w[i] = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
        }

        let mut a = self.h[0];
        let mut b = self.h[1];
        let mut c = self.h[2];
        let mut d = self.h[3];
        let mut e = self.h[4];

        for i in 0..80 {
            let (f, k) = if i < 20 {
                ((b & c) | ((!b) & d), 0x5A827999)
            } else if i < 40 {
                (b ^ c ^ d, 0x6ED9EBA1)
            } else if i < 60 {
                ((b & c) | (b & d) | (c & d), 0x8F1BBCDC)
            } else {
                (b ^ c ^ d, 0xCA62C1D6)
            };

            let temp = a.rotate_left(5)
                .wrapping_add(f)
                .wrapping_add(e)
                .wrapping_add(k)
                .wrapping_add(w[i]);

            e = d;
            d = c;
            c = b.rotate_left(30);
            b = a;
            a = temp;
        }

        self.h[0] = self.h[0].wrapping_add(a);
        self.h[1] = self.h[1].wrapping_add(b);
        self.h[2] = self.h[2].wrapping_add(c);
        self.h[3] = self.h[3].wrapping_add(d);
        self.h[4] = self.h[4].wrapping_add(e);
    }
}
