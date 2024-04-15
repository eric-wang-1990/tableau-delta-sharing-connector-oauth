import { useEffect, useState } from 'react'
import Connector, { HandlerInput, Logger, SecretsType } from '@tableau/taco-toolkit'
import { getDeltaShareStructure, Table } from '../utils'
import { Node } from 'react-checkbox-tree'

type ConnectorState = {
  handlerInputs: HandlerInput[]
  secrets: SecretsType
  errorMessage?: string
  isSubmitting: boolean
  isInitializing: boolean
  hasCreds: boolean

  endpoint: string
  token: string
  deltaShareStructure: Node[] | undefined
  tableMap: Map<string, Table> | undefined
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

    endpoint: '',
    token: '',
    deltaShareStructure: undefined,
    tableMap: undefined
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
    if (!connectorState.tableMap) {
      Logger.error(`tableMap undefined on submit`)
      return
    }

    const handlerInputs = tables.map((tableName) => {
        return {
        fetcher: 'MyFetcher',
        parser: 'taco:parquet-file-parser',
        name: tableName,
        data: {
            endpoint : connectorState.endpoint, // corresponding endpoint
            tables : tables.map((name: string) => connectorState.tableMap?.get(name)),
            sqlFilters : sqlFilters.length > 0 ? sqlFilters : null,
            rowLimit : rowLimit ? parseInt(rowLimit) : null
        },
      }
  })

    setConnectorState({ ...connectorState, isSubmitting: true, handlerInputs: handlerInputs })
  }

  const handleCreds = (endpoint: string, token: string) => {
    const secrets = {
      bearer_token: token
    }
    setConnectorState({ 
      ...connectorState,
      hasCreds: true,
      secrets,
      endpoint,
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

    getDeltaShareStructure(connector, connectorState.endpoint, connectorState.token).then(([nodeStuct, tableMap]) => {
      setConnectorState({ ...connectorState, deltaShareStructure: nodeStuct, tableMap: tableMap})
    }).catch((error) => {
      Logger.info(error.stack)
      Logger.error(error.stack)
      setConnectorState({ ...connectorState, errorMessage: error.stack, isSubmitting: false, hasCreds: false}) 
    })


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
