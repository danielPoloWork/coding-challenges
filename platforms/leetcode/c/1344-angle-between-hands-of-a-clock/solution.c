// LeetCode 1344 - Angle Between Hands of a Clock
// Recommended solution: integer-scaled direct angle computation.
//
// Work in half-degree units to keep both hand positions integral. The final
// division by 2.0 is the only floating-point operation.

double angleClock(int hour, int minutes) {
    const int hour_half_degrees = (hour % 12) * 60 + minutes;
    const int minute_half_degrees = minutes * 12;

    int diff = hour_half_degrees - minute_half_degrees;
    if (diff < 0) {
        diff = -diff;
    }
    if (diff > 360) {
        diff = 720 - diff;
    }

    return diff / 2.0;
}
