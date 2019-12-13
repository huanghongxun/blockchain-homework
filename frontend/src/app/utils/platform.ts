import { os } from 'platform';

export function getPlatform(): 'win' | 'mac' | 'linux' | undefined {
  switch (os.family) {
    case 'Windows': return 'win';
    case 'OS X': return 'mac';
    case 'Ubuntu':
    case 'Debian':
    case 'SuSE':
    case 'Fedora':
    case 'Red Hat': return 'linux';
    default: return undefined;
  }
}
