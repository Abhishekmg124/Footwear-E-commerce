
import { Link } from "react-router-dom";

function Navbar({ user, onLogout, cartCount }) {
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
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarContent"
                    aria-controls="navbarContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

               
                <div
                    className="collapse navbar-collapse"
                    id="navbarContent"
                >
                    <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">

                        <Link className="nav-link" to="/">
                            Home
                        </Link>

                        <Link className="nav-link" to="/products">
                            Products
                        </Link>

                        {user ? (
                            <>
                                {user.role === "admin" && (
                                    <Link className="nav-link" to="/admin">
                                        Admin
                                    </Link>
                                )}

                                <span className="nav-link text-light mb-0">
                                    Hi, {user.name?.split(" ")[0]}
                                </span>

                                <button
                                    className="btn btn-outline-light btn-sm"
                                    onClick={onLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link" to="/login">
                                    Login
                                </Link>

                                <Link className="nav-link" to="/register">
                                    Register
                                </Link>
                            </>
                        )}

                        <Link className="nav-link cart-link" to="/cart">
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
