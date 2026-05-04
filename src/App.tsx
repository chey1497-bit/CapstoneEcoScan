/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Leaf, Loader2, ArrowLeft, X } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDashboard } from './components/ResultDashboard';
import { analyzeImages, EnvironmentalAnalysis } from './services/geminiService';

export default function App() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<EnvironmentalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImagesSelected = (files: File[]) => {
    setImageFiles(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setImageUrls(prev => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (imageFiles.length === 0) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const parts = await Promise.all(imageFiles.map(fileToGenerativePart));
      const result = await analyzeImages(parts);
      setAnalysis(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setImageFiles([]);
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setImageUrls([]);
    setAnalysis(null);
    setError(null);
  };

  const fileToGenerativePart = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          resolve({ data: base64Data, mimeType: file.type });
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetAnalysis}>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Leaf className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">EcoScan</h1>
          </div>
          {analysis && (
            <button 
              onClick={resetAnalysis}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Analyze another
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {imageFiles.length === 0 && !isAnalyzing && !analysis && (
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Environmental Risk Analysis</h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Upload photos of an outdoor environment to instantly detect harmful algae growth, sediment deposits, and erosion damage.
            </p>
            <ImageUploader onImagesSelected={handleImagesSelected} />
          </div>
        )}

        {imageFiles.length > 0 && !isAnalyzing && !analysis && (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Ready to Analyze</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {imageUrls.map((url, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group bg-slate-50">
                  <img src={url} alt={`Upload preview ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl pointer-events-none"></div>
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-600 hover:text-red-500 hover:bg-white shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mb-10">
              <ImageUploader onImagesSelected={handleImagesSelected} compact />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={resetAnalysis}
                className="px-8 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 hover:text-slate-900 transition shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleAnalyze}
                className="px-8 py-3.5 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition shadow-sm hover:shadow flex items-center gap-2"
              >
                <Leaf className="w-5 h-5" />
                Analyze {imageFiles.length} Photo{imageFiles.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="max-w-md mx-auto text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                <Leaf className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Environment</h3>
            <p className="text-slate-500">Our AI is currently scanning for algae, sediment, and erosion patterns...</p>
          </div>
        )}

        {error && !isAnalyzing && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-fade-in-up">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6" /> {/* Placeholder icon for error */}
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button 
              onClick={resetAnalysis}
              className="px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {analysis && !isAnalyzing && imageUrls.length > 0 && (
          <div className="animate-fade-in-up">
            <ResultDashboard analysis={analysis} imageUrls={imageUrls} />
          </div>
        )}
      </main>
    </div>
  );
}
