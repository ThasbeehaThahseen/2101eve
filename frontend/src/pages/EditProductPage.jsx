import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Upload, X, Check, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import { SketchPicker } from 'react-color';
import './EditProductPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = [
  'Upload Images',
  'Fabric Selection',
  'Primary Color',
  'Other Colors',
  'Sizes',
  'Item Details',
  'Detailed Description',
  'Price',
  'Fresh Arrival Tag',
  'Show in Fresh Arrivals',
  'Preview'
];

const SUBCATEGORY_MAP = {
  men: {
    traditional: ['Kurtas', 'Dhotis', 'Sherwanis'],
    shirts: ['Formal', 'Casual', 'Party'],
    pants: ['Formal', 'Casual', 'Jeans'],
    tshirts: ['Plain', 'Printed', 'Polo']
  },
  women: {
    sarees: ['Silk', 'Cotton', 'Designer'],
    salwar: ['Traditional', 'Modern', 'Party'],
    tops: ['Casual', 'Ethnic', 'Western'],
    leggings: ['Plain', 'Printed', 'Palazzo']
  },
  accessories: {
    belts: ['Leather', 'Fabric', 'Designer'],
    socks: ['Regular', 'Sports', 'Formal'],
    towels: ['Bath', 'Hand', 'Face'],
    others: ['General']
  }
};

const KIDS_SUBCATEGORIES = ['Traditional', 'Casual', 'Party', 'Ethnic', 'Western'];

