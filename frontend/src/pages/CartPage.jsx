import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { ShoppingCart, Trash2, MessageCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import './CartPage.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CartPage = () => {
  const { cart, removeFromCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const toggleItemSelection = (cartId) => {
    if (selectedItems.includes(cartId)) {
      setSelectedItems(selectedItems.filter(id => id !== cartId));
    } else {
      setSelectedItems([...selectedItems, cartId]);
    }
  };

  const handleWhatsAppEnquiry = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: 'No items selected',
        description: 'Please select at least one item to enquire',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const itemsToEnquire = cart.filter(item => selectedItems.includes(item.cartId));
      const response = await axios.post(`${API}/cart/enquire`, { items: itemsToEnquire });
      
      window.open(response.data.whatsapp_url, '_blank');
      
      toast({
        title: 'Enquiry sent!',
        description: 'Opening WhatsApp...'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process enquiry',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-header">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back
        </Button>
        <h1 className="cart-title">
          <ShoppingCart size={28} /> My Cart ({cart.length})
        </h1>
      </div>

      {cart.length === 0 ? (
        <Card className="empty-cart">
          <CardContent className="empty-cart-content">
            <ShoppingCart size={64} className="empty-icon" />
            <h2>Your cart is empty</h2>
            <p>Add some items to get started</p>
            <Button onClick={() => navigate('/')}>Browse Products</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <Card key={item.cartId} className="cart-item">
                <CardContent className="cart-item-content">
                  <Checkbox
                    checked={selectedItems.includes(item.cartId)}
                    onCheckedChange={() => toggleItemSelection(item.cartId)}
                    className="cart-checkbox"
                  />
                  <img
                    src={item.image || item.images?.[0]?.url}
                    alt={item.name}
                    className="cart-item-image"
                    onClick={() => navigate(`/product/${item.id}`)}
                  />
                  <div className="cart-item-details">
                    <h3 onClick={() => navigate(`/product/${item.id}`)}>{item.name}</h3>
                    <p className="item-description">{item.short_description}</p>
                    <p className="item-price">₹{item.price}</p>
                    <div className="item-selections">
                      <span>Size: {item.selectedSize}</span>
                      <span>Color: {item.selectedColor}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="remove-btn"
                    onClick={() => removeFromCart(item.cartId)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <div className="enquiry-footer">
              <Button
                onClick={handleWhatsAppEnquiry}
                className="enquiry-btn"
                disabled={loading}
              >
                <MessageCircle size={20} />
                {loading ? 'Processing...' : `Enquire on WhatsApp (${selectedItems.length} items)`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};