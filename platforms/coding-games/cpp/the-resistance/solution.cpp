#include <bits/stdc++.h>

using namespace std;

namespace {

const char* const MORSE[26] = {
    ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",
    ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",
    "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."
};

struct Code {
    uint64_t lo = 0;
    uint64_t hi = 0;
    int len = 0;

    bool operator==(const Code& other) const {
        return lo == other.lo && hi == other.hi && len == other.len;
    }
};

struct CodeHash {
    static uint64_t mix(uint64_t x) {
        x += 0x9e3779b97f4a7c15ULL;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9ULL;
        x = (x ^ (x >> 27)) * 0x94d049bb133111ebULL;
        return x ^ (x >> 31);
    }

    size_t operator()(const Code& code) const {
        uint64_t h = mix(code.lo);
        h ^= mix(code.hi + 0x632be59bd9b4e019ULL +
                 static_cast<uint64_t>(code.len) * 0x9e3779b97f4a7c15ULL);
        return static_cast<size_t>(h);
    }
};

inline void appendBit(Code& code, int bit) {
    if (code.len < 64) {
        code.lo = (code.lo << 1) | static_cast<uint64_t>(bit);
    } else {
        code.hi = (code.hi << 1) | static_cast<uint64_t>(bit);
    }
    ++code.len;
}

Code encodeWord(const string& word) {
    Code code;
    for (char ch : word) {
        for (const char* p = MORSE[ch - 'A']; *p; ++p) {
            appendBit(code, *p == '-');
        }
    }
    return code;
}

}  // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string message;
    cin >> message;

    int n;
    cin >> n;

    unordered_map<Code, int, CodeHash> dictionary;
    dictionary.reserve(static_cast<size_t>(n) * 2);
    dictionary.max_load_factor(0.7f);

    array<bool, 81> lengthUsed{};
    int maxLen = 0;

    for (int i = 0; i < n; ++i) {
        string word;
        cin >> word;
        Code code = encodeWord(word);
        ++dictionary[code];
        lengthUsed[code.len] = true;
        maxLen = max(maxLen, code.len);
    }

    const int L = static_cast<int>(message.size());
    vector<long long> ways(L + 1, 0);
    ways[0] = 1;

    for (int start = 0; start < L; ++start) {
        const long long base = ways[start];
        if (base == 0) {
            continue;
        }

        Code code;
        const int limit = min(maxLen, L - start);
        for (int len = 1; len <= limit; ++len) {
            appendBit(code, message[start + len - 1] == '-');
            if (!lengthUsed[len]) {
                continue;
            }

            const auto it = dictionary.find(code);
            if (it != dictionary.end()) {
                ways[start + len] += base * static_cast<long long>(it->second);
            }
        }
    }

    cout << ways[L] << '\n';
    return 0;
}
