import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login({ user, onAuth }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/", { replace: true });
        }
    }, [navigate, user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login", formData);
            onAuth(response.data);
            navigate(response.data.user?.role === "admin" ? "/admin" : "/", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="auth-card card shadow-sm border-0">
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <span className="brand-badge">FS</span>
                                <h2 className="mt-3 mb-1">Welcome back</h2>
                                <p className="text-muted mb-0">Sign in to continue shopping</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Email address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {error && <div className="alert alert-danger">{error}</div>}

                                <button type="submit" className="btn btn-dark w-100 py-2" disabled={loading}>
                                    {loading ? "Signing in..." : "Login"}
                                </button>
                            </form>

                            <p className="mb-0 text-center mt-4">
                                Don&apos;t have an account? <Link to="/register">Create one</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
