import { memo } from 'react';

interface BinaryVisualizerProps {
  binaryIp: string;
  binaryMask: string;
  binaryNetwork: string;
  cidr: number;
}

const BinaryVisualizer = memo(function BinaryVisualizer({
  binaryIp,
  binaryMask,
  binaryNetwork,
  cidr,
}: BinaryVisualizerProps) {
  const ipBits = binaryIp.replace(/\./g, '');
  const maskBits = binaryMask.replace(/\./g, '');
  const networkBits = binaryNetwork.replace(/\./g, '');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Binary Representation</h3>
      <div className="space-y-2">
        {[
          { label: 'IP Address', bits: ipBits, color: 'text-emerald-400' },
          { label: 'Subnet Mask', bits: maskBits, color: 'text-amber-400' },
          { label: 'Network', bits: networkBits, color: 'text-cyan-400' },
        ].map(({ label, bits, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 w-24 text-right shrink-0">{label}</span>
            <div className="flex gap-[2px] font-mono text-[11px] leading-none">
              {bits.split('').map((bit, i) => {
                const isNetwork = i < cidr;
                const isHost = i >= cidr;
                const dotSep = i > 0 && i % 8 === 0;

                return (
                  <span key={i} className="relative">
                    {dotSep && <span className="text-slate-600 mx-[1px]">.</span>}
                    <span
                      className={`inline-block w-[10px] text-center rounded-sm px-[1px] py-1 transition-colors duration-150 ${
                        label === 'IP Address'
                          ? isNetwork
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-emerald-500/8 text-emerald-400/60'
                          : label === 'Subnet Mask'
                          ? isNetwork
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-amber-500/8 text-amber-400/60'
                          : isNetwork
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'bg-cyan-500/8 text-cyan-400/60'
                      }`}
                    >
                      {bit}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3">
          <span className="w-24 shrink-0" />
          <div className="flex font-mono text-[11px] relative">
            <div
              className="h-5 border-t-2 border-dashed border-emerald-500/30 mr-[2px]"
              style={{ width: `${cidr * 12 + Math.floor(cidr / 8) * 4}px` }}
            />
            <div className="relative -top-4 flex justify-center text-[10px] text-slate-500">
              <span className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-500 font-semibold">
                /{cidr} Network
              </span>
            </div>
            <div
              className="h-5 border-t-2 border-dashed border-slate-600/30"
              style={{ width: `${(32 - cidr) * 12 + Math.floor((32 - cidr - 1) / 8) * 4}px` }}
            />
            <div className="relative -top-4 flex justify-center text-[10px] text-slate-500">
              <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-semibold">
                {32 - cidr} Host
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BinaryVisualizer;
