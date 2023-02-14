# Tableau Databricks Delta Sharing Connector

The connector is built with the Tableau Web Data Connector 3.0 SDK and provides:
- Share/Schema/Table browsing wihtin a share
- Simple bearer token authentication


The design document can be accessed here: 

https://docs.google.com/document/d/1VhgpHaUfNmQ-Q10L3zRjMd3vT5uvj-c7FoCYWzg8k5Y/edit?usp=sharing

## Developer Notes

The WDC lifecycle has two different runtime environments: the browser runtiime (Chrome) and NodeJS, with the `/app` and `/handlers` directories 
managing them respectively. When working with Tableau's WDC SDK, only import `@tableau/taco-toolkit/handlers` in top-level files under `/handlers`.

eg. 

`/handlers/canUseHandlerImports.ts`

`/handlers/utils/cannotUseHandlerImports.ts`

Likewise, `@tableau/taco-toolkit/app` and the `/app` directory will follow the same rules.
