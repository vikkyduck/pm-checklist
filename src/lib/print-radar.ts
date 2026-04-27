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

  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title>Радар ресурсности · ${escapeHtml(titleText)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; background: #fff; color: #111827;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 10.5pt; line-height: 1.45;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .eyebrow {
    text-transform: uppercase; letter-spacing: 0.12em;
    font-size: 8pt; color: #6b7280; margin: 0 0 8pt 0;
  }
  .cover {
    border-bottom: 2px solid ${radarColor};
    padding-bottom: 14pt; margin-bottom: 18pt;
  }
  .doc-title {
    font-size: 24pt; font-weight: 700; letter-spacing: -0.01em;
    margin: 0 0 6pt 0; line-height: 1.1;
  }
  .doc-subtitle {
    font-size: 12pt; color: #4b5563; margin: 0 0 0 0;
    font-weight: 400;
  }

  .summary {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 18pt; margin-bottom: 18pt;
    page-break-inside: avoid;
  }
  .stats-card {
    border: 1px solid ${radarColor}55;
    border-radius: 6pt;
    padding: 14pt;
    background: ${radarColor}08;
  }
  .stats-row {
    display: flex; gap: 18pt;
    border-top: 1px solid #e5e7eb;
    padding-top: 10pt; margin-top: 10pt;
  }
  .stats-block { flex: 1; }
  .stats-label {
    text-transform: uppercase; letter-spacing: 0.1em;
    font-size: 7.5pt; color: #6b7280; margin: 0 0 3pt 0;
  }
  .stats-value {
    font-size: 20pt; font-weight: 600; margin: 0;
    font-variant-numeric: tabular-nums;
  }
  .stats-value.accent { color: ${radarColor}; }

  .radar-card {
    border: 1px solid #e5e7eb; border-radius: 6pt;
    padding: 10pt; display: flex; align-items: center; justify-content: center;
  }

  /* Bars */
  .bars { margin-bottom: 18pt; page-break-inside: avoid; }
  .bars-title {
    font-size: 13pt; font-weight: 600; margin: 0 0 4pt 0;
  }
  .bars-sub {
    font-size: 9pt; color: #6b7280; margin: 0 0 10pt 0;
  }
  .bar-row { margin-bottom: 8pt; }
  .bar-head {
    display: flex; justify-content: space-between;
    font-size: 9.5pt; margin-bottom: 3pt;
  }
  .bar-track {
    height: 6pt; background: #f3f4f6;
    border-radius: 3pt; overflow: hidden;
  }
  .bar-fill { height: 100%; border-radius: 3pt; }

  /* Archetype */
  .archetype {
    margin-top: 14pt; padding: 14pt;
    border: 1px solid var(--accent)44;
    border-radius: 6pt;
    page-break-inside: avoid;
  }
  .arch-head {
    display: flex; align-items: baseline; gap: 8pt;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 6pt; margin-bottom: 8pt;
  }
  .arch-num {
    background: var(--accent); color: #fff;
    font-weight: 700; font-size: 9pt;
    padding: 2pt 7pt; border-radius: 3pt;
  }
  .arch-name {
    font-size: 13pt; font-weight: 700;
    margin: 0; color: var(--accent);
  }
  .arch-tag {
    font-size: 9pt; color: #6b7280; font-style: italic;
  }
  .arch-section {
    margin-top: 10pt; padding-top: 8pt;
    border-top: 1px solid #f3f4f6;
  }
  .arch-section:first-of-type {
    margin-top: 0; padding-top: 0; border-top: none;
  }
  .arch-h3 {
    font-size: 10pt; font-weight: 600;
    margin: 0 0 4pt 0; color: var(--accent);
  }
  .arch-text {
    font-size: 9.5pt; color: #374151; margin: 0;
    line-height: 1.5;
  }
  .arch-meta {
    font-size: 8.5pt; color: #9ca3af; margin: 0 0 5pt 0;
  }
  .recovery-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 6pt; margin-top: 4pt;
  }
  .recovery-card {
    background: #f9fafb; border: 1px solid #f3f4f6;
    border-radius: 4pt; padding: 7pt 9pt;
    page-break-inside: avoid;
  }
  .recovery-title {
    font-size: 9.5pt; font-weight: 600;
    margin: 0 0 2pt 0; color: #111827;
  }
  .recovery-text {
    font-size: 8.5pt; color: #4b5563;
    margin: 0; line-height: 1.4;
  }
  .signals { margin: 0; padding-left: 14pt; }
  .signals li {
    font-size: 9.5pt; color: #374151;
    margin-bottom: 3pt; line-height: 1.45;
  }

  .footer-note {
    margin-top: 24pt; padding-top: 10pt;
    border-top: 1px solid #e5e7eb;
    font-size: 8pt; color: #9ca3af; text-align: center;
  }

  @media print { .no-print { display: none !important; } }
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

  <header class="cover">
    <p class="eyebrow">Радар ресурсности · ${escapeHtml(today)}</p>
    <h1 class="doc-title">${escapeHtml(titleText)}</h1>
    ${primary ? `<p class="doc-subtitle">${escapeHtml(data.hasDual ? "Двойной источник ресурса — оба профиля важны для восстановления." : primary.tagline)}</p>` : ""}
  </header>

  <section class="summary">
    <div class="stats-card">
      <p class="eyebrow">${data.hasDual ? "Архетипы" : "Архетип восстановления"}</p>
      <p style="margin:0;font-size:9.5pt;color:#374151;">
        Доминирующий блок определяет, что вернёт вам энергию быстрее всего.
      </p>
      <div class="stats-row">
        <div class="stats-block">
          <p class="stats-label">Отмечено</p>
          <p class="stats-value">${data.totalChecked}<span style="font-size:10pt;color:#9ca3af;font-weight:400;">/${data.totalCriteria}</span></p>
        </div>
        <div class="stats-block">
          <p class="stats-label">Сила сигнала</p>
          <p class="stats-value accent">${data.overallPct}%</p>
        </div>
      </div>
    </div>
    <div class="radar-card">
      ${renderRadarSvg(data.blocks, radarColor)}
    </div>
  </section>

  <section class="bars">
    <h2 class="bars-title">Источники энергии по блокам</h2>
    <p class="bars-sub">Чем выше процент — тем сильнее блок влияет на ваш ресурс.</p>
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
  </section>

  ${data.dominantArchetypes.map((a, i) => renderArchetypeBlock(a, i, data.hasDual)).join("")}

  <p class="footer-note">Practice · pm-resourse.site · ${escapeHtml(today)}</p>

  <script>
    window.addEventListener("load", function () {
      setTimeout(function () { window.print(); }, 350);
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
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) {
    alert("Не удалось открыть окно печати. Разрешите всплывающие окна.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
