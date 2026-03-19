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