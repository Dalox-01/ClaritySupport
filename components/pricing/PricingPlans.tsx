'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { PricingPlan, SegmentType } from '@/lib/constants/pricing';
import PlanCard from './PlanCard';

interface PricingPlansProps {
  plans: PricingPlan[];
  segmentId: SegmentType;
}

export default function PricingPlans({ plans, segmentId }: PricingPlansProps) {
  return (
    <div
      className="relative"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={segmentId}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-6 max-w-7xl mx-auto"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {plans.map((plan, index) => (
            <div
              key={`${segmentId}-${plan.name}`}
              className={`flex ${plan.popular ? 'md:my-0' : 'md:my-4'}`}
            >
              <PlanCard plan={plan} index={index} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
