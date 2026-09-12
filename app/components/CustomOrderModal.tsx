// components/CustomOrderModal.tsx
'use client';

import { useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Upload, ChefHat, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER, customCakeMessage, whatsappLink } from '@/app/lib/whatsapp';
import type { CustomOrderDetails } from '@/app/lib/custom-orders';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const readDetails = (form: HTMLFormElement): CustomOrderDetails => {
  const data = new FormData(form);
  const value = (field: string) => { const entry = data.get(field); return typeof entry === 'string' ? entry : null; };
  return {
    name: value('name'), phone: value('phone'), occasion: value('occasion'), date: value('date'),
    flavor: value('flavor'), size: value('size'), message: value('message'), inspirationLink: value('inspirationLink'),
  };
};

// Every enquiry is recorded for the team, whichever channel the customer prefers.
const saveEnquiry = async (form: HTMLFormElement, source: 'form' | 'whatsapp') => {
  const formData = new FormData(form);
  formData.set('source', source);
  const res = await fetch('/api/custom-orders', { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data.reference as string;
};

export default function CustomOrderModal({ isOpen, onClose }: CustomOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setReference(null);

    const form = e.currentTarget;

    try {
      setReference(await saveEnquiry(form, 'form'));
      setTimeout(() => {
        onClose();
        setReference(null);
        form.reset();
        setImagePreview(null);
      }, 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit your enquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const enquireOnWhatsApp = async () => {
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;

    setError('');
    setIsOpeningChat(true);
    const details = readDetails(form);
    // Opened inside the click handler so the browser does not treat the chat as a popup.
    const tab = window.open('', '_blank');
    const openChat = (url: string) => { if (tab) tab.location.href = url; else window.location.href = url; };

    try {
      const saved = await saveEnquiry(form, 'whatsapp');
      setReference(saved);
      openChat(whatsappLink(customCakeMessage(details, saved)));
    } catch (err) {
      // The details still reach the team in the chat itself, so carry on without a reference.
      console.error('Could not record the WhatsApp enquiry:', err);
      openChat(whatsappLink(customCakeMessage(details)));
    } finally {
      setIsOpeningChat(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-md shadow-2xl">
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-[#713c46]" />
              <Dialog.Title className="text-2xl font-bold">Custom cake enquiry</Dialog.Title>
            </div>
            <button onClick={onClose} aria-label="Close custom cake enquiry" className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#f1e9e5] border-b">
            <p className="text-sm text-[#62554e] max-w-sm">Would you rather talk it through? Add your name and number, and we will open WhatsApp ({WHATSAPP_NUMBER}) with your details ready to send. Your enquiry reaches our team either way.</p>
            <button
              type="button"
              onClick={enquireOnWhatsApp}
              disabled={isOpeningChat || isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-white bg-[#1da851] hover:bg-[#178641] disabled:bg-[#8cc9a4] transition"
            >
              <MessageCircle className="w-5 h-5" />
              {isOpeningChat ? 'Opening WhatsApp…' : 'Enquire on WhatsApp'}
            </button>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
            {reference && (
              <div className="bg-green-100 text-green-900 p-4 rounded-lg text-center" role="status">
                <p className="font-semibold">Thank you, your enquiry is with our team.</p>
                <p className="text-sm mt-1">Your reference is <strong>{reference}</strong>. Quote it when you talk to us and we will find your request straight away.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center" role="alert">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="+254 712 345 678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Occasion</label>
                <input
                  name="occasion"
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Birthday, Wedding, Anniversary..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Date</label>
                <input
                  name="date"
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Flavor</label>
                <input
                  name="flavor"
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Vanilla, Chocolate, Red Velvet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size / Tiers</label>
                <input
                  name="size"
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="6-inch, 3 tiers, serves 20..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message on Cake</label>
              <input
                name="message"
                type="text"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Happy Birthday Mary!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Inspiration Link (Pinterest, etc.)</label>
              <input
                name="inspirationLink"
                type="url"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="https://pinterest.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Inspiration Image</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-[#713c46] text-white rounded-lg cursor-pointer hover:bg-[#542c34] transition">
                  <Upload className="w-5 h-5" />
                  Choose Image
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  // eslint-disable-next-line @next/next/no-img-element -- a local preview of a file the customer just chose, never fetched over the network
                  <img src={imagePreview} alt="Preview of your inspiration image" className="h-20 w-20 object-cover rounded-lg" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">JPEG, PNG, or WebP, up to 5 MB.</p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isOpeningChat}
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-pink-400 transition"
              >
                {isSubmitting ? 'Sending…' : 'Send my enquiry'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
