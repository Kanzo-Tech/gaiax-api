import crypto from "crypto";

export function hashVC(vc: any): string {
  const canon = JSON.stringify(vc);
  return crypto.createHash("sha256").update(canon).digest("hex");
}
