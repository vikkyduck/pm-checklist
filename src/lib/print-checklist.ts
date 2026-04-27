/**
 * Печать чек-листа в PDF через нативное окно печати браузера.
 *
 * Зачем не jsPDF: для кириллицы нужен встроенный TTF-шрифт (~300 KB+),
 * а нативный print() уже умеет всё — типографику, переносы, цвета.
 * Юзер жмёт «Скачать» → открывается окно печати → «Сохранить как PDF».
 */

export type PrintItem = {
  title: string;
  detail?: string;
};

export type PrintGroup = {
  /** Подзаголовок: например, "0.1. Быстрый сбор фактуры" */
  title: string;
  intro?: string;
  items: PrintItem[];
};

export type PrintSection = {
  /** Номер/индекс этапа: "01", "02"… или "Этап 0" */
  number?: string;
  /** Заголовок секции/этапа */
  title: string;
  subtitle?: string;
  intro?: string;
  /** Цвет акцента — любой CSS-цвет (hex, oklch, rgb) */
  accentColor?: string;
  groups: PrintGroup[];
};

export type PrintChecklist = {
  /** Главный заголовок документа */
  title: string;
  /** Подзаголовок */
  subtitle?: string;
  /** Краткое описание */
  description?: string;
  /** Опциональные подсказки по применению */
  usage?: string[];
  sections: PrintSection[];
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function renderItem(item: PrintItem): string {
  return `
    <li class="item">
      <span class="checkbox" aria-hidden="true"></span>
      <div class="item-body">
        <p class="item-title">${escapeHtml(item.title)}</p>
        ${item.detail ? `<p class="item-detail">${escapeHtml(item.detail)}</p>` : ""}
      </div>
    </li>
  `;
}

function renderGroup(group: PrintGroup): string {
  return `
    <section class="group">
      <h3 class="group-title">${escapeHtml(group.title)}</h3>
      ${group.intro ? `<p class="group-intro">${escapeHtml(group.intro)}</p>` : ""}
      <ul class="items">
        ${group.items.map(renderItem).join("")}
      </ul>
    </section>
  `;
}

function renderSection(section: PrintSection, idx: number): string {
  const accent = section.accentColor ?? "#111827";
  const totalItems = section.groups.reduce((s, g) => s + g.items.length, 0);
  return `
    <section class="section${idx > 0 ? " section-break" : ""}" style="--accent: ${accent}">
      <header class="section-head">
        <div class="section-meta">
          ${section.number ? `<span class="section-number">${escapeHtml(section.number)}</span>` : ""}
          ${section.subtitle ? `<span class="section-subtitle">${escapeHtml(section.subtitle)}</span>` : ""}
          <span class="section-count">${totalItems} ${pluralize(totalItems)}</span>
        </div>
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        ${section.intro ? `<p class="section-intro">${escapeHtml(section.intro)}</p>` : ""}
      </header>
      ${section.groups.map(renderGroup).join("")}
    </section>
  `;
}

function pluralize(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "пункт";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "пункта";
  return "пунктов";
}

function buildHtml(data: PrintChecklist): string {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(data.title)}</title>
<style>
  @page {
    size: A4;
    margin: 14mm 14mm 16mm 14mm;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .doc { padding: 0; }

  /* Cover */
  .cover {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 14pt;
    margin-bottom: 18pt;
  }
  .eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 8pt;
    color: #6b7280;
    margin: 0 0 8pt 0;
  }
  .doc-title {
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 6pt 0;
    line-height: 1.1;
  }
  .doc-subtitle {
    font-size: 12pt;
    color: #4b5563;
    margin: 0 0 10pt 0;
    font-weight: 400;
  }
  .doc-description {
    font-size: 10pt;
    color: #374151;
    margin: 0;
    max-width: 560pt;
  }
  .doc-meta {
    display: flex;
    gap: 14pt;
    margin-top: 10pt;
    font-size: 8.5pt;
    color: #6b7280;
  }
  .usage {
    margin-top: 12pt;
    padding: 10pt 12pt;
    background: #f9fafb;
    border-left: 3px solid #111827;
    border-radius: 3pt;
  }
  .usage-title {
    font-size: 8.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #374151;
    margin: 0 0 5pt 0;
  }
  .usage ul { margin: 0; padding-left: 16pt; }
  .usage li { font-size: 9pt; color: #374151; margin-bottom: 2pt; }

  /* Section */
  .section { margin-bottom: 20pt; }
  .section-break { page-break-before: always; }
  .section-head {
    border-bottom: 2px solid var(--accent, #111827);
    padding-bottom: 8pt;
    margin-bottom: 12pt;
  }
  .section-meta {
    display: flex;
    align-items: center;
    gap: 8pt;
    margin-bottom: 4pt;
    font-size: 8.5pt;
    color: #6b7280;
  }
  .section-number {
    display: inline-block;
    background: var(--accent, #111827);
    color: #fff;
    font-weight: 700;
    padding: 2pt 7pt;
    border-radius: 3pt;
    font-size: 8.5pt;
    letter-spacing: 0.05em;
  }
  .section-subtitle { font-weight: 500; color: #374151; }
  .section-count {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
  }
  .section-title {
    font-size: 14pt;
    font-weight: 700;
    margin: 0 0 4pt 0;
    color: #111827;
  }
  .section-intro {
    font-size: 9.5pt;
    color: #4b5563;
    margin: 4pt 0 0 0;
  }

  /* Group */
  .group { margin-bottom: 12pt; page-break-inside: avoid; }
  .group-title {
    font-size: 10.5pt;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4pt 0;
  }
  .group-intro {
    font-size: 9pt;
    color: #6b7280;
    margin: 0 0 6pt 0;
    font-style: italic;
  }

  /* Items */
  .items {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .item {
    display: flex;
    align-items: flex-start;
    gap: 8pt;
    padding: 5pt 0;
    border-bottom: 1px dashed #e5e7eb;
    page-break-inside: avoid;
  }
  .item:last-child { border-bottom: none; }
  .checkbox {
    flex-shrink: 0;
    width: 12pt;
    height: 12pt;
    border: 1.2pt solid #374151;
    border-radius: 2pt;
    margin-top: 1.5pt;
    background: #fff;
  }
  .item-body { flex: 1; min-width: 0; }
  .item-title {
    font-size: 10pt;
    font-weight: 500;
    color: #111827;
    margin: 0;
    line-height: 1.35;
  }
  .item-detail {
    font-size: 9pt;
    color: #4b5563;
    margin: 3pt 0 0 0;
    line-height: 1.4;
  }

  /* Footer note */
  .footer-note {
    margin-top: 24pt;
    padding-top: 10pt;
    border-top: 1px solid #e5e7eb;
    font-size: 8pt;
    color: #9ca3af;
    text-align: center;
  }

  @media print {
    .no-print { display: none !important; }
  }

  /* Floating print button (only on screen) */
  .print-bar {
    position: fixed;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }
  .print-bar button {
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid #111827;
    background: #111827;
    color: #fff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }
  .print-bar button.secondary {
    background: #fff;
    color: #111827;
  }
</style>
</head>
<body>
  <div class="print-bar no-print">
    <button onclick="window.print()">📄 Сохранить PDF</button>
    <button class="secondary" onclick="window.close()">Закрыть</button>
  </div>
  <div class="doc">
    <header class="cover">
      <p class="eyebrow">Чек-лист · ${escapeHtml(today)}</p>
      <h1 class="doc-title">${escapeHtml(data.title)}</h1>
      ${data.subtitle ? `<p class="doc-subtitle">${escapeHtml(data.subtitle)}</p>` : ""}
      ${data.description ? `<p class="doc-description">${escapeHtml(data.description)}</p>` : ""}
      <div class="doc-meta">
        <span>${data.sections.length} ${pluralizeSections(data.sections.length)}</span>
        <span>${totalItemsCount(data)} пунктов всего</span>
      </div>
      ${
        data.usage && data.usage.length
          ? `<div class="usage">
              <p class="usage-title">Как пользоваться</p>
              <ul>${data.usage.map((u) => `<li>${escapeHtml(u)}</li>`).join("")}</ul>
            </div>`
          : ""
      }
    </header>
    ${data.sections.map((s, i) => renderSection(s, i)).join("")}
    <p class="footer-note">Practice · pm-resourse.site · ${escapeHtml(today)}</p>
  </div>
  <script>
    // Автоматически открываем диалог печати при загрузке
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 350);
    });
  </script>
</body>
</html>`;
}

function pluralizeSections(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "раздел";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "раздела";
  return "разделов";
}

function totalItemsCount(data: PrintChecklist): number {
  return data.sections.reduce(
    (s, sec) => s + sec.groups.reduce((gs, g) => gs + g.items.length, 0),
    0,
  );
}

/**
 * Открывает новое окно с печатной версией чек-листа и вызывает window.print().
 * Пользователь сохраняет PDF через нативный диалог браузера.
 */
export function printChecklist(data: PrintChecklist) {
  const html = buildHtml(data);
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) {
    alert(
      "Не удалось открыть окно печати. Разрешите всплывающие окна для этого сайта.",
    );
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
