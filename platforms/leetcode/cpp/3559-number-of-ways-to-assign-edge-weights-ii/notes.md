# Notes - LeetCode 3559: Number of Ways to Assign Edge Weights II (C++ proposal)

## Problem Summary

We are given a rooted undirected tree and many node pairs. For each query `(u, v)`, look
only at the edges on the unique path from `u` to `v`. Each of those edges may receive
weight `1` or `2`; count how many assignments make the path cost odd.

Edges outside the queried path are ignored, so every query reduces to the path length.

## Three Proposals -> One File (Pareto-optimal)

Every challenge ships three proposals unless one implementation is best on all meaningful
axes. Here the Tarjan offline LCA solution is the recommended, speed-extreme, and
memory-extreme solution:

- **Recommended (`solution.cpp`) - fast + lean:** precompute powers of two, run an
  iterative Tarjan offline LCA traversal, and answer each query from the resulting path
  distance. Time is `O((n + q) alpha(n))`; auxiliary memory is `O(n + q)`.
- **Speed extreme:** *coincides with the recommended.* Any exact solution must inspect
  the tree and the query list. Offline Tarjan avoids the `O(log n)` per-query cost of
  binary lifting and the larger sparse table of Euler-tour RMQ.
- **Memory extreme:** *coincides with the recommended.* The algorithm stores only linear
  tree/query adjacency, DSU state, depths, and the mandatory answer array. Binary lifting
  and RMQ variants spend `O(n log n)` integers.

There is therefore no separate `solution-runtime.cpp` or `solution-memory.cpp`.

## Language Choice (C++)

Candidate languages considered:

- **C++:** Best fit. The workload is dense integer adjacency, iterative DFS, DSU path
  compression, and modular integer writes. C++ gives compact contiguous vectors, direct
  LeetCode `vector<vector<int>>` integration, and native branch-light loops.
- **C:** Considered for manual arrays and a smaller runtime baseline, but LeetCode's C API
  for nested arrays and dynamic return buffers adds boilerplate and ownership risk without
  reducing the `O(n + q)` auxiliary memory below the C++ implementation.
- **Rust:** Native and memory-safe, but the iterative DFS plus mutable DSU/query adjacency
  requires more indexing ceremony and is unlikely to beat C++ constants in LeetCode's
  runner.
- **Go:** Compiled and clear, but slice bounds checks and runtime metadata are less
  attractive for tight adjacency/DSU loops at `1e5` scale.
- **Java / C#:** Primitive arrays can be competitive after JIT warmup, but managed runtime
  overhead and larger array/object baselines are weaker for the top-percentile memory and
  startup profile.
- **Python / JavaScript / TypeScript / PHP:** Concise for the combinatorics, but the
  maximum input requires `O(n + q)` graph traversal and DSU operations; interpreter/VM
  overhead is a poor fit for top 1% runtime.

Chosen language:

- **Selected:** C++.
- **Why it wins for this proposal:** It combines the strongest practical runtime for
  iterative Tarjan LCA with compact linear storage and the natural LeetCode method
  signature.
- **Why the main alternatives lose:** C does not improve the asymptotic footprint under the
  platform API; Rust/Go add bounds-check and wrapper costs; managed and interpreted
  languages have less favorable constants for the large tree/query hot path.

## Constraints

- `2 <= n <= 100000`.
- `edges.length == n - 1`, and the edges form a valid tree.
- `1 <= queries.length <= 100000`.
- Node labels are `1..n`.
- The answer is returned modulo `1_000_000_007`.

## Key Observations

1. Weight `2` contributes even cost, so path parity depends only on how many path edges
   receive weight `1`.
2. For a path of length `d`, there are `2^d` assignments of `{1, 2}` to its edges.
3. If `d > 0`, exactly half of all binary choices have odd parity, so the count is
   `2^(d - 1)`. If `d = 0`, there are no path edges and the answer is `0`.
4. The remaining task is fast distance queries on a static tree:
   `dist(u, v) = depth[u] + depth[v] - 2 * depth[lca(u, v)]`.
5. Because all queries are known upfront, Tarjan's offline LCA answers them in near-linear
   time and linear memory.

