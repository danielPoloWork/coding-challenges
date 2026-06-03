// LeetCode 3635 - Earliest Finish Time for Land and Water Rides II
// Recommended solution: fast + lean.
//
// This problem is Pareto-optimal: the O(n + m) time / O(1) extra-space scan below is
// simultaneously the recommended, the speed-extreme, and the memory-extreme answer.
// Reading every ride is an unavoidable Omega(n + m) lower bound, and no auxiliary
// structure is needed - so there is no genuinely different, non-dominated speed or
// memory variant to ship (see notes.md). Hence a single file.
//
// Key insight: the two rides come from different categories, so the choice of the first
// ride and of the second ride are independent. Fix an order, say land first. For a first
// land ride i (finishing at landFinish_i) followed by a water ride j, the total finish is
//
//     max(landFinish_i, waterStart_j) + waterDuration_j,
//
// which is non-decreasing in landFinish_i. Therefore, whatever the second ride is, we
// only ever want the first ride with the SMALLEST finish time. That collapses the naive
// O(n*m) pairing into independent linear scans:
//
//   bestLandFinish  = min_i (landStart_i  + landDuration_i)   // earliest land-first finish
//   bestWaterFinish = min_j (waterStart_j + waterDuration_j)  // earliest water-first finish
//   answer = min( min_j max(bestLandFinish,  waterStart_j) + waterDuration_j,   // land then water
//                 min_i max(bestWaterFinish, landStart_i)  + landDuration_i )   // water then land
//
// Values stay tiny (start, duration <= 1e5, so every sum <= ~3e5), so int never overflows.

#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

class Solution {
public:
    int earliestFinishTime(vector<int>& landStartTime, vector<int>& landDuration,
                           vector<int>& waterStartTime, vector<int>& waterDuration) {
        const int n = static_cast<int>(landStartTime.size());
        const int m = static_cast<int>(waterStartTime.size());

        // Earliest moment each category can be finished when it is the first ride.
        int bestLandFinish = INT_MAX;
        for (int i = 0; i < n; ++i)
            bestLandFinish = min(bestLandFinish, landStartTime[i] + landDuration[i]);

        int bestWaterFinish = INT_MAX;
        for (int j = 0; j < m; ++j)
            bestWaterFinish = min(bestWaterFinish, waterStartTime[j] + waterDuration[j]);

        int answer = INT_MAX;

        // Order 1: land ride first (use the earliest land finish), then each water ride.
        for (int j = 0; j < m; ++j)
            answer = min(answer, max(bestLandFinish, waterStartTime[j]) + waterDuration[j]);

        // Order 2: water ride first (use the earliest water finish), then each land ride.
        for (int i = 0; i < n; ++i)
            answer = min(answer, max(bestWaterFinish, landStartTime[i]) + landDuration[i]);

        return answer;
    }
};
