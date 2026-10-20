/**
 * BookingModal.jsx
 * -------------------
 * Client Services & Parts Boutique Modal
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { submitInquiry, createServiceAppointment, getParts, createOrder } from '../services/api.js';

const FALLBACK_PART_IMG = 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=85';

export default function BookingModal({
  isOpen,
  onClose,
  selectedVehicle,
  initialTab = 'inquiry',
  userState = 'Maharashtra'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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

  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [orderName, setOrderName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      setSuccessMessage(null);
      setErrorMessage(null);
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

  useEffect(() => {
    let isMounted = true;

    if (activeTab === 'parts' && parts.length === 0) {
      getParts()
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setParts(data);
          }
        })
        .catch((err) => {
          console.error('Error fetching parts:', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, parts.length]);

  if (!isOpen) return null;

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await submitInquiry(inquiryData);
      setSuccessMessage(`Thank you, ${res.name}. Your inquiry has been registered with our atelier team (Ref #${res.id}). We will reach out shortly.`);
      setInquiryData({
        name: '', email: '', phone: '', vehicle_interest: '', message: '', preferred_contact_method: 'Email',
      });
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit inquiry. Please verify the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await createServiceAppointment(serviceData);
      setSuccessMessage(`Your appointment request for ${res.appointment_date} at ${res.appointment_time} has been received (Ref #${res.id}).`);
      setServiceData((prev) => ({
        ...prev,
        vehicle_details: '',
        service_type: 'ANNUAL_MAINTENANCE',
        appointment_date: '',
        notes: '',
      }));
    } catch (err) {
      setErrorMessage(err.message || 'Unable to book service appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
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
      const total = Number(res.total_amount) || 0;

      setSuccessMessage(`Order #${res.order_number} confirmed for ${selectedPart.name}! Total: ₹${total.toLocaleString('en-IN')}`);

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
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.25s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-card relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#171814] border border-[#c5a77a]/30 shadow-2xl p-5 sm:p-8 text-white rounded-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close absolute top-5 right-5 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:border-[#c5a77a] transition-colors cursor-pointer text-sm z-10"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="modal-header pb-4 border-b border-white/10 shrink-0">
          <span className="modal-eyebrow text-[9px] tracking-[0.22em] text-[#c5a77a] uppercase font-semibold block mb-1">
            AUREL MOTOR ATELIER · CONNECT
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-light text-white m-0 mb-4">
            Client Services &amp; Concierge
          </h2>

          <div className="modal-tabs flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
            <button
              className={`modal-tab px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'inquiry'
                  ? 'bg-[#c5a77a] text-[#11120f]'
                  : 'bg-white/5 text-[#aaa] hover:text-white'
                }`}
              onClick={() => { setActiveTab('inquiry'); setSuccessMessage(null); setErrorMessage(null); }}
              type="button"
            >
              Private Viewing &amp; Inquiry
            </button>
            <button
              className={`modal-tab px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'service'
                  ? 'bg-[#c5a77a] text-[#11120f]'
                  : 'bg-white/5 text-[#aaa] hover:text-white'
                }`}
              onClick={() => { setActiveTab('service'); setSuccessMessage(null); setErrorMessage(null); }}
              type="button"
            >
              Atelier Service Booking
            </button>
            <button
              className={`modal-tab px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'parts'
                  ? 'bg-[#c5a77a] text-[#11120f]'
                  : 'bg-white/5 text-[#aaa] hover:text-white'
                }`}
              onClick={() => { setActiveTab('parts'); setSuccessMessage(null); setErrorMessage(null); }}
              type="button"
            >
              Boutique &amp; Parts
            </button>
          </div>
        </div>

        <div className="modal-body flex-1 overflow-y-auto py-4 pr-1">
          {/* Global Alerts */}
          {successMessage && (
            <div className="alert-box success flex items-start gap-3 p-4 rounded-xs bg-[#c5a77a]-500/10 border border-[#c5a77a]-500/30 text-[#c5a77a]-300 text-xs mb-4">
              <span className="alert-icon text-base font-bold">✓</span>
              <div>
                <h4 className="font-semibold text-white mb-0.5">Request Received</h4>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="alert-box error flex items-start gap-3 p-4 rounded-xs bg-red-500/10 border border-red-500/30 text-red-300 text-xs mb-4">
              <span className="alert-icon text-base font-bold">!</span>
              <div>
                <h4 className="font-semibold text-white mb-0.5">Submission Notice</h4>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* TAB 1: VEHICLE INQUIRY */}
          {activeTab === 'inquiry' && !successMessage && (
            <form onSubmit={handleInquirySubmit} className="atelier-form space-y-4">
              <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="inquiry-name" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Your Full Name *</label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    placeholder="e.g. Julian Sterling"
                    value={inquiryData.name}
                    onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="inquiry-email" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Email Address *</label>
                  <input
                    id="inquiry-email"
                    type="email"
                    required
                    placeholder="julian@example.com"
                    value={inquiryData.email}
                    onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
              </div>

              <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="inquiry-phone" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Telephone (Optional)</label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    placeholder="+91 98900 12345"
                    value={inquiryData.phone}
                    onChange={(e) => setInquiryData({ ...inquiryData, phone: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="inquiry-vehicle" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Automobile of Interest</label>
                  <input
                    id="inquiry-vehicle"
                    type="text"
                    placeholder="e.g. Mahindra XUV700 AX7"
                    value={inquiryData.vehicle_interest}
                    onChange={(e) => setInquiryData({ ...inquiryData, vehicle_interest: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label htmlFor="inquiry-message" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Your Message or Viewing Requirements *</label>
                <textarea
                  id="inquiry-message"
                  rows="3"
                  required
                  placeholder="Tell us about your schedule, trade-in, or specific inquiries..."
                  value={inquiryData.message}
                  onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                  className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a] resize-y"
                />
              </div>

              <div className="form-footer pt-2">
                <button
                  type="submit"
                  className="button button-gold w-full sm:w-auto px-6 py-3 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[11px] uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Transmitting to Atelier...' : 'Submit Inquiry to Concierge ↗'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SERVICE BOOKING */}
          {activeTab === 'service' && !successMessage && (
            <form onSubmit={handleServiceSubmit} className="atelier-form space-y-4">
              <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="service-name" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Client Name *</label>
                  <input
                    id="service-name"
                    type="text"
                    required
                    placeholder="Your Name"
                    value={serviceData.customer_name}
                    onChange={(e) => setServiceData({ ...serviceData, customer_name: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="service-email" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Email Address *</label>
                  <input
                    id="service-email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={serviceData.customer_email}
                    onChange={(e) => setServiceData({ ...serviceData, customer_email: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
              </div>

              <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="service-phone" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Phone Number *</label>
                  <input
                    id="service-phone"
                    type="tel"
                    required
                    placeholder="+91 98900 12345"
                    value={serviceData.customer_phone}
                    onChange={(e) => setServiceData({ ...serviceData, customer_phone: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="service-car" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Vehicle Details *</label>
                  <input
                    id="service-car"
                    type="text"
                    required
                    placeholder="e.g. 2024 Tata Safari Dark Edition"
                    value={serviceData.vehicle_details}
                    onChange={(e) => setServiceData({ ...serviceData, vehicle_details: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                  />
                </div>
              </div>

              <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="service-type" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Service Specialty</label>
                  <select
                    id="service-type"
                    value={serviceData.service_type}
                    onChange={(e) => setServiceData({ ...serviceData, service_type: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer focus:border-[#c5a77a]"
                  >
                    <option value="ANNUAL_MAINTENANCE" className="bg-[#171814]">Annual Comprehensive Service</option>
                    <option value="PERFORMANCE_TUNING" className="bg-[#171814]">Performance Calibration &amp; Tuning</option>
                    <option value="BRAKE_TYRE" className="bg-[#171814]">Brakes &amp; Performance Tyre Fitting</option>
                    <option value="DIAGNOSTICS" className="bg-[#171814]">Electronic &amp; Mechanical Diagnostics</option>
                    <option value="DETAILING" className="bg-[#171814]">Bespoke Atelier Detailing &amp; Ceramic Coating</option>
                    <option value="PRE_PURCHASE" className="bg-[#171814]">Comprehensive Pre-Purchase Inspection</option>
                  </select>
                </div>
                <div className="form-group flex flex-col gap-1.5">
                  <label htmlFor="service-date" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Preferred Date *</label>
                  <input
                    id="service-date"
                    type="date"
                    required
                    value={serviceData.appointment_date}
                    onChange={(e) => setServiceData({ ...serviceData, appointment_date: e.target.value })}
                    className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#c5a77a]"
                  />
                </div>
              </div>

              <div className="form-group flex flex-col gap-1.5">
                <label htmlFor="service-notes" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Special Requests / Mechanical Notes</label>
                <textarea
                  id="service-notes"
                  rows="2"
                  placeholder="Describe any particular symptom or maintenance request..."
                  value={serviceData.notes}
                  onChange={(e) => setServiceData({ ...serviceData, notes: e.target.value })}
                  className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a] resize-y"
                />
              </div>

              <div className="form-footer pt-2">
                <button
                  type="submit"
                  className="button button-gold w-full sm:w-auto px-6 py-3 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[11px] uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Booking Appointment...' : 'Confirm Atelier Appointment ↗'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BOUTIQUE PARTS */}
          {activeTab === 'parts' && !successMessage && (
            <div className="boutique-wrap">
              {!selectedPart ? (
                <div className="parts-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {parts.length === 0 && !loading && (
                    <p className="col-span-full text-center text-[#888] py-8 text-xs">
                      Loading catalogue or no items available...
                    </p>
                  )}
                  {parts.map((p) => (
                    <div className="part-card bg-[#1c211c] border border-white/10 rounded-xs p-4 flex gap-4 hover:border-[#c5a77a]/40 transition-colors" key={`part-${p.id}`}>
                      <img
                        src={p.image_url || FALLBACK_PART_IMG}
                        alt={p.name}
                        className="part-img w-24 h-24 object-cover rounded-xs shrink-0 bg-black/40"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_PART_IMG;
                        }}
                      />
                      <div className="part-info flex-1 flex flex-col justify-between text-xs">
                        <div>
                          <span className="part-sku text-[9px] uppercase tracking-wider text-[#888] block">{p.sku} · {p.category_name}</span>
                          <h3 className="font-semibold text-white text-sm my-0.5">{p.name}</h3>
                          <p className="part-desc text-[11px] text-[#aaa] line-clamp-2">{p.description}</p>
                          <span className="part-compat text-[10px] text-[#888] block mt-1">Fits: {p.compatibility}</span>
                        </div>
                        <div className="part-action-row flex items-center justify-between gap-2 mt-3 pt-2 border-t border-white/10">
                          <span className="part-price text-sm font-bold text-[#c5a77a]">₹{Number(p.price).toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            className="button button-outline-sm px-3 py-1.5 bg-transparent hover:bg-white/10 text-white border border-white/25 rounded-xs text-[10px] tracking-wider uppercase font-semibold transition-colors"
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
                <form onSubmit={handleOrderSubmit} className="atelier-form space-y-4">
                  <div className="selected-part-banner p-4 bg-white/5 border border-[#c5a77a]/30 rounded-xs mb-4">
                    <button
                      type="button"
                      className="back-btn text-[#c5a77a] hover:underline text-xs mb-1 block cursor-pointer"
                      onClick={() => setSelectedPart(null)}
                    >
                      ← Back to parts catalogue
                    </button>
                    <h4 className="font-semibold text-white text-sm">Ordering: {selectedPart.name} (₹{Number(selectedPart.price).toLocaleString('en-IN')})</h4>
                  </div>

                  <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1.5">
                      <label htmlFor="order-name" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Recipient Name *</label>
                      <input
                        id="order-name"
                        type="text"
                        required
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                        placeholder="Your full name"
                        className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label htmlFor="order-email" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Email Address *</label>
                      <input
                        id="order-email"
                        type="email"
                        required
                        value={orderEmail}
                        onChange={(e) => setOrderEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                      />
                    </div>
                  </div>

                  <div className="form-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1.5">
                      <label htmlFor="order-phone" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Phone Number *</label>
                      <input
                        id="order-phone"
                        type="tel"
                        required
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                        placeholder="+91 98900 12345"
                        className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                      />
                    </div>
                    <div className="form-group flex flex-col gap-1.5">
                      <label htmlFor="order-address" className="text-[10px] uppercase tracking-wider text-[#888] font-medium">Delivery Address *</label>
                      <input
                        id="order-address"
                        type="text"
                        required
                        value={orderAddress}
                        onChange={(e) => setOrderAddress(e.target.value)}
                        placeholder="Delivery address in India (City, State, Pincode)"
                        className="bg-[#11120f] border border-white/15 rounded-xs px-3.5 py-2.5 text-xs text-white placeholder:text-[#666] outline-none focus:border-[#c5a77a]"
                      />
                    </div>
                  </div>

                  <div className="form-footer pt-2">
                    <button
                      type="submit"
                      className="button button-gold w-full sm:w-auto px-6 py-3 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[11px] uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Processing Order...' : `Confirm Order (₹${Number(selectedPart.price).toLocaleString('en-IN')}) ↗`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Success screen action button */}
          {successMessage && (
            <div className="text-center mt-6">
              <button
                type="button"
                className="button button-outline px-6 py-2.5 bg-transparent hover:bg-white/10 text-white border border-white/30 rounded-xs text-xs tracking-wider uppercase font-semibold transition-colors cursor-pointer"
                onClick={() => {
                  setSuccessMessage(null);
                  onClose();
                }}
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
