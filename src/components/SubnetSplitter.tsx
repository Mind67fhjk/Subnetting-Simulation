import { useState, useCallback, memo } from 'react';
import { divideSubnet, SubnetDivision } from '../lib/subnet';

interface SubnetSplitterProps {
  networkAddress: string;
  cidr: number;
}

const SubnetSplitter = memo(function SubnetSplitter({ networkAddress, cidr }: SubnetSplitterProps) {
  const [numSubnets, setNumSubnets] = useState(2);
  const [subnets, setSubnets] = useState<SubnetDivision[]>([]);
  const [hasSplit, setHasSplit] = useState(false);

  const maxSubnets = Math.min(Math.pow(2, 32 - cidr), 64);

  const handleSplit = useCallback(() => {
    const result = divideSubnet(networkAddress, cidr, numSubnets);
    setSubnets(result);
    setHasSplit(true);
  }, [networkAddress, cidr, numSubnets]);

  const neededBits = Math.ceil(Math.log2(numSubnets));
  const newCidr = cidr + neededBits;
  const totalRange = subnets.length > 0 ? subnets[subnets.length - 1].rangeEnd - subnets[0].rangeStart + 1 : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Subnet Splitter</h3>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1.5">Number of subnets</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={maxSubnets}
              value={numSubnets}
              onChange={(e) => {
                setNumSubnets(Number(e.target.value));
                setHasSplit(false);
              }}
              className="flex-1 accent-cyan-500 h-1.5 cursor-pointer"
            />
            <span className="text-lg font-mono font-bold text-cyan-400 w-10 text-right">{numSubnets}</span>
          </div>
        </div>
        <button
          onClick={handleSplit}
          disabled={newCidr > 32}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
        >
          Split
        </button>
      </div>

      {newCidr > 32 && (
        <p className="text-xs text-red-400">Cannot split further: subnet mask would exceed /32</p>
      )}

      {hasSplit && subnets.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Splitting /{cidr} into {subnets.length} x /{newCidr} subnets
          </div>

          {/* Visual bar */}
          <div className="flex h-10 rounded-lg overflow-hidden border border-slate-700 gap-[2px] p-[2px]">
            {subnets.map((sub, i) => {
              const hue = (i * 360) / subnets.length;
              return (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center text-[9px] font-mono font-bold rounded transition-all duration-300"
                  style={{
                    backgroundColor: `hsla(${hue}, 60%, 45%, 0.25)`,
                    color: `hsl(${hue}, 70%, 70%)`,
                    borderLeft: `1px solid hsla(${hue}, 60%, 50%, 0.3)`,
                  }}
                >
                  {sub.network}
                </div>
              );
            })}
          </div>

          {/* Detail table */}
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-800/80">
                  <th className="text-left py-2 px-3 text-slate-400 font-semibold">#</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-semibold">Network</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-semibold">Range</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-semibold">Hosts</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-semibold">Broadcast</th>
                </tr>
              </thead>
              <tbody>
                {subnets.map((sub, i) => {
                  const hue = (i * 360) / subnets.length;
                  return (
                    <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-mono" style={{ color: `hsl(${hue}, 70%, 65%)` }}>
                        {i + 1}
                      </td>
                      <td className="py-2 px-3 font-mono text-white">
                        {sub.network}/{sub.cidr}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">
                        {sub.firstHost} - {sub.lastHost}
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-400 text-right">
                        {sub.usableHosts.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 font-mono text-amber-400">{sub.broadcast}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});

export default SubnetSplitter;
