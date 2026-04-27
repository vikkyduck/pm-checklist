/**
 * Печать результатов «Радара ресурсности» в PDF через нативное окно печати.
 * Включает:
 *  - доминирующий архетип (или два, если двойной)
 *  - SVG-радар с цветной заливкой
 *  - бары по блокам с процентами
 *  - подробности архетипа: уникальность, почему гаснете, восстановление, ранние сигналы
 */

export type PrintRadarBlock = {
  id: string;
  label: string;
  shortLabel: string;
  /** CSS-цвет (hex/oklch/rgb), уже резолвленный из переменной */
  color: string;
  checked: number;
  total: number;
  pct: number;
  /** 0–10 — нормализованный счёт для радара */
  score: number;
};

export type PrintRadarTool = {
  name: string;
  author?: string;
  description: string;
  steps?: string[];
  effect?: string;
};

export type PrintRadarArchetype = {
  id: string;
  name: string;
  tagline: string;
  uniqueness: string;
  whyDrains: string;
  recovery: { title: string; text: string }[];
  earlyWarnings: { level: string; signals: string[] };
  tools?: { title: string; intro?: string; tools: PrintRadarTool[] };
  /** Цвет архетипа */
  color: string;
};

export type PrintRadarData = {
  blocks: PrintRadarBlock[];
  dominantArchetypes: PrintRadarArchetype[];
  hasDual: boolean;
  totalChecked: number;
  totalCriteria: number;
  overallPct: number;
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Рисует SVG-радар (паутинку) с заливкой профиля */
function renderRadarSvg(blocks: PrintRadarBlock[], color: string): string {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 110;
  const n = blocks.length;
  if (n === 0) return "";

  // Координаты вершины i для значения value (0..10)
  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (value / 10) * radius;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as const;
  };

  // Сетка: 4 концентрических многоугольника
  const gridLevels = [2.5, 5, 7.5, 10];
  const gridPolys = gridLevels
    .map((lvl) => {
      const pts = blocks
        .map((_, i) => point(i, lvl).join(","))
        .join(" ");
      return `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="1" />`;
    })
    .join("");

  // Лучи
  const spokes = blocks
    .map((_, i) => {
      const [x, y] = point(i, 10);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
    })
    .join("");

  // Профиль
  const profilePts = blocks
    .map((b, i) => point(i, b.score).join(","))
    .join(" ");
  const dots = blocks
    .map((b, i) => {
      const [x, y] = point(i, b.score);
      return `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.5" />`;
    })
    .join("");

  // Подписи
  const labels = blocks
    .map((b, i) => {
      const [x, y] = point(i, 11.6);
      const angle = (360 * i) / n;
      const anchor =
        angle < 45 || angle > 315
          ? "middle"
          : angle < 135
            ? "start"
            : angle < 225
              ? "middle"
              : "end";
      return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="10" font-weight="600" fill="#374151" dominant-baseline="middle">${escapeHtml(b.shortLabel)}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      ${gridPolys}
      ${spokes}
      <polygon points="${profilePts}" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="2" stroke-linejoin="round" />
      ${dots}
      ${labels}
    </svg>
  `;
}

function renderArchetypeBlock(a: PrintRadarArchetype, idx: number, hasDual: boolean): string {
  return `
    <section class="archetype" style="--accent: ${a.color}">
      ${
        hasDual
          ? `<div class="arch-head">
              <span class="arch-num">${idx + 1}</span>
              <h2 class="arch-name">${escapeHtml(a.name)}</h2>
              <span class="arch-tag">${escapeHtml(a.tagline)}</span>
            </div>`
          : ""
      }
      <div class="arch-section">
        <h3 class="arch-h3">Ваша уникальность</h3>
        <p class="arch-text">${escapeHtml(a.uniqueness)}</p>
      </div>
      <div class="arch-section">
        <h3 class="arch-h3">Почему вы «гаснете»</h3>
        <p class="arch-text">${escapeHtml(a.whyDrains)}</p>
      </div>
      <div class="arch-section">
        <h3 class="arch-h3">Экологичное восстановление</h3>
        <div class="recovery-grid">
          ${a.recovery
            .map(
              (r) => `
            <div class="recovery-card">
              <p class="recovery-title">${escapeHtml(r.title)}</p>
              <p class="recovery-text">${escapeHtml(r.text)}</p>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      <div class="arch-section">
        <h3 class="arch-h3">Карта сигналов: пора восстановиться</h3>
        <p class="arch-meta">Маркеры раннего оповещения · ${escapeHtml(a.earlyWarnings.level)}</p>
        <ul class="signals">
          ${a.earlyWarnings.signals
            .map((s) => `<li>${escapeHtml(s)}</li>`)
            .join("")}
        </ul>
      </div>
      ${
        a.tools
          ? `<div class="arch-section">
              <h3 class="arch-h3">${escapeHtml(a.tools.title)}</h3>
              ${a.tools.intro ? `<p class="arch-meta">${escapeHtml(a.tools.intro)}</p>` : ""}
              <div class="tools-list">
                ${a.tools.tools
                  .map(
                    (t) => `
                  <div class="tool-card">
                    <p class="tool-name">
                      ${escapeHtml(t.name)}${t.author ? ` <span class="tool-author">· ${escapeHtml(t.author)}</span>` : ""}
                    </p>
                    <p class="tool-desc">${escapeHtml(t.description)}</p>
                    ${
                      t.steps && t.steps.length
                        ? `<ul class="tool-steps">${t.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
                        : ""
                    }
                    ${
                      t.effect
                        ? `<p class="tool-effect"><span class="tool-effect-label">Эффект:</span> ${escapeHtml(t.effect)}</p>`
                        : ""
                    }
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>`
          : ""
      }
    </section>
  `;
}

function buildHtml(data: PrintRadarData): string {
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const primary = data.dominantArchetypes[0];
  const radarColor = primary?.color ?? "#111827";
  const titleText = primary
    ? data.hasDual
      ? data.dominantArchetypes.map((a) => a.name).join(" + ")
      : primary.name
    : "Карта ресурсов";

  // Подсчёт суммарного объёма для эвристики колонок
  const archetypeContentLength = data.dominantArchetypes.reduce((sum, a) => {
    return (
      sum +
      a.uniqueness.length +
      a.whyDrains.length +
      a.recovery.reduce((s, r) => s + r.text.length, 0) +
      a.earlyWarnings.signals.reduce((s, x) => s + x.length, 0) +
      (a.tools?.tools.reduce(
        (s, t) =>
          s +
          t.description.length +
          (t.steps?.reduce((ss, x) => ss + x.length, 0) ?? 0) +
          (t.effect?.length ?? 0),
        0,
      ) ?? 0)
    );
  }, 0);

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>Радар ресурсности · ${escapeHtml(titleText)}</title>
<style>
  /* Одна страница A4 — узкие поля, динамический fit */
  @page { size: A4; margin: 8mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; background: #fff; color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.3;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  body { background: #f3f4f6; padding: 16px; }
  .sheet {
    width: 194mm;
    min-height: 281mm;
    background: #fff;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    margin: 0 auto;
    padding: 8mm;
    transform-origin: top left;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { box-shadow: none; padding: 0; margin: 0; min-height: 281mm; }
  }

  .doc { font-size: 8pt; }

  /* Шапка — компактная одностроковая */
  .cover {
    border-bottom: 1.4pt solid ${radarColor};
    padding-bottom: 4pt;
    margin-bottom: 6pt;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12pt;
  }
  .doc-title {
    font-size: 14pt; font-weight: 700;
    margin: 0; line-height: 1.1;
    letter-spacing: -0.01em;
  }
  .doc-subtitle {
    font-size: 8pt; color: #4b5563;
    margin: 2pt 0 0 0; font-weight: 400;
  }
  .cover-meta {
    text-align: right;
    font-size: 6.8pt;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    line-height: 1.4;
    white-space: nowrap;
  }
  .cover-meta b { color: #111827; font-weight: 700; }

  /* Двухколоночный layout: левая 38% (радар+бары), правая — архетип */
  .grid {
    display: grid;
    grid-template-columns: 38% 1fr;
    gap: 8pt;
    align-items: start;
  }

  .panel {
    border: 0.5pt solid #e5e7eb;
    border-radius: 2.5pt;
    padding: 5pt 6pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .panel-title {
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #374151;
    margin: 0 0 3pt 0;
  }

  /* Радар */
  .radar-wrap { text-align: center; padding: 2pt; }
  .radar-wrap svg { width: 100%; height: auto; max-width: 180pt; }

  /* Бары */
  .bars-panel { margin-top: 5pt; }
  .bar-row { margin-bottom: 2.5pt; }
  .bar-head {
    display: flex; justify-content: space-between;
    font-size: 6.8pt; margin-bottom: 0.8pt;
  }
  .bar-track {
    height: 3pt; background: #f3f4f6;
    border-radius: 1.5pt; overflow: hidden;
  }
  .bar-fill { height: 100%; border-radius: 1.5pt; }

  /* Stats строка */
  .stats-row {
    display: flex; gap: 8pt;
    margin-top: 4pt;
    padding-top: 4pt;
    border-top: 0.5pt solid #f3f4f6;
  }
  .stats-block { flex: 1; text-align: center; }
  .stats-label {
    text-transform: uppercase; letter-spacing: 0.08em;
    font-size: 6pt; color: #6b7280; margin: 0;
  }
  .stats-value {
    font-size: 11pt; font-weight: 700; margin: 0;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .stats-value.accent { color: ${radarColor}; }

  /* Правая колонка — архетипы в стопке коробочек */
  .archetype {
    border: 0.5pt solid var(--accent, #111827)44;
    border-left: 1.6pt solid var(--accent, #111827);
    border-radius: 2.5pt;
    padding: 4pt 6pt;
    margin-bottom: 5pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .archetype:last-child { margin-bottom: 0; }
  .arch-head {
    display: flex; align-items: baseline; gap: 5pt;
    border-bottom: 0.5pt solid #f3f4f6;
    padding-bottom: 2pt; margin-bottom: 3pt;
    flex-wrap: wrap;
  }
  .arch-num {
    background: var(--accent); color: #fff;
    font-weight: 700; font-size: 6.5pt;
    padding: 0.5pt 3pt; border-radius: 1.5pt;
    line-height: 1.3;
  }
  .arch-name {
    font-size: 9.5pt; font-weight: 700;
    margin: 0; color: var(--accent);
    line-height: 1.15;
  }
  .arch-tag {
    font-size: 6.5pt; color: #6b7280; font-style: italic;
  }

  /* Внутренние под-блоки архетипа — двухколоночные */
  .arch-cols {
    column-count: 2;
    column-gap: 6pt;
    column-fill: balance;
  }
  .arch-section {
    break-inside: avoid;
    margin-bottom: 3pt;
  }
  .arch-h3 {
    font-size: 7pt; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    margin: 0 0 1pt 0; color: var(--accent);
  }
  .arch-text {
    font-size: 6.8pt; color: #374151; margin: 0;
    line-height: 1.35;
  }
  .arch-meta {
    font-size: 6pt; color: #9ca3af; margin: 0 0 1pt 0;
    font-style: italic;
  }
  .recovery-grid { display: flex; flex-direction: column; gap: 2pt; }
  .recovery-card {
    background: #fafafa; border-radius: 1.5pt;
    padding: 2pt 4pt;
    break-inside: avoid;
  }
  .recovery-title {
    font-size: 6.8pt; font-weight: 600;
    margin: 0; color: #111827; line-height: 1.25;
  }
  .recovery-text {
    font-size: 6.3pt; color: #4b5563;
    margin: 0.5pt 0 0 0; line-height: 1.3;
  }
  .signals { margin: 0; padding-left: 9pt; }
  .signals li {
    font-size: 6.5pt; color: #374151;
    margin-bottom: 0.5pt; line-height: 1.3;
  }
  .tools-list {
    display: flex; flex-direction: column; gap: 2pt;
  }
  .tool-card {
    background: #fafafa;
    border-left: 1pt solid var(--accent);
    border-radius: 1.5pt; padding: 2pt 4pt;
    break-inside: avoid;
  }
  .tool-name {
    font-size: 6.8pt; font-weight: 600;
    margin: 0; color: var(--accent); line-height: 1.2;
  }
  .tool-author {
    font-size: 6pt; font-weight: 400;
    color: #6b7280; font-style: italic;
  }
  .tool-desc {
    font-size: 6.3pt; color: #374151; margin: 0.5pt 0 0 0;
    line-height: 1.3;
  }
  .tool-steps { margin: 1pt 0 0 0; padding-left: 8pt; }
  .tool-steps li {
    font-size: 6pt; color: #4b5563;
    margin-bottom: 0.3pt; line-height: 1.25;
  }
  .tool-effect {
    margin: 1pt 0 0 0; padding: 1pt 3pt;
    background: #fff;
    border-left: 1pt solid var(--accent);
    font-size: 6pt; color: #4b5563; line-height: 1.3;
  }
  .tool-effect-label { font-weight: 700; color: #111827; }

  .footer-note {
    margin-top: 5pt; padding-top: 3pt;
    border-top: 0.5pt solid #e5e7eb;
    font-size: 6pt; color: #9ca3af; text-align: center;
    text-transform: uppercase; letter-spacing: 0.05em;
  }

  @media print {
    .no-print { display: none !important; }
    .doc, .grid, .panel, .archetype, .arch-section,
    .recovery-card, .tool-card {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }

  .print-bar {
    position: fixed; top: 16px; right: 16px;
    display: flex; gap: 8px; z-index: 100;
  }
  .print-bar button {
    padding: 10px 16px; border-radius: 8px;
    border: 1px solid #111827; background: #111827;
    color: #fff; font-family: inherit; font-size: 13px;
    font-weight: 500; cursor: pointer;
  }
  .print-bar button.secondary { background: #fff; color: #111827; }
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
        <div>
          <h1 class="doc-title">${escapeHtml(titleText)}</h1>
          ${primary ? `<p class="doc-subtitle">${escapeHtml(data.hasDual ? "Двойной источник ресурса — оба профиля важны для восстановления" : primary.tagline)}</p>` : ""}
        </div>
        <div class="cover-meta">
          <div><b>${data.totalChecked}</b>/${data.totalCriteria} отмечено</div>
          <div><b>${data.overallPct}%</b> сила сигнала</div>
          <div>${escapeHtml(today)}</div>
        </div>
      </header>

      <div class="grid">
        <!-- Левая колонка: радар + бары + статы -->
        <div>
          <div class="panel radar-wrap">
            ${renderRadarSvg(data.blocks, radarColor)}
          </div>
          <div class="panel bars-panel">
            <p class="panel-title">Источники энергии по блокам</p>
            ${data.blocks
              .map(
                (b) => `
              <div class="bar-row">
                <div class="bar-head">
                  <span style="font-weight:500;">${escapeHtml(b.label)}</span>
                  <span style="color:#6b7280;font-variant-numeric:tabular-nums;">${b.checked}/${b.total} · ${b.pct}%</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${b.pct}%;background:${b.color};"></div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

        <!-- Правая колонка: архетип целиком -->
        <div id="arch-col">
          ${data.dominantArchetypes.map((a, i) => renderArchetypeBlock(a, i, data.hasDual)).join("")}
        </div>
      </div>

      <p class="footer-note">Practice · pm-resourse.site · ${escapeHtml(today)} · вся карта на одной странице</p>
    </div>
  </div>

  <script>
    /**
     * Авто-подгонка под одну страницу A4.
     * Если архетип содержит много инструментов и сигналов — JS уменьшает шрифт,
     * пока всё не влезет в высоту листа.
     */
    (function () {
      var sheet = document.querySelector('.sheet');
      var doc = document.getElementById('doc');
      if (!sheet || !doc) return;

      // 281мм в пикселях при 96dpi
      var maxHeightPx = 281 * 3.7795;

      // Эвристика: если контента много — стартуем сразу с меньшего шрифта
      var contentLen = ${archetypeContentLength};
      var fontPt = contentLen > 2500 ? 7.5 : 8.0;
      var minFontPt = 5.0;
      var step = 0.2;

      function fits() {
        return doc.scrollHeight <= maxHeightPx + 1;
      }
      function setFont(pt) {
        doc.style.fontSize = pt.toFixed(2) + 'pt';
      }
      setFont(fontPt);

      var safety = 200;
      while (!fits() && fontPt > minFontPt && safety-- > 0) {
        fontPt -= step;
        setFont(fontPt);
      }
      // Финальный микро-жим
      safety = 50;
      while (!fits() && fontPt > 4 && safety-- > 0) {
        fontPt -= 0.15;
        setFont(fontPt);
      }
    })();

    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 500);
    });
  </script>
</body>
</html>`;
}

export function printRadar(data: PrintRadarData) {
  if (data.dominantArchetypes.length === 0) {
    alert("Сначала отметьте хотя бы один пункт в опросе.");
    return;
  }
  const html = buildHtml(data);
  const w = window.open("", "_blank", "width=1100,height=1300");
  if (!w) {
    alert("Не удалось открыть окно печати. Разрешите всплывающие окна.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

