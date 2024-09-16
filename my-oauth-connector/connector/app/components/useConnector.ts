import { useState, useRef } from 'react'
import Connector, { HandlerInput, Logger, OAuthCredentials } from '@tableau/taco-toolkit'

type ConnectorState = {
  oauthCredentials: OAuthCredentials | null
  isSubmitting: boolean
  isInitializing: boolean
  errorMessage?: string
}

const useConnector = () => {
  const [connectorState, setConnectorState] = useState<ConnectorState>({
    isInitializing: true,
    isSubmitting: false,
    oauthCredentials: null,
  })

  const [connector] = useState<Connector>(
    () =>
      new Connector(
        (connector: Connector) => {
          Logger.info('Connector initialized.')

          const oauthCredentials = connector.oAuthCredentials
          setConnectorState({ ...connectorState, oauthCredentials, isInitializing: false })
        },
        (_: Connector, error: Error) => {
          Logger.error(`Connector Initialized Error: ${error.message}`)
          setConnectorState({ ...connectorState, errorMessage: error.message, isInitializing: false })
        }
      )
  )

  const submittingRef = useRef(false)

  const handleSubmit = (handlerInputs: HandlerInput[]) => {
    if (connectorState.isSubmitting || submittingRef.current) {
      console.warn('Connector is submitting...')
      return
    }

    submittingRef.current = true
    setConnectorState({ ...connectorState, isSubmitting: true })

    try {
      connector.handlerInputs = handlerInputs
      connector.submit()
    } catch (error) {
      submittingRef.current = false
      setConnectorState({ ...connectorState, errorMessage: error.message, isSubmitting: false })
    }
  }

  return {
    ...connectorState,
    handleSubmit,
  }
}

export default useConnector
