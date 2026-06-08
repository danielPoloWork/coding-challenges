/*
 * LeetCode 3563 - Lexicographically Smallest String After Adjacent Removals
 *
 * Memory-extreme solution.
 *
 * This C variant stores removable intervals as fixed 64-bit masks and stores the answer
 * as linked choices. It intentionally avoids intermediate strings and the O(n^2)
 * comparison table used by the C++ runtime variant.
 */

#include <stdlib.h>
#include <string.h>

#define MAX_N 250
#define WORDS ((MAX_N + 63) / 64)

static int consecutive(char a, char b) {
    int d = (int)a - (int)b;
    if (d < 0) d = -d;
    return d == 1 || d == 25;
}

static int test_bit(const unsigned long long rows[MAX_N][WORDS], int row, int bit) {
    return (int)((rows[row][bit >> 6] >> (bit & 63)) & 1ULL);
}

static void set_bit(unsigned long long rows[MAX_N][WORDS], int row, int bit) {
    rows[row][bit >> 6] |= 1ULL << (bit & 63);
}

static int has_intersection(
    const unsigned long long a[MAX_N][WORDS],
    const unsigned long long b[MAX_N][WORDS],
    int row_a,
    int row_b
) {
    for (int word = 0; word < WORDS; ++word) {
        if ((a[row_a][word] & b[row_b][word]) != 0ULL) return 1;
    }
    return 0;
}

static int answer_less(
    int a,
    int b,
    const char *s,
    const unsigned char empty[MAX_N + 1],
    const int keep[MAX_N + 1]
) {
    while (a != b) {
        if (empty[a]) return !empty[b];
        if (empty[b]) return 0;

        const char ca = s[keep[a]];
        const char cb = s[keep[b]];
        if (ca != cb) return ca < cb;

        a = keep[a] + 1;
        b = keep[b] + 1;
    }
    return 0;
}

char *lexicographicallySmallestString(char *s) {
    const int n = (int)strlen(s);
    unsigned long long removable[MAX_N][WORDS] = {{0ULL}};
    unsigned long long starts_before_end[MAX_N][WORDS] = {{0ULL}};

    for (int len = 2; len <= n; len += 2) {
        for (int left = 0; left + len <= n; ++left) {
            const int right = left + len - 1;
            int ok = consecutive(s[left], s[right]) &&
                     (len == 2 || test_bit(removable, left + 1, right - 1));

            if (!ok && has_intersection(removable, starts_before_end, left, right)) {
                ok = 1;
            }

            if (ok) {
                set_bit(removable, left, right);
                if (left > 0) {
                    set_bit(starts_before_end, right, left - 1);
                }
            }
        }
    }

    unsigned char empty[MAX_N + 1] = {0};
    int keep[MAX_N + 1];
    for (int i = 0; i <= n; ++i) keep[i] = -1;
    empty[n] = 1;

    for (int i = n - 1; i >= 0; --i) {
        if (test_bit(removable, i, n - 1)) {
            empty[i] = 1;
            keep[i] = -1;
            continue;
        }

        int chosen = -1;
        for (int j = i; j < n; ++j) {
            if (j != i && !test_bit(removable, i, j - 1)) continue;

            if (chosen < 0 ||
                s[j] < s[chosen] ||
                (s[j] == s[chosen] && answer_less(j + 1, chosen + 1, s, empty, keep))) {
                chosen = j;
            }
        }
        empty[i] = 0;
        keep[i] = chosen;
    }

    char *out = (char *)malloc((size_t)n + 1U);
    if (out == NULL) return NULL;

    int length = 0;
    for (int pos = 0; pos < n && !empty[pos]; pos = keep[pos] + 1) {
        out[length++] = s[keep[pos]];
    }
    out[length] = '\0';
    return out;
}
