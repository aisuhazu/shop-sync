import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CategoryModal = ({ show, onHide, category = null, mode = 'add' }) => {
  const { addCategory, updateCategory, categories } = useProducts();
  const { hasPermission } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#007bff'
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data when category changes
  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        color: category.color || '#007bff'
      });
    } else {
      // Reset form for add mode
      setFormData({
        name: '',
        description: '',
        color: '#007bff'
      });
    }
    setErrors({});
  }, [category, mode, show]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
    }
    
    // Check for duplicate category names (excluding current category in edit mode)
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      (mode === 'add' || cat.id !== category?.id)
    );
    
    if (existingCategory) {
      newErrors.name = 'A category with this name already exists';
    }
    
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!hasPermission('canManageInventory')) {
      toast.error('You do not have permission to manage categories');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim()
      };
      
      if (mode === 'edit') {
        await updateCategory(category.id, categoryData);
        toast.success('Category updated successfully!');
      } else {
        await addCategory(categoryData);
        toast.success('Category added successfully!');
      }
      
      onHide();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(mode === 'edit' ? 'Failed to update category' : 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {mode === 'edit' ? 'Edit Category' : 'Add New Category'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {!hasPermission('canManageInventory') && (
            <Alert variant="warning">
              You do not have permission to manage categories.
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Category Name *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              isInvalid={!!errors.name}
              placeholder="Enter category name"
              disabled={!hasPermission('canManageInventory')}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              isInvalid={!!errors.description}
              placeholder="Enter category description (optional)"
              disabled={!hasPermission('canManageInventory')}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {formData.description.length}/200 characters
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <div className="d-flex align-items-center gap-3">
              <Form.Control
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                style={{ width: '60px', height: '40px' }}
                disabled={!hasPermission('canManageInventory')}
              />
              <Form.Control
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#007bff"
                disabled={!hasPermission('canManageInventory')}
              />
            </div>
            <Form.Text className="text-muted">
              This color will be used for category badges and visual identification.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          {hasPermission('canManageInventory') && (
            <Button 
              variant="primary" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {mode === 'edit' ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                mode === 'edit' ? 'Update Category' : 'Add Category'
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryModal;