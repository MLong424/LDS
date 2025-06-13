// src/components/checkout/CheckoutSteps.tsx
import React from 'react';
import { ShoppingCart, LucideTruck, CreditCard, CheckCircle } from 'lucide-react';

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface CheckoutStepsProps {
    currentStep: CheckoutStep;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
    const steps = [
        { id: 'cart', label: 'Cart', icon: ShoppingCart },
        { id: 'shipping', label: 'Shipping', icon: LucideTruck },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'confirmation', label: 'Confirmation', icon: CheckCircle },
    ];

    // Helper to determine step status
    const getStepStatus = (stepId: string) => {
        const currentIndex = steps.findIndex((step) => step.id === currentStep);
        const stepIndex = steps.findIndex((step) => step.id === stepId);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <div className="w-full py-4 mb-8">
            <div className="flex justify-between">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const StepIcon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step circle with icon */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    ${status === 'completed' ? 'bg-green-100 text-green-600 border-green-300' : ''}
                    ${status === 'current' ? 'bg-primary text-red-600 border-red-300' : ''}
                    ${status === 'upcoming' ? 'bg-muted text-yellow-600 border-yellow-300' : ''}
                    border-2
                  `}
                                >
                                    <StepIcon className="h-5 w-5" />
                                </div>
                                <span
                                    className={`
                    text-xs mt-2 font-medium
                    ${status === 'completed' ? 'text-green-600' : ''}
                    ${status === 'current' ? 'text-red-600' : ''}
                    ${status === 'upcoming' ? 'text-yellow-600' : ''}
                  `}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line between steps */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 flex items-center mx-1">
                                    <div
                                        className={`h-0.5 w-full 
                      ${index < steps.findIndex((s) => s.id === currentStep) ? 'bg-green-300' : 'bg-muted'}
                    `}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckoutSteps;
