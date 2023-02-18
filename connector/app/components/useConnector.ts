import { useEffect, useState } from 'react'
import Connector, { HandlerInput, Logger, SecretsType } from '@tableau/taco-toolkit'
import { getDeltaShareStructure } from '../utils'
import { Node } from 'react-checkbox-tree'

type ConnectorState = {
  handlerInputs: HandlerInput[]
  secrets: SecretsType
  errorMessage?: string
  isSubmitting: boolean
  isInitializing: boolean
  hasCreds: boolean

  url: string
  token: string
  deltaShareStructure: Node[] | undefined
}

const useConnector = () => {
  const [connector, setConnector] = useState<Connector | null>(null)
  const [connectorState, setConnectorState] = useState<ConnectorState>({
    handlerInputs: [],
    secrets: {},
    isInitializing: true,
    isSubmitting: false,
    errorMessage: '',
    hasCreds: false,

    url: '',
    token: '',
    deltaShareStructure: undefined,
  })

  const onInitializedSuccess = (_connector: Connector) => {
    Logger.info('Connector initialized.')
    setConnectorState({ ...connectorState, isInitializing: false })
  }

  const onInitializedFailure = (_connector: Connector, error: Error) => {
    Logger.error(`Connector Initialized Error: ${error.message}`)
    setConnectorState({ ...connectorState, errorMessage: error.message, isInitializing: false })
  }

  const submit = () => {
    if (!connector) {
      return
    }

    try {
      connector.handlerInputs = connectorState.handlerInputs
      connector.secrets = connectorState.secrets
      connector.submit()
    } catch (error) {
      setConnectorState({ ...connectorState, errorMessage: error.message, isSubmitting: false })
    }
  }

  const handleSubmit = (tables: string[], sqlFilters: string[], rowLimit: string) => {
    const handlerInputs = connectorState.handlerInputs.map((handlerInput) => {
      handlerInput.data["tables"] = tables
      handlerInput.data["sqlFilters"] = sqlFilters.length > 0 ? sqlFilters : null
      handlerInput.data["rowLimit"] = rowLimit ? parseInt(rowLimit) : null
      return handlerInput
    })
    setConnectorState({ ...connectorState, isSubmitting: true, handlerInputs: handlerInputs })
  }

  const handleCreds = (url: string, token: string) => {
    const handlerInputs = [
      {
        fetcher: 'MyFetcher',
        parser: 'MyParser',
        data: {
          url: url,
        },
      },
    ]
    const secrets = {
      bearer_token: token
    }
    setConnectorState({ 
      ...connectorState,
      hasCreds: true,
      handlerInputs,
      secrets,
      url,
      token,
    })
  }

  useEffect(() => {
    if (connectorState.isSubmitting) {
      submit()
    }
  }, [connectorState.isSubmitting])

  useEffect(() => {
    Logger.info("recieved Creds")
    if (!connector) {
      return
    }

    try {
      getDeltaShareStructure(connector, connectorState.url, connectorState.token).then((arr) => {
        setConnectorState({ ...connectorState, deltaShareStructure: arr})
      })

    } catch (error) {
      setConnectorState({ ...connectorState, errorMessage: error.message, isSubmitting: false }) 
    }

  }, [connectorState.hasCreds]) // on recieved creds

  useEffect(() => {
    const connector = new Connector(onInitializedSuccess, onInitializedFailure)
    setConnector(connector)
  }, [])

  return {
    ...connectorState,
    handleCreds,
    handleSubmit,
  }
}

export default useConnector
