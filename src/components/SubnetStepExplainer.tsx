import { useState, useEffect, memo } from 'react';
import { SubnetInfo, longToIp, ipToBinary, maskToBinary, ipToLong } from '../lib/subnet';
import { ChevronRight, CheckCircle2, Circle, ArrowRight, Layers, Binary as BinaryIcon, ScanLine, Divide } from 'lucide-react';

interface SubnetStepExplainerProps {
  result: SubnetInfo;
}

interface StepData {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const BitRow = memo(function BitRow({
  bits,
  highlightCount,
  label,
  labelColor,
  networkColor,
  hostColor,
}: {
  bits: string;
  highlightCount: number;
  label: string;
  labelColor: string;
  networkColor: string;
  hostColor: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`text-[10px] font-semibold uppercase tracking-wider w-28 text-right shrink-0 ${labelColor}`}>{label}</span>
      <div className="flex gap-[1px] font-mono text-[11px] leading-none">
        {bits.split('').map((bit, i) => {
          const dotSep = i > 0 && i % 8 === 0;
          const isNetwork = i < highlightCount;
          return (
            <span key={i} className="relative">
              {dotSep && <span className="text-slate-600 mx-[1px]">.</span>}
              <span
                className={`inline-block w-[10px] text-center rounded-sm px-[1px] py-1 transition-all duration-300 ${
                  isNetwork ? `${networkColor}` : `${hostColor}`
                }`}
                style={{ transitionDelay: `${i * 15}ms` }}
              >
                {bit}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
});

function SubnetStepExplainer({ result }: SubnetStepExplainerProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const ipLong = ipToLong(result.ip);
  const mask = result.cidr === 0 ? 0 : (~0 << (32 - result.cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const networkLong = (ipLong & mask) >>> 0;
  const broadcastLong = (networkLong | wildcard) >>> 0;

  const ipBits = ipToBinary(result.ip).replace(/\./g, '');
  const maskBits = maskToBinary(result.cidr).replace(/\./g, '');
  const wildcardBits = ipToBinary(result.wildcardMask).replace(/\./g, '');
  const networkBits = ipToBinary(result.networkAddress).replace(/\./g, '');
  const broadcastBits = ipToBinary(result.broadcastAddress).replace(/\./g, '');

  const goToStep = (n: number) => {
    if (n === activeStep) return;
    setAnimating(true);
    setActiveStep(n);
    setTimeout(() => setAnimating(false), 400);
  };

  const steps: StepData[] = [
    {
      number: 1,
      title: 'Convert IP to Binary',
      description: `The first step is converting the dotted-decimal IP address (${result.ip}) into its 32-bit binary representation. Each octet (0-255) becomes 8 binary digits.`,
      icon: <BinaryIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {result.ip.split('.').map((octet, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-cyan-400 font-mono mb-1">{octet}</div>
                <ArrowRight className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                <div className="font-mono text-[11px] tracking-wider text-slate-300 bg-slate-800 rounded px-2 py-1">
                  {octet.toString(2).padStart(8, '0')}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <div className="text-[10px] text-slate-500 mb-1.5 font-semibold uppercase tracking-wider">Full 32-bit result</div>
            <BitRow
              bits={ipBits}
              highlightCount={32}
              label="IP"
              labelColor="text-cyan-400"
              networkColor="bg-cyan-500/15 text-cyan-400"
              hostColor="bg-cyan-500/8 text-cyan-400/60"
            />
          </div>
        </div>
      ),
    },
    {
      number: 2,
      title: 'Create the Subnet Mask',
      description: `The CIDR prefix /${result.cidr} means the first ${result.cidr} bits are network bits (set to 1) and the remaining ${32 - result.cidr} bits are host bits (set to 0). This creates the subnet mask ${result.subnetMask}.`,
      icon: <Layers className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-mono bg-slate-800 rounded px-3 py-1.5">/{result.cidr}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-mono text-amber-400">{result.cidr} ones</span>
            <span className="text-slate-600">+</span>
            <span className="text-sm font-mono text-slate-400">{32 - result.cidr} zeros</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-mono text-amber-300 font-bold">{result.subnetMask}</span>
          </div>
          <div className="space-y-2">
            <BitRow
              bits={maskBits}
              highlightCount={result.cidr}
              label="Mask"
              labelColor="text-amber-400"
              networkColor="bg-amber-500/15 text-amber-400"
              hostColor="bg-slate-800/50 text-slate-600"
            />
            <div className="flex items-center gap-2.5">
              <span className="w-28 shrink-0" />
              <div className="flex text-[10px] font-semibold uppercase tracking-wider">
                <span className="text-amber-400" style={{ width: `${result.cidr * 12 + Math.floor(result.cidr / 8) * 4}px` }}>
                  {result.cidr} Network bits
                </span>
                <span className="text-slate-600" style={{ width: `${(32 - result.cidr) * 12 + Math.floor((32 - result.cidr - 1) / 8) * 4}px` }}>
                  {32 - result.cidr} Host bits
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: 'Find the Wildcard Mask',
      description: `The wildcard mask is the bitwise inverse (NOT) of the subnet mask. Every 0 becomes 1 and every 1 becomes 0. It identifies which bits can vary for host addresses.`,
      icon: <ScanLine className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-mono bg-slate-800 rounded px-3 py-1.5">NOT {result.subnetMask}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-mono text-rose-400 font-bold">{result.wildcardMask}</span>
          </div>
          <div className="space-y-2">
            <BitRow
              bits={maskBits}
              highlightCount={result.cidr}
              label="Mask"
              labelColor="text-amber-400"
              networkColor="bg-amber-500/15 text-amber-400"
              hostColor="bg-slate-800/50 text-slate-600"
            />
            <div className="flex items-center gap-2.5">
              <span className="w-28 shrink-0" />
              <div className="flex gap-[1px] font-mono text-[11px]">
                <span className="text-slate-700 text-center" style={{ width: '100%' }}>
                  {'NOT (invert every bit)'}
                </span>
              </div>
            </div>
            <BitRow
              bits={wildcardBits}
              highlightCount={result.cidr}
              label="Wildcard"
              labelColor="text-rose-400"
              networkColor="bg-slate-800/50 text-slate-600"
              hostColor="bg-rose-500/15 text-rose-400"
            />
          </div>
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3">
            Wildcard bits that are <span className="text-rose-400 font-semibold">1</span> can change freely — they define the host portion of the address.
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: 'Calculate Network Address',
      description: `The network address is found by performing a bitwise AND between the IP address and the subnet mask. This zeroes out all host bits, leaving only the network portion.`,
      icon: <Layers className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap text-sm font-mono">
            <span className="text-cyan-400">{result.ip}</span>
            <span className="text-slate-500">AND</span>
            <span className="text-amber-400">{result.subnetMask}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-emerald-400 font-bold">{result.networkAddress}</span>
          </div>
          <div className="space-y-2">
            <BitRow
              bits={ipBits}
              highlightCount={result.cidr}
              label="IP"
              labelColor="text-cyan-400"
              networkColor="bg-cyan-500/15 text-cyan-400"
              hostColor="bg-cyan-500/8 text-cyan-400/40"
            />
            <BitRow
              bits={maskBits}
              highlightCount={result.cidr}
              label="AND Mask"
              labelColor="text-amber-400"
              networkColor="bg-amber-500/15 text-amber-400"
              hostColor="bg-amber-500/8 text-amber-400/40"
            />
            <div className="flex items-center gap-2.5">
              <span className="w-28 shrink-0" />
              <div className="h-[1px] border-t border-dashed border-slate-600 w-full" />
            </div>
            <BitRow
              bits={networkBits}
              highlightCount={result.cidr}
              label="Network"
              labelColor="text-emerald-400"
              networkColor="bg-emerald-500/15 text-emerald-400"
              hostColor="bg-emerald-500/8 text-emerald-400/30"
            />
          </div>
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3">
            <span className="text-emerald-400 font-semibold">1 AND 1 = 1</span>, everything else becomes 0.
            The host bits are zeroed, giving us the network address.
          </div>
        </div>
      ),
    },
    {
      number: 5,
      title: 'Calculate Broadcast Address',
      description: `The broadcast address is found by OR-ing the network address with the wildcard mask. This sets all host bits to 1, reaching the last address in the subnet.`,
      icon: <ScanLine className="w-4 h-4" />,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap text-sm font-mono">
            <span className="text-emerald-400">{result.networkAddress}</span>
            <span className="text-slate-500">OR</span>
            <span className="text-rose-400">{result.wildcardMask}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="text-amber-400 font-bold">{result.broadcastAddress}</span>
          </div>
          <div className="space-y-2">
            <BitRow
              bits={networkBits}
              highlightCount={result.cidr}
              label="Network"
              labelColor="text-emerald-400"
              networkColor="bg-emerald-500/15 text-emerald-400"
              hostColor="bg-emerald-500/8 text-emerald-400/30"
            />
            <BitRow
              bits={wildcardBits}
              highlightCount={result.cidr}
              label="OR Wildcard"
              labelColor="text-rose-400"
              networkColor="bg-slate-800/50 text-slate-600"
              hostColor="bg-rose-500/15 text-rose-400"
            />
            <div className="flex items-center gap-2.5">
              <span className="w-28 shrink-0" />
              <div className="h-[1px] border-t border-dashed border-slate-600 w-full" />
            </div>
            <BitRow
              bits={broadcastBits}
              highlightCount={result.cidr}
              label="Broadcast"
              labelColor="text-amber-400"
              networkColor="bg-amber-500/15 text-amber-400"
              hostColor="bg-amber-500/15 text-amber-400"
            />
          </div>
          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3">
            <span className="text-amber-400 font-semibold">0 OR 1 = 1</span>, <span className="text-slate-400">0 OR 0 = 0</span>.
            The wildcard mask's 1-bits fill in all host positions, giving the broadcast.
          </div>
        </div>
      ),
    },
    {
      number: 6,
      title: 'Determine Host Range',
      description: `The usable host range excludes the network and broadcast addresses. First host = network + 1. Last host = broadcast - 1. Total usable hosts = ${result.usableHosts.toLocaleString()}.`,
      icon: <Divide className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm font-mono">
              <span className="text-slate-500">First host:</span>
              <span className="text-emerald-400">{result.networkAddress}</span>
              <span className="text-slate-600">+ 1</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-emerald-400 font-bold">{result.firstHost}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-mono">
              <span className="text-slate-500">Last host:</span>
              <span className="text-amber-400">{result.broadcastAddress}</span>
              <span className="text-slate-600">- 1</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-amber-400 font-bold">{result.lastHost}</span>
            </div>
          </div>

          {/* Visual range */}
          <div className="relative mt-3">
            <div className="flex rounded-lg overflow-hidden h-12 border border-slate-700">
              <div className="w-[8%] bg-red-500/20 border-r border-slate-700 flex flex-col items-center justify-center">
                <span className="text-[8px] text-red-400 font-semibold uppercase">Net</span>
                <span className="text-[9px] font-mono text-red-300 truncate">{result.networkAddress.split('.').slice(3)[0]}</span>
              </div>
              <div className="flex-1 bg-emerald-500/10 flex flex-col items-center justify-center">
                <span className="text-[8px] text-emerald-400 font-semibold uppercase">Usable Hosts</span>
                <span className="text-[9px] font-mono text-emerald-300">{result.usableHosts.toLocaleString()} addresses</span>
              </div>
              <div className="w-[8%] bg-amber-500/20 border-l border-slate-700 flex flex-col items-center justify-center">
                <span className="text-[8px] text-amber-400 font-semibold uppercase">Bcast</span>
                <span className="text-[9px] font-mono text-amber-300 truncate">{result.broadcastAddress.split('.').slice(3)[0]}</span>
              </div>
            </div>

            {/* Pointer arrows */}
            <div className="flex justify-between mt-2 px-[4%] text-[10px] font-mono">
              <span className="text-emerald-400">{result.firstHost}</span>
              <span className="text-emerald-400">{result.lastHost}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-slate-500 mb-0.5">Total addresses</div>
              <div className="font-mono text-white text-lg font-bold">{result.totalHosts.toLocaleString()}</div>
              <div className="text-slate-600 text-[10px]">2<sup>{32 - result.cidr}</sup> = 2{32 - result.cidr}</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-slate-500 mb-0.5">Usable hosts</div>
              <div className="font-mono text-emerald-400 text-lg font-bold">{result.usableHosts.toLocaleString()}</div>
              <div className="text-slate-600 text-[10px]">{result.cidr >= 31 ? 'point-to-point link' : '2 host addresses reserved'}</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Layers className="w-4 h-4 text-cyan-500" />
        Step-by-Step Explanation
      </h3>

      {/* Step navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {steps.map((step) => (
          <button
            key={step.number}
            onClick={() => goToStep(step.number - 1)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
              activeStep === step.number - 1
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                : activeStep > step.number - 1
                ? 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                : 'bg-slate-800/30 text-slate-600 border border-slate-800 hover:bg-slate-800/50'
            }`}
          >
            {activeStep > step.number - 1 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Circle className={`w-3.5 h-3.5 ${activeStep === step.number - 1 ? 'text-cyan-400' : 'text-slate-600'}`} />
            )}
            {step.title}
          </button>
        ))}
      </div>

      {/* Active step content */}
      <div
        className={`bg-slate-800/40 rounded-xl border border-slate-700 p-5 transition-all duration-300 ${
          animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
            {steps[activeStep].icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Step {steps[activeStep].number}: {steps[activeStep].title}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{steps[activeStep].description}</p>
          </div>
        </div>
        {steps[activeStep].content}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goToStep(activeStep - 1)}
          disabled={activeStep === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 bg-slate-800 text-slate-400 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
        >
          Previous
        </button>
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goToStep(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === activeStep ? 'bg-cyan-400 w-4' : i < activeStep ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => goToStep(activeStep + 1)}
          disabled={activeStep === steps.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default SubnetStepExplainer;
