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

  // Delay cleanup to ensure browser initiates download before revoking the blob URL
  setTimeout(() => {
    link.remove();
    window.URL.revokeObjectURL(url);
  }, 100);
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
