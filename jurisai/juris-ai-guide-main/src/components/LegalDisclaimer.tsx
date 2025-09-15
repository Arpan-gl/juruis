
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LegalDisclaimer = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <AlertDescription className="ml-2">
          <span className="font-bold">IMPORTANT LEGAL DISCLAIMER:</span> JurisAI is not a law firm and is not a substitute for an attorney or law firm. JurisAI cannot provide legal advice, representation, or counsel. Your use of JurisAI does not create an attorney-client relationship. The information provided by JurisAI is for educational and informational purposes only.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LegalDisclaimer;
