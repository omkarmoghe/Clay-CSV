import { InitMessage, Message } from "../models/messages";

export default function tableViewEditor() {
  console.debug("Init editor script.");

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const tableContainer = document.querySelector("#table");

  const table = document.createElement("table");
  const tableHeader = table.appendChild(
    document.createElement("thead")
  );
  const tableBody = table.appendChild(
    document.createElement("tbody")
  );
  tableContainer?.appendChild(table);

  window.addEventListener("message", event => {
    const message: Message = event.data;

    switch (message.type) {
      case "init":
        const initMessage = message as InitMessage;

        if (tableContainer && table) {
          initMessage.rows.forEach((row) => {
            const tableRow = document.createElement("tr");
            row.cells.forEach((cell) => {
              const tableCell = cell.row === 0 ? document.createElement("th") : document.createElement("td");
              tableCell.id = `cell${cell.row}x${cell.col}`;
              tableCell.textContent = cell.text;
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
