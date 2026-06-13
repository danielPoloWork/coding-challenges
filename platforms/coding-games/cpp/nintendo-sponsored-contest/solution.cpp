#include <algorithm>
#include <array>
#include <bitset>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using namespace std;

namespace {

constexpr int MAX_BITS = 512;
constexpr int WORDS = MAX_BITS / 64;

struct Poly {
    array<uint64_t, WORDS> w{};

    bool operator==(const Poly& other) const {
        return w == other.w;
    }

    bool operator<(const Poly& other) const {
        for (int i = WORDS - 1; i >= 0; --i) {
            if (w[i] != other.w[i]) {
                return w[i] < other.w[i];
            }
        }
        return false;
    }

    bool zero() const {
        for (uint64_t x : w) {
            if (x != 0) {
                return false;
            }
        }
        return true;
    }

    int degree() const {
        for (int i = WORDS - 1; i >= 0; --i) {
            if (w[i] != 0) {
                return i * 64 + 63 - __builtin_clzll(w[i]);
            }
        }
        return -1;
    }

    bool test(int bit) const {
        return (w[bit >> 6] >> (bit & 63)) & 1ULL;
    }

    void flip(int bit) {
        w[bit >> 6] ^= 1ULL << (bit & 63);
    }

    void set(int bit) {
        w[bit >> 6] |= 1ULL << (bit & 63);
    }

    void xorWith(const Poly& other) {
        for (int i = 0; i < WORDS; ++i) {
            w[i] ^= other.w[i];
        }
    }

