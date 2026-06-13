#include <algorithm>
#include <cmath>
#include <iostream>
#include <numeric>
#include <queue>
#include <string>
#include <vector>

using namespace std;

struct RowGroup {
    int start;
    int end;
    double center;
    int score;
};

struct Note {
    double xCenter;
    char pitch;
    char kind;
};

static vector<RowGroup> buildRowGroups(const vector<int>& rowBlack, double factor) {
    const int h = static_cast<int>(rowBlack.size());
    const int best = *max_element(rowBlack.begin(), rowBlack.end());
    const int threshold = max(1, static_cast<int>(floor(best * factor)));
    vector<RowGroup> groups;

    int y = 0;
    while (y < h) {
        while (y < h && rowBlack[y] < threshold) {
            ++y;
        }
        if (y == h) {
            break;
        }

        const int start = y;
        int score = 0;
        while (y < h && rowBlack[y] >= threshold) {
            score += rowBlack[y];
            ++y;
        }
        const int end = y - 1;
        groups.push_back({start, end, (start + end) * 0.5, score});
    }

    return groups;
}

static vector<RowGroup> chooseStaffGroups(const vector<RowGroup>& groups) {
    if (groups.size() <= 5) {
        return groups;
    }

    vector<RowGroup> best;
    double bestValue = 1e100;
    const int n = static_cast<int>(groups.size());

    for (int a = 0; a < n; ++a) {
        for (int b = a + 1; b < n; ++b) {
            for (int c = b + 1; c < n; ++c) {
                for (int d = c + 1; d < n; ++d) {
                    for (int e = d + 1; e < n; ++e) {
                        const RowGroup* g[5] = {
                            &groups[a], &groups[b], &groups[c], &groups[d], &groups[e]
                        };
                        double gaps[4];
                        double meanGap = 0.0;
                        for (int i = 0; i < 4; ++i) {
                            gaps[i] = g[i + 1]->center - g[i]->center;
                            meanGap += gaps[i];
                        }
                        meanGap *= 0.25;
                        if (meanGap < 8.0) {
                            continue;
                        }

                        double regularity = 0.0;
                        for (double gap : gaps) {
                            const double delta = gap - meanGap;
                            regularity += delta * delta;
                        }
                        regularity /= meanGap * meanGap;

                        const int score = g[0]->score + g[1]->score + g[2]->score +
                                          g[3]->score + g[4]->score;
                        const double value = regularity - score * 1e-8;
                        if (value < bestValue) {
                            bestValue = value;
                            best = {*g[0], *g[1], *g[2], *g[3], *g[4]};
                        }
                    }
                }
            }
        }
    }

    if (!best.empty()) {
        return best;
    }

    vector<RowGroup> fallback = groups;
    sort(fallback.begin(), fallback.end(), [](const RowGroup& left, const RowGroup& right) {
        return left.score > right.score;
    });
    fallback.resize(5);
    sort(fallback.begin(), fallback.end(), [](const RowGroup& left, const RowGroup& right) {
        return left.center < right.center;
    });
    return fallback;
}

