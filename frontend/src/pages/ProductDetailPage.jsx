import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import './ProductDetailPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WHATSAPP_NUMBER = '918072153196';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      
      // Set initial image to primary image
      if (response.data.images && response.data.images.length > 0) {
        const primaryIndex = response.data.images.findIndex(img => img.is_primary);
        setCurrentImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    setShowWhatsAppDialog(true);
  };

  const handleConfirmWhatsApp = () => {
    const message = `Hi! I'm interested in:

Product: ${product.name}
Category: ${product.category}
Available Sizes: ${product.sizes.join(', ')}

Could you please provide more details?`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowWhatsAppDialog(false);
  };

  // Navigate to next image
  const nextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  // Navigate to previous image
  const prevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Touch event handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Swipe right to left = next image
    if (isLeftSwipe) {
      nextImage();
    }
    // Swipe left to right = previous image
    if (isRightSwipe) {
      prevImage();
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-message">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="not-found">
          <h2>Product Not Found</h2>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const currentImage = product.images && product.images.length > 0 
    ? product.images[currentImageIndex].url 
    : '/placeholder-image.png';

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="product-detail-page" data-testid="product-detail-page">
      <div className="product-detail-container">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="back-btn"
          data-testid="back-btn"
        >
          <ArrowLeft size={20} /> Back
        </Button>

        <div className="product-detail-grid">
          {/* Product Image Carousel */}
          <div className="product-image-section">
            <div 
              className="main-image-wrapper"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              data-testid="image-carousel"
            >
              <img 
                src={currentImage} 
                alt={`${product.name} - Image ${currentImageIndex + 1}`} 
                className="main-image"
                data-testid="product-main-image"
              />
              {product.is_new_arrival && (
                <span className="new-badge" data-testid="new-arrival-badge">fresh arrivals</span>
              )}
              
              {/* Navigation arrows - only show if multiple images */}
              {hasMultipleImages && (
                <>
                  <button 
                    className="image-nav-btn prev-btn" 
                    onClick={prevImage}
                    aria-label="Previous image"
                    data-testid="prev-image-btn"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="image-nav-btn next-btn" 
                    onClick={nextImage}
                    aria-label="Next image"
                    data-testid="next-image-btn"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Image indicator dots */}
                  <div className="image-indicators" data-testid="image-indicators">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Go to image ${index + 1}`}
                        data-testid={`indicator-dot-${index}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Swipe instruction */}
            {hasMultipleImages && (
              <p className="swipe-instruction" data-testid="swipe-instruction">
                Swipe right to left to view more images ({currentImageIndex + 1}/{product.images.length})
              </p>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <h1 className="product-title" data-testid="product-title">{product.name}</h1>
              <p className="product-short-desc" data-testid="product-short-desc">{product.short_description}</p>
              <p className="product-price" data-testid="product-price">₹{product.price}</p>
            </div>

            {/* Available Sizes */}
            <div className="sizes-section">
              <h3 className="section-heading">Available Sizes</h3>
              <div className="sizes-grid">
                {product.sizes.map(size => (
                  <div key={size} className="size-box" data-testid={`size-${size}`}>
                    <Check size={16} className="check-icon" />
                    <span>{size}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <Card className="product-details-card">
              <div className="detail-row">
                <span className="detail-label">Category:</span>
                <span className="detail-value">{product.category}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Subcategory:</span>
                <span className="detail-value">{product.subcategory}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fabric:</span>
                <span className="detail-value">{product.fabric}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Primary Color:</span>
                <span className="detail-value">{product.primary_color}</span>
              </div>
              {product.available_colors && product.available_colors.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Available Colors:</span>
                  <span className="detail-value">{product.available_colors.join(', ')}</span>
                </div>
              )}
              {product.description && (
                <div className="detail-row description-row">
                  <span className="detail-label">Description:</span>
                  <p className="detail-description">{product.description}</p>
                </div>
              )}
              {product.is_new_arrival && (
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value new-arrival-text">Fresh Arrival ✨</span>
                </div>
              )}
            </Card>

            {/* WhatsApp Button */}
            <Button 
              className="whatsapp-btn" 
              onClick={handleWhatsAppClick}
              data-testid="whatsapp-btn"
            >
              <MessageCircle size={20} />
              Inquire on WhatsApp
            </Button>

            <p className="inquiry-note">
              Click to send an inquiry about this product directly to our WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Confirmation Dialog */}
      <AlertDialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send WhatsApp Inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to send an inquiry for <strong>{product.name}</strong> to Milan Readymades on WhatsApp.
              <br /><br />
              The message will include:
              <ul className="whatsapp-message-preview">
                <li>Product Name: {product.name}</li>
                <li>Category: {product.category}</li>
                <li>Available Sizes: {product.sizes.join(', ')}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWhatsApp}>
              Confirm & Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
