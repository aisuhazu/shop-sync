import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";
import { db } from "../services/firebase";
import toast from "react-hot-toast";
import { useSuppliers } from './SupplierContext';

const ProductContext = createContext();

// Product categories
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Kitchen",
  "Office",
  "Clothing",
  "Books",
  "Sports",
  "Health",
  "Home & Garden",
  "Automotive",
  "Other",
];

// Product status types
export const STOCK_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const { suppliers } = useSuppliers();

  // Helper function to get supplier name from ID
  const getSupplierName = (supplierId, suppliersList = suppliers) => {
    if (!supplierId || !suppliersList) return 'Unknown Supplier';
    const supplier = suppliersList.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  // Load categories from Firebase with real-time listener
  const loadCategories = () => {
    try {
      const categoriesCollection = collection(db, "categories");
      
      const unsubscribe = onSnapshot(categoriesCollection, async (snapshot) => {
        if (snapshot.empty) {
          // Initialize default categories if none exist
          console.log('No categories found, initializing defaults...');
          await initializeDefaultCategories();
        } else {
          const categoriesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesData);
        }
      }, (error) => {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up categories listener:", error);
      toast.error("Failed to load categories");
    }
  };

  // Initialize default categories in Firebase
  const initializeDefaultCategories = async () => {
    try {
      const defaultColors = [
        '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
        '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
      ];
      
      const categoriesCollection = collection(db, "categories");
      
      for (let i = 0; i < PRODUCT_CATEGORIES.length; i++) {
        const categoryName = PRODUCT_CATEGORIES[i];
        await addDoc(categoriesCollection, {
          name: categoryName,
          description: `${categoryName} products`,
          color: defaultColors[i % defaultColors.length],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      console.log('Default categories initialized');
    } catch (error) {
      console.error('Error initializing default categories:', error);
    }
  };

  // Load products from Firebase with real-time listener
  const loadProducts = () => {
    setLoading(true);
    try {
      const productsCollection = collection(db, "products");
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        setLoading(false);
      }, (error) => {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
        setLoading(false);
      });
      
      // Return cleanup function
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up products listener:", error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const unsubscribeProducts = loadProducts();
    const unsubscribeCategories = loadCategories();
    
    // Cleanup listeners on unmount
    return () => {
      if (unsubscribeProducts) {
        unsubscribeProducts();
      }
      if (unsubscribeCategories) {
        unsubscribeCategories();
      }
    };
  }, []);

  // Add product to Firebase
  const addProduct = async (productData) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const newProduct = {
        id: docRef.id,
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Note: No need to manually update state since onSnapshot will handle it
      toast.success("Product added successfully!");
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update product in Firebase
  const updateProduct = async (id, productData) => {
    setLoading(true);
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date().toISOString(),
      });

      // Note: No need to manually update state since onSnapshot will handle it
      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete product from Firebase
  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, "products", id));
      // Note: No need to manually update state since onSnapshot will handle it
      toast.success("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Generate unique SKU
  const generateSKU = (category, name) => {
    const categoryCode = category.substring(0, 2).toUpperCase();
    const nameCode = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${categoryCode}-${nameCode}-${timestamp}`;
  };

  // Get stock status
  const getStockStatus = (stock, threshold) => {
    if (stock === 0) return STOCK_STATUS.OUT_OF_STOCK;
    if (stock <= threshold) return STOCK_STATUS.LOW_STOCK;
    return STOCK_STATUS.IN_STOCK;
  };

  // Update stock
  const updateProductStock = async (productId, newStock) => {
    try {
      setLoading(true);
      
      // Update in Firebase
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString()
      });
      
      // Note: No need to manually update state since onSnapshot will handle it
      toast.success(`Stock updated to ${newStock}`);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get products by category
  const getProductsByCategory = (category) => {
    return products.filter((product) => product.category === category);
  };

  // Get low stock products
  const getLowStockProducts = () => {
    return products.filter(
      (product) =>
        getStockStatus(product.stock, product.lowStockThreshold) ===
        STOCK_STATUS.LOW_STOCK
    );
  };

  // Get out of stock products
  const getOutOfStockProducts = () => {
    return products.filter((product) => product.stock === 0);
  };

  // Search products
  const searchProducts = (searchTerm, category = "all") => {
    return products.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  };

  // Add new category to Firebase
  const addCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      // Check if category name already exists
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === categoryData.name.toLowerCase()
      );
      
      if (existingCategory) {
        throw new Error('Category name already exists');
      }
      
      const docRef = await addDoc(collection(db, "categories"), {
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Note: No need to manually update state since onSnapshot will handle it
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update category in Firebase
  const updateCategory = async (categoryId, categoryData) => {
    try {
      setLoading(true);

      // Check if new name conflicts with existing categories (excluding current)
      if (categoryData.name) {
        const existingCategory = categories.find(
          cat => cat.id !== categoryId && 
                 cat.name.toLowerCase() === categoryData.name.toLowerCase()
        );
        
        if (existingCategory) {
          throw new Error('Category name already exists');
        }
      }

      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, {
        ...categoryData,
        updatedAt: new Date().toISOString(),
      });

      // Update products that use this category if name changed
      const oldCategory = categories.find(cat => cat.id === categoryId);
      if (oldCategory && categoryData.name && oldCategory.name !== categoryData.name) {
        const productsToUpdate = products.filter(product => product.category === oldCategory.name);
        
        for (const product of productsToUpdate) {
          const productRef = doc(db, "products", product.id);
          await updateDoc(productRef, {
            category: categoryData.name,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Note: No need to manually update state since onSnapshot will handle it
      return { success: true };
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete category from Firebase
  const deleteCategory = async (categoryId) => {
    try {
      setLoading(true);

      // Check if category has products
      const categoryToDelete = categories.find((cat) => cat.id === categoryId);
      if (categoryToDelete) {
        const productsInCategory = getProductsByCategory(categoryToDelete.name);
        if (productsInCategory.length > 0) {
          throw new Error("Cannot delete category with existing products");
        }
      }

      // Delete from Firebase
      await deleteDoc(doc(db, "categories", categoryId));
      
      // Note: No need to manually update state since onSnapshot will handle it
      return { success: true };
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get products by price range
  const getProductsByPriceRange = (minPrice = 0, maxPrice = Infinity) => {
    return products.filter((product) => {
      const price = parseFloat(product.price);
      return price >= minPrice && price <= maxPrice;
    });
  };

  // Get products by supplier (now uses supplier ID)
  const getProductsBySupplier = (supplierId) => {
    if (!supplierId) return products;
    return products.filter((product) => product.supplier === supplierId);
  };

  // Advanced filtering function
  const getFilteredProducts = (filters = {}) => {
    let filteredProducts = [...products];

    // Apply supplier filter (now uses supplier ID)
    if (filters.supplier) {
      filteredProducts = filteredProducts.filter((product) =>
        product.supplier === filters.supplier
      );
    }

    // Apply search filter
    if (filters.search) {
      filteredProducts = filteredProducts.filter((product) => {
        const searchTerm = filters.search.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Apply category filter
    if (filters.category && filters.category !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === filters.category
      );
    }

    // Apply price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minPrice = filters.minPrice || 0;
      const maxPrice = filters.maxPrice || Infinity;
      filteredProducts = filteredProducts.filter((product) => {
        const price = parseFloat(product.price);
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      const dateField = filters.dateField || "createdAt";
      filteredProducts = filteredProducts.filter((product) => {
        const productDate = new Date(product[dateField]);
        const start = filters.startDate
          ? new Date(filters.startDate)
          : new Date("1900-01-01");
        const end = filters.endDate ? new Date(filters.endDate) : new Date();
    
        return productDate >= start && productDate <= end;
      });
    }

    // Apply stock status filter
    if (filters.stockStatus && filters.stockStatus !== "all") {
      filteredProducts = filteredProducts.filter((product) => {
        const status = getStockStatus(product.stock, product.lowStockThreshold);
        return status === filters.stockStatus;
      });
    }

    return filteredProducts;
  };

  const value = {
    products,
    categories,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getStockStatus,
    generateSKU,
    updateProductStock,
    getLowStockProducts,
    getOutOfStockProducts,
    getProductsBySupplier,
    getFilteredProducts,
    getProductsByCategory,
    getProductsByPriceRange,
    addCategory,
    updateCategory,
    deleteCategory,
    STOCK_STATUS,
    getSupplierName
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

export default ProductContext;
