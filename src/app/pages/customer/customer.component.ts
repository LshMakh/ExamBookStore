import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Book } from '../../models/book.model';
import { CartStateService } from '../../cart-state.service';
import { BookService } from '../../book.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  standalone:false,
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  books: Book[] = [];
  customerName: string = '';
  quantities: { [key: number]: number } = {};

  constructor(
    private bookService: BookService,
    private cartState: CartStateService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBooks();
    this.cartState.getCustomerName().subscribe(name => {
      this.customerName = name;
    });
  }

  loadBooks() {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        books.forEach(book => {
          this.quantities[book.bookId] = 0;
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'შეცდომა',
          detail: 'წიგნების ჩატვირთვა ვერ მოხერხდა'
        });
      }
    });
  }

  incrementQuantity(bookId: number) {
    const book = this.books.find(b => b.bookId === bookId);
    if (book && this.quantities[bookId] < book.quantity) {
      this.quantities[bookId]++;
    }
  }

  decrementQuantity(bookId: number) {
    if (this.quantities[bookId] > 0) {
      this.quantities[bookId]--;
    }
  }

  addToCart(book: Book) {
    const quantity = this.quantities[book.bookId];
    if (quantity > 0) {
      this.cartState.addToCart(book, quantity);
      this.quantities[book.bookId] = 0; 
      this.messageService.add({
        severity: 'success',
        summary: 'წარმატება',
        detail: 'წიგნი დაემატა კალათაში'
      });
    }
  }

  goToCart() {
    if (!this.customerName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'გაფრთხილება',
        detail: 'გთხოვთ შეიყვანოთ სახელი და გვარი'
      });
      return;
    }
    this.cartState.setCustomerName(this.customerName);
    this.router.navigate(['/cart']);
  }

  isAddToCartDisabled(bookId: number): boolean {
    return this.quantities[bookId] === 0;
  }
}