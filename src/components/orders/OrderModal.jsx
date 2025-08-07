import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';
import { useOrders } from '../../contexts/OrderContext';
import { useProducts } from '../../contexts/ProductContext';

const OrderModal = ({ show, handleClose, order = null, mode = 'add' }) => {
  const { addOrder, updateOrder, calculateOrderTotals, loading } = useOrders();
  const { products } = useProducts();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    items: [],
    notes: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when order changes
  useEffect(() => {
    if (order && (mode === 'edit' || mode === 'view')) {
      setFormData({
        customerName: order.customerName || '',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        customerAddress: order.customerAddress || '',
        items: order.items || [],
        notes: order.notes || ''
      });
    } else {
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        items: [],
        notes: ''
      });
    }
    setErrors({});
    setSelectedProduct('');
    setQuantity(1);
  }, [order, mode, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addProductToOrder = () => {
    if (!selectedProduct || quantity <= 0) {
      return;
    }
    
    const product = products.find(p => p.id.toString() === selectedProduct);
    if (!product) {
      return;
    }
    
    const existingItemIndex = formData.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += parseInt(quantity);
      setFormData(prev => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      const newItem = {
        productId: product.id,  // ← Changed from 'id' to 'productId'
        name: product.name,
        price: product.price,
        quantity: parseInt(quantity)
      };
      setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
    
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeProductFromOrder = (productId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)  // ← Changed from 'id' to 'productId'
    }));
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId   // ← Changed from 'id' to 'productId'
          ? { ...item, quantity: parseInt(newQuantity) }
          : item
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email is invalid';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    }
    
    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'Customer address is required';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one product must be added to the order';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const totals = calculateOrderTotals(formData.items);
      const orderData = {
        ...formData,
        ...totals
      };
      
      if (mode === 'edit') {
        await updateOrder(order.id, orderData);
      } else {
        await addOrder(orderData);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      notes: ''
    });
    setErrors({});
    setSelectedProduct('');
    setQuantity(1);
    handleClose();
  };

  const totals = calculateOrderTotals(formData.items);

  const modalTitle = mode === 'add' ? 'Create New Order' : mode === 'edit' ? 'Edit Order' : 'Order Details';
  const isViewMode = mode === 'view';

  return (
    <Modal show={show} onHide={handleModalClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi ${mode === 'add' ? 'bi-plus-circle' : mode === 'edit' ? 'bi-pencil' : 'bi-eye'} me-2`}></i>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      
      {isViewMode ? (
        <>
          <Modal.Body>
            {/* Customer Information - View Mode */}
            <h5 className="mb-3">
              <i className="bi bi-person me-2"></i>
              Customer Information
            </h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.customerName}
                    disabled
                    readOnly
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.customerEmail}
                    disabled
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.customerPhone}
                    disabled
                    readOnly
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.customerAddress}
                    disabled
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
            
            {/* Order Items - View Mode */}
            <h5 className="mb-3 mt-4">Order Items</h5>
            
            {formData.items.length > 0 && (
              <Table striped bordered hover className="mb-3">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map(item => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            
            {/* Order Summary - View Mode */}
            {formData.items.length > 0 && (
              <Row className="mt-3">
                <Col md={6} className="ms-auto">
                  <Table>
                    <tbody>
                      <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td className="text-end">${totals.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Tax (8%):</strong></td>
                        <td className="text-end">${totals.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Shipping:</strong></td>
                        <td className="text-end">${totals.shipping.toFixed(2)}</td>
                      </tr>
                      <tr className="table-active">
                        <td><strong>Total:</strong></td>
                        <td className="text-end"><strong>${totals.total.toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            )}
            
            {/* Notes - View Mode */}
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                disabled
                readOnly
              />
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Customer Information - Edit/Add Mode */}
            <h5 className="mb-3">
              <i className="bi bi-person me-2"></i>
              Customer Information
            </h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    isInvalid={!!errors.customerName}
                    placeholder="Enter customer name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customerName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    isInvalid={!!errors.customerEmail}
                    placeholder="Enter customer email"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customerEmail}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Phone *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.customerPhone}
                    placeholder="Enter customer phone"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customerPhone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Customer Address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    isInvalid={!!errors.customerAddress}
                    placeholder="Enter customer address"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customerAddress}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            
            {/* Order Items - Edit/Add Mode */}
            <h5 className="mb-3 mt-4">Order Items</h5>
            
            {/* Add Product Section */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Select Product</Form.Label>
                  <Form.Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3} className="d-flex align-items-end">
                <Button 
                  variant="outline-primary" 
                  onClick={addProductToOrder}
                  disabled={!selectedProduct || quantity <= 0}
                  className="mb-3"
                >
                  Add Product
                </Button>
              </Col>
            </Row>
            
            {errors.items && (
              <Alert variant="danger">
                {errors.items}
              </Alert>
            )}
            
            {/* Order Items Table - Edit/Add Mode */}
            {formData.items.length > 0 && (
              <Table striped bordered hover className="mb-3">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map(item => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.productId, e.target.value)}
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeProductFromOrder(item.productId)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            
            {/* Order Summary - Edit/Add Mode */}
            {formData.items.length > 0 && (
              <Row className="mt-3">
                <Col md={6} className="ms-auto">
                  <Table>
                    <tbody>
                      <tr>
                        <td><strong>Subtotal:</strong></td>
                        <td className="text-end">${totals.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Tax (8%):</strong></td>
                        <td className="text-end">${totals.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Shipping:</strong></td>
                        <td className="text-end">${totals.shipping.toFixed(2)}</td>
                      </tr>
                      <tr className="table-active">
                        <td><strong>Total:</strong></td>
                        <td className="text-end"><strong>${totals.total.toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            )}
            
            {/* Notes - Edit/Add Mode */}
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes for this order"
              />
            </Form.Group>
          </Modal.Body>
          
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Order' : 'Create Order')}
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Modal>
  );
};

export default OrderModal;

  // Add this helper function for status badges in view mode
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