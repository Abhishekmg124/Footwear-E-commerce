
import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ user, onLogout, cartCount }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top custom-navbar">
            <div className="container">

                {/* Brand */}
                <Link
                    className="navbar-brand d-flex align-items-center gap-2"
                    to="/"
                >
                    <span className="brand-badge">FS</span>
                    <span>Footwear Store</span>
                </Link>

                {/* Mobile Toggle Button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    aria-controls="navbarContent"
                    aria-expanded={isMenuOpen}
                    aria-label="Toggle navigation"
                    onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation Links */}
                <div
                    className={`collapse navbar-collapse${isMenuOpen ? " show" : ""}`}
                    id="navbarContent"
                >
                    <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">

                        <Link className="nav-link" to="/" onClick={closeMenu}>
                            Home
                        </Link>

                        <Link className="nav-link" to="/products" onClick={closeMenu}>
                            Products
                        </Link>

                        {user ? (
                            <>
                                {user.role === "admin" && (
                                    <Link className="nav-link" to="/admin" onClick={closeMenu}>
                                        Admin
                                    </Link>
                                )}

                                <span className="nav-link text-light mb-0">
                                    Hi, {user.name?.split(" ")[0]}
                                </span>

                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={() => {
                                        closeMenu();
                                        onLogout();
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link" to="/login" onClick={closeMenu}>
                                    Login
                                </Link>

                                <Link className="nav-link" to="/register" onClick={closeMenu}>
                                    Register
                                </Link>
                            </>
                        )}

                        <Link className="nav-link cart-link" to="/cart" onClick={closeMenu}>
                            Cart
                            <span className="cart-count">{cartCount}</span>
                        </Link>

                    </div>
                </div>

            </div>
        </nav>
    );
}

export default Navbar;
