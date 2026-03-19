import styles from "./Footer.module.css";

const LINKS = {
  "Luyện tập": [
    { href: "/practice?skill=Reading", label: "Reading" },
    { href: "/practice?skill=Listening", label: "Listening" },
    { href: "/history", label: "Lịch sử làm bài" },
  ],
  "Học tập": [
    { href: "/learning", label: "Khóa học Video" },
    { href: "/roadmap", label: "Lộ trình học" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  "IELTS9s": [
    { href: "/#features", label: "Tính năng" },
    { href: "/#roadmap", label: "Về chúng tôi" },
    { href: "/profile", label: "Hồ sơ" },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <a href="/" className={styles.logo}>
            <span className={styles.logo9}>9s</span>
            <span className={styles.logoIelts}>IELTS</span>
          </a>
          <p className={styles.tagline}>
            Chinh phục Band 9 không còn xa.
            <br />Luyện thông minh hơn — không phải nhiều hơn.
          </p>
          <div className={styles.socials}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#0a0f0a" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            </a>
          </div>
        </div>

        {/* Nav Columns */}
        {Object.entries(LINKS).map(([group, items]) => (
          <div key={group} className={styles.col}>
            <h4 className={styles.colTitle}>{group}</h4>
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={styles.colLink}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} IELTS9s. Được xây dựng với ❤️ tại Việt Nam.</p>
        <p>Thay đổi cuộc sống của bạn bằng IELTS.</p>
      </div>
    </footer>
  );
}
