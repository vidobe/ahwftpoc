import { decorateIcons } from '../../scripts/aem.js';

/**
 * Left navigation block.
 * Builds a collapsible chapter rail from the site's query-index
 * (`/content/query-index.json` by default). Each page contributes a row; the
 * rail is grouped by the page's "Nav Group" metadata, labelled by "Nav Title",
 * and ordered by "Nav Position". Because it reads page metadata, authors manage
 * the nav simply by editing each page's metadata — no separate nav document.
 */

// Index feeding the nav. Override with the `nav-index` metadata if needed.
const DEFAULT_INDEX_PATH = '/content/query-index.json';

// Column-name candidates, so the block tolerates however the query-index
// columns end up named in the tools.aem.live config (spaces/case/hyphens).
const GROUP_KEYS = ['navGroup', 'nav-group', 'navgroup', 'nav_group', 'Nav Group'];
const TITLE_KEYS = ['navTitle', 'nav-title', 'navtitle', 'nav_title', 'Nav Title'];
const POSITION_KEYS = ['navPosition', 'nav-position', 'navposition', 'nav_position', 'Nav Position', 'order'];

function firstValue(row, keys) {
  for (let i = 0; i < keys.length; i += 1) {
    const v = row[keys[i]];
    if (v !== undefined && v !== null && `${v}`.trim() !== '') return `${v}`.trim();
  }
  return '';
}

/**
 * Fetch every row from the query-index, following pagination.
 * @param {string} indexPath
 * @returns {Promise<Array<object>>}
 */
