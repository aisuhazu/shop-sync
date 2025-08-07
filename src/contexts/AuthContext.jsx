import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "../services/firebase";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Define available roles and permissions
const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
};

const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageUsers: true,
    canManageInventory: true,
    canManageSuppliers: true,
    canManageOrders: true,
    canViewReports: true,
    canManageSettings: true,
    canDeleteItems: true,
  },
  [ROLES.MANAGER]: {
    canManageUsers: false,
    canManageInventory: true,
    canManageSuppliers: true,
    canManageOrders: true,
    canViewReports: true,
    canManageSettings: false,
    canDeleteItems: true,
  },
  [ROLES.STAFF]: {
    canManageUsers: false,
    canManageInventory: true,
    canManageSuppliers: false,
    canManageOrders: true,
    canViewReports: false,
    canManageSettings: false,
    canDeleteItems: false,
  },
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  // Get role and permissions (using localStorage for now to avoid Firestore issues)
  const getUserRoleAndPermissions = (user) => {
    // For now, determine role based on email or use localStorage
    let role = ROLES.STAFF; // Default

    // Check localStorage first
    const storedRole = localStorage.getItem(`userRole_${user.uid}`);
    if (storedRole && Object.values(ROLES).includes(storedRole)) {
      role = storedRole;
    } else {
      // Simple role assignment based on email (can customize this)
      if (user.email.includes("admin")) {
        role = ROLES.ADMIN;
      } else if (user.email.includes("manager")) {
        role = ROLES.MANAGER;
      }

      // Store in localStorage
      localStorage.setItem(`userRole_${user.uid}`, role);
    }

    const permissions = PERMISSIONS[role] || PERMISSIONS[ROLES.STAFF];
    return { role, permissions };
  };

  // Simplified signup function
  const signup = async (email, password, displayName, role = ROLES.STAFF) => {
    try {
      console.log("Starting signup with role:", role);
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User created:", user.uid);

      await updateProfile(user, { displayName });
      console.log("Profile updated");

      // Store role in localStorage for now
      localStorage.setItem(`userRole_${user.uid}`, role);

      // Set role and permissions
      setUserRole(role);
      setUserPermissions(PERMISSIONS[role] || PERMISSIONS[ROLES.STAFF]);

      toast.success("Account created successfully!");
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // Simplified signin function
  const signin = async (email, password) => {
    try {
      console.log("Starting signin...");
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", user.uid);

      // Get role and permissions
      const { role, permissions } = getUserRoleAndPermissions(user);
      setUserRole(role);
      setUserPermissions(permissions);

      toast.success("Signed in successfully!");
      return user;
    } catch (error) {
      console.error("Signin error:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // Update user role (admin only)
  const updateUserRole = async (userId, newRole) => {
    try {
      if (!userPermissions.canManageUsers) {
        throw new Error("Insufficient permissions to update user roles");
      }

      // Update localStorage for now
      localStorage.setItem(`userRole_${userId}`, newRole);

      // If updating current user, update state
      if (currentUser && currentUser.uid === userId) {
        setUserRole(newRole);
        setUserPermissions(PERMISSIONS[newRole] || PERMISSIONS[ROLES.STAFF]);
      }

      toast.success("User role updated successfully!");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(error.message);
      throw error;
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return userPermissions[permission] || false;
  };

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      setUserPermissions({});
      toast.success("Signed out successfully!");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? user.uid : "No user");
      setCurrentUser(user);

      if (user) {
        const { role, permissions } = getUserRoleAndPermissions(user);
        setUserRole(role);
        setUserPermissions(permissions);
      } else {
        setUserRole(null);
        setUserPermissions({});
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userPermissions,
    signup,
    signin,
    logout,
    updateUserRole,
    hasPermission,
    loading,
    ROLES,
    PERMISSIONS,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
