#include <stdlib.h>

static int compareRestrictionIds(const void* left, const void* right) {
    const int* const* a = (const int* const*)left;
    const int* const* b = (const int* const*)right;
    return ((*a)[0] > (*b)[0]) - ((*a)[0] < (*b)[0]);
}

int maxBuilding(int n, int** restrictions, int restrictionsSize,
                int* restrictionsColSize) {
    (void)restrictionsColSize;

    if (restrictionsSize > 1) {
        qsort(restrictions, restrictionsSize, sizeof(int*), compareRestrictionIds);
    }

    long long previousId = 1;
    long long previousHeight = 0;
    for (int i = 0; i < restrictionsSize; ++i) {
        const long long id = restrictions[i][0];
        const long long reachable = previousHeight + id - previousId;
        if (restrictions[i][1] > reachable) {
            restrictions[i][1] = (int)reachable;
        }
        previousId = id;
        previousHeight = restrictions[i][1];
    }

    long long nextId = n;
    long long nextHeight = n - 1LL;
    for (int i = restrictionsSize - 1; i >= 0; --i) {
        const long long id = restrictions[i][0];
        const long long reachable = nextHeight + nextId - id;
        if (restrictions[i][1] > reachable) {
            restrictions[i][1] = (int)reachable;
        }
        nextId = id;
        nextHeight = restrictions[i][1];
    }

    long long best = 0;
    previousId = 1;
    previousHeight = 0;
    for (int i = 0; i < restrictionsSize; ++i) {
        const long long id = restrictions[i][0];
        const long long height = restrictions[i][1];
        const long long distance = id - previousId;
        const long long peak = (previousHeight + height + distance) / 2;
        if (peak > best) {
            best = peak;
        }
        previousId = id;
        previousHeight = height;
    }

    const long long tailPeak = previousHeight + n - previousId;
    if (tailPeak > best) {
        best = tailPeak;
    }

    return (int)best;
}