export const EditProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { isAuthenticated, loading, token } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [editingFromPreview, setEditingFromPreview] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [formData, setFormData] = useState({
    images: [],
    fabric: '',
    customFabric: '',
    primaryColor: '',
    hasOtherColors: false,
    availableColors: [],
    sizes: [],
    itemName: '',
    shortDescription: '',
    detailedDescription: '',
    price: 0,
    isFreshArrival: false,
    category: '',
    subcategory: '',
    gender: '',
    ageGroup: ''
  });

  const [fabrics, setFabrics] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizeOptions, setSizeOptions] = useState({ letters: [], numbers: [], kids: [] });
  const [detectedColor, setDetectedColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [detectingColor, setDetectingColor] = useState(false);

  // Derive section from formData.category for size selection
  const section = formData.category || '';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMetadata();
      loadProduct();
    }
  }, [isAuthenticated, productId]);

  const loadMetadata = async () => {
    try {
      const [fabricsRes, colorsRes, sizesRes] = await Promise.all([
        axios.get(`${API}/metadata/all-fabrics`),
        axios.get(`${API}/metadata/colors`),
        axios.get(`${API}/metadata/sizes`)
      ]);

      setFabrics(fabricsRes.data.fabrics);
      setColors(colorsRes.data.colors);
      setSizeOptions(sizesRes.data);
    } catch (error) {
      console.error('Error loading metadata:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form data',
        variant: 'destructive'
      });
    }
  };

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      const response = await axios.get(`${API}/products/${productId}`);
      const product = response.data;

      setFormData({
        images: product.images || [],
        fabric: product.fabric || '',
        customFabric: '',
        primaryColor: product.primary_color || '',
        hasOtherColors: (product.available_colors || []).length > 0,
        availableColors: product.available_colors || [],
        sizes: product.sizes || [],
        itemName: product.name || '',
        shortDescription: product.short_description || '',
        detailedDescription: product.description || '',
        price: product.price || 0,
        isFreshArrival: product.is_new_arrival || false,
        category: product.category || '',
        subcategory: product.subcategory || '',
        gender: product.gender || '',
        ageGroup: product.age_group || ''
      });

      toast({
        title: 'Product Loaded',
        description: 'Product data loaded successfully'
      });
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product data',
        variant: 'destructive'
      });
      navigate('/owner/dashboard');
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 10) {
      toast({
        title: 'Too many images',
        description: 'You can upload maximum 10 images',
        variant: 'destructive'
      });
      return;
    }

    try {
      const uploadedImages = [];
      for (const file of files) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        const response = await axios.post(`${API}/upload-image`, formDataUpload, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        uploadedImages.push({
          url: response.data.image_url,
          base64: response.data.image_base64,
          is_primary: formData.images.length === 0 && uploadedImages.length === 0
        });
      }

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages]
      });

      toast({
        title: 'Success',
        description: 'Images uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // If removing the primary image, make the first one primary
    if (formData.images[index].is_primary && newImages.length > 0) {
      newImages[0].is_primary = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const makePrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  const detectColorFromImage = async () => {
    if (formData.images.length === 0) {
      toast({
        title: 'No images',
        description: 'Please upload at least one image first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setDetectingColor(true);
      const primaryImage = formData.images.find(img => img.is_primary) || formData.images[0];
      
      const formDataColor = new FormData();
      formDataColor.append('image_base64', primaryImage.base64);

      const response = await axios.post(`${API}/detect-color`, formDataColor, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDetectedColor(response.data.primary_color);
      setFormData({ ...formData, primaryColor: response.data.primary_color });
      
      toast({
        title: 'Color Detected',
        description: `Primary color detected as: ${response.data.primary_color}`
      });
    } catch (error) {
      console.error('Error detecting color:', error);
      toast({
        title: 'Error',
        description: 'Failed to detect color',
        variant: 'destructive'
      });
    } finally {
      setDetectingColor(false);
    }
  };

  const toggleColor = (color) => {
    const newColors = formData.availableColors.includes(color)
      ? formData.availableColors.filter(c => c !== color)
      : [...formData.availableColors, color];
    setFormData({ ...formData, availableColors: newColors });
  };

  const toggleSize = (size) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: newSizes });
  };

  const generateDescription = async () => {
    if (!formData.itemName || !formData.shortDescription) {
      toast({
        title: 'Missing Information',
        description: 'Please provide item name and short description first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setGeneratingDescription(true);
      const formDataDesc = new FormData();
      formDataDesc.append('item_name', formData.itemName);
      formDataDesc.append('short_description', formData.shortDescription);
      formDataDesc.append('category', formData.category);
      formDataDesc.append('subcategory', formData.subcategory);
      formDataDesc.append('fabric', formData.fabric);

      const response = await axios.post(`${API}/generate-description`, formDataDesc, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormData({ ...formData, detailedDescription: response.data.detailed_description });
      
      toast({
        title: 'Success',
        description: 'Description generated successfully'
      });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate description',
        variant: 'destructive'
      });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const addCustomFabric = async () => {
    if (!formData.customFabric.trim()) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a fabric name',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formDataFabric = new FormData();
      formDataFabric.append('fabric_name', formData.customFabric);

      await axios.post(`${API}/metadata/fabrics`, formDataFabric, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFabrics([...fabrics, formData.customFabric].sort());
      setFormData({ ...formData, fabric: formData.customFabric, customFabric: '' });
      
      toast({
        title: 'Success',
        description: 'Custom fabric added successfully'
      });
    } catch (error) {
      console.error('Error adding custom fabric:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to add custom fabric',
        variant: 'destructive'
      });
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // Images
        return formData.images.length >= 2;
      case 1: // Fabric
        return formData.fabric !== '';
      case 2: // Primary Color
        return formData.primaryColor !== '';
      case 3: // Other Colors
        return true; // Optional step
      case 4: // Sizes
        return formData.sizes.length > 0;
      case 5: // Item Details
        return formData.itemName && formData.shortDescription;
      case 6: // Detailed Description
        return formData.detailedDescription !== '';
      case 7: // Price
        return formData.price > 0;
      case 8: // Fresh Arrivals
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep === 6 && !formData.detailedDescription) {
      generateDescription();
    }
    if (canProceedToNextStep()) {
      // If editing from preview, return to preview (step 9)
      if (editingFromPreview) {
        setCurrentStep(9);
        setEditingFromPreview(false);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: 'Incomplete',
        description: 'Please complete the current step before proceeding',
        variant: 'destructive'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // If editing from preview, return to preview instead of previous step
      if (editingFromPreview) {
        setCurrentStep(9);
        setEditingFromPreview(false);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleEditFromPreview = (stepNumber) => {
    setEditingFromPreview(true);
    setCurrentStep(stepNumber);
  };

  const handlePublish = async () => {
    try {
      const productData = {
        name: formData.itemName,
        short_description: formData.shortDescription,
        description: formData.detailedDescription,
        fabric: formData.fabric,
        primary_color: formData.primaryColor,
        available_colors: formData.availableColors,
        sizes: formData.sizes,
        price: formData.price,
        is_new_arrival: formData.isFreshArrival
      };

      await axios.put(`${API}/products/${productId}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle image updates - remove all existing images and add new ones
      // This is a simple approach; in production you might want to be more selective
      const existingProduct = await axios.get(`${API}/products/${productId}`);
      
      // Remove old images that are not in the new set
      for (const oldImage of existingProduct.data.images || []) {
        const stillExists = formData.images.some(img => img.url === oldImage.url);
        if (!stillExists) {
          const removeFormData = new FormData();
          removeFormData.append('image_url', oldImage.url);
          try {
            await axios.delete(`${API}/products/${productId}/remove-image`, {
              data: removeFormData,
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (err) {
            console.error('Error removing image:', err);
          }
        }
      }

      // Add new images that weren't in the original set
      for (const image of formData.images) {
        const wasOriginal = existingProduct.data.images?.some(img => img.url === image.url);
        if (!wasOriginal && image.base64) {
          const imageFormData = new FormData();
          const blob = await fetch(image.url).then(r => r.blob());
          imageFormData.append('file', blob, 'image.jpg');
          imageFormData.append('is_primary', image.is_primary);

          await axios.post(`${API}/products/${productId}/add-image`, imageFormData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Product updated successfully!'
      });

      // Navigate back to products page
      if (formData.category === 'kids' && formData.ageGroup && formData.gender) {
        navigate(`/owner/products/${formData.category}/${formData.ageGroup}/${formData.gender}`);
      } else {
        navigate(`/owner/products/${formData.category}/${formData.subcategory}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive'
      });
    }
  };

  if (loading || loadingProduct) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="add-product-page">
      <header className="add-product-header">
        <Button variant="outline" onClick={() => navigate(-1)} data-testid="back-btn">
          <ArrowLeft size={18} />
          Back
        </Button>
        <div className="header-content">
          <h1>Edit Product</h1>
          <p>Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
        </div>
      </header>

      <div className="add-product-content">
        <div className="progress-steps">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              <div className="step-label">{step}</div>
            </div>
          ))}
        </div>

        <Card className="step-card">
          <CardHeader>
            <CardTitle>{STEPS[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 0: Upload Images */}
            {currentStep === 0 && (
              <div className="step-content" data-testid="step-upload-images">
                <p className="step-instruction">Upload at least 2 images of the product</p>
                <div className="images-grid">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-preview" data-testid={`image-preview-${index}`}>
                      <img src={image.url} alt={`Product ${index + 1}`} />
                      {image.is_primary && <span className="primary-badge">Primary</span>}
                      <div className="image-actions">
                        {!image.is_primary && (
                          <Button size="sm" onClick={() => makePrimaryImage(index)} data-testid={`make-primary-${index}`}>
                            Set Primary
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => removeImage(index)} data-testid={`remove-image-${index}`}>
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {formData.images.length < 10 && (
                    <label className="upload-box" data-testid="upload-box">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <Upload size={48} />
                      <span>Upload Images</span>
                    </label>
                  )}
                </div>
                <p className="image-count">
                  {formData.images.length} / 10 images uploaded (minimum 2 required)
                </p>
              </div>
            )}

            {/* Step 1: Fabric Selection */}
            {currentStep === 1 && (
              <div className="step-content" data-testid="step-fabric">
                <p className="step-instruction">Select the fabric type</p>
                <Select value={formData.fabric} onValueChange={(value) => setFormData({ ...formData, fabric: value })}>
                  <SelectTrigger data-testid="fabric-select">
                    <SelectValue placeholder="Select fabric" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabrics.map((fabric) => (
                      <SelectItem key={fabric} value={fabric}>
                        {fabric}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__">Others (Add Custom)</SelectItem>
                  </SelectContent>
                </Select>

                {formData.fabric === '__other__' && (
                  <div className="custom-fabric-input">
                    <Input
                      placeholder="Enter custom fabric name"
                      value={formData.customFabric}
                      onChange={(e) => setFormData({ ...formData, customFabric: e.target.value })}
                      data-testid="custom-fabric-input"
                    />
                    <Button onClick={addCustomFabric} data-testid="add-custom-fabric-btn">
                      Add Fabric
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Primary Color */}
            {currentStep === 2 && (
              <div className="step-content" data-testid="step-primary-color">
                <p className="step-instruction">
                  The website will auto-detect the color. Confirm or change it.
                </p>
                
                <Button 
                  onClick={detectColorFromImage} 
                  disabled={detectingColor || formData.images.length === 0}
                  data-testid="detect-color-btn"
                  className="detect-color-btn"
                >
                  {detectingColor ? 'Detecting...' : 'Auto-Detect Color'}
                </Button>

                {detectedColor && (
                  <div className="detected-color" data-testid="detected-color">
                    <p>Detected Color: <strong>{detectedColor}</strong></p>
                  </div>
                )}

                <div className="color-selection-section">
                  <p>Select or confirm primary color:</p>
                  <div className="colors-palette">
                    {colors.slice(0, 50).map((color) => (
                      <div
                        key={color}
                        className={`color-option ${formData.primaryColor === color ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, primaryColor: color })}
                        data-testid={`color-${color}`}
                        title={color}
                      >
                        <div 
                          className="color-swatch"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        <span className="color-name">{color}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Input
                    placeholder="Search or type color name"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    data-testid="color-search-input"
                    className="color-search"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Other Colors */}
            {currentStep === 3 && (
              <div className="step-content" data-testid="step-other-colors">
                <p className="step-instruction">Is this product available in other colors?</p>
                
                <div className="yes-no-buttons">
                  <Button
                    variant={formData.hasOtherColors ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, hasOtherColors: true })}
                    data-testid="other-colors-yes"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!formData.hasOtherColors ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, hasOtherColors: false, availableColors: [] })}
                    data-testid="other-colors-no"
                  >
                    No
                  </Button>
                </div>

                {formData.hasOtherColors && (
                  <div className="color-selection-section">
                    <p>Select all available colors (click to select/deselect):</p>
                    <div className="colors-palette">
                      {colors.map((color) => (
                        <div
                          key={color}
                          className={`color-option ${formData.availableColors.includes(color) ? 'selected' : ''}`}
                          onClick={() => toggleColor(color)}
                          data-testid={`available-color-${color}`}
                          title={color}
                        >
                          <div 
                            className="color-swatch"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          <span className="color-name">{color}</span>
                          {formData.availableColors.includes(color) && (
                            <Check className="color-check" size={16} />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="selected-count">
                      {formData.availableColors.length} colors selected
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Sizes */}
            {currentStep === 4 && (
              <div className="step-content" data-testid="step-sizes">
                <p className="step-instruction">Select available sizes</p>
                
                {section === 'kids' ? (
                  <div className="sizes-section">
                    <h4>Kids Sizes</h4>
                    <div className="sizes-grid">
                      {sizeOptions.kids.map((size) => (
                        <Button
                          key={size}
                          variant={formData.sizes.includes(size) ? "default" : "outline"}
                          onClick={() => toggleSize(size)}
                          data-testid={`size-${size}`}
                        >
                          {size}
                          {formData.sizes.includes(size) && <Check size={16} className="ml-2" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sizes-section">
                      <h4>Letter Sizes</h4>
                      <div className="sizes-grid">
                        {sizeOptions.letters.map((size) => (
                          <Button
                            key={size}
                            variant={formData.sizes.includes(size) ? "default" : "outline"}
                            onClick={() => toggleSize(size)}
                            data-testid={`size-${size}`}
                          >
                            {size}
                            {formData.sizes.includes(size) && <Check size={16} className="ml-2" />}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="sizes-section">
                      <h4>Number Sizes</h4>
                      <div className="sizes-grid">
                        {sizeOptions.numbers.map((size) => (
                          <Button
                            key={size}
                            variant={formData.sizes.includes(size) ? "default" : "outline"}
                            onClick={() => toggleSize(size)}
                            data-testid={`size-${size}`}
                          >
                            {size}
                            {formData.sizes.includes(size) && <Check size={16} className="ml-2" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <p className="selected-count">
                  {formData.sizes.length} sizes selected
                </p>
              </div>
            )}

            {/* Step 5: Item Details */}
            {currentStep === 5 && (
              <div className="step-content" data-testid="step-item-details">
                <p className="step-instruction">Provide item name and short description</p>
                
                <div className="form-field">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    placeholder="Enter item name (3-4 words)"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    data-testid="item-name-input"
                    maxLength={100}
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="shortDescription">Short Description *</Label>
                  <Textarea
                    id="shortDescription"
                    placeholder="Enter key features and description"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    data-testid="short-description-input"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 6: Detailed Description */}
            {currentStep === 6 && (
              <div className="step-content" data-testid="step-detailed-description">
                <p className="step-instruction">
                  A detailed description will be generated automatically. You can edit it if needed.
                </p>
                
                <Button 
                  onClick={generateDescription} 
                  disabled={generatingDescription}
                  data-testid="generate-description-btn"
                  className="generate-btn"
                >
                  {generatingDescription ? 'Generating...' : 'Generate Description'}
                </Button>

                <div className="form-field">
                  <Label htmlFor="detailedDescription">Detailed Description</Label>
                  <Textarea
                    id="detailedDescription"
                    placeholder="Detailed description will appear here..."
                    value={formData.detailedDescription}
                    onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                    data-testid="detailed-description-input"
                    rows={8}
                  />
                </div>
              </div>
            )}

            {/* Step 7: Price */}
            {currentStep === 7 && (
              <div className="step-content" data-testid="step-price">
                <p className="step-instruction">Set the product price</p>
                
                <div className="price-slider-container">
                  <Label>Price Range: ₹0 - ₹10,000</Label>
                  <Slider
                    value={[formData.price]}
                    onValueChange={(value) => setFormData({ ...formData, price: Math.round(value[0] / 100) * 100 })}
                    max={10000}
                    step={100}
                    data-testid="price-slider"
                    className="price-slider"
                  />
                  <p className="price-display">Selected: ₹{formData.price}</p>
                </div>

                <div className="form-field">
                  <Label htmlFor="exactPrice">Exact Price *</Label>
                  <Input
                    id="exactPrice"
                    type="number"
                    placeholder="Enter exact price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    data-testid="exact-price-input"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Step 8: Fresh Arrivals */}
            {currentStep === 8 && (
              <div className="step-content" data-testid="step-fresh-arrivals">
                <p className="step-instruction">
                  Do you want to add the "Fresh Arrivals" tag to this product?
                </p>
                
                <div className="switch-container">
                  <Switch
                    checked={formData.isFreshArrival}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFreshArrival: checked })}
                    data-testid="fresh-arrival-switch"
                  />
                  <Label>Add to Fresh Arrivals</Label>
                </div>

                {formData.isFreshArrival && (
                  <div className="fresh-arrival-info">
                    <p>✓ Product will be tagged as "Fresh Arrival"</p>
                    <p>✓ Product will appear in the Fresh Arrivals section on homepage</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 9: Preview */}
            {currentStep === 9 && (
              <div className="step-content preview-content" data-testid="step-preview">
                <h3>Product Preview</h3>
                <p className="preview-instruction">Review all details before publishing</p>
                
                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Images</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(0)} data-testid="edit-images">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <div className="preview-images">
                    {formData.images.map((image, index) => (
                      <img key={index} src={image.url} alt={`Product ${index + 1}`} />
                    ))}
                  </div>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Fabric</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(1)} data-testid="edit-fabric">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.fabric}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Primary Color</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(2)} data-testid="edit-primary-color">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.primaryColor}</p>
                </div>

                {formData.availableColors.length > 0 && (
                  <div className="preview-section">
                    <div className="preview-header">
                      <h4>Available Colors</h4>
                      <Button size="sm" variant="ghost" onClick={() => setCurrentStep(3)} data-testid="edit-colors">
                        <Edit2 size={16} /> Edit
                      </Button>
                    </div>
                    <p>{formData.availableColors.join(', ')}</p>
                  </div>
                )}

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Sizes</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(4)} data-testid="edit-sizes">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.sizes.join(', ')}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Item Name</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(5)} data-testid="edit-item-name">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.itemName}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Short Description</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(5)} data-testid="edit-short-desc">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.shortDescription}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Detailed Description</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(6)} data-testid="edit-detailed-desc">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.detailedDescription}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Price</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(7)} data-testid="edit-price">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p className="price-preview">₹{formData.price}</p>
                </div>

                <div className="preview-section">
                  <div className="preview-header">
                    <h4>Fresh Arrival Status</h4>
                    <Button size="sm" variant="ghost" onClick={() => setCurrentStep(8)} data-testid="edit-fresh-arrival">
                      <Edit2 size={16} /> Edit
                    </Button>
                  </div>
                  <p>{formData.isFreshArrival ? 'Yes - Tagged as Fresh Arrival' : 'No'}</p>
                </div>

                <Button 
                  onClick={handlePublish} 
                  className="publish-btn"
                  size="lg"
                  data-testid="publish-btn"
                >
                  Update Product
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="navigation-buttons">
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep} data-testid="prev-step-btn">
              Previous
            </Button>
          )}
          {currentStep < STEPS.length - 1 && (
            <Button 
              onClick={nextStep} 
              disabled={!canProceedToNextStep()}
              data-testid="next-step-btn"
            >
              Next
              <Check size={18} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
