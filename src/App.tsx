import React, { useState, useReducer, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import bookReducer from './bookReducer';
import './App.css';

interface Book {
  id: number;
  title: string;
  author: string;
  year: string;
}

function App() {
  const [books, dispatch] = useReducer(bookReducer, []);
  const [currentBooks, setCurrentBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 5;

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get<Book[]>(' http://localhost:3000/books');
      dispatch({ type: 'SET_BOOKS', books: response.data });
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  };

  useEffect(() => {
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setCurrentBooks(filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage));
  }, [books, searchTerm, currentPage]);

  const handleAddBook = async () => {
    const title = titleRef.current?.value;
    const author = authorRef.current?.value;
    const year = yearRef.current?.value;
    if (title && author && year) {
      const newBook = { id: Date.now(), title, author, year };
      try {
        const response = await axios.post<Book>('http://localhost:3000/books', newBook);
        dispatch({ type: 'ADD_BOOK', book: response.data });
        titleRef.current.value = '';
        authorRef.current.value = '';
        yearRef.current.value = '';
      } catch (error) {
        console.error('Failed to add book:', error);
      }
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/books/${id}`);
      dispatch({ type: 'DELETE_BOOK', id });
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  };

  const handleEditBook = (id: number) => {
    const book = books.find((book) => book.id === id);
    if (book) {
      titleRef.current!.value = book.title;
      authorRef.current!.value = book.author;
      yearRef.current!.value = book.year;
      handleDeleteBook(id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(books.length / booksPerPage)));
  }, [books.length]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return (
    <div className="App">
      <h1>Book Repository</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddBook();
        }}
      >
        <input ref={titleRef} type="text" placeholder="Title" required />
        <input ref={authorRef} type="text" placeholder="Author" required />
        <input ref={yearRef} type="text" placeholder="Year" required />
        <button type="submit">Add Book</button>
      </form>
      <input type="text" placeholder="Search by title" value={searchTerm} onChange={handleSearch} />
      <div className="book-list">
        {currentBooks.map((book) => (
          <div className="book-card" key={book.id}>
            <h2>{book.title}</h2>
            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Year:</strong> {book.year}</p>
            <div className="button">
              <button onClick={() => handleEditBook(book.id)}>Edit</button>
              <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="page">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={currentPage === Math.ceil(books.length / booksPerPage)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
