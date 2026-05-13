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

/**
 * Devuelve la URL del explorer de bloques para una dirección
 * según la red configurada. Para localhost no hay explorer público.
 */
export const getExplorerUrl = (address, network = "sepolia") => {
  if (!address) return null;
  if (network === "sepolia") return `https://sepolia.etherscan.io/address/${address}`;
  if (network === "mainnet") return `https://etherscan.io/address/${address}`;
  return null; // localhost u otras redes sin explorer
};

export const ensureNetwork = async (expected = "sepolia") => {
  if (!window.ethereum) return;
  const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
  const current = parseInt(chainIdHex, 16);

  if (expected === "sepolia" && current !== 11155111) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (e) {
      console.warn("No se pudo cambiar de red:", e);
    }
  }

  if (expected === "localhost" && current !== 31337) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }],
      });
    } catch (e) {
      // si no existe, intenta agregarla
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x7a69",
            chainName: "Hardhat Localhost",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["http://127.0.0.1:8545"],
          }],
        });
      } catch (err) {
        console.warn("No se pudo cambiar/agregar localhost:", err);
      }
    }
  }
};
