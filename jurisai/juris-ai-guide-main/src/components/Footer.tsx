
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-juris-primary text-white py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">JurisAI</h3>
            <p className="text-sm text-gray-300">
              Simplifying legal understanding through AI-powered assistance.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-sm text-gray-300 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-sm text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-gray-300 hover:text-white transition-colors">Legal Disclaimer</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-300">support@jurisai.com</li>
              <li className="text-sm text-gray-300">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} JurisAI. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              <strong className="font-bold">IMPORTANT DISCLAIMER:</strong> JurisAI is not a licensed legal service and does not provide legal advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
