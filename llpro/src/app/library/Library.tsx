import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { UploadPdf } from "./UploadPdf";
import api from "../utils/api"
import ReadingTab from "./ReadingTab"

interface Book {
  book_id: number;
  title: string;
  image_url: string;
}

export interface Page {
  page_number: number;
  text: string;
  audio_url: string[];
  video_url: string[];
}

export interface BookContent {
  book_id: number;
  title: string;
  pages: Page[];
  test?: object;
}

// 🔧 Toggle this off once your backend is ready
const USE_DUMMY_DATA = true;

const DUMMY_BOOKS: Book[] = [
  {
    book_id: 1,
    title: 'The Little Prince',
    image_url: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
  },
  {
    book_id: 2,
    title: 'Alice in Wonderland',
    image_url: 'https://covers.openlibrary.org/b/id/8235116-L.jpg',
  },
  {
    book_id: 3,
    title: 'Charlotte\'s Web',
    image_url: 'https://covers.openlibrary.org/b/id/8236234-L.jpg',
  },
  {
    book_id: 4,
    title: 'The Jungle Book',
    image_url: 'https://covers.openlibrary.org/b/id/8236935-L.jpg',
  },
];

const DUMMY_BOOK_CONTENT: Record<number, BookContent> = {
  1: {
    book_id: 1,
    content: 'Once upon a time there was a little prince who lived on a tiny planet...',
    audio_url: 'https://example.com/audio/little-prince.mp3',
    test: { questions: [{ q: 'Where did the prince live?', a: 'A tiny planet' }] },
    video_url: 'https://example.com/video/little-prince.mp4',
  },
  2: {
    book_id: 2,
    content: 'Alice was beginning to get very tired of sitting by her sister on the bank...',
    audio_url: 'https://example.com/audio/alice.mp3',
    test: { questions: [{ q: 'What did Alice fall down?', a: 'A rabbit hole' }] },
    video_url: 'https://example.com/video/alice.mp4',
  },
  3: {
    book_id: 3,
    content: 'Where\'s Papa going with that ax? said Fern to her mother...',
    audio_url: 'https://example.com/audio/charlottes-web.mp3',
    test: { questions: [{ q: 'What animal is Charlotte?', a: 'A spider' }] },
    video_url: 'https://example.com/video/charlottes-web.mp4',
  },
  4: {
    book_id: 4,
    content: 'Mowgli was raised by wolves in the jungles of India...',
    audio_url: 'https://example.com/audio/jungle-book.mp3',
    test: { questions: [{ q: 'Who raised Mowgli?', a: 'Wolves' }] },
    video_url: 'https://example.com/video/jungle-book.mp4',
  },
};

export default function Library() {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookData, setBookData] = useState<BookContent | null>(null);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get_books();
  }, []);

  // get all books
  const get_books = async () => {
    setLoadingBooks(true);
    setError(null);

    if (USE_DUMMY_DATA) {
      // simulate network delay
      setTimeout(() => {
        setBooks(DUMMY_BOOKS);
        setLoadingBooks(false);
      }, 500);
      return;
    }

    try {
      const res = await api.get<Book[]>('/books');
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load books');
    } finally {
      setLoadingBooks(false);
    }
  };

  // get book data
  const get_book_content = async (book_id: number) => {
    setLoadingContent(true);
    setError(null);

    if (USE_DUMMY_DATA) {
      setTimeout(() => {
        setBookData(DUMMY_BOOK_CONTENT[book_id] ?? null);
        setLoadingContent(false);
      }, 500);
      return;
    }

    try {
      const res = await api.get<BookContent>(`/book_content/${book_id}`);
      setBookData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load book content');
    } finally {
      setLoadingContent(false);
    }
  };

  // If a book is selected and loaded, show the reading tab
  if (bookData) {
    return (
      <ReadingTab
        bookData={bookData}
        onBack={() => setBookData(null)}
      />
    );
  }

  if(!book){
    return(
      <UploadPdf onUploadComplete={() => get_books()} />
    )
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Library</Text>

      {loadingBooks && <ActivityIndicator size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={books}
        keyExtractor={(item) => item.book_id.toString()}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookCard}
            onPress={() => get_book_content(item.book_id)}
            disabled={loadingContent}
          >
            <Image source={{ uri: item.image_url }} style={styles.bookImage} />
            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {loadingContent && (
              <ActivityIndicator style={StyleSheet.absoluteFill} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
  bookCard: {
    flex: 1,
    margin: 6,
    alignItems: 'center',
  },
  bookImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  bookTitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
});