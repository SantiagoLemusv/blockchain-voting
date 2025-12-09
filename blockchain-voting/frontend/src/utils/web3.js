import { ethers } from 'ethers';

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

export const getContract = async (address, abi) => {
  const provider = getProvider();
  if (!provider) return null;
  
  const signer = await provider.getSigner();
  return new ethers.Contract(address, abi, signer);
};

export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};