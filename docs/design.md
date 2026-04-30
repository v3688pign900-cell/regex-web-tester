# Design

## Layout
- Header with tool name, privacy statement, and theme switch
- Regex input area with template chips, dataset selector, validator hints, flag controls, inline flag help, and action buttons
- Optional replace preview input
- Large IDE-style text area for sample text with line numbers
- Result area with filter box, sort/group controls, replace count, highlight view, side-by-side replace diff, and expandable match cards
- Cheat sheet area for quick regex reference

## Responsive behavior
- Desktop: input and text panels can sit in a two-column layout, results and cheat sheet span full width
- Mobile: all sections stack into a single column
- Buttons remain large enough for touch interaction
- Spacing is tightened for small screens while preserving touch comfort
- No horizontal scrolling

## Matching behavior
- Without `g`, show the first match only
- With `g`, show all matches
- Each match includes:
  - matched text
  - start index
  - end index
  - zero-length badge when needed
  - captured groups if present
  - named groups if present
- Replace preview shows original and replaced output side by side
- Replace count mirrors how many matches would be replaced
- Match cards can move focus to the matching range inside the text area
- Match cards support expand/collapse for details
- Result filtering works on match text and group values
- Sorting and grouping help organize larger result sets
- Replace-all export downloads the replaced output as a local text file

## Keyboard shortcuts and accessibility
- `Ctrl/Cmd + Enter`: load next example
- `Ctrl/Cmd + L`: clear fields
- `Ctrl/Cmd + Shift + C`: copy result summary
- Result cards support keyboard focus, Enter/Space activation, and ArrowUp/ArrowDown movement
- Important inputs include ARIA labels or descriptions

## Error handling
- Invalid regex patterns are caught with `try/catch`
- Validator hints explain common mistakes such as outer slashes or overly broad patterns
- Zero-length matches are marked explicitly to avoid confusion
- The page continues working and shows the error message in the status/result area
