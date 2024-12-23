export interface Book {
    bookId: number;
    title: string;
    author: string;
    quantity: number;
    price: number;
  }
  
  export interface Order {
    orderId: number;
    customerName: string;
    totalAmount: number;
    status: string;
    orderDetails: OrderDetail[];
  }
  
  export interface OrderDetail {
    orderId: number;
    bookId: number;
    title:string;
    author:string;
    quantity: number;
    price: number;
  }
  
  export interface CartItem {
    bookId: number;
    quantity: number;
  }
  
  export interface OrderRequest {
    customerName: string;
    items: CartItem[];
  }