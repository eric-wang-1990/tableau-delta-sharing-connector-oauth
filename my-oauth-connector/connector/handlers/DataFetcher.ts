import { Fetcher, FetchUtils, FetchOptions, DataRow, getOAuthHeader } from '@tableau/taco-toolkit/handlers'

interface User {
  id: string
  name: string
  address: { street: string; state: string; country: string }
}

export default class DataFetcher extends Fetcher {
  async *fetch({ secrets }: FetchOptions) {
    // PLACEHOLDER: the url is NOT real endpoint.
    // Replace them with actual endpoint for corresponding file type.
    // Note: the permission setting in connector.json also needs to be updated accordingly.
    const url = 'https://www.example.com/api/user'
    const headers = getOAuthHeader(secrets)
    const users = await FetchUtils.fetchJson(url, { headers })

    // Convert JSON response into DataRow[] type
    const rows: DataRow[] = users.map((user: User) => {
      const {
        id,
        name,
        address: { street, state, country },
      } = user
      return { id, name, street, state, country }
    })

    yield await FetchUtils.ingestDataRows(rows)
  }
}
