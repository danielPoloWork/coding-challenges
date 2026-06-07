/* LeetCode 3303 - Find the Occurrence of First Almost Equal Substring
 * Memory-extreme solution: reusable Z buffer over a virtual joined string.
 *
 * The algorithm still computes prefix/suffix agreement in linear time, but the
 * joined string is addressed virtually: pattern + '{' + s, optionally reversed.
 * This avoids extra concatenated and reversed character buffers.
 */

#include <stdlib.h>
#include <string.h>

static char joined_at(const char* s, const char* pattern, int n, int m, int index, int reversed) {
    if (index < m) {
        return reversed ? pattern[m - 1 - index] : pattern[index];
    }
    if (index == m) {
        return '{'; /* one past 'z', so it cannot appear in either input */
    }

    const int pos = index - m - 1;
    return reversed ? s[n - 1 - pos] : s[pos];
}

static void build_z_virtual(const char* s, const char* pattern, int n, int m, int reversed, int* z) {
    const int len = n + m + 1;
    int left = 0;
    int right = 0;

    z[0] = 0;
    for (int i = 1; i < len; ++i) {
        int value = 0;
        if (i <= right) {
            const int mirror = i - left;
            const int limit = right - i + 1;
            value = z[mirror] < limit ? z[mirror] : limit;
        }

        while (i + value < len &&
               joined_at(s, pattern, n, m, value, reversed) ==
                   joined_at(s, pattern, n, m, i + value, reversed)) {
            ++value;
        }

        z[i] = value;
        if (i + value - 1 > right) {
            left = i;
            right = i + value - 1;
        }
    }
}

int minStartingIndex(char* s, char* pattern) {
    const int n = (int)strlen(s);
    const int m = (int)strlen(pattern);
    const int windows = n - m + 1;
    const int len = n + m + 1;
    const int base = m + 1;
    const int need = m - 1;

    int* z = (int*)malloc((size_t)len * sizeof(int));
    int* left = (int*)malloc((size_t)windows * sizeof(int));
    if (z == NULL || left == NULL) {
        free(z);
        free(left);
        return -1;
    }

    build_z_virtual(s, pattern, n, m, 0, z);
    for (int i = 0; i < windows; ++i) {
        const int match = z[base + i];
        left[i] = match < m ? match : m;
    }

    build_z_virtual(s, pattern, n, m, 1, z);
    int answer = -1;
    for (int i = 0; i < windows; ++i) {
        const int reversed_start = n - m - i;
        const int match = z[base + reversed_start];
        const int right = match < m ? match : m;
        if (left[i] + right >= need) {
            answer = i;
            break;
        }
    }

    free(left);
    free(z);
    return answer;
}
