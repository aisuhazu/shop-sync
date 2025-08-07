import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";

const SupplierContext = createContext();

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error("useSuppliers must be used within a SupplierProvider");
  }
  return context;
};

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Load suppliers from Firebase
  const loadSuppliers = () => {
    setLoading(true);
    try {
      const suppliersCollection = collection(db, "suppliers");

      const unsubscribe = onSnapshot(
        suppliersCollection,
        (snapshot) => {
          const suppliersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSuppliers(suppliersData);
          setLoading(false);
        },
        (error) => {
          console.error("Error loading suppliers:", error);
          toast.error("Failed to load suppliers");
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up suppliers listener:", error);
      toast.error("Failed to load suppliers");
      setLoading(false);
    }
  };

  const loadProductsAndOrders = () => {
    try {
      const productsCollection = collection(db, "products");
      const ordersCollection = collection(db, "orders");

      const unsubscribeProducts = onSnapshot(productsCollection, (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      });

      const unsubscribeOrders = onSnapshot(ordersCollection, (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      });

      return () => {
        unsubscribeProducts();
        unsubscribeOrders();
      };
    } catch (error) {
      console.error("Error loading products and orders:", error);
    }
  };

  useEffect(() => {
    const unsubscribeSuppliers = loadSuppliers();
    const unsubscribeData = loadProductsAndOrders();

    return () => {
      if (unsubscribeSuppliers) unsubscribeSuppliers();
      if (unsubscribeData) unsubscribeData();
    };
  }, []);

  // Calculate supplier statistics
  const getSuppliersWithStats = () => {
    return suppliers.map((supplier) => {
      // Count products for this supplier
      const productsCount = products.filter(
        (product) => product.supplier === supplier.id
      ).length;

      // Find last order for this supplier
      const supplierOrders = orders
        .filter(
          (order) =>
            order.items &&
            order.items.some((item) => {
              const product = products.find((p) => p.id === item.productId);
              return product && product.supplier === supplier.id;
            })
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const lastOrder =
        supplierOrders.length > 0
          ? new Date(supplierOrders[0].createdAt).toLocaleDateString()
          : null;

      return {
        ...supplier,
        productsCount,
        lastOrder,
      };
    });
  };

  // Add supplier to Firebase
  const addSupplier = async (supplierData) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "suppliers"), {
        ...supplierData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const newSupplier = {
        id: docRef.id,
        ...supplierData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSuppliers((prev) => [...prev, newSupplier]);
      toast.success("Supplier added successfully!");
      return newSupplier;
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Failed to add supplier");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update supplier in Firebase
  const updateSupplier = async (id, supplierData) => {
    setLoading(true);
    try {
      const supplierRef = doc(db, "suppliers", id);
      await updateDoc(supplierRef, {
        ...supplierData,
        updatedAt: new Date().toISOString(),
      });

      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === id
            ? {
                ...supplier,
                ...supplierData,
                updatedAt: new Date().toISOString(),
              }
            : supplier
        )
      );

      toast.success("Supplier updated successfully!");
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete supplier from Firebase
  const deleteSupplier = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "suppliers", id));
      setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
      toast.success("Supplier deleted successfully!");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get supplier by ID
  const getSupplierById = (id) => {
    return suppliers.find((supplier) => supplier.id === id);
  };

  // Get active suppliers
  const getActiveSuppliers = () => {
    return suppliers.filter((supplier) => supplier.status === "active");
  };

  // Refresh statistics
  const refreshStats = () => {
    loadProductsAndOrders();
  };

  const value = {
    suppliers: getSuppliersWithStats(),
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getActiveSuppliers,
    refreshStats,
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
};
