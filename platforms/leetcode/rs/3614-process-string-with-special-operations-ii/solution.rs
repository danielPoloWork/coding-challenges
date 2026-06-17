// LeetCode 3614 - Process String with Special Operations II
// Didactic Rust proposal: same reverse index-remapping algorithm as the
// Pareto-optimal C++ champion, written for language coverage and clarity.

impl Solution {
    pub fn process_str(s: String, mut k: i64) -> char {
        let bytes = s.as_bytes();
        let mut len: i64 = 0;

        for &b in bytes {
            match b {
                b'a'..=b'z' => len += 1,
                b'*' => {
                    if len > 0 {
                        len -= 1;
                    }
                }
                b'#' => len <<= 1,
                _ => {}
            }
        }

        if k >= len {
            return '.';
        }

        for &b in bytes.iter().rev() {
            match b {
                b'a'..=b'z' => {
                    if k == len - 1 {
                        return b as char;
                    }
                    len -= 1;
                }
                b'#' => {
                    len >>= 1;
                    k %= len;
                }
                b'%' => {
                    k = len - 1 - k;
                }
                _ => {
                    len += 1;
                }
            }
        }

        '.'
    }
}
