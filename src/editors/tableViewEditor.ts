import { InitMessage, Message } from "../models/messages";

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
        const initMessage = message as InitMessage;

        if (tableHeader) {
          tableHeader.replaceChildren();
        }

        if (tableBody) {
          tableBody.replaceChildren();
        }

        if (tableContainer && table) {
          initMessage.rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            row.cells.forEach((cell) => {
              const tableCell = cell.row === 0 ? document.createElement("th") : document.createElement("td");
              tableCell.id = `cell${cell.row}x${cell.col}`;
              tableCell.textContent = cell.text;
              tableCell.addEventListener("click", (event) => onCellClick(event, vscode));
              tableRow.appendChild(tableCell);
            });


            row.index === 0 ? tableHeader.appendChild(tableRow) : tableBody.appendChild(tableRow);
          });
        }
        return;
      case "update":
      default:
        return;
    }
  });
}

function onCellClick(event: MouseEvent, vscode: any) {
  const tableCell = event.target as HTMLTableCellElement;
  vscode.postMessage({
    type: "copy",
    text: tableCell.textContent
  });
}
