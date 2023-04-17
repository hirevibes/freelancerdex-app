import { useWeb3Modal } from '@web3modal/react';
import { ethers } from 'ethers';
import { Field, Form, Formik } from 'formik';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProvider, useSigner } from 'wagmi';
import * as Yup from 'yup';
import { config } from '../../config';
import TalentLayerContext from '../../context/talentLayer';
import TalentLayerID from '../../contracts/ABI/TalentLayerID.json';
import { createTalentLayerIdTransactionToast } from '../../utils/toast';
import HelpPopover from '../HelpPopover';
import SubmitButton from './SubmitButton';
import { HandlePrice } from './handle-price';

interface IFormValues {
  handle: string;
}

const initialValues: IFormValues = {
  handle: '',
};

function TalentLayerIdForm() {
  const { open: openConnectModal } = useWeb3Modal();
  const { account } = useContext(TalentLayerContext);
  const { data: signer } = useSigner({ chainId: import.meta.env.VITE_NETWORK_ID });
  const provider = useProvider({ chainId: import.meta.env.VITE_NETWORK_ID });
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    handle: Yup.string()
      .min(2)
      .max(10)
      .when('isConnected', {
        is: account && account.isConnected,
        then: schema => schema.required('handle is required'),
      }),
  });

  const onSubmit = async (
    submittedValues: IFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (account && account.address && account.isConnected && provider && signer) {
      try {
        const contract = new ethers.Contract(
          config.contracts.talentLayerId,
          TalentLayerID.abi,
          signer,
        );

        const handlePrice = await contract.getHandlePrice(submittedValues.handle);
        const tx = await contract.mint(import.meta.env.VITE_PLATFORM_ID, submittedValues.handle, {
          value: handlePrice,
          gasLimit: 500000,
        });
        await createTalentLayerIdTransactionToast(
          {
            pending: 'Minting your Talent Layer Id...',
            success: 'Congrats! Your Talent Layer Id is minted',
            error: 'An error occurred while creating your Talent Layer Id',
          },
          provider,
          tx,
          account.address,
        );

        setSubmitting(false);
        // TODO: add a refresh function on TL context and call it here rather than hard refresh
        navigate(0);
      } catch (error) {
        console.error(error);
      }
    } else {
      openConnectModal();
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
      {({ isSubmitting, values }) => (
        <Form className='grid grid-cols-12 drop-shadow-lg bg-white p-3 rounded-lg w-1/2 max-w-md border-t-2 border-gray-100'>
          <div
            className={
              'border-r-2 border-gray-200 py-2 ' + (values.handle ? 'col-span-6' : 'col-span-8')
            }>
            <Field
              type='text'
              className='text-gray-500 focus:ring-0 outline-none border-0 w-full placeholder:text-xs placeholder:font-normal font-bold text-md'
              placeholder='To create profile or login, Connect Wallet'
              id='handle'
              name='handle'
              required
            />
          </div>

          {values.handle && (
            <div className='col-span-2 flex justify-center items-center'>
              <HandlePrice handle={values.handle} />
            </div>
          )}

          <div className='flex items-center col-span-4'>
            <SubmitButton isSubmitting={isSubmitting} />
            <HelpPopover>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                What is a TalentLayerID?
              </h3>
              <p>
                TalentLayer ID is a work identity that allows ownership and growth of reputation
                across many gig marketplaces. TalentLayer IDs are ERC-721 NFTs that live inside
                crypto wallets; this means that reputation is self-custodied by the wallet owner and
                lives separately from integrated platforms.
              </p>
              <h3 className='font-semibold text-gray-900 dark:text-white'>What is the handle?</h3>
              <p>
                Your TalentLayer ID Handle is a unique string of characters and numbers that you can
                choose when you create your TalentLayer ID. This handle is how others can search for
                your reputation. You can have a maximum of 10 characters in your TalentLayer ID.
              </p>
              <a
                target='_blank'
                href='https://docs.talentlayer.org/basics/elements/what-is-talentlayer-id'
                className='flex items-center font-medium text-blue-600 dark:text-blue-500 dark:hover:text-blue-600 hover:text-blue-700'>
                Read more{' '}
                <svg
                  className='w-4 h-4 ml-1'
                  aria-hidden='true'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                    clipRule='evenodd'></path>
                </svg>
              </a>
            </HelpPopover>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default TalentLayerIdForm;
