import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import './OwnerSectionPage.css';

export const OwnerSectionPage = () => {
  const navigate = useNavigate();
  const { section } = useParams(); // men, women, kids, accessories
  const { isAuthenticated, loading } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    loadCategories();
  }, [section]);

  const loadCategories = () => {
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
        { id: 'western', name: 'Western Wears' },
        { id: 'bottomwear', name: 'Bottom Wears' },
        { id: 'casual', name: 'Casual Wears' },
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
        { id: 'belts', name: 'Belts', directToAdd: true },
        { id: 'towels', name: 'Towels', directToAdd: true },
        { id: 'kerchief', name: 'Kerchief', directToAdd: true },
        { id: 'others', name: 'Others', directToAdd: true }
      ]
    };

    setCategories(categoryMap[section] || []);
  };

  const handleCategoryClick = (category) => {
    // For accessories, go directly to Add Product page
    if (section === 'accessories' && category.directToAdd) {
      navigate(`/owner/add-product/${section}/${category.id}`);
      return;
    }
    
    if (section === 'kids') {
      navigate(`/owner/products/${section}/${category.ageGroup}/${category.gender}`);
    } else {
      navigate(`/owner/products/${section}/${category.id}`);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const sectionTitles = {
    men: "Men's Section",
    women: "Women's Section",
    kids: "Kids Section",
    accessories: "Accessories Section"
  };

  return (
    <div className="owner-section-page">
      <header className="section-header">
        <Button variant="outline" onClick={() => navigate('/owner/dashboard')} data-testid="back-to-dashboard-btn">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Button>
        <div className="section-header-content">
          <h1>{sectionTitles[section] || 'Section'}</h1>
          <p>Select a category to view and manage products</p>
        </div>
      </header>

      <div className="section-content">
        <div className="categories-grid">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category)}
              data-testid={`category-card-${category.id}`}
            >
              <CardContent className="category-card-content">
                <h3>{category.name}</h3>
                {category.subcategories && (
                  <p className="subcategories">
                    {category.subcategories.join(', ')}
                  </p>
                )}
                <Button variant="ghost" className="view-btn">
                  {category.directToAdd ? 'Add Product →' : 'View Products →'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
