import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { HiCheck } from 'react-icons/hi';

const steps = ['Shipping', 'Payment', 'Review'];


const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttarakhand',
  'Uttar Pradesh',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const isFakeZip = (zip, country) => {
  if (country === 'India') {
    if (/^(.)\1+$/.test(zip)) return true;
    if (zip.startsWith('0')) return true;
  }
  return false;
};

const isFakeCity = (cityName) => {
  const dummyNames = ['test', 'fake', 'dummy', 'abc', 'xyz', 'none', 'null', 'undefined', 'city', 'somewhere'];
  return dummyNames.includes(cityName.toLowerCase().trim()) || cityName.length < 3;
};

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [shipping, setShipping] = useState({
    street: '',
    city: '',
    district: '',
    state: '',
    zip: '',
    country: 'India',
    customCountry: '',
    customState: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const shippingPrice = totalPrice > 500 ? 0 : 50;
  const taxPrice = Math.round(totalPrice * 0.18 * 100) / 100;
  const grandTotal = Math.round((totalPrice + shippingPrice + taxPrice) * 100) / 100;

  const handleShippingSubmit = (e) => {
    e.preventDefault();

    const { country, customCountry, state, customState, district, city, zip } = shipping;

    const finalCountry = country === 'Other' ? customCountry.trim() : country;
    const finalState = country === 'Other' ? customState.trim() : state;

    if (!finalCountry) {
      toast.error('Please specify a country');
      return;
    }
    if (!finalState) {
      toast.error('Please specify a state');
      return;
    }
    if (!district.trim()) {
      toast.error('Please enter the name of the district');
      return;
    }
    if (!city.trim()) {
      toast.error('Please enter the name of the city');
      return;
    }
    if (!zip.trim()) {
      toast.error('Please enter the PIN/ZIP code');
      return;
    }

    // Validate India specifically
    if (country === 'India') {
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!pinRegex.test(zip)) {
        toast.error('Please enter a valid 6-digit Indian PIN code');
        return;
      }
      if (isFakeZip(zip, 'India')) {
        toast.error('Invalid PIN code. Please enter a real postal code.');
        return;
      }
    } else {
      // General zip code validation for other countries
      if (zip.trim().length < 3 || zip.trim().length > 10) {
        toast.error('Please enter a valid ZIP/Postal Code');
        return;
      }
    }

    // Validate District and City name (no dummy/fake values)
    if (isFakeCity(district)) {
      toast.error('Please enter a valid district name');
      return;
    }
    if (isFakeCity(city)) {
      toast.error('Please enter a valid city name');
      return;
    }
    if (!/^[a-zA-Z\s.-]+$/.test(district.trim())) {
      toast.error('District name must contain only letters, spaces, or dashes');
      return;
    }
    if (!/^[a-zA-Z\s.-]+$/.test(city.trim())) {
      toast.error('City name must contain only letters, spaces, or dashes');
      return;
    }

    setCurrentStep(1);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);
      const finalShipping = {
        street: shipping.street,
        country: shipping.country === 'Other' ? shipping.customCountry.trim() : shipping.country,
        state: shipping.country === 'Other' ? shipping.customState.trim() : shipping.state,
        city: `${shipping.district.trim()}, ${shipping.city.trim()}`,
        zip: shipping.zip,
      };
      const { data } = await api.post('/orders', {
        shippingAddress: finalShipping,
        paymentMethod,
      });
      if (data.success) {
        await clearCart();
        toast.success('Order placed successfully! 🎉');
        navigate(`/orders`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${i < currentStep ? 'bg-success text-white' :
                  i === currentStep ? 'text-white shadow-lg shadow-primary/30' :
                  'bg-surface-3 text-text-muted'}`}
                   style={i === currentStep ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-2))' } : {}}>
                {i < currentStep ? <HiCheck className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${i <= currentStep ? 'text-text' : 'text-text-muted'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-20 sm:w-32 h-0.5 mx-2 mb-5 transition-all
                ${i < currentStep ? 'bg-success' : 'bg-surface-4'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <form onSubmit={handleShippingSubmit} className="card animate-slideUp">
          <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Street Address</label>
              <input
                type="text" required value={shipping.street}
                onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                className="input-field" placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Country</label>
                <select
                  required
                  value={shipping.country}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    setShipping({
                      ...shipping,
                      country: newCountry,
                      customCountry: '',
                      state: '',
                      customState: '',
                      district: '',
                      city: '',
                      zip: '',
                    });
                  }}
                  className="input-field cursor-pointer"
                >
                  <option value="India">India</option>
                  <option value="Other">Other (Outside India)</option>
                </select>
                {shipping.country === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      required
                      value={shipping.customCountry}
                      onChange={(e) => setShipping({ ...shipping, customCountry: e.target.value })}
                      className="input-field"
                      placeholder="Enter country name"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">State</label>
                {shipping.country === 'India' ? (
                  <select
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="input-field cursor-pointer"
                  >
                    <option value="">Select State</option>
                    {indianStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={shipping.customState}
                    onChange={(e) => setShipping({ ...shipping, customState: e.target.value })}
                    className="input-field"
                    placeholder="Enter state/province"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">District</label>
                <input
                  type="text"
                  required
                  value={shipping.district}
                  onChange={(e) => setShipping({ ...shipping, district: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Lucknow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input
                  type="text"
                  required
                  value={shipping.city}
                  onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Varanasi"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {shipping.country === 'India' ? 'PIN Code' : 'ZIP/Postal Code'}
                </label>
                <input
                  type="text"
                  required
                  value={shipping.zip}
                  onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                  className="input-field"
                  placeholder={shipping.country === 'India' ? '400001 (6-digit PIN code)' : 'Enter ZIP/Postal Code'}
                />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-6">Continue to Payment</button>
        </form>
      )}

      {currentStep === 1 && (
        <form onSubmit={handlePaymentSubmit} className="card animate-slideUp">
          <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
          <div className="space-y-3">
            {[
              { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
            ].map((method) => (
              <label
                key={method.value}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                  ${paymentMethod === method.value ? 'border-primary bg-primary/5' : 'border-glass-border hover:border-primary/30'}`}
              >
                <input
                  type="radio" name="payment" value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-primary w-4 h-4"
                />
                <div>
                  <p className="font-medium">{method.label}</p>
                  <p className="text-xs text-text-muted">{method.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={() => setCurrentStep(0)} className="btn-secondary flex-1">Back</button>
            <button type="submit" className="btn-primary flex-1">Review Order</button>
          </div>
        </form>
      )}

      {currentStep === 2 && (
        <div className="space-y-6 animate-slideUp">
          {/* Review: Shipping */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Shipping Address</h3>
              <button onClick={() => setCurrentStep(0)} className="text-sm text-primary-light hover:text-primary cursor-pointer">Edit</button>
            </div>
             <p className="text-text-secondary text-sm">
              {shipping.street}, {shipping.district && `${shipping.district}, `}{shipping.city}, {shipping.country === 'Other' ? shipping.customState : shipping.state} - {shipping.zip}, {shipping.country === 'Other' ? shipping.customCountry : shipping.country}
            </p>
          </div>

          {/* Review: Payment */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Payment Method</h3>
              <button onClick={() => setCurrentStep(1)} className="text-sm text-primary-light hover:text-primary cursor-pointer">Edit</button>
            </div>
            <p className="text-text-secondary text-sm">{paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}</p>
          </div>

          {/* Review: Items */}
          <div className="card">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 py-2 border-b border-glass-border last:border-0">
                  <img src={item.product?.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product?.name}</p>
                    <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="card">
            <h3 className="font-semibold mb-4">Order Total</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span>₹{totalPrice.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span className={shippingPrice === 0 ? 'text-success' : ''}>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Tax (18% GST)</span><span>₹{taxPrice.toLocaleString()}</span></div>
              <div className="border-t border-glass-border pt-2 flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold gradient-text text-lg">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="btn-primary w-full !py-4 text-lg"
          >
            {placing ? 'Placing Order...' : `Place Order — ₹${grandTotal.toLocaleString()}`}
          </button>
        </div>
      )}
    </div>
  );
}
