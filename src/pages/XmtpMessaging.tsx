import { useContext, useState } from 'react';
import { XmtpContext } from '../messaging/xmtp/context/XmtpContext';
import TalentLayerContext from '../context/talentLayer';
import { useSigner } from 'wagmi';
import { watchAccount } from '@wagmi/core';
import ConversationList from '../messaging/xmtp/components/ConversationList';
import CardHeader from '../messaging/xmtp/components/CardHeader';
import MessageList from '../messaging/xmtp/components/MessageList';
import useStreamConversations from '../messaging/xmtp/hooks/useStreamConversations';
import useSendMessage from '../messaging/xmtp/hooks/useSendMessage';
import MessageComposer from '../messaging/xmtp/components/MessageComposer';
import { useNavigate, useParams } from 'react-router-dom';
import useUserByAddress from '../hooks/useUserByAddress';
import { ChatMessageStatus, XmtpChatMessage } from '../types';
import { NON_EXISTING_XMTP_USER_ERROR_MESSAGE } from '../messaging/xmtp/hooks/useStreamMessages';
import Steps from '../components/Steps';

function XmtpMessaging() {
  const { user } = useContext(TalentLayerContext);
  const { data: signer } = useSigner({ chainId: import.meta.env.VITE_NETWORK_ID });
  const { providerState, setProviderState } = useContext(XmtpContext);
  const [messageContent, setMessageContent] = useState<string>('');
  const { address: selectedConversationPeerAddress = '' } = useParams();
  const navigate = useNavigate();
  const [sendingPending, setSendingPending] = useState(false);
  const [messageSendingErrorMsg, setMessageSendingErrorMsg] = useState('');

  const { sendMessage } = useSendMessage(
    selectedConversationPeerAddress ? selectedConversationPeerAddress : '',
    user?.id,
  );
  const peerUser = useUserByAddress(selectedConversationPeerAddress);

  watchAccount(() => {
    providerState?.disconnect?.();
    selectedConversationPeerAddress
      ? navigate(`/messaging/${selectedConversationPeerAddress}`)
      : navigate(`/messaging`);
  });

  // Listens to new conversations ? ==> Yes, & sets them in "xmtp context". Stream stops "onDestroy"
  useStreamConversations();

  const handleXmtpConnect = async () => {
    if (providerState && providerState.initClient && signer) {
      await providerState.initClient(signer);
    }
  };

  const sendNewMessage = async () => {
    if (user && user.address && messageContent && providerState && setProviderState) {
      setSendingPending(true);
      const sentMessage: XmtpChatMessage = {
        from: user.address,
        to: selectedConversationPeerAddress,
        messageContent,
        timestamp: new Date(),
        status: ChatMessageStatus.PENDING,
      };
      const cloneState = { ...providerState };
      const allMessages = cloneState.conversationMessages;
      let messages = cloneState.conversationMessages.get(selectedConversationPeerAddress);
      if (messages) {
        // If Last message in error, remove it & try to resend
        if (messageSendingErrorMsg) {
          messages.pop();
          setMessageSendingErrorMsg('');
        }
        messages.push(sentMessage);
        allMessages.set(selectedConversationPeerAddress, messages);
      } else {
        // If no messages, create new ChatMessage array
        allMessages.set(selectedConversationPeerAddress, [sentMessage]);
      }

      try {
        //Send message
        setProviderState({
          ...providerState,
          conversationMessages: allMessages,
        });
        const response = await sendMessage(messageContent);
        // Update message status & timestamp
        sentMessage.status = ChatMessageStatus.SENT;
        sentMessage.timestamp = response.sent;

        messages = allMessages.get(selectedConversationPeerAddress);
        messages?.pop();
        messages?.push(sentMessage);
        setMessageContent('');
      } catch (error) {
        setSendingPending(false);
        setMessageSendingErrorMsg(
          'An error occurred while sending the message. Please try again later.',
        );
        // If message in error, update last message' status to ERROR
        sentMessage.status = ChatMessageStatus.ERROR;
        messages?.pop();
        messages?.push(sentMessage);
        console.error(error);
      } finally {
        if (messages) {
          allMessages.set(selectedConversationPeerAddress, messages);
        }
        setProviderState({
          ...providerState,
          conversationMessages: allMessages,
        });
        setSendingPending(false);
      }
    }
  };

  if (!user) {
    return <Steps targetTitle={'Access messaging'} />;
  }

  return (
    <div className='mx-auto text-gray-900 sm:px-4 lg:px-0'>
      {!providerState?.client && user && (
        <button
          type='submit'
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={() => handleXmtpConnect()}>
          Connect to XMTP
        </button>
      )}
      {providerState?.client && (
        <div className='-mx-6 -mt-6'>
          <CardHeader peerAddress={selectedConversationPeerAddress} />
          <div className='flex flex-row'>
            <div
              style={{ overflowAnchor: 'revert' }}
              className='basis-1/4 h-[calc(100vh-128px)] flex-no-wrap flex-none overflow-y-auto border-r'>
              <ConversationList
                conversationMessages={providerState.conversationMessages}
                selectedConversationPeerAddress={selectedConversationPeerAddress}
                conversationsLoading={providerState.loadingConversations}
              />
            </div>
            {providerState?.client && selectedConversationPeerAddress && user?.id && peerUser?.id && (
              <div className='basis-3/4 w-full pl-5 flex flex-col justify-between h-[calc(100vh-128px)]'>
                <div className='overflow-y-auto'>
                  <MessageList
                    conversationMessages={
                      providerState.conversationMessages.get(selectedConversationPeerAddress) ?? []
                    }
                    selectedConversationPeerAddress={selectedConversationPeerAddress}
                    userId={user?.id}
                    peerUserId={peerUser?.id as string}
                    messagesLoading={providerState.loadingMessages}
                    sendingPending={sendingPending}
                    setMessageSendingErrorMsg={setMessageSendingErrorMsg}
                  />
                </div>
                {(!providerState.loadingMessages || messageSendingErrorMsg) && (
                  <MessageComposer
                    messageContent={messageContent}
                    setMessageContent={setMessageContent}
                    sendNewMessage={sendNewMessage}
                    sendingPending={sendingPending}
                    peerUserExistsOnXMTP={
                      messageSendingErrorMsg !== NON_EXISTING_XMTP_USER_ERROR_MESSAGE
                    }
                    peerUserExistsOnTalentLayer={!!peerUser}
                  />
                )}
              </div>
            )}
          </div>
          {messageSendingErrorMsg && (
            <div className={'text-center'}>
              <p className={'text-red-400 ml-1'}>{messageSendingErrorMsg}</p>
            </div>
          )}
          {selectedConversationPeerAddress && !peerUser && (
            <div className={'text-center'}>
              <p className={'text-red-400 ml-1'}>User is not registered with TalentLayer</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default XmtpMessaging;
