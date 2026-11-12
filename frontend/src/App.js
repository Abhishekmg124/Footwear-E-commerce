import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("footwear_user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem("footwear_token") || "");
    const [cartCount, setCartCount] = useState(() => Number(localStorage.getItem("footwear_cart_count") || 0));

    useEffect(() => {
        if (user) {
            localStorage.setItem("footwear_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("footwear_user");
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem("footwear_token", token);
        } else {
            localStorage.removeItem("footwear_token");
        }
    }, [token]);

    useEffect(() => {
        localStorage.setItem("footwear_cart_count", String(cartCount));
    }, [cartCount]);

    const handleAuth = (authData) => {
        const nextUser = authData.user || null;
        setUser(nextUser);
        setToken(authData.token || "");
    };

    const handleLogout = () => {
        setUser(null);
        setToken("");
        setCartCount(0);
    };

    return (
        <>
            <Navbar user={user} onLogout={handleLogout} cartCount={cartCount} />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/products"
                    element={<Products user={user} token={token} setCartCount={setCartCount} />}
                />
                <Route
                    path="/products/:id"
                    element={<ProductDetails user={user} token={token} setCartCount={setCartCount} />}
                />
                <Route path="/login" element={<Login user={user} onAuth={handleAuth} />} />
                <Route path="/register" element={<Register user={user} onAuth={handleAuth} />} />
                <Route path="/cart" element={<Cart user={user} token={token} onCartUpdate={setCartCount} />} />
                <Route
                    path="/admin/*"
                    element={user?.role === "admin" ? <AdminDashboard user={user} /> : <Navigate to={user ? "/" : "/login"} replace />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;