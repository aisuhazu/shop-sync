import { useState } from 'react';
import { Card, Button, Table, Badge, Dropdown, Alert, Form, InputGroup } from 'react-bootstrap';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import CategoryModal from './CategoryModal';
import toast from 'react-hot-toast';

const CategoryManagement = () => {
  const { 
    categories, 
    deleteCategory, 
    getProductsByCategory,
    PRODUCT_CATEGORIES 
  } = useProducts();
  const { hasPermission } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category => {
    // Handle both string and object categories
    if (typeof category === 'string') {
      return category.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Handle object categories
    return (
      category && 
      category.name && 
      (category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }).sort((a, b) => {
    // Sort alphabetically by category name
    const nameA = typeof a === 'string' ? a : a.name;
    const nameB = typeof b === 'string' ? b : b.name;
    return nameA.toLowerCase().localeCompare(nameB.toLowerCase());
  });

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteCategory = async (category) => {
    if (!hasPermission('canManageInventory')) {
      toast.error('You do not have permission to delete categories');
      return;
    }
    
    // Check if category has products
    const productsInCategory = getProductsByCategory(category.name);
    if (productsInCategory.length > 0) {
      toast.error(`Cannot delete category "${category.name}" because it contains ${productsInCategory.length} product(s)`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
        toast.success('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const getCategoryProductCount = (categoryName) => {
    return getProductsByCategory(categoryName).length;
  };

  return (
    <>
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Category Management</h5>
            {hasPermission('canManageInventory') && (
              <Button variant="primary" size="sm" onClick={handleAddCategory}>
                <i className="bi bi-plus-circle me-2"></i>
                Add Category
              </Button>
            )}
          </div>
        </Card.Header>
        
        <Card.Body>
          {/* Search */}
          <div className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
          
          {!hasPermission('canManageInventory') && (
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              You have read-only access to category information.
            </Alert>
          )}
          
          {/* Categories Table */}
          <div className="table-responsive">
            <Table hover>
              <thead className="table-light">
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Color</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => {
                  const productCount = getCategoryProductCount(category.name);
                  return (
                    <tr key={category.id || category.name}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div 
                            className="rounded me-2" 
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              backgroundColor: category.color || '#007bff' 
                            }}
                          ></div>
                          <span className="fw-bold">{category.name}</span>
                        </div>
                      </td>
                      <td>
                        {category.description ? (
                          <span className="text-muted">{category.description}</span>
                        ) : (
                          <span className="text-muted fst-italic">No description</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={productCount > 0 ? 'primary' : 'secondary'}>
                          {productCount} product{productCount !== 1 ? 's' : ''}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="rounded" 
                            style={{ 
                              width: '30px', 
                              height: '20px', 
                              backgroundColor: category.color || '#007bff',
                              border: '1px solid #dee2e6'
                            }}
                          ></div>
                          <code className="small">{category.color || '#007bff'}</code>
                        </div>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <i className="bi bi-three-dots"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {hasPermission('canManageInventory') && (
                              <>
                                <Dropdown.Item onClick={() => handleEditCategory(category)}>
                                  <i className="bi bi-pencil me-2"></i>
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  className="text-danger"
                                  onClick={() => handleDeleteCategory(category)}
                                  disabled={productCount > 0}
                                >
                                  <i className="bi bi-trash me-2"></i>
                                  Delete
                                </Dropdown.Item>
                              </>
                            )}
                            {!hasPermission('canManageInventory') && (
                              <Dropdown.Item disabled>
                                <i className="bi bi-eye me-2"></i>
                                View Only
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-category-cards">
            {filteredCategories.map((category) => {
              const productCount = getCategoryProductCount(category.name);
              return (
                <div key={category.id || category.name} className="mobile-category-card">
                  <div className="mobile-category-header">
                    <div 
                      className="mobile-category-color"
                      style={{
                        backgroundColor: '#f8f9fa'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          width: '30px',
                          height: '30px',
                          backgroundColor: category.color || '#007bff',
                          borderRadius: '0.25rem'
                        }}
                      ></div>
                    </div>
                    <div className="mobile-category-info">
                      <div className="mobile-category-name">{category.name}</div>
                      <div className="mobile-category-description">
                        {category.description || 'No description'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mobile-category-details">
                    <div className="mobile-category-detail-item">
                      <div className="mobile-category-detail-label">Products</div>
                      <div className="mobile-category-detail-value">
                        <Badge 
                          className="mobile-category-product-badge"
                          bg={productCount > 0 ? 'primary' : 'secondary'}
                        >
                          {productCount} product{productCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mobile-category-detail-item">
                      <div className="mobile-category-detail-label">Color Code</div>
                      <div className="mobile-category-detail-value">
                        <code className="mobile-category-color-code">
                          {category.color || '#007bff'}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mobile-category-actions">
                    <div className="mobile-category-status">
                      {/* Status or additional info can go here */}
                    </div>
                    <div className="mobile-category-menu">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                        >
                          <i className="bi bi-three-dots"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          {hasPermission('canManageInventory') && (
                            <>
                              <Dropdown.Item onClick={() => handleEditCategory(category)}>
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                className="text-danger"
                                onClick={() => handleDeleteCategory(category)}
                                disabled={productCount > 0}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </Dropdown.Item>
                            </>
                          )}
                          {!hasPermission('canManageInventory') && (
                            <Dropdown.Item disabled>
                              <i className="bi bi-eye me-2"></i>
                              View Only
                            </Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredCategories.length === 0 && (
            <div className="text-center py-4">
              <i className="bi bi-tags display-1 text-muted"></i>
              <h6 className="mt-3 text-muted">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h6>
              <p className="text-muted">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Start by adding your first product category'
                }
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Category Modal */}
      <CategoryModal
        show={showModal}
        onHide={() => setShowModal(false)}
        category={selectedCategory}
        mode={modalMode}
      />
    </>
  );
};

export default CategoryManagement;