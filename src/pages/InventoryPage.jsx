import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  InputGroup,
  Dropdown,
  Nav,
} from "react-bootstrap";
import Layout from "../components/common/Layout";
import ProductModal from "../components/inventory/ProductModal";
import CategoryManagement from "../components/inventory/CategoryManagement";
import { useProducts } from "../contexts/ProductContext";
import { useAuth } from "../contexts/AuthContext";
import { useSuppliers } from "../contexts/SupplierContext";
import toast from "react-hot-toast";
import StockAlerts from "../components/inventory/StockAlerts";
import AdvancedFilters from "../components/inventory/AdvancedFilters";
import { useLocation } from "react-router-dom";

const InventoryPage = () => {
  const {
    products,
    categories,
    searchProducts,
    getStockStatus,
    deleteProduct,
    getLowStockProducts,
    getOutOfStockProducts,
    getSupplierName,
    STOCK_STATUS,
  } = useProducts();
  const { hasPermission } = useAuth();
  const { suppliers } = useSuppliers();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [activeTab, setActiveTab] = useState("products");
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    minPrice: "",
    maxPrice: "",
    supplier: "",
    stockStatus: "all",
    startDate: "",
    endDate: "",
    dateField: "createdAt",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Handle URL parameters and navigation state - MOVED INSIDE COMPONENT
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    
    if (tab === 'alerts') {
      setActiveTab('alerts');
    }
    
    // Handle product selection from alert navigation
    if (location.state?.selectedProduct && location.state?.openModal) {
      setSelectedProduct(location.state.selectedProduct);
      setModalMode('view');
      setShowModal(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const filteredProducts = searchProducts(searchTerm, filterCategory);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalMode("edit");
    setShowModal(true);
  };

  // Add the handleViewProduct function here (outside JSX)
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setModalMode("view");
    setShowModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!hasPermission("canDeleteItems")) {
      toast.error("You do not have permission to delete items");
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const getStockBadge = (stock, threshold) => {
    const status = getStockStatus(stock, threshold);
    const variants = {
      [STOCK_STATUS.OUT_OF_STOCK]: "danger",
      [STOCK_STATUS.LOW_STOCK]: "warning",
      [STOCK_STATUS.IN_STOCK]: "success",
    };
    const texts = {
      [STOCK_STATUS.OUT_OF_STOCK]: "Out of Stock",
      [STOCK_STATUS.LOW_STOCK]: "Low Stock",
      [STOCK_STATUS.IN_STOCK]: "In Stock",
    };
    return <Badge bg={variants[status]}>{texts[status]}</Badge>;
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(
      (cat) => cat.name === categoryName
    );
    return category?.color || "#007bff";
  };

  return (
    <Layout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Inventory</h2>
          {hasPermission("canManageInventory") && activeTab === "products" && (
            <Button variant="primary" onClick={handleAddProduct}>
              <i className="bi bi-plus-circle me-2"></i>
              Add Product
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link
              active={activeTab === "products"}
              onClick={() => setActiveTab("products")}
            >
              <i className="bi bi-box-seam me-2"></i>
              Products ({products.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "categories"}
              onClick={() => setActiveTab("categories")}
            >
              <i className="bi bi-tags me-2"></i>
              Categories ({categories.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "alerts"}
              onClick={() => setActiveTab("alerts")}
            >
              <i className="bi bi-bell me-2"></i>
              Stock Alerts
              {getLowStockProducts().length + getOutOfStockProducts().length >
                0 && (
                <Badge bg="danger" className="ms-2">
                  {getLowStockProducts().length +
                    getOutOfStockProducts().length}
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Tab Content */}
        {activeTab === "products" ? (
          <>
            {/* Existing Filters and Search */}
            <Card className="mb-4">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <InputGroup>
                      <InputGroup.Text>
                        <i className="bi bi-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search products by name, SKU, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={3}>
                    <Form.Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories
                        .sort((a, b) => {
                          const nameA = typeof a === 'string' ? a : a.name;
                          const nameB = typeof b === 'string' ? b : b.name;
                          return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                        })
                        .map((category) => {
                        // Handle both string and object categories
                        const categoryName =
                          typeof category === "string"
                            ? category
                            : category.name;
                        const categoryKey =
                          typeof category === "string"
                            ? category
                            : category.id || category.name;
                        return (
                          <option key={categoryKey} value={categoryName}>
                            {categoryName}
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Button variant="outline-secondary" className="w-100">
                      <i className="bi bi-funnel me-2"></i>
                      More Filters
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Existing Products Table */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">Products ({filteredProducts.length})</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {/* Desktop Table View */}
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Supplier</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded me-3"
                                style={{ width: "40px", height: "40px" }}
                              >
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-100 h-100 object-fit-cover rounded"
                                  />
                                ) : (
                                  <i className="bi bi-box-seam d-flex align-items-center justify-content-center h-100"></i>
                                )}
                              </div>
                              <div>
                                <div className="fw-bold">{product.name}</div>
                                {product.description && (
                                  <small className="text-muted">
                                    {product.description.substring(0, 50)}...
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <code>{product.sku}</code>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div
                                className="rounded me-2"
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  backgroundColor: getCategoryColor(
                                    product.category
                                  ),
                                }}
                              ></div>
                              <Badge 
                                style={{
                                  backgroundColor: getCategoryColor(product.category),
                                  color: '#fff',
                                  border: 'none'
                                }}
                              >
                                {product.category}
                              </Badge>
                            </div>
                          </td>
                          <td>
                            <span className="fw-bold">{product.stock}</span>
                          </td>
                          <td>
                            <span className="fw-bold">${product.price}</span>
                            {product.costPrice > 0 && (
                              <div>
                                <small className="text-muted">
                                  Cost: ${product.costPrice}
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            {getStockBadge(
                              product.stock,
                              product.lowStockThreshold
                            )}
                          </td>
                          <td>{getSupplierName(product.supplier, suppliers)}</td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle
                                variant="outline-secondary"
                                size="sm"
                              >
                                <i className="bi bi-three-dots"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleViewProduct(product)}
                                >
                                  <i className="bi bi-eye me-2"></i>
                                  View Details
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <i className="bi bi-pencil me-2"></i>
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                {hasPermission("canDeleteItems") && (
                                  <Dropdown.Item
                                    className="text-danger"
                                    onClick={() => handleDeleteProduct(product)}
                                  >
                                    <i className="bi bi-trash me-2"></i>
                                    Delete
                                  </Dropdown.Item>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="mobile-product-cards">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="mobile-product-card">
                      <div className="mobile-product-header">
                        <div className="mobile-product-image">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                            />
                          ) : (
                            <i className="bi bi-box-seam"></i>
                          )}
                        </div>
                        <div className="mobile-product-info">
                          <div className="mobile-product-name">{product.name}</div>
                          <div className="mobile-product-sku">{product.sku}</div>
                        </div>
                      </div>
                      
                      <div className="mobile-product-details">
                        <div className="mobile-detail-item">
                          <div className="mobile-detail-label">Category</div>
                          <div className="mobile-detail-value">
                            <Badge 
                              className="mobile-category-badge"
                              style={{
                                backgroundColor: getCategoryColor(product.category),
                                color: '#fff'
                              }}
                            >
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mobile-detail-item">
                          <div className="mobile-detail-label">Stock</div>
                          <div className="mobile-detail-value mobile-stock">{product.stock}</div>
                        </div>
                        
                        <div className="mobile-detail-item">
                          <div className="mobile-detail-label">Price</div>
                          <div className="mobile-detail-value">
                            <div className="mobile-price">${product.price}</div>
                            {product.costPrice > 0 && (
                              <div className="mobile-cost">Cost: ${product.costPrice}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mobile-detail-item">
                          <div className="mobile-detail-label">Supplier</div>
                          <div className="mobile-detail-value mobile-supplier">
                            {getSupplierName(product.supplier, suppliers)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mobile-product-actions">
                        <div className="mobile-product-status">
                          {getStockBadge(
                            product.stock,
                            product.lowStockThreshold
                          )}
                        </div>
                        <div className="mobile-product-menu">
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="outline-secondary"
                              size="sm"
                            >
                              <i className="bi bi-three-dots"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => handleViewProduct(product)}
                              >
                                <i className="bi bi-eye me-2"></i>
                                View Details
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => handleEditProduct(product)}
                              >
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              {hasPermission("canDeleteItems") && (
                                <Dropdown.Item
                                  className="text-danger"
                                  onClick={() => handleDeleteProduct(product)}
                                >
                                  <i className="bi bi-trash me-2"></i>
                                  Delete
                                </Dropdown.Item>
                              )}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-box-seam display-1 text-muted"></i>
                    <h5 className="mt-3 text-muted">No products found</h5>
                    <p className="text-muted">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </>
        ) : activeTab === "categories" ? (
          /* Category Management Tab */
          <CategoryManagement />
        ) : (
          /* Stock Alerts Tab */
          <StockAlerts />
        )}
      </Container>

      {/* Product Modal */}
      <ProductModal
        show={showModal}
        onHide={() => setShowModal(false)}
        product={selectedProduct}
        mode={modalMode}
      />
    </Layout>
  );
};

export default InventoryPage;
