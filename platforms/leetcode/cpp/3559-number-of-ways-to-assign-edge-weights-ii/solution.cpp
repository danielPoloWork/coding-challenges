// LeetCode 3559 - Number of Ways to Assign Edge Weights II
// Pareto-optimal solution: Tarjan offline LCA + parity counting.
//
// For a path with d edges, only the parity of the number of weight-1 edges
// matters. If d > 0, exactly half of the 2^d assignments have odd cost:
// 2^(d - 1). Tarjan's offline LCA gives every path length in near-linear time
// while keeping auxiliary memory linear.

#include <numeric>
#include <vector>
using namespace std;

class Solution {
    static constexpr int kMod = 1000000007;

    vector<int> dsu;
    vector<unsigned char> rank;

    int findRoot(int node) {
        while (dsu[node] != node) {
            dsu[node] = dsu[dsu[node]];
            node = dsu[node];
        }
        return node;
    }

    void unite(int a, int b) {
        int rootA = findRoot(a);
        int rootB = findRoot(b);
        if (rootA == rootB) return;
        if (rank[rootA] < rank[rootB]) {
            int tmp = rootA;
            rootA = rootB;
            rootB = tmp;
        }
        dsu[rootB] = rootA;
        if (rank[rootA] == rank[rootB]) ++rank[rootA];
    }

public:
    vector<int> assignEdgeWeights(vector<vector<int>>& edges, vector<vector<int>>& queries) {
        const int n = static_cast<int>(edges.size()) + 1;
        const int queryCount = static_cast<int>(queries.size());

        vector<int> pow2(n + 1, 1);
        for (int i = 1; i <= n; ++i) {
            pow2[i] = static_cast<int>((pow2[i - 1] * 2LL) % kMod);
        }

        vector<int> head(n + 1, -1);
        vector<int> to(2 * (n - 1));
        vector<int> nextEdge(2 * (n - 1));
        int edgeIndex = 0;

        const auto addEdge = [&](int u, int v) {
            to[edgeIndex] = v;
            nextEdge[edgeIndex] = head[u];
            head[u] = edgeIndex++;
        };

        for (const vector<int>& edge : edges) {
            addEdge(edge[0], edge[1]);
            addEdge(edge[1], edge[0]);
        }

        vector<int> queryHead(n + 1, -1);
        vector<int> queryTo(2 * queryCount);
        vector<int> queryId(2 * queryCount);
        vector<int> nextQuery(2 * queryCount);
        vector<int> answer(queryCount, 0);
        int queryEdgeIndex = 0;

        const auto addQueryEdge = [&](int u, int v, int id) {
            queryTo[queryEdgeIndex] = v;
            queryId[queryEdgeIndex] = id;
            nextQuery[queryEdgeIndex] = queryHead[u];
            queryHead[u] = queryEdgeIndex++;
        };

        for (int id = 0; id < queryCount; ++id) {
            const int u = queries[id][0];
            const int v = queries[id][1];
            if (u == v) continue;
            addQueryEdge(u, v, id);
            addQueryEdge(v, u, id);
        }

        dsu.resize(n + 1);
        iota(dsu.begin(), dsu.end(), 0);
        rank.assign(n + 1, 0);

        vector<int> ancestor(n + 1);
        iota(ancestor.begin(), ancestor.end(), 0);

        vector<int> depth(n + 1, 0);
        vector<unsigned char> finished(n + 1, 0);

        struct Frame {
            int node;
            int parent;
            int edge;
        };

        vector<Frame> stack;
        stack.reserve(n);
        stack.push_back({1, 0, head[1]});

        while (!stack.empty()) {
            Frame& frame = stack.back();
            if (frame.edge != -1) {
                const int currentEdge = frame.edge;
                frame.edge = nextEdge[currentEdge];

                const int child = to[currentEdge];
                if (child == frame.parent) continue;

                depth[child] = depth[frame.node] + 1;
                stack.push_back({child, frame.node, head[child]});
                continue;
            }

            const int node = frame.node;
            finished[node] = 1;

            for (int edge = queryHead[node]; edge != -1; edge = nextQuery[edge]) {
                const int other = queryTo[edge];
                if (!finished[other]) continue;

                const int lca = ancestor[findRoot(other)];
                const int distance = depth[node] + depth[other] - 2 * depth[lca];
                answer[queryId[edge]] = pow2[distance - 1];
            }

            const int nodeParent = frame.parent;
            stack.pop_back();

            if (nodeParent != 0) {
                unite(nodeParent, node);
                ancestor[findRoot(nodeParent)] = nodeParent;
            }
        }

        return answer;
    }
};
