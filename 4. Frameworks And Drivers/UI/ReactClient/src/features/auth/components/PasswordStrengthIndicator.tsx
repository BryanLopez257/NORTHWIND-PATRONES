import React, { useMemo } from 'react';
import { Check, X, ShieldAlert, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EMOJI_REGEX } from '@/core/utils/inputFilters';

export interface PasswordRule {
  id: string;
  label: string;
  missingText: string;
  met: boolean;
}

export interface PasswordStrengthIndicatorProps {
  password?: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
  className = '',
}) => {
  const analysis = useMemo(() => {
    const rules: PasswordRule[] = [
      {
        id: 'length',
        label: 'Mínimo 6 caracteres (máx. 100)',
        missingText: 'Mínimo 6 caracteres',
        met: password.length >= 6 && password.length <= 100,
      },
      {
        id: 'uppercase',
        label: 'Al menos una letra mayúscula (A-Z)',
        missingText: 'Una letra mayúscula (A-Z)',
        met: /[A-Z]/.test(password),
      },
      {
        id: 'number',
        label: 'Al menos un número (0-9)',
        missingText: 'Un número (0-9)',
        met: /[0-9]/.test(password),
      },
      {
        id: 'special',
        label: 'Al menos un símbolo o carácter especial (!@#$...)',
        missingText: 'Un símbolo o carácter especial',
        met: /[^a-zA-Z0-9\s]/.test(password),
      },
      {
        id: 'no-whitespace-emoji',
        label: 'Sin espacios en blanco ni emojis',
        missingText: 'Sin espacios ni emojis',
        met: !/\s/.test(password) && !EMOJI_REGEX.test(password),
      },
    ];

    const missingRules = rules.filter((r) => !r.met);
    const isValid = missingRules.length === 0;

    let strength: 'debile' | 'medio' | 'fuerte' = 'debile';
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
      strength = 'fuerte';
      label = 'Fuerte';
      score = 3;
      colorClass = 'text-emerald-600';
      barColor = 'bg-emerald-500';
      borderClass = 'border-emerald-200';
      bgBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else {
      // Complejidad requerida: mayúscula, número, símbolo
      const complexityCount = [rules[1].met, rules[2].met, rules[3].met].filter(Boolean).length;
      if (rules[0].met && rules[4].met && complexityCount >= 2) {
        strength = 'medio';
        label = 'Medio';
        score = 2;
        colorClass = 'text-amber-600';
        barColor = 'bg-amber-500';
        borderClass = 'border-amber-200';
        bgBadge = 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        strength = 'debile';
        label = 'Débil';
        score = 1;
        colorClass = 'text-rose-600';
        barColor = 'bg-rose-500';
        borderClass = 'border-rose-200';
        bgBadge = 'bg-rose-50 text-rose-700 border-rose-200';
      }
    }

    return {
      rules,
      missingRules,
      isValid,
      strength,
      label,
      score,
      colorClass,
      barColor,
      borderClass,
      bgBadge,
    };
  }, [password]);

  if (!password) {
    return (
      <div className={`text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 ${className}`}>
        <span>ℹ️ Requisitos: Mínimo 6 caracteres, mayúscula, número y símbolo. Sin emojis ni espacios.</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border bg-slate-50/70 p-3 text-xs space-y-2.5 transition-all duration-200 ${analysis.borderClass} ${className}`}
    >
      {/* Barra de progreso de fortaleza y Etiqueta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">Fortaleza de contraseña:</span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${analysis.bgBadge}`}
          >
            {analysis.score === 3 ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            {analysis.label}
          </span>
        </div>

        {/* 3 segmentos visuales */}
        <div className="flex items-center gap-1.5 w-32 h-2">
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

      {/* Mensaje en tiempo real: Falta para que sea válida */}
      {!analysis.isValid ? (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-amber-900 space-y-1">
          <div className="font-semibold text-[11px] sm:text-xs flex items-center gap-1.5 text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>Falta para que la contraseña sea válida:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {analysis.missingRules.map((rule) => (
              <span
                key={rule.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 font-medium text-[11px] shadow-2xs"
              >
                <X className="w-3 h-3 text-rose-500" />
                {rule.missingText}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-2 text-emerald-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold text-xs">
            ¡Contraseña válida y fuerte! Cumple con todas las validaciones de seguridad.
          </span>
        </div>
      )}

      {/* Lista detallada de validaciones en tiempo real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-slate-200/80 text-[11px]">
        {analysis.rules.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center gap-1.5 transition-colors duration-150 ${
              rule.met ? 'text-emerald-700 font-medium' : 'text-slate-500'
            }`}
          >
            {rule.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 font-bold shrink-0">
                •
              </span>
            )}
            <span className={rule.met ? 'line-through decoration-emerald-500/40 text-emerald-800' : ''}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
