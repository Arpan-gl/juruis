
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h1>
          <div className="prose max-w-none">
            <p className="text-lg mb-4">
              At JurisAI, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your information.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly, such as account details, documents you upload, and questions you ask. 
              We also collect certain information automatically, including usage data and device information.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use your information to provide and improve our services, respond to your queries, personalize your experience, 
              and develop new features. We may also use anonymized data for research and training our AI models.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect your information from unauthorized access, alteration, disclosure, 
              or destruction. All documents and conversations are encrypted both in transit and at rest.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Retention</h2>
            <p className="mb-4">
              We retain your personal information and documents for as long as necessary to fulfill the purposes outlined in this policy, 
              unless a longer retention period is required by law. You can request deletion of your data at any time.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Rights</h2>
            <p className="mb-4">
              Depending on your location, you may have rights regarding your personal data, such as the right to access, correct, delete, 
              or port your data. Contact us if you wish to exercise these rights.
            </p>
          </div>
        </div>
        <LegalDisclaimer />
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
