import React from 'react';
import { useSelector } from 'react-redux';

interface Store {
    isLogin: boolean;
    user: {
        email: string;
        username: string;
        role: 'user' | 'lawyer' | 'admin';
        _id: string;
    } | null;
}

const DebugRedux = () => {
  const { isLogin, user } = useSelector((state: Store) => state);

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Redux Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>isLogin:</strong> {isLogin ? 'true' : 'false'}</div>
        <div><strong>User:</strong> {user ? 'exists' : 'null'}</div>
        {user && (
          <>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Username:</strong> {user.username}</div>
            <div><strong>Role:</strong> {user.role}</div>
            <div><strong>ID:</strong> {user._id}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default DebugRedux;
