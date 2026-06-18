import { useState } from "react";

import contactPortrait from "../assets/images/atila-portrait-contact.jpg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TICKETS_ENDPOINT = `${API_BASE_URL}/api/tickets/`;

const initialTicket = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const links = [
  ["Email", "atilahatefi70@gmail.com", "mailto:atilahatefi70@gmail.com"],
  ["GitHub", "github.com/Atilla0007", "https://github.com/Atilla0007"],
  ["Instagram", "@atilahtf", "https://www.instagram.com/atilahtf"],
];

function errorFromResponse(data) {
  if (!data || typeof data !== "object") {
    return "Your ticket could not be sent. Please try again.";
  }

  const firstMessage = Object.values(data)
    .flat()
    .find((message) => typeof message === "string" && message.trim());

  return firstMessage || "Your ticket could not be sent. Please try again.";
}

function Contact() {
  const [ticket, setTicket] = useState(initialTicket);
  const [submitState, setSubmitState] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function updateTicket(event) {
    const { name, value } = event.target;
    setTicket((current) => ({ ...current, [name]: value }));
  }

  async function submitTicket(event) {
    event.preventDefault();

    if (submitState === "submitting") {
      return;
    }

    setSubmitState("submitting");
    setFeedback("");

    try {
      const response = await fetch(TICKETS_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(errorFromResponse(data));
      }

      setTicket(initialTicket);
      setSubmitState("success");
      setFeedback("Your ticket was sent. I will read it from the admin panel.");
    } catch (error) {
      setSubmitState("error");
      setFeedback(error.message || "Your ticket could not be sent. Please try again.");
    }
  }

  return (
    <section className="contact section-shell section-grid" id="contact">
      <div className="section-kicker">(03) Contact</div>

      <div className="contact-card">
        <img src={contactPortrait} alt="Contact portrait of Atila Hatefi" />
        <div>
          <p className="eyebrow">Available for focused web projects</p>
          <h2>Let&apos;s build something clean and useful.</h2>
          <ul className="contact-links">
            {links.map(([label, value, href]) => (
              <li key={label}>
                <span>{label}</span>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {value}
                </a>
              </li>
            ))}
          </ul>

          <form className="contact-ticket-form" onSubmit={submitTicket}>
            <div className="ticket-field-grid">
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={ticket.name}
                  onChange={updateTicket}
                  maxLength={120}
                  autoComplete="name"
                  required
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={ticket.email}
                  onChange={updateTicket}
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </label>
            </div>
            <label>
              <span>Subject</span>
              <input
                type="text"
                name="subject"
                value={ticket.subject}
                onChange={updateTicket}
                maxLength={160}
                required
              />
            </label>
            <label>
              <span>Message</span>
              <textarea
                name="message"
                value={ticket.message}
                onChange={updateTicket}
                minLength={20}
                maxLength={2000}
                rows={5}
                required
              />
            </label>
            <label className="ticket-honeypot" aria-hidden="true">
              <span>Website</span>
              <input
                type="text"
                name="website"
                value={ticket.website}
                onChange={updateTicket}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
            <button className="ticket-submit-button" type="submit" disabled={submitState === "submitting"}>
              <span className="ticket-submit-text">
                {submitState === "submitting" ? "Sending..." : "Send ticket"}
              </span>
              <span className="ticket-submit-signal" aria-hidden="true">
                -&gt;
              </span>
            </button>
            {feedback && (
              <p
                className={`ticket-feedback ${
                  submitState === "error" ? "ticket-feedback-error" : "ticket-feedback-success"
                }`}
                role={submitState === "error" ? "alert" : "status"}
              >
                {feedback}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
