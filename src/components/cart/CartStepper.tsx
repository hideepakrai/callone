import React from 'react';
import clsx from 'clsx';

interface Step {
  id: number;
  label: string;
}

interface CartStepperProps {
  steps: Step[];
  activeStep: number;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
  onCheckAvailability: () => void;
  onApproveOrder: () => void;
  onCompleteOrder: () => void;
}

export const CartStepper: React.FC<CartStepperProps> = ({
  steps,
  activeStep,
  isSubmitting,
  onSubmitOrder,
  onCheckAvailability,
  onApproveOrder,
  onCompleteOrder,
}) => {
  return (
    <div className="flex items-center justify-between px-12 py-4">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center space-y-3">
            <div className={clsx(
              "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all",
              activeStep >= step.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-foreground/5 text-foreground/40'
            )}>
              {step.id}
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-bold uppercase tracking-tighter text-foreground/30">Step {step.id}</span>
              <span className={`text-xs font-bold ${activeStep >= step.id ? 'text-foreground' : 'text-foreground/40'}`}>{step.label}</span>
            </div>
            {(step.id === 1 || step.id === 2 || step.id === 3 || step.id === 4) && activeStep === step.id && (
              <button 
                onClick={
                  step.id === 1 ? onSubmitOrder : 
                  step.id === 2 ? onCheckAvailability : 
                  step.id === 3 ? onApproveOrder : 
                  onCompleteOrder
                }
                disabled={isSubmitting}
                className={clsx(
                  "mt-2 rounded-xl bg-black px-4 py-2 text-[10px] font-bold uppercase text-white shadow-lg transition-all active:scale-95",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? 'Processing...' : step.id === 1 ? 'Submit Order' : step.id === 2 ? 'Check Availability' : step.id === 3 ? 'Approve Order' : 'Complete Order'}
              </button>
            )}
          </div>
          {idx < steps.length - 1 && (
            <div className="h-[2px] flex-1 bg-border/40 mx-4 mt-[-40px]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
