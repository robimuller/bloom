// src/contexts/WizardContext.js
import React, { createContext, useState, useMemo } from 'react';

const stepsConfig = [3, 4, 3, 1, 1];
const totalSubSteps = stepsConfig.reduce((acc, val) => acc + val, 0);

export const WizardContext = createContext(null);

export function WizardProvider({ children }) {
    const [step, setStep] = useState(1);
    const [subStep, setSubStep] = useState(1);

    const progress = useMemo(() => {
        const subStepsBefore = stepsConfig.slice(0, step - 1).reduce((sum, val) => sum + val, 0);
        const currentIndex = subStepsBefore + (subStep - 1);
        return currentIndex / totalSubSteps;
    }, [step, subStep]);

    // Next sub-step (no actual navigation)
    const goNextSubStep = () => {
        const maxSubs = stepsConfig[step - 1];
        if (subStep < maxSubs) {
            setSubStep(subStep + 1);
        } else {
            // done with sub-steps for this step
            if (step < 5) {
                setStep(step + 1);
                setSubStep(1);
            }
        }
    };

    // Previous sub-step (no actual navigation)
    const goPrevSubStep = () => {
        if (subStep > 1) {
            setSubStep(subStep - 1);
        } else {
            if (step > 1) {
                const prevStep = step - 1;
                setStep(prevStep);
                setSubStep(stepsConfig[prevStep - 1]);
            }
        }
    };

    return (
        <WizardContext.Provider
            value={{
                step,
                subStep,
                progress,
                goNextSubStep,
                goPrevSubStep,
            }}
        >
            {children}
        </WizardContext.Provider>
    );
}
