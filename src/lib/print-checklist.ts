/**
 * Печать чек-листа в PDF через нативное окно печати браузера.
 *
 * Главное правило этого шаблона: ВЕСЬ контент должен умещаться РОВНО
 * в одну страницу A4, со всеми буллитами слово в слово.
 *
 * Как мы это делаем:
 *  - все секции выкладываются в 2–3 колонки (CSS columns) на одной странице
 *  - после загрузки JS-скрипт измеряет overflow и автоматически уменьшает
 *    шрифт + плотность пока контент не влезет в одну страницу
 *  - при печати запрещены page-breaks внутри блоков
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
  /** Опциональные подсказки по применению (не обязательны для 1-страничной версии) */
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
    <div class="group">
      <h3 class="group-title">${escapeHtml(group.title)}</h3>
      ${group.intro ? `<p class="group-intro">${escapeHtml(group.intro)}</p>` : ""}
      <ul class="items">
        ${group.items.map(renderItem).join("")}
      </ul>
    </div>
  `;
}

function renderSection(section: PrintSection): string {
  const accent = section.accentColor ?? "#111827";
  return `
    <section class="section" style="--accent: ${accent}">
      <header class="section-head">
        ${section.number ? `<span class="section-number">${escapeHtml(section.number)}</span>` : ""}
        <h2 class="section-title">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<span class="section-subtitle">${escapeHtml(section.subtitle)}</span>` : ""}
      </header>
      <div class="section-body">
        ${section.groups.map(renderGroup).join("")}
      </div>
    </section>
  `;
}

