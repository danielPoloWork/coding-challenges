// LeetCode 3509 - Maximum Product of Subsequences With an Alternating Sum Equal to K
// Memory extreme: exact-width C bitsets over compressed positive product rows.

#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

static inline void set_bit(uint64_t* bits, int position) {
    bits[position >> 6] |= 1ULL << (position & 63);
}

static inline bool has_bit(const uint64_t* bits, int position) {
    return ((bits[position >> 6] >> (position & 63)) & 1ULL) != 0;
}

static void or_bits(uint64_t* dst, const uint64_t* src, int words, uint64_t lastMask) {
    for (int i = 0; i < words; ++i) {
        dst[i] |= src[i];
    }
    dst[words - 1] &= lastMask;
}

static void shift_or_left(uint64_t* dst, const uint64_t* src, int words, int shift, uint64_t lastMask) {
    const int whole = shift >> 6;
    const int rem = shift & 63;

    for (int i = words - 1; i >= 0; --i) {
        uint64_t value = 0;
        const int from = i - whole;

        if (from >= 0) {
            value |= src[from] << rem;
            if (rem != 0 && from > 0) {
                value |= src[from - 1] >> (64 - rem);
            }
        }

        dst[i] |= value;
    }

    dst[words - 1] &= lastMask;
}

static void shift_or_right(uint64_t* dst, const uint64_t* src, int words, int shift, uint64_t lastMask) {
    const int whole = shift >> 6;
    const int rem = shift & 63;

    for (int i = 0; i < words; ++i) {
        uint64_t value = 0;
        const int from = i + whole;

        if (from < words) {
            value |= src[from] >> rem;
            if (rem != 0 && from + 1 < words) {
                value |= src[from + 1] << (64 - rem);
            }
        }

        dst[i] |= value;
    }

    dst[words - 1] &= lastMask;
}

