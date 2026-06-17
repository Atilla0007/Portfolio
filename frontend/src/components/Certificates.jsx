import { useEffect, useState } from "react";

import { certificateHref, certificateImageSrc } from "../utils/certificateDisplay.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const CERTIFICATES_ENDPOINT = `${API_BASE_URL}/api/certificates/`;

function formatDate(value) {
  if (!value) {
    return "Date pending";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCertificates() {
      try {
        const response = await fetch(CERTIFICATES_ENDPOINT);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setCertificates(Array.isArray(data) ? data : data.results || []);
          setStatus("success");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message);
          setStatus("error");
        }
      }
    }

    loadCertificates();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="certificates section-shell section-grid" id="certificates">
      <div className="section-kicker">(02) Certificates</div>

      <div className="section-content">
        <div className="section-heading-row">
          <h2>Certificates / achievements</h2>
          <span>Selected proof of work</span>
        </div>

        {status === "loading" && (
          <div className="state-line" role="status">
            Loading certificates...
          </div>
        )}

        {status === "error" && (
          <div className="state-line state-line-error" role="alert">
            Certificates could not load. {errorMessage}
          </div>
        )}

        {status === "success" && certificates.length === 0 && (
          <div className="state-line">
            Certificates will appear here after they are added in Django admin.
          </div>
        )}

        {status === "success" && certificates.length > 0 && (
          <div className="certificate-grid">
            {certificates.map((certificate) => {
              const href = certificateHref(certificate);
              const imageSrc = certificateImageSrc(certificate);
              const renderHref = href ? encodeURI(href) : "";
              const renderImageSrc = imageSrc ? encodeURI(imageSrc) : "";

              return (
                <article className="certificate-card" key={certificate.id}>
                  {renderImageSrc && (
                    <img
                      className="certificate-image"
                      src={renderImageSrc}
                      alt={`${certificate.title} certificate preview`}
                    />
                  )}

                  <div className="certificate-body">
                    <div className="certificate-meta">
                      <span>{certificate.issuer}</span>
                      <time dateTime={certificate.date || undefined}>
                        {formatDate(certificate.date)}
                      </time>
                    </div>
                    <h3>{certificate.title}</h3>
                    {certificate.description && <p>{certificate.description}</p>}

                    {renderHref && (
                      <a className="text-button" href={renderHref} target="_blank" rel="noopener noreferrer">
                        View certificate
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Certificates;
