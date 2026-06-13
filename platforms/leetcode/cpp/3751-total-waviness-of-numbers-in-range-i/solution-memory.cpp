// LeetCode 3751 - Total Waviness of Numbers in Range I
// Memory extreme: direct arithmetic scan with no tables or digit buffers.

class Solution {
public:
    int totalWaviness(int num1, int num2) {
        if (num2 < 100) return 0;
        if (num1 < 100) num1 = 100;

        int total = 0;
        for (int n = num1; n <= num2; ++n) {
            total += waviness(n);
        }
        return total;
    }

private:
    static int waviness(int n) {
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
};
