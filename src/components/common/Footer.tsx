import "./Footer.scss";

const footerLinks = {
  Platform: ["Features", "Crop Health", "Market Intelligence", "Profit Advisor"],
  Resources: ["How It Works", "Farmer Guide", "Support", "FAQ"],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <div className="footer__logo">🌾</div>

          <h2>AgriSmart</h2>

          <p>
            Helping farmers make smarter decisions with
            technology, data, and intelligent insights.
          </p>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div className="footer__column" key={title}>
            <h3>{title}</h3>

            {links.map((link) => (
              <a href="#" key={link}>
                {link}
              </a>
            ))}
          </div>
        ))}

        <div className="footer__column">
          <h3>Connect</h3>

          <a href="#">Contact Us</a>
          <a href="#">Facebook</a>
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© 2026 AgriSmart. All rights reserved.</span>

        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}