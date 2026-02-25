const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');

  .security-page {
    font-family: 'Roboto Mono', 'Courier New', monospace;
    background-color: #2c2e31;
    color: #d1d0c5;
    min-height: 100vh;
    padding: 40px 60px;
    box-sizing: border-box;
    line-height: 1.7;
    font-size: 15px;
  }

  /* Header */
  .security-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
  }
  .security-logo {
    width: 44px;
    height: 44px;
  }
  .security-header-brand {
    font-size: 22px;
    font-weight: 400;
    color: #d1d0c5;
  }
  .security-header-brand span {
    color: #e2b714;
    font-weight: 700;
  }

  /* Intro */
  .security-intro {
    color: #d1d0c5;
    margin-bottom: 36px;
  }
  .security-intro a {
    color: #d1d0c5;
    text-decoration: underline;
  }

  /* TOC */
  .security-toc-title {
    color: #d1d0c5;
    margin-bottom: 10px;
    font-weight: 400;
  }
  .security-toc ul {
    list-style: disc;
    padding-left: 28px;
    margin-bottom: 48px;
  }
  .security-toc ul li {
    margin-bottom: 4px;
  }
  .security-toc ul li a {
    color: #e2b714;
    text-decoration: underline;
    text-decoration-color: rgba(226,183,20,0.5);
    transition: color 0.15s;
  }
  .security-toc ul li a:hover {
    color: #f0d050;
  }

  /* Sections */
  .security-section {
    margin-bottom: 48px;
  }
  .security-section h2 {
    font-family: 'Roboto Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    color: #e2b714;
    margin-bottom: 20px;
    margin-top: 0;
  }
  .security-section p {
    color: #d1d0c5;
    margin-bottom: 16px;
  }
  .security-section a {
    color: #e2b714;
    text-decoration: underline;
    text-decoration-color: rgba(226,183,20,0.45);
  }
  .security-section a:hover {
    color: #f0d050;
  }
  .security-section ul {
    list-style: disc;
    padding-left: 28px;
    margin-top: 12px;
    margin-bottom: 12px;
  }
  .security-section ul li {
    margin-bottom: 6px;
    color: #d1d0c5;
  }

  /* Divider */
  .security-divider {
    border: none;
    border-top: 1px solid #3e4044;
    margin: 0 0 48px 0;
  }

  @media (max-width: 600px) {
    .security-page { padding: 24px 20px; font-size: 13px; }
    .security-section h2 { font-size: 18px; }
  }
`;

function Security() {
  return (
    <>
      <style>{styles}</style>

      <div className="security-page">

        {/* Header */}
        <div className="security-header">
          <svg
            className="security-logo"
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

          <div className="security-header-brand">
            {/* monkey see&nbsp; */}
            <span>VeloTypeAI</span>&nbsp;
            Security Policy
          </div>
        </div>

        {/* Intro */}
        <p className="security-intro">
          We take the security and integrity of Monkeytype very seriously. If
          you have found a vulnerability, please report it{" "}
          <a href="mailto:security@monkeytype.com">ASAP</a> so we can quickly
          remediate the issue.
        </p>

        {/* Table of Contents */}
        <div className="security-toc">
          <p className="security-toc-title">Table of Contents</p>
          <ul>
            <li><a href="#disclose">How to Disclose a Vulnerability</a></li>
            <li><a href="#guidelines">Submission Guidelines</a></li>
          </ul>
        </div>

        <hr className="security-divider" />

        {/* Section 1 */}
        <div className="security-section" id="disclose">
          <h2>How to Disclose a Vulnerability</h2>
          <p>
            For vulnerabilities that impact the confidentiality, integrity, and
            availability of Monkeytype services, please send your disclosure via{" "}
            <a href="mailto:security@monkeytype.com">email</a>. For non-security
            related platform bugs, follow the bug submission{" "}
            <a
              href="https://github.com/monkeytypegame/monkeytype/issues"
              target="_blank"
              rel="noreferrer"
            >
              guidelines
            </a>
            . Include as much detail as possible to ensure reproducibility. At a
            minimum, vulnerability disclosures should include:
          </p>
          <ul>
            <li>Vulnerability Description</li>
            <li>Proof of Concept</li>
            <li>Impact</li>
            <li>Screenshots or Proof</li>
          </ul>
        </div>

        <hr className="security-divider" />

        {/* Section 2 */}
        <div className="security-section" id="guidelines">
          <h2>Submission Guidelines</h2>
          <p>
            Do not engage in activities that might cause a denial of service
            condition, create significant strains on critical resources, or
            negatively impact users of the site outside of test accounts.
          </p>
        </div>

      </div>
    </>
  );
}

export default Security;