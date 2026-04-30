# Design

## Layout
- Header with tool name and privacy statement
- Regex input area with flag controls and action buttons
- Optional replace preview input
- Large IDE-style text area for sample text with line numbers
- Result area with summary, highlight view, replace preview, and detailed match cards
- Cheat sheet area for quick regex reference

## Responsive behavior
- Desktop: input and text panels can sit in a two-column layout, results and cheat sheet span full width
- Mobile: all sections stack into a single column
- Buttons remain large enough for touch interaction
- No horizontal scrolling

## Matching behavior
- Without `g`, show the first match only
- With `g`, show all matches
- Each match includes:
  - matched text
  - start index
  - end index
  - captured groups if present
  - named groups if present
- Replace preview applies the current regex and replacement string locally in the browser
- Replace-all export downloads the replaced output as a local text file

## Error handling
- Invalid regex patterns are caught with `try/catch`
- The page continues working and shows the error message in the status/result area
