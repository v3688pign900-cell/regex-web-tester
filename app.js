const $ = (id) => document.getElementById(id);
const regexInput = $('regex-input');
const replaceInput = $('replace-input');
const testText = $('test-text');
const lineNumbers = $('line-numbers');
const flagG = $('flag-g');
const flagI = $('flag-i');
const flagM = $('flag-m');
const statusMessage = $('status-message');
const matchCount = $('match-count');
const replaceCount = $('replace-count');
const highlightOutput = $('highlight-output');
const originalOutput = $('original-output');
const replaceOutput = $('replace-output');
const resultList = $('result-list');
const regexValidator = $('regex-validator');
const regexPerformance = $('regex-performance');
const resultFilter = $('result-filter');
const resultSort = $('result-sort');
const resultGroup = $('result-group');
const templateActions = $('template-actions');
const datasetSelect = $('dataset-select');
const statVisible = $('stat-visible');
const statZero = $('stat-zero');
const statUnique = $('stat-unique');
const statAvg = $('stat-avg');

const controls = {
  clear: $('clear-btn'), copy: $('copy-btn'), copyHighlighted: $('copy-highlighted-btn'), copyReplaced: $('copy-replaced-btn'),
  exportTxt: $('export-btn'), exportReplace: $('export-replace-btn'), exportJson: $('export-json-btn'), example: $('example-btn'),
  theme: $('theme-toggle'), loadDataset: $('load-dataset-btn'), undoDataset: $('undo-dataset-btn')
};