int maxProduct(int* nums, int numsSize, int k, int limit) {
    int total = 0;
    bool present[13] = {false};

    for (int i = 0; i < numsSize; ++i) {
        total += nums[i];
        if (nums[i] > 1) {
            present[nums[i]] = true;
        }
    }

    if (k < -total || k > total) {
        return -1;
    }

    int* productIndex = (int*)malloc((size_t)(limit + 1) * sizeof(int));
    bool* canProduct = (bool*)calloc((size_t)(limit + 1), sizeof(bool));
    int* queue = (int*)malloc((size_t)(limit + 1) * sizeof(int));

    for (int product = 0; product <= limit; ++product) {
        productIndex[product] = -1;
    }

    int head = 0;
    int tail = 0;
    canProduct[1] = true;
    queue[tail++] = 1;

    while (head < tail) {
        const int product = queue[head++];
        for (int value = 2; value <= 12; ++value) {
            if (!present[value] || product > limit / value) {
                continue;
            }

            const int nextProduct = product * value;
            if (!canProduct[nextProduct]) {
                canProduct[nextProduct] = true;
                queue[tail++] = nextProduct;
            }
        }
    }

    int productCount = 0;
    for (int product = 1; product <= limit; ++product) {
        if (canProduct[product]) {
            productIndex[product] = productCount++;
        }
    }

    int* products = (int*)malloc((size_t)productCount * sizeof(int));
    for (int product = 1; product <= limit; ++product) {
        if (canProduct[product]) {
            products[productIndex[product]] = product;
        }
    }

    const int offset = total;
    const int width = total * 2 + 1;
    const int words = (width + 63) >> 6;
    const uint64_t lastMask = (width & 63) == 0 ? UINT64_MAX : ((1ULL << (width & 63)) - 1ULL);
    const size_t bytes = (size_t)words * sizeof(uint64_t);
    const size_t tableWords = (size_t)productCount * (size_t)words;

    uint64_t* odd = (uint64_t*)calloc(tableWords, sizeof(uint64_t));
    uint64_t* even = (uint64_t*)calloc(tableWords, sizeof(uint64_t));
    bool* active = (bool*)calloc((size_t)productCount, sizeof(bool));

    uint64_t* anyOdd = (uint64_t*)calloc((size_t)words, sizeof(uint64_t));
    uint64_t* anyEven = (uint64_t*)calloc((size_t)words, sizeof(uint64_t));
    uint64_t* zeroOdd = (uint64_t*)calloc((size_t)words, sizeof(uint64_t));
    uint64_t* zeroEven = (uint64_t*)calloc((size_t)words, sizeof(uint64_t));
    uint64_t* oldAnyOdd = (uint64_t*)malloc(bytes);
    uint64_t* oldAnyEven = (uint64_t*)malloc(bytes);
    uint64_t* oldZeroOdd = (uint64_t*)malloc(bytes);
    uint64_t* oldZeroEven = (uint64_t*)malloc(bytes);
    uint64_t* tmpOdd = (uint64_t*)malloc(bytes);
    uint64_t* tmpEven = (uint64_t*)malloc(bytes);

    for (int i = 0; i < numsSize; ++i) {
        const int x = nums[i];

        memcpy(oldAnyOdd, anyOdd, bytes);
        memcpy(oldAnyEven, anyEven, bytes);
        memcpy(oldZeroOdd, zeroOdd, bytes);
        memcpy(oldZeroEven, zeroEven, bytes);

        shift_or_left(anyOdd, oldAnyEven, words, x, lastMask);
        shift_or_right(anyEven, oldAnyOdd, words, x, lastMask);
        set_bit(anyOdd, offset + x);

        shift_or_left(zeroOdd, oldZeroEven, words, x, lastMask);
        shift_or_right(zeroEven, oldZeroOdd, words, x, lastMask);
        if (x == 0) {
            set_bit(zeroOdd, offset);
            or_bits(zeroOdd, oldAnyEven, words, lastMask);
            or_bits(zeroEven, oldAnyOdd, words, lastMask);
        }

        if (x == 0) {
            continue;
        }

        if (x == 1) {
            for (int index = 0; index < productCount; ++index) {
                if (!active[index]) {
                    continue;
                }

                uint64_t* oddRow = odd + (size_t)index * (size_t)words;
                uint64_t* evenRow = even + (size_t)index * (size_t)words;
                memcpy(tmpOdd, oddRow, bytes);
                memcpy(tmpEven, evenRow, bytes);
                shift_or_right(evenRow, tmpOdd, words, 1, lastMask);
                shift_or_left(oddRow, tmpEven, words, 1, lastMask);
            }
        } else {
            for (int index = productCount; index-- > 0;) {
                if (!active[index]) {
                    continue;
                }

                const int product = products[index];
                if (product > limit / x) {
                    continue;
                }

                const int nextIndex = productIndex[product * x];
                uint64_t* oddRow = odd + (size_t)index * (size_t)words;
                uint64_t* evenRow = even + (size_t)index * (size_t)words;
                uint64_t* nextOddRow = odd + (size_t)nextIndex * (size_t)words;
                uint64_t* nextEvenRow = even + (size_t)nextIndex * (size_t)words;

                shift_or_right(nextEvenRow, oddRow, words, x, lastMask);
                shift_or_left(nextOddRow, evenRow, words, x, lastMask);
                active[nextIndex] = true;
            }
        }

        if (x <= limit) {
            const int singleIndex = productIndex[x];
            if (singleIndex >= 0) {
                set_bit(odd + (size_t)singleIndex * (size_t)words, offset + x);
                active[singleIndex] = true;
            }
        }
    }

    const int target = offset + k;
    int answer = -1;

    for (int index = productCount; index-- > 0;) {
        if (!active[index]) {
            continue;
        }

        const uint64_t* oddRow = odd + (size_t)index * (size_t)words;
        const uint64_t* evenRow = even + (size_t)index * (size_t)words;
        if (has_bit(oddRow, target) || has_bit(evenRow, target)) {
            answer = products[index];
            break;
        }
    }

    if (answer == -1 && (has_bit(zeroOdd, target) || has_bit(zeroEven, target))) {
        answer = 0;
    }

    free(productIndex);
    free(canProduct);
    free(queue);
    free(products);
    free(odd);
    free(even);
    free(active);
    free(anyOdd);
    free(anyEven);
    free(zeroOdd);
    free(zeroEven);
    free(oldAnyOdd);
    free(oldAnyEven);
    free(oldZeroOdd);
    free(oldZeroEven);
    free(tmpOdd);
    free(tmpEven);

    return answer;
}