## Reasoning Process

A direct dynamic programming view would track `(chainLength, sumParity)` for each query
path. That immediately collapses: each edge independently flips parity if we choose weight
`1`, and leaves parity unchanged if we choose weight `2`. The number of odd assignments
for any non-empty chain is therefore exactly half of all assignments.

The hard part is not the parity DP; it is obtaining the length of up to `1e5` arbitrary
tree paths. Binary lifting would be straightforward, but it stores an `n * log n` ancestor
table and spends `O(log n)` per query. Euler-tour RMQ gives `O(1)` queries after
`O(n log n)` preprocessing, but its sparse table is larger.

Tarjan offline LCA matches the problem shape better: the full query set is already passed
to the function. During one DFS from root `1`, each finished child subtree is unioned into
its parent. When both endpoints of a query are finished, the DSU set's recorded ancestor is
their LCA. The implementation uses an explicit stack to avoid recursion-depth risk on a
chain of `100000` nodes.

## Final Approach

1. Precompute `pow2[i] = 2^i mod MOD` for `0 <= i <= n`.
2. Build compact forward-star adjacency arrays for the tree.
3. Build compact forward-star query adjacency arrays, adding each non-trivial query in
   both directions. Queries with `u == v` keep the initialized answer `0`.
4. Run iterative DFS from node `1`.
5. On leaving a node, mark it finished and inspect its incident query records.
6. If the opposite endpoint is already finished, compute:

   ```text
   lca = ancestor[find(opposite)]
   distance = depth[u] + depth[v] - 2 * depth[lca]
   answer[id] = pow2[distance - 1]
   ```

7. After a child frame returns to its parent, union child and parent, then record the
   parent as the ancestor of the merged DSU set.

## Why This Approach

The solution separates the problem into its two true components: a one-line parity count
and high-throughput LCA. Tarjan's offline algorithm is preferable because the query list is
available all at once, so there is no need to pay for online LCA machinery. It is also
safer for hidden stress tests than recursive DFS because the explicit stack handles a
max-length chain.

The trade-off is that the method is offline: it would not be the right choice if queries
arrived one at a time after preprocessing. Under LeetCode's function signature, that is not
a limitation.

## Top 1% Performance Strategy

- Reduce each query to `2^(distance - 1)` instead of doing per-path DP.
- Precompute powers once, so every query answer is an array lookup.
- Use Tarjan offline LCA to remove the `O(log n)` per-query factor.
- Store tree and query adjacency in flat `vector<int>` arrays rather than nested vectors.
- Skip `u == v` query records; their answer is known to be zero.
- Use iterative DFS to avoid call-stack overflow and recursive-call overhead.
- Use path-compressed union by rank with an `unsigned char` rank array.

## Edge Cases

- `u == v`: path length is zero, answer is `0`.
- Adjacent nodes: distance is one, answer is `2^0 = 1`.
- Chain-shaped tree with `100000` nodes: handled by the explicit DFS stack.
- Star-shaped tree: LCA of different leaves is the root; distance is two, answer is `2`.
- Repeated queries: each query id is answered independently.

## Alternatives

- **Per-query BFS/DFS path search:** `O(nq)` in the worst case, far too slow.
- **Binary lifting LCA:** `O((n + q) log n)` time and `O(n log n)` memory. Simpler and
  online, but dominated here because all queries are already known.
- **Euler tour + sparse table RMQ:** `O(n log n + q)` time and `O(n log n)` memory. It
  gives constant-time LCA queries but spends more preprocessing and memory than Tarjan.
- **Heavy-light decomposition:** useful for path updates/aggregates, unnecessary when only
  path length is needed.
- **Parity DP on each path:** correctly gives the same `2^(d - 1)` formula, but doing it
  per edge repeats work and misses the closed form.

## Verification

The C++ algorithm was mirrored in a temporary Python script and compared with a brute
force path/LCA reference plus exhaustive edge-weight enumeration on the sample cases,
structured edge cases, and randomized trees/queries. The temporary script was removed after
verification.

## See Also

None - this challenge ships a single Pareto-optimal C++ proposal. The omitted speed and
memory extremes coincide with `solution.cpp`, as explained above.
