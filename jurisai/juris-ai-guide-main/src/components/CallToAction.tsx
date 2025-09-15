
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-juris-secondary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to simplify your legal understanding?
        </h2>
        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
          Start using JurisAI today and get clear, easy-to-understand answers to your legal questions.
        </p>
        <Button onClick={()=>{navigate("/ai-lawyer")}} size="lg" className="bg-white text-juris-primary hover:bg-gray-100 font-bold">
          Get Started Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="mt-6 text-sm text-white/80">
          No credit card required. Start with our free tier.
        </p>
      </div>
    </section>
  );
};

export default CallToAction;