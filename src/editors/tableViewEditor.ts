import { InitMessage, Message } from "../models/messages";

export default function tableViewEditor() {
  console.debug("Init editor script.");

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const tableContainer = document.querySelector("#table");
  const table = document.createElement("table");

  window.addEventListener("message", event => {
    const message: Message = event.data;

    switch (message.type) {
      case "init":
        const initMessage = message as InitMessage;

        if (tableContainer && table) {
          tableContainer.textContent = initMessage.text;
        }
        return;
      case "update":
      default:
        return;
    }
  });
}
