const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');

  .privacy-page {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    background-color: #2c2e31;
    color: #d1d0c5;
    min-height: 100vh;
    padding: 40px 60px;
    box-sizing: border-box;
    line-height: 1.7;
    font-size: 15px;
  }

  /* ── Header ── */
  .privacy-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
  }
  .privacy-header-brand {
    font-size: 22px;
    font-weight: 400;
    color: #d1d0c5;
  }
  .privacy-header-brand span {
    color: #e2b714;
    font-weight: 700;
  }

  /* ── Intro ── */
  .privacy-intro {
    color: #d1d0c5;
    margin-bottom: 36px;
    max-width: 860px;
  }

  /* ── TOC ── */
  .privacy-toc-title {
    color: #d1d0c5;
    margin-bottom: 10px;
    font-weight: 400;
  }
  .privacy-toc ul {
    list-style: disc;
    padding-left: 28px;
    margin-bottom: 48px;
  }
  .privacy-toc ul li {
    margin-bottom: 4px;
  }
  .privacy-toc ul li a {
    color: #e2b714;
    text-decoration: underline;
    text-decoration-color: rgba(226,183,20,0.5);
    transition: color 0.15s;
  }
  .privacy-toc ul li a:hover {
    color: #f0d050;
  }

  /* ── Sections ── */
  .privacy-section {
    margin-bottom: 48px;
    max-width: 860px;
  }
  .privacy-section h2 {
    font-family: 'Roboto Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    color: #e2b714;
    margin-bottom: 20px;
    margin-top: 0;
  }
  .privacy-section p {
    color: #d1d0c5;
    margin-bottom: 16px;
  }
  .privacy-section a {
    color: #e2b714;
    text-decoration: underline;
    text-decoration-color: rgba(226,183,20,0.45);
  }
  .privacy-section a:hover {
    color: #f0d050;
  }
  .privacy-section ul {
    list-style: disc;
    padding-left: 28px;
    margin-top: 12px;
    margin-bottom: 16px;
  }
  .privacy-section ul li {
    margin-bottom: 6px;
    color: #d1d0c5;
  }
  .privacy-section strong {
    color: #e2b714;
    font-weight: 700;
  }

  /* ── Divider ── */
  .privacy-divider {
    border: none;
    border-top: 1px solid #3e4044;
    margin: 0 0 48px 0;
    max-width: 860px;
  }

  /* ── Last updated tag ── */
  .privacy-updated {
    font-size: 12px;
    color: #646669;
    margin-bottom: 32px;
  }

  @media (max-width: 600px) {
    .privacy-page { padding: 24px 20px; font-size: 13px; }
    .privacy-section h2 { font-size: 18px; }
  }
