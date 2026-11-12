import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";

function Products({ user, token, setCartCount }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const fetchProducts = async (query = "") => {
        try {
            setLoading(true);
            const response = await api.get("/products", {
                params: {
                    search: query || undefined,
                    category: category !== "All" ? category : undefined
                }
            });
            setProducts(response.data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const handleAddToCart = async (product) => {
        if (!user || !token) {
            window.location.href = "/login";
            return;
        }

        const availableSizes = product.sizes?.filter((size) => size.stock > 0) || [];
        const selectedSize = availableSizes[0]?.size;

        if (selectedSize === undefined) {
            alert("This product is currently out of stock.");
            return;
        }

        try {
            const response = await api.post("/cart", { productId: product._id, size: selectedSize });
            setCartCount((prev) => prev + 1);
            alert(response.data.message || "Added to cart successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Unable to add product to cart");
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <h3>Loading products...</h3>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row align-items-center justify-content-between mb-4 g-3">
                <div className="col-md-6">
                    <p className="section-label mb-1">Our collection</p>
                    <h1 className="mb-0">Find your perfect pair</h1>
                </div>

                <div className="col-md-6">
                    <div className="row g-2">
                        <div className="col-md-8">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by brand or model"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <select className="form-select" value={category} onChange={(event) => setCategory(event.target.value)}>
                                <option value="All">All</option>
                                <option value="Running">Running</option>
                                <option value="Sneakers">Sneakers</option>
                                <option value="Lifestyle">Lifestyle</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-outline-dark btn-sm" onClick={() => fetchProducts(search)}>
                    Apply filters
                </button>
            </div>

            {products.length ? (
                <div className="row mt-2">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            ) : (
                <div className="empty-state card border-0 shadow-sm text-center">
                    <div className="card-body py-5">
                        <h3>No products found</h3>
                        <p className="text-muted mb-0">Try a different keyword or category filter.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;