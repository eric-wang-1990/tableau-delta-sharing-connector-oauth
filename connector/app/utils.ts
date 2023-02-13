import { Logger, Connector } from '@tableau/taco-toolkit'
import { Node } from 'react-checkbox-tree'

/*
todo pagination
invalid json resp: unsafe any type
*/
export async function getShareNames (connector: Connector, base_url: string, token: string) {
  const url = `${base_url}shares`
  const headers = {Authentication: `Bearer ${token}`}
  const resp = await connector.get(url, {
    headers: headers,
    bypassCorsPolicy: true,
  })

  return resp.body.items.map((shareObj: any) => shareObj.name)
}

/*
todo pagination
invalid json resp: unsafe any type
*/
export async function getSchemaNames (connector: Connector, base_url: string, token: string, share: string, maxResults=10) {
  const url = `${base_url}shares/${share}/schemas?maxResults=${maxResults}`
  const headers = {Authentication: `Bearer ${token}`}
  const resp = await connector.get(url, {
    headers: headers,
    bypassCorsPolicy: true,
  })

  return resp.body.items.map((schemaObj: any) => schemaObj.name)
}

/*
todo pagination
invalid json resp
*/
export async function getTableNamesBySchema (connector: Connector, base_url: string, token: string, share: string, schema: string, maxResults=10) {
  const url = `${base_url}shares/${share}/schemas/${schema}/tables?maxResults=${maxResults}`
  const headers = {Authentication: `Bearer ${token}`}
  const resp = await connector.get(url, {
    headers: headers,
    bypassCorsPolicy: true,
  })

  return resp.body.items.map((tableObj: any) => tableObj.name)    
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