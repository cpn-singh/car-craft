import React, { useState, useEffect } from 'react';
import { submitInquiry, createServiceAppointment, getParts, createOrder } from '../services/api.js';

export default function BookingModal({ isOpen, onClose, selectedVehicle, initialTab = 'inquiry', userState = 'Maharashtra' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Inquiry Form State
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    state: userState || 'Maharashtra',
    city: 'Mumbai',
    vehicle_interest: selectedVehicle ? selectedVehicle.name : '',
    message: '',
    preferred_contact_method: 'Phone / WhatsApp',
  });

  // Service Form State
  const [serviceData, setServiceData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    vehicle_details: selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.name}` : '',
    service_type: 'ANNUAL_MAINTENANCE',
    appointment_date: '',
    appointment_time: '10:00',
    notes: '',
  });

  // Parts State
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [orderName, setOrderName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (selectedVehicle) {
      setInquiryData((prev) => ({
        ...prev,
        vehicle_interest: selectedVehicle.name,
        message: prev.message || `I am inquiring about the ${selectedVehicle.year} ${selectedVehicle.name} (${selectedVehicle.formatted_price || selectedVehicle.price}).`,
      }));
      setServiceData((prev) => ({
        ...prev,
        vehicle_details: `${selectedVehicle.year} ${selectedVehicle.name}`,
      }));
    }
  }, [selectedVehicle]);

  // Load parts if tab is 'parts'
  useEffect(() => {
    if (activeTab === 'parts' && parts.length === 0) {
      getParts()
        .then((data) => setParts(data))
        .catch((err) => console.error('Error fetching parts:', err));
    }
  }, [activeTab, parts.length]);

  if (!isOpen) return null;

  async function handleInquirySubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await submitInquiry(inquiryData);
      setSuccessMessage(`Thank you, ${res.name}. Your inquiry has been registered with our atelier team (Ref #${res.id}). We will reach out shortly.`);
      setInquiryData({
        name: '',
        email: '',
        phone: '',
        vehicle_interest: '',
        message: '',
        preferred_contact_method: 'Email',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit inquiry. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  async function handleServiceSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await createServiceAppointment(serviceData);
      setSuccessMessage(`Your appointment request for ${res.appointment_date} at ${res.appointment_time} has been received (Ref #${res.id}).`);
      setServiceData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        vehicle_details: '',
        service_type: 'ANNUAL_MAINTENANCE',
        appointment_date: '',
        appointment_time: '10:00',
        notes: '',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to book service appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOrderSubmit(e) {
    e.preventDefault();
    if (!selectedPart) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const orderPayload = {
        customer_name: orderName,
        customer_email: orderEmail,
        customer_phone: orderPhone,
        shipping_address: orderAddress,
        items_data: [{ part_id: selectedPart.id, quantity: 1 }],
      };
      const res = await createOrder(orderPayload);
      setSuccessMessage(`Order #${res.order_number} confirmed for ${selectedPart.name}! Total: ₹${Number(res.total_amount).toLocaleString('en-IN')}`);
      setSelectedPart(null);
      setOrderName('');
      setOrderEmail('');
      setOrderPhone('');
      setOrderAddress('');
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>

        <div className="modal-header">
          <span className="modal-eyebrow">AUREL MOTOR ATELIER · CONNECT</span>
          <h2>Client Services & Concierge</h2>
          
          <div className="modal-tabs">
            <button
              className={`modal-tab ${activeTab === 'inquiry' ? 'active' : ''}`}
              onClick={() => { setActiveTab('inquiry'); setSuccessMessage(null); setErrorMessage(null); }}
              type="button"
            >
              Private Viewing & Inquiry
            </button>
            <button
              className={`modal-tab ${activeTab === 'service' ? 'active' : ''}`}
              onClick={() => { setActiveTab('service'); setSuccessMessage(null); setErrorMessage(null); }}
              type="button"
            >
              Atelier Service Booking
            </button>
            <button
              className={`modal-tab ${activeTab === 'parts' ? 'active' : ''}`}
              onClick={() => { setActiveTab('parts'); setSuccessMessage(null); setErrorMessage(null); }}
              type="button"
            >
              Boutique & Parts
            </button>
          </div>
        </div>

        <div className="modal-body">
          {successMessage && (
            <div className="alert-box success">
              <span className="alert-icon">✓</span>
              <div>
                <h4>Request Received</h4>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="alert-box error">
              <span className="alert-icon">!</span>
              <div>
                <h4>Submission Notice</h4>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* TAB 1: VEHICLE INQUIRY */}
          {activeTab === 'inquiry' && !successMessage && (
            <form onSubmit={handleInquirySubmit} className="atelier-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inquiry-name">Your Full Name *</label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    placeholder="e.g. Julian Sterling"
                    value={inquiryData.name}
                    onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inquiry-email">Email Address *</label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    placeholder="julian@example.com"
                    value={inquiryData.email}
                    onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inquiry-phone">Telephone (Optional)</label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    placeholder="+44 20 7946 0912"
                    value={inquiryData.phone}
                    onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="inquiry-vehicle">Automobile of Interest</label>
                  <input
                    id="inquiry-vehicle"
                    type="text"
                    placeholder="e.g. Porsche 911 Carrera GTS"
                    value={inquiryData.vehicle_interest}
                    onChange={(e) => setInquiryData({ ...inquiryData, vehicle_interest: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="inquiry-message">Your Message or Viewing Requirements *</label>
                <textarea
                  id="inquiry-message"
                  rows="3"
                  required
                  placeholder="Tell us about your schedule, trade-in, or specific inquiries..."
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                />
              </div>

              <div className="form-footer">
                <button type="submit" className="button button-gold" disabled={loading}>
                  {loading ? 'Transmitting to Atelier...' : 'Submit Inquiry to Concierge ↗'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SERVICE BOOKING */}
          {activeTab === 'service' && !successMessage && (
            <form onSubmit={handleServiceSubmit} className="atelier-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service-name">Client Name *</label>
                  <input
                    id="service-name"
                    type="text"
                    required
                    placeholder="Your Name"
                    value={serviceData.customer_name}
                    onChange={(e) => setServiceData({ ...serviceData, customer_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="service-email">Email Address *</label>
                  <input
                    id="service-email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={serviceData.customer_email}
                    onChange={(e) => setServiceData({ ...serviceData, customer_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service-phone">Phone Number *</label>
                  <input
                    id="service-phone"
                    type="tel"
                    required
                    placeholder="+44 7700 900821"
                    value={serviceData.customer_phone}
                    onChange={(e) => setServiceData({ ...serviceData, customer_phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="service-car">Vehicle Details *</label>
                  <input
                    id="service-car"
                    type="text"
                    required
                    placeholder="e.g. 2023 Porsche 911 GTS"
                    value={serviceData.vehicle_details}
                    onChange={(e) => setServiceData({ ...serviceData, vehicle_details: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service-type">Service Specialty</label>
                  <select
                    id="service-type"
                    value={serviceData.service_type}
                    onChange={(e) => setServiceData({ ...serviceData, service_type: e.target.value })}
                  >
                    <option value="ANNUAL_MAINTENANCE">Annual Comprehensive Service</option>
                    <option value="PERFORMANCE_TUNING">Performance Calibration & Tuning</option>
                    <option value="BRAKE_TYRE">Brakes & Performance Tyre Fitting</option>
                    <option value="DIAGNOSTICS">Electronic & Mechanical Diagnostics</option>
                    <option value="DETAILING">Bespoke Atelier Detailing & Ceramic Coating</option>
                    <option value="PRE_PURCHASE">Comprehensive Pre-Purchase Inspection</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="service-date">Preferred Date *</label>
                  <input
                    id="service-date"
                    type="date"
                    required
                    value={serviceData.appointment_date}
                    onChange={(e) => setServiceData({ ...serviceData, appointment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="service-notes">Special Requests / Mechanical Notes</label>
                <textarea
                  id="service-notes"
                  rows="2"
                  placeholder="Describe any particular symptom or maintenance request..."
                  value={serviceData.notes}
                  onChange={(e) => setServiceData({ ...serviceData, notes: e.target.value })}
                />
              </div>

              <div className="form-footer">
                <button type="submit" className="button button-gold" disabled={loading}>
                  {loading ? 'Booking Appointment...' : 'Confirm Atelier Appointment ↗'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BOUTIQUE PARTS */}
          {activeTab === 'parts' && !successMessage && (
            <div className="boutique-wrap">
              {!selectedPart ? (
                <div className="parts-grid">
                  {parts.map((p) => (
                    <div className="part-card" key={p.id}>
                      {p.image_url && <img src={p.image_url} alt={p.name} className="part-img" />}
                      <div className="part-info">
                        <span className="part-sku">{p.sku} · {p.category_name}</span>
                        <h3>{p.name}</h3>
                        <p className="part-desc">{p.description}</p>
                        <span className="part-compat">Fits: {p.compatibility}</span>
                        <div className="part-action-row">
                          <span className="part-price">₹{Number(p.price).toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            className="button button-outline-sm"
                            onClick={() => setSelectedPart(p)}
                          >
                            Acquire / Order ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="atelier-form">
                  <div className="selected-part-banner">
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => setSelectedPart(null)}
                    >
                      ← Back to parts catalogue
                    </button>
                    <h4>Ordering: {selectedPart.name} (₹{Number(selectedPart.price).toLocaleString('en-IN')})</h4>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="order-name">Recipient Name *</label>
                      <input
                        id="order-name"
                        type="text"
                        required
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="order-email">Email Address *</label>
                      <input
                        id="order-email"
                        type="email"
                        required
                        value={orderEmail}
                        onChange={(e) => setOrderEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="order-phone">Phone Number *</label>
                      <input
                        id="order-phone"
                        type="tel"
                        required
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                        placeholder="+91 98900 12345"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="order-address">Delivery Address *</label>
                      <input
                        id="order-address"
                        type="text"
                        required
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        placeholder="Delivery address in India (City, State, Pincode)"
                      />
                    </div>
                  </div>

                  <div className="form-footer">
                    <button type="submit" className="button button-gold" disabled={loading}>
                      {loading ? 'Processing Order...' : `Confirm Order (₹${Number(selectedPart.price).toLocaleString('en-IN')}) ↗`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {successMessage && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => { setSuccessMessage(null); onClose(); }}
              >
                Close Concierge Window
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
