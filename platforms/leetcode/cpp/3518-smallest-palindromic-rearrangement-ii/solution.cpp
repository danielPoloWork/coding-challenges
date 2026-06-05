// LeetCode 3518 - Smallest Palindromic Rearrangement II
// Recommended solution: greedy half construction with compact capped combinations.
//
// Palindromic permutations are determined entirely by their left half. At each
// position, try letters from 'a' to 'z' and count how many distinct half-permutations
// remain after fixing that letter. Counts are saturated at k, so all arithmetic stays
// small even when the true multinomial value is enormous.

#include <algorithm>
#include <array>
#include <string>
#include <vector>
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

        auto choose = buildChooseTable(halfLen);
        if (countPermutations(half, k, choose) < k) return "";

        string left;
        left.reserve(halfLen);

        for (int pos = 0; pos < halfLen; ++pos) {
            for (int c = 0; c < 26; ++c) {
                if (half[c] == 0) continue;

                --half[c];
                const long long ways = countPermutations(half, k, choose);
                if (ways >= k) {
                    left.push_back(static_cast<char>('a' + c));
                    break;
                }

                k -= static_cast<int>(ways);
                ++half[c];
            }
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
    static constexpr long long Cap = 1'000'001LL;

    using ChooseTable = vector<array<long long, MaxR + 1>>;

    static ChooseTable buildChooseTable(int n) {
        ChooseTable choose(n + 1);
        for (auto& row : choose) row.fill(0);
        choose[0][0] = 1;

        for (int i = 1; i <= n; ++i) {
            choose[i][0] = 1;
            const int upto = min(i, MaxR);
            for (int r = 1; r <= upto; ++r) {
                const long long left = choose[i - 1][r - 1];
                const long long right = (r <= i - 1) ? choose[i - 1][r] : 0;
                choose[i][r] = min(Cap, left + right);
            }
        }

        return choose;
    }

    static long long nCrCapped(int n, int r, long long cap, const ChooseTable& choose) {
        if (r < 0 || r > n) return 0;
        r = min(r, n - r);
        if (r > MaxR) return cap;
        return min(choose[n][r], cap);
    }

    static long long countPermutations(const array<int, 26>& count,
                                       long long cap,
                                       const ChooseTable& choose) {
        int total = 0;
        for (int freq : count) total += freq;

        long long ways = 1;
        for (int freq : count) {
            if (freq == 0) continue;

            const long long combinations = nCrCapped(total, freq, cap, choose);
            if (combinations != 0 && ways > cap / combinations) return cap;
            ways *= combinations;
            if (ways >= cap) return cap;
            total -= freq;
        }

        return ways;
    }
};
