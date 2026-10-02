import { detectTarget } from './releases.js?v=tiles-1';

/* The download page's commands. Without script both lines show, labelled;
   with it they become tabs, opened at the visitor's own system, and every
   command gets a working Copy button. */

function copyText(button) {
  const box = button.closest('.cmd__line, .codebox');
  const code = box && box.querySelector('code');
  return code ? code.textContent.trim() : '';
}

async function copy(button) {
  const text = copyText(button);
  const label = button.querySelector('span');
  try {
    await navigator.clipboard.writeText(text);
    button.classList.add('is-copied');
    if (label) label.textContent = 'Copied';
  } catch {
    // No clipboard here: select the command so it can be copied by hand.
    const code = button.closest('.cmd__line, .codebox')?.querySelector('code');
    if (code) getSelection()?.selectAllChildren(code);
    if (label) label.textContent = 'Select';
  }
  clearTimeout(button._reset);
  button._reset = setTimeout(() => { button.classList.remove('is-copied'); if (label) label.textContent = 'Copy'; }, 1800);
}

export function mountInstall(root = document) {
  for (const button of root.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', () => copy(button));
  }
  const cmd = root.querySelector('[data-cmd]');
  if (!cmd) return;
  const tabs = [...cmd.querySelectorAll('[data-cmd-tab]')];
  const panels = [...cmd.querySelectorAll('[data-cmd-panel]')];
  const show = (which) => {
    for (const t of tabs) t.setAttribute('aria-selected', String(t.dataset.cmdTab === which));
    for (const p of panels) p.hidden = p.dataset.cmdPanel !== which;
  };
  cmd.querySelector('[data-cmd-tabs]').hidden = false;
  cmd.classList.add('is-tabbed');
  for (const t of tabs) t.addEventListener('click', () => show(t.dataset.cmdTab));
  show(detectTarget() === 'windows-x86_64' ? 'windows' : 'unix');
}
