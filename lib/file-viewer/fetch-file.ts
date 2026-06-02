/** Load file bytes or text from a data URL or remote URL. */
export async function fetchFileBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Could not load file (${res.status})`);
  return res.blob();
}

export async function fetchFileArrayBuffer(src: string): Promise<ArrayBuffer> {
  const blob = await fetchFileBlob(src);
  return blob.arrayBuffer();
}

export async function fetchFileText(src: string): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Could not load file (${res.status})`);
  return res.text();
}
