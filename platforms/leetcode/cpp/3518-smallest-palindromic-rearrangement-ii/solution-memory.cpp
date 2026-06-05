// LeetCode 3518 - Smallest Palindromic Rearrangement II
// Memory-extreme solution: no combination table.
//
// This keeps only the 26 half-counts and computes capped binomial coefficients on
// demand. It uses the same deterministic block-size greedy as the runtime solution,
// but spends more arithmetic to avoid the precomputed table.

#include <algorithm>
#include <array>
#include <string>
using namespace std;

class Solution {
public:
    string smallestPalindrome(string s, int k) {
        const string& prelunthak = s;
        const int n = static_cast<int>(prelunthak.size());
        const int halfLen = n / 2;

        array<int, 26> half{};
        for (int i = 0; i < halfLen; ++i) {
            ++half[prelunthak[i] - 'a'];
        }

        if (countPermutations(half, k) < k) return "";

        string left;
        left.reserve(halfLen);

        for (int remaining = halfLen; remaining > 0; --remaining) {
            const long long threshold = 1LL * k * remaining;
            const long long total = countPermutations(half, threshold);

            int picked = -1;
            if (total >= threshold) {
                for (int c = 0; c < 26; ++c) {
                    if (half[c] > 0) {
                        picked = c;
                        break;
                    }
                }
            } else {
                for (int c = 0; c < 26; ++c) {
                    if (half[c] == 0) continue;

                    const long long block = total * half[c] / remaining;
                    if (block >= k) {
                        picked = c;
                        break;
                    }

                    k -= static_cast<int>(block);
                }
            }

            left.push_back(static_cast<char>('a' + picked));
            --half[picked];
        }

        string answer;
        answer.reserve(n);
        answer += left;
        if (n & 1) answer.push_back(prelunthak[halfLen]);
        for (int i = halfLen - 1; i >= 0; --i) answer.push_back(left[i]);
        return answer;
    }

private:
    static constexpr int MaxR = 32;

    static long long nCrCapped(int n, int r, long long cap) {
        if (r < 0 || r > n) return 0;
        r = min(r, n - r);
        if (r > MaxR) return cap;

        long long result = 1;
        for (int i = 1; i <= r; ++i) {
            result = result * (n - r + i) / i;
            if (result >= cap) return cap;
        }

        return result;
    }

    static long long countPermutations(const array<int, 26>& count, long long cap) {
        int total = 0;
        for (int freq : count) total += freq;

        long long ways = 1;
        for (int freq : count) {
            if (freq == 0) continue;

            const long long combinations = nCrCapped(total, freq, cap);
            if (combinations != 0 && ways > cap / combinations) return cap;
            ways *= combinations;
            if (ways >= cap) return cap;
            total -= freq;
        }

        return ways;
    }
};
