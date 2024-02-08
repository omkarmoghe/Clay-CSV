import * as vscode from 'vscode';
import { debounce, nonce, parseCSV } from '../util';
import { CopyMessage, Message } from '../models/messages';

export class TableViewEditorProvider implements vscode.CustomTextEditorProvider {
  static readonly VIEW_TYPE: string = "clayCSV.tableView";

  context: vscode.ExtensionContext;
  webviewPanel: vscode.WebviewPanel | null = null;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    if (token.isCancellationRequested) { return; }

    // Enable JS
    webviewPanel.webview.options = {
      enableScripts: true
    };

    webviewPanel.webview.html = this.buildHTMLForWebview(webviewPanel.webview);

    // Text document change listener
    const didChangeTextDocumentListener = vscode.workspace.onDidChangeTextDocument(
      debounce((event: vscode.TextDocumentChangeEvent) => {
        this.onDidChangeTextDocument(document, event);
      })
    );
    // Message listener (from the webview to the backend)
    const didReceiveMessageListener = webviewPanel.webview.onDidReceiveMessage((message: Message) => {
      this.onDidReceiveMessage(message, webviewPanel, document);
    });

    webviewPanel.onDidDispose(
      () => { },
      null,
      [
        didChangeTextDocumentListener,
        didReceiveMessageListener,
        ...this.context.subscriptions
      ]
    );

    this.webviewPanel = webviewPanel;
  }

  // Document change listener
  onDidChangeTextDocument(
    document: vscode.TextDocument,
    event: vscode.TextDocumentChangeEvent
  ): void {
    if (!this.webviewPanel) { return; }
    if (event.document.uri.toString() !== document.uri.toString()) {
      return;
    }
    if (!event.contentChanges || event.contentChanges.length <= 0) {
      return;
    }

    // TODO(@omkarmoghe): There are a lot of edge cases around updating just the rows that were changed, specifically
    // when deleting or inserting new rows. It's much easier for now to just update the whole webview.
    this.initWebview(document);
  }

  buildHTMLForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out", "editors", "TableViewEditor.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out", "styles", "tableViewEditor.css")
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
				<div id="table-container">
          <span>Parsing CSV...</span>
        </div>

        <script type="application/javascript" nonce="${scriptNonce}">var exports = {};</script>
        <script type="application/javascript" nonce="${scriptNonce}" src="${scriptUri}"></script>
        <script type="application/javascript" nonce="${scriptNonce}">tableViewEditor();</script>
			</body>
			</html>`;
  }

  initWebview(document: vscode.TextDocument) {
    if (!this.webviewPanel) { return; }

    parseCSV(document).then((rows) => {
      this.webviewPanel!.webview.postMessage({
        type: "init",
        rows
      });
    });
  }

  onDidReceiveMessage(message: Message, webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument) {
    switch (message.type) {
      case "copy":
        const copyMessage = message as CopyMessage;

        vscode.env.clipboard.writeText(copyMessage.text).then(() => {
          vscode.window.showInformationMessage(`"${copyMessage.text}" copied.`);
        });
        return;
      case "init":
        console.debug("Webview requested initialization.");
        this.initWebview(document);
        return;
      default:
        console.warn(`Unhandled message received from webview: ${message.type}`);
        return;
    }
  }
}
