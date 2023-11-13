import * as crypto from "crypto";

export function nonce(): string {
  return crypto.randomBytes(24).toString("base64");
}
