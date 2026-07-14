import os
from process_txt import extract_text, fetch_books, fetch_book_chunck

def test_extract_text():
    """Test the PDF text extraction and TTS conversion"""
    
    # Define the audio directory path
    AUDIO_DIR = '/Users/danieltega/Desktop/work codes/learn_lika_pro/pdf_audio'
    
    # Create the audio directory if it doesn't exist
    os.makedirs(AUDIO_DIR, exist_ok=True)
    print(f"📁 Audio files will be saved to: {AUDIO_DIR}")
    
    # Path to your test PDF file
    pdf_path = "/Users/danieltega/Desktop/work codes/learn_lika_pro/designing_data_intensive.pdf"
    
    # Test with a real PDF file
    try:
        with open(pdf_path, 'rb') as pdf_file:
            book_id = extract_text(pdf_file, AUDIO_DIR)
            print(f"✅ Book processed successfully! Book ID: {book_id}")
            
            # Verify the book was added
            books = fetch_books()
            print(f"📚 Total books in DB: {len(books)}")
            if books:
                for book in books:
                    print(f"  - {book['title']} (ID: {book['id']})")
            
            # Verify chunks were created
            chunks = fetch_book_chunck(book_id)
            print(f"📄 Total chunks created: {len(chunks)}")
            
            # Show first chunk details
            if chunks:
                first_chunk = chunks[0]
                print("\nFirst chunk details:")
                print(f"  ID: {first_chunk['id']}")
                print(f"  Text preview: {first_chunk['text'][:100]}...")
                print(f"  Audio path: {first_chunk['audio']}")
                
                # Check if audio file exists
                if first_chunk.get('audio') and os.path.exists(first_chunk['audio']):
                    file_size = os.path.getsize(first_chunk['audio'])
                    print(f"  Audio file size: {file_size} bytes")
                else:
                    print("  ⚠️ Audio file not found on disk")
            
            # List all audio files created
            print(f"\n📁 Audio files in {AUDIO_DIR}:")
            audio_files = [f for f in os.listdir(AUDIO_DIR) if f.endswith('.wav')]
            for audio_file in sorted(audio_files):
                file_path = os.path.join(AUDIO_DIR, audio_file)
                size = os.path.getsize(file_path)
                print(f"  - {audio_file} ({size} bytes)")
                
    except FileNotFoundError:
        print(f"❌ PDF file not found at: {pdf_path}")
        print("Please provide a valid PDF path.")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_extract_text()