package com.boostore.service.impl;

import com.boostore.dto.BookDto;
import com.boostore.entity.Book;
import com.boostore.repository.BookRepository;
import com.boostore.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;

    @Override
    public List<BookDto> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BookDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("书籍不存在"));
        return convertToDto(book);
    }

    @Override
    public BookDto createBook(BookDto bookDto) {
        if (bookRepository.existsByIsbn(bookDto.getIsbn())) {
            throw new RuntimeException("ISBN已存在");
        }

        Book book = convertToEntity(bookDto);
        Book savedBook = bookRepository.save(book);
        return convertToDto(savedBook);
    }

    @Override
    public BookDto updateBook(Long id, BookDto bookDto) {
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("书籍不存在"));

        // 检查ISBN是否被其他书籍使用
        if (!existingBook.getIsbn().equals(bookDto.getIsbn()) && 
            bookRepository.existsByIsbn(bookDto.getIsbn())) {
            throw new RuntimeException("ISBN已存在");
        }

        existingBook.setTitle(bookDto.getTitle());
        existingBook.setAuthor(bookDto.getAuthor());
        existingBook.setIsbn(bookDto.getIsbn());
        existingBook.setDescription(bookDto.getDescription());
        existingBook.setCoverImage(bookDto.getCoverImage());
        existingBook.setPrice(bookDto.getPrice());
        existingBook.setStock(bookDto.getStock());
        existingBook.setPublisher(bookDto.getPublisher());

        Book savedBook = bookRepository.save(existingBook);
        return convertToDto(savedBook);
    }

    @Override
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("书籍不存在");
        }
        bookRepository.deleteById(id);
    }

    @Override
    public List<BookDto> searchBooks(String keyword) {
        return bookRepository.searchBooks(keyword).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void updateStock(Long bookId, Integer quantity) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("书籍不存在"));
        
        int newStock = book.getStock() - quantity;
        if (newStock < 0) {
            throw new RuntimeException("库存不足");
        }
        
        book.setStock(newStock);
        bookRepository.save(book);
    }

    private BookDto convertToDto(Book book) {
        BookDto dto = new BookDto();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setIsbn(book.getIsbn());
        dto.setDescription(book.getDescription());
        dto.setCoverImage(book.getCoverImage());
        dto.setPrice(book.getPrice());
        dto.setStock(book.getStock());
        dto.setPublisher(book.getPublisher());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        return dto;
    }

    private Book convertToEntity(BookDto dto) {
        Book book = new Book();
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setDescription(dto.getDescription());
        book.setCoverImage(dto.getCoverImage());
        book.setPrice(dto.getPrice());
        book.setStock(dto.getStock());
        book.setPublisher(dto.getPublisher());
        return book;
    }
} 