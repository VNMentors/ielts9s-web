"use client";
import React, { useState, useRef, useEffect } from "react";
import styles from "./NotePopover.module.css";

interface Note {
  id: string;
  selectedText: string;
  noteText: string;
  createdAt: string;
}

interface NotePopoverProps {
  position: { x: number; y: number };
  selectedText: string;
  onClose: () => void;
  notes: Note[];
  onSaveNote: (note: Note) => void;
}

export function NotePopover({ position, selectedText, onClose, notes, onSaveNote }: NotePopoverProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (!text.trim()) return;
    onSaveNote({
      id: Date.now().toString(),
      selectedText,
      noteText: text.trim(),
      createdAt: new Date().toLocaleTimeString(),
    });
    setText("");
    onClose();
  };

  return (
    <div
      className={styles.notePopover}
      style={{ top: position.y, left: position.x }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.noteHeader}>
        <span className={styles.noteIcon}>📝</span>
        <span className={styles.noteTitle}>Add Note</span>
        <button className={styles.noteClose} onClick={onClose}>✕</button>
      </div>
      {selectedText && (
        <div className={styles.selectedPreview}>
          &ldquo;{selectedText.slice(0, 60)}{selectedText.length > 60 ? "…" : ""}&rdquo;
        </div>
      )}
      <textarea
        ref={textareaRef}
        className={styles.noteTextarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note here..."
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSave();
          if (e.key === "Escape") onClose();
        }}
      />
      <div className={styles.noteFooter}>
        <span className={styles.noteHint}>Ctrl+Enter to save</span>
        <div className={styles.noteBtns}>
          <button className={styles.noteCancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.noteSaveBtn} onClick={handleSave} disabled={!text.trim()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotesListProps {
  notes: Note[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function NotesList({ notes, onClose, onDelete }: NotesListProps) {
  return (
    <div className={styles.notesListOverlay} onClick={onClose}>
      <div className={styles.notesList} onClick={(e) => e.stopPropagation()}>
        <div className={styles.notesListHeader}>
          <span>📓 My Notes ({notes.length})</span>
          <button className={styles.noteClose} onClick={onClose}>✕</button>
        </div>
        {notes.length === 0 ? (
          <div className={styles.notesEmpty}>No notes yet. Select text in the passage to add a note.</div>
        ) : (
          <div className={styles.notesItems}>
            {notes.map((note) => (
              <div key={note.id} className={styles.noteItem}>
                <div className={styles.noteItemQuote}>&ldquo;{note.selectedText}&rdquo;</div>
                <div className={styles.noteItemText}>{note.noteText}</div>
                <div className={styles.noteItemFooter}>
                  <span className={styles.noteTime}>{note.createdAt}</span>
                  <button className={styles.noteDeleteBtn} onClick={() => onDelete(note.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
