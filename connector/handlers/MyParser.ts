import { DataContainer, DataTable, log, ParseOptions, AsyncParser } from '@tableau/taco-toolkit/handlers'

export default class MyParser extends AsyncParser {
  async parse(fetcherResult: DataTable, { dataContainer }: ParseOptions): Promise<DataContainer> {
    log(`parsing started for '${fetcherResult.name}'`)
    const containerBuilder = AsyncParser.createContainerBuilder(dataContainer)
    containerBuilder.appendTable(fetcherResult)
    return containerBuilder.getDataContainer()
  }
}
