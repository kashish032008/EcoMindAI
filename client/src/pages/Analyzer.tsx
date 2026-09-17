import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, X, Zap, CheckCircle, Loader2, Image } from 'lucide-react';
import { analyzeWaste, getErrorMessage } from '../services/api';
import toast from 'react-hot-toast';

const ANALYSIS_STEPS = [
  { label: 'Detecting object...', duration: 1200 },
  { label: 'Identifying material...', duration: 1000 },
  { label: 'Analysing condition...', duration: 1100 },
  { label: 'Generating recommendation...', duration: 900 },
];

export default function Analyzer() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);

  // Cleanup preview URL
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 10 MB.');
      return;
    }
    setSelectedFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }, [preview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select an image before analyzing.');
      return;
    }
    setAnalyzing(true);
    setStepIndex(0);

    // Simulate step progress
    let totalDelay = 0;
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      const delay = totalDelay;
      setTimeout(() => setStepIndex(i), delay);
      totalDelay += ANALYSIS_STEPS[i].duration;
    }

    try {
      const result = await analyzeWaste(selectedFile);
      // Navigate to result page with data via state
      navigate('/result', { state: { result, imagePreview: preview } });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setAnalyzing(false);
      setStepIndex(-1);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    setStepIndex(-1);
  };

  return (
    <div className="min-h-screen gradient-bg-subtle py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-surface)]/80 border border-[var(--color-border)] rounded-full text-sm text-[var(--color-primary)] font-medium mb-5 ">
            <Zap className="w-4 h-4" />
            AI Waste Analyzer
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-3">
            Upload or Capture a Waste Item
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Our AI will identify the material, analyse the condition, and recommend the best next action.
          </p>
        </div>

        {/* Upload Zone */}
        {!selectedFile ? (
          <div
            className={`upload-zone p-12 text-center cursor-pointer mb-6 ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-2xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center mx-auto mb-5">
              <Upload className="w-10 h-10 text-[var(--color-primary-light)]" />
            </div>
            <h3 className="font-semibold text-[var(--color-text)] text-lg mb-2">
              Drag & drop your image here
            </h3>
            <p className="text-[var(--color-text-muted)] text-sm mb-5">or click to browse files</p>
            <p className="text-[var(--color-text-muted)] text-xs">Supports JPEG, PNG, GIF, WebP · Max 10 MB</p>

            {/* Camera option */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                className="btn btn-outline text-sm py-2 px-5"
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <Image className="w-4 h-4" />
                Browse Files
              </button>
              <button
                type="button"
                className="btn btn-ghost text-sm py-2 px-5 border border-[var(--color-border)]"
                onClick={e => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              >
                <Camera className="w-4 h-4" />
                Use Camera
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : (
          /* Preview */
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-[var(--color-text)]">Selected Image</span>
              {!analyzing && (
                <button onClick={clearFile} className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="rounded-xl overflow-hidden bg-[var(--color-surface)] max-h-72 flex items-center justify-center">
              {preview && (
                <img src={preview} alt="Selected waste" className="max-h-72 w-full object-contain" />
              )}
            </div>
            <div className="mt-3 text-sm text-[var(--color-text-muted)] flex justify-between">
              <span className="truncate">{selectedFile.name}</span>
              <span className="ml-2 flex-shrink-0">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        )}

        {/* Analysis Step Indicator */}
        {analyzing && (
          <div className="card p-6 mb-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <Loader2 className="w-5 h-5 text-[var(--color-primary-light)] animate-spin" />
              <span className="font-semibold text-[var(--color-text)]">Analysis in Progress</span>
            </div>
            <div className="space-y-3">
              {ANALYSIS_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
                    ${i < stepIndex ? 'step-done' : i === stepIndex ? 'step-active' : 'step-pending'}`}
                  >
                    {i < stepIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : i === stepIndex ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span className="text-xs font-semibold">{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm transition-colors duration-300
                    ${i === stepIndex ? 'text-[var(--color-primary)] font-medium' : i < stepIndex ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 h-1.5 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <div
                className="h-full gradient-bg rounded-full transition-all duration-700"
                style={{ width: `${Math.round(((stepIndex + 1) / ANALYSIS_STEPS.length) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {selectedFile && !analyzing && (
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            className="btn btn-primary animate-pulse-glow w-full text-base py-3.5 justify-center animate-fade-up"
          >
            <Zap className="w-5 h-5" />
            Analyze Waste with AI
          </button>
        )}

        {/* Demo note */}
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-5">
          🤖 Running in Demo Analysis mode — results are illustrative.
          Connect an AI vision API to enable real-time image recognition.
        </p>
      </div>
    </div>
  );
}
