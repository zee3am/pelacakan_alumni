import "./globals.css";

export const metadata = {
  title: "Alumni Tracker - Sistem Pelacakan Alumni",
  description:
    "Sistem berbasis web untuk melacak dan memverifikasi profil alumni menggunakan pencarian web otomatis dan scoring kecocokan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div className="bg-orbs">
          <div className="bg-orb"></div>
          <div className="bg-orb"></div>
          <div className="bg-orb"></div>
        </div>
        <div className="layout">
          <nav className="navbar">
            <a href="/" className="navbar-brand">
              <span className="brand-icon">🎓</span>
              Alumni Tracker
            </a>
            <div className="navbar-actions">
              <a href="/alumni/new" className="btn btn-primary btn-sm" id="btn-add-alumni">
                + Tambah Alumni
              </a>
            </div>
          </nav>
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
