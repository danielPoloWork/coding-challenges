/*
 * LeetCode 3563 - Lexicographically Smallest String After Adjacent Removals
 *
 * Runtime-extreme solution.
 *
 * The interval DP uses fixed 64-bit masks instead of std::bitset. The answer DP stores
 * linked choices plus an O(1) comparison table between already computed suffix answers,
 * avoiding repeated string allocation and repeated lexicographic scans.
 */

#include <bits/stdc++.h>
using namespace std;

class Solution {
    static constexpr int MAX_N = 250;
    static constexpr int WORDS = (MAX_N + 63) / 64;
    using Rows = array<array<unsigned long long, WORDS>, MAX_N>;

    static bool consecutive(char a, char b) {
        const int d = abs(static_cast<int>(a) - static_cast<int>(b));
        return d == 1 || d == 25;
    }

    static bool testBit(const Rows& rows, int row, int bit) {
        return (rows[row][bit >> 6] >> (bit & 63)) & 1ULL;
    }

    static void setBit(Rows& rows, int row, int bit) {
        rows[row][bit >> 6] |= 1ULL << (bit & 63);
    }

    static bool hasIntersection(const Rows& a, const Rows& b, int rowA, int rowB) {
        for (int word = 0; word < WORDS; ++word) {
            if ((a[rowA][word] & b[rowB][word]) != 0ULL) {
                return true;
            }
        }
        return false;
    }

public:
    string lexicographicallySmallestString(string s) {
        const int n = static_cast<int>(s.size());
        Rows removable{};
        Rows startsBeforeEnd{};

        for (int len = 2; len <= n; len += 2) {
            for (int left = 0; left + len <= n; ++left) {
                const int right = left + len - 1;
                bool ok = consecutive(s[left], s[right]) &&
                          (len == 2 || testBit(removable, left + 1, right - 1));

                if (!ok && hasIntersection(removable, startsBeforeEnd, left, right)) {
                    ok = true;
                }

                if (ok) {
                    setBit(removable, left, right);
                    if (left > 0) {
                        setBit(startsBeforeEnd, right, left - 1);
                    }
                }
            }
        }

        array<int, MAX_N + 1> keep{};
        array<unsigned char, MAX_N + 1> empty{};
        array<array<unsigned char, MAX_N + 1>, MAX_N + 1> less{};

        keep.fill(-1);
        empty[n] = 1;

        auto answerLess = [&](int a, int b) -> bool {
            if (a == b) {
                return false;
            }
            if (empty[a]) {
                return !empty[b];
            }
            if (empty[b]) {
                return false;
            }
            const char ca = s[keep[a]];
            const char cb = s[keep[b]];
            if (ca != cb) {
                return ca < cb;
            }
            return less[keep[a] + 1][keep[b] + 1] != 0;
        };

        for (int i = n - 1; i >= 0; --i) {
            if (testBit(removable, i, n - 1)) {
                empty[i] = 1;
                keep[i] = -1;
            } else {
                empty[i] = 0;
                int chosen = -1;
                for (int j = i; j < n; ++j) {
                    if (j != i && !testBit(removable, i, j - 1)) {
                        continue;
                    }
                    if (chosen < 0 || s[j] < s[chosen] ||
                        (s[j] == s[chosen] && less[j + 1][chosen + 1])) {
                        chosen = j;
                    }
                }
                keep[i] = chosen;
            }

            for (int other = i + 1; other <= n; ++other) {
                less[i][other] = static_cast<unsigned char>(answerLess(i, other));
                less[other][i] = static_cast<unsigned char>(answerLess(other, i));
            }
        }

        string result;
        result.reserve(n);
        for (int pos = 0; pos < n && !empty[pos]; pos = keep[pos] + 1) {
            result.push_back(s[keep[pos]]);
        }
        return result;
    }
};
