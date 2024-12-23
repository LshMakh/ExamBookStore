import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, Order, OrderDetail, OrderRequest } from './models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'https://localhost:7228/api';

  constructor(private http: HttpClient) { }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/Book`);
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/Book/${id}`);
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(`${this.apiUrl}/Book`, book);
  }

  updateBook(id: number, book: Book): Observable<string> {
    const updateData = {
      bookId: id,
      title: book.title,
      author: book.author,
      quantity: book.quantity,
      price: book.price
    };
    
    return this.http.put(`${this.apiUrl}/Book/${id}`, updateData, {
      responseType: 'text'
    });
  }

  deleteBook(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/Book/${id}`, {
      responseType: 'text' as const
    });
  }

  createOrder(request: OrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order`, request);
  }

  getPendingOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/Order/pending`);
  }



  confirmOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order/${orderId}/confirm`, {});
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order/${orderId}/cancel`, {});
  }

}