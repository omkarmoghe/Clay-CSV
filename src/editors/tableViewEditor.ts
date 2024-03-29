import { Cell, Row } from "../models/csv";
import { UpdateMessage, Message } from "../models/messages";

export default function tableViewEditor() {
  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const tableContainer = document.querySelector("#table-container");

  const table = document.createElement("table");
  const tableHeader = document.createElement("thead");
  const tableBody = document.createElement("tbody");
  table.replaceChildren(tableHeader, tableBody);

  tableContainer?.replaceChildren(table);

  window.addEventListener("message", event => {
    const message: Message = event.data;

    switch (message.type) {
      case "init":
        const initMessage = message as UpdateMessage;

        if (tableContainer && table) {
          initTable(vscode, tableHeader, tableBody, initMessage.rows);
        }

        return;
      default:
        return;
    }
  });

  const previousState = vscode.getState();
  if (previousState && previousState.rows) {
    initTable(vscode, tableHeader, tableBody, previousState.rows);
  } else {
    vscode.postMessage({ type: "init" });
  }
}

function initTable(vscode: any, tableHeader: HTMLTableSectionElement, tableBody: HTMLTableSectionElement, rows: Row[]) {
  const header: HTMLTableRowElement[] = [];
  const body: HTMLTableRowElement[] = [];

  rows.forEach((row) => {
    if (row.cells.length <= 0) { return; }

    const tableRow = document.createElement("tr");
    tableRow.id = `row-${row.index}`;
    row.cells.forEach((cell) => {
      const tableCell = cell.row === 0 ? document.createElement("th") : document.createElement("td");
      tableCell.id = cellID(cell);
      tableCell.textContent = cell.text;
      tableCell.addEventListener("click", (event) => onCellClick(event, vscode));
      tableRow.appendChild(tableCell);
    });

    row.index === 0 ? header.push(tableRow) : body.push(tableRow);
  });

  tableHeader.replaceChildren(...header);
  tableBody.replaceChildren(...body);

  vscode.setState({ rows });
}

function onCellClick(event: MouseEvent, vscode: any) {
  const tableCell = event.target as HTMLTableCellElement;
  vscode.postMessage({
    type: "copy",
    text: tableCell.textContent
  });
}

function cellID(cell: Cell): string {
  return `cell-${cell.row}x${cell.col}`;
}
