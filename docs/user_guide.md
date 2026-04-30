# User Guide

## 1. Enter a regex pattern
Type a regex pattern into the **Regex Pattern** field.

Examples:
- `ERROR|WARN|FAIL`
- `\\b\\d{1,3}(\\.\\d{1,3}){3}\\b`
- `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}`

## 2. Paste test text
Paste plain sample text into the **Test Text** area.

## 3. Use flags
- `g`: find all matches
- `i`: ignore letter case
- `m`: multiline mode

If `g` is not selected, the tool shows the first match only.

## 4. Read match results
The **Results** section shows:
- total match count
- highlighted matches inside the text preview
- matched text for each hit
- start index
- end index
- captured groups, if available

## 5. Export `result.txt`
Click **Export Result** to download the current result summary as `result.txt`.

## 6. Handle regex errors
If the regex pattern is invalid, the tool shows the error message on screen. Update the pattern and the page will continue working without a refresh.
