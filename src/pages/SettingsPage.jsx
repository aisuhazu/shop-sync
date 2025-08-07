import React from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import Layout from '../components/common/Layout';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <Layout>
      <Container fluid>
        <h2 className="mb-4">Settings</h2>

        <Row className="g-4">
          {/* Profile Settings */}
          <Col lg={6}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Profile Settings</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Display Name</Form.Label>
                    <Form.Control
                      type="text"
                      defaultValue={currentUser?.displayName || ''}
                      placeholder="Enter your display name"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      defaultValue={currentUser?.email || ''}
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Email cannot be changed
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Control
                      type="text"
                      value={userRole || 'staff'}
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Contact admin to change role
                    </Form.Text>
                  </Form.Group>

                  <Button variant="primary">
                    Update Profile
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* System Settings (Admin Only) */}
          {userRole === 'admin' && (
            <Col lg={6}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">System Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    Admin-only settings will be implemented here
                  </Alert>
                  
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Low Stock Threshold</Form.Label>
                      <Form.Control
                        type="number"
                        defaultValue={10}
                        min={1}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        label="Email notifications"
                        defaultChecked
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="switch"
                        label="Auto-reorder when low stock"
                        defaultChecked={false}
                      />
                    </Form.Group>

                    <Button variant="success">
                      Save Settings
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </Layout>
  );
};

export default SettingsPage;