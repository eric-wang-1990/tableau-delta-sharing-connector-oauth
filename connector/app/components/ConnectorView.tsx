import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import 'font-awesome/css/font-awesome.min.css';
import React, { useState } from 'react'
import CheckboxTree from 'react-checkbox-tree'
import useConnector from './useConnector'
import { Logger } from '@tableau/taco-toolkit'

const ConnectorView = () => {
  const { 
    isSubmitting,
    errorMessage,
    isInitializing,
    hasCreds,
    deltaShareStructure,

    handleSubmit,
    handleCreds
  } = useConnector()
  const [creds, setCreds] = useState({
    // remove this later
    url: 'https://sharing.delta.io/delta-sharing/',
    bearerToken: 'faaie590d541265bcab1f2de9813274bf233',
  })
  const [sqlFilters, setSqlFilters] = useState([] as string[])
  const [rowLimit, setRowLimit] = useState('')
  const [checked, setChecked] = useState([] as string[])
  const [expanded, setExpanded] = useState([] as string[])

  const credsInputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setCreds({
      url: creds.url,
      bearerToken: creds.bearerToken,
      [name]: value
    })
  }
  const sqlInputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    // TODO add support for multiple SQL filter queries
    setSqlFilters([e.currentTarget.value])
  }
  const rowLimitInputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    // regex test for numbers only
    const re = /^[0-9\b]+$/
    // if not blank, test regex
    if (e.currentTarget.value === '' || re.test(e.currentTarget.value)) {
      setRowLimit(e.currentTarget.value)
    }
  }

  const onSubmit = () => {
    handleSubmit(checked, sqlFilters, rowLimit)
  }
  const onSendCreds = () => {
    handleCreds(creds.url, creds.bearerToken)
  }
  const uniqueSelection = (selected: string[]) => {
    const diff = selected.filter(x => !checked.includes(x))
    setChecked(diff)
  }

  if (isInitializing) {
    return <div className="p-3 text-muted text-center">Initializing...</div>
  }

  if (!hasCreds) {
    return (
      <>
        <p className="error"></p>
        <div className="box m-auto">
          <div className="card">
            <div className="card-header">
              Custom Auth Sample Connector
            </div>

            <form className="card-body">
              <label htmlFor="url" className="form-label">URL</label>
              <input name="url" onChange={credsInputHandler} value={creds.url} className="form-control mb-2" placeholder="URL">
              </input>

              <label htmlFor="bearerToken" className="form-label">Bearer Token</label>
              <input name="bearerToken" onChange={credsInputHandler} value={creds.bearerToken} className="form-control mb-3" placeholder="Bearer Token">
              </input>

              <div className=" text-center">
                <button type="button" className="btn btn-success" onClick={onSendCreds} disabled={isSubmitting}> 
                  { isInitializing ? 'Initializing...' : (isSubmitting ? 'Loading tables...' : 'Get Data') }
                </button>
              </div>
            </form>

          </div>
        </div>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      </>
    )
  }

  return (
    <>
      <div className="box m-auto">
        <div className="card">
          <div className="card-header">
            Filtering
          </div>
          <form className="card-body">
            <label htmlFor="sqlFilter" className="form-label">SQL Filter</label>
            {/* TODO add support for multiple sqlFilters */}
            <input name="sqlFilter" onChange={sqlInputHandler} value={sqlFilters[0]} className="form-control mb-2" placeholder="SQL query eg. date >= '2021-01-01'"/> 

            <label htmlFor="rowFilter" className="form-label">Row Limit</label>
            <input name="rowFilter" onChange={rowLimitInputHandler} value={rowLimit} className="form-control mb-3" placeholder="Row limit eg. 234"/>
          </form>
        </div>

        <div className="card browser-card">
          <div className="card-header">
            Shares/Schemas/Tables
          </div>
          <div className="card-body">
            {
              deltaShareStructure ? 
              <CheckboxTree
                nodes={deltaShareStructure}
                checked={checked}
                expanded={expanded}
                onlyLeafCheckboxes={true}
                onCheck={uniqueSelection}
                onExpand={expanded => setExpanded(expanded)}
                iconsClass="fa5"
                />
              :
              <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            }

          </div>
        </div>

        <div className="text-center">
          <button type="button" className="btn btn-success" onClick={onSubmit} disabled={isSubmitting || checked.length == 0}> 
            Get Table Data
          </button>
        </div>
      </div>
    </>
  )
}

export default ConnectorView
