import { useState, useEffect } from 'react';
import { Card, Alert, Badge, Button, Table, Modal, Form, Row, Col, Accordion } from 'react-bootstrap';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const StockAlerts = () => {
  const { 
    products, 
    categories,
    getLowStockProducts, 
    getOutOfStockProducts,
    updateProductStock,
    getProductsByCategory,
    STOCK_STATUS 
  } = useProducts();
  const { hasPermission } = useAuth();
  
  const [showQuickRestock, setShowQuickRestock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [alertSettings, setAlertSettings] = useState({
    showLowStock: true,
    showOutOfStock: true,
    autoRefresh: true
  });

  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();
  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

  // Get categories that have low stock or out of stock products
  const getCategoriesWithAlerts = () => {
    const alertProducts = [...lowStockProducts, ...outOfStockProducts];
    const categoriesWithAlerts = new Map();
    
    alertProducts.forEach(product => {
      const categoryName = product.category;
      if (!categoriesWithAlerts.has(categoryName)) {
        const category = categories.find(cat => 
          (typeof cat === 'string' ? cat : cat.name) === categoryName
        );
        categoriesWithAlerts.set(categoryName, {
          name: categoryName,
          color: category && typeof category === 'object' ? category.color : '#007bff',
          lowStockProducts: [],
          outOfStockProducts: []
        });
      }
      
      const categoryData = categoriesWithAlerts.get(categoryName);
      if (product.stock === 0) {
        categoryData.outOfStockProducts.push(product);
      } else {
        categoryData.lowStockProducts.push(product);
      }
    });
    
    return Array.from(categoriesWithAlerts.values());
  };

  const categoriesWithAlerts = getCategoriesWithAlerts();

  const handleQuickRestock = (product) => {
    setSelectedProduct(product);
    setRestockQuantity('');
    setShowQuickRestock(true);
  };

  const handleRestockSubmit = async () => {
    if (!selectedProduct || !restockQuantity || restockQuantity <= 0) {
      toast.error('Please enter a valid restock quantity');
      return;
    }

    try {
      const newStock = selectedProduct.stock + parseInt(restockQuantity);
      await updateProductStock(selectedProduct.id, newStock);
      toast.success(`Successfully restocked ${selectedProduct.name}`);
      setShowQuickRestock(false);
      setSelectedProduct(null);
      setRestockQuantity('');
    } catch (error) {
      console.error('Error restocking product:', error);
      toast.error('Failed to restock product');
    }
  };

  const getAlertVariant = (product) => {
    return product.stock === 0 ? 'danger' : 'warning';
  };

  // Auto-refresh alerts every 30 seconds if enabled
  useEffect(() => {
    if (!alertSettings.autoRefresh) return;
    
    const interval = setInterval(() => {
      setAlertSettings(prev => ({ ...prev }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [alertSettings.autoRefresh]);

  return (
    <>
      {/* Alert Summary */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-bell-fill me-2"></i>
              Stock Alerts by Category
            </h5>
            <div className="d-flex align-items-center gap-2">
              <Badge bg={totalAlerts > 0 ? 'danger' : 'success'}>
                {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
              </Badge>
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setAlertSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
              >
                <i className={`bi bi-arrow-repeat ${alertSettings.autoRefresh ? 'text-success' : ''}`}></i>
              </Button>
            </div>
          </div>
        </Card.Header>
        
        <Card.Body>
          {totalAlerts === 0 ? (
            <Alert variant="success" className="mb-0">
              <i className="bi bi-check-circle-fill me-2"></i>
              All products are adequately stocked! No alerts at this time.
            </Alert>
          ) : (
            <Row className="g-3">
              <Col md={6}>
                <div className="d-flex align-items-center p-3 bg-danger bg-opacity-10 rounded">
                  <i className="bi bi-exclamation-triangle-fill text-danger fs-4 me-3"></i>
                  <div>
                    <h6 className="mb-1 text-danger">Out of Stock</h6>
                    <p className="mb-0">{outOfStockProducts.length} products need immediate attention</p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="d-flex align-items-center p-3 bg-warning bg-opacity-10 rounded">
                  <i className="bi bi-exclamation-circle-fill text-warning fs-4 me-3"></i>
                  <div>
                    <h6 className="mb-1 text-warning">Low Stock</h6>
                    <p className="mb-0">{lowStockProducts.length} products running low</p>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Categories with Alerts */}
      {categoriesWithAlerts.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <i className="bi bi-tags me-2"></i>
              Categories Requiring Attention ({categoriesWithAlerts.length})
            </h5>
          </Card.Header>
          
          <Card.Body className="p-0">
            <Accordion flush>
              {categoriesWithAlerts.map((category, index) => {
                const totalCategoryAlerts = category.lowStockProducts.length + category.outOfStockProducts.length;
                return (
                  <Accordion.Item eventKey={index.toString()} key={category.name}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center w-100">
                        <div 
                          className="rounded me-3" 
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            backgroundColor: category.color 
                          }}
                        ></div>
                        <div className="flex-grow-1">
                          <strong>{category.name}</strong>
                          <div className="small text-muted">
                            {category.outOfStockProducts.length > 0 && (
                              <span className="text-danger me-3">
                                {category.outOfStockProducts.length} out of stock
                              </span>
                            )}
                            {category.lowStockProducts.length > 0 && (
                              <span className="text-warning">
                                {category.lowStockProducts.length} low stock
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge bg="danger">{totalCategoryAlerts}</Badge>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Table responsive hover className="mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Priority</th>
                            <th>Product</th>
                            <th>Current Stock</th>
                            <th>Threshold</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Out of Stock Products First */}
                          {category.outOfStockProducts.map((product) => (
                            <tr key={product.id} className="table-danger">
                              <td>
                                <Badge bg="danger">
                                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                  Critical
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-light rounded me-3" style={{ width: '40px', height: '40px' }}>
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
                                    <small className="text-muted">{product.sku}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="fw-bold text-danger">0</span>
                              </td>
                              <td>{product.lowStockThreshold}</td>
                              <td>
                                <Badge bg="danger">Out of Stock</Badge>
                              </td>
                              <td>
                                {hasPermission('canManageInventory') && (
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleQuickRestock(product)}
                                  >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Restock
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                          
                          {/* Low Stock Products */}
                          {category.lowStockProducts.map((product) => (
                            <tr key={product.id} className="table-warning">
                              <td>
                                <Badge bg="warning">
                                  <i className="bi bi-exclamation-circle-fill me-1"></i>
                                  Warning
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="bg-light rounded me-3" style={{ width: '40px', height: '40px' }}>
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
                                    <small className="text-muted">{product.sku}</small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="fw-bold text-warning">{product.stock}</span>
                              </td>
                              <td>{product.lowStockThreshold}</td>
                              <td>
                                <Badge bg="warning">Low Stock</Badge>
                              </td>
                              <td>
                                {hasPermission('canManageInventory') && (
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleQuickRestock(product)}
                                  >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Restock
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Card.Body>
        </Card>
      )}

      {/* Quick Restock Modal */}
      <Modal show={showQuickRestock} onHide={() => setShowQuickRestock(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Quick Restock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-light rounded me-3" style={{ width: '48px', height: '48px' }}>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img 
                      src={selectedProduct.images[0]} 
                      alt={selectedProduct.name}
                      className="w-100 h-100 object-fit-cover rounded"
                    />
                  ) : (
                    <i className="bi bi-box-seam d-flex align-items-center justify-content-center h-100"></i>
                  )}
                </div>
                <div>
                  <h6 className="mb-1">{selectedProduct.name}</h6>
                  <p className="mb-0 text-muted">Current Stock: {selectedProduct.stock}</p>
                </div>
              </div>
              
              <Form.Group>
                <Form.Label>Restock Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="Enter quantity to add"
                  autoFocus
                />
                {restockQuantity && (
                  <Form.Text className="text-muted">
                    New stock level will be: {selectedProduct.stock + parseInt(restockQuantity || 0)}
                  </Form.Text>
                )}
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuickRestock(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRestockSubmit}>
            <i className="bi bi-plus-circle me-2"></i>
            Restock
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StockAlerts;