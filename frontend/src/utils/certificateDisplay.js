import { safeCertificateHref, safeMediaUrl } from "./safeUrl.js";

export function certificateHref(certificate, options) {
  return safeCertificateHref(certificate.external_url, options) || safeCertificateHref(certificate.file_url, options) || "";
}

export function certificateImageSrc(certificate, options) {
  return safeMediaUrl(certificate.image_url, options) || "";
}
