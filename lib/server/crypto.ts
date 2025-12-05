import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

export namespace ChatSecure {
  const SECRET_KEY =
    process.env.CHAT_SECRET_KEY || "default_secret_key_32_chars_long!!";
  const key = createHash("sha256").update(String(SECRET_KEY)).digest();
  const IV_LENGTH = 16;

  export function encrypt(text: string) {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  export function decrypt(text: string) {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
