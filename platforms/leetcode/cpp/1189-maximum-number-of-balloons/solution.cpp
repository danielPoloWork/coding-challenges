// LeetCode 1189 - Maximum Number of Balloons
// Recommended and fastest-runtime solution: one direct-address frequency scan.
//
// Counting all 26 lowercase letters keeps the hot loop branch-free: each input
// byte performs one indexed increment, then the answer is the limiting count
// among b, a, l/2, o/2, and n.

#include <string>
using namespace std;

class Solution {
public:
    int maxNumberOfBalloons(const string& text) {
        int freq[26] = {};

        for (char c : text) {
            ++freq[c - 'a'];
        }

        int answer = freq['b' - 'a'];

        if (freq['a' - 'a'] < answer) answer = freq['a' - 'a'];

        const int lPairs = freq['l' - 'a'] >> 1;
        if (lPairs < answer) answer = lPairs;

        const int oPairs = freq['o' - 'a'] >> 1;
        if (oPairs < answer) answer = oPairs;

        if (freq['n' - 'a'] < answer) answer = freq['n' - 'a'];

        return answer;
    }
};
