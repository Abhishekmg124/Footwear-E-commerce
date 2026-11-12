import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

const ORDER_STATUSES = ["Pending", "Dispatched", "Completed", "Returned"];

const localDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const currency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount || 0);

const totalStock = (product) =>
    product.sizes?.reduce((total, size) => total + Number(size.stock || 0), 0) || 0;

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || fallback;

function AdminDashboard({ user }) {
    const [activeView, setActiveView] = useState("Overview");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [salesReport, setSalesReport] = useState({});
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [notice, setNotice] = useState("");
    const [search, setSearch] = useState("");
    const [orderFilter, setOrderFilter] = useState("All orders");
    const [editingProduct, setEditingProduct] = useState(null);
    const [savingProduct, setSavingProduct] = useState(false);
    const todayLabel = new Date().toLocaleDateString("en", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        try {
            const [productResponse, orderResponse, reportResponse] = await Promise.all([
                api.get("/products/admin"),
                api.get("/orders/admin"),
                api.get("/reports/sales", {
                    params: {
                        startDate: localDateString(startDate),
                        endDate: localDateString(endDate)
                    }
                })
            ]);
            setProducts(productResponse.data.products || []);
            setOrders(orderResponse.data.orders || []);
            setSalesReport(reportResponse.data);
        } catch (error) {
            setErrorMessage(getErrorMessage(error, "Unable to load dashboard data."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const lowStockCount = useMemo(
        () => products.filter((product) => totalStock(product) > 0 && totalStock(product) <= 10).length,
        [products]
    );
    const outOfStockCount = useMemo(
        () => products.filter((product) => totalStock(product) === 0).length,
        [products]
    );
    const completedOrders = orders.filter((order) => order.orderStatus === "Completed").length;
    const averageOrder = completedOrders
        ? orders
            .filter((order) => order.orderStatus === "Completed")
            .reduce((sum, order) => sum + order.totalAmount, 0) / completedOrders
        : 0;

    const visibleProducts = products.filter((product) => {
        const query = search.trim().toLowerCase();
        return !query || `${product.brand} ${product.model} ${product.category}`.toLowerCase().includes(query);
    });
    const visibleOrders = orders.filter((order) => (
        (orderFilter === "All orders" || order.orderStatus === orderFilter) &&
        `${order.orderNumber} ${order.user?.name || ""} ${order.user?.email || ""}`.toLowerCase().includes(search.trim().toLowerCase())
    ));

    const chartDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const dateKey = localDateString(date);
        return {
            label: date.toLocaleDateString("en", { weekday: "short" }),
            amount: salesReport.dailySales?.[dateKey]?.sales || 0
        };
    });
    const maxSales = Math.max(...chartDays.map((day) => day.amount), 1);
    const recentOrders = orders.slice(0, 5);
    const bestSellers = [...products]
        .sort((first, second) => totalStock(second) - totalStock(first))
        .slice(0, 4);

    const handleProductSave = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const sizeEntries = String(formData.get("sizes") || "")
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
            .map((entry) => {
                const [size, stock, ...extra] = entry.split(":").map((part) => part.trim());
                return { size: Number(size), stock: Number(stock), valid: !extra.length };
            });

        if (
            !sizeEntries.length ||
            sizeEntries.some(({ size, stock, valid }) => !valid || !Number.isFinite(size) || size <= 0 || !Number.isInteger(stock) || stock < 0) ||
            new Set(sizeEntries.map(({ size }) => size)).size !== sizeEntries.length
        ) {
            setErrorMessage("Enter sizes and stock as unique pairs, for example: 7:12, 8:5.");
            return;
        }

        const price = Number(formData.get("price"));
        if (!Number.isFinite(price) || price < 0) {
            setErrorMessage("Enter a valid product price.");
            return;
        }

        const payload = {
            brand: String(formData.get("brand")).trim(),
            model: String(formData.get("model")).trim(),
            category: String(formData.get("category")).trim(),
            price,
            sizes: sizeEntries.map(({ size, stock }) => ({ size, stock })),
            images: String(formData.get("image") || "").trim()
                ? [String(formData.get("image")).trim()]
                : []
        };

        setSavingProduct(true);
        setErrorMessage("");
        try {
            if (editingProduct?._id) {
                await api.put(`/products/${editingProduct._id}`, payload);
                setNotice("Product updated successfully.");
            } else {
                await api.post("/products", payload);
                setNotice("Product added to your inventory.");
            }
            setEditingProduct(null);
            await loadDashboard();
        } catch (error) {
            setErrorMessage(getErrorMessage(error, "Unable to save this product."));
        } finally {
            setSavingProduct(false);
        }
    };

    const handleProductStatus = async (product) => {
        setErrorMessage("");
        try {
            await api.patch(`/products/${product._id}/status`);
            setNotice(`${product.brand} ${product.model} is now ${product.isActive ? "hidden" : "active"}.`);
            await loadDashboard();
        } catch (error) {
            setErrorMessage(getErrorMessage(error, "Unable to update product status."));
        }
    };

    const handleProductDelete = async (product) => {
        if (!window.confirm(`Permanently delete ${product.brand} ${product.model}?`)) {
            return;
        }
        setErrorMessage("");
        try {
            await api.delete(`/products/${product._id}`);
            setNotice("Product deleted.");
            await loadDashboard();
        } catch (error) {
            setErrorMessage(getErrorMessage(error, "Unable to delete this product."));
        }
    };

    const handleOrderStatus = async (orderId, status) => {
        setErrorMessage("");
        try {
            await api.patch(`/orders/admin/${orderId}/status`, { status });
            setNotice("Order status updated.");
            await loadDashboard();
        } catch (error) {
            setErrorMessage(getErrorMessage(error, "Unable to update this order."));
        }
    };

    const openProductForm = (product = null) => {
        setErrorMessage("");
        setEditingProduct(product || {});
    };

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <Link to="/" className="admin-brand">
                    <span className="admin-brand-mark">FS</span>
                    <span>stride<span className="admin-brand-light">/</span>admin</span>
                </Link>
                <div className="admin-workspace-label">WORKSPACE</div>
                <nav className="admin-nav" aria-label="Admin dashboard">
                    {[
                        ["Overview", "grid"],
                        ["Inventory", "box"],
                        ["Orders", "receipt"]
                    ].map(([label, icon]) => (
                        <button
                            key={label}
                            type="button"
                            className={`admin-nav-item ${activeView === label ? "is-active" : ""}`}
                            onClick={() => {
                                setActiveView(label);
                                setSearch("");
                            }}
                        >
                            <span className={`admin-nav-icon icon-${icon}`} aria-hidden="true" />
                            {label}
                            {label === "Orders" && <span className="admin-nav-count">{orders.length}</span>}
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar-bottom">
                    <div className="admin-help-card">
                        <div className="admin-help-icon">?</div>
                        <strong>Need a hand?</strong>
                        <span>Keep your store running smoothly.</span>
                        <Link to="/products">Visit storefront <span aria-hidden="true">↗</span></Link>
                    </div>
                    <div className="admin-profile">
                        <div className="admin-avatar">{user.name?.charAt(0)?.toUpperCase() || "A"}</div>
                        <div className="admin-profile-copy">
                            <strong>{user.name}</strong>
                            <span>Store administrator</span>
                        </div>
                        <span className="admin-profile-menu" aria-hidden="true">···</span>
                    </div>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-breadcrumb">Workspace <span>/</span> <strong>{activeView}</strong></div>
                    <div className="admin-topbar-actions">
                        <span className="admin-live"><i /> Store is live</span>
                        <Link className="admin-store-link" to="/">View store <span aria-hidden="true">↗</span></Link>
                    </div>
                </header>

                <div className="admin-content">
                    <section className="admin-page-heading">
                        <div>
                            <p className="admin-eyebrow">{activeView === "Overview" ? `${todayLabel}, YOUR STORE AT A GLANCE` : "STORE MANAGEMENT"}</p>
                            <h1>{activeView === "Overview" ? "Good to see you, " : ""}<span>{activeView === "Overview" ? user.name?.split(" ")[0] : activeView}</span><b className="admin-heading-period">.</b></h1>
                            <p className="admin-subtitle">
                                {activeView === "Overview"
                                    ? "Here’s what’s happening with your footwear store today."
                                    : activeView === "Inventory"
                                        ? "Keep your products, sizes, and stock in one place."
                                        : "Track orders and keep every delivery moving."}
                            </p>
                        </div>
                        <button className="admin-button admin-button-dark" onClick={() => openProductForm()} type="button">
                            <span className="admin-plus">+</span> Add product
                        </button>
                    </section>

                    {errorMessage && (
                        <div className="admin-alert admin-alert-error" role="alert">
                            <span>{errorMessage}</span>
                            <button type="button" onClick={() => setErrorMessage("")} aria-label="Dismiss error">×</button>
                        </div>
                    )}
                    {notice && (
                        <div className="admin-alert admin-alert-success" role="status">
                            <span>{notice}</span>
                            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss message">×</button>
                        </div>
                    )}

                    {loading && !products.length && !orders.length ? (
                        <div className="admin-loading"><span className="admin-spinner" /> Loading your store data...</div>
                    ) : (
                        <>
                            {activeView === "Overview" && (
                                <>
                                    <section className="admin-stat-grid">
                                        <article className="admin-stat-card">
                                            <div className="admin-stat-top"><span>Revenue <small>· last 7 days</small></span><i className="stat-icon stat-revenue">₹</i></div>
                                            <strong>{currency(salesReport.totalSales)}</strong>
                                            <div className="admin-stat-foot"><span className="stat-trend">↗</span> Completed orders</div>
                                        </article>
                                        <article className="admin-stat-card">
                                            <div className="admin-stat-top"><span>Total orders</span><i className="stat-icon stat-orders">↗</i></div>
                                            <strong>{orders.length}</strong>
                                            <div className="admin-stat-foot"><span className="stat-dot" /> {completedOrders} completed</div>
                                        </article>
                                        <article className="admin-stat-card">
                                            <div className="admin-stat-top"><span>Products</span><i className="stat-icon stat-products">▧</i></div>
                                            <strong>{products.length}</strong>
                                            <div className="admin-stat-foot"><span className="stat-dot" /> {products.filter((product) => product.isActive).length} active listings</div>
                                        </article>
                                        <article className="admin-stat-card">
                                            <div className="admin-stat-top"><span>Stock alerts</span><i className="stat-icon stat-stock">!</i></div>
                                            <strong>{lowStockCount + outOfStockCount}</strong>
                                            <div className="admin-stat-foot"><span className="stat-warning">{outOfStockCount} out of stock</span><span className="stat-separator">·</span>{lowStockCount} running low</div>
                                        </article>
                                    </section>

                                    <section className="admin-overview-grid">
                                        <article className="admin-panel admin-sales-panel">
                                            <div className="admin-panel-heading">
                                                <div><h2>Sales overview</h2><p>Completed order revenue over the last 7 days</p></div>
                                                <span className="admin-period-pill">Last 7 days <span aria-hidden="true">⌄</span></span>
                                            </div>
                                            <div className="admin-chart-total">{currency(salesReport.totalSales)} <span>INR</span></div>
                                            <div className="admin-chart">
                                                <div className="admin-chart-y">
                                                    <span>{currency(maxSales)}</span>
                                                    <span>{currency(maxSales * 0.66)}</span>
                                                    <span>{currency(maxSales * 0.33)}</span>
                                                    <span>₹0</span>
                                                </div>
                                                <div className="admin-chart-content">
                                                    <div className="admin-chart-gridlines"><i /><i /><i /><i /></div>
                                                    <div className="admin-chart-bars">
                                                        {chartDays.map((day, index) => (
                                                            <div className="admin-chart-day" key={`${day.label}-${index}`}>
                                                                <div className={`admin-chart-bar ${index === 6 ? "is-today" : ""}`} style={{ height: `${Math.max((day.amount / maxSales) * 100, 4)}%` }} title={currency(day.amount)} />
                                                                <span>{day.label}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>

                                        <article className="admin-panel admin-insights-panel">
                                            <div className="admin-panel-heading">
                                                <div><h2>Store pulse</h2><p>A quick look at operations</p></div>
                                                <span className="admin-pulse-mark">✳</span>
                                            </div>
                                            <div className="admin-pulse-row">
                                                <div className="pulse-bubble pulse-bubble-green">↗</div>
                                                <div><strong>{currency(averageOrder)}</strong><span>Average completed order</span></div>
                                            </div>
                                            <div className="admin-pulse-row">
                                                <div className="pulse-bubble pulse-bubble-peach">!</div>
                                                <div><strong>{lowStockCount + outOfStockCount} products</strong><span>Need an inventory check</span></div>
                                                <button type="button" className="admin-text-link" onClick={() => setActiveView("Inventory")}>Review</button>
                                            </div>
                                            <div className="admin-pulse-footer"><span className="pulse-status-dot" /> All systems looking good</div>
                                        </article>
                                    </section>

                                    <section className="admin-overview-grid admin-bottom-grid">
                                        <article className="admin-panel admin-table-panel">
                                            <div className="admin-panel-heading">
                                                <div><h2>Recent orders</h2><p>Your latest customer activity</p></div>
                                                <button type="button" className="admin-text-link" onClick={() => setActiveView("Orders")}>View all <span aria-hidden="true">→</span></button>
                                            </div>
                                            <OrderTable orders={recentOrders} onStatusChange={handleOrderStatus} compact />
                                        </article>
                                        <article className="admin-panel admin-products-panel">
                                            <div className="admin-panel-heading">
                                                <div><h2>Inventory snapshot</h2><p>Most stocked styles</p></div>
                                                <button type="button" className="admin-text-link" onClick={() => setActiveView("Inventory")}>Manage <span aria-hidden="true">→</span></button>
                                            </div>
                                            <div className="admin-mini-products">
                                                {bestSellers.map((product) => (
                                                    <div className="admin-mini-product" key={product._id}>
                                                        <ProductThumbnail product={product} />
                                                        <div className="admin-mini-copy"><strong>{product.brand} {product.model}</strong><span>{product.category}</span></div>
                                                        <span className="admin-mini-stock">{totalStock(product)} <small>left</small></span>
                                                    </div>
                                                ))}
                                                {!bestSellers.length && <div className="admin-empty-inline">No products in your inventory yet.</div>}
                                            </div>
                                        </article>
                                    </section>
                                </>
                            )}

                            {activeView === "Inventory" && (
                                <section className="admin-panel admin-management-panel">
                                    <div className="admin-management-toolbar">
                                        <div><h2>All products <span>{products.length}</span></h2><p>Manage availability and stock across every size.</p></div>
                                        <SearchField value={search} onChange={setSearch} placeholder="Search products..." />
                                    </div>
                                    <div className="admin-table-scroll">
                                        <table className="admin-table inventory-table">
                                            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                                            <tbody>
                                                {visibleProducts.map((product) => (
                                                    <tr key={product._id}>
                                                        <td><div className="admin-product-cell"><ProductThumbnail product={product} /><div><strong>{product.brand} {product.model}</strong><span>{(product.sizes || []).length} sizes available</span></div></div></td>
                                                        <td>{product.category}</td>
                                                        <td className="admin-price-cell">{currency(product.price)}</td>
                                                        <td><span className={`admin-stock-value ${totalStock(product) <= 10 ? "is-low" : ""}`}>{totalStock(product)} units</span></td>
                                                        <td><span className={`admin-status ${product.isActive ? "status-active" : "status-inactive"}`}><i />{product.isActive ? "Active" : "Hidden"}</span></td>
                                                        <td><div className="admin-row-actions"><button type="button" onClick={() => openProductForm(product)}>Edit</button><button type="button" onClick={() => handleProductStatus(product)}>{product.isActive ? "Hide" : "Publish"}</button><button type="button" className="action-delete" onClick={() => handleProductDelete(product)} aria-label={`Delete ${product.model}`}>×</button></div></td>
                                                    </tr>
                                                ))}
                                                {!visibleProducts.length && <tr><td colSpan="6" className="admin-table-empty">{products.length ? "No products match your search." : "Your inventory is empty. Add your first product to get started."}</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {activeView === "Orders" && (
                                <section className="admin-panel admin-management-panel">
                                    <div className="admin-management-toolbar">
                                        <div><h2>All orders <span>{orders.length}</span></h2><p>Review and update your customer orders.</p></div>
                                        <div className="admin-order-filters">
                                            <select aria-label="Filter orders by status" value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}>
                                                <option>All orders</option>
                                                {ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}
                                            </select>
                                            <SearchField value={search} onChange={setSearch} placeholder="Search orders..." />
                                        </div>
                                    </div>
                                    <div className="admin-table-scroll">
                                        <OrderTable orders={visibleOrders} onStatusChange={handleOrderStatus} />
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </main>

            {editingProduct && (
                <ProductModal
                    product={editingProduct}
                    saving={savingProduct}
                    errorMessage={errorMessage}
                    onClose={() => setEditingProduct(null)}
                    onSubmit={handleProductSave}
                />
            )}
        </div>
    );
}

function SearchField({ value, onChange, placeholder }) {
    return (
        <label className="admin-search">
            <span aria-hidden="true">⌕</span>
            <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
        </label>
    );
}

function ProductThumbnail({ product }) {
    return product.images?.[0]
        ? <img className="admin-product-thumb" src={product.images[0]} alt="" />
        : <div className="admin-product-thumb admin-product-placeholder">{product.brand?.charAt(0) || "S"}</div>;
}

function OrderTable({ orders, onStatusChange, compact = false }) {
    return (
        <div className={compact ? "admin-table-scroll is-compact" : ""}>
            <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td><strong className="admin-order-number">#{order.orderNumber}</strong></td>
                            <td><div className="admin-customer-cell"><strong>{order.user?.name || "Customer"}</strong><span>{order.user?.email || "—"}</span></div></td>
                            <td>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                            <td className="admin-price-cell">{currency(order.totalAmount)}</td>
                            <td>
                                <select
                                    className={`admin-status-select status-select-${order.orderStatus?.toLowerCase()}`}
                                    aria-label={`Update status for order ${order.orderNumber}`}
                                    value={order.orderStatus}
                                    onChange={(event) => onStatusChange(order._id, event.target.value)}
                                >
                                    {ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                    {!orders.length && <tr><td colSpan="5" className="admin-table-empty">No orders to show.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

function ProductModal({ product, saving, errorMessage, onClose, onSubmit }) {
    const sizeString = (product.sizes || []).map(({ size, stock }) => `${size}:${stock}`).join(", ");
    return (
        <div className="admin-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className="admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
                <div className="admin-modal-heading">
                    <div><p className="admin-eyebrow">INVENTORY</p><h2 id="product-modal-title">{product._id ? "Edit product" : "Add a product"}</h2></div>
                    <button type="button" onClick={onClose} aria-label="Close dialog">×</button>
                </div>
                <form onSubmit={onSubmit}>
                    {errorMessage && <div className="admin-alert admin-alert-error" role="alert">{errorMessage}</div>}
                    <div className="admin-form-grid">
                        <label>Brand<input name="brand" defaultValue={product.brand || ""} placeholder="e.g. Nike" required /></label>
                        <label>Model<input name="model" defaultValue={product.model || ""} placeholder="e.g. Air Max 90" required /></label>
                        <label>Category<input name="category" defaultValue={product.category || ""} placeholder="e.g. Sneakers" required /></label>
                        <label>Price (INR)<input name="price" type="number" min="0" step="1" defaultValue={product.price ?? ""} placeholder="0" required /></label>
                        <label className="admin-form-wide">Image URL<input name="image" type="url" defaultValue={product.images?.[0] || ""} placeholder="https://..." /></label>
                        <label className="admin-form-wide">Sizes and stock <span className="admin-form-hint">Separate size:stock pairs with commas</span>
                            <input name="sizes" defaultValue={sizeString} placeholder="7:12, 8:5, 9:0" required />
                        </label>
                    </div>
                    <div className="admin-modal-actions">
                        <button type="button" className="admin-button admin-button-light" onClick={onClose}>Cancel</button>
                        <button type="submit" className="admin-button admin-button-dark" disabled={saving}>{saving ? "Saving..." : product._id ? "Save changes" : "Add product"}</button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default AdminDashboard;
