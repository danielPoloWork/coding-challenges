#include <bits/stdc++.h>
using namespace std;

class Solution {
    struct WordSet {
        vector<unsigned long long> bits;
        vector<int> parent;

        void init(int length) {
            int words = (length + 63) >> 6;
            bits.assign(words, ~0ULL);
            if (words > 0) {
                int remaining = length & 63;
                if (remaining != 0) {
                    bits.back() = (1ULL << remaining) - 1ULL;
                }
            }

            parent.resize(words + 1);
            iota(parent.begin(), parent.end(), 0);
        }

        int findWord(int word) {
            while (parent[word] != word) {
                parent[word] = parent[parent[word]];
                word = parent[word];
            }
            return word;
        }

        void clearIndex(int compressed) {
            int word = compressed >> 6;
            int bit = compressed & 63;
            bits[word] &= ~(1ULL << bit);
            if (bits[word] == 0) {
                parent[word] = findWord(word + 1);
            }
        }
    };

public:
    vector<int> minReverseOperations(int n, int p, vector<int>& banned, int k) {
        vector<int> answer(n, -1);
        for (int x : banned) {
            answer[x] = -2;
        }
        answer[p] = 0;

        array<WordSet, 2> alive;
        alive[0].init((n + 1) / 2);
        alive[1].init(n / 2);

        for (int x : banned) {
            alive[x & 1].clearIndex(x >> 1);
        }
        alive[p & 1].clearIndex(p >> 1);

        vector<int> queue(n);
        int head = 0;
        int tail = 0;
        queue[tail++] = p;

        while (head < tail) {
            int index = queue[head++];
            int nextDistance = answer[index] + 1;

            int low = max(index - k + 1, k - 1 - index);
            int high = min(index + k - 1, 2 * n - k - 1 - index);
            int parity = low & 1;
            int left = low >> 1;
            int right = high >> 1;
            int firstWord = left >> 6;
            int lastWord = right >> 6;

            WordSet& set = alive[parity];
            for (int word = set.findWord(firstWord); word <= lastWord; ) {
                int firstBit = (word == firstWord) ? (left & 63) : 0;
                int lastBit = (word == lastWord) ? (right & 63) : 63;

                unsigned long long mask = set.bits[word] & (~0ULL << firstBit);
                if (lastBit != 63) {
                    mask &= (1ULL << (lastBit + 1)) - 1ULL;
                }

                while (mask != 0) {
                    int bit = __builtin_ctzll(mask);
                    int compressed = (word << 6) + bit;
                    int position = (compressed << 1) | parity;

                    answer[position] = nextDistance;
                    queue[tail++] = position;
                    set.bits[word] &= ~(1ULL << bit);
                    mask &= mask - 1;
                }

                if (set.bits[word] == 0) {
                    set.parent[word] = set.findWord(word + 1);
                }
                word = set.findWord(word + 1);
            }
        }

        for (int& value : answer) {
            if (value == -2) {
                value = -1;
            }
        }
        return answer;
    }
};
