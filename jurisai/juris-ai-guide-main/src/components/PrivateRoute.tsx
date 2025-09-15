import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface Store {
    isLogin: boolean;
    user: {
        email: string;
        username: string;
        role: 'user' | 'lawyer' | 'admin';
        _id: string;
    } | null;
}

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLogin, user } = useSelector((state: Store) => state);

  return isLogin && user ? children : <Navigate to="/signIn" replace />;
};

export default PrivateRoute;