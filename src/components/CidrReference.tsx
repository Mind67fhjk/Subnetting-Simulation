import { memo } from 'react';
import { longToIp } from '../lib/subnet';

interface CidrReferenceProps {
  selectedCidr: number;
  onSelectCidr: (cidr: number) => void;
}

const CidrReference = memo(function CidrReference({ selectedCidr, onSelectCidr }: CidrReferenceProps) {
  const rows = Array.from({ length: 33 }, (_, i) => {
    const mask = i === 0 ? 0 : (~0 << (32 - i)) >>> 0;
    const hosts = i >= 31 ? Math.pow(2, 32 - i) : Math.pow(2, 32 - i) - 2;
    return {
      cidr: i,
      mask: longToIp(mask),
      hosts: hosts,
      class: i <= 8 ? 'A' : i <= 16 ? 'B' : i <= 24 ? 'C' : i <= 28 ? 'D' : 'VLSM',
    };
  });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">CIDR Quick Reference</h3>
      <div className="overflow-y-auto max-h-72 rounded-lg border border-slate-700">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0">
            <tr className="bg-slate-800">
              <th className="py-1.5 px-2 text-left text-slate-400 font-semibold">CIDR</th>
              <th className="py-1.5 px-2 text-left text-slate-400 font-semibold">Mask</th>
              <th className="py-1.5 px-2 text-right text-slate-400 font-semibold">Hosts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.cidr}
                onClick={() => onSelectCidr(r.cidr)}
                className={`border-t border-slate-800 cursor-pointer transition-colors ${
                  r.cidr === selectedCidr
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'hover:bg-slate-800/50 text-slate-400'
                }`}
              >
                <td className="py-1 px-2 font-mono font-semibold">/{r.cidr}</td>
                <td className="py-1 px-2 font-mono">{r.mask}</td>
                <td className="py-1 px-2 font-mono text-right">
                  {r.hosts >= 1000000
                    ? `${(r.hosts / 1000000).toFixed(1)}M`
                    : r.hosts >= 1000
                    ? `${(r.hosts / 1000).toFixed(1)}K`
                    : r.hosts.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default CidrReference;
