import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { certificateHref, certificateImageSrc } from "./certificateDisplay.js";
import { safeCertificateHref, safeMediaUrl } from "./safeUrl.js";

const baseUrl = "https://atilahatefi.dev";

describe("safe URL validation", () => {
  it("allows valid HTTPS URLs", () => {
    assert.equal(safeCertificateHref("https://example.com/cert.pdf", { baseUrl }), "https://example.com/cert.pdf");
  });

  it("allows valid HTTP localhost URLs", () => {
    assert.equal(safeCertificateHref("http://localhost:8000/media/cert.pdf", { baseUrl }), "http://localhost:8000/media/cert.pdf");
  });

  it("allows relative media URLs", () => {
    assert.equal(safeMediaUrl("/media/certificates/demo.png", { baseUrl }), "/media/certificates/demo.png");
  });

  it("rejects javascript URLs", () => {
    assert.equal(safeCertificateHref("javascript:alert(1)", { baseUrl }), "");
  });

  it("rejects data URLs", () => {
    assert.equal(safeMediaUrl("data:image/svg+xml;base64,PHN2Zz4=", { baseUrl }), "");
  });

  it("rejects vbscript URLs", () => {
    assert.equal(safeCertificateHref("vbscript:msgbox(1)", { baseUrl }), "");
  });

  it("rejects malformed URLs", () => {
    assert.equal(safeCertificateHref("https://[::1", { baseUrl }), "");
  });

  it("rejects empty values", () => {
    assert.equal(safeMediaUrl("", { baseUrl }), "");
  });
});

describe("certificate display URL guards", () => {
  it("does not expose unsafe image sources", () => {
    assert.equal(certificateImageSrc({ image_url: "javascript:alert(1)" }, { baseUrl }), "");
  });

  it("does not expose unsafe certificate links", () => {
    assert.equal(certificateHref({ external_url: "data:text/html,unsafe", file_url: "" }, { baseUrl }), "");
  });

  it("keeps valid certificate links working", () => {
    assert.equal(certificateHref({ external_url: "", file_url: "/media/certificates/demo.pdf" }, { baseUrl }), "/media/certificates/demo.pdf");
  });
});