const templatePresets = [
  { label: 'Status', pattern: 'ERROR|WARN|FAIL', flags: { g: true, i: false, m: false }, replace: '[ALERT]' },
  { label: 'IP', pattern: '\\b\\d{1,3}(\\.\\d{1,3}){3}\\b', flags: { g: true, i: false, m: false }, replace: '[IP]' },
  { label: 'Email', pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', flags: { g: true, i: true, m: false }, replace: '[EMAIL]' },
  { label: 'Date', pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', flags: { g: true, i: false, m: false }, replace: '$<day>/$<month>/$<year>' }
];
const datasets = [
  { label: 'System Messages', text: ['INFO Startup complete', 'WARN Disk usage is above 80%', 'ERROR Unable to open file', 'FAIL Retry limit reached', 'INFO Shutdown complete'].join('\n') },
  { label: 'Contacts', text: ['Alice <alice@example.com>', 'Bob <bob.sales@test-mail.org>', 'Carol <carol_ops@sample.net>'].join('\n') },
  { label: 'Network Notes', text: ['Primary server: 192.168.10.25', 'Fallback server: 10.0.0.8', 'Docs: https://example.com/docs/start'].join('\n') }
];
const examples = [
  { label: 'Status words', pattern: 'ERROR|WARN|FAIL', flags: { g: true, i: false, m: false }, replace: '[ALERT]', text: datasets[0].text },
  { label: 'IP address', pattern: '\\b\\d{1,3}(\\.\\d{1,3}){3}\\b', flags: { g: true, i: false, m: false }, replace: '[IP]', text: datasets[2].text },
  { label: 'Email address', pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', flags: { g: true, i: true, m: false }, replace: '[EMAIL]', text: datasets[1].text },
  { label: 'Date', pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', flags: { g: true, i: false, m: false }, replace: '$<day>/$<month>/$<year>', text: ['Release date: 2026-04-30', 'Review date: 2026-05-12'].join('\n') }
];

let exampleIndex = 0;
let lastMatches = [];
let lastReplacePreviewText = '';
let previousDatasetText = '';
let theme = 'light';

const escapeHtml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const getFlags = () => [flagG.checked && 'g', flagI.checked && 'i', flagM.checked && 'm'].filter(Boolean).join('');
const setStatus = (message, type='') => { statusMessage.textContent = message; statusMessage.className = `status${type ? ` ${type}` : ''}`; };
const setValidator = (el, message, type='') => { el.textContent = message; el.className = `validator${type ? ` ${type}` : ''}`; };
const updateLineNumbers = () => { lineNumbers.textContent = Array.from({ length: Math.max(1, testText.value.split('\n').length) }, (_, i) => i + 1).join('\n'); };
const syncLineNumberScroll = () => { lineNumbers.scrollTop = testText.scrollTop; };
const buildRegex = () => regexInput.value ? new RegExp(regexInput.value, getFlags()) : null;
const cloneRegex = (regex) => new RegExp(regex.source, regex.flags);

function validateRegexPattern() {
  const pattern = regexInput.value;
  if (!pattern) return setValidator(regexValidator, 'Validator: waiting for input.');
  if (pattern.startsWith('/') && pattern.endsWith('/')) return setValidator(regexValidator, 'Validator: remove outer slash delimiters like /pattern/.', 'warn');
  try { buildRegex(); setValidator(regexValidator, 'Validator: pattern syntax looks valid.', 'ok'); }
  catch (error) { setValidator(regexValidator, `Validator: ${error.message}`, 'error'); }
}

function updatePerformanceWarning() {
  const pattern = regexInput.value;
  if (!pattern) return setValidator(regexPerformance, 'Performance: no warning.');
  const suspicious = /(\.\*){2,}|(\+\))\+|(\([^)]*[+*][^)]*\)[+*])/.test(pattern);
  if (suspicious || testText.value.length > 20000) return setValidator(regexPerformance, 'Performance: pattern or input may be expensive on very large text.', 'warn');
  return setValidator(regexPerformance, 'Performance: no obvious issue detected.', 'ok');
}

function findMatches(regex, text) {
  const matches = [];
  if (regex.global) {
    regex.lastIndex = 0;
    let found;
    while ((found = regex.exec(text)) !== null) {
      matches.push({ text: found[0], index: found.index, endIndex: found.index + found[0].length, groups: found.slice(1), namedGroups: found.groups || {}, zeroLength: found[0].length === 0 });
      if (found[0] === '') regex.lastIndex += 1;
    }
  } else {
    const found = regex.exec(text);
    if (found) matches.push({ text: found[0], index: found.index, endIndex: found.index + found[0].length, groups: found.slice(1), namedGroups: found.groups || {}, zeroLength: found[0].length === 0 });
  }
  return matches;
}

function renderHighlight(text, matches) {
  if (!text) return (highlightOutput.innerHTML = '<span class="placeholder">Paste text to see highlighted matches.</span>');
  if (matches.length === 0) return (highlightOutput.textContent = text);
  let cursor = 0;
  const html = matches.map((match) => {
    const before = escapeHtml(text.slice(cursor, match.index));
    const label = escapeHtml(match.zeroLength ? '∅' : text.slice(match.index, match.endIndex) || '∅');
    cursor = match.endIndex;
    return `${before}<mark class="match-chip">${label}</mark>`;
  }).join('') + escapeHtml(text.slice(cursor));
  highlightOutput.innerHTML = html;
}

function getReplacePreviewText(text, regex) {
  if (!text) return 'Replacement preview will appear here.';
  if (!replaceInput.value) return 'Enter a replacement string to preview the replaced result.';
  const safeRegex = regex.global ? cloneRegex(regex) : new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  return text.replace(safeRegex, replaceInput.value);
}

function renderReplacePreview(text, regex, matches) {
  originalOutput.textContent = text || 'Original text will appear here.';
  lastReplacePreviewText = getReplacePreviewText(text, regex);
  replaceOutput.textContent = lastReplacePreviewText;
  replaceCount.textContent = `Replace count: ${matches.length}`;
}

function updateStats(matches, visibleCount) {
  const unique = new Set(matches.map((m) => m.text)).size;
  const avg = matches.length ? (matches.reduce((sum, m) => sum + m.text.length, 0) / matches.length).toFixed(1) : '0';
  statVisible.textContent = String(visibleCount ?? matches.length);
  statZero.textContent = String(matches.filter((m) => m.zeroLength).length);
  statUnique.textContent = String(unique);
  statAvg.textContent = String(avg);
}

function buildResultText(matches) {
  const summary = { matchCount: matches.length, replaceCount: matches.length, zeroLengthCount: matches.filter((m) => m.zeroLength).length };
  const lines = [`Matches: ${summary.matchCount}`, `Replace count: ${summary.replaceCount}`, `Zero-length count: ${summary.zeroLengthCount}`];
  matches.forEach((m, i) => {
    lines.push('', `#${i + 1}`, `match text: ${m.text}`, `start index: ${m.index}`, `end index: ${m.endIndex}`);
    if (m.zeroLength) lines.push('zero length: true');
    m.groups.forEach((g, gi) => lines.push(`group ${gi + 1}: ${g ?? ''}`));
    Object.entries(m.namedGroups).forEach(([k, v]) => lines.push(`named group ${k}: ${v ?? ''}`));
  });
  if (replaceInput.value) lines.push('', 'replace preview:', lastReplacePreviewText);
  return lines.join('\n');
}

function buildResultJson(matches) {
  return JSON.stringify({
    pattern: regexInput.value,
    flags: getFlags(),
    replacePreview: replaceInput.value,
    stats: {
      matchCount: matches.length,
      replaceCount: matches.length,
      zeroLengthCount: matches.filter((m) => m.zeroLength).length,
      uniqueValues: new Set(matches.map((m) => m.text)).size
    },
    matches
  }, null, 2);
}

function sortMatches(matches) {
  const list = [...matches];
  switch (resultSort.value) {
    case 'index-desc': list.sort((a, b) => b.index - a.index); break;
    case 'text-asc': list.sort((a, b) => a.text.localeCompare(b.text)); break;
    case 'text-desc': list.sort((a, b) => b.text.localeCompare(a.text)); break;
    case 'length-desc': list.sort((a, b) => b.text.length - a.text.length); break;
    default: list.sort((a, b) => a.index - b.index);
  }
  return list;
}

function groupMatches(matches) {
  if (resultGroup.value === 'none') return [{ label: '', items: matches }];
  const map = new Map();
  matches.forEach((m) => {
    const key = resultGroup.value === 'length' ? `Length ${m.text.length}` : `Starts with ${m.text.charAt(0) || '∅'}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(m);
  });
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function renderResults(matches) {
  lastMatches = matches;
  if (!matches.length) {
    matchCount.textContent = 'Matches: 0';
    updateStats(matches, 0);
    resultList.innerHTML = '<div class="empty-state">No matches found.</div>';
    return;
  }
  const grouped = groupMatches(sortMatches(matches));
  resultList.innerHTML = grouped.map((group) => `
    <section class="result-group">
      ${group.label ? `<div class="result-group-title">${escapeHtml(group.label)}</div>` : ''}
      ${group.items.map((m) => {
        const idx = matches.indexOf(m);
        const search = escapeHtml([m.text, ...m.groups, ...Object.values(m.namedGroups)].join(' ').toLowerCase());
        const named = Object.entries(m.namedGroups).map(([k, v]) => `<div>${escapeHtml(k)}: <span class="code-inline">${escapeHtml(v ?? '')}</span></div>`).join('');
        return `
          <article class="result-item" data-match-index="${idx}" data-search-index="${search}" tabindex="0" role="listitem" aria-expanded="false">
            <strong>#${idx + 1} <span class="code-inline">${escapeHtml(m.text || '∅')}</span></strong>
            <div class="result-meta">start index: ${m.index} | end index: ${m.endIndex}${m.zeroLength ? ' | zero-length match' : ''}</div>
            ${m.zeroLength ? '<span class="zero-length-badge">Zero-length</span>' : ''}
            <div class="result-details">
              ${m.groups.length ? `<ul>${m.groups.map((g, gi) => `<li>Group ${gi + 1}: <span class="code-inline">${escapeHtml(g ?? '')}</span></li>`).join('')}</ul>` : '<div class="result-meta">Matched group: none</div>'}
              ${named ? `<div class="result-meta">Named groups</div><div>${named}</div>` : ''}
            </div>
          </article>`;
      }).join('')}
    </section>`).join('');
  applyResultFilter();
}

function applyResultFilter() {
  const query = resultFilter.value.trim().toLowerCase();
  const items = [...resultList.querySelectorAll('.result-item')];
  let visible = 0;
  items.forEach((item) => {
    const show = !query || (item.dataset.searchIndex || '').includes(query);
    item.hidden = !show;
    if (show) visible += 1;
  });
  [...resultList.querySelectorAll('.result-group')].forEach((group) => {
    group.hidden = ![...group.querySelectorAll('.result-item')].some((item) => !item.hidden);
  });
  matchCount.textContent = query ? `Matches: ${visible} filtered / ${lastMatches.length} total` : `Matches: ${lastMatches.length}`;
  updateStats(lastMatches, visible);
}

function runRegexTest() {
  updateLineNumbers();
  syncLineNumberScroll();
  validateRegexPattern();
  updatePerformanceWarning();
  if (!regexInput.value && !testText.value) {
    renderEmptyState('No matches yet.');
    setStatus('Ready.');
    return;
  }
  if (!regexInput.value) {
    renderEmptyState('Enter a regex pattern to start testing.');
    setStatus('Enter a regex pattern to start testing.');
    return;
  }
  try {
    const regex = buildRegex();
    const matches = findMatches(cloneRegex(regex), testText.value);
    renderHighlight(testText.value, matches);
    renderReplacePreview(testText.value, regex, matches);
    renderResults(matches);
    setStatus('Regex compiled successfully. Sort, group, filter, or export results as needed.', 'success');
  } catch (error) {
    renderEmptyState(error.message);
    replaceOutput.textContent = 'Replacement preview unavailable because the regex pattern is invalid.';
    setStatus(`Regex error: ${error.message}`, 'error');
  }
}

function clearAll() {
  regexInput.value = ''; replaceInput.value = ''; testText.value = ''; resultFilter.value = ''; resultSort.value = 'index-asc'; resultGroup.value = 'none';
  flagG.checked = false; flagI.checked = false; flagM.checked = false;
  updateLineNumbers(); validateRegexPattern(); updatePerformanceWarning(); renderEmptyState('No matches yet.'); setStatus('Cleared.');
}

async function copyText(text, okMessage) {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is not available in this browser.');
  await navigator.clipboard.writeText(text);
  setStatus(okMessage, 'success');
}

function downloadFile(name, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function loadExample() {
  const ex = examples[exampleIndex];
  regexInput.value = ex.pattern; replaceInput.value = ex.replace; flagG.checked = ex.flags.g; flagI.checked = ex.flags.i; flagM.checked = ex.flags.m; testText.value = ex.text;
  exampleIndex = (exampleIndex + 1) % examples.length;
  runRegexTest();
  setStatus(`Loaded generic example: ${ex.label}.`, 'success');
}

function applyTemplate(index) {
  const p = templatePresets[index];
  regexInput.value = p.pattern; replaceInput.value = p.replace; flagG.checked = p.flags.g; flagI.checked = p.flags.i; flagM.checked = p.flags.m;
  runRegexTest();
  setStatus(`Applied template: ${p.label}.`, 'success');
}

function loadDataset() {
  previousDatasetText = testText.value;
  testText.value = datasets[Number(datasetSelect.value)]?.text || datasets[0].text;
  runRegexTest();
  setStatus(`Loaded dataset: ${datasets[Number(datasetSelect.value)]?.label || datasets[0].label}.`, 'success');
}

function undoDatasetLoad() {
  testText.value = previousDatasetText;
  runRegexTest();
  setStatus('Restored previous text before sample load.', 'success');
}

function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('theme-dark', theme === 'dark');
  controls.theme.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
}

templateActions.innerHTML = templatePresets.map((p, i) => `<button type="button" class="template-chip" data-template-index="${i}">${escapeHtml(p.label)}</button>`).join('');
datasetSelect.innerHTML = datasets.map((d, i) => `<option value="${i}">${escapeHtml(d.label)}</option>`).join('');

[regexInput, replaceInput, testText, flagG, flagI, flagM, resultFilter, resultSort, resultGroup].forEach((el) => {
  el.addEventListener('input', runRegexTest);
  el.addEventListener('change', runRegexTest);
});

testText.addEventListener('scroll', syncLineNumberScroll);
templateActions.addEventListener('click', (e) => { const chip = e.target.closest('[data-template-index]'); if (chip) applyTemplate(Number(chip.dataset.templateIndex)); });
controls.loadDataset.addEventListener('click', loadDataset);
controls.undoDataset.addEventListener('click', undoDatasetLoad);
controls.example.addEventListener('click', loadExample);
controls.clear.addEventListener('click', clearAll);
controls.copy.addEventListener('click', async () => { try { await copyText(buildResultText(lastMatches), 'Result copied to clipboard.'); } catch (e) { setStatus(`Copy failed: ${e.message}`, 'error'); } });
controls.copyHighlighted.addEventListener('click', async () => { try { await copyText(highlightOutput.innerText.trim(), 'Highlighted text copied to clipboard.'); } catch (e) { setStatus(`Copy failed: ${e.message}`, 'error'); } });
controls.copyReplaced.addEventListener('click', async () => { try { await copyText(lastReplacePreviewText, 'Replaced text copied to clipboard.'); } catch (e) { setStatus(`Copy failed: ${e.message}`, 'error'); } });
controls.exportTxt.addEventListener('click', () => downloadFile('result.txt', buildResultText(lastMatches)));
controls.exportReplace.addEventListener('click', () => downloadFile('replace_result.txt', lastReplacePreviewText));
controls.exportJson.addEventListener('click', () => downloadFile('result.json', buildResultJson(lastMatches)));
controls.theme.addEventListener('click', toggleTheme);
resultList.addEventListener('click', (e) => {
  const item = e.target.closest('.result-item');
  if (!item) return;
  item.classList.toggle('is-open');
  item.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); loadExample(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); clearAll(); }
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); copyText(buildResultText(lastMatches), 'Result copied to clipboard.').catch((err) => setStatus(`Copy failed: ${err.message}`, 'error')); }
});

updateLineNumbers();
validateRegexPattern();
updatePerformanceWarning();
renderEmptyState('No matches yet.');
