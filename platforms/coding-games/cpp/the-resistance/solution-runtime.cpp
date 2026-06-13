#include <bits/stdc++.h>

using namespace std;

namespace {

const char* const MORSE[26] = {
    ".-", "-...", "-.-.", "-..", ".", "..-.", "--.", "....", "..",
    ".---", "-.-", ".-..", "--", "-.", "---", ".--.", "--.-", ".-.",
    "...", "-", "..-", "...-", ".--", "-..-", "-.--", "--.."
};

struct Node {
    int next[2];
    int terminal;

    Node() : next{-1, -1}, terminal(0) {}
};

int encodedLength(const string& word) {
    int length = 0;
    for (char ch : word) {
        for (const char* p = MORSE[ch - 'A']; *p; ++p) {
            ++length;
        }
    }
    return length;
}

}  // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string message;
    cin >> message;

    int n;
    cin >> n;

    vector<string> words;
    words.reserve(n);
    size_t totalEncodedLength = 0;
    int maxLen = 0;

    for (int i = 0; i < n; ++i) {
        string word;
        cin >> word;
        const int len = encodedLength(word);
        totalEncodedLength += static_cast<size_t>(len);
        maxLen = max(maxLen, len);
        words.push_back(move(word));
    }

    vector<Node> trie;
    trie.reserve(totalEncodedLength + 1);
    trie.emplace_back();

    for (const string& word : words) {
        int node = 0;
        for (char ch : word) {
            for (const char* p = MORSE[ch - 'A']; *p; ++p) {
                const int bit = (*p == '-');
                int& child = trie[node].next[bit];
                if (child == -1) {
                    child = static_cast<int>(trie.size());
                    trie.emplace_back();
                }
                node = child;
            }
        }
        ++trie[node].terminal;
    }

    vector<string>().swap(words);

    const int L = static_cast<int>(message.size());
    vector<long long> ways(L + 1, 0);
    ways[0] = 1;

    for (int start = 0; start < L; ++start) {
        const long long base = ways[start];
        if (base == 0) {
            continue;
        }

        int node = 0;
        const int limit = min(maxLen, L - start);
        for (int len = 1; len <= limit; ++len) {
            const int bit = (message[start + len - 1] == '-');
            const int child = trie[node].next[bit];
            if (child == -1) {
                break;
            }

            node = child;
            const int count = trie[node].terminal;
            if (count != 0) {
                ways[start + len] += base * static_cast<long long>(count);
            }
        }
    }

    cout << ways[L] << '\n';
    return 0;
}
