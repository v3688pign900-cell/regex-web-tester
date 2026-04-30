# Security Design

## Data flow
1. The user enters a regex pattern in the browser.
2. The user pastes or types sample text in the browser.
3. JavaScript creates a `RegExp` object locally.
4. Matching is performed in browser memory only.
5. Results are rendered directly in the page or exported to a local text file.

## Why data does not leave the local machine
- The app is a static site made only of local HTML, CSS, and JavaScript.
- Regex processing is done with the browser's built-in `RegExp` engine.
- No network request API is used for user input handling.
- No analytics, tracking, or remote logging is included.
- The exported result file is generated locally with `Blob` and downloaded by the browser.

## Prohibited APIs and integrations
The implementation must not use:
- `fetch`
- `XMLHttpRequest`
- `WebSocket`
- external CDN
- analytics
- `localStorage`
- `sessionStorage`
- cookies

## Offline usage
- The project can be opened by double-clicking `index.html`.
- No server runtime is required.
- After download, the regex testing workflow continues to work without internet access.
