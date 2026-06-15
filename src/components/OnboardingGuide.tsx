import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, AlertTriangle, ChevronRight } from 'lucide-react';

interface GuideStep {
  title: string;
  content: string;
  icon: React.ReactNode;
}

const steps: GuideStep[] = [
  {
    title: "Welcome to our Community!",
    content: "We've created this platform to help you connect with your local community, find gigs, discover seekers, and trade in a safe, helpful environment.",
    icon: <Sparkles className="text-blue-500" size={48} />
  },
  {
    title: "Your Safety is Our Priority",
    content: "To keep our community secure, please avoid sharing private information like banking or home addresses until you've verified the person you're dealing with.",
    icon: <ShieldCheck className="text-green-500" size={48} />
  },
  {
    title: "Stay Safe from Scams",
    content: "Be wary of offers that seem too good to be true or request payments outside our platform. Always report suspicious users or explicit content immediately through the report button.",
    icon: <AlertTriangle className="text-amber-500" size={48} />
  }
];

export default function OnboardingGuide({ onFinish }: { onFinish: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col p-6 items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="text-center max-w-sm"
        >
          <div className="flex justify-center mb-6">{steps[currentStep].icon}</div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">{steps[currentStep].title}</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{steps[currentStep].content}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between w-full max-w-sm mt-auto">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div key={index} className={`h-2 w-2 rounded-full ${index === currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>
        <button 
          onClick={handleNext} 
          className="flex items-center bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 transition"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </div>
  );
}
