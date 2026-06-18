const HTTP_PROTOCOLS = new Set(["http:", "https:"]);

function normalizeUrl(value, { allowHttp = true, baseUrl = globalThis.location?.origin } = {}) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed || !baseUrl) {
    return "";
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) {
      return "";
    }
    try {
      const parsed = new URL(trimmed, baseUrl);
      return parsed.origin === new URL(baseUrl).origin ? `${parsed.pathname}${parsed.search}${parsed.hash}` : "";
    } catch {
      return "";
    }
  }

  try {
    const parsed = new URL(trimmed);
    if (!HTTP_PROTOCOLS.has(parsed.protocol)) {
      return "";
    }
    if (!allowHttp && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.href;
  } catch {
    return "";
  }
}

export function safeMediaUrl(value, options) {
  return normalizeUrl(value, { allowHttp: true, ...options });
}

export function safeCertificateHref(value, options) {
  return normalizeUrl(value, { allowHttp: true, ...options });
}

export function safeExternalUrl(value, options) {
  return normalizeUrl(value, { allowHttp: true, ...options });
}
