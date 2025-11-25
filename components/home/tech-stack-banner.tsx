'use client';

import { motion } from 'framer-motion';

const technologies = [
  {
    name: 'Vercel',
    logo: (
      <svg viewBox="0 0 1155 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
        <path d="M577.344 0L1154.69 1000H0L577.344 0Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Supabase',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
        <path d="M13.3333 0L2.66667 12H10.6667V24L21.3333 12H13.3333V0Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Shopify',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
        <path d="M18 6H16C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6H6C4.9 6 4 6.9 4 8V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8C20 6.9 19.1 6 18 6ZM12 4C13.1 4 14 4.9 14 6H10C10 4.9 10.9 4 12 4ZM18 20H6V8H8V10C8 10.55 8.45 11 9 11C9.55 11 10 10.55 10 10V8H14V10C14 10.55 14.45 11 15 11C15.55 11 16 10.55 16 10V8H18V20Z" fill="currentColor"/>
        <path d="M12 13C11.15 13 10.39 13.23 9.81 13.63L10.66 14.91C11.03 14.65 11.43 14.5 11.85 14.5C12.55 14.5 12.85 14.85 12.85 15.2C12.85 15.53 12.6 15.75 11.75 16.15C10.6 16.7 9.5 17.4 9.5 18.6C9.5 19.65 10.35 20.5 11.75 20.5C12.65 20.5 13.45 20.23 14.05 19.8L13.2 18.53C12.85 18.78 12.45 18.95 12 18.95C11.35 18.95 11 18.65 11 18.3C11 17.95 11.25 17.75 12.15 17.3C13.35 16.75 14.5 16.05 14.5 14.9C14.5 13.75 13.5 13 12 13Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Google',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
        <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'Outlook',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto">
        <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function TechStackBanner() {
  return (
    <section className="w-full overflow-hidden bg-gray-50 py-10 dark:bg-[#0A0E27]/50">
      <div className="flex">
        <motion.div
          className="flex flex-shrink-0 gap-20 pr-20"
          animate={{
            x: "-50%",
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {[...technologies, ...technologies, ...technologies, ...technologies].map((tech, index) => (
            <div
              key={`${tech.name}-${index}`}
              className="flex items-center gap-3 text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
            >
              <div className="h-8 w-auto">
                {tech.logo}
              </div>
              <span className="text-xl font-bold">{tech.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
