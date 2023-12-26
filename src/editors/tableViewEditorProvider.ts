import * as vscode from 'vscode';
import { debounce, nonce, parseCsv } from '../util';
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
    _token: vscode.CancellationToken
  ): void | Thenable<void> {
    // Enable JS
    webviewPanel.webview.options = {
      enableScripts: true,
    };

    webviewPanel.webview.html = this.buildHTMLForWebview(webviewPanel.webview);

    // Text document change listener
    const didChangeTextDocumentListener = vscode.workspace.onDidChangeTextDocument(
      debounce((event: vscode.TextDocumentChangeEvent) => {
        this.onDidChangeTextDocument(document, event, webviewPanel);
      })
    );
    // Message listener (from the webview to the backend)
    const didReceiveMessageListener = webviewPanel.webview.onDidReceiveMessage(this.onDidReceiveMessage);
    // View state change listener
    // const didChangeViewStateListener = webviewPanel.onDidChangeViewState(
    //   (event: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
    //     this.onDidChangeViewState(event);
    //   }
    // );

    webviewPanel.onDidDispose(
      () => { },
      null,
      [
        didChangeTextDocumentListener,
        didReceiveMessageListener,
        // didChangeViewStateListener,
        ...this.context.subscriptions
      ]
    );

    this.initWebview(webviewPanel, document);
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
    this.initWebview(webviewPanel, document);
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
				<div id="table-container">
          <span>Parsing CSV...</span>
        </div>

        <script type="application/javascript" nonce="${scriptNonce}">var exports = {};</script>
        <script type="application/javascript" nonce="${scriptNonce}" src="${scriptUri}"></script>
        <script type="application/javascript" nonce="${scriptNonce}">tableViewEditor();</script>
			</body>
			</html>`;
  }

  initWebview(webviewPanel: vscode.WebviewPanel, document: vscode.TextDocument) {
    parseCsv(document.getText()).then((rows) => {
      webviewPanel.webview.postMessage({
        type: "init",
        rows: rows
      });
    });
  }

  onDidReceiveMessage(message: Message) {
    switch (message.type) {
      case "copy":
        const copyMessage = message as CopyMessage;

        vscode.env.clipboard.writeText(copyMessage.text).then(() => {
          vscode.window.showInformationMessage(`"${copyMessage.text}" copied to clipboard.`);
        });
        return;
      default:
        console.warn(`Unhandled message received from webview: ${message.type}`);
        return;
    }
  }

  onDidChangeViewState(event: vscode.WebviewPanelOnDidChangeViewStateEvent) {
    const webviewPanel = event.webviewPanel;
    webviewPanel.webview.html = this.buildHTMLForWebview(webviewPanel.webview);
  }
}
