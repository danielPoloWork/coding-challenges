# Complexity

## Recommended - `solution.cpp` (fast + lean)

### Time Complexity

```text
O(W * H + C + S)
```

`C` is the number of combinations among high-projection row groups considered
while selecting the five staff lines. Wide note groups add localized head-window
scans over a bounded set of staff-grid pitches; under `H < 300`, this remains a
small constant-factor addition to the dominant image passes.

### Space Complexity

```text
O(W * H)
```

The bitmap, cleaned bitmap, visited mask, and component queue are all linear in
the number of image pixels.

## Speed extreme - coincident

### Time Complexity

```text
O(W * H + C + S)
```

No separate speed variant is emitted because the recommended algorithm already
uses direct linear scans and contiguous native storage.

### Space Complexity

```text
O(W * H)
```

## Memory extreme - coincident

### Time Complexity

```text
O(W * H + C + S)
```

### Space Complexity

```text
O(W * H)
```

Keeping the bitmap is the memory-conscious choice for this problem: a
streaming-only design would save little under the constraints and would lose the
local density information needed for robust note classification.

## Variables

- `W`: image width in pixels.
- `H`: image height in pixels.
- `C`: bounded number of five-group staff-line candidates among detected row
  bands.
- `S`: total localized scan work spent on unusually wide column groups.

## Top 1% Performance Strategy

The solver keeps every hot operation as a primitive-array scan: RLE decode,
horizontal projection, staff masking, component filtering, vertical projection,
wide-group local head scanning, and note-head density sampling. It avoids full
template matching, maps, heap objects per pixel, and repeated rescans of large
regions.

## Optimization Notes

The only meaningful extra optimization would be packing the bitmap into bits,
but that would make neighborhood traversal and density sampling more complex
without reducing the asymptotic memory bound or helping CodinGame runtime at
this image size.
