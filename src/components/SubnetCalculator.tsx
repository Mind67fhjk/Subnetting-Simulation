import { useState, useCallback } from 'react';
import { calculateSubnet, validateIp, SubnetInfo } from '../lib/subnet';
import BinaryVisualizer from './BinaryVisualizer';
import AddressSpaceMap from './AddressSpaceMap';
import SubnetSplitter from './SubnetSplitter';
import SubnetStepExplainer from './SubnetStepExplainer';
import CidrReference from './CidrReference';
import { Network, GitBranch, Binary, BookOpen, ChevronDown, ChevronUp, Layers, ExternalLink, MessageCircle } from 'lucide-react';

export default function SubnetCalculator() {
  const [ip, setIp] = useState('192.168.1.0');
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState('');
  const [showRef, setShowRef] = useState(false);

  const handleCalculate = useCallback(() => {
    if (!validateIp(ip)) {
      setError('Invalid IP address. Use format: x.x.x.x (0-255)');
      setResult(null);
      return;
    }
    setError('');
    setResult(calculateSubnet(ip, cidr));
  }, [ip, cidr]);

  const handleCidrFromRef = useCallback(
    (c: number) => {
      setCidr(c);
      if (validateIp(ip)) {
        setResult(calculateSubnet(ip, c));
      }
    },
    [ip]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Elaja</h1>
              <p className="text-[10px] text-slate-500 tracking-wide">IP Subnetting Simulator</p>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 p-5 shadow-xl shadow-cyan-950/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">About Me</p>
              <h2 className="text-xl font-semibold text-white">Dedicated computer scientist</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                I build practical networking tools and I am open to work on new projects.
              </p>
            </div>

            <a
              href="https://t.me/ElajaUnlocks"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition-colors hover:bg-cyan-400/15 hover:text-cyan-100"
            >
              <MessageCircle className="h-4 w-4" />
              Telegram Channel
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Input Section */}
        <section className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-end">
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => {
                  setIp(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                placeholder="e.g. 192.168.1.0"
                className={`w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 transition-all ${
                  error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-slate-700 focus:ring-teal-500/30 focus:border-teal-500/50'
                }`}
              />
              {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
            </div>

            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                CIDR Prefix Length: <span className="text-teal-400 font-mono">/{cidr}</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={cidr}
                  onChange={(e) => setCidr(Number(e.target.value))}
                  className="flex-1 accent-teal-500 h-1.5 cursor-pointer"
                />
                <input
                  type="number"
                  min={0}
                  max={32}
                  value={cidr}
                  onChange={(e) => setCidr(Math.min(32, Math.max(0, Number(e.target.value))))}
                  className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="px-8 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-95 whitespace-nowrap"
            >
              Calculate
            </button>
          </div>
        </section>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Step-by-Step Explanation - Full width */}
            <section className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
              <SubnetStepExplainer result={result} />
            </section>

            {/* Two column layout below */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Summary Card */}
                <section className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-teal-500" />
                    Subnet Details
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { label: 'Network', value: `${result.networkAddress}/${result.cidr}`, highlight: true },
                      { label: 'Subnet Mask', value: result.subnetMask },
                      { label: 'Broadcast', value: result.broadcastAddress },
                      { label: 'Wildcard', value: result.wildcardMask },
                      { label: 'First Host', value: result.firstHost },
                      { label: 'Last Host', value: result.lastHost },
                      { label: 'Total Addresses', value: result.totalHosts.toLocaleString() },
                      { label: 'Usable Hosts', value: result.usableHosts.toLocaleString(), color: 'text-emerald-400' },
                      { label: 'IP Class', value: result.ipClass },
                      { label: 'CIDR', value: `/${result.cidr}` },
                    ].map(({ label, value, highlight, color }) => (
                      <div key={label} className="space-y-0.5">
                        <dt className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{label}</dt>
                        <dd
                          className={`font-mono text-sm ${
                            highlight ? 'text-teal-400 font-bold text-base' : color || 'text-slate-200'
                          }`}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </div>
                </section>

                {/* CIDR Reference */}
                <section className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
                  <button
                    onClick={() => setShowRef(!showRef)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-500" />
                      CIDR Reference
                    </span>
                    {showRef ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showRef && (
                    <div className="mt-4">
                      <CidrReference selectedCidr={result.cidr} onSelectCidr={handleCidrFromRef} />
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Binary Visualization */}
                <section className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
                  <BinaryVisualizer
                    binaryIp={result.binaryIp}
                    binaryMask={result.binaryMask}
                    binaryNetwork={result.binaryNetwork}
                    cidr={result.cidr}
                  />
                </section>

                {/* Address Space Map */}
                <section className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
                  <AddressSpaceMap
                    cidr={result.cidr}
                    networkAddress={result.networkAddress}
                    broadcastAddress={result.broadcastAddress}
                    firstHost={result.firstHost}
                    lastHost={result.lastHost}
                  />
                </section>

                {/* Subnet Splitter */}
                <section className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
                  <SubnetSplitter networkAddress={result.networkAddress} cidr={result.cidr} />
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
              <Binary className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-400 mb-2">Enter an IP and CIDR to begin</h2>
            <p className="text-sm text-slate-600 max-w-md">
              Visualize binary representations, step-by-step calculations, address space maps, and interactively split subnets.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-slate-600">
          <span>Elaja - IP Subnetting Simulator</span>
          <a
            href="https://t.me/ElajaUnlocks"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-400 transition-colors"
          >
            t.me/ElajaUnlocks
          </a>
          <span>Built with React + Tailwind</span>
        </div>
      </footer>
    </div>
  );
}
