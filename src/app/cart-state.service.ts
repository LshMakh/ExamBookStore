import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book } from './models/book.model';

export interface CartItem extends Book {
  selectedQuantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartStateService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private customerName = new BehaviorSubject<string>('');

  constructor() {}

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems.asObservable();
  }

  getCurrentCartItems(): CartItem[] {
    return this.cartItems.getValue();
  }

  addToCart(book: Book, quantity: number): void {
    const currentItems = this.cartItems.getValue();
    const existingItem = currentItems.find(item => item.bookId === book.bookId);

    if (existingItem) {
      existingItem.selectedQuantity += quantity;
      this.cartItems.next([...currentItems]);
    } else {
      const newItem: CartItem = {
        ...book,
        selectedQuantity: quantity
      };
      this.cartItems.next([...currentItems, newItem]);
    }
  }

  removeFromCart(bookId: number): void {
    const currentItems = this.cartItems.getValue();
    this.cartItems.next(currentItems.filter(item => item.bookId !== bookId));
  }

  updateQuantity(bookId: number, quantity: number): void {
    const currentItems = this.cartItems.getValue();
    const item = currentItems.find(item => item.bookId === bookId);
    if (item) {
      item.selectedQuantity = quantity;
      this.cartItems.next([...currentItems]);
    }
  }

  clearCart(): void {
    this.cartItems.next([]);
  }

  setCustomerName(name: string): void {
    this.customerName.next(name);
  }

  getCustomerName(): Observable<string> {
    return this.customerName.asObservable();
  }

  getCurrentCustomerName(): string {
    return this.customerName.getValue();
  }

  getTotalAmount(): number {
    return this.cartItems.getValue().reduce(
      (total, item) => total + (item.price * item.selectedQuantity), 
      0
    );
  }
}