/**
 * Downloads a file via a direct server URL. Uses the browser's cookie-based
 * auth (auth_token cookie set at login) — no blob URLs, no CSP issues.
 * The server must respond with Content-Disposition: attachment.
 */
export function downloadUrl(url) {
  // Use an invisible iframe — most reliable cross-browser approach
  // for cookie-based auth + Content-Disposition downloads
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => {
    iframe.remove();
  }, 5000);
}

/**
 * Downloads a client-side generated Blob (e.g. react-pdf).
 * Only use this for blobs that were generated IN the browser —
 * for server-side files, use downloadUrl() instead.
 */
export function downloadBlob(blob, filename = "download") {
  if (!blob || !(blob instanceof Blob)) {
    throw new Error("Invalid blob provided for download");
  }

  if (blob.size === 0) {
    throw new Error("File is empty");
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(url);
  }, 200);
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
