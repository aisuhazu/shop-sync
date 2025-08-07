import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useSuppliers } from '../../contexts/SupplierContext';

const SupplierModal = ({ show, handleClose, supplier = null, mode = 'add' }) => {
  const { addSupplier, updateSupplier, loading } = useSuppliers();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    status: 'active',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when supplier changes
  useEffect(() => {
    if (supplier && mode === 'edit') {
      setFormData({
        name: supplier.name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        contactPerson: supplier.contactPerson || '',
        status: supplier.status || 'active',
        notes: supplier.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        status: 'active',
        notes: ''
      });
    }
    setErrors({});
  }, [supplier, mode, show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
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
      if (mode === 'edit') {
        await updateSupplier(supplier.id, formData);
      } else {
        await addSupplier(formData);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contactPerson: '',
      status: 'active',
      notes: ''
    });
    setErrors({});
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleModalClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'edit' ? 'Edit Supplier' : 'Add New Supplier'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Supplier Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                  placeholder="Enter supplier name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Contact Person *</Form.Label>
                <Form.Control
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  isInvalid={!!errors.contactPerson}
                  placeholder="Enter contact person name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contactPerson}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                  placeholder="Enter email address"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone *</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  isInvalid={!!errors.phone}
                  placeholder="Enter phone number"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter supplier address"
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Enter any additional notes about the supplier"
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
            {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Supplier' : 'Add Supplier')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SupplierModal;