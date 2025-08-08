import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
  Form,
  InputGroup,
} from "react-bootstrap";
import Layout from "../components/common/Layout";
import SupplierModal from "../components/suppliers/SupplierModal";
import { useSuppliers } from "../contexts/SupplierContext";

const SuppliersPage = () => {
  const { suppliers, deleteSupplier, loading, refreshStats } = useSuppliers();
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDeleteSupplier = async (supplier) => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      await deleteSupplier(supplier.id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSupplier(null);
  };

  // Filter suppliers based on search term and status
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="secondary">Inactive</Badge>
    );
  };

  // Add useEffect to refresh stats when component mounts
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <Layout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Suppliers</h2>
          <Button variant="primary" onClick={handleAddSupplier}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Supplier
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Suppliers Table */}
        <Card>
          <Card.Body>
            {/* Desktop Table */}
            <Table striped bordered hover responsive className="d-none d-md-table">
              <thead>
                <tr>
                  <th>Supplier Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Last Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>
                        <div>
                          <strong>{supplier.name}</strong>
                          {supplier.address && (
                            <div className="text-muted small">
                              {supplier.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{supplier.contactPerson}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.phone}</td>
                      <td>{getStatusBadge(supplier.status)}</td>
                      <td>{supplier.productsCount}</td>
                      <td>{supplier.lastOrder || "No orders"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleEditSupplier(supplier)}
                            title="Edit Supplier"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier)}
                            title="Delete Supplier"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      {searchTerm || statusFilter !== "all"
                        ? "No suppliers found matching your criteria."
                        : "No suppliers found. Add your first supplier!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Mobile Cards */}
            <div className="d-md-none">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="mobile-supplier-card mb-3">
                    <div className="mobile-supplier-header">
                      <div className="mobile-supplier-name">
                        <strong>{supplier.name}</strong>
                        {supplier.address && (
                          <div className="text-muted small">{supplier.address}</div>
                        )}
                      </div>
                      <div className="mobile-supplier-status">
                        {getStatusBadge(supplier.status)}
                      </div>
                    </div>
                    
                    <div className="mobile-supplier-details">
                      <div className="mobile-detail-item">
                        <div className="mobile-detail-label">Contact Person</div>
                        <div className="mobile-detail-value">{supplier.contactPerson}</div>
                      </div>
                      
                      <div className="mobile-detail-item">
                        <div className="mobile-detail-label">Email</div>
                        <div className="mobile-detail-value">{supplier.email}</div>
                      </div>
                      
                      <div className="mobile-detail-item">
                        <div className="mobile-detail-label">Phone</div>
                        <div className="mobile-detail-value">{supplier.phone}</div>
                      </div>
                      
                      <div className="mobile-detail-item">
                        <div className="mobile-detail-label">Products</div>
                        <div className="mobile-detail-value">{supplier.productsCount}</div>
                      </div>
                      
                      <div className="mobile-detail-item">
                        <div className="mobile-detail-label">Last Order</div>
                        <div className="mobile-detail-value">{supplier.lastOrder || "No orders"}</div>
                      </div>
                    </div>
                    
                    <div className="mobile-supplier-actions">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleEditSupplier(supplier)}
                        className="me-2"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted p-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No suppliers found matching your criteria."
                    : "No suppliers found. Add your first supplier!"}
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Supplier Modal */}
        <SupplierModal
          show={showModal}
          handleClose={handleCloseModal}
          supplier={selectedSupplier}
          mode={modalMode}
        />
      </Container>
    </Layout>
  );
};

export default SuppliersPage;
