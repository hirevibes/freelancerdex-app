import { useContext } from 'react';
import TalentLayerContext from '../../context/talentLayer';
import TalentLayerIdForm from '../Form/TalentLayerIdForm';
import GradientText from '../Shared/GradientText';

function CreateId() {
  const { user } = useContext(TalentLayerContext);

  if (user) {
    return null;
  }

  return (
    <>
      <div className='bg-white'>
        <div className='max-w-7xl mx-auto text-gray-900 sm:px-4 lg:px-0 py-20'>
          <div className='flex flex-col items-center justify-center'>
            <h1 className='text-3.5xl font-bold tracking-wider max-w-xl text-center'>
              Join the <GradientText text='Future of Freelancing.' />
            </h1>
            <p className='text-gray-500 text-center max-w-md mt-2 mb-8'>
              Create your decentralized identity with a Soulbound NFT and unlock a world of
              opportunities in the gig economy.
            </p>
            <TalentLayerIdForm />
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateId;
