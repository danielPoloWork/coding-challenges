// LeetCode 1732 - Find the Highest Altitude
// Recommended solution: one running altitude and one running maximum.

#include <vector>
using namespace std;

class Solution {
public:
    int largestAltitude(vector<int>& gain) {
        int altitude = 0;
        int highest = 0;

        for (int delta : gain) {
            altitude += delta;
            if (altitude > highest) highest = altitude;
        }

        return highest;
    }
};
