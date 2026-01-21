import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { categories } from '../data/mockData';
import './AccessoriesPage.css';

export const AccessoriesPage = () => {
  const navigate = useNavigate();
  const { subcategory } = useParams();

  // Get gender selection if coming from accessories detail page
  const accessoriesCategories = categories.accessories || [];

  // If no subcategory, show main accessories categories
  if (!subcategory) {
    return (
      <div className="accessories-page" data-testid="accessories-page">
        <div className="page-header">
          <Button variant="ghost" onClick={() => navigate('/')} className="back-btn" data-testid="back-btn">
            <ArrowLeft size={20} /> Back to Home
          </Button>
          <h1 className="page-title" data-testid="page-title">Accessories Collection</h1>
          <p className="page-subtitle">Choose from our wide range of accessories</p>
        </div>

        <section className="categories-section">
          <div className="categories-grid">
            {accessoriesCategories.map(category => (
              <Card 
                key={category.id} 
                className="category-card"
                onClick={() => navigate(`/accessories/${category.id}`)}
                data-testid={`category-${category.id}`}
              >
                <CardContent className="category-card-content">
                  <div className="category-icon-svg">
                    <Package size={56} strokeWidth={1.5} />
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                  <Button variant="ghost" className="view-btn">
                    View Collection <ChevronRight size={18} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // If subcategory is selected, show gender selection
  const selectedCategory = accessoriesCategories.find(cat => cat.id === subcategory);

  return (
    <div className="accessories-page" data-testid="accessories-gender-page">
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate('/category/accessories')} className="back-btn" data-testid="back-btn">
          <ArrowLeft size={20} /> Back
        </Button>
        <h1 className="page-title">{selectedCategory?.name || 'Accessories'}</h1>
        <p className="page-subtitle">Select category</p>
      </div>

      <section className="gender-selection-section">
        <div className="gender-selection-grid">
          <Card 
            className="gender-selection-card"
            onClick={() => navigate(`/products/men/${subcategory}`)}
            data-testid="men-card"
          >
            <CardContent className="gender-selection-content">
              <h3>Men's {selectedCategory?.name}</h3>
              <Button variant="ghost" className="select-btn">
                View <ChevronRight size={18} />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="gender-selection-card"
            onClick={() => navigate(`/products/women/${subcategory}`)}
            data-testid="women-card"
          >
            <CardContent className="gender-selection-content">
              <h3>Women's {selectedCategory?.name}</h3>
              <Button variant="ghost" className="select-btn">
                View <ChevronRight size={18} />
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="gender-selection-card"
            onClick={() => navigate(`/products/kids/${subcategory}`)}
            data-testid="kids-card"
          >
            <CardContent className="gender-selection-content">
              <h3>Kids' {selectedCategory?.name}</h3>
              <Button variant="ghost" className="select-btn">
                View <ChevronRight size={18} />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};