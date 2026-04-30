# Regex Web Tester

## Project purpose
Regex Web Tester is a lightweight browser-based tool for testing regular expressions against sample text. It runs entirely on the client side and is suitable for GitHub Pages or offline local use.

## Run with GitHub Pages
1. Push the project to a GitHub repository.
2. Make sure `index.html` is in the repository root.
3. Open repository **Settings** → **Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Set **Branch** to `main`.
6. Set **Folder** to `/(root)`.
7. Open the published GitHub Pages URL after deployment completes.

## Run offline
1. Download or clone the repository.
2. Open the `regex-web-tester` folder.
3. Double-click `index.html`.
4. The tool will run locally in a browser without a server.

## Features
- Match stats dashboard
- Regex performance warning hint
- Undo sample dataset load
- Export as TXT and JSON
- Built-in regex template chips
- Sample dataset selector
- Regex syntax validator hints
- Test text input with line numbers
- Search, filter, sort, and group for result cards
- Side-by-side original vs replaced preview
- Copy highlighted text and replaced text
- Dark / light theme switch
- No external network dependency

## Security statement
All regex testing is performed locally in your browser. No text or regex data is uploaded.

## Browser support
Supported browsers:
- Chrome latest
- Edge latest
- Firefox latest
- Safari latest

Not supported:
- Internet Explorer

## Notes
- No external CDN is used.
- No `eval()` is used.
- The project is designed to work without network access after download.
