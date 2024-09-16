import React from 'react'
import useConnector from './useConnector'

const ConnectorView = () => {
  const { isSubmitting, errorMessage, isInitializing, oauthCredentials, handleSubmit } = useConnector()

  const onClick = () => {
    handleSubmit([
      {
        fetcher: 'DataFetcher',
        parser: 'taco:data-file-parser',
        data: {},
        name: 'unique-table-name',
      },
    ])
  }

  if (isInitializing) {
    return <div className="p-3 text-muted text-center">Initializing...</div>
  }

  const accessToken = oauthCredentials?.accessToken
  if (!accessToken) {
    return <div className="alert alert-danger text-center">Not Authenticated!</div>
  }

  // Authenticated
  return (
    <div className="box">
      <div className="alert alert-success">
        <h4 className="alert-heading">Authenticated</h4>

        <label>Access Token</label>
        <p>
          <code>{accessToken}</code>
        </p>
      </div>

      <button className="btn btn-success px-5" onClick={onClick} disabled={isSubmitting}>
        Get Data
      </button>

      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
    </div>
  )
}

export default ConnectorView