`;




export default function Privacy() {
  return (
    <>
      <style>{styles}</style>

      <div className="privacy-page">

        {/* ── Header ── */}
        <div className="privacy-header">
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="44" height="44" rx="6" fill="#3e4044" />
            <rect x="6"  y="14" width="6" height="6" rx="1" fill="#d1d0c5" />
            <rect x="14" y="14" width="6" height="6" rx="1" fill="#d1d0c5" />
            <rect x="22" y="14" width="6" height="6" rx="1" fill="#d1d0c5" />
            <rect x="30" y="14" width="6" height="6" rx="1" fill="#d1d0c5" />
            <rect x="6"  y="22" width="6" height="6" rx="1" fill="#d1d0c5" />
            <rect x="14" y="22" width="6" height="6" rx="1" fill="#e2b714" />
            <rect x="22" y="22" width="6" height="6" rx="1" fill="#d1d0c5" />
            <rect x="30" y="22" width="6" height="6" rx="1" fill="#d1d0c5" />
            <rect x="10" y="30" width="22" height="6" rx="1" fill="#d1d0c5" />
          </svg>

          <div className="privacy-header-brand">
            velo type&nbsp;<span>VeloTypeAI</span>&nbsp;Privacy Policy
          </div>
        </div>

        {/* ── Last updated ── */}
        <p className="privacy-updated">Last updated: March 2026</p>

        {/* ── Intro ── */}
        <p className="privacy-intro">
          At VeloTypeAI, we are committed to protecting your privacy. This
          Privacy Policy explains what information we collect, how we use it,
          and the choices you have regarding your data. By using VeloTypeAI,
          you agree to the practices described in this policy.
        </p>

        {/* ── Table of Contents ── */}
        <div className="privacy-toc">
          <p className="privacy-toc-title">Table of Contents</p>
          <ul>
            <li><a href="#information-we-collect">Information We Collect</a></li>
            <li><a href="#how-we-use">How We Use Your Information</a></li>
            <li><a href="#data-storage">Data Storage & Security</a></li>
            <li><a href="#cookies">Cookies & Tokens</a></li>
            <li><a href="#third-party">Third-Party Services</a></li>
            <li><a href="#your-rights">Your Rights</a></li>
            <li><a href="#changes">Changes to This Policy</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 1 ── */}
        <div className="privacy-section" id="information-we-collect">
          <h2>Information We Collect</h2>
          <p>We collect the following types of information when you use VeloTypeAI:</p>
          <ul>
            <li><strong>Account Information</strong> — your username, email address, and hashed password when you register.</li>
            <li><strong>Typing Session Data</strong> — your WPM, accuracy, keystroke count, duration, and raw typed text for each session.</li>
            <li><strong>Mistake Data</strong> — the words you mistype, the error type, and the position within the prompt.</li>
            <li><strong>Pattern Data</strong> — aggregated mistake frequency data used to identify recurring error patterns.</li>
            <li><strong>Usage Data</strong> — basic information about how you interact with the platform.</li>
          </ul>
          <p>
            We do not collect any payment information, as VeloTypeAI does not
            currently offer paid services.
          </p>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 2 ── */}
        <div className="privacy-section" id="how-we-use">
          <h2>How We Use Your Information</h2>
          <p>Your data is used solely to provide and improve the VeloTypeAI experience:</p>
          <ul>
            <li>To create and manage your account.</li>
            <li>To track your typing performance across sessions.</li>
            <li>To detect repeated mistake patterns and generate personalised practice tasks.</li>
            <li>To display your progress analytics and improvement trends.</li>
            <li>To improve the accuracy and quality of our AI-generated practice content.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal data
            with third parties for marketing purposes.
          </p>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 3 ── */}
        <div className="privacy-section" id="data-storage">
          <h2>Data Storage & Security</h2>
          <p>
            All data is stored securely in a PostgreSQL database. We take the
            following measures to protect your information:
          </p>
          <ul>
            <li>Passwords are hashed using <strong>bcrypt</strong> and are never stored in plain text.</li>
            <li>All API communication is secured over <strong>HTTPS</strong> in production.</li>
            <li>Authentication tokens are signed using <strong>JWT (HS256)</strong>.</li>
            <li>Rate limiting is enforced at <strong>100 requests per minute</strong> to prevent abuse.</li>
          </ul>
          <p>
            While we take reasonable precautions, no system is completely
            secure. Please use a strong, unique password for your account.
          </p>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 4 ── */}
        <div className="privacy-section" id="cookies">
          <h2>Cookies & Tokens</h2>
          <p>VeloTypeAI uses the following tokens to manage your session:</p>
          <ul>
            <li>
              <strong>Access Token</strong> — a short-lived JWT (15 minutes)
              stored in memory on the client side. Used to authenticate API
              requests.
            </li>
            <li>
              <strong>Refresh Token</strong> — a longer-lived JWT (7 days)
              stored in a secure <strong>httpOnly cookie</strong>, meaning it
              is not accessible via JavaScript and is protected against XSS
              attacks.
            </li>
          </ul>
          <p>
            We do not use advertising cookies or third-party tracking cookies
            of any kind.
          </p>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 5 ── */}
        <div className="privacy-section" id="third-party">
          <h2>Third-Party Services</h2>
          <p>
            VeloTypeAI may use the following third-party services to provide
            certain features:
          </p>
          <ul>
            <li>
              <strong>OpenAI API / Claude API</strong> — used optionally to
              generate personalised practice paragraphs. Only your identified
              focus words and difficulty level are sent — no personally
              identifiable information is shared.
            </li>
          </ul>
          <p>
            These services have their own privacy policies, which we encourage
            you to review.
          </p>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 6 ── */}
        <div className="privacy-section" id="your-rights">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and all associated data.</li>
            <li>Export your typing session history and performance data.</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at the email
            address below.
          </p>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 7 ── */}
        <div className="privacy-section" id="changes">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do,
            we will update the "Last updated" date at the top of this page. We
            encourage you to review this policy periodically. Continued use of
            VeloTypeAI after changes constitutes your acceptance of the updated
            policy.
          </p>
        </div>

        <hr className="privacy-divider" />

        {/* ── Section 8 ── */}
        <div className="privacy-section" id="contact">
          <h2>Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or
            your data, please reach out to us at:
          </p>
          <ul>
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@velotypeai.com">privacy@velotypeai.com</a>
            </li>
          </ul>
        </div>

      </div>
    </>
  );
}