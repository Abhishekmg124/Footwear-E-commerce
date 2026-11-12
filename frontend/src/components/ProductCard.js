import { Link } from "react-router-dom";

function ProductCard({ product, onAddToCart }) {
    const firstImage = product.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";
    const availableSizes = product.sizes?.filter((size) => size.stock > 0).slice(0, 4) || [];

    return (
        <div className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100 product-card shadow-sm border-0">
                <div className="image-wrap">
                    <img src={firstImage} alt={`${product.brand} ${product.model}`} className="card-img-top" />
                </div>

                <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <p className="section-label mb-1">{product.category}</p>
                            <h5 className="card-title mb-0">{product.brand} {product.model}</h5>
                        </div>
                        <span className="price-tag">INR {product.price}</span>
                    </div>

                    <div className="mb-3">
                        {availableSizes.length ? (
                            <div className="d-flex flex-wrap gap-2">
                                {availableSizes.map((size) => (
                                    <span key={size.size} className="size-chip">{size.size}</span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-danger small">Out of stock</span>
                        )}
                    </div>

                    <div className="mt-auto d-flex gap-2">
                        <Link to={`/products/${product._id}`} className="btn btn-outline-dark flex-fill">
                            View Details
                        </Link>
                        <button className="btn btn-dark flex-fill" onClick={() => onAddToCart(product)}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;