static vector<RowGroup> detectStaff(const vector<int>& rowBlack) {
    for (double factor : {0.55, 0.45, 0.35, 0.25, 0.15}) {
        vector<RowGroup> groups = buildRowGroups(rowBlack, factor);
        if (groups.size() >= 5) {
            groups = chooseStaffGroups(groups);
            sort(groups.begin(), groups.end(), [](const RowGroup& left, const RowGroup& right) {
                return left.center < right.center;
            });
            return groups;
        }
    }
    return {};
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int w;
    int h;
    cin >> w >> h;

    vector<unsigned char> black(w * h, 0);
    char color;
    int length;
    int pos = 0;
    while (cin >> color >> length) {
        const int end = min(pos + length, w * h);
        if (color == 'B' && pos < end) {
            fill(black.begin() + pos, black.begin() + end, 1);
        }
        pos += length;
    }

    vector<int> rowBlack(h, 0);
    for (int y = 0; y < h; ++y) {
        int count = 0;
        for (int x = 0; x < w; ++x) {
            count += black[y * w + x];
        }
        rowBlack[y] = count;
    }

    vector<RowGroup> staff = detectStaff(rowBlack);
    if (staff.size() != 5) {
        cout << '\n';
        return 0;
    }

    vector<int> thicknesses;
    thicknesses.reserve(5);
    for (const RowGroup& group : staff) {
        thicknesses.push_back(group.end - group.start + 1);
    }
    nth_element(thicknesses.begin(), thicknesses.begin() + 2, thicknesses.end());
    const int lineThickness = max(1, thicknesses[2]);

    double interline = 0.0;
    for (int i = 0; i < 4; ++i) {
        interline += staff[i + 1].center - staff[i].center;
    }
    interline *= 0.25;
    const double staffStep = interline * 0.5;

    vector<unsigned char> isStaffRow(h, 0);
    for (const RowGroup& group : staff) {
        for (int y = group.start; y <= group.end; ++y) {
            if (0 <= y && y < h) {
                isStaffRow[y] = 1;
            }
        }
    }

    vector<unsigned char> foreground(w * h, 0);
    for (int y = 0; y < h; ++y) {
        if (isStaffRow[y]) {
            continue;
        }
        for (int x = 0; x < w; ++x) {
            foreground[y * w + x] = black[y * w + x];
        }
    }

    const int minComponentArea = max(2, static_cast<int>(floor(
        lineThickness * max(2.0, staffStep * 0.35)
    )));

    vector<unsigned char> seen(w * h, 0);
    vector<unsigned char> clean(w * h, 0);
    vector<int> component;
    component.reserve(4096);
    static const int dx[8] = {-1, 0, 1, -1, 1, -1, 0, 1};
    static const int dy[8] = {-1, -1, -1, 0, 0, 1, 1, 1};

    for (int start = 0; start < w * h; ++start) {
        if (!foreground[start] || seen[start]) {
            continue;
        }

        component.clear();
        seen[start] = 1;
        component.push_back(start);
        for (size_t qi = 0; qi < component.size(); ++qi) {
            const int v = component[qi];
            const int x = v % w;
            const int y = v / w;
            for (int k = 0; k < 8; ++k) {
                const int nx = x + dx[k];
                const int ny = y + dy[k];
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) {
                    continue;
                }
                const int next = ny * w + nx;
                if (foreground[next] && !seen[next]) {
                    seen[next] = 1;
                    component.push_back(next);
                }
            }
        }

        if (static_cast<int>(component.size()) >= minComponentArea) {
            for (int pixel : component) {
                clean[pixel] = 1;
            }
        }
    }

    vector<int> colBlack(w, 0);
    for (int y = 0; y < h; ++y) {
        for (int x = 0; x < w; ++x) {
            colBlack[x] += clean[y * w + x];
        }
    }

    vector<Note> notes;
    const int minNoteArea = max(8, static_cast<int>(floor(staffStep * staffStep * 0.45)));
    const int rowMergeGap = max(lineThickness + 1, static_cast<int>(round(interline * 0.45)));
    const string pitches = "CDEFGAB";
    const double firstC = staff[4].center + 2.0 * staffStep;

    struct SplitCandidate {
        int score;
        int x;
        int pitchStepIndex;
    };

    auto scoreHeadAt = [&](int centerX, int pitchStepIndex, int left, int right) {
        const double centerY = firstC - pitchStepIndex * staffStep;
        const double radiusX = interline * 0.54;
        const double radiusY = interline * 0.45;
        int score = 0;

        const int top = max(0, static_cast<int>(floor(centerY - radiusY)));
        const int bottom = min(h - 1, static_cast<int>(ceil(centerY + radiusY)));
        const int scanLeft = max(left, static_cast<int>(floor(centerX - radiusX)));
        const int scanRight = min(right, static_cast<int>(ceil(centerX + radiusX)));
        for (int yy = top; yy <= bottom; ++yy) {
            const double ny = (yy - centerY) / radiusY;
            for (int xx = scanLeft; xx <= scanRight; ++xx) {
                const double nx = (xx - centerX) / radiusX;
                if (nx * nx + ny * ny <= 1.15) {
                    score += clean[yy * w + xx];
                }
            }
        }
        return score;
    };

    auto buildSplitNote = [&](int centerX, int pitchStepIndex, int left, int right) {
        int pitchIndex = pitchStepIndex % 7;
        if (pitchIndex < 0) {
            pitchIndex += 7;
        }

        const double centerY = firstC - pitchStepIndex * staffStep;
        const double radiusX = interline * 0.52;
        const double radiusY = interline * 0.43;
        int innerLeft = static_cast<int>(llround(centerX - radiusX * 0.32));
        int innerRight = static_cast<int>(llround(centerX + radiusX * 0.32));
        int innerTop = static_cast<int>(llround(centerY - radiusY * 0.30));
        int innerBottom = static_cast<int>(llround(centerY + radiusY * 0.30));
        innerLeft = max(innerLeft, left);
        innerRight = min(innerRight, right);
        innerTop = max(innerTop, 0);
        innerBottom = min(innerBottom, h - 1);

        const bool noteOnLine = (pitchStepIndex % 2 == 0);
        const double noteLineY = firstC - pitchStepIndex * staffStep;
        const double noteLineRadius = max(0.5, lineThickness * 0.45);

        int innerPixels = 0;
        int innerBlack = 0;
        for (int yy = innerTop; yy <= innerBottom; ++yy) {
            if (isStaffRow[yy] || (noteOnLine && fabs(yy - noteLineY) <= noteLineRadius)) {
                continue;
            }
            for (int xx = innerLeft; xx <= innerRight; ++xx) {
                ++innerPixels;
                innerBlack += clean[yy * w + xx];
            }
        }

        const double density = innerPixels == 0 ? 0.0
                                                : static_cast<double>(innerBlack) / innerPixels;
        const char kind = density > 0.45 ? 'Q' : 'H';
        return Note{static_cast<double>(centerX), pitches[pitchIndex], kind};
    };

    auto splitWideGroup = [&](int left, int right) {
        vector<SplitCandidate> raw;
        const int minStep = static_cast<int>(floor((firstC - (h - 1)) / staffStep)) - 1;
        const int maxStep = static_cast<int>(ceil(firstC / staffStep)) + 1;
        const int scoreThreshold = max(20, static_cast<int>(floor(staffStep * staffStep * 0.45)));
        const int localRadius = max(2, static_cast<int>(round(interline * 0.18)));
        const int width = right - left + 1;

        for (int stepIndex = minStep; stepIndex <= maxStep; ++stepIndex) {
            vector<int> scores(width, 0);
            for (int offset = 0; offset < width; ++offset) {
                scores[offset] = scoreHeadAt(left + offset, stepIndex, left, right);
            }

            for (int offset = 0; offset < width; ++offset) {
                const int score = scores[offset];
                if (score < scoreThreshold) {
                    continue;
                }

                int bestLocal = score;
                const int from = max(0, offset - localRadius);
                const int to = min(width - 1, offset + localRadius);
                for (int other = from; other <= to; ++other) {
                    bestLocal = max(bestLocal, scores[other]);
                }
                if (score == bestLocal) {
                    raw.push_back({score, left + offset, stepIndex});
                }
            }
        }

        sort(raw.begin(), raw.end(), [](const SplitCandidate& a, const SplitCandidate& b) {
            if (a.score != b.score) {
                return a.score > b.score;
            }
            return a.x < b.x;
        });

        vector<SplitCandidate> accepted;
        for (const SplitCandidate& candidate : raw) {
            const double cy = firstC - candidate.pitchStepIndex * staffStep;
            bool keep = true;
            for (const SplitCandidate& chosen : accepted) {
                const double chosenY = firstC - chosen.pitchStepIndex * staffStep;
                if (abs(candidate.x - chosen.x) <= interline * 0.62 &&
                    fabs(cy - chosenY) <= staffStep * 1.20) {
                    keep = false;
                    break;
                }
            }
            if (keep) {
                accepted.push_back(candidate);
            }
        }

        vector<Note> splitNotes;
        splitNotes.reserve(accepted.size());
        sort(accepted.begin(), accepted.end(), [](const SplitCandidate& a, const SplitCandidate& b) {
            return a.x < b.x;
        });
        for (const SplitCandidate& candidate : accepted) {
            splitNotes.push_back(buildSplitNote(
                candidate.x,
                candidate.pitchStepIndex,
                left,
                right
            ));
        }
        return splitNotes;
    };

    int x = 0;
    while (x < w) {
        while (x < w && colBlack[x] == 0) {
            ++x;
        }
        if (x == w) {
            break;
        }

        const int left = x;
        int area = 0;
        while (x < w && colBlack[x] > 0) {
            area += colBlack[x];
            ++x;
        }
        const int right = x - 1;
        if (area < minNoteArea) {
            continue;
        }

        if (right - left + 1 > interline * 1.75) {
            vector<Note> splitNotes = splitWideGroup(left, right);
            if (splitNotes.size() > 1) {
                notes.insert(notes.end(), splitNotes.begin(), splitNotes.end());
                continue;
            }
        }

        vector<int> rowCounts(h, 0);
        int maxRowCount = 0;
        for (int y = 0; y < h; ++y) {
            int count = 0;
            for (int xx = left; xx <= right; ++xx) {
                count += clean[y * w + xx];
            }
            rowCounts[y] = count;
            maxRowCount = max(maxRowCount, count);
        }

        const int denseRowThreshold = max(lineThickness + 1,
                                          static_cast<int>(ceil(maxRowCount * 0.35)));
        vector<RowGroup> denseRows;
        int y = 0;
        while (y < h) {
            while (y < h && rowCounts[y] < denseRowThreshold) {
                ++y;
            }
            if (y == h) {
                break;
            }

            const int start = y;
            int score = 0;
            while (y < h && rowCounts[y] >= denseRowThreshold) {
                score += rowCounts[y];
                ++y;
            }
            const int end = y - 1;
            denseRows.push_back({start, end, (start + end) * 0.5, score});
        }

        vector<RowGroup> mergedRows;
        for (const RowGroup& row : denseRows) {
            if (!mergedRows.empty() && row.start - mergedRows.back().end - 1 <= rowMergeGap) {
                mergedRows.back().end = row.end;
                mergedRows.back().center = (mergedRows.back().start + mergedRows.back().end) * 0.5;
                mergedRows.back().score += row.score;
            } else {
                mergedRows.push_back(row);
            }
        }

        if (mergedRows.empty()) {
            continue;
        }
        const RowGroup headRows = *max_element(
            mergedRows.begin(),
            mergedRows.end(),
            [](const RowGroup& leftGroup, const RowGroup& rightGroup) {
                return leftGroup.score < rightGroup.score;
            }
        );

        int headLeft = right;
        int headRight = left;
        for (int yy = headRows.start; yy <= headRows.end; ++yy) {
            for (int xx = left; xx <= right; ++xx) {
                if (clean[yy * w + xx]) {
                    headLeft = min(headLeft, xx);
                    headRight = max(headRight, xx);
                }
            }
        }
        if (headLeft > headRight) {
            continue;
        }

        const double headY = (headRows.start + headRows.end) * 0.5;
        const int pitchStepIndex = static_cast<int>(llround((firstC - headY) / staffStep));
        int pitchIndex = pitchStepIndex % 7;
        if (pitchIndex < 0) {
            pitchIndex += 7;
        }
        const bool noteOnLine = (pitchStepIndex % 2 == 0);
        const double noteLineY = firstC - pitchStepIndex * staffStep;
        const double noteLineRadius = max(0.5, lineThickness * 0.45);

        const int headWidth = headRight - headLeft + 1;
        const int headHeight = headRows.end - headRows.start + 1;
        int innerLeft = static_cast<int>(llround(headLeft + 0.28 * (headWidth - 1)));
        int innerRight = static_cast<int>(llround(headRight - 0.28 * (headWidth - 1)));
        int innerTop = static_cast<int>(llround(headRows.start + 0.30 * (headHeight - 1)));
        int innerBottom = static_cast<int>(llround(headRows.end - 0.30 * (headHeight - 1)));
        if (innerLeft > innerRight) {
            innerLeft = headLeft;
            innerRight = headRight;
        }
        if (innerTop > innerBottom) {
            innerTop = headRows.start;
            innerBottom = headRows.end;
        }

        int innerPixels = 0;
        int innerBlack = 0;
        for (int yy = innerTop; yy <= innerBottom; ++yy) {
            if (isStaffRow[yy] || (noteOnLine && fabs(yy - noteLineY) <= noteLineRadius)) {
                continue;
            }
            for (int xx = innerLeft; xx <= innerRight; ++xx) {
                ++innerPixels;
                innerBlack += clean[yy * w + xx];
            }
        }

        const double density = innerPixels == 0 ? 0.0
                                                : static_cast<double>(innerBlack) / innerPixels;
        const char kind = density > 0.45 ? 'Q' : 'H';
        notes.push_back({(headLeft + headRight) * 0.5, pitches[pitchIndex], kind});
    }

    sort(notes.begin(), notes.end(), [](const Note& left, const Note& right) {
        return left.xCenter < right.xCenter;
    });

    for (size_t i = 0; i < notes.size(); ++i) {
        if (i) {
            cout << ' ';
        }
        cout << notes[i].pitch << notes[i].kind;
    }
    cout << '\n';

    return 0;
}
