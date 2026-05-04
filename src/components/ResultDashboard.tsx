import React from 'react';
import { Leaf, Mountain, Droplets, ShieldAlert, PawPrint } from 'lucide-react';
import type { EnvironmentalAnalysis } from '../services/geminiService';

interface ResultDashboardProps {
  analysis: EnvironmentalAnalysis;
  imageUrls: string[];
}

export function ResultDashboard({ analysis, imageUrls }: ResultDashboardProps) {
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'High': return 'text-red-600 bg-red-100 border-red-200';
      case 'Medium': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'Low': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'None': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'High': return 'bg-red-500 text-white shadow-red-200';
      case 'Medium': return 'bg-amber-500 text-white shadow-amber-200';
      case 'Low': return 'bg-emerald-500 text-white shadow-emerald-200';
      default: return 'bg-slate-500 text-white shadow-slate-200';
    }
  };

  const FactorCard = ({ title, icon: Icon, data }: { title: string, icon: any, data: any }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col items-start transition-all hover:shadow-md">
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getSeverityColor(data.severity)}`}>
          {data.severity}
        </span>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed flex-grow">
        {data.details}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Images and Summary */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          {imageUrls.map((url, index) => (
            <div key={index} className={`rounded-3xl overflow-hidden shadow border border-slate-200 bg-slate-50 relative aspect-[4/3] group ${imageUrls.length === 1 ? 'col-span-2' : ''}`}>
              <img src={url} alt={`Analyzed environment ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h3>
          <p className="text-slate-700 leading-relaxed font-medium">
            {analysis.summary}
          </p>
        </div>
      </div>

      {/* Right Column: Key Factors and Risk */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Overall Risk Banner */}
        <div className={`rounded-3xl p-6 shadow-xl flex items-center justify-between ${getRiskColor(analysis.overallRiskAssessment)}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-bold uppercase tracking-wider mb-1">Overall Risk Assessment</p>
              <h2 className="text-3xl font-bold text-white tracking-tight">{analysis.overallRiskAssessment} RISK</h2>
            </div>
          </div>
        </div>

        {/* Detailed Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FactorCard title="Algae Growth" icon={Droplets} data={analysis.algaeGrowth} />
          <FactorCard title="Sediment Deposits" icon={Mountain} data={analysis.sedimentDeposits} />
          <FactorCard title="Erosion Damage" icon={Leaf} data={analysis.erosionDamage} />
          <FactorCard title="Wildlife Risk" icon={PawPrint} data={analysis.wildlifeHabitatRisk} />
        </div>

      </div>
    </div>
  );
}
