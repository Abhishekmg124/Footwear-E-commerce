import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Cart({ user, token, onCartUpdate }) {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const fetchCart = async () => {
        if (!token) {
            setCart({ items: [] });
            return;
        }

        try {
            setLoading(true);
            const response = await api.get("/cart");
            setCart(response.data.cart || { items: [] });
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCart({ items: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const subtotal = useMemo(
        () => cart.items.reduce((sum, item) => sum + (item.product?.price || 0), 0),
        [cart.items]
    );

    const removeItem = async (productId, size) => {
        try {
            await api.delete(`/cart/${productId}/${size}`);
            setMessage("Item removed from cart.");
            fetchCart();
            onCartUpdate((prev) => Math.max(0, prev - 1));
        } catch (error) {
            setMessage(error.response?.data?.message || "Unable to remove item.");
        }
    };

    if (!user) {
        return (
            <div className="container py-5 text-center">
                <div className="empty-state card border-0 shadow-sm">
                    <div className="card-body p-5">
                        <h2 className="mb-3">Your cart is waiting</h2>
                        <p className="text-muted mb-4">Login to view your saved footwear and continue checkout.</p>
                        <Link to="/login" className="btn btn-dark me-2">Login</Link>
                        <Link to="/register" className="btn btn-outline-dark">Create account</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h3>Loading cart...</h3>
            </div>
        );
    }

    if (!cart.items.length) {
        return (
            <div className="container py-5 text-center">
                <div className="empty-state card border-0 shadow-sm">
                    <div className="card-body p-5">
                        <h2 className="mb-3">Your cart is empty</h2>
                        <p className="text-muted mb-4">Add a few essentials and come back here to checkout.</p>
                        <Link to="/products" className="btn btn-dark">Continue shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <p className="section-label mb-1">Your bag</p>
                            <h1 className="mb-0">Shopping cart</h1>
                        </div>
                        <span className="badge text-bg-dark rounded-pill px-3 py-2">{cart.items.length} items</span>
                    </div>

                    {message && <div className="alert alert-success">{message}</div>}

                    {cart.items.map((item) => (
                        <div className="cart-item card shadow-sm border-0 mb-3" key={`${item.product?._id}-${item.size}`}>
                            <div className="card-body">
                                <div className="row align-items-center g-3">
                                    <div className="col-md-3 col-4">
                                        <img
                                            src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"}
                                            alt={item.product?.model}
                                            className="img-fluid rounded-3 cart-image"
                                        />
                                    </div>

                                    <div className="col-md-6 col-8">
                                        <h5 className="mb-1">{item.product?.brand} {item.product?.model}</h5>
                                        <p className="text-muted mb-2">{item.product?.category}</p>
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="badge text-bg-light border">Size {item.size}</span>
                                            <span className="fw-semibold text-dark">INR {item.product?.price}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3 text-md-end">
                                        <button
                                            className="btn btn-outline-dark btn-sm"
                                            onClick={() => removeItem(item.product?._id, item.size)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="col-lg-4">
                    <div className="summary-card card shadow-sm border-0">
                        <div className="card-body p-4">
                            <p className="section-label mb-2">Summary</p>
                            <h4 className="mb-4">Order total</h4>

                            <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal</span>
                                <span>INR {subtotal}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tax</span>
                                <span>INR 0</span>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                                <span>Total</span>
                                <span>INR {subtotal}</span>
                            </div>

                            <button className="btn btn-dark w-100 py-2" disabled>
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
