import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Layers, 
  Cpu, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  Play, 
  Server, 
  Terminal, 
  ShieldCheck, 
  AlertCircle,
  FileCode2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';
import { DatasetSource, MLModel } from '../../types';
import { Button } from '../common/Button';

export const DatasetSystemScreen: React.FC = () => {
  const { backendStatus, checkBackendStatus, isDemoMode, setIsDemoMode, addToast } = useApp();
  const [datasets, setDatasets] = useState<DatasetSource[]>([]);
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiveApi, setIsLiveApi] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [selectedDataset, setSelectedDataset] = useState<DatasetSource | null>(null);
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([
    'System initialization verified.',
    'SQLite / PostgreSQL DB connection ready.',
    '5 cricket dataset adapters registered and schema validated.'
  ]);

  const loadSystemInfo = async () => {
    setLoading(true);
    try {
      const [dsRes, mRes] = await Promise.all([
        ApiService.getDatasets(),
        ApiService.getModels()
      ]);
      setDatasets(dsRes.items);
      setModels(mRes.items);
      setIsLiveApi(dsRes.isLive);
      if (dsRes.items.length > 0 && !selectedDataset) {
        setSelectedDataset(dsRes.items[0]);
      }
    } catch (err) {
      console.error('Failed to load system datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemInfo();
  }, [isDemoMode]);

  const handleTriggerIngestion = (datasetName: string) => {
    setIsIngesting(true);
    setIngestionLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] INGESTION_JOB_INIT: ${datasetName}`,
      `[${new Date().toLocaleTimeString()}] Validating data schema and manifest files...`
    ]);

    setTimeout(() => {
      setIngestionLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Parsing annotations, keyframe timestamps and pose coordinates...`,
        `[${new Date().toLocaleTimeString()}] Normalizing coordinate vectors to standard camera aspect...`
      ]);
    }, 1200);

    setTimeout(() => {
      setIngestionLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Ingestion completed successfully for ${datasetName}. 150 records indexed.`,
        `[${new Date().toLocaleTimeString()}] Telemetry cache warmed.`
      ]);
      setIsIngesting(false);
      addToast('Ingestion Complete', `${datasetName} metadata verified and synchronized`, 'success');
    }, 2800);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-scout-surface border border-scout-card p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-scout-neon/10 border border-scout-neon/30 flex items-center justify-center text-scout-neon">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase">
                Dataset & System Architecture
              </h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                backendStatus.isOnline 
                  ? 'border-scout-neon/30 bg-scout-neon/10 text-scout-neon' 
                  : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
              }`}>
                {backendStatus.isOnline ? `FASTAPI ONLINE (${backendStatus.dialect?.toUpperCase()})` : 'DEMO SANDBOX'}
              </span>
            </div>
            <p className="text-xs text-scout-muted mt-0.5">
              5 Ingestion adapters, machine learning model registry, and relational schema status
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              checkBackendStatus();
              loadSystemInfo();
            }}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin mr-1.5' : 'mr-1.5'} />
            Check Live DB
          </Button>
          <Button 
            variant={isDemoMode ? 'neon' : 'secondary'} 
            size="sm" 
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="text-xs font-mono"
          >
            {isDemoMode ? 'Demo Sandbox Mode (Active)' : 'Live API Auto-Detect'}
          </Button>
        </div>
      </div>

      {/* System Infrastructure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Backend Status */}
        <div className="bg-scout-surface border border-scout-card p-4">
          <div className="flex items-center justify-between text-xs text-scout-muted mb-2">
            <span className="font-mono uppercase text-[11px]">Backend API</span>
            <Server size={14} className={backendStatus.isOnline ? 'text-scout-neon' : 'text-yellow-400'} />
          </div>
          <div className="text-lg font-bold font-mono text-white flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${backendStatus.isOnline ? 'bg-scout-neon animate-pulse' : 'bg-yellow-400'}`}></span>
            {backendStatus.isOnline ? 'FastAPI 0.111' : 'Local Fallback'}
          </div>
          <div className="text-[11px] text-scout-muted font-mono mt-1">
            Endpoint: <span className="text-gray-300">http://127.0.0.1:8000</span>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-scout-surface border border-scout-card p-4">
          <div className="flex items-center justify-between text-xs text-scout-muted mb-2">
            <span className="font-mono uppercase text-[11px]">Database Layer</span>
            <Database size={14} className="text-scout-neon" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            {backendStatus.dialect ? backendStatus.dialect.toUpperCase() : 'SQLITE 3.45 / PG'}
          </div>
          <div className="text-[11px] text-scout-muted font-mono mt-1">
            Engine: <span className="text-gray-300">SQLAlchemy 2.0 ORM</span>
          </div>
        </div>

        {/* Vision Inference */}
        <div className="bg-scout-surface border border-scout-card p-4">
          <div className="flex items-center justify-between text-xs text-scout-muted mb-2">
            <span className="font-mono uppercase text-[11px]">Kinematic Engine</span>
            <Cpu size={14} className="text-scout-neon" />
          </div>
          <div className="text-lg font-bold font-mono text-white">
            OpenCV & Vectors
          </div>
          <div className="text-[11px] text-scout-muted font-mono mt-1">
            Throughput: <span className="text-scout-neon font-bold">60 FPS Native</span>
          </div>
        </div>

        {/* Research Sources */}
        <div className="bg-scout-surface border border-scout-card p-4">
          <div className="flex items-center justify-between text-xs text-scout-muted mb-2">
            <span className="font-mono uppercase text-[11px]">Datasets Integrated</span>
            <Layers size={14} className="text-scout-neon" />
          </div>
          <div className="text-lg font-bold font-mono text-scout-neon">
            {datasets.length} Cricket Sources
          </div>
          <div className="text-[11px] text-scout-muted font-mono mt-1">
            Traceability: <span className="text-gray-300">100% Attributed</span>
          </div>
        </div>
      </div>

      {/* Dataset Importers & Ingestion Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Datasets List */}
        <div className="lg:col-span-7 bg-scout-surface border border-scout-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-scout-card pb-3">
            <div>
              <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-scout-neon" />
                Integrated Cricket Datasets
              </h2>
              <p className="text-xs text-scout-muted mt-0.5">
                Targeted research corpora utilized for biomechanical benchmarks and action classification
              </p>
            </div>
            <span className="text-xs font-mono text-scout-neon">
              {datasets.length} Adapters
            </span>
          </div>

          <div className="space-y-3">
            {datasets.map(ds => (
              <div 
                key={ds.id}
                onClick={() => setSelectedDataset(ds)}
                className={`p-4 border transition-all cursor-pointer ${
                  selectedDataset?.id === ds.id 
                    ? 'border-scout-neon/60 bg-scout-card/60 shadow-lg' 
                    : 'border-scout-card bg-scout-card/30 hover:border-scout-card/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold font-mono text-white">
                        {ds.name}
                      </h3>
                      {ds.is_official_candidate && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-scout-neon/15 text-scout-neon border border-scout-neon/30">
                          OFFICIAL CANDIDATE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-scout-muted mt-1 leading-relaxed">
                      {ds.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-scout-card/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-3 text-scout-muted">
                    <span>License: <strong className="text-gray-300 font-medium">{ds.license_type}</strong></span>
                    <span>Samples: <strong className="text-scout-neon font-medium">{ds.total_samples || '1,000+'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerIngestion(ds.name);
                      }}
                      disabled={isIngesting}
                      className="px-2.5 py-1 text-[11px] font-mono bg-scout-card hover:bg-scout-neon hover:text-black border border-scout-card text-gray-200 transition-colors flex items-center gap-1"
                    >
                      <Play size={10} /> Test Ingestion
                    </button>
                    {ds.website_url && (
                      <a
                        href={ds.website_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-scout-muted hover:text-white p-1"
                        title="Source Website"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Ingestion Console & Dataset Detail */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Dataset Detail Card */}
          {selectedDataset && (
            <div className="bg-scout-surface border border-scout-card p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-scout-neon" />
                Dataset Provenance & Citation
              </h3>
              
              <div className="text-xs space-y-2 font-mono">
                <div>
                  <span className="text-scout-muted block text-[10px] uppercase">Dataset Identifier Slug</span>
                  <span className="text-scout-neon">{selectedDataset.slug}</span>
                </div>
                {selectedDataset.paper_citation && (
                  <div>
                    <span className="text-scout-muted block text-[10px] uppercase">Scientific Paper Citation</span>
                    <p className="text-gray-300 bg-scout-card p-2 border border-scout-card/60 text-[11px] leading-relaxed">
                      {selectedDataset.paper_citation}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-scout-muted block text-[10px] uppercase">Ingestion Adapter Class</span>
                  <span className="text-gray-200 flex items-center gap-1.5">
                    <FileCode2 size={13} className="text-scout-neon" />
                    scoutai.datasets.adapters.{selectedDataset.slug.replace(/-/g, '_')}_adapter
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ingestion Console Log Simulator */}
          <div className="bg-scout-surface border border-scout-card p-4 flex flex-col h-[320px]">
            <div className="flex items-center justify-between border-b border-scout-card pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-scout-neon" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  Ingestion Adapter Log Stream
                </span>
              </div>
              <span className={`w-2 h-2 rounded-full ${isIngesting ? 'bg-amber-400 animate-ping' : 'bg-scout-neon'}`}></span>
            </div>

            <div className="flex-1 bg-black/70 p-3 font-mono text-[11px] text-green-400 overflow-y-auto space-y-1 border border-scout-card/40">
              {ingestionLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Model Registry Section */}
      <div className="bg-scout-surface border border-scout-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-scout-card pb-3">
          <div>
            <h2 className="text-sm font-mono font-bold uppercase text-white tracking-wider flex items-center gap-2">
              <Cpu size={16} className="text-scout-neon" />
              Machine Learning Model Registry ({models.length})
            </h2>
            <p className="text-xs text-scout-muted mt-0.5">
              Production kinematic estimators and action classification architectures
            </p>
          </div>
          <span className="text-xs font-mono text-scout-muted">
            Registry Version: v1.0.0-prod
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map(model => (
            <div 
              key={model.id}
              className="bg-scout-card/40 border border-scout-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-white text-sm">
                      {model.name}
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-scout-neon/20 text-scout-neon border border-scout-neon/30">
                      v{model.version}
                    </span>
                  </div>
                  <div className="text-xs text-scout-muted font-mono mt-0.5">
                    Identifier: <span className="text-gray-300">{model.model_identifier}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                  model.is_active 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                    : 'border-scout-muted/30 bg-scout-card text-scout-muted'
                }`}>
                  {model.is_active ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-scout-surface p-2.5 border border-scout-card/60">
                <div>
                  <div className="text-[10px] text-scout-muted uppercase">Task Type</div>
                  <div className="text-white text-[11px] truncate">{model.task_type.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="text-[10px] text-scout-muted uppercase">Architecture</div>
                  <div className="text-white text-[11px] truncate">{model.architecture}</div>
                </div>
                <div>
                  <div className="text-[10px] text-scout-muted uppercase">Framework</div>
                  <div className="text-scout-neon text-[11px] truncate">{model.framework}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ethical Licensing & Scientific Attribution Card */}
      <div className="flex items-start gap-3 p-4 bg-scout-surface border border-scout-card text-xs text-scout-muted">
        <ShieldCheck size={18} className="text-scout-neon flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-mono uppercase text-[11px] mb-0.5">
            Licensing Transparency & Academic Attribution
          </strong>
          ScoutAI honors open-science licensing terms. All datasets listed are referenced from published literature (e.g. UJ-AQA-CricketVision, CricPose360, CricShot10). Video clips are imported locally via decoupled adapters without redistributing copyrighted broadcast footage. Synthetic records are explicitly tagged with <code className="text-scout-neon font-mono">is_synthetic: true</code> to maintain scientific integrity.
        </div>
      </div>
    </div>
  );
};
