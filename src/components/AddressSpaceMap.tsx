import { memo } from 'react';
import { longToIp } from '../lib/subnet';

interface AddressSpaceMapProps {
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
}

const AddressSpaceMap = memo(function AddressSpaceMap({
  cidr,
  networkAddress,
  broadcastAddress,
  firstHost,
  lastHost,
}: AddressSpaceMapProps) {
  if (cidr >= 31) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Address Space</h3>
        <div className="relative h-12 rounded-lg bg-slate-800/50 border border-slate-700 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-cyan-400">
            {networkAddress}/{cidr} (point-to-point)
          </div>
        </div>
      </div>
    );
  }

  const segments = [
    { label: 'Network', value: networkAddress, color: 'bg-red-500/30 border-red-500/50', text: 'text-red-400', width: '8%' },
    { label: 'First Host', value: firstHost, color: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400', width: '15%' },
    { label: 'Usable Range', value: '', color: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400', width: '54%' },
    { label: 'Last Host', value: lastHost, color: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400', width: '15%' },
    { label: 'Broadcast', value: broadcastAddress, color: 'bg-amber-500/30 border-amber-500/50', text: 'text-amber-400', width: '8%' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Address Space Map</h3>
      <div className="relative">
        <div className="flex h-14 rounded-lg overflow-hidden border border-slate-700">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={`${seg.color} border-r border-slate-700/50 flex flex-col items-center justify-center px-1 transition-all duration-300`}
              style={{ width: seg.width }}
            >
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">{seg.label}</span>
              <span className={`text-[10px] font-mono ${seg.text} leading-tight mt-0.5 truncate max-w-full`}>
                {seg.value || '...'}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-[9px] font-mono text-slate-600">
          <span>{networkAddress}</span>
          <span>{broadcastAddress}</span>
        </div>
      </div>
    </div>
  );
});

export default AddressSpaceMap;
