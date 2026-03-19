"use client";
import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import styles from "./page.module.css";

const LEVELS = ["novice", "scout", "knight", "master"] as const;
const LEVEL_LABELS = { novice: "🌱 Root", scout: "🌿 Trunk", knight: "🌸 Bud", master: "🌳 Bloom" };

export default function UploadVideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [level, setLevel] = useState<typeof LEVELS[number]>("novice");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file || !title.trim()) return setStatus({ type: "error", msg: "❌ Vui lòng nhập tiêu đề và chọn file video." });
    setUploading(true);
    setStatus(null);
    setProgress(0);

    const storageRef = ref(storage, `lessons/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { setStatus({ type: "error", msg: "❌ " + err.message }); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        const duration = await getVideoDuration(file);
        await addDoc(collection(db, "lessons"), {
          title, description: desc, level, videoUrl: url,
          duration, order: 0, createdAt: serverTimestamp()
        });
        setStatus({ type: "success", msg: `✅ Upload "${title}" thành công!` });
        setUploading(false);
        setProgress(0);
        setFile(null);
        setTitle(""); setDesc("");
      }
    );
  };

  const getVideoDuration = (f: File): Promise<number> =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => { resolve(Math.round(video.duration)); URL.revokeObjectURL(video.src); };
      video.src = URL.createObjectURL(f);
    });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>🎥 Upload Video</h1>
      <p className={styles.sub}>Upload video bài giảng lên Firebase Storage, tự động lưu vào Firestore.</p>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Tiêu đề video *</label>
          <input className={styles.input} placeholder="VD: Cách làm True/False/Not Given" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Mô tả ngắn</label>
          <textarea className={styles.textarea} rows={3} placeholder="Học gì trong video này..." value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Level</label>
          <div className={styles.levelPicker}>
            {LEVELS.map((l) => (
              <button key={l}
                className={`${styles.levelBtn} ${level === l ? styles.levelActive : ""}`}
                onClick={() => setLevel(l)}>
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>File video *</label>
          <div className={styles.fileDrop}>
            <input type="file" accept="video/*" id="videoFile" className={styles.fileInput} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <label htmlFor="videoFile" className={styles.fileLabel}>
              {file ? `✅ ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` : "📁 Nhấn để chọn file video"}
            </label>
          </div>
        </div>
      </div>

      {uploading && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.progressText}>Đang upload... {progress}%</p>
        </div>
      )}

      <button className="btn btn-primary" onClick={handleUpload} disabled={uploading || !file || !title}>
        {uploading ? `Đang upload ${progress}%...` : "🚀 Upload Video"}
      </button>

      {status && (
        <div className={`${styles.status} ${status.type === "success" ? styles.success : styles.error}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
