const regexInput = document.getElementById('regex-input');
const replaceInput = document.getElementById('replace-input');
const testText = document.getElementById('test-text');
const lineNumbers = document.getElementById('line-numbers');
const flagG = document.getElementById('flag-g');
const flagI = document.getElementById('flag-i');
const flagM = document.getElementById('flag-m');
const statusMessage = document.getElementById('status-message');
const matchCount = document.getElementById('match-count');
const highlightOutput = document.getElementById('highlight-output');
const originalOutput = document.getElementById('original-output');
const replaceOutput = document.getElementById('replace-output');
const resultList = document.getElementById('result-list');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const exportBtn = document.getElementById('export-btn');
const exportReplaceBtn = document.getElementById('export-replace-btn');
const exampleBtn = document.getElementById('example-btn');
const themeToggle = document.getElementById('theme-toggle');
const templateActions = document.getElementById('template-actions');
const datasetSelect = document.getElementById('dataset-select');
const loadDatasetBtn = document.getElementById('load-dataset-btn');
const regexValidator = document.getElementById('regex-validator');
const resultFilter = document.getElementById('result-filter');

const templatePresets = [
  { label: 'Status', pattern: 'ERROR|WARN|FAIL', flags: { g: true, i: false, m: false }, replace: '[ALERT]' },
  { label: 'IP', pattern: '\\b\\d{1,3}(\\.\\d{1,3}){3}\\b', flags: { g: true, i: false, m: false }, replace: '[IP]' },
  { label: 'Email', pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', flags: { g: true, i: true, m: false }, replace: '[EMAIL]' },
  { label: 'Date', pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', flags: { g: true, i: false, m: false }, replace: '$<day>/$<month>/$<year>' }
];

const datasets = [
  {
    label: 'System Messages',
    text: ['INFO Startup complete', 'WARN Disk usage is above 80%', 'ERROR Unable to open file', 'FAIL Retry limit reached', 'INFO Shutdown complete'].join('\n')
  },
  {
    label: 'Contacts',
    text: ['Alice <alice@example.com>', 'Bob <bob.sales@test-mail.org>', 'Carol <carol_ops@sample.net>'].join('\n')
  },
  {
    label: 'Network Notes',
    text: ['Primary server: 192.168.10.25', 'Fallback server: 10.0.0.8', 'Docs: https://example.com/docs/start'].join('\n')
  }
];

const exampleDataList = [
  { label: 'Status words', pattern: 'ERROR|WARN|FAIL', flags: { g: true, i: false, m: false }, replace: '[ALERT]', text: datasets[0].text },
  { label: 'IP address', pattern: '\\b\\d{1,3}(\\.\\d{1,3}){3}\\b', flags: { g: true, i: false, m: false }, replace: '[IP]', text: datasets[2].text },
  { label: 'Email address', pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', flags: { g: true, i: true, m: false }, replace: '[EMAIL]', text: datasets[1].text },
  { label: 'URL', pattern: 'https?:\\/\\/[\\w.-]+(?:\\/[\\w./?%&=-]*)?', flags: { g: true, i: true, m: false }, replace: '[URL]', text: datasets[2].text },
  { label: 'Phone number', pattern: '(?:\\+?\\d{1,3}[ -]?)?(?:\\(?\\d{2,4}\\)?[ -]?)?\\d{3,4}[ -]?\\d{4}', flags: { g: true, i: false, m: false }, replace: '[PHONE]', text: ['Call +1 555 123 4567 for sales.', 'Office line: (02) 2345-6789'].join('\n') },
  { label: 'Date', pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', flags: { g: true, i: false, m: false }, replace: '$<day>/$<month>/$<year>', text: ['Release date: 2026-04-30', 'Review date: 2026-05-12'].join('\n') }
];

let exampleIndex = 0;
let lastMatches = [];
let currentTheme = 'light';

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getFlags() {
  return [flagG.checked ? 'g' : '', flagI.checked ? 'i' : '', flagM.checked ? 'm' : ''].join('');
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = 'status';
  if (type) statusMessage.classList.add(type);
}

function setValidator(message, type) {
  regexValidator.textContent = `Validator: ${message}`;
  regexValidator.className = 'validator';
  if (type) regexValidator.classList.add(type);
}

function renderEmptyState(message) {
  matchCount.textContent = 'Matches: 0';
  highlightOutput.innerHTML = `<span class="placeholder">${escapeHtml(message)}</span>`;
  originalOutput.textContent = 'Original text will appear here.';
  replaceOutput.textContent = 'Replacement preview will appear here.';
  resultList.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
  lastMatches = [];
}

function updateLineNumbers() {
  const lineCount = Math.max(1, testText.value.split('\n').length);
  lineNumbers.textContent = Array.from({ length: lineCount }, (_, index) => index + 1).join('\n');
}

function syncLineNumberScroll() {
  lineNumbers.scrollTop = testText.scrollTop;
}

function buildRegex() {
  if (!regexInput.value) return null;
  return new RegExp(regexInput.value, getFlags());
}

function cloneRegex(regex) {
  return new RegExp(regex.source, regex.flags);
}

function validateRegexPattern() {
  const pattern = regexInput.value;
  if (!pattern) {
    setValidator('waiting for input.', '');
    return;
  }
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    setValidator('remove outer slash delimiters like /pattern/.', 'warn');
    return;
  }
  if (pattern.includes('.*.*')) {
    setValidator('pattern may be overly broad because it repeats wildcard sections.', 'warn');
    return;
  }
  try {
    buildRegex();
    setValidator('pattern syntax looks valid.', 'ok');
  } catch (error) {
    setValidator(error.message, 'error');
  }
}

function findMatches(regex, text) {
  const matches = [];
  if (regex.global) {
    regex.lastIndex = 0;
    let found;
    while ((found = regex.exec(text)) !== null) {
      matches.push({ text: found[0], index: found.index, endIndex: found.index + found[0].length, groups: found.slice(1), namedGroups: found.groups || {} });
      if (found[0] === '') regex.lastIndex += 1;
    }
  } else {
    const found = regex.exec(text);
    if (found) matches.push({ text: found[0], index: found.index, endIndex: found.index + found[0].length, groups: found.slice(1), namedGroups: found.groups || {} });
  }
  return matches;
}

function renderHighlight(text, matches) {
  if (!text) {
    highlightOutput.innerHTML = '<span class="placeholder">Paste text to see highlighted matches.</span>';
    return;
  }
  if (matches.length === 0) {
    highlightOutput.textContent = text;
    return;
  }
  let cursor = 0;
  const parts = [];
  matches.forEach((match) => {
    parts.push(escapeHtml(text.slice(cursor, match.index)));
    parts.push(`<mark class="match-chip">${escapeHtml(text.slice(match.index, match.endIndex))}</mark>`);
    cursor = match.endIndex;
  });
  parts.push(escapeHtml(text.slice(cursor)));
  highlightOutput.innerHTML = parts.join('');
}

function getReplacePreviewText(text, regex) {
  if (!text) return 'Replacement preview will appear here.';
  if (!replaceInput.value) return 'Enter a replacement string to preview the replaced result.';
  const safeRegex = regex.global ? cloneRegex(regex) : new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  return text.replace(safeRegex, replaceInput.value);
}

function renderReplacePreview(text, regex) {
  originalOutput.textContent = text || 'Original text will appear here.';
  replaceOutput.textContent = getReplacePreviewText(text, regex);
}

function buildResultText(matches) {
  if (matches.length === 0) return 'Matches: 0';
  const lines = [`Matches: ${matches.length}`];
  matches.forEach((match, index) => {
    lines.push('', `#${index + 1}`, `match text: ${match.text}`, `start index: ${match.index}`, `end index: ${match.endIndex}`);
    if (match.groups.length > 0) match.groups.forEach((group, groupIndex) => lines.push(`group ${groupIndex + 1}: ${group === undefined ? '' : group}`));
    Object.entries(match.namedGroups).forEach(([name, value]) => lines.push(`named group ${name}: ${value === undefined ? '' : value}`));
  });
  if (replaceInput.value) lines.push('', 'replace preview:', replaceOutput.textContent);
  return lines.join('\n');
}

function renderResults(matches) {
  lastMatches = matches;
  matchCount.textContent = `Matches: ${matches.length}`;
  if (matches.length === 0) {
    resultList.innerHTML = '<div class="empty-state">No matches found.</div>';
    return;
  }
  resultList.innerHTML = matches.map((match, index) => {
    const groupsMarkup = match.groups.length > 0
      ? `<ul class="group-list">${match.groups.map((group, groupIndex) => `<li>Group ${groupIndex + 1}: <span class="code-inline">${escapeHtml(group === undefined ? '' : group)}</span></li>`).join('')}</ul>`
      : '<div class="result-meta">Matched group: none</div>';
    const namedEntries = Object.entries(match.namedGroups);
    const namedGroupMarkup = namedEntries.length > 0
      ? `<div class="named-group-box"><strong class="group-title">Named groups</strong>${namedEntries.map(([name, value]) => `<div>${escapeHtml(name)}: <span class="code-inline">${escapeHtml(value === undefined ? '' : value)}</span></div>`).join('')}</div>`
      : '';
    const searchIndex = [match.text, ...match.groups, ...Object.values(match.namedGroups)].join(' ').toLowerCase();
    return `
      <article class="result-item" data-match-index="${index}" data-search-index="${escapeHtml(searchIndex)}" tabindex="0" role="listitem" aria-label="Match ${index + 1}">
        <strong>#${index + 1} <span class="code-inline">${escapeHtml(match.text)}</span></strong>
        <div class="result-meta">start index: ${match.index} | end index: ${match.endIndex}</div>
        <div class="result-details">
          ${groupsMarkup}
          ${namedGroupMarkup}
        </div>
      </article>
    `;
  }).join('');
  applyResultFilter();
}

function applyResultFilter() {
  const query = resultFilter.value.trim().toLowerCase();
  const items = resultList.querySelectorAll('.result-item');
  if (items.length === 0) return;
  let visibleCount = 0;
  items.forEach((item) => {
    const haystack = item.dataset.searchIndex || '';
    const show = !query || haystack.includes(query);
    item.hidden = !show;
    if (show) visibleCount += 1;
  });
  if (query) {
    matchCount.textContent = `Matches: ${visibleCount} filtered / ${lastMatches.length} total`;
  } else {
    matchCount.textContent = `Matches: ${lastMatches.length}`;
  }
}

function focusMatch(index) {
  const match = lastMatches[index];
  if (!match) return;
  testText.focus();
  testText.setSelectionRange(match.index, match.endIndex);
  const beforeSelection = testText.value.slice(0, match.index);
  const lineIndex = beforeSelection.split('\n').length - 1;
  const lineHeight = parseFloat(getComputedStyle(testText).lineHeight) || 25;
  testText.scrollTop = Math.max(0, lineIndex * lineHeight - lineHeight * 2);
  syncLineNumberScroll();
  resultList.querySelectorAll('.result-item').forEach((item) => item.classList.remove('is-active'));
  const activeItem = resultList.querySelector(`[data-match-index="${index}"]`);
  if (activeItem) {
    activeItem.classList.add('is-active');
    activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function toggleMatchDetails(item) {
  item.classList.toggle('is-open');
  item.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
}

function runRegexTest() {
  const pattern = regexInput.value;
  const text = testText.value;
  updateLineNumbers();
  syncLineNumberScroll();
  validateRegexPattern();
  if (!pattern && !text) {
    setStatus('Ready.', '');
    renderEmptyState('No matches yet.');
    return;
  }
  if (!pattern) {
    setStatus('Enter a regex pattern to start testing.', '');
    renderEmptyState('Enter a regex pattern to start testing.');
    return;
  }
  try {
    const regex = buildRegex();
    const matches = findMatches(cloneRegex(regex), text);
    renderHighlight(text, matches);
    renderReplacePreview(text, regex);
    renderResults(matches);
    setStatus('Regex compiled successfully. Use filter, keyboard nav, or result cards to inspect matches.', 'success');
  } catch (error) {
    matchCount.textContent = 'Matches: 0';
    highlightOutput.innerHTML = '<span class="placeholder">Regex error. Please fix the pattern and try again.</span>';
    originalOutput.textContent = testText.value || 'Original text will appear here.';
    replaceOutput.textContent = 'Replacement preview unavailable because the regex pattern is invalid.';
    resultList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    lastMatches = [];
    setStatus(`Regex error: ${error.message}`, 'error');
  }
}

function clearAll() {
  regexInput.value = '';
  replaceInput.value = '';
  testText.value = '';
  resultFilter.value = '';
  flagG.checked = false;
  flagI.checked = false;
  flagM.checked = false;
  updateLineNumbers();
  validateRegexPattern();
  setStatus('Cleared.', '');
  renderEmptyState('No matches yet.');
}

async function copyResults() {
  if (!regexInput.value) {
    setStatus('Nothing to copy yet. Add a regex pattern first.', '');
    return;
  }
  try {
    const regex = buildRegex();
    const matches = findMatches(cloneRegex(regex), testText.value);
    renderReplacePreview(testText.value, regex);
    const resultText = buildResultText(matches);
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard API is not available in this browser.');
    await navigator.clipboard.writeText(resultText);
    setStatus('Result copied to clipboard.', 'success');
  } catch (error) {
    setStatus(`Copy failed: ${error.message}`, 'error');
  }
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportResults() {
  if (!regexInput.value) {
    setStatus('Nothing to export yet. Add a regex pattern first.', '');
    return;
  }
  try {
    const regex = buildRegex();
    const matches = findMatches(cloneRegex(regex), testText.value);
    renderReplacePreview(testText.value, regex);
    downloadTextFile('result.txt', buildResultText(matches));
    setStatus('Exported result.txt.', 'success');
  } catch (error) {
    setStatus(`Export failed: ${error.message}`, 'error');
  }
}

function exportReplaceAll() {
  if (!regexInput.value) {
    setStatus('Add a regex pattern before exporting replaced text.', '');
    return;
  }
  try {
    const regex = buildRegex();
    if (!replaceInput.value) {
      setStatus('Enter replacement text before exporting replaced output.', '');
      return;
    }
    downloadTextFile('replace_result.txt', getReplacePreviewText(testText.value, regex));
    setStatus('Exported replace_result.txt.', 'success');
  } catch (error) {
    setStatus(`Replace export failed: ${error.message}`, 'error');
  }
}

function loadExample() {
  const example = exampleDataList[exampleIndex];
  regexInput.value = example.pattern;
  replaceInput.value = example.replace;
  flagG.checked = example.flags.g;
  flagI.checked = example.flags.i;
  flagM.checked = example.flags.m;
  testText.value = example.text;
  exampleIndex = (exampleIndex + 1) % exampleDataList.length;
  updateLineNumbers();
  setStatus(`Loaded generic example: ${example.label}.`, 'success');
  runRegexTest();
}

function applyTemplate(preset) {
  regexInput.value = preset.pattern;
  replaceInput.value = preset.replace;
  flagG.checked = preset.flags.g;
  flagI.checked = preset.flags.i;
  flagM.checked = preset.flags.m;
  setStatus(`Applied template: ${preset.label}.`, 'success');
  runRegexTest();
}

function renderTemplates() {
  templateActions.innerHTML = templatePresets.map((preset, index) => `<button type="button" class="template-chip" data-template-index="${index}">${escapeHtml(preset.label)}</button>`).join('');
}

function renderDatasets() {
  datasetSelect.innerHTML = datasets.map((dataset, index) => `<option value="${index}">${escapeHtml(dataset.label)}</option>`).join('');
}

function loadDataset() {
  const dataset = datasets[Number(datasetSelect.value)] || datasets[0];
  testText.value = dataset.text;
  updateLineNumbers();
  setStatus(`Loaded dataset: ${dataset.label}.`, 'success');
  runRegexTest();
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('theme-dark', currentTheme === 'dark');
  themeToggle.textContent = currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
}

[regexInput, replaceInput, testText, flagG, flagI, flagM].forEach((element) => {
  element.addEventListener('input', runRegexTest);
  element.addEventListener('change', runRegexTest);
});

resultFilter.addEventListener('input', applyResultFilter);
document.addEventListener('keydown', (event) => {
  const isMetaRun = (event.ctrlKey || event.metaKey) && event.key === 'Enter';
  const isMetaClear = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l';
  const isMetaCopy = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c';
  if (isMetaRun) {
    event.preventDefault();
    loadExample();
  } else if (isMetaClear) {
    event.preventDefault();
    clearAll();
  } else if (isMetaCopy) {
    event.preventDefault();
    copyResults();
  }
});

testText.addEventListener('scroll', syncLineNumberScroll);
resultList.addEventListener('click', (event) => {
  const item = event.target.closest('.result-item');
  if (!item) return;
  const matchIndex = Number(item.dataset.matchIndex);
  focusMatch(matchIndex);
  toggleMatchDetails(item);
});
resultList.addEventListener('keydown', (event) => {
  const items = Array.from(resultList.querySelectorAll('.result-item:not([hidden])'));
  const currentIndex = items.indexOf(document.activeElement);
  if (event.key === 'ArrowDown' && currentIndex >= 0) {
    event.preventDefault();
    (items[currentIndex + 1] || items[currentIndex]).focus();
    return;
  }
  if (event.key === 'ArrowUp' && currentIndex >= 0) {
    event.preventDefault();
    (items[currentIndex - 1] || items[currentIndex]).focus();
    return;
  }
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const item = event.target.closest('.result-item');
  if (!item) return;
  event.preventDefault();
  const matchIndex = Number(item.dataset.matchIndex);
  focusMatch(matchIndex);
  toggleMatchDetails(item);
});
templateActions.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-template-index]');
  if (!chip) return;
  applyTemplate(templatePresets[Number(chip.dataset.templateIndex)]);
});
loadDatasetBtn.addEventListener('click', loadDataset);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyResults);
exportBtn.addEventListener('click', exportResults);
exportReplaceBtn.addEventListener('click', exportReplaceAll);
exampleBtn.addEventListener('click', loadExample);
themeToggle.addEventListener('click', toggleTheme);

renderTemplates();
renderDatasets();
updateLineNumbers();
validateRegexPattern();
renderEmptyState('No matches yet.');
