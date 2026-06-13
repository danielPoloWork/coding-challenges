#include <algorithm>
#include <cmath>
#include <iostream>
#include <limits>
#include <string>
#include <vector>

using namespace std;

namespace {

constexpr long double EPS = 1e-11L;
constexpr long long SCAN_LIMIT = 60000;
constexpr int OPTIMAL_LIMIT = 512;
constexpr int SAMPLE_PROBES = 80;

struct PointD {
    long double x;
    long double y;
};

struct PointI {
    long long x;
    long long y;
};

struct Constraint {
    long long a;
    long long b;
    long long c;
    int type; // 1: WARMER, -1: COLDER, 0: SAME.
};

int width_;
int height_;

long long sq(long long v) {
    return v * v;
}

long long distanceSq(const PointI& lhs, const PointI& rhs) {
    return sq(lhs.x - rhs.x) + sq(lhs.y - rhs.y);
}

long double evalLine(const Constraint& line, const PointD& p) {
    return static_cast<long double>(line.a) * p.x +
           static_cast<long double>(line.b) * p.y +
           static_cast<long double>(line.c);
}

long long evalLineInt(const Constraint& line, const PointI& p) {
    return line.a * p.x + line.b * p.y + line.c;
}

bool samePoint(const PointD& lhs, const PointD& rhs) {
    return fabsl(lhs.x - rhs.x) <= 1e-9L && fabsl(lhs.y - rhs.y) <= 1e-9L;
}

vector<PointD> clipHalfPlane(const vector<PointD>& polygon, const Constraint& line, bool keepPositive) {
    if (polygon.empty()) {
        return {};
    }

    vector<PointD> out;
    out.reserve(polygon.size() + 1);

    for (size_t i = 0; i < polygon.size(); ++i) {
        const PointD a = polygon[i];
        const PointD b = polygon[(i + 1) % polygon.size()];
        const long double fa = evalLine(line, a);
        const long double fb = evalLine(line, b);
        const bool insideA = keepPositive ? fa >= -EPS : fa <= EPS;
        const bool insideB = keepPositive ? fb >= -EPS : fb <= EPS;

        if (insideA && insideB) {
            out.push_back(b);
        } else if (insideA != insideB) {
            const long double denominator = fa - fb;
            if (fabsl(denominator) > EPS) {
                const long double t = fa / denominator;
                out.push_back({
                    a.x + (b.x - a.x) * t,
                    a.y + (b.y - a.y) * t
                });
            }
            if (insideB) {
                out.push_back(b);
            }
        }
    }

    vector<PointD> clean;
    clean.reserve(out.size());
    for (const PointD& p : out) {
        if (clean.empty() || !samePoint(clean.back(), p)) {
            clean.push_back(p);
        }
    }
    if (clean.size() > 1 && samePoint(clean.front(), clean.back())) {
        clean.pop_back();
    }

    return clean;
}

void applyFeedback(vector<PointD>& polygon, vector<Constraint>& constraints, const PointI& previous,
                   const PointI& current, const string& feedback) {
    Constraint line{
        2LL * (current.x - previous.x),
        2LL * (current.y - previous.y),
        previous.x * previous.x + previous.y * previous.y - current.x * current.x - current.y * current.y,
        0
    };

    if (feedback == "WARMER") {
        line.type = 1;
        constraints.push_back(line);
        polygon = clipHalfPlane(polygon, line, true);
    } else if (feedback == "COLDER") {
        line.type = -1;
        constraints.push_back(line);
        polygon = clipHalfPlane(polygon, line, false);
    } else if (feedback == "SAME") {
        line.type = 0;
        constraints.push_back(line);
        polygon = clipHalfPlane(clipHalfPlane(polygon, line, true), line, false);
    }
}

PointD polygonCentroid(const vector<PointD>& polygon) {
    if (polygon.empty()) {
        return {0.0L, 0.0L};
    }

    long double twiceArea = 0.0L;
    long double cx = 0.0L;
    long double cy = 0.0L;

    for (size_t i = 0; i < polygon.size(); ++i) {
        const PointD p = polygon[i];
        const PointD q = polygon[(i + 1) % polygon.size()];
        const long double cross = p.x * q.y - q.x * p.y;
        twiceArea += cross;
        cx += (p.x + q.x) * cross;
        cy += (p.y + q.y) * cross;
    }

    if (fabsl(twiceArea) > EPS) {
        return {cx / (3.0L * twiceArea), cy / (3.0L * twiceArea)};
    }

    PointD avg{0.0L, 0.0L};
    for (const PointD& p : polygon) {
        avg.x += p.x;
        avg.y += p.y;
    }
    avg.x /= static_cast<long double>(polygon.size());
    avg.y /= static_cast<long double>(polygon.size());
    return avg;
}

long long clampCoord(long long value, long long low, long long high) {
    return max(low, min(high, value));
}

struct Box {
    long long lx;
    long long rx;
    long long ly;
    long long ry;
};

Box polygonBox(const vector<PointD>& polygon) {
    if (polygon.empty()) {
        return {0, width_ - 1, 0, height_ - 1};
    }

    long double minX = polygon[0].x;
    long double maxX = polygon[0].x;
    long double minY = polygon[0].y;
    long double maxY = polygon[0].y;

    for (const PointD& p : polygon) {
        minX = min(minX, p.x);
        maxX = max(maxX, p.x);
        minY = min(minY, p.y);
        maxY = max(maxY, p.y);
    }

    long long lx = clampCoord(static_cast<long long>(ceill(minX - 1e-9L)), 0, width_ - 1);
    long long rx = clampCoord(static_cast<long long>(floorl(maxX + 1e-9L)), 0, width_ - 1);
    long long ly = clampCoord(static_cast<long long>(ceill(minY - 1e-9L)), 0, height_ - 1);
    long long ry = clampCoord(static_cast<long long>(floorl(maxY + 1e-9L)), 0, height_ - 1);

    const long long centerX = clampCoord(static_cast<long long>(llroundl((minX + maxX) / 2.0L)), 0, width_ - 1);
    const long long centerY = clampCoord(static_cast<long long>(llroundl((minY + maxY) / 2.0L)), 0, height_ - 1);

    if (lx > rx) {
        lx = rx = centerX;
    }
    if (ly > ry) {
        ly = ry = centerY;
    }

    return {lx, rx, ly, ry};
}

bool satisfiesConstraints(const PointI& p, const vector<Constraint>& constraints) {
    for (const Constraint& line : constraints) {
        const long long value = evalLineInt(line, p);
        if (line.type == 1 && value <= 0) {
            return false;
        }
        if (line.type == -1 && value >= 0) {
            return false;
        }
        if (line.type == 0 && value != 0) {
            return false;
        }
    }
    return true;
}

bool sameWindow(const PointI& lhs, const PointI& rhs) {
    return lhs.x == rhs.x && lhs.y == rhs.y;
}

vector<PointI> collectCandidates(const vector<PointD>& polygon, const vector<Constraint>& constraints) {
    const Box box = polygonBox(polygon);
    vector<PointI> candidates;

    const Constraint* equality = nullptr;
    for (const Constraint& line : constraints) {
        if (line.type == 0 && (line.a != 0 || line.b != 0)) {
            equality = &line;
            break;
        }
    }

    if (equality != nullptr) {
        if (equality->b != 0 && ((box.rx - box.lx) <= (box.ry - box.ly) || equality->a == 0)) {
            candidates.reserve(static_cast<size_t>(box.rx - box.lx + 1));
            for (long long x = box.lx; x <= box.rx; ++x) {
                const long long numerator = -(equality->a * x + equality->c);
                if (numerator % equality->b != 0) {
                    continue;
                }
                const long long y = numerator / equality->b;
                const PointI p{x, y};
                if (box.ly <= y && y <= box.ry && satisfiesConstraints(p, constraints)) {
                    candidates.push_back(p);
                }
            }
        } else if (equality->a != 0) {
            candidates.reserve(static_cast<size_t>(box.ry - box.ly + 1));
            for (long long y = box.ly; y <= box.ry; ++y) {
                const long long numerator = -(equality->b * y + equality->c);
                if (numerator % equality->a != 0) {
                    continue;
                }
                const long long x = numerator / equality->a;
                const PointI p{x, y};
                if (box.lx <= x && x <= box.rx && satisfiesConstraints(p, constraints)) {
                    candidates.push_back(p);
                }
            }
        }
        return candidates;
    }

    const long long area = (box.rx - box.lx + 1) * (box.ry - box.ly + 1);
    if (area > SCAN_LIMIT) {
        return candidates;
    }

    candidates.reserve(static_cast<size_t>(area));
    for (long long y = box.ly; y <= box.ry; ++y) {
        for (long long x = box.lx; x <= box.rx; ++x) {
            const PointI p{x, y};
            if (satisfiesConstraints(p, constraints)) {
                candidates.push_back(p);
            }
        }
    }
    return candidates;
}

PointI moveTowardRectangle(const PointI& current, const PointD& desired) {
    const long double dx = desired.x - static_cast<long double>(current.x);
    const long double dy = desired.y - static_cast<long double>(current.y);
    long double lambda = 1.0L;

    if (dx < -EPS) {
        lambda = min(lambda, (0.0L - current.x) / dx);
    } else if (dx > EPS) {
        lambda = min(lambda, (static_cast<long double>(width_ - 1) - current.x) / dx);
    }

    if (dy < -EPS) {
        lambda = min(lambda, (0.0L - current.y) / dy);
    } else if (dy > EPS) {
        lambda = min(lambda, (static_cast<long double>(height_ - 1) - current.y) / dy);
    }

    lambda = max(0.0L, lambda);
    const long double x = static_cast<long double>(current.x) + dx * lambda;
    const long double y = static_cast<long double>(current.y) + dy * lambda;

    return {
        clampCoord(static_cast<long long>(llroundl(x)), 0, width_ - 1),
        clampCoord(static_cast<long long>(llroundl(y)), 0, height_ - 1)
    };
}

long long probeScore(const PointI& probe, const vector<PointI>& candidates, const PointI& current) {
    long long warmer = 0;
    long long colder = 0;
    long long same = 0;

    for (const PointI& bomb : candidates) {
        if (bomb.x == probe.x && bomb.y == probe.y) {
            continue;
        }

        const long long currentDistance = distanceSq(bomb, current);
        const long long probeDistance = distanceSq(bomb, probe);
        if (probeDistance < currentDistance) {
            ++warmer;
        } else if (probeDistance > currentDistance) {
            ++colder;
        } else {
            ++same;
        }
    }

    return max(warmer, max(colder, same));
}

void addProbe(vector<PointI>& probes, const PointI& p) {
    if (p.x < 0 || p.x >= width_ || p.y < 0 || p.y >= height_) {
        return;
    }
    for (const PointI& existing : probes) {
        if (existing.x == p.x && existing.y == p.y) {
            return;
        }
    }
    probes.push_back(p);
}

PointI chooseFromCandidates(const vector<PointI>& candidates, const PointI& current) {
    if (candidates.size() == 1) {
        return candidates.front();
    }

    vector<PointI> probes;
    if (static_cast<int>(candidates.size()) <= OPTIMAL_LIMIT) {
        probes = candidates;
    } else {
        for (int i = 0; i < SAMPLE_PROBES; ++i) {
            const size_t index = static_cast<size_t>(
                (static_cast<long long>(i) * static_cast<long long>(candidates.size() - 1)) /
                max(1, SAMPLE_PROBES - 1)
            );
            addProbe(probes, candidates[index]);
        }
    }

    long double meanX = 0.0L;
    long double meanY = 0.0L;
    for (const PointI& p : candidates) {
        meanX += p.x;
        meanY += p.y;
    }
    meanX /= static_cast<long double>(candidates.size());
    meanY /= static_cast<long double>(candidates.size());

    const PointI reflectedCenter = moveTowardRectangle(
        current,
        {2.0L * meanX - current.x, 2.0L * meanY - current.y}
    );
    addProbe(probes, reflectedCenter);

    long long minX = candidates.front().x;
    long long maxX = candidates.front().x;
    long long minY = candidates.front().y;
    long long maxY = candidates.front().y;
    for (const PointI& p : candidates) {
        minX = min(minX, p.x);
        maxX = max(maxX, p.x);
        minY = min(minY, p.y);
        maxY = max(maxY, p.y);
    }

    const long long midX = (minX + maxX) / 2;
    const long long midY = (minY + maxY) / 2;
    addProbe(probes, {minX, minY});
    addProbe(probes, {minX, maxY});
    addProbe(probes, {maxX, minY});
    addProbe(probes, {maxX, maxY});
    addProbe(probes, {minX, midY});
    addProbe(probes, {maxX, midY});
    addProbe(probes, {midX, minY});
    addProbe(probes, {midX, maxY});

    PointI best = candidates.front();
    long long bestScore = numeric_limits<long long>::max();
    bool bestIsCandidate = false;
    long double bestCenterDistance = numeric_limits<long double>::infinity();
    long long bestJumpDistance = numeric_limits<long long>::max();
    bool found = false;

    for (const PointI& probe : probes) {
        if (sameWindow(probe, current)) {
            continue;
        }
        const long long score = probeScore(probe, candidates, current);
        const long long jumpDistance = distanceSq(probe, current);
        const long double centerDistance =
            (static_cast<long double>(probe.x) - meanX) * (static_cast<long double>(probe.x) - meanX) +
            (static_cast<long double>(probe.y) - meanY) * (static_cast<long double>(probe.y) - meanY);
        bool isCandidate = false;
        for (const PointI& candidate : candidates) {
            if (sameWindow(candidate, probe)) {
                isCandidate = true;
                break;
            }
        }

        if (!found ||
            score < bestScore ||
            (score == bestScore && isCandidate && !bestIsCandidate) ||
            (score == bestScore && isCandidate == bestIsCandidate && centerDistance + EPS < bestCenterDistance) ||
            (score == bestScore && isCandidate == bestIsCandidate &&
             fabsl(centerDistance - bestCenterDistance) <= EPS &&
             jumpDistance < bestJumpDistance)) {
            found = true;
            best = probe;
            bestScore = score;
            bestIsCandidate = isCandidate;
            bestCenterDistance = centerDistance;
            bestJumpDistance = jumpDistance;
        }
    }

    if (found) {
        return best;
    }

    for (const PointI& p : candidates) {
        if (!sameWindow(p, current)) {
            return p;
        }
    }
    return candidates.front();
}

PointI fallbackMove(const vector<PointD>& polygon, const vector<PointI>& candidates, const PointI& current) {
    const Box box = polygonBox(polygon);
    const long long midX = (box.lx + box.rx) / 2;
    const long long midY = (box.ly + box.ry) / 2;

    vector<PointI> options;
    addProbe(options, {box.lx, box.ly});
    addProbe(options, {box.lx, box.ry});
    addProbe(options, {box.rx, box.ly});
    addProbe(options, {box.rx, box.ry});
    addProbe(options, {box.lx, midY});
    addProbe(options, {box.rx, midY});
    addProbe(options, {midX, box.ly});
    addProbe(options, {midX, box.ry});
    addProbe(options, {0, 0});
    addProbe(options, {width_ - 1, 0});
    addProbe(options, {0, height_ - 1});
    addProbe(options, {width_ - 1, height_ - 1});

    for (size_t i = 0; i < candidates.size() && i < 100; ++i) {
        addProbe(options, candidates[i]);
    }

    PointI best = current;
    long long bestDistance = -1;
    for (const PointI& option : options) {
        if (sameWindow(option, current)) {
            continue;
        }
        const long long jumpDistance = distanceSq(option, current);
        if (jumpDistance > bestDistance) {
            bestDistance = jumpDistance;
            best = option;
        }
    }

    if (bestDistance >= 0) {
        return best;
    }

    const int dx[4] = {1, -1, 0, 0};
    const int dy[4] = {0, 0, 1, -1};
    for (int i = 0; i < 4; ++i) {
        const PointI option{current.x + dx[i], current.y + dy[i]};
        if (0 <= option.x && option.x < width_ && 0 <= option.y && option.y < height_) {
            return option;
        }
    }

    return current;
}

void filterCandidates(vector<PointI>& candidates, const vector<Constraint>& constraints, const PointI& knownMiss) {
    vector<PointI> kept;
    kept.reserve(candidates.size());
    for (const PointI& candidate : candidates) {
        if (!sameWindow(candidate, knownMiss) && satisfiesConstraints(candidate, constraints)) {
            kept.push_back(candidate);
        }
    }
    candidates.swap(kept);
}

PointI chooseNextJump(const vector<PointD>& polygon, const vector<PointI>& candidates,
                      bool hasExplicitCandidates, const PointI& current) {
    PointI next{current.x, current.y};

    if (hasExplicitCandidates && !candidates.empty()) {
        next = chooseFromCandidates(candidates, current);
    } else {
        const PointD center = polygonCentroid(polygon);
        next = moveTowardRectangle(current, {
            2.0L * center.x - current.x,
            2.0L * center.y - current.y
        });
    }

    if (sameWindow(next, current)) {
        next = fallbackMove(polygon, candidates, current);
    }

    return next;
}

} // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> width_ >> height_;
    int maxJumps;
    cin >> maxJumps;

    PointI current{};
    cin >> current.x >> current.y;
    PointI previous = current;

    vector<PointD> polygon{
        {0.0L, 0.0L},
        {static_cast<long double>(width_ - 1), 0.0L},
        {static_cast<long double>(width_ - 1), static_cast<long double>(height_ - 1)},
        {0.0L, static_cast<long double>(height_ - 1)}
    };
    vector<Constraint> constraints;
    vector<PointI> candidates;
    bool hasExplicitCandidates = false;

    string feedback;
    while (cin >> feedback) {
        if (feedback != "UNKNOWN") {
            applyFeedback(polygon, constraints, previous, current, feedback);
            if (hasExplicitCandidates) {
                filterCandidates(candidates, constraints, current);
                if (candidates.empty()) {
                    hasExplicitCandidates = false;
                }
            }
        }

        if (!hasExplicitCandidates) {
            candidates = collectCandidates(polygon, constraints);
            filterCandidates(candidates, constraints, current);
            hasExplicitCandidates = !candidates.empty();
        }

        PointI next = chooseNextJump(polygon, candidates, hasExplicitCandidates, current);
        cout << next.x << ' ' << next.y << endl;

        previous = current;
        current = next;
    }

    return 0;
}
