# Notes - CodinGame: Music Scores (C++)

## Problem Summary

The input is a black-and-white scan of a simple music score encoded with the
Doctor Who run-length format. After rebuilding the bitmap, the task is to read
the notes from left to right and output each pitch (`A` through `G`) followed by
its type: `H` for a hollow half note, `Q` for a filled quarter note.

## Three Proposals

- **Recommended (`solution.cpp`) - fast + lean:** decode the RLE image into one
  compact bitmap, detect the five staff lines by horizontal projection,
  normalize all geometry from staff spacing, remove staff rows, filter tiny
  connected components, group note columns, split unusually wide groups by
  scanning note-head candidates on the staff grid, infer pitch from each
  note-head center, and classify half/quarter by the inner density of the head.
- **Speed extreme:** coincides with the recommended proposal. The whole image is
  at most 1.5 million pixels, so the fastest practical approach is one linear
  bitmap pass per recognition stage with contiguous byte storage.
- **Memory extreme:** also coincides with the recommended proposal. Avoiding the
  bitmap would require fragile streaming summaries and would hurt note-head
  density recognition; the bitmap costs only `O(W * H)` bytes and preserves
  robustness.

No `solution-runtime.cpp` or `solution-memory.cpp` files are emitted because
they would duplicate the same Pareto-optimal algorithm.

## Language Choice - Recommended

Candidate languages considered:

- C++: Selected. It gives native linear scans over a compact byte bitmap,
  predictable allocation, fast component filtering, and simple CodinGame I/O.
- C: Competitive for raw memory, but manual dynamic arrays and queues would add
  implementation risk without improving the `O(W * H)` image-processing cost.
- Rust: Native and safe, but ownership/indexing ceremony is heavier for this
  scan-heavy contest solution and does not reduce the memory footprint.
- Go: Compiled and ergonomic, but bounds checks, runtime overhead, and garbage
  collection are less attractive for repeated full-image passes.
- Java / C#: Capable for these constraints, but VM startup, array/object
  overhead, and GC behavior are weaker than contiguous native vectors.
- Python / JavaScript / TypeScript / PHP: Useful for verification mirrors, but
  interpreter/VM overhead is unnecessary for top-percentile image scans.

Chosen language:

- Selected: C++17.
- Why it wins for this proposal: all hot work is simple array traversal,
  grouping, and flood-fill on at most 1.5 million pixels, exactly where C++
  contiguous vectors and native integer arithmetic excel.
- Why the main alternatives lose: C does not improve the algorithmic footprint,
  while managed and interpreted runtimes add overhead on every pixel pass.

## Constraints

- Image width: `100 < W < 5000`.
- Image height: `70 < H < 300`.
- Black staff lines and stems have width at least 1 pixel.
- The vertical space between staff lines is at least 8 pixels and at least 4
  times the line width.
- Notes are separated by at least 1 pixel.
- The image contains only the supported half and quarter notes.

## Key Observations

- The five staff lines dominate the horizontal projection, even when note heads
  create small holes in a line.
- Once the staff spacing is known, pitches are just rounded positions on a
  half-interline grid starting from the ledger-line `C` below the staff.
- Removing only staff rows disconnects the long horizontal lines while leaving
  enough of note heads, stems, and ledger lines to identify each note.
- Filled and hollow heads differ sharply in the density of the central region
  after staff rows are ignored.

## Reasoning Process

A direct connected-component scan on the original image fails because every note
touches one or more staff lines, so the staff can merge most black pixels into a
single component. The staff must be treated as reference geometry first and as
noise second.

The solution therefore starts with horizontal projection. The staff rows are the
only rows with very large black counts and they appear as five almost equally
spaced bands. Their centers provide the scale: line thickness, interline
distance, and the half-step between adjacent musical positions.

After masking those staff rows, vertical projections isolate most notes by their
occupied columns. Small connected components are removed before this grouping so
that scan noise does not create fake notes. For ordinary column groups, the
dense horizontal band is the note head; the long thin stem is ignored because it
never has enough row width to dominate the head rows. Very close diagonal notes
can overlap in columns, so wide groups receive a second pass: the solver scores
possible note heads directly on every staff-grid pitch and keeps local maxima.

