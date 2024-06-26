import { Web3WalletTypes } from '@walletconnect/web3wallet'
import { COSMOS_SIGNING_METHODS } from '@/data/COSMOSData'
import { EIP155_SIGNING_METHODS } from '@/data/EIP155Data'
import { EIP5792_METHODS } from '@/data/EIP5792Data'
import { SOLANA_SIGNING_METHODS } from '@/data/SolanaData'
import { POLKADOT_SIGNING_METHODS } from '@/data/PolkadotData'
import { MULTIVERSX_SIGNING_METHODS } from '@/data/MultiversxData'
import { TRON_SIGNING_METHODS } from '@/data/TronData'
import ModalStore from '@/store/ModalStore'
import SettingsStore from '@/store/SettingsStore'
import { web3wallet } from '@/utils/WalletConnectUtil'
import { SignClientTypes } from '@walletconnect/types'
import { useCallback, useEffect } from 'react'
import { NEAR_SIGNING_METHODS } from '@/data/NEARData'
import { approveNearRequest } from '@/utils/NearRequestHandlerUtil'
import { TEZOS_SIGNING_METHODS } from '@/data/TezosData'
import { KADENA_SIGNING_METHODS } from '@/data/KadenaData'
import { formatJsonRpcError } from '@json-rpc-tools/utils'
import { approveEIP5792Request } from '@/utils/EIP5792RequestHandlerUtils'
import EIP155Lib from '@/lib/EIP155Lib'
import { getWallet } from '@/utils/EIP155WalletUtil'

const TAG  = ' | useWalletConnectEventsManager | '

