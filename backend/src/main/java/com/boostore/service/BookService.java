package com.boostore.service;

import com.boostore.dto.BookDto;
import com.boostore.entity.Book;

import java.util.List;

public interface BookService {
    List<BookDto> getAllBooks();
    BookDto getBookById(Long id);
    BookDto createBook(BookDto bookDto);
    BookDto updateBook(Long id, BookDto bookDto);
    void deleteBook(Long id);
    List<BookDto> searchBooks(String keyword);
    void updateStock(Long bookId, Integer quantity);
} 