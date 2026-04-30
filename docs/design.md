# Design

## Layout
- Header with tool name, privacy statement, and theme switch
- Regex input area with template chips, dataset selector, undo button, validator hints, performance hints, and action buttons
- IDE-style text area for sample text with line numbers
- Result area with stats dashboard, filter/sort/group controls, replace count, highlight view, diff preview, and result cards

## New in v1.7
- Stats dashboard for visible count, zero-length count, unique values, and average length
- Performance hint for suspicious regex patterns or very large text
- Undo previous sample dataset load
- JSON export alongside text export

## Safety model
- All processing stays in browser memory
- No remote requests
- No localStorage/sessionStorage/cookies
- No eval
