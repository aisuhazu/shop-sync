import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Accordion,
  Badge,
} from "react-bootstrap";
import { useProducts } from "../../contexts/ProductContext";
import { useSuppliers } from "../../contexts/SupplierContext";

const AdvancedFilters = ({ onFiltersChange, activeFilters = {} }) => {
  const { categories, products } = useProducts();
  const { suppliers } = useSuppliers();

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
    ...activeFilters,
  });

  const availableSuppliers = suppliers.filter((supplier) =>
    products.some((product) => product.supplier === supplier.id)
  );

  // Get price range from products
  const priceRange = products.reduce(
    (range, product) => {
      const price = parseFloat(product.price);
      return {
        min: Math.min(range.min, price),
        max: Math.max(range.max, price),
      };
    },
    { min: Infinity, max: 0 }
  );

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "all",
      minPrice: "",
      maxPrice: "",
      supplier: "",
      stockStatus: "all",
      startDate: "",
      endDate: "",
      dateField: "createdAt",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category !== "all") count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.supplier) count++;
    if (filters.stockStatus !== "all") count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  };

  useEffect(() => {
    setFilters((prev) => ({ ...prev, ...activeFilters }));
  }, [activeFilters]);

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h6 className="mb-0 me-2">Advanced Filters</h6>
          {getActiveFilterCount() > 0 && (
            <Badge bg="primary">{getActiveFilterCount()} active</Badge>
          )}
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={clearFilters}
          disabled={getActiveFilterCount() === 0}
        >
          Clear All
        </Button>
      </Card.Header>

      <Card.Body>
        <Row className="g-3">
          {/* Search */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Search Products</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search by name, SKU, or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </Form.Group>
          </Col>

          {/* Category */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories
                  .sort((a, b) =>
                    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                  )
                  .map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Price Range */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Price Range</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder={`Min ($${priceRange.min.toFixed(2)})`}
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </Col>
                <Col xs="auto" className="d-flex align-items-center">
                  <span>to</span>
                </Col>
                <Col>
                  <Form.Control
                    type="number"
                    placeholder={`Max ($${priceRange.max.toFixed(2)})`}
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </Col>
              </Row>
            </Form.Group>
          </Col>

          {/* Supplier */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Supplier</Form.Label>
              <Form.Select
                value={filters.supplier}
                onChange={(e) => handleFilterChange("supplier", e.target.value)}
              >
                <option value="">All Suppliers</option>
                {availableSuppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Stock Status */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Stock Status</Form.Label>
              <Form.Select
                value={filters.stockStatus}
                onChange={(e) =>
                  handleFilterChange("stockStatus", e.target.value)
                }
              >
                <option value="all">All Stock Levels</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Date Range */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Date Range</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                </Col>
                <Col xs="auto" className="d-flex align-items-center">
                  <span>to</span>
                </Col>
                <Col>
                  <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                  />
                </Col>
              </Row>
              <Form.Select
                size="sm"
                className="mt-2"
                value={filters.dateField}
                onChange={(e) =>
                  handleFilterChange("dateField", e.target.value)
                }
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="lastRestocked">Last Restocked</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default AdvancedFilters;
