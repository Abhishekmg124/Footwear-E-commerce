import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function ProductDetails({ user, token, setCartCount }) {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then((response) => {
                setProduct(response.data.product);
                const firstAvailable = response.data.product.sizes.find((size) => size.stock > 0);
                setSelectedSize(firstAvailable ? firstAvailable.size : null);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching product:", error);
                setLoading(false);
            });
    }, [id]);

    const handleAddToCart = async () => {
        if (!user || !token) {
            window.location.href = "/login";
            return;
        }

        if (selectedSize === null || selectedSize === undefined) {
            alert("Please select a size first.");
            return;
        }

        try {
            setAdding(true);
            const response = await api.post("/cart", {
                productId: product._id,
                size: selectedSize
            });
            setCartCount((prev) => prev + 1);
            alert(response.data.message || "Added to cart successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Unable to add product to cart");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h3>Loading product...</h3>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container py-5 text-center">
                <h3>Product not found</h3>
            </div>
        );
    }

    const mainImage = product.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";
    const availableSizes = product.sizes.filter((size) => size.stock > 0);

    return (
        <div className="container py-5">
            <div className="row g-5 align-items-start">
                <div className="col-lg-6">
                    <div className="product-gallery card border-0 shadow-sm">
                        <img src={mainImage} alt={`${product.brand} ${product.model}`} className="img-fluid" />
                    </div>
                </div>

                <div className="col-lg-6">
                    <p className="section-label mb-2">{product.category}</p>
                    <h1 className="mb-2">{product.brand} {product.model}</h1>
                    <h3 className="mb-4">INR {product.price}</h3>
                    <p className="text-muted mb-4">
                        Designed for everyday movement with premium materials, responsive cushioning, and elevated comfort.
                    </p>

                    <div className="mb-4">
                        <h5 className="mb-3">Select size</h5>
                        <div className="d-flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <button
                                    key={size.size}
                                    type="button"
                                    className={`btn ${selectedSize === size.size ? "btn-dark" : "btn-outline-dark"}`}
                                    disabled={size.stock === 0}
                                    onClick={() => setSelectedSize(size.size)}
                                >
                                    {size.size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex flex-wrap gap-3 mb-4">
                        <button className="btn btn-dark btn-lg px-4" onClick={handleAddToCart} disabled={adding || !availableSizes.length}>
                            {adding ? "Adding..." : "Add to cart"}
                        </button>
                        <Link to="/products" className="btn btn-outline-dark btn-lg px-4">Continue shopping</Link>
                    </div>

                    <div className="info-box">
                        <div className="row text-center g-3">
                            <div className="col-4">
                                <strong>Free</strong>
                                <div className="text-muted small">Shipping</div>
                            </div>
                            <div className="col-4">
                                <strong>30 days</strong>
                                <div className="text-muted small">Returns</div>
                            </div>
                            <div className="col-4">
                                <strong>Secure</strong>
                                <div className="text-muted small">Checkout</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;