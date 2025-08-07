import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const features = [
    {
      icon: "bi-box-seam",
      title: "Inventory Management",
      description:
        "Track your products, manage stock levels, and get low-stock alerts in real-time.",
    },
    {
      icon: "bi-cart-check",
      title: "Order Processing",
      description:
        "Streamline your order workflow from creation to fulfillment with ease.",
    },
    {
      icon: "bi-people",
      title: "Supplier Management",
      description:
        "Maintain supplier relationships and track purchase orders efficiently.",
    },
    {
      icon: "bi-graph-up",
      title: "Analytics & Reports",
      description:
        "Get insights into your business with comprehensive analytics and reporting.",
    },
    {
      icon: "bi-bell",
      title: "Smart Notifications",
      description:
        "Stay informed with intelligent alerts for stock levels and important updates.",
    },
    {
      icon: "bi-shield-check",
      title: "Secure & Reliable",
      description:
        "Your data is protected with enterprise-grade security and cloud backup.",
    },
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <Container>
          <Link className="navbar-brand fw-bold text-primary" to="/">
            <i className="bi bi-shop me-2"></i>
            ShopSync
          </Link>
          <div className="ms-auto">
            <Link to="/login" className="btn btn-outline-primary me-2">
              Login
            </Link>
            <Link to="/login" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section
        className="hero-section bg-gradient-modern text-white py-5"
        style={{ marginTop: "76px" }}
      >
        <Container className="d-flex align-items-center">
          <Row className="w-100 align-items-center">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">
                  Streamline Your Business with
                  <span className="text-warning"> ShopSync</span>
                </h1>
                <p className="lead mb-4">
                  The complete inventory management solution for modern
                  businesses. Track products, manage orders, and grow your
                  business with confidence.
                </p>
                <div className="hero-buttons">
                  <Link
                    to="/login"
                    className="btn btn-warning btn-lg me-3 px-4 py-3"
                  >
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Start Free Trial
                  </Link>
                  <Button
                    variant="outline-light"
                    size="lg"
                    className="px-4 py-3"
                  >
                    <i className="bi bi-play-circle me-2"></i>
                    Watch Demo
                  </Button>
                </div>
                <div className="hero-stats mt-5">
                  <Row>
                    <Col xs={4}>
                      <div className="stat-item text-center">
                        <h3 className="fw-bold mb-1">10K+</h3>
                        <small className="text-light">Products Managed</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="stat-item text-center">
                        <h3 className="fw-bold mb-1">500+</h3>
                        <small className="text-light">Happy Businesses</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="stat-item text-center">
                        <h3 className="fw-bold mb-1">99.9%</h3>
                        <small className="text-light">Uptime</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div className="dashboard-preview">
                <div className="mockup-browser bg-white rounded-3 shadow-lg">
                  <div className="mockup-browser-toolbar bg-light p-2 rounded-top">
                    <div className="d-flex align-items-center">
                      <div className="mockup-dot bg-danger rounded-circle me-1" style={{width: '8px', height: '8px'}}></div>
                      <div className="mockup-dot bg-warning rounded-circle me-1" style={{width: '8px', height: '8px'}}></div>
                      <div className="mockup-dot bg-success rounded-circle me-2" style={{width: '8px', height: '8px'}}></div>
                      <small className="text-muted">ShopSync Dashboard</small>
                    </div>
                  </div>
                  <div className="mockup-content p-3">
                    <div className="row g-2 mb-3">
                      <div className="col-4">
                        <div className="bg-primary bg-opacity-10 p-2 rounded text-center">
                          <i className="bi bi-box-seam text-primary fs-4"></i>
                          <div className="small fw-bold text-primary mt-1">1,234</div>
                          <div className="small text-muted">Products</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="bg-success bg-opacity-10 p-2 rounded text-center">
                          <i className="bi bi-cart-check text-success fs-4"></i>
                          <div className="small fw-bold text-success mt-1">89</div>
                          <div className="small text-muted">Orders</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="bg-warning bg-opacity-10 p-2 rounded text-center">
                          <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
                          <div className="small fw-bold text-warning mt-1">12</div>
                          <div className="small text-muted">Low Stock</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-light rounded p-2 mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded me-2" style={{width: '20px', height: '20px'}}></div>
                          <small className="fw-bold">Wireless Headphones</small>
                        </div>
                        <small className="text-success fw-bold">$89.99</small>
                      </div>
                    </div>
                    <div className="bg-light rounded p-2 mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="bg-success rounded me-2" style={{width: '20px', height: '20px'}}></div>
                          <small className="fw-bold">Smart Watch</small>
                        </div>
                        <small className="text-success fw-bold">$199.99</small>
                      </div>
                    </div>
                    <div className="bg-light rounded p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="bg-warning rounded me-2" style={{width: '20px', height: '20px'}}></div>
                          <small className="fw-bold">Laptop Stand</small>
                        </div>
                        <small className="text-warning fw-bold">Low Stock</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-3">
                Everything You Need to Manage Your Inventory
              </h2>
              <p className="lead text-muted">
                ShopSync provides all the tools you need to streamline your
                business operations and boost productivity.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index}>
                <Card className="h-100 border-0 shadow-sm hover-lift">
                  <Card.Body className="text-center p-4">
                    <div
                      className="feature-icon bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className={`${feature.icon} text-primary fs-2`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-3">
                Ready to Transform Your Business?
              </h2>
              <p className="lead mb-4">
                Join thousands of businesses already using ShopSync to
                streamline their operations.
              </p>
              <Link to="/login" className="btn btn-warning btn-lg px-5 py-3">
                <i className="bi bi-rocket-takeoff me-2"></i>
                Get Started Today
              </Link>
              <div className="mt-4">
                <small className="text-light">
                  No credit card required • 14-day free trial • Cancel anytime
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <i className="bi bi-shop me-2 fs-4"></i>
                <span className="fw-bold fs-5">ShopSync</span>
              </div>
              <p className="text-light mb-0 mt-2">  {/* Changed from text-muted to text-light */}
                Streamline your business operations with confidence.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <p className="mb-0 text-light">  {/* Changed from text-muted to text-light */}
                © 2025 ShopSync. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
