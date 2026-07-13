"""
1. extract text
2. convert to tts save both book and chuncks
3. get book
4. get chunck
"""
from pypdf import PdfReader
from utiils.crud import add_book, get_all_books, add_pdf_chunk, get_book_chunks
from utiils.convert_tts import tts


def fetch_books():
    data = get_all_books()
    return data


def fetch_book_chunck(id):
    data = get_book_chunks(id)
    return data


def extract_text(file, audio_path):
    try:
        reader = PdfReader(file)

        # extract text per page (keep pages separate, not joined into one string)
        pages_text = [page.extract_text() or "" for page in reader.pages]

        # PdfReader has no .title attribute — use metadata, with a fallback
        title = (reader.metadata.title if reader.metadata else None) or "Untitled"

        # add new book to db
        book_id = add_book(title)

        # for each page call the tts function passing that page's text
        counter = 0
        for page_text in pages_text:
            if not page_text.strip():
                counter += 1
                continue  # skip empty pages (e.g. image-only pages)

            new_audio_path = f"{audio_path}/{title}_{counter}"
            path = tts(page_text, new_audio_path)
            add_pdf_chunk(book_id, page_text, path)
            counter += 1

        return book_id

    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise