import * as vscode from 'vscode';
import { nonce } from '../util';
import { InitMessage } from '../models/messages';

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
      this.onDidChangeTextDocument(document, event);
    });
    webviewPanel.onDidDispose(() => { didChangeTextDocumentListener.dispose(); });

    webviewPanel.webview.onDidReceiveMessage(event => {
      console.dir(event);
    });

    webviewPanel.webview.postMessage({
      type: "init",
      text: document.getText()
    });
  }

  // Document change listener
  onDidChangeTextDocument(document: vscode.TextDocument, event: vscode.TextDocumentChangeEvent): void {
    if (event.document.uri.toString() !== document.uri.toString()) {
      return;
    }

    console.dir(event.contentChanges);
  }

  buildHTMLForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "editors", "tableViewEditor.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "styles", "tableViewEditor.css")
    );
    const scriptNonce = nonce();
    debugger;

    return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleUri}" rel="stylesheet" />
      </head>
      <body>
        <h1>FUCK YA</h1>
        <div id="control"/>
				<div id="table"/>

        <script nonce="${scriptNonce}" src="${scriptUri}"></script>
        <script nonce="${scriptNonce}">tableViewEditor();</script>
			</body>
			</html>`;
  }
}
