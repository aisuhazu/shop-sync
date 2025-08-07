import { useMemo } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { useSuppliers } from '../contexts/SupplierContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { products, getLowStockProducts } = useProducts();
  const { orders } = useOrders();
  const { suppliers } = useSuppliers();

  const handleAddProduct = () => {
    navigate('/inventory');
  };

  const handleNewOrder = () => {
    navigate('/orders');
  };

  const handleAddSupplier = () => {
    navigate('/suppliers');
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log('Export data functionality to be implemented');
  };

  // Calculate real statistics from Firebase data
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStockItems = getLowStockProducts().length;
    
    const activeOrders = orders.filter(order => 
      ['pending', 'confirmed', 'shipped'].includes(order.status)
    ).length;
    
    // Calculate total revenue from completed orders
    const totalRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.total || 0), 0);

    return [
      {
        title: 'Total Products',
        value: totalProducts.toLocaleString(),
        icon: 'bi-box-seam',
        color: 'primary',
        change: totalProducts > 0 ? 'Active' : 'No data'
      },
      {
        title: 'Low Stock Items',
        value: lowStockItems.toLocaleString(),
        icon: 'bi-exclamation-triangle',
        color: lowStockItems > 0 ? 'warning' : 'success',
        change: lowStockItems > 0 ? 'Needs attention' : 'All good'
      },
      {
        title: 'Active Orders',
        value: activeOrders.toLocaleString(),
        icon: 'bi-receipt',
        color: 'success',
        change: activeOrders > 0 ? 'In Progress' : 'No active orders'
      },
      {
        title: 'Revenue',
        value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: 'bi-currency-dollar',
        color: 'info',
        change: totalRevenue > 0 ? 'From completed orders' : 'No revenue'
      }
    ];
  }, [products, orders, getLowStockProducts]);

  return (
    <Layout>
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Dashboard Overview</h2>
          <div className="text-muted">
            <i className="bi bi-calendar me-2"></i>
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          {stats.map((stat, index) => (
            <Col key={index} sm={6} lg={3}>
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className={`stats-icon bg-${stat.color} me-3`}>
                      <i className={`bi ${stat.icon}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h3 className="mb-0">{stat.value}</h3>
                      <p className="text-muted mb-0">{stat.title}</p>
                      <small className="text-muted">
                        {stat.change}
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <Row className="g-4">
          <Col md={8}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center py-5">
                  <i className="bi bi-graph-up text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">Analytics Coming Soon</h5>
                  <p className="text-muted">Charts and graphs will be displayed here</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <button className="btn btn-primary" onClick={handleAddProduct}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Product
                  </button>
                  <button className="btn btn-outline-primary" onClick={handleNewOrder}>
                    <i className="bi bi-receipt me-2"></i>
                    New Order
                  </button>
                  <button className="btn btn-outline-primary" onClick={handleAddSupplier}>
                    <i className="bi bi-truck me-2"></i>
                    Add Supplier
                  </button>
                  <button className="btn btn-outline-secondary" onClick={handleExportData}>
                    <i className="bi bi-download me-2"></i>
                    Export Data
                  </button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default DashboardPage;