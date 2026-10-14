import { readModelManifest } from "./read-model-manifest.js";
type Payload = keyof typeof readModelManifest;
export async function verifyReadModel(
  name: Payload,
  bytes: Uint8Array,
): Promise<void> {
  const expected = readModelManifest[name];
  if (bytes.length !== expected.bytes)
    throw new Error(`Read-model size mismatch: ${name}`);
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(bytes));
  const actual = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  if (actual !== expected.sha256)
    throw new Error(`Read-model identity mismatch: ${name}`);
}
export async function fetchReadModel(
  name: Payload,
  onProgress?: (progress: number) => void,
): Promise<unknown> {
  const url =
    typeof window === "undefined" && typeof location !== "undefined"
      ? new URL(`/app/${name}.json`, location.origin).href
      : `app/${name}.json`;
  let response: Response | undefined;
  // Retry a transient HTTP response once; identity/schema failures never trigger retry.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      response = await fetch(url, { cache: "no-cache" });
    } catch (error) {
      if (attempt === 1) throw error;
      continue;
    }
    if (
      response.ok ||
      ![408, 429, 500, 502, 503, 504].includes(response.status) ||
      attempt === 1
    )
      break;
  }
  if (!response?.ok)
    throw new Error(`Read-model request failed: ${name} ${response?.status}`);
  const expected = readModelManifest[name].bytes;
  const chunks: Uint8Array[] = [];
  let received = 0;
  if (response.body) {
    const reader = response.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress?.(Math.min(1, received / expected));
    }
  } else {
    const bytes = new Uint8Array(await response.arrayBuffer());
    chunks.push(bytes);
    received = bytes.length;
    onProgress?.(1);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  await verifyReadModel(name, bytes);
  return JSON.parse(new TextDecoder().decode(bytes));
}
