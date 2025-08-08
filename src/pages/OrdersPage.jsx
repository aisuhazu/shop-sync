import { useState } from "react";
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
} from "react-bootstrap";
import Layout from "../components/common/Layout";
import OrderModal from "../components/orders/OrderModal";
import { useOrders } from "../contexts/OrderContext";

const OrdersPage = () => {
  const { orders, updateOrderStatus, deleteOrder, ORDER_STATUS, loading } =
    useOrders();
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleNewOrder = () => {
    setSelectedOrder(null);
    setModalMode("add");
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setModalMode("edit");
    setShowModal(true);
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Are you sure you want to delete order ${order.id}?`)) {
      await deleteOrder(order.id);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalMode('view');
    setShowModal(true);
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      confirmed: "info",
      shipped: "primary",
      delivered: "success",
      completed: "success",
      cancelled: "danger",
    };
    const texts = {
      pending: "Pending",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {texts[status] || status}
      </Badge>
    );
  };

  return (
    <Layout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Orders</h2>
          <Button variant="primary" onClick={handleNewOrder}>
            <i className="bi bi-plus-circle me-2"></i>
            New Order
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
                    placeholder="Search orders..."
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
                  {Object.values(ORDER_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Orders Table */}
        <Card>
          <Card.Body>
            {/* Desktop Table */}
            <Table striped bordered hover responsive className="d-none d-md-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>
                      <td>
                        <div>
                          <strong>{order.customerName}</strong>
                          <div className="text-muted small">
                            {order.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td>{order.date}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          style={{ width: "auto" }}
                        >
                          {Object.values(ORDER_STATUS).map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>{order.items?.length || 0}</td>
                      <td>${order.total?.toFixed(2) || "0.00"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                            title="View Order Details"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                            title="Edit Order"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteOrder(order)}
                            title="Delete Order"
                            disabled={
                              order.status === "completed" ||
                              order.status === "shipped"
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      {searchTerm || statusFilter !== "all"
                        ? "No orders found matching your criteria."
                        : "No orders found. Create your first order!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Mobile Cards */}
            <div className="d-md-none">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div key={order.id} className="mobile-order-card mb-3">
                    <div className="mobile-order-header">
                      <div className="mobile-order-id">
                        <strong>#{order.id}</strong>
                        <div className="text-muted small">{order.date}</div>
                      </div>
                      <div className="mobile-order-total">
                        <div className="mobile-total-amount">${order.total?.toFixed(2) || "0.00"}</div>
                        <div className="mobile-items-count">{order.items?.length || 0} items</div>
                      </div>
                    </div>
                    
                    <div className="mobile-order-details">
                      <div className="mobile-detail-item">
                        <div className="mobile-detail-label">Customer</div>
                        <div className="mobile-detail-value">
                          <div>{order.customerName}</div>
                          <div className="text-muted small">{order.customerEmail}</div>
                        </div>
                      </div>
                      
                      <div className="mobile-detail-item">
                        <div className="mobile-detail-label">Status</div>
                        <div className="mobile-detail-value">
                          <Form.Select
                            size="sm"
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                            className="mobile-status-select"
                          >
                            {Object.values(ORDER_STATUS).map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mobile-order-actions">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        className="flex-fill"
                      >
                        <i className="bi bi-eye me-1"></i>
                        View
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                        className="flex-fill"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteOrder(order)}
                        disabled={
                          order.status === "completed" ||
                          order.status === "shipped"
                        }
                        className="flex-fill"
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
                    ? "No orders found matching your criteria."
                    : "No orders found. Create your first order!"}
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Order Modal */}
        <OrderModal
          show={showModal}
          handleClose={handleCloseModal}
          order={selectedOrder}
          mode={modalMode}
        />
      </Container>
    </Layout>
  );
};

export default OrdersPage;
