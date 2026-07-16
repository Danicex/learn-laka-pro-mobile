# process_txt.py
from pypdf import PdfReader
from process.utils.crud import add_book, get_all_books, add_pdf_chunk, get_book_chunks, create_database
from process.utils.convert_tts import tts
import os

create_database()

def fetch_books():
    data = get_all_books()
    print(data)

def fetch_book_chunck(id):
    data = get_book_chunks(id)
    print(data)

def extract_text(file, audio_path):
    try:
        reader = PdfReader(file)
        
        # extract text per page (keep pages separate, not joined into one string)
        pages_text = [page.extract_text() or "" for page in reader.pages]
        
        # Get title from metadata, with a fallback
        title = (reader.metadata.title if reader.metadata else None) or "Untitled"
        
        # Clean title for filename
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        
        # add new book to db
        book_id = add_book(title)
        print(f"📚 Added book: '{title}' (ID: {book_id})")
        
        # Process each page
        chunk_counter = 0
        for page_idx, page_text in enumerate(pages_text):
            if not page_text.strip():
                continue  # skip empty pages
            
            try:
                # Create a unique filename for each chunk
                chunk_filename = f"{safe_title}_page_{page_idx + 1}"
                chunk_audio_path = os.path.join(audio_path, chunk_filename)
                
                # Convert text to speech
                audio_file = tts(page_text, chunk_audio_path)
                print(f"✅ Processed page {page_idx + 1}: {audio_file}")
                print(f"✅ page text {page_text}")

                
                # Save to database
                add_pdf_chunk(book_id, page_text, audio_file)
                chunk_counter += 1
                
            except Exception as e:
                print(f"⚠️ Error processing page {page_idx + 1}: {e}")
                # Continue with next page instead of failing completely
                continue
        
        print(f"✅ Book processed successfully! {chunk_counter} chunks created.")
        return book_id

    except Exception as e:
        print(f"❌ Error processing PDF: {e}")
        raise
    

if __name__ == "__main__":
    # AUDIO_FOLDER = "/home/tegabytes/Documents/learn-laka-pro-mobile/audio_files"
    # PDF_SAMPLE = "/home/tegabytes/Documents/learn-laka-pro-mobile/designing_data_intensive.pdf"
    # extract_text(PDF_SAMPLE, AUDIO_FOLDER)
    fetch_books()
    fetch_book_chunck(1)