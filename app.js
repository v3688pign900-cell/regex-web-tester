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
const replaceOutput = document.getElementById('replace-output');
const resultList = document.getElementById('result-list');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const exportBtn = document.getElementById('export-btn');
const exampleBtn = document.getElementById('example-btn');

const exampleDataList = [
  {
    label: 'Status words',
    pattern: 'ERROR|WARN|FAIL',
    flags: { g: true, i: false, m: false },
    replace: '[ALERT]',
    text: [
      'INFO Startup complete',
      'WARN Disk usage is above 80%',
      'ERROR Unable to open file',
      'FAIL Retry limit reached',
      'INFO Shutdown complete'
    ].join('\n')
  },
  {
    label: 'IP address',
    pattern: '\\b\\d{1,3}(\\.\\d{1,3}){3}\\b',
    flags: { g: true, i: false, m: false },
    replace: '[IP]',
    text: [
      'Primary server: 192.168.10.25',
      'Fallback server: 10.0.0.8',
      'Comment: localhost is not an IP match here.'
    ].join('\n')
  },
  {
    label: 'Email address',
    pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',
    flags: { g: true, i: true, m: false },
    replace: '[EMAIL]',
    text: [
      'Contact alpha.team@example.com for support.',
      'Backup contact: user_02@test-mail.org'
    ].join('\n')
  }
];

let exampleIndex = 0;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getFlags() {
  return [
    flagG.checked ? 'g' : '',
    flagI.checked ? 'i' : '',
    flagM.checked ? 'm' : ''
  ].join('');
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = 'status';
  if (type) {
    statusMessage.classList.add(type);
  }
}

function renderEmptyState(message) {
  matchCount.textContent = 'Matches: 0';
  highlightOutput.innerHTML = `<span class="placeholder">${escapeHtml(message)}</span>`;
  replaceOutput.textContent = 'Replacement preview will appear here.';
  resultList.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function updateLineNumbers() {
  const lineCount = Math.max(1, testText.value.split('\n').length);
  lineNumbers.textContent = Array.from({ length: lineCount }, (_, index) => index + 1).join('\n');
}

function syncLineNumberScroll() {
  lineNumbers.scrollTop = testText.scrollTop;
}

function buildRegex() {
  const pattern = regexInput.value;
  const flags = getFlags();

  if (!pattern) {
    return null;
  }

  return new RegExp(pattern, flags);
}

function cloneRegex(regex) {
  return new RegExp(regex.source, regex.flags);
}

function findMatches(regex, text) {
  const matches = [];

  if (regex.global) {
    regex.lastIndex = 0;
    let found;
    while ((found = regex.exec(text)) !== null) {
      matches.push({
        text: found[0],
        index: found.index,
        endIndex: found.index + found[0].length,
        groups: found.slice(1)
      });

      if (found[0] === '') {
        regex.lastIndex += 1;
      }
    }
  } else {
    const found = regex.exec(text);
    if (found) {
      matches.push({
        text: found[0],
        index: found.index,
        endIndex: found.index + found[0].length,
        groups: found.slice(1)
      });
    }
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

function renderReplacePreview(text, regex) {
  if (!text) {
    replaceOutput.textContent = 'Replacement preview will appear here.';
    return;
  }

  if (!replaceInput.value) {
    replaceOutput.textContent = 'Enter a replacement string to preview the replaced result.';
    return;
  }

  const safeRegex = regex.global ? cloneRegex(regex) : new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  replaceOutput.textContent = text.replace(safeRegex, replaceInput.value);
}

function buildResultText(matches) {
  if (matches.length === 0) {
    return 'Matches: 0';
  }

  const lines = [`Matches: ${matches.length}`];

  matches.forEach((match, index) => {
    lines.push('');
    lines.push(`#${index + 1}`);
    lines.push(`match text: ${match.text}`);
    lines.push(`start index: ${match.index}`);
    lines.push(`end index: ${match.endIndex}`);
    if (match.groups.length > 0) {
      match.groups.forEach((group, groupIndex) => {
        lines.push(`group ${groupIndex + 1}: ${group === undefined ? '' : group}`);
      });
    }
  });

  if (replaceInput.value) {
    lines.push('');
    lines.push('replace preview:');
    lines.push(replaceOutput.textContent);
  }

  return lines.join('\n');
}

function renderResults(matches) {
  matchCount.textContent = `Matches: ${matches.length}`;

  if (matches.length === 0) {
    resultList.innerHTML = '<div class="empty-state">No matches found.</div>';
    return;
  }

  resultList.innerHTML = matches
    .map((match, index) => {
      const groupsMarkup = match.groups.length > 0
        ? `<ul class="group-list">${match.groups
            .map((group, groupIndex) => `<li>Group ${groupIndex + 1}: <span class="code-inline">${escapeHtml(group === undefined ? '' : group)}</span></li>`)
            .join('')}</ul>`
        : '<div class="result-meta">Matched group: none</div>';

      return `
        <article class="result-item">
          <strong>#${index + 1} <span class="code-inline">${escapeHtml(match.text)}</span></strong>
          <div class="result-meta">start index: ${match.index} | end index: ${match.endIndex}</div>
          ${groupsMarkup}
        </article>
      `;
    })
    .join('');
}

function runRegexTest() {
  const pattern = regexInput.value;
  const text = testText.value;
  updateLineNumbers();
  syncLineNumberScroll();

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
    setStatus(`Regex compiled successfully with flags: ${getFlags() || '(none)'}.`, 'success');
  } catch (error) {
    matchCount.textContent = 'Matches: 0';
    highlightOutput.innerHTML = '<span class="placeholder">Regex error. Please fix the pattern and try again.</span>';
    replaceOutput.textContent = 'Replacement preview unavailable because the regex pattern is invalid.';
    resultList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    setStatus(`Regex error: ${error.message}`, 'error');
  }
}

function clearAll() {
  regexInput.value = '';
  replaceInput.value = '';
  testText.value = '';
  flagG.checked = false;
  flagI.checked = false;
  flagM.checked = false;
  updateLineNumbers();
  setStatus('Cleared.', '');
  renderEmptyState('No matches yet.');
}

async function copyResults() {
  const pattern = regexInput.value;
  if (!pattern) {
    setStatus('Nothing to copy yet. Add a regex pattern first.', '');
    return;
  }

  try {
    const regex = buildRegex();
    const matches = findMatches(cloneRegex(regex), testText.value);
    renderReplacePreview(testText.value, regex);
    const resultText = buildResultText(matches);
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard API is not available in this browser.');
    }
    await navigator.clipboard.writeText(resultText);
    setStatus('Result copied to clipboard.', 'success');
  } catch (error) {
    setStatus(`Copy failed: ${error.message}`, 'error');
  }
}

function exportResults() {
  const pattern = regexInput.value;
  if (!pattern) {
    setStatus('Nothing to export yet. Add a regex pattern first.', '');
    return;
  }

  try {
    const regex = buildRegex();
    const matches = findMatches(cloneRegex(regex), testText.value);
    renderReplacePreview(testText.value, regex);
    const resultText = buildResultText(matches);
    const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'result.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('Exported result.txt.', 'success');
  } catch (error) {
    setStatus(`Export failed: ${error.message}`, 'error');
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

[regexInput, replaceInput, testText, flagG, flagI, flagM].forEach((element) => {
  element.addEventListener('input', runRegexTest);
  element.addEventListener('change', runRegexTest);
});

testText.addEventListener('scroll', syncLineNumberScroll);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyResults);
exportBtn.addEventListener('click', exportResults);
exampleBtn.addEventListener('click', loadExample);

updateLineNumbers();
renderEmptyState('No matches yet.');
