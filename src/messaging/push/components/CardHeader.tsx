import { ConversationDisplayType } from '../../../types';
import useConversationListener from '../hooks/useConversationListener';

interface ICardHeaderProps {
  peerAddress: string;
  handleDisplayChange: (conversationDisplayType: ConversationDisplayType) => void;
}
const CardHeader = ({ peerAddress, handleDisplayChange }: ICardHeaderProps) => {
  useConversationListener();

  return (
    <div className='flex flex-row'>
      <div className='basis-1/4'>
        <div className='flex flex-row'>
          <div
            onClick={() => handleDisplayChange(ConversationDisplayType.CONVERSATION)}
            className='basis-1/2 text-ellipsis flex py-4 px-2 justify-center items-center border-b-2 border-t-2 border-r-2 cursor-pointer'>
            <p className='text-xl font-medium tracking-wider max-w-lg text-center'>Conversations</p>
          </div>
          <div
            onClick={() => handleDisplayChange(ConversationDisplayType.REQUEST)}
            className='basis-1/2 text-ellipsis flex py-4 px-2 justify-center items-center border-b-2 border-t-2 border-r-2 cursor-pointer'>
            <p className='text-xl font-medium tracking-wider max-w-lg text-center'>Requests</p>
          </div>
        </div>
      </div>

      <div className='basis-3/4 flex justify-start py-4 px-2 items-start border-b-2 border-t-2'>
        {peerAddress && (
          <p>
            To:
            <span className='border-2 ml-2 pl-2 pr-2 border-gray-200 rounded-3xl text-xs'>
              {peerAddress}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default CardHeader;
