export interface SubnetInfo {
  ip: string;
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  subnetMask: string;
  wildcardMask: string;
  ipClass: string;
  binaryIp: string;
  binaryMask: string;
  binaryNetwork: string;
}

function ipToLong(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function longToIp(long: number): string {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255,
  ].join('.');
}

function ipToBinary(ip: string): string {
  return ip
    .split('.')
    .map((o) => o.toString(2).padStart(8, '0'))
    .join('.');
}

function maskToBinary(cidr: number): string {
  const ones = '1'.repeat(cidr);
  const zeros = '0'.repeat(32 - cidr);
  const full = (ones + zeros).padStart(32, '0');
  return [full.slice(0, 8), full.slice(8, 16), full.slice(16, 24), full.slice(24, 32)].join('.');
}

function getClass(ip: string): string {
  const first = Number(ip.split('.')[0]);
  if (first >= 1 && first <= 126) return 'A';
  if (first >= 128 && first <= 191) return 'B';
  if (first >= 192 && first <= 223) return 'C';
  if (first >= 224 && first <= 239) return 'D (Multicast)';
  return 'E (Reserved)';
}

export function calculateSubnet(ip: string, cidr: number): SubnetInfo {
  const ipLong = ipToLong(ip);
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ipLong & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

  return {
    ip,
    cidr,
    networkAddress: longToIp(network),
    broadcastAddress: longToIp(broadcast),
    firstHost: longToIp(cidr >= 31 ? network : network + 1),
    lastHost: longToIp(cidr >= 31 ? broadcast : broadcast - 1),
    totalHosts,
    usableHosts,
    subnetMask: longToIp(mask),
    wildcardMask: longToIp(wildcard),
    ipClass: getClass(ip),
    binaryIp: ipToBinary(ip),
    binaryMask: maskToBinary(cidr),
    binaryNetwork: ipToBinary(longToIp(network)),
  };
}

export interface SubnetDivision {
  label: string;
  network: string;
  cidr: number;
  firstHost: string;
  lastHost: string;
  broadcast: string;
  usableHosts: number;
  rangeStart: number;
  rangeEnd: number;
}

export function divideSubnet(networkIp: string, parentCidr: number, subnets: number): SubnetDivision[] {
  const neededBits = Math.ceil(Math.log2(subnets));
  const newCidr = parentCidr + neededBits;
  if (newCidr > 32) return [];

  const baseLong = ipToLong(networkIp);
  const subnetSize = Math.pow(2, 32 - newCidr);
  const actualSubnets = Math.pow(2, neededBits);
  const results: SubnetDivision[] = [];

  for (let i = 0; i < actualSubnets; i++) {
    const start = (baseLong + i * subnetSize) >>> 0;
    const end = (start + subnetSize - 1) >>> 0;
    const mask = newCidr === 0 ? 0 : (~0 << (32 - newCidr)) >>> 0;
    const wildcard = (~mask) >>> 0;
    const broadcast = (start | wildcard) >>> 0;
    const info = calculateSubnet(longToIp(start), newCidr);

    results.push({
      label: `Subnet ${i + 1}`,
      network: longToIp(start),
      cidr: newCidr,
      firstHost: info.firstHost,
      lastHost: info.lastHost,
      broadcast: longToIp(broadcast),
      usableHosts: info.usableHosts,
      rangeStart: start,
      rangeEnd: end,
    });
  }

  return results;
}

export function validateIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p.trim();
  });
}

export { ipToLong, longToIp, ipToBinary, maskToBinary };
