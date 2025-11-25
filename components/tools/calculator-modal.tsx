'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DraggableWindow } from '@/components/draggable-window';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  onFocus?: () => void;
}

export function CalculatorModal({ isOpen, onClose, zIndex = 40, onFocus }: CalculatorModalProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);
    
    if (previousValue !== null && operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(result.toString());
      setPreviousValue(result);
      setHistory([...history, `${previousValue} ${operation} ${currentValue} = ${result}`]);
    } else {
      setPreviousValue(currentValue);
    }
    
    setOperation(op);
    setDisplay('0');
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case '%': return a % b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(previousValue, currentValue, operation);
      setHistory([...history, `${previousValue} ${operation} ${currentValue} = ${result}`]);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    ['C', 'DEL', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=', '='],
  ];

  return (
    <DraggableWindow
      title="Calculatrice"
      isOpen={isOpen}
      onClose={onClose}
      width="450px"
      height="600px"
      zIndex={zIndex}
      onFocus={onFocus}
    >
      <div className="h-full bg-gradient-to-b from-gray-50 to-white dark:from-[#0f1320] dark:to-[#1a1f3a] p-6">
        {/* Display */}
        <div className="bg-white dark:bg-[#0f1320] border border-gray-200 dark:border-blue-500/20 rounded-xl p-4 mb-4 shadow-inner">
          {operation && (
            <div className="text-xs text-gray-400 mb-1">
              {previousValue} {operation}
            </div>
          )}
          <div className="text-right text-3xl font-bold text-gray-900 dark:text-white font-mono">
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.flat().map((btn, idx) => {
            const isOperation = ['÷', '×', '-', '+', '%'].includes(btn);
            const isEquals = btn === '=';
            const isClear = btn === 'C';
            const isDelete = btn === 'DEL';

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (btn === 'C') handleClear();
                  else if (btn === 'DEL') handleDelete();
                  else if (btn === '=') handleEquals();
                  else if (isOperation) handleOperation(btn);
                  else handleNumber(btn);
                }}
                className={`
                  h-14 rounded-xl font-semibold text-lg transition-all
                  ${isClear ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/30' : ''}
                  ${isDelete ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 hover:bg-orange-500/30' : ''}
                  ${isOperation ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' : ''}
                  ${isEquals ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/30' : ''}
                  ${!isClear && !isDelete && !isOperation && !isEquals ? 'bg-gray-100 dark:bg-gray-700/30 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600/30 hover:bg-gray-200 dark:hover:bg-gray-700/50' : ''}
                `}
              >
                {isDelete ? <Delete className="w-4 h-4 mx-auto" /> : btn}
              </motion.button>
            );
          })}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-4 p-3 bg-white dark:bg-[#0f1320] border border-gray-200 dark:border-blue-500/20 rounded-xl max-h-32 overflow-y-auto">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Historique</h4>
            {history.map((item, idx) => (
              <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 py-1 font-mono">
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </DraggableWindow>
  );
}
