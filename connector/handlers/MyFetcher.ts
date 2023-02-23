import { 
  Fetcher,
  FetchOptions,
  FetchUtils,
  ParquetUtils,
  getAuthHeader,
  DataTable,
  log
} from '@tableau/taco-toolkit/handlers'

async function getTableMetadata (
  base_url: string,
  token: string,
  share: string,
  schema: string,
  table: string,
  sqlFilters: string[],
  rowLimit: Number
){
  const url = `${base_url}/shares/${share}/schemas/${schema}/tables/${table}/query`
  const headers = getAuthHeader(token)
  // add filtering properties to request body if they exist
  const body = {
    ...(sqlFilters && { 'predicateHints': sqlFilters }),
    ...(rowLimit && { 'limitHint': rowLimit })
  }
  const resp = await FetchUtils.fetchJson(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  // endpoint gives us binary response; convert to utf8 string and split json objects by newline
  // arr will be 1 size larger since response includes an extra newline at the end
  const rawString = Buffer.from(resp).toString('utf8') 
  const stringArr = rawString.split(new RegExp("\r\n|\r|\n")) 
  
  const protocolObj = JSON.parse(stringArr[0])
  const metadataObj = JSON.parse(stringArr[1])
  const fileDataObjArr = new Array(stringArr.length - 3)
  for (let i = 2; i < stringArr.length - 1; i++) {
    fileDataObjArr[i-2] = JSON.parse(stringArr[i])
  }
    
  return fileDataObjArr
}

/*
gets s3 files in parallel from file metadata arr. TODO replace any type with safer custon JSON object
*/
async function getDataTables(fileDataObjArr: any[], table: string) {
  var dataTablePromises = [] as Promise<DataTable>[]

  // get s3 files 
  for (let i = 0; i < fileDataObjArr.length; i++) {
    const dataObj = fileDataObjArr[i]
    var uri = null 
  
    if (dataObj.metaData) { // metadata
  
    } else if (dataObj.file) { // file
      uri = dataObj.file.url
    } else { // data change
  
    }
  
    // populate arr with promises resolving -> getting the resourceBinary + parsing to dataTable
    // const tableName = `${table} DataTable ${i}`
    const resourceBinaryPromise = FetchUtils.fetchArrayBuffer(uri) // s3 doesn't need auth?
    const dataTablePromise = resourceBinaryPromise.then(
      (resourceBinary) => ParquetUtils.parse(resourceBinary, table)
    )

    dataTablePromises.push(dataTablePromise)
  }
  
  return await Promise.all(dataTablePromises)
}



export default class MyFetcher extends Fetcher {
  async *fetch({ handlerInput, secrets }: FetchOptions) {
    const url = handlerInput.data.url
    const tables = handlerInput.data.tables
    const sqlFilters = handlerInput.data.sqlFilters
    const rowLimit = handlerInput.data.rowLimit

    if (secrets) {
      const bearer_token = secrets.bearer_token as string
      // secrets is guaranteed to "exist" but may still not have bearer token field

      const tableMetaData = await getTableMetadata(url, bearer_token, "delta_sharing", "default", tables[0], sqlFilters, rowLimit)
      const dataTables = await getDataTables(tableMetaData, tables[0])

      for (const datatable of dataTables) {
        yield datatable 
      }

    }
    //yield await FetchUtils.fetchJson(handlerInput.data.url)

  }
}