function buildHtml(data: PrintChecklist): string {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const totalSections = data.sections.length;
  const totalItems = data.sections.reduce(
    (s, sec) => s + sec.groups.reduce((gs, g) => gs + g.items.length, 0),
    0,
  );

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(data.title)}</title>
<style>
  /* Одна страница A4, узкие поля. Никаких переносов между страницами. */
  @page {
    size: A4;
    margin: 8mm 8mm 8mm 8mm;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.3;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* "Лист" — фиксированная высота A4 за вычетом полей.
     Внутри JS подбирает scale, пока контент не влезет
     и НЕ оставлял пустоты снизу — растягиваем шрифт вверх. */
  .sheet {
    width: 194mm;        /* A4 (210мм) минус 2×8мм поля */
    height: 281mm;       /* A4 (297мм) минус 2×8мм поля — фиксируем */
    padding: 0;
    transform-origin: top left;
    display: flex;
    flex-direction: column;
  }

  .doc {
    font-size: 8.5pt;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
  }
  .layout-area {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
  }
  .sections-grid {
    --cols: 2;
    --rows: 3;
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
    grid-template-rows: repeat(var(--rows), minmax(0, 1fr));
    gap: 6pt;
    align-items: stretch;
  }

  /* Шапка — компактная, в одну строку */
  .cover {
    border-bottom: 1.2pt solid #111827;
    padding-bottom: 4pt;
    margin-bottom: 6pt;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12pt;
  }
  .cover-left { min-width: 0; flex: 1; }
  .doc-title {
    font-size: 13pt;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0;
    line-height: 1.15;
    color: #111827;
  }
  .doc-subtitle {
    font-size: 8.5pt;
    color: #4b5563;
    margin: 2pt 0 0 0;
    font-weight: 400;
  }
  .cover-meta {
    text-align: right;
    font-size: 7pt;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1.4;
    white-space: nowrap;
  }
  .cover-meta b {
    color: #111827;
    font-weight: 700;
  }

  /* Описание — одна строка под шапкой, тонкая */
  .doc-description {
    font-size: 7.5pt;
    color: #374151;
    margin: 0 0 6pt 0;
    line-height: 1.35;
  }

  /* Section */
  .section {
    page-break-inside: avoid;
    padding: 4pt 5pt;
    border: 0.5pt solid #e5e7eb;
    border-left: 1.6pt solid var(--accent, #111827);
    border-radius: 2pt;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .section-head {
    display: flex;
    align-items: baseline;
    gap: 4pt;
    margin-bottom: 3pt;
    flex-wrap: wrap;
  }
  .section-number {
    display: inline-block;
    background: var(--accent, #111827);
    color: #fff;
    font-weight: 700;
    padding: 0.5pt 3pt;
    border-radius: 1.5pt;
    font-size: 6.5pt;
    letter-spacing: 0.04em;
    line-height: 1.3;
  }
  .section-title {
    font-size: 8.5pt;
    font-weight: 700;
    margin: 0;
    color: #111827;
    line-height: 1.2;
    flex: 1;
  }
  .section-subtitle {
    font-size: 6.5pt;
    color: #6b7280;
    font-weight: 400;
    width: 100%;
    margin-top: 1pt;
    line-height: 1.25;
  }
  .section-body {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 3pt;
  }

  /* Group */
  .group {
    break-inside: avoid;
    page-break-inside: avoid;
    margin: 0;
  }
  .group-title {
    font-size: 7.5pt;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1pt 0;
    line-height: 1.25;
  }
  .group-intro {
    font-size: 6.5pt;
    color: #6b7280;
    margin: 0 0 1pt 0;
    font-style: italic;
    line-height: 1.3;
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
    gap: 3pt;
    padding: 1pt 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .checkbox {
    flex-shrink: 0;
    width: 6pt;
    height: 6pt;
    border: 0.5pt solid #374151;
    border-radius: 0.8pt;
    margin-top: 1.6pt;
    background: #fff;
  }
  .item-body { flex: 1; min-width: 0; }
  .item-title {
    font-size: 7pt;
    font-weight: 500;
    color: #111827;
    margin: 0;
    line-height: 1.28;
  }
  .item-detail {
    font-size: 6.3pt;
    color: #4b5563;
    margin: 0.5pt 0 0 0;
    line-height: 1.3;
  }

  /* Footer note */
  .footer-note {
    margin-top: 5pt;
    padding-top: 3pt;
    border-top: 0.5pt solid #e5e7eb;
    font-size: 6pt;
    color: #9ca3af;
    text-align: center;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  @media print {
    .no-print { display: none !important; }
    html, body { width: 210mm; height: 297mm; }
    /* Запрещаем любые переносы — всё уже подогнано под одну страницу */
     .doc, .sheet, .sections-grid, .section, .group, .item {
      page-break-inside: avoid;
      break-inside: avoid;
    }
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

  /* Подложка экрана — имитация листа */
  body { background: #f3f4f6; padding: 16px; }
  .sheet {
    background: #fff;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { box-shadow: none; padding: 0; margin: 0; height: 281mm; overflow: hidden; }
  }
</style>
</head>
<body>
  <div class="print-bar no-print">
    <button onclick="window.print()">📄 Сохранить PDF</button>
    <button class="secondary" onclick="window.close()">Закрыть</button>
  </div>

  <div class="sheet">
    <div class="doc" id="doc">
      <header class="cover">
        <div class="cover-left">
          <h1 class="doc-title">${escapeHtml(data.title)}</h1>
          ${data.subtitle ? `<p class="doc-subtitle">${escapeHtml(data.subtitle)}</p>` : ""}
        </div>
        <div class="cover-meta">
          <div><b>${totalSections}</b> разделов</div>
          <div><b>${totalItems}</b> пунктов</div>
          <div>${escapeHtml(today)}</div>
        </div>
      </header>
      ${data.description ? `<p class="doc-description">${escapeHtml(data.description)}</p>` : ""}
      <div class="layout-area">
        <div class="sections-grid" id="sections-grid">
          ${data.sections.map(renderSection).join("")}
        </div>
      </div>
      <p class="footer-note">Practice · pm-resourse.site · ${escapeHtml(today)} · все ${totalItems} пунктов на одной странице</p>
    </div>
  </div>

  <script>
    /**
     * Динамическая подгонка под одну страницу A4.
     * Если контент не влезает по высоте — уменьшаем общий font-size
     * (а значит и все отступы, считаемые в pt) пока не влезет.
     * Параллельно увеличиваем число колонок при большом объёме.
     */
    (function () {
      var sheet = document.querySelector('.sheet');
      var doc = document.getElementById('doc');
      var grid = document.getElementById('sections-grid');
      if (!sheet || !doc || !grid) return;

      // Доступная высота: A4 высота (297мм) минус 2×8мм поля = 281мм
      // в пикселях при 96dpi: 1мм ≈ 3.7795 px
      var maxHeightPx = 281 * 3.7795;
      var itemCount = ${totalItems};
      var sectionCount = ${totalSections};
      var sections = Array.from(grid.querySelectorAll('.section'));

      var fontPt = 8.5;
      var minFontPt = 5.0;
      var maxFontPt = 14.0;
      var step = 0.25;

      function fits() { return doc.scrollHeight <= maxHeightPx + 1; }
      function setFont(pt) { doc.style.fontSize = pt.toFixed(2) + 'pt'; }
      function setGrid(cols) {
        var rows = Math.ceil(sectionCount / cols);
        grid.style.setProperty('--cols', String(cols));
        grid.style.setProperty('--rows', String(rows));
      }
      function cellsFit() {
        return sections.every(function (section) {
          return section.scrollHeight <= section.clientHeight + 2;
        });
      }
      function cellFillRatio() {
        return Math.max.apply(
          null,
          sections.map(function (section) {
            return section.clientHeight ? section.scrollHeight / section.clientHeight : 0;
          }),
        );
      }

      setFont(fontPt);

      var cols = 2;
      if (sectionCount <= 2) cols = 1;
      else if (itemCount > 80 || sectionCount > 6) cols = 3;
      else if (itemCount > 140 || sectionCount > 9) cols = 4;
      setGrid(cols);

      var safety = 400;

      // 1) Если контент переполняет ячейки или страницу — уменьшаем шрифт
      while ((!fits() || !cellsFit()) && fontPt > minFontPt && safety-- > 0) {
        fontPt -= step;
        setFont(fontPt);
      }

      // 2) Если всё ещё тесно — добавляем колонки до разумного предела
      while ((!fits() || !cellsFit()) && cols < 4 && safety-- > 0) {
        cols += 1;
        setGrid(cols);
      }

      while ((!fits() || !cellsFit()) && fontPt > 4 && safety-- > 0) {
        fontPt -= 0.2;
        setFont(fontPt);
      }

      // 3) Если внутри боксов ещё много воздуха — аккуратно увеличиваем шрифт,
      //    сохраняя ровно одну страницу и заполнение листа всей сеткой.
      safety = 400;
      while (cellFillRatio() < 0.82 && fits() && cellsFit() && fontPt < maxFontPt && safety-- > 0) {
        fontPt += step;
        setFont(fontPt);
        if (!fits() || !cellsFit()) {
          fontPt -= step;
          setFont(fontPt);
          break;
        }
      }

      safety = 50;
      while (cellFillRatio() < 0.88 && fits() && cellsFit() && fontPt < maxFontPt && safety-- > 0) {
        fontPt += 0.1;
        setFont(fontPt);
        if (!fits() || !cellsFit()) {
          fontPt -= 0.1;
          setFont(fontPt);
          break;
        }
      }
    })();

    // Автоматически открываем диалог печати после подгонки
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 500);
    });
  </script>
</body>
</html>`;
}

/**
 * Открывает новое окно с печатной версией чек-листа и вызывает window.print().
 * Пользователь сохраняет PDF через нативный диалог браузера.
 */
export function printChecklist(data: PrintChecklist) {
  const html = buildHtml(data);
  const w = window.open("", "_blank", "width=1100,height=1300");
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
