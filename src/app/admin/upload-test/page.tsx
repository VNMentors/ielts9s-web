"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Test } from "@/types";
import styles from "./page.module.css";

const TEMPLATE: Omit<Test, "id"> = {
  title: "Cambridge 18 — Reading Test 1",
  skill: "Reading",
  source: "Cambridge",
  parts: [
    {
      partNumber: 1,
      passageHtml: "<p>Dán nội dung bài đọc HTML vào đây...</p>",
      questions: [
        { id: 1, type: "True/False/Not Given", text: "Câu hỏi 1...", options: [] },
        { id: 2, type: "True/False/Not Given", text: "Câu hỏi 2...", options: [] },
      ],
    },
  ],
  answerKey: { "1": "TRUE", "2": "FALSE" },
  explanations: { "1": "Giải thích câu 1...", "2": "Giải thích câu 2..." },
  createdAt: new Date(),
};

export default function UploadTestPage() {
  const [json, setJson] = useState(JSON.stringify(TEMPLATE, null, 2));
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      setUploading(true);
      setStatus(null);
      const data = JSON.parse(json) as Omit<Test, "id">;
      await addDoc(collection(db, "tests"), { ...data, createdAt: serverTimestamp() });
      setStatus({ type: "success", msg: "✅ Upload thành công! Đề đã có trong Firestore." });
    } catch (e) {
      setStatus({ type: "error", msg: "❌ Lỗi: " + String(e) });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>📋 Upload Đề thi</h1>
      <p className={styles.sub}>Paste JSON của bộ đề vào bên dưới. Cấu trúc theo template mẫu.</p>

      <div className={styles.help}>
        <strong>Cấu trúc JSON:</strong>
        <ul>
          <li><code>skill</code>: "Reading" hoặc "Listening"</li>
          <li><code>source</code>: "Cambridge", "Actual Tests", "Forecast", "IELTS9s"</li>
          <li><code>parts</code>: mảng các part, mỗi part có <code>questions</code></li>
          <li><code>answerKey</code>: <code>{"{ \"1\": \"TRUE\", \"2\": \"B\" }"}</code></li>
          <li><code>explanations</code>: giải thích theo id câu hỏi</li>
        </ul>
      </div>

      <textarea
        className={styles.jsonArea}
        rows={28}
        value={json}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
      />

      <div className={styles.actions}>
        <button className="btn btn-outline" onClick={() => setJson(JSON.stringify(TEMPLATE, null, 2))}>
          Reset template
        </button>
        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Đang upload..." : "🚀 Upload lên Firestore"}
        </button>
      </div>

      {status && (
        <div className={`${styles.status} ${status.type === "success" ? styles.success : styles.error}`}>
          {status.msg}
        </div>
      )}
    </div>
  );
}
