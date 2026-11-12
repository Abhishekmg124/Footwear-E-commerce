import { Link } from "react-router-dom";

const categoryCards = [
    { name: "Running", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80" },
    { name: "Sneakers", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80" },
    { name: "Lifestyle", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80" }
];

function Home() {
    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6">
                            <p className="section-label mb-3">New season arrivals</p>
                            <h1 className="display-4 fw-bold mb-3">Step into comfort, style, and confidence.</h1>
                            <p className="lead text-muted mb-4">
                                Discover premium footwear for every goal — from daily essentials to standout statement pairs.
                            </p>

                            <div className="d-flex flex-wrap gap-3">
                                <Link to="/products" className="btn btn-dark btn-lg px-4">Shop Now</Link>
                                <Link to="/products" className="btn btn-outline-dark btn-lg px-4">Explore Collection</Link>
                            </div>

                            <div className="hero-stats mt-4 d-flex flex-wrap gap-4">
                                <div>
                                    <h3 className="mb-0">10k+</h3>
                                    <span className="text-muted">happy shoppers</span>
                                </div>
                                <div>
                                    <h3 className="mb-0">4.9/5</h3>
                                    <span className="text-muted">customer rating</span>
                                </div>
                                <div>
                                    <h3 className="mb-0">24h</h3>
                                    <span className="text-muted">dispatch</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="hero-visual">
                                <img
                                    src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80"
                                    alt="Collection of footwear"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <p className="section-label mb-1">Popular categories</p>
                        <h2 className="mb-0">Shop by style</h2>
                    </div>
                </div>

                <div className="row g-4">
                    {categoryCards.map((category) => (
                        <div className="col-md-4" key={category.name}>
                            <Link to="/products" className="category-card card border-0 shadow-sm h-100 text-decoration-none text-dark">
                                <img src={category.image} className="card-img-top" alt={category.name} />
                                <div className="card-body text-center">
                                    <h4 className="mb-0">{category.name}</h4>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container pb-5">
                <div className="featured-banner">
                    <div className="row align-items-center">
                        <div className="col-md-7">
                            <p className="section-label mb-2">Limited offer</p>
                            <h2 className="mb-3">Save up to 30% on performance shoes</h2>
                            <p className="mb-0 text-muted">Upgrade your every step with movement-ready styles built for energy and comfort.</p>
                        </div>
                        <div className="col-md-5 text-md-end mt-3 mt-md-0">
                            <Link to="/products" className="btn btn-light btn-lg">View deals</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;