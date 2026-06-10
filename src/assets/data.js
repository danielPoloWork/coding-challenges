/* Coding Challenges — content data layer */
window.CC = (function () {
  const platforms = [
    { id: "algocademy",    name: "AlgoCademy",     abbr: "AC", color: "#6b4ee6", count: 41,  desc: "Guided algorithmic learning paths and reinforcement." },
    { id: "checkio",       name: "CheckiO",        abbr: "CK", color: "#3f8f4f", count: 17,  desc: "Game-based Python and JavaScript practice challenges." },
    { id: "codechef",      name: "CodeChef",       abbr: "CC", color: "#7b5a3a", count: 31,  desc: "Competitive contests and structured practice ladders." },
    { id: "codesignal",    name: "CodeSignal",     abbr: "CS", color: "#1c2f6e", count: 58,  desc: "Assessment-style problems and arcade progressions." },
    { id: "codewars",      name: "Codewars",       abbr: "KW", color: "#b1361e", count: 142, desc: "Kata-based ranked practice with community solutions." },
    { id: "codility",      name: "Codility",       abbr: "CO", color: "#2db3a6", count: 34,  desc: "Lesson-driven correctness and performance scoring." },
    { id: "coding-games",  name: "CodinGame",      abbr: "CG", color: "#2a8fa0", count: 23,  desc: "Game-driven challenges and bot-programming puzzles." },
    { id: "exercism",      name: "Exercism",       abbr: "EX", color: "#2e6c78", count: 73,  desc: "Mentored exercises with a focus on idiomatic code." },
    { id: "hackerrank",    name: "HackerRank",     abbr: "HR", color: "#36b37e", count: 96,  desc: "Skill tracks, domain challenges and certification prep." },
    { id: "interview-cake",name: "Interview Cake", abbr: "IC", color: "#e0517f", count: 22,  desc: "Pattern-first interview question walkthroughs." },
    { id: "leetcode",      name: "LeetCode",       abbr: "LC", color: "#f0972a", count: 184, desc: "Interview-grade problem sets across data structures and algorithms." },
    { id: "master-coding", name: "Master Coding",  abbr: "MC", color: "#5a6acf", count: 15,  desc: "Structured mastery tracks across core coding fundamentals." },
    { id: "pramp",         name: "Pramp",          abbr: "PR", color: "#c0392b", count: 19,  desc: "Mock interview style problems and pairing drills." },
    { id: "project-euler", name: "Project Euler",  abbr: "PE", color: "#4a5b6b", count: 26,  desc: "Mathematical and computational reasoning problems." },
    { id: "stratascratch", name: "StrataScratch",  abbr: "SS", color: "#3b6fb0", count: 48,  desc: "Data & SQL challenges from real company datasets." },
    { id: "topcoder",      name: "TopCoder",       abbr: "TC", color: "#1f7ae0", count: 27,  desc: "Single-round-match competitive algorithm problems." },
  ];

  const featured = [
    { id: "0001-two-sum", num: "0001", title: "Two Sum", platform: "LeetCode", difficulty: "Easy",
      pattern: "Hash Map", langs: ["Rust", "C++", "Python3"], desc: "One-pass complement lookup in linear time.", time: "O(n)", space: "O(n)" },
    { id: "0011-container", num: "0011", title: "Container With Most Water", platform: "LeetCode", difficulty: "Medium",
      pattern: "Two Pointers", langs: ["C++", "Go"], desc: "Converging pointers maximising trapped area.", time: "O(n)", space: "O(1)" },
    { id: "0076-min-window", num: "0076", title: "Minimum Window Substring", platform: "LeetCode", difficulty: "Hard",
      pattern: "Sliding Window", langs: ["Rust", "Java"], desc: "Dynamic window with frequency counting.", time: "O(n)", space: "O(k)" },
    { id: "0207-course", num: "0207", title: "Course Schedule", platform: "LeetCode", difficulty: "Medium",
      pattern: "Topological Sort", langs: ["Go", "Python3"], desc: "Cycle detection via Kahn's algorithm on a DAG.", time: "O(V+E)", space: "O(V+E)" },
    { id: "euler-0014", num: "0014", title: "Longest Collatz Sequence", platform: "Project Euler", difficulty: "Medium",
      pattern: "Memoization", langs: ["C", "Rust"], desc: "Cached chain lengths under one million.", time: "O(n·k)", space: "O(n)" },
    { id: "kata-rgb", num: "—", title: "RGB To Hex Conversion", platform: "Codewars", difficulty: "Easy",
      pattern: "Bit Manipulation", langs: ["TypeScript", "C#"], desc: "Clamp and pack channels into a hex triplet.", time: "O(1)", space: "O(1)" },
  ];

  const principles = [
    { idx: "01", title: "Clarity First", desc: "Readability and maintainability are prioritised over premature or unnecessary optimisation." },
    { idx: "02", title: "Complexity Awareness", desc: "Every solution documents time, space and the optimisation opportunities left on the table." },
    { idx: "03", title: "Pattern Identification", desc: "Each challenge is mapped to one or more algorithmic patterns whenever applicable." },
    { idx: "04", title: "Continuous Refactoring", desc: "Improved solutions replace previous ones as better approaches are discovered." },
  ];

  const layers = [
    { tag: "Layer 01", name: "Platform Layer", desc: "Solutions organised by their original source platform — full traceability to the source challenge.",
      nodes: ["leetcode", "hackerrank", "codewars", "codesignal", "exercism", "codility", "project-euler", "…"] },
    { tag: "Layer 02", name: "Algorithm Layer", desc: "Challenges grouped by technical domain — surfacing strengths, weaknesses and learning gaps.",
      nodes: ["arrays", "strings", "linked-lists", "trees", "graphs", "heaps", "dynamic-programming", "greedy", "sorting"] },
    { tag: "Layer 03", name: "Pattern Layer", desc: "Reusable problem-solving patterns — designed to become the most valuable section over time.",
      nodes: ["sliding-window", "two-pointers", "binary-search", "prefix-sum", "bfs", "dfs", "union-find"] },
  ];

  const patterns = [
    { name: "sliding-window", n: 18 }, { name: "two-pointers", n: 24 }, { name: "binary-search", n: 16 },
    { name: "prefix-sum", n: 11 }, { name: "bfs", n: 21 }, { name: "dfs", n: 27 },
    { name: "union-find", n: 9 }, { name: "memoization", n: 19 }, { name: "monotonic-stack", n: 8 },
    { name: "backtracking", n: 14 }, { name: "greedy", n: 17 }, { name: "topological-sort", n: 6 },
  ];

  const languages = [
    { name: "C++", c: "#6e8fd6" }, { name: "Rust", c: "#cd7f52" }, { name: "Go", c: "#4fc3d9" },
    { name: "Python3", c: "#5394d0" }, { name: "TypeScript", c: "#4a7bd0" }, { name: "Java", c: "#d0743a" },
    { name: "C", c: "#8d96a8" }, { name: "C#", c: "#6a4fb0" }, { name: "Kotlin", c: "#9a6bd0" },
    { name: "Swift", c: "#e06a4a" }, { name: "Ruby", c: "#c0392b" }, { name: "PHP", c: "#6d7fb8" },
    { name: "Dart", c: "#3aa6b9" }, { name: "Scala", c: "#cc4030" }, { name: "Elixir", c: "#8c6bb0" },
    { name: "Erlang", c: "#aa3355" }, { name: "Go", c: "#4fc3d9" }, { name: "JavaScript", c: "#d8b832" },
  ];

  // Per-item `done` powers the per-item checkmarks; phase `done` (= all items
  // done) still drives the "shipped / planned" label. Keep both in sync.
  const roadmap = [
    { n: "Phase 1", title: "Knowledge Repository", done: true,  items: [
      { label: "Centralised collection", done: true }, { label: "Pattern catalog", done: true }, { label: "Complexity analysis", done: true } ] },
    { n: "Phase 2", title: "Automation",            done: true,  items: [
      { label: "Metadata generation", done: true }, { label: "Statistics dashboards", done: true }, { label: "Automated READMEs", done: true } ] },
    { n: "Phase 3", title: "Documentation Portal",  done: true,  items: [
      { label: "Static site generation", done: true }, { label: "Searchable index", done: true }, { label: "Pattern explorer", done: true } ] },
    { n: "Phase 4", title: "Engineering Portfolio", done: true,  items: [
      { label: "Public showcase", done: true }, { label: "Learning timeline", done: true }, { label: "Technical articles", done: true } ] },
    { n: "Phase 5", title: "Agentic Learning",      done: false, items: [
      { label: "Solution classification", done: true }, { label: "Pattern extraction", done: true },
      { label: "Skill-gap analysis", done: true }, { label: "Recommendations", done: false } ] },
  ];

  // sample solution proposals for the live preview (Two Sum)
  const proposals = [
    {
      id: "recommended", label: "solution.rs", lang: "Rust", dot: "#cd7f52", badge: "Recommended",
      time: "O(n)", space: "O(n)",
      code:
`use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen: HashMap<i32, i32> = HashMap::new();
        for (i, &n) in nums.iter().enumerate() {
            if let Some(&j) = seen.get(&(target - n)) {
                return vec![j, i as i32];
            }
            seen.insert(n, i as i32);
        }
        vec![]
    }
}`,
      note: "Single pass over the input. Each value's complement is checked against a hash map before insertion, so the first matching pair returns immediately." },
    {
      id: "runtime", label: "solution-runtime.cpp", lang: "C++", dot: "#6e8fd6", badge: "Speed extreme",
      time: "O(n)", space: "O(n)",
      code:
`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int,int> seen;
        seen.reserve(nums.size() * 2);
        for (int i = 0; i < (int)nums.size(); ++i) {
            auto it = seen.find(target - nums[i]);
            if (it != seen.end()) return {it->second, i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      note: "Pre-reserved bucket count avoids rehashing. Early exit on the first hit keeps the constant factor minimal for large inputs." },
    {
      id: "memory", label: "solution-memory.c", lang: "C", dot: "#8d96a8", badge: "Memory extreme",
      time: "O(n²)", space: "O(1)",
      code:
`int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    static int out[2];
    *returnSize = 2;
    for (int i = 0; i < numsSize; ++i)
        for (int j = i + 1; j < numsSize; ++j)
            if (nums[i] + nums[j] == target) {
                out[0] = i; out[1] = j;
                return out;
            }
    *returnSize = 0;
    return out;
}`,
      note: "Trades time for an O(1) footprint — no auxiliary structures. Preferred when memory is the binding constraint over runtime." },
  ];

  return { platforms, featured, principles, layers, patterns, languages, roadmap, proposals,
    totals: { challenges: 12, platforms: 1, catalogued: 16, languages: 2, patterns: 18 } };
})();
