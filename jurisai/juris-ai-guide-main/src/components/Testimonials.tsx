
import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah J.",
    role: "Small Business Owner",
    content: "JurisAI helped me understand my lease agreement in minutes. The document analysis feature saved me hours of research and potential legal consultation fees.",
    rating: 5
  },
  {
    name: "Michael T.",
    role: "Property Investor",
    content: "As someone who deals with contracts across different countries, the multi-jurisdiction feature is invaluable. It's like having a legal assistant available 24/7.",
    rating: 5
  },
  {
    name: "Elena R.",
    role: "Freelance Consultant",
    content: "I love how JurisAI breaks down complex legal terms into simple language. It's made reviewing client contracts so much less intimidating.",
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-juris-primary mb-4">What Our Users Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover how JurisAI is helping people understand legal matters with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 rounded-full bg-gradient-to-r from-juris-primary to-juris-secondary flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