    void xorShifted(const Poly& other, int shift) {
        const int whole = shift >> 6;
        const int part = shift & 63;
        for (int i = 0; i + whole < WORDS; ++i) {
            const uint64_t value = other.w[i];
            if (value == 0) {
                continue;
            }
            w[i + whole] ^= value << part;
            if (part != 0 && i + whole + 1 < WORDS) {
                w[i + whole + 1] ^= value >> (64 - part);
            }
        }
    }
};

Poly one() {
    Poly p;
    p.set(0);
    return p;
}

Poly shifted(const Poly& p, int shift) {
    Poly result;
    result.xorShifted(p, shift);
    return result;
}

Poly multiply(const Poly& a, const Poly& b) {
    Poly result;
    for (int word = 0; word < WORDS; ++word) {
        uint64_t bits = a.w[word];
        while (bits != 0) {
            const int low = __builtin_ctzll(bits);
            result.xorShifted(b, word * 64 + low);
            bits &= bits - 1;
        }
    }
    return result;
}

Poly modPoly(Poly value, const Poly& divisor) {
    const int divisorDegree = divisor.degree();
    if (divisorDegree <= 0) {
        return Poly{};
    }
    for (int d = value.degree(); d >= divisorDegree; d = value.degree()) {
        value.xorShifted(divisor, d - divisorDegree);
    }
    return value;
}

Poly quotientExact(Poly value, const Poly& divisor) {
    const int divisorDegree = divisor.degree();
    Poly quotient;
    if (divisorDegree == 0) {
        return value;
    }
    for (int d = value.degree(); d >= divisorDegree; d = value.degree()) {
        const int shift = d - divisorDegree;
        quotient.flip(shift);
        value.xorShifted(divisor, shift);
    }
    return quotient;
}

Poly gcdPoly(Poly a, Poly b) {
    while (!b.zero()) {
        Poly r = modPoly(a, b);
        a = b;
        b = r;
    }
    return a;
}

Poly derivative(const Poly& p) {
    Poly result;
    const int d = p.degree();
    for (int bit = 1; bit <= d; bit += 2) {
        if (p.test(bit)) {
            result.set(bit - 1);
        }
    }
    return result;
}

Poly squareRoot(const Poly& p) {
    Poly result;
    const int d = p.degree();
    for (int bit = 0; bit <= d; bit += 2) {
        if (p.test(bit)) {
            result.set(bit >> 1);
        }
    }
    return result;
}

vector<Poly> berlekampSquareFree(const Poly& f) {
    const int n = f.degree();
    if (n <= 1) {
        return {f};
    }

    vector<bitset<MAX_BITS>> matrix(n);
    Poly column = one();

    for (int c = 0; c < n; ++c) {
        for (int r = 0; r < n; ++r) {
            if (column.test(r)) {
                matrix[r].flip(c);
            }
        }
        matrix[c].flip(c);
        column = modPoly(shifted(column, 2), f);
    }

    vector<int> where(n, -1);
    int row = 0;
    for (int col = 0; col < n && row < n; ++col) {
        int selected = -1;
        for (int r = row; r < n; ++r) {
            if (matrix[r].test(col)) {
                selected = r;
                break;
            }
        }
        if (selected == -1) {
            continue;
        }
        swap(matrix[row], matrix[selected]);
        where[col] = row;
        for (int r = 0; r < n; ++r) {
            if (r != row && matrix[r].test(col)) {
                matrix[r] ^= matrix[row];
            }
        }
        ++row;
    }

    vector<Poly> basis;
    for (int freeCol = 0; freeCol < n; ++freeCol) {
        if (where[freeCol] != -1) {
            continue;
        }
        Poly v;
        v.set(freeCol);
        for (int col = 0; col < n; ++col) {
            const int pivotRow = where[col];
            if (pivotRow != -1 && matrix[pivotRow].test(freeCol)) {
                v.set(col);
            }
        }
        basis.push_back(v);
    }

    if (basis.size() <= 1) {
        return {f};
    }

    vector<Poly> factors{f};
    for (const Poly& separator : basis) {
        if (separator.degree() <= 0) {
            continue;
        }

        vector<Poly> next;
        for (const Poly& factor : factors) {
            if (factor.degree() <= 1) {
                next.push_back(factor);
                continue;
            }

            Poly candidate = gcdPoly(factor, modPoly(separator, factor));
            const int cd = candidate.degree();
            if (cd > 0 && cd < factor.degree()) {
                next.push_back(candidate);
                next.push_back(quotientExact(factor, candidate));
            } else {
                next.push_back(factor);
            }
        }
        factors.swap(next);
    }

    sort(factors.begin(), factors.end());
    return factors;
}

vector<Poly> factorWithMultiplicity(const Poly& f) {
    if (f.degree() <= 0) {
        return {};
    }

    Poly df = derivative(f);
    if (df.zero()) {
        vector<Poly> inner = factorWithMultiplicity(squareRoot(f));
        vector<Poly> doubled;
        doubled.reserve(inner.size() * 2);
        for (const Poly& p : inner) {
            doubled.push_back(p);
            doubled.push_back(p);
        }
        return doubled;
    }

    vector<Poly> result;
    Poly c = gcdPoly(f, df);
    Poly w = quotientExact(f, c);

    for (int multiplicity = 1; !w.zero() && w.degree() > 0; ++multiplicity) {
        Poly y = gcdPoly(w, c);
        Poly z = quotientExact(w, y);
        if (z.degree() > 0) {
            vector<Poly> squareFreeFactors = berlekampSquareFree(z);
            for (const Poly& p : squareFreeFactors) {
                for (int i = 0; i < multiplicity; ++i) {
                    result.push_back(p);
                }
            }
        }
        w = y;
        c = quotientExact(c, y);
    }

    if (c.degree() > 0) {
        vector<Poly> inner = factorWithMultiplicity(squareRoot(c));
        for (const Poly& p : inner) {
            result.push_back(p);
            result.push_back(p);
        }
    }

    sort(result.begin(), result.end());
    return result;
}

uint32_t word32(const Poly& p, int index) {
    const int shift = (index & 1) * 32;
    return static_cast<uint32_t>((p.w[index >> 1] >> shift) & 0xffffffffULL);
}

string decodedLine(const Poly& left, const Poly& right, int factorWords) {
    ostringstream out;
    out << hex << nouppercase << setfill('0');
    for (int i = 0; i < factorWords * 2; ++i) {
        if (i != 0) {
            out << ' ';
        }
        const uint32_t value = i < factorWords ? word32(left, i)
                                               : word32(right, i - factorWords);
        out << setw(8) << value;
    }
    return out.str();
}

void enumerateDivisors(
    int groupIndex,
    const vector<vector<Poly>>& powers,
    const Poly& encoded,
    int encodedDegree,
    int size,
    int factorWords,
    const Poly& current,
    vector<string>& answers
) {
    if (groupIndex == static_cast<int>(powers.size())) {
        const int leftDegree = current.degree();
        const int rightDegree = encodedDegree - leftDegree;
        if (leftDegree < size && rightDegree < size) {
            Poly right = quotientExact(encoded, current);
            answers.push_back(decodedLine(current, right, factorWords));
        }
        return;
    }

    for (const Poly& power : powers[groupIndex]) {
        Poly next = multiply(current, power);
        const int leftDegree = next.degree();
        if (leftDegree < size) {
            enumerateDivisors(
                groupIndex + 1,
                powers,
                encoded,
                encodedDegree,
                size,
                factorWords,
                next,
                answers
            );
        }
    }
}

} // namespace

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int size;
    if (!(cin >> size)) {
        return 0;
    }

    const int encodedWords = size / 16;
    const int factorWords = size / 32;

    Poly encoded;
    for (int i = 0; i < encodedWords; ++i) {
        string token;
        cin >> token;
        const uint32_t value = static_cast<uint32_t>(stoul(token, nullptr, 16));
        encoded.w[i >> 1] |= static_cast<uint64_t>(value) << ((i & 1) * 32);
    }

    if (encoded.zero()) {
        return 0;
    }

    vector<Poly> factors = factorWithMultiplicity(encoded);

    vector<vector<Poly>> powers;
    for (int i = 0; i < static_cast<int>(factors.size());) {
        int j = i + 1;
        while (j < static_cast<int>(factors.size()) && factors[j] == factors[i]) {
            ++j;
        }

        vector<Poly> groupPowers;
        groupPowers.push_back(one());
        for (int e = 1; e <= j - i; ++e) {
            groupPowers.push_back(multiply(groupPowers.back(), factors[i]));
        }
        powers.push_back(groupPowers);
        i = j;
    }

    vector<string> answers;
    enumerateDivisors(
        0,
        powers,
        encoded,
        encoded.degree(),
        size,
        factorWords,
        one(),
        answers
    );

    sort(answers.begin(), answers.end());
    answers.erase(unique(answers.begin(), answers.end()), answers.end());

    for (const string& answer : answers) {
        cout << answer << '\n';
    }

    return 0;
}
