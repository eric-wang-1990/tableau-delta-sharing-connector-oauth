import { 
  Fetcher,
  FetchOptions,
  FetchUtils,
  ParquetUtils,
  getAuthHeader,
  DataTable,
  log
} from '@tableau/taco-toolkit/handlers'
import { Table } from '../app/utils'

async function getTableMetadata (
  base_url: string,
  token: string,
  share: string,
  schema: string,
  table: string,
  sqlFilters: string[],
  rowLimit: Number
): Promise<any[]> {
  const url = `${base_url}/shares/${share}/schemas/${schema}/tables/${table}/query`
  const headers = getAuthHeader(token)
  // add filtering properties to request body if they exist
  const body = {
    ...(sqlFilters && { 'predicateHints': sqlFilters }),
    ...(rowLimit && { 'limitHint': rowLimit })
  }
  const resp = await FetchUtils.fetchArrayBuffer(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  // resp not guaranteed to be json obj
  // convert binary response to utf8 string and split json objects by newline
  // arr length will be 1 larger since response includes an extra newline at the end
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
function getDataTableUrl(fileDataObjArr: any[]): String {
   log("fileDataObjArr: " + fileDataObjArr)
   const dataTableUrls: String[] = [];

  // get s3 files 
  for (let i = 0; i < fileDataObjArr.length; i++) {
    const dataObj = fileDataObjArr[i]
    var uri = null 
  
    if (dataObj.metaData) { // metadata
  
    } else if (dataObj.file) { // file
      dataTableUrls.push(dataObj.file.url);
    } else { // data change
  
    }
  }

  log("dataTableUrls: " + dataTableUrls)
  if(dataTableUrls.length === 0) throw new Error('No data table urls found.')
  if(dataTableUrls.length > 1) throw new Error('More than one data table url found. Only using first url.')
  return dataTableUrls[0]
}

export default class MyFetcher extends Fetcher {
  async *fetch({ handlerInput, secrets }: FetchOptions) {
    const endpoint = handlerInput.data.endpoint
    const tables: Table[] = handlerInput.data.tables
    const sqlFilters = handlerInput.data.sqlFilters
    const rowLimit = handlerInput.data.rowLimit

    if (secrets) {
      const bearer_token = secrets.bearer_token as string
      // secrets is guaranteed to "exist" but may still not have bearer token field

      const tableMetaData = await getTableMetadata(endpoint, bearer_token, tables[0].share, tables[0].schema, tables[0].name, sqlFilters, rowLimit)
      const dataTable = getDataTableUrl(tableMetaData)
      yield await FetchUtils.loadParquetData(dataTable)

    }
  }
}
