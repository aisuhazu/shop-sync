import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import toast from 'react-hot-toast';

const OrderContext = createContext();

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load orders from Firebase
  const loadOrders = async () => {
    setLoading(true);
    try {
      const ordersCollection = collection(db, 'orders');
      const ordersSnapshot = await getDocs(ordersCollection);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Add order to Firebase
  const addOrder = async (orderData) => {
    setLoading(true);
    try {
      const totals = calculateOrderTotals(orderData.items);
      const orderWithTotals = {
        ...orderData,
        ...totals,
        date: new Date().toISOString().split('T')[0],
        status: ORDER_STATUS.PENDING,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderWithTotals);
      const newOrder = { id: docRef.id, ...orderWithTotals };
      
      setOrders(prev => [...prev, newOrder]);
      toast.success('Order created successfully!');
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      toast.error('Failed to create order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update order in Firebase
  const updateOrder = async (id, orderData) => {
    setLoading(true);
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, {
        ...orderData,
        updatedAt: new Date().toISOString()
      });
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { ...order, ...orderData, updatedAt: new Date().toISOString() }
          : order
      ));
      
      toast.success('Order updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete order from Firebase
  const deleteOrder = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'orders', id));
      setOrders(prev => prev.filter(order => order.id !== id));
      toast.success('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get order by ID
  const getOrderById = (id) => {
    return orders.find(order => order.id === id);
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Calculate order totals
  const calculateOrderTotals = (items, taxRate = 0.08, shippingCost = 10.00) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax + shippingCost;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      shipping: shippingCost,
      total: parseFloat(total.toFixed(2))
    };
  };

  // Add this function after the deleteOrder function (around line 110)
  
  // Update order status in Firebase
  const updateOrderStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const orderRef = doc(db, 'orders', id);
      const order = orders.find(o => o.id === id);
      
      console.log('Updating order:', order); // Debug log
      
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // If order is being completed, update product stock
      if (newStatus === 'completed' && order && order.items) {
        console.log('Processing order items:', order.items); // Debug log
        
        for (const item of order.items) {
          // Handle both old (id) and new (productId) data structures
          const productId = item.productId || item.id;
          
          if (!productId) {
            console.warn('No product ID found for item:', item);
            continue;
          }
          
          console.log('Updating stock for product:', productId, 'quantity:', item.quantity); // Debug log
          
          const productRef = doc(db, 'products', productId);
          const productSnapshot = await getDoc(productRef);
          
          if (productSnapshot.exists()) {
            const currentStock = productSnapshot.data().stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            
            console.log('Stock update:', { productId, currentStock, newStock }); // Debug log
            
            await updateDoc(productRef, {
              stock: newStock,
              updatedAt: new Date().toISOString()
            });
          } else {
            console.warn('Product not found:', productId);
          }
        }
      }
      
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    orders,
    loading,
    addOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
    calculateOrderTotals,
    ORDER_STATUS
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};