import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { config } from '../config';
import TalentLayerMultipleArbitrableTransaction from '../contracts/ABI/TalentLayerMultipleArbitrableTransaction.json';
import TalentLayerPlatformID from '../contracts/ABI/TalentLayerPlatformID.json';
import { IFees } from '../types';

const useFees = (): IFees => {
  const [fees, setFees] = useState({
    protocolFeeRate: ethers.BigNumber.from('0'),
    originPlatformFeeRate: ethers.BigNumber.from('0'),
    platformFeeRate: ethers.BigNumber.from('0'),
  });
  const { data: signer } = useSigner({ chainId: 5 });

  useEffect(() => {
    const fetchData = async () => {
      if (!signer) return fees;

      const escrowContract = new ethers.Contract(
        config.contracts.talentLayerEscrow,
        TalentLayerMultipleArbitrableTransaction.abi,
        signer,
      );

      const talentLayerPlatformIdContract = new ethers.Contract(
        config.contracts.talentLayerPlatformId,
        TalentLayerPlatformID.abi,
        signer,
      );

      try {
        if (escrowContract && talentLayerPlatformIdContract) {
          const protocolFee = await escrowContract.protocolFee();
          const originPlatformFee = await escrowContract.originPlatformFee();
          const platformData = await talentLayerPlatformIdContract.platforms('1');
          if (!!protocolFee && !!originPlatformFee && !!platformData) {
            setFees({
              protocolFeeRate: ethers.BigNumber.from(protocolFee),
              originPlatformFeeRate: ethers.BigNumber.from(originPlatformFee),
              platformFeeRate: ethers.BigNumber.from(platformData.fee),
            });
          }
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return fees;
};

export default useFees;
