#include <algorithm>
#include <utility>
#include <vector>

using namespace std;

class Solution {
public:
    int maxBuilding(int n, vector<vector<int>>& restrictions) {
        vector<pair<int, int>> limits;
        limits.reserve(restrictions.size() + 2);
        limits.emplace_back(1, 0);
        for (const auto& restriction : restrictions) {
            limits.emplace_back(restriction[0], restriction[1]);
        }
        limits.emplace_back(n, n - 1);

        sort(limits.begin(), limits.end());

        for (int i = 1; i < static_cast<int>(limits.size()); ++i) {
            const long long reachable =
                static_cast<long long>(limits[i - 1].second) +
                limits[i].first - limits[i - 1].first;
            if (limits[i].second > reachable) {
                limits[i].second = static_cast<int>(reachable);
            }
        }

        for (int i = static_cast<int>(limits.size()) - 2; i >= 0; --i) {
            const long long reachable =
                static_cast<long long>(limits[i + 1].second) +
                limits[i + 1].first - limits[i].first;
            if (limits[i].second > reachable) {
                limits[i].second = static_cast<int>(reachable);
            }
        }

        long long best = 0;
        for (int i = 1; i < static_cast<int>(limits.size()); ++i) {
            const long long leftHeight = limits[i - 1].second;
            const long long rightHeight = limits[i].second;
            const long long distance = limits[i].first - limits[i - 1].first;
            const long long peak = (leftHeight + rightHeight + distance) / 2;
            if (peak > best) {
                best = peak;
            }
        }

        return static_cast<int>(best);
    }
};
