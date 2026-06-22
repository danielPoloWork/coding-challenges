// LeetCode 1189 - Maximum Number of Balloons
// Memory-extreme solution: count only the five letters used by "balloon".

int maxNumberOfBalloons(char* text) {
    int b = 0;
    int a = 0;
    int l = 0;
    int o = 0;
    int nCount = 0;

    for (const char* p = text; *p != '\0'; ++p) {
        switch (*p) {
            case 'b':
                ++b;
                break;
            case 'a':
                ++a;
                break;
            case 'l':
                ++l;
                break;
            case 'o':
                ++o;
                break;
            case 'n':
                ++nCount;
                break;
            default:
                break;
        }
    }

    int answer = b;
    if (a < answer) answer = a;

    l >>= 1;
    if (l < answer) answer = l;

    o >>= 1;
    if (o < answer) answer = o;

    if (nCount < answer) answer = nCount;

    return answer;
}
