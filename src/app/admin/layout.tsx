import Navbar from "@/components/shared/Navbar";
import styles from "./layout.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className={styles.adminLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>⚙️ Admin</h3>
          <nav className={styles.sidebarNav}>
            <a href="/admin/upload-test" className={styles.navItem}>📋 Upload Đề thi (JSON)</a>
            <a href="/admin/upload-video" className={styles.navItem}>🎥 Upload Video</a>
          </nav>
          <div className={styles.backLink}>
            <a href="/dashboard">← Về Dashboard</a>
          </div>
        </aside>
        {/* Content */}
        <main className={styles.content}>{children}</main>
      </div>
    </>
  );
}
