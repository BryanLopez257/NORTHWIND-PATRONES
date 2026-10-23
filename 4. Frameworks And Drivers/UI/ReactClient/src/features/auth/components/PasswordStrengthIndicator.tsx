import React, { useMemo } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { EMOJI_REGEX } from '@/core/utils/inputFilters';

export interface PasswordStrengthIndicatorProps {
  password?: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
  className = '',
}) => {
  const analysis = useMemo(() => {
    const rules = [
      password.length >= 6 && password.length <= 100, // longitud
      /[A-Z]/.test(password),                         // mayúscula
      /[0-9]/.test(password),                         // número
      /[^a-zA-Z0-9\s]/.test(password),                // símbolo o carácter especial
      !/\s/.test(password) && !EMOJI_REGEX.test(password), // sin espacios ni emojis
    ];

    const isValid = rules.every(Boolean);

    let label = 'Débil';
    let score = 1;
    let colorClass = 'text-rose-600';
    let barColor = 'bg-rose-500';
    let borderClass = 'border-rose-200';
    let bgBadge = 'bg-rose-50 text-rose-700 border-rose-200';

    if (password.length === 0) {
      score = 0;
      label = 'Sin ingresar';
      colorClass = 'text-slate-400';
      barColor = 'bg-slate-200';
      borderClass = 'border-slate-200';
      bgBadge = 'bg-slate-100 text-slate-500 border-slate-200';
    } else if (isValid) {
      label = 'Fuerte';
      score = 3;
      colorClass = 'text-emerald-600';
      barColor = 'bg-emerald-500';
      borderClass = 'border-emerald-200';
      bgBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else {
      // Complejidad: mayúscula, número, especial
      const complexityCount = [rules[1], rules[2], rules[3]].filter(Boolean).length;
      if (rules[0] && rules[4] && complexityCount >= 2) {
        label = 'Medio';
        score = 2;
        colorClass = 'text-amber-600';
        barColor = 'bg-amber-500';
        borderClass = 'border-amber-200';
        bgBadge = 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        label = 'Débil';
        score = 1;
        colorClass = 'text-rose-600';
        barColor = 'bg-rose-500';
        borderClass = 'border-rose-200';
        bgBadge = 'bg-rose-50 text-rose-700 border-rose-200';
      }
    }

    return {
      label,
      score,
      colorClass,
      barColor,
      borderClass,
      bgBadge,
    };
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border bg-slate-50/80 px-2.5 py-1.5 text-xs transition-all duration-200 ${analysis.borderClass} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-700 text-[11px] sm:text-xs">Fortaleza de contraseña:</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${analysis.bgBadge}`}
          >
            {analysis.score === 3 ? (
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3 h-3" />
            )}
            {analysis.label}
          </span>
        </div>

        {/* Sensor de colores (3 segmentos) */}
        <div className="flex items-center gap-1 w-20 sm:w-24 h-1.5" title={`Fortaleza: ${analysis.label}`}>
          <div
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${
              analysis.score >= 1 ? analysis.barColor : 'bg-slate-200'
            }`}
          />
          <div
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${
              analysis.score >= 2 ? analysis.barColor : 'bg-slate-200'
            }`}
          />
          <div
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${
              analysis.score >= 3 ? analysis.barColor : 'bg-slate-200'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
