import { app, BrowserWindow, shell } from "electron";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { EventReportPdfData } from "../types";

export async function generateEventReportPdf(reportData: EventReportPdfData) {
  const reportWindow = new BrowserWindow({
    width: 1200,
    height: 1600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const htmlContent = renderReportHtml(reportData);
  const dataURL = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  const filePath = path.join(
    app.getPath("downloads"),
    `amaanat-lost-property-report-${formatFileTimestamp(new Date())}.pdf`,
  );

  try {
    await reportWindow.loadURL(dataURL);

    const pdfBuffer = await reportWindow.webContents.printToPDF({
      pageSize: "A4",
      printBackground: true,
      margins: {
        marginType: "default",
      },
    });

    await writeFile(filePath, pdfBuffer);
    shell.showItemInFolder(filePath);

    return { filePath };
  } finally {
    reportWindow.close();
  }
}

function renderReportHtml(reportData: EventReportPdfData) {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Amaanat & Lost Property Report</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #111827;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.35;
          }

          .page {
            page-break-after: always;
            padding: 28px 32px;
          }

          .page:last-child {
            page-break-after: auto;
          }

          h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 0;
          }

          h2 {
            margin: 0 0 14px;
            border-bottom: 2px solid #111827;
            padding-bottom: 8px;
            font-size: 20px;
          }

          h3 {
            margin: 22px 0 8px;
            font-size: 14px;
          }

          .muted {
            color: #4b5563;
          }

          .summary-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 28px;
            border-bottom: 3px solid #111827;
            padding-bottom: 20px;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-top: 24px;
          }

          .metric {
            border: 1px solid #d1d5db;
            padding: 14px;
            min-height: 92px;
          }

          .metric-label {
            color: #4b5563;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .metric-value {
            margin-top: 8px;
            font-size: 30px;
            font-weight: 800;
          }

          .category-card {
            border: 1px solid #d1d5db;
            margin-top: 24px;
            padding: 12px;
          }

          .category-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
            margin-top: 24px;
          }

          .category-grid .category-card {
            margin-top: 0;
          }

          .category-card h3 {
            margin-top: 0;
          }

          .category-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            border-top: 1px solid #e5e7eb;
            padding: 5px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead {
            display: table-header-group;
          }

          th {
            border-bottom: 2px solid #111827;
            padding: 7px 6px;
            text-align: left;
            vertical-align: bottom;
            font-size: 10px;
            text-transform: uppercase;
          }

          td {
            border-bottom: 1px solid #e5e7eb;
            padding: 6px;
            vertical-align: top;
          }

          tr {
            page-break-inside: avoid;
          }

          .empty {
            padding: 18px 6px;
            color: #4b5563;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${renderSummaryPage(reportData)}
        ${renderTablePage("Found Items Not Returned", reportData.unreturnedFoundItems)}
      </body>
    </html>
  `;
}

function renderSummaryPage(reportData: EventReportPdfData) {
  const { summary } = reportData;

  return `
    <section class="page">
      <header class="summary-header">
        <div>
          <h1>Amaanat & Lost Property Report</h1>
          <p class="muted">Generated ${escapeHtml(reportData.generatedAt)}</p>
        </div>
        <div class="muted">Internal report</div>
      </header>

      <div class="summary-grid">
        ${renderMetric("Lost items", summary.lostItems)}
        ${renderMetric("Lost items found", summary.lostItemsFound)}
        ${renderMetric("Found items", summary.foundItems)}
        ${renderMetric("Found items returned", summary.foundItemsReturned)}
        ${renderMetric("Found items not returned", summary.foundItems - summary.foundItemsReturned)}
        ${renderMetric("Amaanat users", summary.amaanatUsers)}
        ${renderMetric("Amaanat items", summary.amaanatItems)}
        ${renderMetric("Amaanat items stored", summary.amaanatItemsStored)}
      </div>

      <div class="category-grid">
        ${renderCategoryTotals("Lost items by category", reportData.categoryTotals.lost)}
        ${renderCategoryTotals("Found items by category", reportData.categoryTotals.found)}
        ${renderCategoryTotals("Amaanat items by category", reportData.categoryTotals.amaanat)}
        ${renderCategoryTotals("Unreturned found items by category", reportData.categoryTotals.unreturnedFound)}
      </div>
    </section>
  `;
}

function renderMetric(label: string, value: number) {
  return `
    <div class="metric">
      <div class="metric-label">${escapeHtml(label)}</div>
      <div class="metric-value">${value}</div>
    </div>
  `;
}

function renderCategoryTotals(title: string, totals: Record<string, number>) {
  const rows = Object.entries(totals).sort(([a], [b]) => a.localeCompare(b));

  return `
    <div class="category-card">
      <h3>${escapeHtml(title)}</h3>
      ${
        rows.length === 0
          ? `<div class="muted">No items</div>`
          : rows
              .map(
                ([category, total]) => `
                  <div class="category-row">
                    <span>${escapeHtml(category)}</span>
                    <strong>${total}</strong>
                  </div>
                `,
              )
              .join("")
      }
    </div>
  `;
}

function renderTablePage(title: string, rows: Array<Record<string, string>>) {
  const columns = Object.keys(rows[0] ?? {});

  return `
    <section class="page">
      <h2>${escapeHtml(title)}</h2>
      ${
        rows.length === 0
          ? `<div class="empty">No records.</div>`
          : `
            <table>
              <thead>
                <tr>
                  ${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) => `
                      <tr>
                        ${columns
                          .map(
                            (column) =>
                              `<td>${escapeHtml(row[column] || "-")}</td>`,
                          )
                          .join("")}
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          `
      }
    </section>
  `;
}

function formatFileTimestamp(date: Date) {
  return date.toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
