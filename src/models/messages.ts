import { Cell, Row } from "./csv";

export interface Message {
  type: string;
}

export interface InitMessage extends Message {
  rows: Row[];
}

export interface UpdateMessage extends Message {
  updates: Cell[];
}

export interface CopyMessage extends Message {
  text: string;
}
