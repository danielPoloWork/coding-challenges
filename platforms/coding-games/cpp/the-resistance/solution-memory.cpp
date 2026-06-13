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
};

struct Entry {
    uint64_t lo;
    uint64_t hi;
    int len;
    int count;
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

int findCount(const vector<Entry>& entries, int left, int right, uint64_t lo, uint64_t hi) {
    const int end = right;
    while (left < right) {
        const int mid = left + (right - left) / 2;
        const Entry& current = entries[mid];
        if (current.lo < lo || (current.lo == lo && current.hi < hi)) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    if (left < end && entries[left].lo == lo && entries[left].hi == hi) {
        return entries[left].count;
    }
    return 0;
}

}  // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string message;
    cin >> message;

    int n;
    cin >> n;

    vector<Entry> entries;
    entries.reserve(n);
    int maxLen = 0;

    for (int i = 0; i < n; ++i) {
        string word;
        cin >> word;
        Code code = encodeWord(word);
        entries.push_back({code.lo, code.hi, code.len, 1});
        maxLen = max(maxLen, code.len);
    }

    sort(entries.begin(), entries.end(), [](const Entry& a, const Entry& b) {
        if (a.len != b.len) {
            return a.len < b.len;
        }
        if (a.lo != b.lo) {
            return a.lo < b.lo;
        }
        return a.hi < b.hi;
    });

    int write = 0;
    for (const Entry& entry : entries) {
        if (write > 0 && entries[write - 1].len == entry.len &&
            entries[write - 1].lo == entry.lo && entries[write - 1].hi == entry.hi) {
            ++entries[write - 1].count;
        } else {
            entries[write++] = entry;
        }
    }
    entries.resize(write);
    entries.shrink_to_fit();

    array<int, 81> rangeStart{};
    array<int, 81> rangeEnd{};
    int pos = 0;
    for (int len = 0; len <= 80; ++len) {
        rangeStart[len] = pos;
        while (pos < static_cast<int>(entries.size()) && entries[pos].len == len) {
            ++pos;
        }
        rangeEnd[len] = pos;
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
            if (rangeStart[len] == rangeEnd[len]) {
                continue;
            }

            const int count = findCount(entries, rangeStart[len], rangeEnd[len], code.lo, code.hi);
            if (count != 0) {
                ways[start + len] += base * static_cast<long long>(count);
            }
        }
    }

    cout << ways[L] << '\n';
    return 0;
}
