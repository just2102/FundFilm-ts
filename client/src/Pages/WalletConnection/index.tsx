import { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

import { ethers } from "ethers";
import contractArtifact from "src/FundFilm.json";
import { useCustomDispatch } from "src/Redux/useCustomDispatch";
import { setAccount, setContract, setCurrency, setNetwork, setProvider, setSigner } from "src/Redux/web3slice";
import styles from "src/styles/Header.module.css";
import { networks } from "src/utils/const";

import NetworkModal from "./NetworkModal";

Modal.setAppElement("#root");

const WalletConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [chosenNetwork, setChosenNetwork] = useState<null | string>(null);
  const dispatch = useCustomDispatch();
  const navigate = useNavigate();

  const handleNetworkModalOpen = async () => {
    const currentlySelectedNetwork = await window.ethereum.networkVersion;
    if (currentlySelectedNetwork === "137") {
      setChosenNetwork(networks.polygon);
    }
    if (currentlySelectedNetwork === "11155111") {
      setChosenNetwork(networks.sepolia);
    }
    setNetworkModalOpen(true);
  };

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      if (window.ethereum) {
        if (!chosenNetwork) throw new Error("Network not chosen");

        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = web3Provider.getSigner();
        const account = await signer.getAddress();
        const contract = new ethers.Contract(chosenNetwork, contractArtifact.abi, signer);
        dispatch(setProvider(web3Provider));
        dispatch(setAccount(account));
        dispatch(setSigner(signer));
        dispatch(setContract(contract));
        dispatch(setNetwork(chosenNetwork === networks.polygon ? "POLYGON" : "SEPOLIA"));
        dispatch(setCurrency(chosenNetwork === networks.polygon ? "MATIC" : "ETH"));
        navigate("/campaigns");
      } else throw new Error("Metamask not found");
    } catch (error) {
      console.error(error);
    } finally {
      setIsConnecting(false);
      setNetworkModalOpen(false);
    }
  };

  return (
    <>
      <button
        disabled={isConnecting}
        onClick={handleNetworkModalOpen}
        className={styles.connectButton}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      <NetworkModal
        isOpen={networkModalOpen}
        onRequestClose={() => setNetworkModalOpen(false)}
        chosenNetwork={chosenNetwork}
        setChosenNetwork={setChosenNetwork}
        handleConnectWallet={handleConnectWallet}
      />
    </>
  );
};

export default WalletConnection;