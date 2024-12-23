import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CartStateService, CartItem } from '../../cart-state.service';
import { BookService } from '../../book.service';
import { OrderRequest } from '../../models/book.model'

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  customerName: string = '';
  totalAmount: number = 0;

  constructor(
    private cartState: CartStateService,
    private bookService: BookService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartState.getCartItems().subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });

    this.cartState.getCustomerName().subscribe(name => {
      this.customerName = name;
    });
  }

  calculateTotal() {
    this.totalAmount = this.cartItems.reduce(
      (sum, item) => sum + (item.price * item.selectedQuantity),
      0
    );
  }

  incrementQuantity(item: CartItem) {
    if (item.selectedQuantity < item.quantity) {
      this.cartState.updateQuantity(item.bookId, item.selectedQuantity + 1);
    }
  }

  decrementQuantity(item: CartItem) {
    if (item.selectedQuantity > 1) {
      this.cartState.updateQuantity(item.bookId, item.selectedQuantity - 1);
    }
  }

  removeItem(bookId: number) {
    this.cartState.removeFromCart(bookId);
  }

  placeOrder() {
    if (!this.customerName.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'შეცდომა',
        detail: 'გთხოვთ შეიყვანოთ სახელი და გვარი'
      });
      return;
    }

    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'შეცდომა',
        detail: 'კალათა ცარიელია'
      });
      return;
    }

    const orderRequest: OrderRequest = {
      customerName: this.customerName,
      items: this.cartItems.map(item => ({
        bookId: item.bookId,
        quantity: item.selectedQuantity
      }))
    };

    this.bookService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'წარმატება',
          detail: 'შეკვეთა წარმატებით გაფორმდა'
        });
        this.cartState.clearCart();
        this.router.navigate(['/customer']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'შეცდომა',
          detail: 'შეკვეთის გაფორმება ვერ მოხერხდა'
        });
      }
    });
  }

  cancelOrder() {
    this.cartState.clearCart();
    this.router.navigate(['/customer']);
  }
}