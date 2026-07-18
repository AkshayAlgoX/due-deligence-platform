/**
 * Cloudinary upload service.
 *
 * Uploads images directly from browser to Cloudinary using unsigned preset.
 * Returns secure CDN URL that we save in Postgres.
 *
 * ✅ Safe: uses public preset only (no API secret in browser)
 * ✅ Fast: direct browser → Cloudinary (no backend proxy)
 * ✅ Optimized: preset auto-resizes + converts to WebP
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Validate file before upload.
 * @throws {Error} with human-friendly message if invalid
 */
export function validateImageFile(file) {
  if (!file) {
    throw new Error("No file selected");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only JPG, PNG, or WebP images are allowed");
  }
  if (file.size > MAX_FILE_SIZE) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is ${mb} MB — max size is 5 MB`);
  }
  return true;
}

/**
 * Upload image to Cloudinary and return the secure URL.
 *
 * @param {File} file - Image file from input/drop
 * @param {(percent: number) => void} [onProgress] - Optional progress callback
 * @returns {Promise<{url: string, publicId: string, width: number, height: number}>}
 */
export function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      validateImageFile(file);
    } catch (err) {
      return reject(err);
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      return reject(
        new Error(
          "Cloudinary is not configured. Check NEXT_PUBLIC_CLOUDINARY_* env vars."
        )
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_URL);

    // Progress tracking
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes,
          });
        } catch (err) {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed (HTTP ${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    xhr.send(formData);
  });
}

/**
 * Optional: Delete image from Cloudinary.
 * Note: Requires signed request → must be done from backend for security.
 * For MVP, we just orphan the image (Cloudinary auto-cleans old unused files).
 */
export function getCloudinaryPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}