# User Guide

## 1. Enter a regex pattern
Type a regex pattern into the **Regex Pattern** field.

Examples:
- `ERROR|WARN|FAIL`
- `\\b\\d{1,3}(\\.\\d{1,3}){3}\\b`
- `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}`
- `(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})`

## 2. Use templates
Tap a template chip such as **Status**, **IP**, **Email**, or **Date** to quickly fill the pattern and replacement fields.

## 3. Load a sample dataset
Choose a sample dataset from the selector, then click **Load Dataset**.

## 4. Check validator hints
The validator line below the regex input gives quick feedback such as:
- waiting for input
- valid syntax
- remove outer slash delimiters
- pattern may be overly broad
- syntax error details

## 5. Paste test text
Paste plain sample text into the **Test Text** area. Line numbers are shown on the left side for easier reading.

## 6. Use flags
- `g`: find all matches
- `i`: ignore letter case
- `m`: multiline mode

You can hover the flag labels to read a short tooltip.
If `g` is not selected, the tool shows the first match only.

## 7. Read, filter, sort, group, and expand match results
The **Results** section shows:
- total match count
- replace count
- highlighted matches inside the text preview
- matched text for each hit
- start index
- end index
- zero-length badge when applicable
- captured groups, if available
- named groups, if available

Use **Filter Results** to narrow the visible cards.
Use **Sort Results** and **Group By** to reorganize the list.
Tap or click a result card to jump to that match inside the test text editor. Tap again to expand or collapse details.

## 8. Use replace diff preview
Enter text in **Replace Preview** to compare the original content and replaced result side by side. This is only a local preview and does not send data anywhere.

## 9. Copy or export outputs
- Click **Copy Result** to copy the full result summary
- Click **Copy Highlighted Text** to copy the highlighted preview text
- Click **Copy Replaced Text** to copy replaced output
- Click **Export Result** to download the current result summary as `result.txt`
- Click **Export Replace All** to download replaced output as `replace_result.txt`

## 10. Use keyboard shortcuts
- `Ctrl/Cmd + Enter`: load next example
- `Ctrl/Cmd + L`: clear all fields
- `Ctrl/Cmd + Shift + C`: copy result summary
- In result cards, use `ArrowUp` and `ArrowDown` to move focus

## 11. Switch theme
Use the theme button in the header to change between light and dark views.

## 12. Handle regex errors
If the regex pattern is invalid, the tool shows the error message on screen. Update the pattern and the page will continue working without a refresh.