export default function useWalletConnectEventsManager(initialized: boolean) {
  /******************************************************************************
   * 1. Open session proposal modal for confirmation / rejection
   *****************************************************************************/
  const onSessionProposal = useCallback(
      (proposal: SignClientTypes.EventArguments['session_proposal']) => {
        let tag = TAG + ' | onSessionProposal | '
        console.log(tag, 'session_proposal', proposal)
        try {
          // set the verify context so it can be displayed in the projectInfoCard
          try{
            SettingsStore.setCurrentRequestVerifyContext(proposal.verifyContext)
          }catch(e){
           console.error(tag,e)
          }
          ModalStore.open('SessionProposalModal', { proposal })
        } catch (error) {
          console.error(TAG, 'Error handling session proposal', error)
        }
      },
      []
  )

  /******************************************************************************
   * 2. Open Auth modal for confirmation / rejection
   *****************************************************************************/
  const onAuthRequest = useCallback((request: Web3WalletTypes.AuthRequest) => {
    console.log(TAG, 'auth_request', request)
    try {
      ModalStore.open('AuthRequestModal', { request })
    } catch (error) {
      console.error(TAG, 'Error handling auth request', error)
    }
  }, [])

  /******************************************************************************
   * 3. Open request handling modal based on method that was used
   *****************************************************************************/
  const onSessionRequest = useCallback(
      async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params, verifyContext, id } = requestEvent
        const { request } = params
        const requestSession = web3wallet.engine.signClient.session.get(topic)

        console.log(TAG, 'session_request', requestEvent)

        try {
          // set the verify context so it can be displayed in the projectInfoCard
          SettingsStore.setCurrentRequestVerifyContext(verifyContext)
          switch (request.method) {
            case EIP155_SIGNING_METHODS.ETH_SIGN:
            case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
              return ModalStore.open('SessionSignModal', { requestEvent, requestSession })

            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
              return ModalStore.open('SessionSignTypedDataModal', { requestEvent, requestSession })

            case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
            case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
              return ModalStore.open('SessionSendTransactionModal', { requestEvent, requestSession })

            case EIP5792_METHODS.WALLET_GET_CAPABILITIES:
            case EIP5792_METHODS.WALLET_GET_CALLS_STATUS:
              return await web3wallet.respondSessionRequest({
                topic,
                response: await approveEIP5792Request(requestEvent)
              })

            case EIP5792_METHODS.WALLET_SHOW_CALLS_STATUS:
              return await web3wallet.respondSessionRequest({
                topic,
                response: formatJsonRpcError(id, "Wallet currently don't show call status.")
              })

            case EIP5792_METHODS.WALLET_SEND_CALLS: {
              const wallet = await getWallet(params)
              if (wallet instanceof EIP155Lib) {
                /**
                 * Not Supporting for batch calls on EOA for now.
                 * if EOA, we can submit call one by one, but need to have a data structure
                 * to return bundle id, for all the calls,
                 */
                return await web3wallet.respondSessionRequest({
                  topic,
                  response: formatJsonRpcError(id, "Wallet currently don't support batch call for EOA")
                })
              }
              return ModalStore.open('SessionSendCallsModal', { requestEvent, requestSession })
            }

            case COSMOS_SIGNING_METHODS.COSMOS_SIGN_DIRECT:
            case COSMOS_SIGNING_METHODS.COSMOS_SIGN_AMINO:
              return ModalStore.open('SessionSignCosmosModal', { requestEvent, requestSession })

            case SOLANA_SIGNING_METHODS.SOLANA_SIGN_MESSAGE:
            case SOLANA_SIGNING_METHODS.SOLANA_SIGN_TRANSACTION:
              return ModalStore.open('SessionSignSolanaModal', { requestEvent, requestSession })

            case POLKADOT_SIGNING_METHODS.POLKADOT_SIGN_MESSAGE:
            case POLKADOT_SIGNING_METHODS.POLKADOT_SIGN_TRANSACTION:
              return ModalStore.open('SessionSignPolkadotModal', { requestEvent, requestSession })

            case NEAR_SIGNING_METHODS.NEAR_SIGN_IN:
            case NEAR_SIGNING_METHODS.NEAR_SIGN_OUT:
            case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTION:
            case NEAR_SIGNING_METHODS.NEAR_SIGN_AND_SEND_TRANSACTION:
            case NEAR_SIGNING_METHODS.NEAR_SIGN_TRANSACTIONS:
            case NEAR_SIGNING_METHODS.NEAR_SIGN_AND_SEND_TRANSACTIONS:
            case NEAR_SIGNING_METHODS.NEAR_VERIFY_OWNER:
            case NEAR_SIGNING_METHODS.NEAR_SIGN_MESSAGE:
              return ModalStore.open('SessionSignNearModal', { requestEvent, requestSession })

            case MULTIVERSX_SIGNING_METHODS.MULTIVERSX_SIGN_MESSAGE:
            case MULTIVERSX_SIGNING_METHODS.MULTIVERSX_SIGN_TRANSACTION:
            case MULTIVERSX_SIGNING_METHODS.MULTIVERSX_SIGN_TRANSACTIONS:
            case MULTIVERSX_SIGNING_METHODS.MULTIVERSX_SIGN_LOGIN_TOKEN:
            case MULTIVERSX_SIGNING_METHODS.MULTIVERSX_SIGN_NATIVE_AUTH_TOKEN:
              return ModalStore.open('SessionSignMultiversxModal', { requestEvent, requestSession })

            case NEAR_SIGNING_METHODS.NEAR_GET_ACCOUNTS:
              return web3wallet.respondSessionRequest({
                topic,
                response: await approveNearRequest(requestEvent)
              })

            case TRON_SIGNING_METHODS.TRON_SIGN_MESSAGE:
            case TRON_SIGNING_METHODS.TRON_SIGN_TRANSACTION:
              return ModalStore.open('SessionSignTronModal', { requestEvent, requestSession })

            case TEZOS_SIGNING_METHODS.TEZOS_GET_ACCOUNTS:
            case TEZOS_SIGNING_METHODS.TEZOS_SEND:
            case TEZOS_SIGNING_METHODS.TEZOS_SIGN:
              return ModalStore.open('SessionSignTezosModal', { requestEvent, requestSession })

            case KADENA_SIGNING_METHODS.KADENA_GET_ACCOUNTS:
            case KADENA_SIGNING_METHODS.KADENA_SIGN:
            case KADENA_SIGNING_METHODS.KADENA_QUICKSIGN:
              return ModalStore.open('SessionSignKadenaModal', { requestEvent, requestSession })

            default:
              return ModalStore.open('SessionUnsupportedMethodModal', { requestEvent, requestSession })
          }
        } catch (error) {
          console.error(TAG, 'Error handling session request', error)
          return web3wallet.respondSessionRequest({
            topic,
            response: formatJsonRpcError(id, 'An error occurred while processing the request.')
          })
        }
      },
      []
  )

  const onSessionAuthenticate = useCallback(
      (authRequest: SignClientTypes.EventArguments['session_authenticate']) => {
        console.log(TAG, 'session_authenticate', authRequest)
        try {
          ModalStore.open('SessionAuthenticateModal', { authRequest })
        } catch (error) {
          console.error(TAG, 'Error handling session authentication', error)
        }
      },
      []
  )

  /******************************************************************************
   * Set up WalletConnect event listeners
   *****************************************************************************/
  useEffect(() => {
    let tag = TAG + ' | onStart | '
    if (initialized && web3wallet) {
      console.log(tag, 'Initializing WalletConnect event listeners')
      try {
        console.log(tag, 'initialized:', initialized)
        console.log(tag, 'web3wallet:', web3wallet)
        //sign
        web3wallet.on('session_proposal', onSessionProposal)
        web3wallet.on('session_request', onSessionRequest)
        // auth
        web3wallet.on('auth_request', onAuthRequest)
        // TODOs
        web3wallet.engine.signClient.events.on('session_ping', data => console.log(tag, 'ping', data))
        web3wallet.on('session_delete', data => {
          console.log(tag, 'session_delete event received', data)
          SettingsStore.setSessions(Object.values(web3wallet.getActiveSessions()))
        })
        web3wallet.on('session_authenticate', onSessionAuthenticate)
        // load sessions on init
        SettingsStore.setSessions(Object.values(web3wallet.getActiveSessions()))
      } catch (error) {
        console.error(tag, 'Error setting up WalletConnect event listeners', error)
      }
    } else {
      console.error(tag, 'ERROR initialized:', initialized)
      console.error(tag, 'web3wallet:', web3wallet)
      console.error(tag, 'Not initializing WalletConnect event listeners')
    }
  }, [initialized, onAuthRequest, onSessionProposal, onSessionRequest])
}
