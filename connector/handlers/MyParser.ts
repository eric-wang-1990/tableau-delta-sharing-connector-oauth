import { DataContainer, DataType, log, ParseOptions, AsyncParser } from '@tableau/taco-toolkit/handlers'

export default class MyParser extends AsyncParser {
  async parse(fetcherResult: any, { dataContainer }: ParseOptions): Promise<DataContainer> {
    const tableName = 'My Sample Data'
    log(`parsing started for '${tableName}'`)

    Promise.resolve(fetcherResult).then((dataTable) => {
      log(dataTable.name)
      containerBuilder.appendTable(dataTable)
    })

    const containerBuilder = AsyncParser.createContainerBuilder(dataContainer)
    return containerBuilder.getDataContainer()
  }
}
