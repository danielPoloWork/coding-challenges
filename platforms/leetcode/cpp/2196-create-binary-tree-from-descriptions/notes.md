# Notes - LeetCode 2196: Create Binary Tree From Descriptions (C++ proposals)

## Problem Summary

Each row `[parent, child, isLeft]` describes one edge of a valid binary tree with unique
node values. If `isLeft == 1`, `child` is the left child of `parent`; otherwise it is the
right child. The task is to create all needed `TreeNode` objects, wire their children, and
return the root, which is the only node that never appears as a child.

## Three Proposals

This folder ships all three C++ proposals because the performance and memory axes are
meaningfully different.

- **Recommended (`solution.cpp`) - fast + lean:** first scan for the maximum value present,
  allocate direct-address `nodes` and `isChild` arrays of size `maxValue + 1`, build the
  tree in one pass, then scan parents to find the non-child root. This keeps O(1) lookups
  without always paying for all `100001` possible values.
- **Speed extreme (`solution-runtime.cpp`):** allocate fixed direct-address tables for the
  full LeetCode value range `0..100000`. It removes the max-value pre-scan and keeps the hot
  path as a small sequence of indexed pointer operations, at the cost of a larger table.
- **Memory extreme (`solution-memory.cpp`):** coordinate-compress only the values that
  appear, then use compact arrays indexed by compressed id. It reduces auxiliary table space
  from value-range size to distinct-node count, while paying `O(n log n)` sorting and binary
  searches.

The trade-off is direct: the speed variants use value-indexed arrays for constant-time
lookup; the memory variant stores only observed values but spends extra comparisons.

## Language Choice (C++)

C++ is the strongest fit for this LeetCode problem because the returned type is already
`TreeNode*`, node allocation is explicit and cheap, and `vector`/`array` direct indexing has
no hashing, boxing, garbage collector, or interpreter overhead. For `n <= 10000` and
`value <= 100000`, the winning work is not traversal recursion or library-heavy logic; it is
fast pointer table lookup plus a bounded number of heap allocations for the actual nodes.

- **Recommended:** C++ `vector<TreeNode*>` and `vector<unsigned char>` provide compact,
  contiguous direct-address tables sized to the input's maximum value. This is faster and
  more cache-predictable than hash maps while avoiding the fixed full-range allocation when
  values are small.
- **Speed extreme:** C++ stack-backed `array<TreeNode*, 100001>` plus `bitset<100001>` avoids
  the preliminary scan and dynamic sizing. That favors raw constant factors on dense/high
  valued inputs accepted by LeetCode.
- **Memory extreme:** C++ `sort`, `unique`, and `lower_bound` implement coordinate
  compression with inlined comparisons and compact contiguous buffers. It keeps only
  distinct values in the lookup structure, unlike a direct table over the whole value range.

This is a problem-specific performance choice, not a repository-wide language default.

## Constraints

- `1 <= descriptions.length <= 10000`.
- `descriptions[i].length == 3`.
- `1 <= parent, child <= 100000`.
- `isLeft` is either `0` or `1`.
- The descriptions form a valid binary tree with unique values.

The bounded value range makes direct addressing viable. The valid-tree guarantee means every
edge can be processed once without conflict resolution, cycle checks, or duplicate-edge
validation.

## Key Observations

1. A node may appear before or after its parent in `descriptions`, so nodes must be created
   lazily and reused by value.
2. The root is exactly the value that appears as a parent but never as a child.
3. Since values are bounded by `100000`, `nodes[value]` is faster than `unordered_map`.
4. At most `n + 1` `TreeNode` objects are created, because a valid tree with `n` edges has
   `n + 1` nodes.

## Reasoning Process

1. The direct brute-force idea would search all existing nodes whenever a value appears. That
   can degrade to `O(n^2)` pointer matching and is unnecessary with unique integer values.
2. Hashing by value gives `O(n)` expected time, but each lookup has hash computation, bucket
   access, and possible allocation overhead.
3. The value upper bound allows a direct pointer table. Each parent/child lookup becomes one
   array access, and child marking is one byte/bit write.
4. The only remaining design choice is how much table space to spend:
   direct table sized to observed max for the recommended balance, fixed full range for the
   runtime extreme, or compressed ids for the memory extreme.

## Final Approaches

### Recommended - `solution.cpp`

1. Scan all descriptions to find `maxValue`.
2. Allocate `nodes[maxValue + 1]` and `isChild[maxValue + 1]`.
3. For each description:
   - create the parent node if missing;
   - create the child node if missing;
   - assign `parent->left` or `parent->right`;
   - mark `child` as a child.
4. Scan the parent values again and return the first parent that is not marked as a child.

### Speed extreme - `solution-runtime.cpp`

1. Allocate `nodes[100001]` and a compact `bitset<100001>` for child flags.
2. Build and mark children exactly like the recommended solution.
3. Scan parent values to return the unmarked root.

This saves the max-value scan and dynamic table sizing. It is intentionally less memory
adaptive.

### Memory extreme - `solution-memory.cpp`

1. Collect all parent and child values into a vector.
2. Sort and deduplicate it, producing compressed ids `0..k-1`.
3. Allocate `nodes[k]` and `isChild[k]`.
4. For each description, binary-search the parent and child ids, create/reuse nodes, link the
   edge, and mark the child id.
5. Scan parent values, binary-search their ids, and return the unmarked root.

## Why These Approaches

The recommended proposal is preferable for normal LeetCode submission: it is still `O(n)`
time, avoids hash maps, and only allocates up to the largest value actually present. The
runtime extreme is the lowest-instruction direct-address version when the full value range is
acceptable. The memory extreme is useful when values are sparse and auxiliary space matters
more than comparison count.

The input itself already contains all edges; no traversal is needed to discover structure.
Every proposal therefore focuses on reducing lookup overhead and finding the root with the
child-mark invariant.

## Top 1% Performance Strategy

- Use direct indexing in the recommended and runtime variants instead of `unordered_map`;
  this avoids hashing, bucket indirection, and allocator churn.
- Allocate each `TreeNode` exactly once and attach pointers immediately.
- Use a byte vector or bitset for child marks instead of a set of child values.
- Find the root by scanning parent values, not by scanning the entire `1..100000` range.
- In the memory variant, keep compressed lookup data contiguous and use `lower_bound`, whose
  comparisons inline cleanly in C++.

## Edge Cases

- A single edge creates two nodes; the parent is returned unless it is later marked as a
  child by another edge.
- Descriptions can be in any order; lazy node creation handles children before their own
  descendants or parents.
- A node with only one child is represented naturally because missing child pointers remain
  `nullptr`.
- Values at the upper bound `100000` are valid indices in both direct-address variants.
- The valid-tree guarantee means there is exactly one root, so the final parent scan always
  finds it for non-empty input.

## Alternatives

- **`unordered_map<int, TreeNode*>` plus `unordered_set<int>`:** expected `O(n)`, but slower
  and usually more memory-heavy due to hashing, buckets, and allocator overhead.
- **Tree traversal after build to find the root:** unnecessary; child marking already gives
  the root directly.
- **Scanning the full value range to find a root:** works for direct-address tables but wastes
  up to `100000` checks. Scanning only parent values is tighter.
- **Sorting descriptions by parent:** does not remove the need to map child values to reused
  nodes, and it mutates/reorders the input for no benefit.

## See Also

All proposals for this challenge are in this C++ folder:

- `solution.cpp` - recommended fast + lean direct addressing by observed max value.
- `solution-runtime.cpp` - full-range direct addressing for raw constant factors.
- `solution-memory.cpp` - coordinate compression for lower auxiliary table memory.
