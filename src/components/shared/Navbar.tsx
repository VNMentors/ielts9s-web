"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loginWithGoogle, logout } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/dashboard",  label: "Dashboard" },
  { href: "/practice",   label: "Luyện đề" },
  { href: "/learning",   label: "Khóa học" },
  { href: "/roadmap",    label: "Lộ trình" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogin = async () => {
    await loginWithGoogle();
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <span className={styles.logo9}>9s</span>
          <span className={styles.logoIelts}>IELTS</span>
        </a>

        {/* Desktop Links */}
        <ul className={styles.links}>
          {user && NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`${styles.link} ${pathname === l.href ? styles.active : ""}`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={styles.cta}>
          {!loading && (
            user ? (
              <div className={styles.userRow}>
                <img src={user.photoURL ?? ""} alt="" className={styles.avatar} />
                <button className="btn btn-outline" onClick={handleLogout}>Đăng xuất</button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleLogin}>
                🚀 Học miễn phí
              </button>
            )
          )}
        </div>

        {/* Hamburger */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {user && NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          {!user
            ? <button className="btn btn-primary" onClick={handleLogin}>🚀 Học miễn phí</button>
            : <button className="btn btn-outline" onClick={handleLogout}>Đăng xuất</button>
          }
        </div>
      )}
    </nav>
  );
}
