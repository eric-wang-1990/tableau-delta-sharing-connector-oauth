import { Logger, Connector, AjaxResponse } from '@tableau/taco-toolkit'
import { Node } from 'react-checkbox-tree'

async function getResource(connector: Connector, url: string, token: string) {
  const headers = {Authentication: `Bearer ${token}`}
  let resp = await connector.get(url, {
    headers: headers,
    bypassCorsPolicy: true,
  })

  if (!resp.ok) {
    const { errCode, errMsg } = resp.body
    Logger.info("Err getting resource")
    Logger.info(resp)
    Logger.error(resp)
    throw new Error(`Error Code: ${errCode}, Message: ${errMsg}`);
  }

  return resp
}

/*
invalid json resp: unsafe any type 
*/
export async function getShareNames (connector: Connector, base_url: string, token: string, maxResults=10) {
  let shareNames: string[]
  let url = `${base_url}/shares?maxResults=${maxResults}`
  let resp: AjaxResponse
  resp = await getResource(connector, url, token)
  shareNames = resp.body.items.map((shareObj: any) => shareObj.name)

  // check for additional pagination results
  let nextPageToken = resp.body.nextPageToken
  while (nextPageToken) {
    url = `${base_url}/shares?maxResults=${maxResults}&pageToken=${nextPageToken}`
    resp = await getResource(connector, url, token)

    nextPageToken = resp.body.nextPageToken
    const respShareNames = resp.body.items.map((shareObj: any) => shareObj.name)
    shareNames.push(...respShareNames)
  }

  return shareNames
}

/*
invalid json resp: unsafe any type
*/
export async function getSchemaNames (connector: Connector, base_url: string, token: string, share: string, maxResults=10) {
  let schemaNames: string[]
  let url = `${base_url}/shares/${share}/schemas?maxResults=${maxResults}`
  let resp: AjaxResponse
  resp = await getResource(connector, url, token)
  schemaNames = resp.body.items.map((schemaObj: any) => schemaObj.name)

  // check for addtional pagination results
  let nextPageToken = resp.body.nextPageToken
  while (nextPageToken) {
    url = `${base_url}/shares/${share}/schemas?maxResults=${maxResults}&pageToken=${nextPageToken}`
    resp = await getResource(connector, url, token)

    nextPageToken = resp.body.nextPageToken
    const respSchemaNames = resp.body.items.map((schemaObj: any) => schemaObj.name)
    schemaNames.push(...respSchemaNames)
  }

  return schemaNames
}

/*
invalid json resp
*/
export async function getTableNamesBySchema (connector: Connector, base_url: string, token: string, share: string, schema: string, maxResults=10) {
  let tableNames: string[]
  let url = `${base_url}/shares/${share}/schemas/${schema}/tables?maxResults=${maxResults}`
  let resp: AjaxResponse
  resp = await getResource(connector, url, token)

  tableNames = resp.body.items.map((tableObj: any) => tableObj.name)    

  // check for additional pagination results
  let nextPageToken = resp.body.nextPageToken
  while (nextPageToken) {
    url = `${base_url}/shares/${share}/schemas/${schema}/tables?maxResults=${maxResults}&pageToken=${nextPageToken}`
    resp = await getResource(connector, url, token)

    nextPageToken = resp.body.nextPageToken
    const respTableNames = resp.body.items.map((tableObj: any) => tableObj.name)
    tableNames.push(...respTableNames)
  }

  return tableNames
}

/*
fetching and parsing is done naively in sequence
*/
export async function getDeltaShareStructure (connector: Connector, base_url: string, token: string) {
  let Shares: Node[] = []
  let shareNames: string[]
  shareNames = await getShareNames(connector, base_url, token)

  for (const share of shareNames) {
    let Schemas: Node[] = []
    let schemaNames: string[]
    schemaNames = await getSchemaNames(connector, base_url, token, share)

    for (const schemaName of schemaNames) {
      let tableNames: string[] 
      tableNames = await getTableNamesBySchema(connector, base_url, token, share, schemaName)

      Schemas.push(<Node>{
        label: schemaName,
        value: schemaName,
        children: tableNames.map((tableName: string) => {
          return <Node>{ label: tableName, value: tableName }
        }), 
      })
    }

    Shares.push(<Node>{
      label: share,
      value: share,
      children: Schemas,
    })
  }

  return Shares 
}