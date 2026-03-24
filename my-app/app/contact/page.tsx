'use client'
import { Wheat, ShoppingBag, User, Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

const ContactPage = ({ onNavigate }: ContactPageProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-green-700" />
              </div>
            </div>
            <h1 className="text-5xl mb-4 text-gray-900">
              Get in <span className="text-green-700">Touch</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Have questions about our premium rice products? We'd love to hear from you.
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl mb-6 text-gray-900">Send us a Message</h2>

                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-green-800 flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      Thank you! Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block mb-2 text-gray-900">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                        placeholder="Name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block mb-2 text-gray-900">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                        placeholder="abc@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block mb-2 text-gray-900">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block mb-2 text-gray-900">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="product">Product Information</option>
                        <option value="order">Order Status</option>
                        <option value="delivery">Delivery Question</option>
                        <option value="wholesale">Wholesale Inquiry</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-2 text-gray-900">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-full transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl mb-6 text-gray-900">Contact Information</h3>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-gray-900">Phone</h4>
                      <p className="text-gray-600">+91 7010300660</p>
                      <p className="text-sm text-gray-500">Mon-Sat, 9am-9pm</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-gray-900">Email</h4>
                      <p className="text-gray-600">veerapathratraders@gmail.com</p>
                      <p className="text-sm text-gray-500">We reply within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-gray-900">Address</h4>
                      <p className="text-gray-600">2F6H+W3C</p>
                      <p className="text-gray-600">Bathra Kaliyamman, Konduraja Line, Theni, Tamil Nadu 625531</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours Card */}
              <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-8 h-8" />
                  <h3 className="text-2xl">Business Hours</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-green-600">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 9:00 PM</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="mb-3 text-gray-900">What are your delivery times?</h3>
              <p className="text-sm text-gray-600">
                We offer same-day delivery for orders placed before noon in your local area.
                Standard delivery takes 2-3 business days.
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="mb-3 text-gray-900">Do you offer wholesale pricing?</h3>
              <p className="text-sm text-gray-600">
                Yes! We offer competitive wholesale pricing for bulk orders. Please contact us
                directly for a custom quote.
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="mb-3 text-gray-900">Are all your products organic?</h3>
              <p className="text-sm text-gray-600">
                Yes, all our rice varieties are 100% certified organic and sourced from
                sustainable farms.
              </p>
            </div>

            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="mb-3 text-gray-900">What is your return policy?</h3>
              <p className="text-sm text-gray-600">
                We offer a 30-day satisfaction guarantee. If you're not happy with your
                purchase, we'll provide a full refund.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
export default ContactPage
