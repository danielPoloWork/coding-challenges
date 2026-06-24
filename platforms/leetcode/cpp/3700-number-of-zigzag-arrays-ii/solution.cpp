// LeetCode 3700 - Number of ZigZag Arrays II
// Pareto-optimal solution: alternating-rank DP compressed to a linear recurrence.
//
// The hinted transition is a fixed matrix over value ranks. Instead of exponentiating
// the matrix directly, generate enough terms from the O(m) mirrored DP, recover the
// minimal recurrence with Berlekamp-Massey, then compute the requested term with
// Kitamasa polynomial exponentiation.

#include <array>
#include <vector>
using namespace std;

class Solution {
    static constexpr int MOD = 1000000007;
    static constexpr int MAX_M = 75;

public:
    int zigZagArrays(int n, int l, int r) {
        const int m = r - l + 1;
        if (n == 1) return m;
        if (m == 1) return 0;

        const int sampleCount = 2 * m + 5;
        vector<int> terms = buildTermsFromLengthTwo(m, sampleCount);
        const long long indexFromLengthTwo = static_cast<long long>(n) - 2;
        if (indexFromLengthTwo < static_cast<long long>(terms.size())) {
            return terms[static_cast<size_t>(indexFromLengthTwo)];
        }

        vector<int> recurrence = berlekampMassey(terms);
        return kthTerm(terms, recurrence, indexFromLengthTwo);
    }

private:
    static vector<int> buildTermsFromLengthTwo(int m, int count) {
        vector<int> terms;
        terms.reserve(count);

        array<int, MAX_M> cur{};
        array<int, MAX_M> nxt{};

        for (int y = 0; y < m; ++y) cur[y] = y;
        terms.push_back(static_cast<int>(1LL * m * (m - 1) % MOD));

        for (int produced = 1; produced < count; ++produced) {
            int run = 0;
            nxt[0] = 0;
            for (int y = 1; y < m; ++y) {
                run += cur[m - y];
                if (run >= MOD) run -= MOD;
                nxt[y] = run;
            }

            int oneDirection = 0;
            for (int y = 0; y < m; ++y) {
                oneDirection += nxt[y];
                if (oneDirection >= MOD) oneDirection -= MOD;
                cur[y] = nxt[y];
            }

            terms.push_back(static_cast<int>(2LL * oneDirection % MOD));
        }

        return terms;
    }

    static int modPow(long long base, long long exponent) {
        long long result = 1;
        while (exponent > 0) {
            if (exponent & 1LL) result = result * base % MOD;
            base = base * base % MOD;
            exponent >>= 1LL;
        }
        return static_cast<int>(result);
    }

    static vector<int> berlekampMassey(const vector<int>& sequence) {
        vector<int> current{1};
        vector<int> previous{1};
        int previousDiscrepancy = 1;
        int shift = 1;
        int order = 0;

        for (int n = 0; n < static_cast<int>(sequence.size()); ++n) {
            long long discrepancy = 0;
            for (int i = 0; i < static_cast<int>(current.size()); ++i) {
                if (i > n) break;
                discrepancy += 1LL * current[i] * sequence[n - i] % MOD;
                if (discrepancy >= MOD) discrepancy -= MOD;
            }

            if (discrepancy == 0) {
                ++shift;
                continue;
            }

            vector<int> beforeUpdate = current;
            const long long scale = discrepancy * modPow(previousDiscrepancy, MOD - 2) % MOD;
            if (current.size() < previous.size() + static_cast<size_t>(shift)) {
                current.resize(previous.size() + shift);
            }

            for (int i = 0; i < static_cast<int>(previous.size()); ++i) {
                long long value = current[i + shift] - scale * previous[i] % MOD;
                if (value < 0) value += MOD;
                current[i + shift] = static_cast<int>(value);
            }

            if (2 * order <= n) {
                order = n + 1 - order;
                previous = beforeUpdate;
                previousDiscrepancy = static_cast<int>(discrepancy);
                shift = 1;
            } else {
                ++shift;
            }
        }

        vector<int> recurrence;
        recurrence.reserve(current.size() - 1);
        for (int i = 1; i < static_cast<int>(current.size()); ++i) {
            recurrence.push_back((MOD - current[i]) % MOD);
        }
        return recurrence;
    }

    static vector<int> multiplyPolynomials(const vector<int>& a,
                                           const vector<int>& b,
                                           const vector<int>& recurrence) {
        const int d = static_cast<int>(recurrence.size());
        vector<int> product(2 * d - 1);

        for (int i = 0; i < d; ++i) {
            if (a[i] == 0) continue;
            for (int j = 0; j < d; ++j) {
                if (b[j] == 0) continue;
                product[i + j] = static_cast<int>(
                    (product[i + j] + 1LL * a[i] * b[j]) % MOD
                );
            }
        }

        for (int degree = 2 * d - 2; degree >= d; --degree) {
            const int carry = product[degree];
            if (carry == 0) continue;
            for (int j = 0; j < d; ++j) {
                product[degree - 1 - j] = static_cast<int>(
                    (product[degree - 1 - j] + 1LL * carry * recurrence[j]) % MOD
                );
            }
        }

        product.resize(d);
        return product;
    }

    static int kthTerm(const vector<int>& terms, const vector<int>& recurrence, long long k) {
        if (k < static_cast<long long>(terms.size())) return terms[static_cast<size_t>(k)];

        const int d = static_cast<int>(recurrence.size());
        if (d == 0) return 0;

        vector<int> coefficient(d);
        vector<int> power(d);
        coefficient[0] = 1;
        if (d == 1) {
            power[0] = recurrence[0];
        } else {
            power[1] = 1;
        }

        while (k > 0) {
            if (k & 1LL) {
                coefficient = multiplyPolynomials(coefficient, power, recurrence);
            }
            power = multiplyPolynomials(power, power, recurrence);
            k >>= 1LL;
        }

        long long answer = 0;
        for (int i = 0; i < d; ++i) {
            answer += 1LL * coefficient[i] * terms[i] % MOD;
            if (answer >= MOD) answer -= MOD;
        }
        return static_cast<int>(answer);
    }
};
