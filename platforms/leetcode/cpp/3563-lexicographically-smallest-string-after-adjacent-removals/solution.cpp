/*
 * LeetCode 3563 - Lexicographically Smallest String After Adjacent Removals
 *
 * Recommended fast + lean solution.
 *
 * First mark every interval that can be deleted completely. A removable interval is either
 * enclosed by a consecutive endpoint pair, or is the concatenation of two removable
 * intervals. Then build the lexicographically smallest suffix answer: if s[i..n-1] can
 * disappear, the answer is empty; otherwise choose the next kept character s[j] such that
 * the skipped prefix s[i..j-1] can disappear.
 */

#include <bits/stdc++.h>
using namespace std;

class Solution {
    static constexpr int MAX_N = 250;

    static bool consecutive(char a, char b) {
        const int d = abs(static_cast<int>(a) - static_cast<int>(b));
        return d == 1 || d == 25;
    }

public:
    string lexicographicallySmallestString(string s) {
        const int n = static_cast<int>(s.size());
        array<bitset<MAX_N>, MAX_N> removable{};
        array<bitset<MAX_N>, MAX_N> startsBeforeEnd{};

        for (int len = 2; len <= n; len += 2) {
            for (int left = 0; left + len <= n; ++left) {
                const int right = left + len - 1;
                bool ok = consecutive(s[left], s[right]) &&
                          (len == 2 || removable[left + 1].test(right - 1));

                if (!ok && (removable[left] & startsBeforeEnd[right]).any()) {
                    ok = true;
                }

                if (ok) {
                    removable[left].set(right);
                    if (left > 0) {
                        startsBeforeEnd[right].set(left - 1);
                    }
                }
            }
        }

        vector<string> best(n + 1);
        for (int i = n - 1; i >= 0; --i) {
            if (removable[i].test(n - 1)) {
                best[i].clear();
                continue;
            }

            bool hasCandidate = false;
            string chosen;
            for (int j = i; j < n; ++j) {
                if (j == i || removable[i].test(j - 1)) {
                    string candidate;
                    candidate.reserve(best[j + 1].size() + 1);
                    candidate.push_back(s[j]);
                    candidate += best[j + 1];

                    if (!hasCandidate || candidate < chosen) {
                        chosen = move(candidate);
                        hasCandidate = true;
                    }
                }
            }
            best[i] = move(chosen);
        }

        return best[0];
    }
};