## Final Approach

1. Decode the DWE stream directly into a byte bitmap.
2. Count black pixels per row.
3. Detect high-projection row groups and select the five most regular staff-line
   bands.
4. Derive line thickness, interline distance, and staff half-step from those
   bands.
5. Mask staff rows and remove tiny connected components with an 8-neighbor
   flood fill.
6. Group non-empty columns of the cleaned image.
7. For a normal-width group, find the dense row band corresponding to the note
   head, merging across small gaps caused by removed staff lines.
8. For a wide group, scan ellipse-shaped note-head windows over all possible
   staff-grid pitches, reject in-between maxima that do not have either filled
   center support or balanced hollow-head annular support, then keep
   non-overlapping local maxima so close diagonal notes are split correctly.
9. Convert each head center to a pitch by rounding against the staff grid.
10. Sample the inner head density: high density means `Q`, low density means `H`.
11. Sort by head center and print the recognized notes.

## Why This Approach

The algorithm is scale-invariant: no note width or absolute pixel coordinate is
hard-coded. All thresholds are derived from the detected staff scale and from
local projection maxima. That makes it preferable to template matching, which
would be brittle across the puzzle's different image sizes.

The bitmap approach is also preferable to a streaming-only decoder. The memory
budget is small, and keeping pixels available makes it possible to remove staff
rows, filter noise, and sample the note-head interior accurately.

## Top 1% Performance Strategy

- Decode RLE directly into contiguous byte storage.
- Use linear row and column projections instead of expensive template matching.
- Estimate scale once from the staff and reuse it everywhere.
- Remove tiny components before column grouping to avoid noise-driven branches.
- Split only wide column groups with a localized grid scan, keeping the common
  path as simple projections.
- Validate wide-group split candidates by head shape so neighboring hollow
  notes do not create a false note between them.
- Keep flood-fill storage as one reusable vector of pixel indices.
- Avoid per-pixel objects, strings, maps, or dynamic polymorphism.
- Perform only a handful of `O(W * H)` passes over a very small image.

## Edge Cases

- Staff lines with holes caused by hollow notes are still selected because the
  five-line regular spacing is used in addition to raw row strength.
- Notes on staff lines are handled by merging note-head row bands split by the
  removed line rows.
- Very close diagonal note heads are handled by the wide-group splitter instead
  of being collapsed into one large note.
- Adjacent hollow notes can create a tempting maximum between their rings; the
  splitter rejects it unless all four head quadrants have enough support.
- The first `C` below the staff works because its ledger line is not one of the
  five masked staff lines and its center lies exactly on the same half-step grid.
- Hollow notes crossed by staff or ledger lines remain hollow because density is
  sampled in the central head area while staff rows are ignored.
- Tiny isolated noise components are discarded before note grouping.

## Alternatives

- Full template matching was rejected because the images vary in scale and line
  thickness.
- Original-image connected components were rejected because the staff lines join
  unrelated notes.
- A streaming-only RLE solution was rejected because the type classifier needs
  local two-dimensional density around each note head.
- Hough-transform line detection would be overkill; the staff is horizontal and
  the row projection is deterministic for this puzzle.

## Verification

A temporary Python script mirrored the C++ recognition pipeline. It decoded the
provided sample RLE and produced `AQ DH`, then generated randomized synthetic
staff images with varied scale, line thickness, note positions, half/quarter
types, stem direction, ledger lines, and light salt noise. The mirror compared
the detector output with the generated ground truth. The public `Doctor Who
theme` image (`in11.png`) was also used to reproduce the reported failure; after
adding the wide-group splitter, the mirror produced the expected 84-note output.
The public `Random` image (`in12.png`) reproduced the later hidden-middle
failure, where two adjacent hollow heads created a false in-between `DH`; after
adding head-shape validation, the mirror produced the 90-note sequence with the
middle segment corrected to `... DQ DQ CH EH CH ...`.
The temporary script and downloaded debug images were removed after verification.

## See Also

All maintained proposals for this challenge are in this C++ folder.
