# User Guide

## 1. Enter a regex pattern
Type a regex pattern into the **Regex Pattern** field.

Examples:
- `ERROR|WARN|FAIL`
- `\\b\\d{1,3}(\\.\\d{1,3}){3}\\b`
- `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}`
- `(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})`

## 2. Paste test text
Paste plain sample text into the **Test Text** area. Line numbers are shown on the left side for easier reading.

## 3. Use flags
- `g`: find all matches
- `i`: ignore letter case
- `m`: multiline mode

You can hover the flag labels to read a short tooltip.
If `g` is not selected, the tool shows the first match only.

## 4. Read and jump through match results
The **Results** section shows:
- total match count
- highlighted matches inside the text preview
- matched text for each hit
- start index
- end index
- captured groups, if available
- named groups, if available

Tap or click a result card to jump to that match inside the test text editor.

## 5. Use replace diff preview
Enter text in **Replace Preview** to compare the original content and replaced result side by side. This is only a local preview and does not send data anywhere.

## 6. Export files
- Click **Export Result** to download the current result summary as `result.txt`
- Click **Export Replace All** to download replaced output as `replace_result.txt`

## 7. Load examples
Use **Load Example** to rotate through generic examples for status words, IP addresses, email, URL, phone numbers, and dates.

## 8. Handle regex errors
If the regex pattern is invalid, the tool shows the error message on screen. Update the pattern and the page will continue working without a refresh.
