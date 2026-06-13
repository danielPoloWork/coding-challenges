#include <algorithm>
#include <array>
#include <chrono>
#include <cstdlib>
#include <cstdint>
#include <iostream>
#include <limits>
#include <queue>
#include <string>
#include <unordered_set>
#include <vector>

using namespace std;

namespace {

constexpr int MAX_W = 20;
constexpr int MAX_H = 20;
constexpr int MAX_CELLS = MAX_W * MAX_H;
constexpr int MAX_ROCKS = 10;
constexpr int ENTRY_TOP = 0;
constexpr int ENTRY_LEFT = 1;
constexpr int ENTRY_RIGHT = 2;
constexpr int OUT_DOWN = 0;
constexpr int OUT_LEFT = 1;
constexpr int OUT_RIGHT = 2;
constexpr int OUT_BAD = 3;
constexpr int INF = 1'000'000;

struct Actor {
    unsigned char x = 0;
    unsigned char y = 0;
    unsigned char entry = 0;
};

struct Action {
    short idx = -1;
    signed char dir = 0; // -1: LEFT, 0: WAIT, +1: RIGHT
};

struct State {
    array<unsigned char, MAX_CELLS> grid{};
    array<Actor, MAX_ROCKS> rocks{};
    Actor indy{};
    unsigned char rockCount = 0;
    Action first{};
    short depth = 0;
    int score = INF;
    uint64_t gridHash = 0;
};

int W;
int H;
int EX;
int exitIdx;
int cellCount;
array<bool, MAX_CELLS> lockedCell{};
array<int, MAX_CELLS * 3 + 1> optimisticDist{};
array<int, MAX_CELLS> bestCellDist{};
array<array<unsigned char, 4>, MAX_CELLS> possibleTypes{};
array<unsigned char, MAX_CELLS> possibleCount{};
array<array<int, 3>, 14> outDir{};
array<array<unsigned char, 3>, 14> canEnter{};
array<unsigned char, 14> rotateLeft{};
array<unsigned char, 14> rotateRight{};
array<array<uint64_t, 14>, MAX_CELLS> zCell{};
array<array<uint64_t, 3>, MAX_CELLS> zIndy{};
array<array<uint64_t, 3>, MAX_CELLS> zRock{};

inline int id(int x, int y) {
    return y * W + x;
}

inline int stateId(int x, int y, int entry) {
    return (id(x, y) * 3) + entry;
}

inline bool inside(int x, int y) {
    return 0 <= x && x < W && 0 <= y && y < H;
}

int parseEntry(const string& s) {
    if (s == "TOP") return ENTRY_TOP;
    if (s == "LEFT") return ENTRY_LEFT;
    return ENTRY_RIGHT;
}

uint64_t splitmix64(uint64_t x) {
    x += 0x9e3779b97f4a7c15ULL;
    x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9ULL;
    x = (x ^ (x >> 27)) * 0x94d049bb133111ebULL;
    return x ^ (x >> 31);
}

void initTables() {
    for (auto& row : outDir) {
        row.fill(OUT_BAD);
    }
    for (auto& row : canEnter) {
        row.fill(0);
    }

    auto pass = [](int type, int entry, int out) {
        canEnter[type][entry] = 1;
        outDir[type][entry] = out;
    };
    auto crash = [](int type, int entry) {
        canEnter[type][entry] = 1;
    };

    pass(1, ENTRY_TOP, OUT_DOWN);
    pass(1, ENTRY_LEFT, OUT_DOWN);
    pass(1, ENTRY_RIGHT, OUT_DOWN);

    pass(2, ENTRY_LEFT, OUT_RIGHT);
    pass(2, ENTRY_RIGHT, OUT_LEFT);
    pass(3, ENTRY_TOP, OUT_DOWN);

    pass(4, ENTRY_TOP, OUT_LEFT);
    pass(4, ENTRY_RIGHT, OUT_DOWN);
    crash(4, ENTRY_LEFT);
    pass(5, ENTRY_TOP, OUT_RIGHT);
    pass(5, ENTRY_LEFT, OUT_DOWN);
    crash(5, ENTRY_RIGHT);

    pass(6, ENTRY_LEFT, OUT_RIGHT);
    pass(6, ENTRY_RIGHT, OUT_LEFT);
    crash(6, ENTRY_TOP);
    pass(7, ENTRY_TOP, OUT_DOWN);
    pass(7, ENTRY_RIGHT, OUT_DOWN);
    pass(8, ENTRY_LEFT, OUT_DOWN);
    pass(8, ENTRY_RIGHT, OUT_DOWN);
    pass(9, ENTRY_TOP, OUT_DOWN);
    pass(9, ENTRY_LEFT, OUT_DOWN);

    pass(10, ENTRY_TOP, OUT_LEFT);
    crash(10, ENTRY_LEFT);
    pass(11, ENTRY_TOP, OUT_RIGHT);
    crash(11, ENTRY_RIGHT);
    pass(12, ENTRY_RIGHT, OUT_DOWN);
    pass(13, ENTRY_LEFT, OUT_DOWN);

    rotateLeft = {0, 1, 3, 2, 5, 4, 9, 6, 7, 8, 13, 10, 11, 12};
    rotateRight = {0, 1, 3, 2, 5, 4, 7, 8, 9, 6, 11, 12, 13, 10};

    for (int i = 0; i < MAX_CELLS; ++i) {
        for (int t = 0; t < 14; ++t) {
            zCell[i][t] = splitmix64(0x100000000ULL + uint64_t(i) * 31 + t);
        }
        for (int e = 0; e < 3; ++e) {
            zIndy[i][e] = splitmix64(0x200000000ULL + uint64_t(i) * 7 + e);
            zRock[i][e] = splitmix64(0x300000000ULL + uint64_t(i) * 11 + e);
        }
    }
}

uint64_t computeGridHash(const array<unsigned char, MAX_CELLS>& grid) {
    uint64_t h = 0;
    for (int i = 0; i < cellCount; ++i) {
        h ^= zCell[i][grid[i]];
    }
    return h;
}

uint64_t fullHash(const State& s) {
    uint64_t h = s.gridHash ^ zIndy[id(s.indy.x, s.indy.y)][s.indy.entry];
    h ^= splitmix64(0x400000000ULL + s.rockCount);
    for (int i = 0; i < s.rockCount; ++i) {
        h ^= zRock[id(s.rocks[i].x, s.rocks[i].y)][s.rocks[i].entry];
    }
    return h;
}

void setPossibleTypes(int idx, unsigned char t) {
    unsigned char* dst = possibleTypes[idx].data();
    possibleCount[idx] = 0;

    auto add = [&](unsigned char v) {
        dst[possibleCount[idx]++] = v;
    };

    if (lockedCell[idx] || idx == exitIdx) {
        add(t);
    } else if (t == 2 || t == 3) {
        add(2);
        add(3);
    } else if (t == 4 || t == 5) {
        add(4);
        add(5);
    } else if (6 <= t && t <= 9) {
        add(6);
        add(7);
        add(8);
        add(9);
    } else if (10 <= t && t <= 13) {
        add(10);
        add(11);
        add(12);
        add(13);
    } else {
        add(t);
    }
}

bool stepFrom(int x, int y, int out, int& nx, int& ny, int& nextEntry) {
    nx = x;
    ny = y;
    if (out == OUT_DOWN) {
        ++ny;
        nextEntry = ENTRY_TOP;
    } else if (out == OUT_LEFT) {
        --nx;
        nextEntry = ENTRY_RIGHT;
    } else if (out == OUT_RIGHT) {
        ++nx;
        nextEntry = ENTRY_LEFT;
    } else {
        return false;
    }
    return true;
}

bool canEverEnter(int idx, int entry) {
    for (int k = 0; k < possibleCount[idx]; ++k) {
        if (canEnter[possibleTypes[idx][k]][entry]) {
            return true;
        }
    }
    return false;
}

bool canCurrentEnter(const array<unsigned char, MAX_CELLS>& grid, int idx, int entry) {
    return canEnter[grid[idx]][entry] != 0;
}

void buildOptimisticDistances() {
    const int states = cellCount * 3;
    vector<vector<int>> rev(states + 1);
    const int goal = states;

    for (int y = 0; y < H; ++y) {
        for (int x = 0; x < W; ++x) {
            const int idx = id(x, y);
            for (int entry = 0; entry < 3; ++entry) {
                const int from = stateId(x, y, entry);
                for (int k = 0; k < possibleCount[idx]; ++k) {
                    const int type = possibleTypes[idx][k];
                    const int out = outDir[type][entry];
                    int nx, ny, nextEntry;
                    if (!stepFrom(x, y, out, nx, ny, nextEntry)) continue;
                    if (!inside(nx, ny)) continue;
                    const int nextIdx = id(nx, ny);
                    if (!canEverEnter(nextIdx, nextEntry)) continue;
                    if (nextIdx == exitIdx) {
                        rev[goal].push_back(from);
                    } else {
                        rev[stateId(nx, ny, nextEntry)].push_back(from);
                    }
                }
            }
        }
    }

    optimisticDist.fill(INF);
    queue<int> q;
    optimisticDist[goal] = 0;
    q.push(goal);
    while (!q.empty()) {
        int cur = q.front();
        q.pop();
        for (int prev : rev[cur]) {
            if (optimisticDist[prev] == INF) {
                optimisticDist[prev] = optimisticDist[cur] + 1;
                q.push(prev);
            }
        }
    }

    for (int idx = 0; idx < cellCount; ++idx) {
        int best = INF;
        for (int entry = 0; entry < 3; ++entry) {
            best = min(best, optimisticDist[idx * 3 + entry]);
        }
        bestCellDist[idx] = best;
    }
}

bool actorMove(const Actor& a,
               const array<unsigned char, MAX_CELLS>& grid,
               bool indy,
               Actor& next,
               bool& goal) {
    goal = false;
    const int x = a.x;
    const int y = a.y;
    const int type = grid[id(x, y)];
    const int out = outDir[type][a.entry];
    int nx, ny, nextEntry;
    if (!stepFrom(x, y, out, nx, ny, nextEntry)) {
        return false;
    }

    if (!inside(nx, ny)) {
        return false;
    }
    const int nextIdx = id(nx, ny);
    if (!canCurrentEnter(grid, nextIdx, nextEntry)) {
        return false;
    }
    if (indy && nextIdx == exitIdx) {
        goal = true;
        return true;
    }

    next.x = static_cast<unsigned char>(nx);
    next.y = static_cast<unsigned char>(ny);
    next.entry = static_cast<unsigned char>(nextEntry);
    return true;
}

bool indyHasPreparablyMove(const State& s) {
    const int x = s.indy.x;
    const int y = s.indy.y;
    const int out = outDir[s.grid[id(x, y)]][s.indy.entry];
    int nx, ny, nextEntry;
    if (!stepFrom(x, y, out, nx, ny, nextEntry)) {
        return false;
    }
    if (!inside(nx, ny)) {
        return false;
    }
    return canEverEnter(id(nx, ny), nextEntry);
}

bool canRotate(const State& s, const Action& a) {
    if (a.dir == 0) return true;
    if (a.idx < 0 || a.idx >= cellCount) return false;
    if (a.idx == exitIdx || lockedCell[a.idx]) return false;
    if (s.grid[a.idx] == 0 || s.grid[a.idx] == 1) return false;
    if (id(s.indy.x, s.indy.y) == a.idx) return false;
    for (int i = 0; i < s.rockCount; ++i) {
        if (id(s.rocks[i].x, s.rocks[i].y) == a.idx) return false;
    }
    const unsigned char nt = a.dir < 0 ? rotateLeft[s.grid[a.idx]] : rotateRight[s.grid[a.idx]];
    return nt != s.grid[a.idx];
}

bool simulate(const State& s, const Action& action, State& ns, bool& goal) {
    if (!canRotate(s, action)) return false;

    ns = s;
    ns.depth = s.depth + 1;
    ns.score = INF;
    goal = false;

    if (action.dir != 0) {
        const int p = action.idx;
        const unsigned char oldType = ns.grid[p];
        const unsigned char newType = action.dir < 0 ? rotateLeft[oldType] : rotateRight[oldType];
        ns.gridHash ^= zCell[p][oldType];
        ns.gridHash ^= zCell[p][newType];
        ns.grid[p] = newType;
    }

    const int oldIndyCell = id(s.indy.x, s.indy.y);
    Actor nextIndy;
    if (!actorMove(s.indy, ns.grid, true, nextIndy, goal)) {
        return false;
    }
    if (goal) {
        return true;
    }

    array<Actor, MAX_ROCKS> moved{};
    array<int, MAX_ROCKS> oldRockCell{};
    int movedCount = 0;
    for (int i = 0; i < s.rockCount; ++i) {
        Actor nr;
        bool rockGoal = false;
        if (!actorMove(s.rocks[i], ns.grid, false, nr, rockGoal)) {
            continue;
        }
        oldRockCell[movedCount] = id(s.rocks[i].x, s.rocks[i].y);
        moved[movedCount++] = nr;
    }

    const int indyCell = id(nextIndy.x, nextIndy.y);
    for (int i = 0; i < movedCount; ++i) {
        const int rockCell = id(moved[i].x, moved[i].y);
        if (rockCell == indyCell || (rockCell == oldIndyCell && oldRockCell[i] == indyCell)) {
            return false;
        }
    }

    array<unsigned char, MAX_ROCKS> rockDead{};
    rockDead.fill(0);
    for (int i = 0; i < movedCount; ++i) {
        const int cellI = id(moved[i].x, moved[i].y);
        for (int j = i + 1; j < movedCount; ++j) {
            const int cellJ = id(moved[j].x, moved[j].y);
            if (cellI == cellJ || (cellI == oldRockCell[j] && cellJ == oldRockCell[i])) {
                rockDead[i] = 1;
                rockDead[j] = 1;
            }
        }
    }

    ns.rockCount = 0;
    for (int i = 0; i < movedCount; ++i) {
        if (rockDead[i]) continue;
        if (outDir[ns.grid[id(moved[i].x, moved[i].y)]][moved[i].entry] == OUT_BAD) continue;
        ns.rocks[ns.rockCount++] = moved[i];
    }
    sort(ns.rocks.begin(), ns.rocks.begin() + ns.rockCount, [](const Actor& a, const Actor& b) {
        if (a.y != b.y) return a.y < b.y;
        if (a.x != b.x) return a.x < b.x;
        return a.entry < b.entry;
    });
    ns.indy = nextIndy;
    if (!indyHasPreparablyMove(ns)) {
        return false;
    }
    return true;
}

void addCell(array<int, MAX_CELLS>& priority, int idx, int p) {
    if (0 <= idx && idx < cellCount) {
        priority[idx] = min(priority[idx], p);
    }
}

void collectReachableCells(const State& s,
                           const Actor& start,
                           int horizon,
                           int basePriority,
                           array<int, MAX_CELLS>& priority) {
    array<array<unsigned char, 3>, MAX_CELLS> seen{};
    queue<pair<Actor, int>> q;
    q.push({start, 0});
    seen[id(start.x, start.y)][start.entry] = 1;

    while (!q.empty()) {
        auto [cur, depth] = q.front();
        q.pop();
        if (depth >= horizon) continue;

        const int curIdx = id(cur.x, cur.y);
        array<unsigned char, 4> localTypes{};
        int localCount = 0;
        if (depth == 0) {
            localTypes[localCount++] = s.grid[curIdx];
        } else {
            for (int k = 0; k < possibleCount[curIdx]; ++k) {
                localTypes[localCount++] = possibleTypes[curIdx][k];
            }
        }

        for (int k = 0; k < localCount; ++k) {
            const int out = outDir[localTypes[k]][cur.entry];
            int nx, ny, ne;
            if (!stepFrom(cur.x, cur.y, out, nx, ny, ne)) continue;
            if (!inside(nx, ny)) continue;
            const int nextIdx = id(nx, ny);
            if (!canEverEnter(nextIdx, ne)) continue;
            addCell(priority, nextIdx, basePriority + depth * 7 + min(bestCellDist[nextIdx], 60));
            if (!seen[nextIdx][ne]) {
                Actor next{static_cast<unsigned char>(nx), static_cast<unsigned char>(ny), static_cast<unsigned char>(ne)};
                seen[nextIdx][ne] = 1;
                q.push({next, depth + 1});
            }
        }
    }
}

void collectGreedyCells(const State& s, Actor cur, int horizon, array<int, MAX_CELLS>& priority) {
    for (int depth = 0; depth < horizon; ++depth) {
        const int curIdx = id(cur.x, cur.y);
        array<unsigned char, 4> localTypes{};
        int localCount = 0;
        if (depth == 0) {
            localTypes[localCount++] = s.grid[curIdx];
        } else {
            for (int k = 0; k < possibleCount[curIdx]; ++k) {
                localTypes[localCount++] = possibleTypes[curIdx][k];
            }
        }

        int best = INF;
        Actor bestNext{};
        bool found = false;
        for (int k = 0; k < localCount; ++k) {
            const int out = outDir[localTypes[k]][cur.entry];
            int nx, ny, ne;
            if (!stepFrom(cur.x, cur.y, out, nx, ny, ne)) continue;
            if (!inside(nx, ny)) continue;
            const int nextIdx = id(nx, ny);
            if (!canEverEnter(nextIdx, ne)) continue;
            if (nextIdx == exitIdx) return;
            const int d = optimisticDist[stateId(nx, ny, ne)];
            if (d < best) {
                best = d;
                bestNext = Actor{static_cast<unsigned char>(nx), static_cast<unsigned char>(ny), static_cast<unsigned char>(ne)};
                found = true;
            }
        }
        if (!found) return;
        addCell(priority, id(bestNext.x, bestNext.y), depth * 3 + best);
        cur = bestNext;
    }
}

vector<Action> generateActions(const State& s) {
    array<int, MAX_CELLS> priority{};
    priority.fill(INF);
    array<unsigned char, MAX_CELLS> occupied{};
    occupied[id(s.indy.x, s.indy.y)] = 1;
    for (int i = 0; i < s.rockCount; ++i) {
        occupied[id(s.rocks[i].x, s.rocks[i].y)] = 1;
    }

    Actor next;
    bool goal = false;
    if (actorMove(s.indy, s.grid, true, next, goal) && !goal) {
        addCell(priority, id(next.x, next.y), 0);
    }
    collectGreedyCells(s, s.indy, 12, priority);
    collectReachableCells(s, s.indy, 7, 10, priority);

    for (int i = 0; i < s.rockCount; ++i) {
        Actor nr;
        bool rockGoal = false;
        if (actorMove(s.rocks[i], s.grid, false, nr, rockGoal)) {
            addCell(priority, id(nr.x, nr.y), 18);
        }
        collectReachableCells(s, s.rocks[i], 4, 55, priority);
    }

    vector<pair<int, int>> cells;
    cells.reserve(cellCount);
    for (int idx = 0; idx < cellCount; ++idx) {
        if (priority[idx] == INF) continue;
        if (idx == exitIdx || occupied[idx] || lockedCell[idx]) continue;
        const unsigned char t = s.grid[idx];
        if (t == 0 || t == 1) continue;
        const int rank = priority[idx] * 1000 + min(bestCellDist[idx], 100) * 4 + abs((idx % W) - EX);
        cells.push_back({rank, idx});
    }

    sort(cells.begin(), cells.end());
    const int cellLimit = min<int>(cells.size(), 38 + min<int>(16, s.rockCount * 3));

    vector<Action> actions;
    actions.reserve(1 + cellLimit * 2);
    actions.push_back(Action{-1, 0});
    for (int i = 0; i < cellLimit; ++i) {
        const int idx = cells[i].second;
        const unsigned char leftType = rotateLeft[s.grid[idx]];
        const unsigned char rightType = rotateRight[s.grid[idx]];
        if (rightType != s.grid[idx]) {
            actions.push_back(Action{static_cast<short>(idx), 1});
        }
        if (leftType != s.grid[idx] && leftType != rightType) {
            actions.push_back(Action{static_cast<short>(idx), -1});
        }
    }
    return actions;
}

int evaluateState(const State& s) {
    if (!indyHasPreparablyMove(s)) return INF;
    const int sid = stateId(s.indy.x, s.indy.y, s.indy.entry);
    const int d = optimisticDist[sid];
    if (d == INF) return INF;

    int risk = 0;
    for (int i = 0; i < s.rockCount; ++i) {
        const int md = abs(int(s.rocks[i].x) - int(s.indy.x)) + abs(int(s.rocks[i].y) - int(s.indy.y));
        risk += max(0, 8 - md) * 30;
    }

    return d * 10000
         + abs(int(s.indy.x) - EX) * 45
         - int(s.indy.y) * 20
         + int(s.rockCount) * 120
         + risk
         + s.depth * 35;
}

Action searchPlan(const State& root) {
    using Clock = chrono::steady_clock;
    const auto deadline = Clock::now() + chrono::milliseconds(105);
    const int rootDist = optimisticDist[stateId(root.indy.x, root.indy.y, root.indy.entry)];
    const int maxDepth = min(180, max(45, rootDist == INF ? 80 : rootDist + 35));
    const int beamWidth = root.rockCount == 0 ? 260 : 340;

    vector<State> beam;
    State start = root;
    start.depth = 0;
    start.first = Action{-1, 0};
    start.score = evaluateState(start);
    beam.push_back(start);

    Action bestAction{-1, 0};
    int bestScore = INF;
    bool haveBest = false;
    int expansions = 0;

    for (int depth = 0; depth < maxDepth && !beam.empty(); ++depth) {
        vector<State> nextLayer;
        nextLayer.reserve(beam.size() * 40);
        unordered_set<uint64_t> seen;
        seen.reserve(beam.size() * 80);

        for (const State& cur : beam) {
            vector<Action> actions = generateActions(cur);
            for (const Action& action : actions) {
                State ns;
                bool goal = false;
                if (!simulate(cur, action, ns, goal)) {
                    continue;
                }

                const Action first = cur.depth == 0 ? action : cur.first;
                if (goal) {
                    return first;
                }

                ns.first = first;
                ns.score = evaluateState(ns);
                if (ns.score == INF) {
                    continue;
                }

                const uint64_t h = fullHash(ns);
                if (!seen.insert(h).second) {
                    continue;
                }
                if (!haveBest || ns.score < bestScore) {
                    haveBest = true;
                    bestScore = ns.score;
                    bestAction = ns.first;
                }
                nextLayer.push_back(ns);

                if ((++expansions & 255) == 0 && Clock::now() > deadline) {
                    break;
                }
            }
            if ((expansions & 255) == 0 && Clock::now() > deadline) {
                break;
            }
        }

        if (nextLayer.empty()) {
            break;
        }

        if (int(nextLayer.size()) > beamWidth) {
            nth_element(nextLayer.begin(), nextLayer.begin() + beamWidth, nextLayer.end(),
                        [](const State& a, const State& b) { return a.score < b.score; });
            nextLayer.resize(beamWidth);
        }
        sort(nextLayer.begin(), nextLayer.end(),
             [](const State& a, const State& b) { return a.score < b.score; });
        if (!nextLayer.empty() && (!haveBest || nextLayer[0].score < bestScore)) {
            haveBest = true;
            bestScore = nextLayer[0].score;
            bestAction = nextLayer[0].first;
        }
        beam.swap(nextLayer);

        if (Clock::now() > deadline) {
            break;
        }
    }

    return bestAction;
}

} // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    initTables();

    cin >> W >> H;
    cellCount = W * H;

    State actual;
    actual.grid.fill(0);
    for (int y = 0; y < H; ++y) {
        for (int x = 0; x < W; ++x) {
            int t;
            cin >> t;
            const int idx = id(x, y);
            lockedCell[idx] = t < 0;
            actual.grid[idx] = static_cast<unsigned char>(abs(t));
        }
    }
    cin >> EX;
    exitIdx = id(EX, H - 1);

    for (int idx = 0; idx < cellCount; ++idx) {
        setPossibleTypes(idx, actual.grid[idx]);
    }
    buildOptimisticDistances();
    actual.gridHash = computeGridHash(actual.grid);

    while (true) {
        int xi, yi;
        string posi;
        if (!(cin >> xi >> yi >> posi)) {
            return 0;
        }
        actual.indy = Actor{static_cast<unsigned char>(xi), static_cast<unsigned char>(yi),
                            static_cast<unsigned char>(parseEntry(posi))};

        int r;
        cin >> r;
        actual.rockCount = static_cast<unsigned char>(r);
        for (int i = 0; i < r; ++i) {
            int xr, yr;
            string posr;
            cin >> xr >> yr >> posr;
            actual.rocks[i] = Actor{static_cast<unsigned char>(xr), static_cast<unsigned char>(yr),
                                    static_cast<unsigned char>(parseEntry(posr))};
        }
        sort(actual.rocks.begin(), actual.rocks.begin() + actual.rockCount, [](const Actor& a, const Actor& b) {
            if (a.y != b.y) return a.y < b.y;
            if (a.x != b.x) return a.x < b.x;
            return a.entry < b.entry;
        });

        Action action = searchPlan(actual);
        if (!canRotate(actual, action)) {
            action = Action{-1, 0};
        }

        if (action.dir == 0) {
            cout << "WAIT" << endl;
        } else {
            const int idx = action.idx;
            const unsigned char oldType = actual.grid[idx];
            const unsigned char newType = action.dir < 0 ? rotateLeft[oldType] : rotateRight[oldType];
            actual.gridHash ^= zCell[idx][oldType];
            actual.gridHash ^= zCell[idx][newType];
            actual.grid[idx] = newType;
            cout << (idx % W) << ' ' << (idx / W) << ' ' << (action.dir < 0 ? "LEFT" : "RIGHT") << endl;
        }
    }
}
