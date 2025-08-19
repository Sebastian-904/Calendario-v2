import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { Role } from '../../types';
import Button from '../ui/Button';

interface GuidedTourProps {
    isOpen: boolean;
    onClose: () => void;
    role: Role;
}

const consultantSteps = [
    { target: '[data-tour-id="company-selector"]', contentKey: 'tour.consultant.step1' },
    { target: '[data-tour-id="main-nav"]', contentKey: 'tour.consultant.step2' },
    { target: '[data-tour-id="team-list"]', contentKey: 'tour.consultant.step3' },
    { target: '[data-tour-id="new-event-btn"]', contentKey: 'tour.consultant.step4' },
    { target: '[data-tour-id="help-menu"]', contentKey: 'tour.consultant.step5' },
    { target: 'final-step', contentKey: 'tour.consultant.step6' },
];

const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose, role }) => {
    const { t } = useTranslation();
    const [stepIndex, setStepIndex] = useState(0);
    const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const activeTourElement = useRef<Element | null>(null);
    
    const steps = useMemo(() => {
        if (role === 'consultor' || role === 'admin') {
            return consultantSteps;
        }
        return [];
    }, [role]);

    const currentStep = useMemo(() => steps[stepIndex], [steps, stepIndex]);
    const isLastStep = stepIndex === steps.length - 1;

    useEffect(() => {
        if (!isOpen || !currentStep) return;

        // Clean up previous highlight
        if(activeTourElement.current) {
            activeTourElement.current.classList.remove('tour-highlight');
        }

        const targetElement = document.querySelector(currentStep.target);
        activeTourElement.current = targetElement;

        if (currentStep.target === 'final-step' || !targetElement) {
            setPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
            return;
        }

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipRef.current?.getBoundingClientRect();

        let top = targetRect.bottom + 10;
        let left = targetRect.left + (targetRect.width / 2);

        if (tooltipRect) {
            left -= tooltipRect.width / 2;
        }
        
        // Adjust if tooltip goes off-screen
        if (tooltipRect && top + tooltipRect.height > window.innerHeight) {
            top = targetRect.top - tooltipRect.height - 10;
        }
        if (tooltipRect && left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 20;
        }
        if (left < 0) {
            left = 20;
        }

        setPosition({ top: `${top}px`, left: `${left}px`, transform: 'none' });
        
        // Highlight the target element
        targetElement.classList.add('tour-highlight');
        
        return () => {
            if (targetElement) {
                targetElement.classList.remove('tour-highlight');
            }
        };

    }, [isOpen, currentStep, stepIndex]);
    
     useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .tour-highlight {
                position: relative;
                z-index: 10001 !important;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
                border-radius: 8px;
                transition: box-shadow 0.3s ease-in-out;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
            if (activeTourElement.current) {
                activeTourElement.current.classList.remove('tour-highlight');
            }
        };
    }, []);

    const handleClose = () => {
        if (activeTourElement.current) {
            activeTourElement.current.classList.remove('tour-highlight');
        }
        onClose();
    };

    if (!isOpen || steps.length === 0) return null;

    const handleNext = () => {
        if (!isLastStep) {
            setStepIndex(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev + 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000]">
            <div
                ref={tooltipRef}
                style={{ ...position }}
                className="absolute w-80 bg-zinc-800 text-zinc-100 rounded-lg shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 z-[10002]"
            >
                <p className="text-sm mb-4">{t(currentStep.contentKey)}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{stepIndex + 1} / {steps.length}</span>
                    <div className="flex items-center gap-2">
                        {stepIndex > 0 && (
                             <Button size="sm" variant="ghost" onClick={handlePrev} className="!text-zinc-300 hover:!bg-zinc-700">{t('tour.prev')}</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={handleClose} className="!border-zinc-600 !text-zinc-300 hover:!bg-zinc-700">{t('tour.skip')}</Button>
                        <Button size="sm" onClick={handleNext}>{isLastStep ? t('tour.finish') : t('tour.next')}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuidedTour;