import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .contact-page {
    font-family: 'DM Sans', sans-serif;
    height: 100%;
    width: 100vw;
    background-color: #f5f2ee;
    color: #1c1917;
  }

  /* ── Hero Banner ── */
  .contact-hero {
    background-color: #1c1917;
    padding: 80px 60px 70px;
    position: relative;
    overflow: hidden;
  }
  .contact-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 320px; height: 320px;
    border-radius: 50%;
    background: rgba(214, 169, 97, 0.12);
    pointer-events: none;
  }
  .contact-hero::after {
    content: '';
    position: absolute;
    bottom: -80px; left: 30%;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(214, 169, 97, 0.07);
    pointer-events: none;
  }
  .hero-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #d6a961;
    margin-bottom: 16px;
  }
  .hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(38px, 5vw, 58px);
    color: #f5f2ee;
    line-height: 1.15;
    max-width: 5200px;
    margin-bottom: 20px;
  }
  .hero-title em {
    color: #d6a961;
    font-style: italic;
  }
  .hero-subtitle {
    font-size: 15px;
    font-weight: 300;
    color: #a09890;
    max-width: 400px;
    line-height: 1.7;
  }

  /* ── Main layout ── */
  .contact-body {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 0;
    max-width: 1100px;
    margin: 60px auto;
    padding: 0 40px;
  }
  @media (max-width: 768px) {
    .contact-body { grid-template-columns: 1fr; padding: 0 20px; }
    .contact-hero { padding: 50px 24px; }
  }

  /* ── Info Panel ── */
  .contact-info {
    padding-right: 60px;
    border-right: 1px solid #e2ddd8;
  }
  @media (max-width: 768px) {
    .contact-info { padding-right: 0; border-right: none; border-bottom: 1px solid #e2ddd8; padding-bottom: 40px; margin-bottom: 40px; }
  }
  .info-section {
    margin-bottom: 40px;
  }
  .info-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #a09078;
    margin-bottom: 14px;
  }
  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 18px;
  }
  .info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #1c1917;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .info-icon svg {
    width: 18px; height: 18px;
    stroke: #d6a961;
    fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .info-text-label {
    font-size: 11px;
    font-weight: 600;
    color: #a09890;
    letter-spacing: 0.5px;
    margin-bottom: 3px;
  }
  .info-text-value {
    font-size: 14px;
    font-weight: 500;
    color: #1c1917;
    line-height: 1.5;
  }
  .info-text-value a {
    color: #1c1917;
    text-decoration: none;
    transition: color 0.2s;
  }
  .info-text-value a:hover { color: #d6a961; }

  .hours-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 20px;
    font-size: 13px;
  }
  .hours-day { color: #786e65; }
  .hours-time { color: #1c1917; font-weight: 500; }

  /* ── Form Panel ── */
  .contact-form-panel {
    padding-left: 60px;
  }
  @media (max-width: 768px) {
    .contact-form-panel { padding-left: 0; }
  }
  .form-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: #1c1917;
    margin-bottom: 6px;
  }
  .form-subheading {
    font-size: 13px;
    color: #a09890;
    margin-bottom: 32px;
    font-weight: 300;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  @media (max-width: 540px) {
    .form-row { grid-template-columns: 1fr; }
  }
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
  }
  .form-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #786e65;
    margin-bottom: 7px;
  }
  .form-input,
  .form-select,
  .form-textarea {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    background: #fff;
    border: 1.5px solid #e2ddd8;
    border-radius: 8px;
    padding: 12px 14px;
    color: #1c1917;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    width: 100%;
  }
  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    border-color: #d6a961;
    box-shadow: 0 0 0 3px rgba(214, 169, 97, 0.15);
  }
  .form-textarea {
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
  }
  .form-select { cursor: pointer; }

  .submit-btn {
    margin-top: 8px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #1c1917;
    color: #f5f2ee;
    border: none;
    border-radius: 8px;
    padding: 14px 32px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .submit-btn:hover {
    background: #d6a961;
    color: #1c1917;
    transform: translateY(-1px);
  }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn svg {
    width: 16px; height: 16px;
    stroke: currentColor;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ── Success Toast ── */
  .toast {
    margin-top: 20px;
    background: #edf7ed;
    border: 1px solid #a8d9a8;
    border-radius: 8px;
    padding: 14px 18px;
    font-size: 14px;
    color: #2d6a2d;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .toast svg {
    width: 18px; height: 18px;
    stroke: #2d6a2d;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
  }
`;

function Contact() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Replace with your actual form submission logic
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
        setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    };

    return (
        <>
        <style>{styles}</style>

        <div className="contact-page">
            {/* ── Hero ── */}
            <div className="contact-hero">
            <p className="hero-label">Get in touch</p>
            <h1 className="hero-title">
                Let's start a <em>conversation</em>
            </h1>
            <p className="hero-subtitle">
                Whether you have a question, a project in mind, or just want to say
                hello — we're here and happy to help.
            </p>
            </div>

            {/* ── Body ── */}
            <div className="contact-body">
            {/* Info Column */}
            <div className="contact-info">
                {/* Phone */}
                <div className="info-section">
                <p className="info-section-label">Call Us</p>

                <div className="info-item">
                    <div className="info-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    </div>
                    <div>
                    <p className="info-text-label">Primary</p>
                    <p className="info-text-value">
                        <a href="tel:+917352186003">+91 73521 86003</a>
                    </p>
                    </div>
                </div>

                <div className="info-item">
                    <div className="info-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    </div>
                    <div>
                    <p className="info-text-label">Secondary</p>
                    <p className="info-text-value">
                        <a href="tel:+918143721461">+91 81437 21461</a>
                    </p>
                    </div>
                </div>
                </div>

                {/* Email */}
                <div className="info-section">
                <p className="info-section-label">Email Us</p>
                <div className="info-item">
                    <div className="info-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    </div>
                    <div>
                    <p className="info-text-label">General Enquiries</p>
                    <p className="info-text-value">
                        <a href="mailto:hello@yourcompany.com">hello@yourcompany.com</a>
                    </p>
                    </div>
                </div>
                <div className="info-item">
                    <div className="info-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    </div>
                    <div>
                    <p className="info-text-label">Support</p>
                    <p className="info-text-value">
                        <a href="mailto:support@yourcompany.com">support@yourcompany.com</a>
                    </p>
                    </div>
                </div>
                </div>

                {/* Address */}
                <div className="info-section">
                <p className="info-section-label">Our Location</p>
                <div className="info-item">
                    <div className="info-icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    </div>
                    <div>
                    <p className="info-text-label">Address</p>
                    <p className="info-text-value">
                        123 Business Avenue, Suite 400<br />
                        Mumbai, Maharashtra 400001<br />
                        India
                    </p>
                    </div>
                </div>
                </div>

                {/* Hours */}
                <div className="info-section">
                <p className="info-section-label">Business Hours</p>
                <div className="hours-grid">
                    <span className="hours-day">Mon – Fri</span>
                    <span className="hours-time">9:00 AM – 6:00 PM</span>
                    <span className="hours-day">Saturday</span>
                    <span className="hours-time">10:00 AM – 2:00 PM</span>
                    <span className="hours-day">Sunday</span>
                    <span className="hours-time">Closed</span>
                </div>
                </div>
            </div>

            {/* Form Column */}
            <div className="contact-form-panel">
                <h2 className="form-heading">Send us a message</h2>
                <p className="form-subheading">
                Fill out the form below and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input
                        className="form-input"
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    </div>
                    <div className="form-group">
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input
                        className="form-input"
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address</label>
                    <input
                        className="form-input"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    </div>
                    <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input
                        className="form-input"
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <select
                    className="form-select"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    >
                    <option value="" disabled>Select a topic…</option>
                    <option value="general">General Enquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="message">Message</label>
                    <textarea
                    className="form-textarea"
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you…"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Send Message
                    <svg viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>

                {submitted && (
                    <div className="toast">
                    <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Thank you! Your message has been sent. We'll be in touch shortly.
                    </div>
                )}
                </form>
            </div>
            </div>
        </div>
        </>
    );
}

export default Contact;