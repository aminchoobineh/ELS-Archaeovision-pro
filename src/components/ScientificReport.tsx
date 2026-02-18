import React from 'react';
import { AnalysisResult } from '../services/api';

export const ScientificReport: React.FC<{ report: AnalysisResult }> = ({ report }) => {
  const { analysis, archaeological_interpretation } = report;
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold text-amber-900 mb-3">📊 گزارش علمی</h3>
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-bold">سازه‌های زیرسطحی:</span> احتمال {Math.round(analysis.subsurface_structures.probability * 100)}% ، تعداد {analysis.subsurface_structures.count}
        </div>
        <div>
          <span className="font-bold">حفره‌ها:</span> احتمال {Math.round(analysis.cavities.probability * 100)}% ، آنومالی دمایی {analysis.cavities.thermal_anomaly.toFixed(1)}°C
        </div>
        <div>
          <span className="font-bold">فلزات:</span> احتمال {Math.round(analysis.metals.probability * 100)}% ، شاخص آهن {analysis.metals.iron_oxide_index.toFixed(2)}
        </div>
        <div className="border-t pt-2 mt-2">
          <p className="font-bold">تفسیر:</p>
          <p>{archaeological_interpretation.summary_fa}</p>
          <p className="text-xs text-stone-500">سطح اطمینان: {archaeological_interpretation.confidence_level}</p>
        </div>
      </div>
    </div>
  );
};