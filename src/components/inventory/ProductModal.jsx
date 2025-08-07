import { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Badge, InputGroup } from 'react-bootstrap';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSuppliers } from '../../contexts/SupplierContext';
import toast from 'react-hot-toast';

const ProductModal = ({ show, onHide, product = null, mode = 'add' }) => {
  const { addProduct, updateProduct, categories, generateSKU, loading } = useProducts();
  const { hasPermission } = useAuth();
  const { suppliers } = useSuppliers();
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    stock: 0,
    price: 0,
    costPrice: 0,
    lowStockThreshold: 10,
    supplier: '',
    barcode: '',
    images: []
  });
  
  const [errors, setErrors] = useState({});
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [autoGenerateSKU, setAutoGenerateSKU] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data when product changes
  useEffect(() => {
    if (product && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category: product.category || '',
        stock: product.stock || 0,
        price: product.price || 0,
        costPrice: product.costPrice || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        supplier: product.supplier || '',
        barcode: product.barcode || '',
        images: product.images || []
      });
      setAutoGenerateSKU(false);
      setImagePreview(product.images || []);
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        sku: '',
        description: '',
        category: '',
        stock: 0,
        price: 0,
        costPrice: 0,
        lowStockThreshold: 10,
        supplier: '',
        barcode: '',
        images: []
      });
      setAutoGenerateSKU(true);
      setImagePreview([]);
    }
    setErrors({});
    setImageFiles([]);
  }, [product, mode, show]);

  // Auto-generate SKU when name or category changes
  useEffect(() => {
    if (autoGenerateSKU && formData.name && formData.category && mode === 'add') {
      const newSKU = generateSKU(formData.category, formData.name);
      setFormData(prev => ({ ...prev, sku: newSKU }));
    }
  }, [formData.name, formData.category, autoGenerateSKU, generateSKU, mode]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (files.length + imageFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      return true;
    });
    
    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.costPrice < 0) newErrors.costPrice = 'Cost price cannot be negative';
    if (formData.stock < 0) newErrors.stock = 'Stock cannot be negative';
    if (formData.lowStockThreshold < 0) newErrors.lowStockThreshold = 'Threshold cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    // Check permissions
    if (!hasPermission('canManageInventory')) {
      toast.error('You do not have permission to manage inventory');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        images: imagePreview // In a real app, you'd upload to Firebase Storage first
      };
      
      if (mode === 'add') {
        await addProduct(productData);
        toast.success('Product added successfully!');
      } else {
        await updateProduct(product.id, productData);
        toast.success('Product updated successfully!');
      }
      
      onHide();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = mode === 'add' ? 'Add New Product' : mode === 'edit' ? 'Edit Product' : 'Product Details';
  const submitButtonText = mode === 'add' ? 'Add Product' : 'Update Product';
  const isViewMode = mode === 'view';

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi ${mode === 'add' ? 'bi-plus-circle' : mode === 'edit' ? 'bi-pencil' : 'bi-eye'} me-2`}></i>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            {/* Basic Information */}
            <Col md={12}>
              <h6 className="text-muted mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Basic Information
              </h6>
            </Col>
            
            <Col md={8}>
              <Form.Group>
                <Form.Label>Product Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  isInvalid={!!errors.name}
                  placeholder="Enter product name"
                  disabled={isViewMode}
                  readOnly={isViewMode}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Apply disabled={isViewMode} and readOnly={isViewMode} to ALL form controls */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>
                  SKU *
                  {mode === 'add' && (
                    <Form.Check
                      type="switch"
                      id="auto-sku"
                      label="Auto"
                      checked={autoGenerateSKU}
                      onChange={(e) => setAutoGenerateSKU(e.target.checked)}
                      className="float-end"
                    />
                  )}
                </Form.Label>
                <Form.Control
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  isInvalid={!!errors.sku}
                  placeholder="SKU"
                  disabled={autoGenerateSKU && mode === 'add'}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.sku}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category *</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  isInvalid={!!errors.category}
                >
                  <option value="">Select category</option>
                  {categories
                    .sort((a, b) => {
                      const nameA = typeof a === 'string' ? a : a.name;
                      const nameB = typeof b === 'string' ? b : b.name;
                      return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
                    })
                    .map(category => {
                    // Handle both string and object categories
                    const categoryName = typeof category === 'string' ? category : category.name;
                    const categoryKey = typeof category === 'string' ? category : category.id || category.name;
                    return (
                      <option key={categoryKey} value={categoryName}>
                        {categoryName}
                      </option>
                    );
                  })}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.category}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Supplier</Form.Label>
                <Form.Select
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  isInvalid={!!errors.supplier}
                >
                  <option value="">Select a supplier...</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.supplier}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            {/* Pricing & Stock */}
            <Col md={12}>
              <h6 className="text-muted mb-3 mt-4">
                <i className="bi bi-currency-dollar me-2"></i>
                Pricing & Stock
              </h6>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Cost Price</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    isInvalid={!!errors.costPrice}
                    placeholder="0.00"
                  />
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.costPrice}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Selling Price *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    isInvalid={!!errors.price}
                    placeholder="0.00"
                  />
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.price}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Current Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  isInvalid={!!errors.stock}
                  placeholder="0"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.stock}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group>
                <Form.Label>Low Stock Alert</Form.Label>
                <Form.Control
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  isInvalid={!!errors.lowStockThreshold}
                  placeholder="10"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lowStockThreshold}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            {/* Additional Information */}
            <Col md={12}>
              <h6 className="text-muted mb-3 mt-4">
                <i className="bi bi-gear me-2"></i>
                Additional Information
              </h6>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label>Barcode</Form.Label>
                <Form.Control
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Enter barcode"
                />
              </Form.Group>
            </Col>
            
            {/* Profit Margin Display */}
            {formData.price > 0 && formData.costPrice > 0 && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Profit Margin</Form.Label>
                  <div className="form-control-plaintext">
                    <Badge bg="success">
                      {(((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1)}%
                    </Badge>
                    <span className="ms-2 text-muted">
                      ${(formData.price - formData.costPrice).toFixed(2)} profit
                    </span>
                  </div>
                </Form.Group>
              </Col>
            )}
            
            {/* Image Upload */}
            <Col md={12}>
              <h6 className="text-muted mb-3 mt-4">
                <i className="bi bi-image me-2"></i>
                Product Images
              </h6>
              
              <Form.Group>
                <Form.Label>Upload Images (Max 5, 5MB each)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Form.Text className="text-muted">
                  Supported formats: JPG, PNG, GIF. Maximum 5MB per image.
                </Form.Text>
              </Form.Group>
              
              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div className="mt-3">
                  <Row className="g-2">
                    {imagePreview.map((preview, index) => (
                      <Col key={index} xs={6} md={3}>
                        <div className="position-relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="img-thumbnail w-100"
                            style={{ height: '100px', objectFit: 'cover' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={() => removeImage(index)}
                          >
                            <i className="bi bi-x"></i>
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Col>
          </Row>
          
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger" className="mt-3">
              <Alert.Heading>Please fix the following errors:</Alert.Heading>
              <ul className="mb-0">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          {!isViewMode && (
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting || loading}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {mode === 'add' ? 'Adding...' : 'Updating...'}
                </>
              ) : (
                <>
                  <i className={`bi ${mode === 'add' ? 'bi-plus' : 'bi-check'} me-2`}></i>
                  {submitButtonText}
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductModal;