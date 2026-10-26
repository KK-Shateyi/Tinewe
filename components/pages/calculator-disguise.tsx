'use client';

import * as React from 'react';
import { Calculator, Delete, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useApp } from '@/components/app-provider';
import { Switch } from '@/components/ui/switch';

type Operator = '+' | '−' | '×' | '÷';

const calculatorButtons = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
] as const;

const operatorSymbol: Record<Operator, string> = {
  '+': '+',
  '−': '−',
  '×': '×',
  '÷': '÷',
};

export function CalculatorDisguise() {
  const { discreetPin, setDiscreetMode, navigate } = useApp();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [display, setDisplay] = React.useState('0');
  const [expression, setExpression] = React.useState('');
  const [storedValue, setStoredValue] = React.useState<number | null>(null);
  const [operator, setOperator] = React.useState<Operator | null>(null);
  const [waitingForOperand, setWaitingForOperand] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const openTinewe = React.useCallback(() => {
    setDiscreetMode(false);
    navigate('dashboard');
  }, [navigate, setDiscreetMode]);

  const reset = React.useCallback(() => {
    setDisplay('0');
    setExpression('');
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const calculate = React.useCallback((left: number, right: number, activeOperator: Operator): number => {
    if (activeOperator === '+') return left + right;
    if (activeOperator === '−') return left - right;
    if (activeOperator === '×') return left * right;
    return right === 0 ? 0 : left / right;
  }, []);

  const enterDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    setDisplay((current) => (current === '0' ? digit : `${current}${digit}`));
  };

  const enterDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    setDisplay((current) => (current.includes('.') ? current : `${current}.`));
  };

  const chooseOperator = (nextOperator: Operator) => {
    const currentValue = Number(display);
    if (operator && storedValue !== null && !waitingForOperand) {
      const result = calculate(storedValue, currentValue, operator);
      setDisplay(String(result));
      setStoredValue(result);
      setExpression(`${result} ${operatorSymbol[nextOperator]}`);
    } else {
      setStoredValue(currentValue);
      setExpression(`${currentValue} ${operatorSymbol[nextOperator]}`);
    }
    setOperator(nextOperator);
    setWaitingForOperand(true);
  };

  const completeCalculation = () => {
    if (discreetPin && display === discreetPin) {
      openTinewe();
      return;
    }
    if (!operator || storedValue === null) return;
    const result = calculate(storedValue, Number(display), operator);
    setExpression(`${storedValue} ${operatorSymbol[operator]} ${display} =`);
    setDisplay(String(result));
    setStoredValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleButton = (button: string) => {
    if (/^\d$/.test(button)) return enterDigit(button);
    if (button === '.') return enterDecimal();
    if (button === 'C') return reset();
    if (button === '⌫') {
      setDisplay((current) => (current.length > 1 ? current.slice(0, -1) : '0'));
      return;
    }
    if (button === '±') {
      setDisplay((current) => (current === '0' ? current : String(Number(current) * -1)));
      return;
    }
    if (button === '%') {
      setDisplay(String(Number(display) / 100));
      return;
    }
    if (button === '=') return completeCalculation();
    chooseOperator(button as Operator);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="w-full max-w-sm rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <div aria-label="Calculator disguise" className="p-1">
            <img
              src="/Tinewe_Caring_Support_Logo.png"
              alt="Tinewe"
              className="h-9 w-24 object-contain object-left"
            />
          </div>
          <label className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            {mounted && theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="sr-only">Dark mode</span>
            <Switch
              checked={mounted ? theme === 'dark' : false}
              onCheckedChange={(enabled) => setTheme(enabled ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
          </label>
        </div>
        <div className="mb-3 flex items-center gap-2 px-3 text-slate-500 dark:text-slate-400">
          <Calculator className="h-4 w-4" />
          <span className="text-sm font-semibold">Calculator</span>
        </div>
        <div
          aria-label="Calculator display"
          className="mb-4 flex h-28 w-full flex-col items-end justify-end overflow-hidden rounded-2xl bg-slate-950 px-5 py-4 text-right"
        >
          <span className="h-5 w-full truncate text-sm font-light tracking-tight text-slate-400">
            {expression}
          </span>
          <span className="mt-1 truncate text-4xl font-light tracking-tight text-white">
            {display}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {calculatorButtons.flatMap((row, rowIndex) =>
            row.map((button, columnIndex) => {
              const isOperator = ['÷', '×', '−', '+', '='].includes(button);
              const isZero = rowIndex === 4 && columnIndex === 0;
              return (
                <button
                  key={`${rowIndex}-${columnIndex}-${button}`}
                  type="button"
                  onClick={() => handleButton(button)}
                  className={`flex h-14 items-center justify-center rounded-2xl border text-lg font-semibold transition-transform active:scale-95 ${
                    isZero ? 'col-span-2' : ''
                  } ${
                    isOperator
                      ? 'border-teal-700 bg-teal-100 text-teal-800 hover:bg-teal-200 dark:border-teal-500 dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700'
                      : button === 'C'
                        ? 'border-rose-200 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {button === '⌫' ? <Delete className="h-5 w-5" /> : button}
                </button>
              );
            })
          )}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-slate-400">
          Enter your access code and press = to return
        </p>
      </section>
    </main>
  );
}
