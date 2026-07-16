import sqlite3
from typing import List, Dict, Optional

DB_NAME = "books.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# ---------------------------------------------------
# 1. Create Database Structure
# ---------------------------------------------------
def create_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pdf_chunk (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            audio TEXT,
            FOREIGN KEY(book_id) REFERENCES book(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()


# ---------------------------------------------------
# 2. Add Book
# ---------------------------------------------------
def add_book(title: str) -> int:
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO book (title) VALUES (?)", (title,))
        book_id = cursor.lastrowid
        conn.commit()
        return book_id
    finally:
        conn.close()


# ---------------------------------------------------
# 2. Add PDF Chunk
# ---------------------------------------------------
def add_pdf_chunk(book_id: int, text: str, audio: Optional[str] = None) -> int:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO pdf_chunk (book_id, text, audio)
        VALUES (?, ?, ?)
        """,
        (book_id, text, audio)
    )

    chunk_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return chunk_id


# ---------------------------------------------------
# 3. Get All Books
# ---------------------------------------------------
def get_all_books() -> List[Dict]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, title
        FROM book
        ORDER BY id ASC
    """)

    books = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return books


# ---------------------------------------------------
# 4. Get All Chunks For A Book
# ---------------------------------------------------
def get_book_chunks(book_id: int) -> List[Dict]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, book_id, text, audio
        FROM pdf_chunk
        WHERE book_id = ?
        ORDER BY id ASC
    """, (book_id,))

    chunks = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return chunks


# ---------------------------------------------------
# Example Usage
# ---------------------------------------------------
if __name__ == "__main__":
    create_database()

    book_id = add_book("Python Basics")

    add_pdf_chunk(book_id, "Chapter 1 text", "chapter1.mp3")
    add_pdf_chunk(book_id, "Chapter 2 text", "chapter2.mp3")

    print(get_all_books())
    print(get_book_chunks(book_id))