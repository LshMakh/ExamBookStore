import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Book, Order } from '../../models/book.model';
import { BookService } from '../../book.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  standalone: false,
  styleUrls: ['./manager.component.css'],
})
export class ManagerComponent implements OnInit {
  @ViewChild('dt') table!: Table;

  books: Book[] = [];
  orders: Order[] = [];
  displayDialog: boolean = false;
  editMode: boolean = false;
  bookForm!: FormGroup;
  selectedBook: Book | null = null;
  expandedRows: { [key: number]: boolean } = {};
  filteredBooks: Book[] = [];
  filters = {
    title: '',
    author: '',
    quantity: '',
    price: '',
  };

  constructor(
    private bookService: BookService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  private initializeForm() {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required]],
      author: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.loadBooks();
    this.loadPendingOrders();
  }

  updateFormFields() {
    if (this.editMode) {
      this.bookForm.get('quantity')?.enable();
    } else {
      this.bookForm.get('quantity')?.disable();
    }
  }

  loadPendingOrders() {
    this.bookService.getPendingOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        console.log(orders);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'შეცდომა',
          detail: 'შეკვეთების ჩატვირთვა ვერ მოხერხდა',
        });
      },
    });
  }

  confirmOrder(orderId: number) {
    this.bookService.confirmOrder(orderId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'წარმატება',
          detail: 'შეკვეთა დადასტურდა',
        });
        this.loadPendingOrders();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'შეცდომა',
          detail: 'შეკვეთის დადასტურება ვერ მოხერხდა',
        });
      },
    });
  }

  cancelOrder(orderId: number) {
    this.bookService.cancelOrder(orderId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'წარმატება',
          detail: 'შეკვეთა გაუქმდა',
        });
        this.loadPendingOrders();
        this.loadBooks();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'შეცდომა',
          detail: 'შეკვეთის გაუქმება ვერ მოხერხდა',
        });
      },
    });
  }

  loadBooks() {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = books;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'შეცდომა',
          detail: 'წიგნების ჩატვირთვა ვერ მოხერხდა',
        });
      },
    });
  }

  onTitleFilter(event: Event) {
    this.filters.title = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  onAuthorFilter(event: Event) {
    this.filters.author = (
      event.target as HTMLInputElement
    ).value.toLowerCase();
    this.applyFilters();
  }

  onQuantityFilter(event: Event) {
    this.filters.quantity = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onPriceFilter(event: Event) {
    this.filters.price = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredBooks = this.books.filter((book) => {
      let matchesTitle = true;
      let matchesAuthor = true;
      let matchesQuantity = true;
      let matchesPrice = true;

      if (this.filters.title) {
        matchesTitle = book.title.toLowerCase().includes(this.filters.title);
      }

      if (this.filters.author) {
        matchesAuthor = book.author.toLowerCase().includes(this.filters.author);
      }

      if (this.filters.quantity) {
        matchesQuantity = book.quantity
          .toString()
          .includes(this.filters.quantity);
      }

      if (this.filters.price) {
        matchesPrice = book.price.toString().includes(this.filters.price);
      }

      return matchesTitle && matchesAuthor && matchesQuantity && matchesPrice;
    });
  }
  showAddDialog() {
    this.editMode = false;
    this.selectedBook = null;
    this.bookForm.reset({
      quantity: 0,
      price: 0,
    });
    this.displayDialog = true;
    this.updateFormFields();
  }

  showEditDialog(book: Book) {
    console.log('Editing book:', book);
    this.editMode = true;
    this.selectedBook = { ...book };

    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      quantity: book.quantity,
      price: book.price,
    });

    this.bookForm.get('quantity')?.disable();

    this.displayDialog = true;
  }

  onSubmit() {
    if (!this.bookForm.valid) {
      return;
    }

    const formValue = this.bookForm.getRawValue();
    console.log('Form value:', formValue);

    if (this.editMode && this.selectedBook) {
      const updatedBook: Book = {
        bookId: this.selectedBook.bookId,
        title: formValue.title,
        author: formValue.author,
        quantity: formValue.quantity,
        price: formValue.price,
      };

      console.log('Updating book:', updatedBook);

      this.bookService
        .updateBook(this.selectedBook.bookId, updatedBook)
        .subscribe({
          next: (response) => {
            console.log('Update response:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'წარმატება',
              detail: 'წიგნი განახლდა',
            });
            this.loadBooks();
            this.closeDialog();
          },
          error: (error) => {
            console.error('Update error:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'შეცდომა',
              detail: 'წიგნის განახლება ვერ მოხერხდა',
            });
          },
        });
    } else {
      const newBook: Book = {
        bookId: 0,
        title: formValue.title,
        author: formValue.author,
        quantity: formValue.quantity,
        price: formValue.price,
      };

      this.bookService.addBook(newBook).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'წარმატება',
            detail: 'წიგნი დაემატა',
          });
          this.loadBooks();
          this.closeDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'შეცდომა',
            detail: 'წიგნის დამატება ვერ მოხერხდა',
          });
        },
      });
    }
  }

  deleteBook() {
    if (this.selectedBook) {
      this.bookService.deleteBook(this.selectedBook.bookId).subscribe({
        next: (response) => {
          if (response === 'SUCCESS') {
            this.messageService.add({
              severity: 'success',
              summary: 'წარმატება',
              detail: 'წიგნი წაიშალა',
            });
            this.loadBooks();
            this.closeDialog();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'შეცდომა',
              detail: 'წიგნის წაშლა ვერ მოხერხდა',
            });
          }
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'შეცდომა',
            detail: 'წიგნის წაშლა ვერ მოხერხდა',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'შეცდომა',
        detail: 'წიგნი ვერ მოიძებნა',
      });
    }
  }
  incrementQuantity() {
    const currentQuantity = this.bookForm.get('quantity')?.value || 0;
    this.bookForm.patchValue({ quantity: currentQuantity + 1 });
  }

  decrementQuantity() {
    const currentQuantity = this.bookForm.get('quantity')?.value || 0;
    if (currentQuantity > 0) {
      this.bookForm.patchValue({ quantity: currentQuantity - 1 });
    }
  }

  closeDialog() {
    this.displayDialog = false;
    this.editMode = false;
    this.selectedBook = null;
    this.initializeForm();
  }
}
