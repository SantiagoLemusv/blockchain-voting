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

export const ensureNetwork = async (expected = "sepolia") => {
  if (!window.ethereum) return;
  const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
  const current = parseInt(chainIdHex, 16);
  const sepolia = 11155111;
  if (expected === "sepolia" && current !== sepolia) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // sepolia
      });
    } catch (e) {
      console.warn("No se pudo cambiar de red:", e);
    }
  }
};
