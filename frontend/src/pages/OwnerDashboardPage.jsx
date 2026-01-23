import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Shirt, Layers, Baby, Package, LogOut, Home, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import './OwnerDashboardPage.css';

export const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout } = useAuth();
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const categoryMap = {
    men: [
      { id: 'traditional', name: 'Traditional Wear' },
      { id: 'shirts', name: 'Shirts' },
      { id: 'pants', name: 'Pants' },
      { id: 'inner-wears', name: 'Inner Wears' },
      { id: 'accessories', name: 'Accessories' }
    ],
    women: [
      { id: 'traditional', name: 'Traditional' },
      { id: 'ethnic', name: 'Ethnic' },
      { id: 'western-wears', name: 'Western Wears' },
      { id: 'bottom-wears', name: 'Bottom Wears' },
      { id: 'casual-wears', name: 'Casual Wears' },
      { id: 'inner-wears', name: 'Inner Wears' }
    ],
    kids: [
      { id: 'boys-0-3', name: 'Boys (0-3 years)', ageGroup: '0-3', gender: 'boys' },
      { id: 'boys-3-6', name: 'Boys (3-6 years)', ageGroup: '3-6', gender: 'boys' },
      { id: 'boys-6-9', name: 'Boys (6-9 years)', ageGroup: '6-9', gender: 'boys' },
      { id: 'boys-9-12', name: 'Boys (9-12 years)', ageGroup: '9-12', gender: 'boys' },
      { id: 'boys-12-15', name: 'Boys (12-15 years)', ageGroup: '12-15', gender: 'boys' },
      { id: 'girls-0-3', name: 'Girls (0-3 years)', ageGroup: '0-3', gender: 'girls' },
      { id: 'girls-3-6', name: 'Girls (3-6 years)', ageGroup: '3-6', gender: 'girls' },
      { id: 'girls-6-9', name: 'Girls (6-9 years)', ageGroup: '6-9', gender: 'girls' },
      { id: 'girls-9-12', name: 'Girls (9-12 years)', ageGroup: '9-12', gender: 'girls' },
      { id: 'girls-12-15', name: 'Girls (12-15 years)', ageGroup: '12-15', gender: 'girls' }
    ],
    accessories: [
      { id: 'belts', name: 'Belts' },
      { id: 'towels', name: 'Towels' },
      { id: 'kerchief', name: 'Kerchief' },
      { id: 'others', name: 'Others' }
    ]
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddItem = () => {
    setShowAddItemDialog(true);
    setSelectedSection('');
    setSelectedCategory('');
  };

  const handleProceedToAddProduct = () => {
    if (!selectedSection || !selectedCategory) return;

    const category = categoryMap[selectedSection].find(c => c.id === selectedCategory);
    
    if (selectedSection === 'kids' && category) {
      navigate(`/owner/add-product/${selectedSection}/${category.ageGroup}/${category.gender}`);
    } else {
      navigate(`/owner/add-product/${selectedSection}/${selectedCategory}`);
    }
    
    setShowAddItemDialog(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="owner-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Owner Dashboard</h1>
          <p className="dashboard-subtitle">Milan Readymades Management</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate('/')} data-testid="view-website-btn">
            <Home size={18} />
            View Website
          </Button>
          <Button variant="destructive" onClick={handleLogout} data-testid="logout-btn">
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </header>

      <div className="dashboard-content">
        <section className="section-intro">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2>Select a Section to Manage</h2>
              <p>Choose a category below to view and manage products</p>
            </div>
            <Button onClick={handleAddItem} data-testid="add-item-btn" size="lg">
              <Plus size={20} style={{ marginRight: '8px' }} />
              Add Item
            </Button>
          </div>
        </section>

        <div className="sections-grid">
          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/men')}
            data-testid="men-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Shirt size={64} strokeWidth={1.5} />
              </div>
              <h3>Men's Section</h3>
              <p>Manage men's traditional and contemporary wear</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/women')}
            data-testid="women-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Layers size={64} strokeWidth={1.5} />
              </div>
              <h3>Women's Section</h3>
              <p>Manage sarees, ethnic and western wear</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/kids')}
            data-testid="kids-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Baby size={64} strokeWidth={1.5} />
              </div>
              <h3>Kids Section</h3>
              <p>Manage kids traditional, casual and party wear</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="section-card" 
            onClick={() => navigate('/owner/section/accessories')}
            data-testid="accessories-section-card"
          >
            <CardContent className="section-card-content">
              <div className="section-icon">
                <Package size={64} strokeWidth={1.5} />
              </div>
              <h3>Accessories Section</h3>
              <p>Manage belts, towels, kerchief and more</p>
              <Button variant="ghost" className="manage-btn">
                Manage Products →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Select a section and category for the new product
            </DialogDescription>
          </DialogHeader>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger data-testid="section-select">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men's Section</SelectItem>
                  <SelectItem value="women">Women's Section</SelectItem>
                  <SelectItem value="kids">Kids Section</SelectItem>
                  <SelectItem value="accessories">Accessories Section</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedSection && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryMap[selectedSection]?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button 
              onClick={handleProceedToAddProduct} 
              disabled={!selectedSection || !selectedCategory}
              data-testid="proceed-add-product-btn"
            >
              Proceed to Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
