import { Badge, Dropdown } from 'react-bootstrap';
import { useProducts } from '../../contexts/ProductContext';
import { Link, useNavigate } from 'react-router-dom';

const AlertBadge = () => {
  const { getLowStockProducts, getOutOfStockProducts } = useProducts();
  const navigate = useNavigate();
  
  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();
  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;
  
  if (totalAlerts === 0) return null;

  // Handle navigation to inventory with alerts tab
  const handleViewAllAlerts = () => {
    navigate('/inventory?tab=alerts');
  };

  // Handle individual alert click
  const handleAlertClick = (product) => {
    navigate('/inventory', { state: { selectedProduct: product, openModal: true } });
  };
  
  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="link" 
        className="text-decoration-none position-relative p-2"
        style={{ border: 'none', boxShadow: 'none' }}
      >
        <i className="bi bi-bell text-warning fs-4"></i>
        <Badge 
          bg="danger" 
          className="position-absolute rounded-circle"
          style={{ 
            fontSize: '0.6rem',
            top: '2px',
            right: '2px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            lineHeight: '1'
          }}
        >
          {totalAlerts}
        </Badge>
      </Dropdown.Toggle>
      
      <Dropdown.Menu style={{ minWidth: '320px' }}>
        <Dropdown.Header>
          <i className="bi bi-bell-fill me-2"></i>
          Stock Alerts ({totalAlerts})
        </Dropdown.Header>
        
        {outOfStockProducts.slice(0, 3).map(product => (
          <Dropdown.Item 
            key={product.id} 
            className="py-2"
            onClick={() => handleAlertClick(product)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
              <div className="flex-grow-1">
                <div className="fw-bold small">{product.name}</div>
                <div className="text-muted small">Out of stock - Click to view details</div>
              </div>
            </div>
          </Dropdown.Item>
        ))}
        
        {lowStockProducts.slice(0, 3).map(product => (
          <Dropdown.Item 
            key={product.id} 
            className="py-2"
            onClick={() => handleAlertClick(product)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              <div className="flex-grow-1">
                <div className="fw-bold small">{product.name}</div>
                <div className="text-muted small">
                  Low stock: {product.stock} remaining
                </div>
              </div>
            </div>
          </Dropdown.Item>
        ))}
        
        <Dropdown.Divider />
        
        <Dropdown.Item 
          onClick={handleViewAllAlerts}
          className="text-center fw-bold"
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-arrow-right me-2"></i>
          View All Alerts
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AlertBadge;