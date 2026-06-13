// LeetCode 3751 - Total Waviness of Numbers in Range I
// Speed extreme: one-time prefix table over the full constrained domain.
//
// LeetCode often executes many test cases in the same process. Paying the fixed
// 100000-number setup once turns each submitted call into two array reads.

#include <array>
using namespace std;

class Solution {
public:
    int totalWaviness(int num1, int num2) {
        const auto& pref = prefixTable();
        return pref[num2] - pref[num1 - 1];
    }

private:
    static int waviness(int n) {
        if (n < 100) return 0;

        int place = 1;
        while (place <= n / 10) place *= 10;

        int left = n / place;
        n %= place;
        place /= 10;

        int mid = n / place;
        n %= place;
        place /= 10;

        int waves = 0;
        while (place > 0) {
            const int right = n / place;
            n %= place;
            place /= 10;

            if ((mid > left && mid > right) || (mid < left && mid < right)) {
                ++waves;
            }
            left = mid;
            mid = right;
        }

        return waves;
    }

    static const array<int, 100001>& prefixTable() {
        static const array<int, 100001> pref = [] {
            array<int, 100001> values{};
            for (int n = 1; n <= 100000; ++n) {
                values[n] = values[n - 1] + waviness(n);
            }
            return values;
        }();
        return pref;
    }
};
