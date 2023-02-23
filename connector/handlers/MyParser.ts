import { DataContainer, log, ParseOptions, AsyncParser, DataTable } from '@tableau/taco-toolkit/handlers'

export default class MyParser extends AsyncParser {
  async parse(fetcherResult: DataTable, { dataContainer }: ParseOptions): Promise<DataContainer> {
    log(`parsing started for '${fetcherResult.name}'`)
    const containerBuilder = AsyncParser.createContainerBuilder(dataContainer)
    const { isNew, tableBuilder } = containerBuilder.getTable(fetcherResult.name)
    if (isNew) {
      tableBuilder.addColumnHeaders(fetcherResult.columns)
    }
    tableBuilder.addRows(fetcherResult.rows)

    return containerBuilder.getDataContainer()
  }
}
