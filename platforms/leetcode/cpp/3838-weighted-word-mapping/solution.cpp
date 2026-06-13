// LeetCode 3838 - Weighted Word Mapping
// Recommended solution: scan each word once, sum direct-addressed letter
// weights, then map the modulo-26 residue through the reverse alphabet.

#include <cstddef>
#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    string mapWordWeights(vector<string>& words, vector<int>& weights) {
        const int* weight = weights.data();
        string answer(words.size(), '\0');

        for (size_t i = 0; i < words.size(); ++i) {
            int total = 0;
            for (char c : words[i]) {
                total += weight[c - 'a'];
            }
            answer[i] = static_cast<char>('z' - (total % 26));
        }

        return answer;
    }
};
