import Arweave from 'arweave';

// @ts-ignore
export default (window.arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443,
  timeout: 100000
})); 