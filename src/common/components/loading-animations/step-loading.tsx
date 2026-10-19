import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LoadingStepsStyle } from './style';

const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const STEPS = [
  { index: 1, label: 'Récupération de vos données' },
  { index: 2, label: 'Recherche de votre adresse' },
  { index: 3, label: 'Prise de la vue aérienne de votre toiture' },
  { index: 4, label: 'Chargement des données' },
];

const STEP_DURATION = {
  0: 3000,
  1: 7500,
  2: 4500,
  3: 4500,
};

export const LoadingSteps = () => {
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        const step = STEPS[i];

        setActiveSteps(prev => [...prev, step.index]);
        setCurrentStep(step.index);

        if (i < STEPS.length - 1) {
          await wait((STEP_DURATION as any)[i as any] as any);
          setDoneSteps(prev => [...prev, step.index]);
          setCurrentStep(null);
          await wait(900);
        }
      }
    };

    run();
  }, []);

  return (
    <Box sx={LoadingStepsStyle}>
      {STEPS.filter(s => activeSteps.includes(s.index)).map(step => {
        const isDone = doneSteps.includes(step.index);
        const isCurrent = currentStep === step.index;

        return (
          <motion.div
            key={step.index}
            className='chip-wrapper'
            initial={{ width: 32, opacity: 0 }}
            animate={{ width: isDone ? 32 : 'auto', opacity: 1 }}
            transition={{ duration: isDone ? 1.1 : 0.5, ease: 'easeInOut' }}
          >
            <motion.div className='chip-morph' animate={{ borderRadius: isDone ? '50%' : '16px' }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
              <Chip
                label={
                  <span className='chip-content'>
                    <span className='chip-index'>{step.index}</span>
                    {!isDone && (
                      <motion.span
                        className='chip-label'
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      >
                        {step.label}
                      </motion.span>
                    )}
                  </span>
                }
                className={['step-chip', isDone ? 'step-chip--done' : '', isCurrent ? 'step-chip--current' : ''].join(' ')}
              />

              {isCurrent && (
                <motion.div
                  className='shimmer-overlay'
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.3 }}
                />
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </Box>
  );
};
