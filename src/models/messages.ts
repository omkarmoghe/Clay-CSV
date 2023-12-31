import { Cell, Row } from "./csv";

export interface Message {
  type: string;
}

export interface UpdateMessage extends Message {
  rows: Row[];
}

export interface CopyMessage extends Message {
  text: string;
}