async function fetchIndexRows(indexPath) {
  const rows = [];
  let offset = 0;
  const limit = 500;
  // Guard against runaway loops; a doc site won't exceed a few thousand pages.
  for (let page = 0; page < 40; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${indexPath}?limit=${limit}&offset=${offset}`);
    if (!resp.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const json = await resp.json();
    const data = json.data || [];
    rows.push(...data);
    const total = typeof json.total === 'number' ? json.total : rows.length;
    offset += data.length;
    if (data.length === 0 || offset >= total) break;
  }
  return rows;
}

/**
 * Turn index rows into an ordered list of groups.
 * Rows without a Nav Title are skipped (not meant for the nav).
 * @param {Array<object>} rows
 * @returns {Array<{group:string, items:Array<{title:string, path:string, position:number}>}>}
 */
function buildGroups(rows) {
  const groupsMap = new Map();
  const groupMinPosition = new Map();

  rows.forEach((row) => {
    const title = firstValue(row, TITLE_KEYS);
    if (!title) return; // page opts out of the nav by having no Nav Title
    const path = row.path || row.url || '';
    if (!path) return;
    const group = firstValue(row, GROUP_KEYS); // '' => ungrouped
    const positionRaw = firstValue(row, POSITION_KEYS);
    const position = positionRaw === '' ? Number.MAX_SAFE_INTEGER : Number(positionRaw);
    const safePosition = Number.isNaN(position) ? Number.MAX_SAFE_INTEGER : position;

    if (!groupsMap.has(group)) groupsMap.set(group, []);
    groupsMap.get(group).push({ title, path, position: safePosition });

    // A group's order is driven by the smallest Nav Position among its members.
    const currentMin = groupMinPosition.has(group)
      ? groupMinPosition.get(group)
      : Number.MAX_SAFE_INTEGER;
    if (safePosition < currentMin) groupMinPosition.set(group, safePosition);
  });

  // Sort items within each group by position, then title as a tiebreaker.
  const groups = [...groupsMap.entries()].map(([group, items]) => {
    items.sort((a, b) => (a.position - b.position) || a.title.localeCompare(b.title));
    return { group, items };
  });

  // Sort groups: ungrouped first, then by their min position, then name.
  groups.sort((a, b) => {
    if (a.group === '' && b.group !== '') return -1;
    if (b.group === '' && a.group !== '') return 1;
    const pa = groupMinPosition.get(a.group) ?? Number.MAX_SAFE_INTEGER;
    const pb = groupMinPosition.get(b.group) ?? Number.MAX_SAFE_INTEGER;
    return (pa - pb) || a.group.localeCompare(b.group);
  });

  return groups;
}

function linkList(items) {
  const ul = document.createElement('ul');
  items.forEach(({ title, path }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = path;
    a.textContent = title;
    li.append(a);
    ul.append(li);
  });
  return ul;
}

/**
 * Render the grouped nav into the block, matching the DOM the collapsible
 * behaviour and CSS expect (TOPICS heading, .nav-heading with <p> + <ul>).
 * @param {Element} block
 * @param {Array} groups
 */
function render(block, groups) {
  const root = document.createElement('div');

  const topics = document.createElement('h4');
  topics.id = 'topics';
  topics.textContent = 'TOPICS';
  root.append(topics);

  // "Expand all sections" toggle
  const toggle = document.createElement('label');
  toggle.className = 'nav-expand-toggle';
  toggle.innerHTML = `
    <input type="checkbox" class="nav-expand-checkbox" />
    <span class="nav-expand-switch" aria-hidden="true"></span>
    <span class="nav-expand-label">Expand all sections</span>`;
  root.append(toggle);

  // Ungrouped pages render as a flat list directly under TOPICS.
  const ungrouped = groups.find((g) => g.group === '');
  if (ungrouped) {
    root.append(linkList(ungrouped.items));
  }

  const grouped = groups.filter((g) => g.group !== '');
  if (grouped.length) {
    const navHeading = document.createElement('div');
    navHeading.className = 'nav-heading';
    const inner = document.createElement('div');
    const innerInner = document.createElement('div');

    grouped.forEach(({ group, items }) => {
      // Group header — the CSS renders a chevron on the right via ::after.
      const p = document.createElement('p');
      p.className = 'nav-group-header';
      p.setAttribute('aria-expanded', 'false');
      p.textContent = group;
      innerInner.append(p);
      innerInner.append(linkList(items));
    });

    inner.append(innerInner);
    navHeading.append(inner);
    root.append(navHeading);
  }

  block.replaceChildren(root);
}

function setExpanded(header, expanded) {
  header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const list = header.nextElementSibling;
  if (list && list.tagName === 'UL') {
    list.style.display = expanded ? 'block' : 'none';
  }
}

// Keep the toggle in sync: checked only when every group is expanded.
function syncExpandToggle() {
  const checkbox = document.querySelector('.left-navigation .nav-expand-checkbox');
  if (!checkbox) return;
  const headers = [...document.querySelectorAll('.left-navigation .nav-group-header')];
  checkbox.checked = headers.length > 0
    && headers.every((h) => h.getAttribute('aria-expanded') === 'true');
}

function loadDropdowns() {
  const headers = document.querySelectorAll('.left-navigation .nav-group-header');
  headers.forEach((header) => {
    setExpanded(header, false); // collapsed by default
    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      setExpanded(header, !expanded);
      syncExpandToggle();
    });
  });

  // "Expand all sections" toggle
  const checkbox = document.querySelector('.left-navigation .nav-expand-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      document.querySelectorAll('.left-navigation .nav-group-header')
        .forEach((h) => setExpanded(h, checkbox.checked));
    });
  }
}

function loadActiveLinks() {
  const path = window.location.pathname;
  // Find the matching link and add the 'active' class
  const links = document.querySelectorAll(`a[href='${path}']`);
  links.forEach((link) => {
    link.classList.add('active');
  });

  // Expand the group containing the active link and scroll it into view.
  const activeContainer = document.querySelector('.active')?.closest('ul');
  if (activeContainer) {
    const header = activeContainer.previousElementSibling;
    if (header && header.classList.contains('nav-group-header')) {
      setExpanded(header, true);
      syncExpandToggle();
    }
    activeContainer.style.display = 'block';
    setTimeout(() => {
      activeContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}

export default async function decorate(block) {
  const indexPath = DEFAULT_INDEX_PATH;
  try {
    const rows = await fetchIndexRows(indexPath);
    const groups = buildGroups(rows);
    render(block, groups);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('left-navigation: failed to build from query-index', e);
  }
  decorateIcons(block);
  loadDropdowns();
  loadActiveLinks();
}
