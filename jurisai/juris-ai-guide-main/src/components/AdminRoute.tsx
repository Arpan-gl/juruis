import React from 'react';
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

interface Store {
    isLogin: boolean;
    user: {
        email: string;
        username: string;
        role: 'user' | 'lawyer' | 'admin';
        _id: string;
    } | null;
}

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { isLogin, user } = useSelector((state: Store) => state);
  const location = useLocation();

  // Debug logging
  console.log('AdminRoute Debug:', { 
    isLogin, 
    user, 
    userRole: user?.role,
    currentPath: location.pathname 
  });

  // Check if user is logged in
  if (!isLogin) {
    console.log('AdminRoute: User not logged in, redirecting to signin');
    return <Navigate to="/signIn" replace state={{ from: location }} />;
  }

  // Check if user exists
  if (!user) {
    console.log('AdminRoute: User object is null, redirecting to signin');
    return <Navigate to="/signIn" replace state={{ from: location }} />;
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    console.log('AdminRoute: User not admin, redirecting to home. User role:', user.role);
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute: User is admin, rendering children');
  return <>{children}</>;
};

export default AdminRoute;
