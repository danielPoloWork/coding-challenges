#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<int> minReverseOperations(int n, int p, vector<int>& banned, int k) {
        vector<int> answer(n, -1);
        for (int x : banned) {
            answer[x] = -2;
        }
        answer[p] = 0;

        array<vector<int>, 2> parent;
        parent[0].resize((n + 1) / 2 + 1);
        parent[1].resize(n / 2 + 1);
        iota(parent[0].begin(), parent[0].end(), 0);
        iota(parent[1].begin(), parent[1].end(), 0);

        auto findRoot = [&](int parity, int x) {
            vector<int>& par = parent[parity];
            while (par[x] != x) {
                par[x] = par[par[x]];
                x = par[x];
            }
            return x;
        };

        auto erasePosition = [&](int pos) {
            int parity = pos & 1;
            int compressed = pos >> 1;
            parent[parity][compressed] = findRoot(parity, compressed + 1);
        };

        for (int x : banned) {
            erasePosition(x);
        }
        erasePosition(p);

        vector<int> queue(n);
        int head = 0;
        int tail = 0;
        queue[tail++] = p;

        while (head < tail) {
            int index = queue[head++];
            int nextDistance = answer[index] + 1;

            int low = max(index - k + 1, k - 1 - index);
            int high = min(index + k - 1, 2 * n - k - 1 - index);
            int parity = low & 1;
            int left = low >> 1;
            int right = high >> 1;

            vector<int>& par = parent[parity];
            for (int node = findRoot(parity, left); node <= right; ) {
                int position = (node << 1) | parity;
                answer[position] = nextDistance;
                queue[tail++] = position;

                par[node] = findRoot(parity, node + 1);
                node = par[node];
            }
        }

        for (int& value : answer) {
            if (value == -2) {
                value = -1;
            }
        }
        return answer;
    }
};
