import * as vscode from 'vscode';
import { nonce, parseCsv } from '../util';
import { CopyMessage, Message } from '../models/messages';

export class TableViewEditorProvider implements vscode.CustomTextEditorProvider {
  static readonly VIEW_TYPE: string = "clayCSV.tableView";

  context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    // Enable JS
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = this.buildHTMLForWebview(webviewPanel.webview);

    // Register document change listener
    const didChangeTextDocumentListener = vscode.workspace.onDidChangeTextDocument(event => {
      this.onDidChangeTextDocument(document, event, webviewPanel);
    });
    webviewPanel.onDidDispose(() => { didChangeTextDocumentListener.dispose(); });

    webviewPanel.webview.onDidReceiveMessage(this.messageHandler);

    webviewPanel.webview.postMessage({
      type: "init",
      rows: parseCsv(document.getText())
    });
  }

  // Document change listener
  onDidChangeTextDocument(
    document: vscode.TextDocument,
    event: vscode.TextDocumentChangeEvent,
    webviewPanel: vscode.WebviewPanel
  ): void {
    if (event.document.uri.toString() !== document.uri.toString()) {
      return;
    }

    // TODO(@omkarmoghe): Compute the minimum update and just send that to the webview.
    webviewPanel.webview.postMessage({
      type: "init",
      rows: parseCsv(document.getText())
    });
  }

  buildHTMLForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out", "editors", "tableViewEditor.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "src", "styles", "tableViewEditor.css")
    );
    const scriptNonce = nonce();

    return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${scriptNonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleUri}" rel="stylesheet" />
      </head>
      <body>
        <div id="control"/>
				<div id="table"/>

        <script type="application/javascript" nonce="${scriptNonce}" src="${scriptUri}"></script>
        <script type="application/javascript" nonce="${scriptNonce}">tableViewEditor();</script>
			</body>
			</html>`;
  }

  messageHandler(message: Message) {
    switch (message.type) {
      case "copy":
        const copyMessage = message as CopyMessage;

        vscode.env.clipboard.writeText(copyMessage.text).then(() => {
          vscode.window.showInformationMessage(`"${message.text}" copied to clipboard.`);
        });
        return;
      default:
        console.warn(`Unhandled message received from webview: ${message.type}`);
    }
  }
}
