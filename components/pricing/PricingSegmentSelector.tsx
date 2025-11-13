'use client';

import { motion } from 'framer-motion';
import { SegmentType, PRICING_SEGMENTS } from '@/lib/constants/pricing';

interface PricingSegmentSelectorProps {
  activeSegment: SegmentType;
  onSegmentChange: (segment: SegmentType) => void;
}

export default function PricingSegmentSelector({
  activeSegment,
  onSegmentChange,
}: PricingSegmentSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
      {PRICING_SEGMENTS.map((segment) => {
        const Icon = segment.icon;
        const isActive = activeSegment === segment.id;

        return (
          <motion.button
            key={segment.id}
            onClick={() => onSegmentChange(segment.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-base
              transition-all duration-300 shadow-md hover:shadow-lg
              w-full sm:w-auto min-w-[180px] justify-center
              ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-purple-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
              }
            `}
          >
            {/* Background glow for active */}
            {isActive && (
              <motion.div
                layoutId="activeSegment"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 blur-sm opacity-50"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            {/* Icon */}
            <Icon
              className={`h-5 w-5 transition-transform duration-300 ${
                isActive ? 'rotate-12' : ''
              }`}
            />

            {/* Label */}
            <span className="relative z-10">{segment.label}</span>

            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
