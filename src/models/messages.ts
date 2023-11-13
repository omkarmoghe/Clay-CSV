export interface Message {
  type: string;
}

export interface InitMessage extends Message {
  text: string;
}

export interface CellUpdate {
  row: number;
  col: number;
  text: string;
}

export interface UpdateMessage extends Message {
  updates: CellUpdate[];
}
