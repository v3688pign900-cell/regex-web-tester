# Design

## Layout
- Header with tool name and privacy statement
- Regex input area with flag controls and action buttons
- Large text area for sample text
- Result area with summary, highlight view, and detailed match cards

## Responsive behavior
- Desktop: input and text panels can sit in a two-column layout, results span full width
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

## Error handling
- Invalid regex patterns are caught with `try/catch`
- The page continues working and shows the error message in the status/result area
