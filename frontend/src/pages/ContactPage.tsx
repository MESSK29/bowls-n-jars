import React, { useState } from 'react';
import { Mail, MapPin, Phone, Clock, ChevronDown, Check, Send } from 'lucide-react';
import { useToast } from '../components/common/Toast';
import { useStoreConfigStore } from '../stores/storeConfigStore';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();
  const { config } = useStoreConfigStore();

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are all bowls and mugs 100% lead-free and food-safe?',
      a: 'Yes, absolutely. We formulate all glazes in-house using food-grade, non-toxic mineral oxides (iron, copper, cobalt, and wood ash). All finished pieces undergo strict third-party lab testing and are certified California Prop 65 and FDA compliant.',
    },
    {
      q: 'How does the ceramic lining in the Bento Lunchbox work?',
      a: 'Unlike traditional plastic or bare stainless steel containers that absorb garlic, turmeric, or vinegar smells, our Bento Box features a fused ceramic silica interior. It wipes clean effortlessly, preserves pure flavor, and is 100% free of BPA and microplastics.',
    },
    {
      q: 'What is your Safe-Arrival Ceramic Guarantee?',
      a: 'We pack every order with biodegradable molded pulp and zero plastic. In the rare event that a courier mishandles your parcel and an item arrives cracked or broken, simply snap a quick photo and email us within 7 days. We dispatch an immediate replacement at zero cost to you.',
    },
    {
      q: 'Can I put Bowls \'N\' Jars ceramics in the microwave, oven, and dishwasher?',
      a: 'Yes! Our stoneware is vitrified at 1200°C, making it safe for dishwashers, microwaves, and ovens up to 375°F. Just avoid sudden temperature shocks (e.g. taking a frozen dish directly into high heat). Note that lids with cork or silicone gaskets should be hand-washed.',
    },
    {
      q: 'Do you offer wholesale studio pricing or custom event registries?',
      a: 'We love collaborating with independent cafes, farm-to-table restaurants, and couples planning intentional wedding registries. Select "Wholesale & Custom Studio Orders" in the contact form or email bowlsnjars@gmail.com for line-sheets.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      try {
        const response = await fetch('https://formspree.io/f/xbglyzbj', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ name, email, subject, message })
        });
        
        if (response.ok) {
          setSubmitted(true);
          setName('');
          setEmail('');
          setMessage('');
          showToast({
            title: 'Message Sent',
            description: 'We will respond within 24 business hours.',
            type: 'success'
          });
        } else {
          showToast({
            title: 'Error',
            description: 'Failed to send message. Please try again.',
            type: 'error'
          });
        }
      } catch (err) {
        showToast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 block">
          Get in Touch
        </span>
        <h1 className="font-heading text-4xl font-bold text-clay-900">
          Studio Inquiries &amp; Support
        </h1>
        <p className="text-xs sm:text-sm text-clay-600">
          Have a question about a piece, tracking an order, or looking for custom restaurant dinnerware? We are here to help.
        </p>
      </div>

      {/* Main Grid: Form + Studio Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Contact Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-warm-sm">
          <h2 className="font-heading text-xl font-bold text-clay-900 mb-2">
            Send a Note to the Studio
          </h2>
          <p className="text-xs text-clay-500 mb-6">
            We respond to all collector messages within 24 business hours.
          </p>

          {submitted ? (
            <div className="p-6 bg-sage-100 border border-sage-200 text-sage-800 rounded-2xl text-center space-y-2">
              <Check className="w-8 h-8 text-sage-600 mx-auto" />
              <h3 className="font-heading text-lg font-bold">Message Received!</h3>
              <p className="text-xs">
                Thank you for reaching out. A studio member will reply to your email shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs font-semibold underline text-sage-900"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Maya Lin"
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-clay-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-clay-700 mb-1">
                  Topic of Inquiry
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-clay-800"
                >
                  <option value="general">General Studio Inquiry</option>
                  <option value="order">Order Tracking &amp; Delivery</option>
                  <option value="care">Ceramic Care &amp; Microwave Safety</option>
                  <option value="wholesale">Wholesale &amp; Custom Dinnerware</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-clay-700 mb-1">
                  How can we help?
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details about your question or requested quantities..."
                  className="w-full p-3.5 bg-cream-50 border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-terracotta-500 hover:bg-terracotta-600 active:scale-99 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-warm-sm transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Note to Potter</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Studio Card & Visiting Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-sand-100 p-6 sm:p-7 rounded-3xl border border-sand-300 space-y-5">
            <h3 className="font-heading text-lg font-bold text-clay-900">
              Our Office Address
            </h3>

            <div className="space-y-3.5 text-xs text-clay-700">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-terracotta-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-clay-900 font-semibold">Studio &amp; Showroom:</strong>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(config.storeAddress)}`} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta-600 transition-colors whitespace-pre-line">{config.storeAddress}</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-terracotta-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-clay-900 font-semibold">General Enquiries:</strong>
                  <a href={`mailto:${config.contactEmail}`} className="hover:text-terracotta-600 transition-colors">{config.contactEmail}</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-terracotta-600 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col space-y-0.5">
                  <strong className="block text-clay-900 font-semibold">Call Us:</strong>
                  <a href={`tel:${config.contactPhone1.replace(/[^0-9+]/g, '')}`} className="hover:text-terracotta-600 transition-colors">{config.contactPhone1}</a>
                  <a href={`tel:${config.contactPhone2.replace(/[^0-9+]/g, '')}`} className="hover:text-terracotta-600 transition-colors">{config.contactPhone2}</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-terracotta-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="block text-clay-900 font-semibold">Our Timing:</strong>
                  <span className="whitespace-pre-line">{config.storeTimings}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ summary banner */}
          <div className="bg-sage-100 p-5 rounded-3xl border border-sage-200 text-xs text-sage-900 space-y-1.5">
            <span className="font-bold block">Need immediate shipment tracking?</span>
            <p className="text-sage-800">
              Log into your Bowls &apos;N&apos; Jars account to view live parcel dispatches and receipt numbers anytime.
            </p>
          </div>
        </div>

      </div>

      {/* Interactive FAQ Accordion */}
      <section className="pt-10 border-t border-sand-300 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-clay-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-clay-500">
            Common questions on our clay composition, durability, and fulfillment.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-sand-200 overflow-hidden shadow-warm-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between space-x-4 hover:bg-sand-50 transition-colors"
                >
                  <span className="font-heading text-sm sm:text-base font-semibold text-clay-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-clay-500 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-terracotta-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-clay-600 leading-relaxed border-t border-sand-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
