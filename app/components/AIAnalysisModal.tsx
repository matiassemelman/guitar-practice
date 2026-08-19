'use client';

import { useState, useEffect } from 'react';
import { ANALYSIS_TYPE_INFO } from '@/types/ai-analysis';
import type { AnalysisType } from '@/types/ai-analysis';
import SafeAnalysisText from '@/app/components/SafeAnalysisText';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAnalysisModal({ isOpen, onClose }: AIAnalysisModalProps) {
  // Estado
  const [step, setStep] = useState<'config' | 'loading' | 'results'>('config');
  const [selectedTypes, setSelectedTypes] = useState<AnalysisType[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  const [loadingStep, setLoadingStep] = useState<'analyzing-data' | 'generating-insights'>('analyzing-data');
  const [dataAnalysis, setDataAnalysis] = useState<any>(null);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setStep('config');
      setSelectedTypes([]);
      setAnalysis('');
      setError('');
      setDataAnalysis(null);
      setLoadingStep('analyzing-data');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handlers
  const toggleType = (type: AnalysisType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAnalyze = async () => {
    if (selectedTypes.length === 0) {
      setError('Seleccioná al menos un tipo de análisis');
      return;
    }

    setStep('loading');
    setError('');
    setLoadingStep('analyzing-data');

    try {
      // Simular transición entre pasos (para mejor UX)
      setTimeout(() => setLoadingStep('generating-insights'), 3000);

      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisTypes: selectedTypes })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error en el análisis');
      }

      setDataAnalysis(data.dataAnalysis);
      setAnalysis(data.insights);
      setSessionCount(data.sessionCount);
      setStep('results');

    } catch (err: any) {
      setError(err.message);
      setStep('config');
    }
  };

  const handleBack = () => {
    setStep('config');
    setAnalysis('');
  };

  // Render según paso
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-black/90 backdrop-blur-sm p-6 border-b border-neon-magenta/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neon-magenta">
              🤖 Coach IA - Feedback Inteligente
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-neon-magenta transition-colors"
              disabled={step === 'loading'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* PASO 1: Configuración */}
          {step === 'config' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neon-cyan mb-4">
                  Seleccioná qué querés analizar:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(ANALYSIS_TYPE_INFO) as AnalysisType[]).map(type => {
                    const info = ANALYSIS_TYPE_INFO[type];
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`
                          p-4 rounded-lg border-2 text-left transition-all duration-300
                          ${isSelected
                            ? 'border-neon-magenta bg-neon-magenta/10 glow-magenta'
                            : 'border-gray-700 bg-black/50 hover:border-neon-cyan'
                          }
                        `}
                      >
                        <div className="text-2xl mb-2">{info.icon}</div>
                        <div className="font-semibold text-gray-100 mb-1">{info.label}</div>
                        <div className="text-xs text-gray-400">{info.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-black/50 border border-neon-cyan/30 rounded-lg p-4 text-sm text-gray-300">
                ℹ️ Se analizarán hasta las últimas 30 sesiones de práctica.
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-400">
                  ⚠️ {error}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Loading */}
          {step === 'loading' && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 animate-pulse">
                {loadingStep === 'analyzing-data' ? '📊' : '💡'}
              </div>
              <div className="text-neon-cyan text-xl font-semibold mb-2">
                {loadingStep === 'analyzing-data'
                  ? 'Paso 1/2: Analizando datos...'
                  : 'Paso 2/2: Generando insights...'}
              </div>
              <div className="text-gray-400 text-sm">
                Esto puede tomar 10-20 segundos
              </div>
            </div>
          )}

          {/* PASO 3: Resultados */}
          {step === 'results' && (
            <div className="space-y-6">
              {/* Sección 1: Análisis de Datos */}
              {dataAnalysis && (
                <div className="bg-black/30 border border-neon-magenta/20 rounded-lg p-6">
                  <h2 className="text-neon-magenta text-xl font-bold mb-4">📊 Análisis de Datos</h2>

                  {/* Métricas */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/40 p-3 rounded">
                      <div className="text-xs text-gray-400">Total Sesiones</div>
                      <div className="text-lg font-bold text-neon-cyan">{dataAnalysis.metrics?.totalSessions || 0}</div>
                    </div>
                    <div className="bg-black/40 p-3 rounded">
                      <div className="text-xs text-gray-400">Minutos Totales</div>
                      <div className="text-lg font-bold text-neon-cyan">{dataAnalysis.metrics?.totalMinutes || 0}</div>
                    </div>
                    <div className="bg-black/40 p-3 rounded">
                      <div className="text-xs text-gray-400">Duración Promedio</div>
                      <div className="text-lg font-bold text-neon-cyan">{dataAnalysis.metrics?.avgDuration?.toFixed(0) || 0} min</div>
                    </div>
                    <div className="bg-black/40 p-3 rounded">
                      <div className="text-xs text-gray-400">Calidad Promedio</div>
                      <div className="text-lg font-bold text-neon-cyan">{dataAnalysis.metrics?.avgQuality?.toFixed(1) || 'N/A'}★</div>
                    </div>
                  </div>

                  {/* Alertas */}
                  {dataAnalysis.alerts && dataAnalysis.alerts.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-neon-yellow text-sm font-semibold">⚠️ Alertas</h3>
                      {dataAnalysis.alerts.map((alert: any, idx: number) => (
                        <div key={idx} className={`text-xs p-2 rounded ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                          alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sección 2: Insights */}
              <div className="bg-black/30 border border-neon-cyan/20 rounded-lg p-6">
                <h2 className="text-neon-cyan text-xl font-bold mb-4">💡 Insights Personalizados</h2>
                <SafeAnalysisText content={analysis} />
              </div>

              <div className="text-xs text-gray-500 text-right">
                {sessionCount} sesiones analizadas
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black/90 backdrop-blur-sm p-6 border-t border-neon-magenta/30">
          <div className="flex gap-3">
            {step === 'config' && (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={selectedTypes.length === 0}
                  className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-neon-magenta to-neon-pink text-white font-bold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-magenta"
                >
                  Analizar 🚀
                </button>
              </>
            )}

            {step === 'results' && (
              <>
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 px-6 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
                >
                  ← Nuevo Análisis
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-green text-black font-bold hover:scale-[1.02] transition-all glow-cyan"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
