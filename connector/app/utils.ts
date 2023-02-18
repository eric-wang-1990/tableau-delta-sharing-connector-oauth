import { Logger, Connector } from '@tableau/taco-toolkit'
import { Node } from 'react-checkbox-tree'

/*
invalid json resp: unsafe any type
*/
export async function getShareNames (connector: Connector, base_url: string, token: string, maxResults=10) {
  var shareNames: string[]
  var url = `${base_url}shares?maxResults=${maxResults}`
  const headers = {Authentication: `Bearer ${token}`}
  var resp = await connector.get(url, {
    headers: headers,
    bypassCorsPolicy: true,
  })

  shareNames = resp.body.items.map((shareObj: any) => shareObj.name)

  // check for additional pagination results
  var nextPageToken = resp.body.nextPageToken
  while (nextPageToken) {
    url = `${base_url}shares?maxResults=${maxResults}&pageToken=${nextPageToken}`
    resp = await connector.get(url, {
      headers: headers,
      bypassCorsPolicy: true,
    })

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
  var schemaNames: string[]
  var url = `${base_url}shares/${share}/schemas?maxResults=${maxResults}`
  const headers = {Authentication: `Bearer ${token}`}
  var resp = await connector.get(url, {
    headers: headers,
    bypassCorsPolicy: true,
  })

  schemaNames = resp.body.items.map((schemaObj: any) => schemaObj.name)

  // check for addtional pagination results
  var nextPageToken = resp.body.nextPageToken
  while (nextPageToken) {
    url = `${base_url}shares/${share}/schemas?maxResults=${maxResults}&pageToken=${nextPageToken}`
    resp = await connector.get(url, {
      headers: headers,
      bypassCorsPolicy: true,
    })

    nextPageToken = resp.body.nextPageToken
    const respSchemaNames = resp.body.items.map((schemaObj: any) => schemaObj.name)
    schemaNames.push(...respSchemaNames)
  }

  return schemaNames
}

/*
todo pagination
invalid json resp
*/
export async function getTableNamesBySchema (connector: Connector, base_url: string, token: string, share: string, schema: string, maxResults=10) {
  var tableNames: string[]
  var url = `${base_url}shares/${share}/schemas/${schema}/tables?maxResults=${maxResults}`
  const headers = {Authentication: `Bearer ${token}`}
  var resp = await connector.get(url, {
    headers: headers,
    bypassCorsPolicy: true,
  })

  tableNames = resp.body.items.map((tableObj: any) => tableObj.name)    

  // check for additional pagination results
  var nextPageToken = resp.body.nextPageToken
  while (nextPageToken) {
    url = `${base_url}shares/${share}/schemas/${schema}/tables?maxResults=${maxResults}&pageToken=${nextPageToken}`
    resp = await connector.get(url, {
      headers: headers,
      bypassCorsPolicy: true,
    })

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
  var Shares: Node[] = []
  const shareNames = await getShareNames(connector, base_url, token)

  for (const share of shareNames) {
    var Schemas: Node[] = []
    const schemaNames = await getSchemaNames(connector, base_url, token, share)

    for (const schemaName of schemaNames) {
      const tableNames = await getTableNamesBySchema(connector, base_url, token, share, schemaName)

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