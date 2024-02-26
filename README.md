# Tableau Databricks Delta Sharing Connector

The connector is built with the Tableau Web Data Connector 3.0 SDK and provides:
- Share/Schema/Table browsing wihtin a share
- Simple bearer token authentication


## Runbook

After cloning and installing npm packages, in the top level directory:

To compile/build project  
`taco build`

To produce .taco file (for Tableau Desktop testing)  
`taco pack`

To run .taco file in top level directory (launches Tableau Desktop, runs interactive phase + data gathering phase)  
`taco run Desktop`

To run interactive phase only  
`taco start`


#### Dev Loop to test interactive phase (browser runtime): 
`taco build && taco start`

Debug using terminal logs and console logs in browser (inspect element in chrome)


#### Dev Loop to test on Tableau Desktop (browser + nodejs runtime): 
`taco build && taco pack && taco run Desktop`

Debug using terminal logs and EPS logs. You can find EPS logs under a `Documents/My Tableau Repository/Logs/EPS`, which will have a bunch of folders with different hash strings for names. Sort these by time modified for the latest logs. Inside each of these there will be `Extractor.<hash string>.log`, and a `StaticServer.log` file. The extractor log file corresponds to nodejs runtime logs, and static server browser runtime logs

## Developer Notes
### Two Different Runtimes: two different SDKs
The WDC lifecycle has two different runtime environments: the browser runtime (Chrome) and NodeJS, with the `/app` and `/handlers` directories 
managing them respectively. When working with Tableau's WDC SDK, only import `@tableau/taco-toolkit/handlers` in top-level files under `/handlers`. Likewise, only import `@tableau/taco-toolkit/app` in top-level files under `/app`.

eg. 

`/handlers/canUseHandlerImports.ts`

`/handlers/utils/cannotUseHandlerImports.ts`

Likewise, `@tableau/taco-toolkit/app` and the `/app` directory will follow the same rules.

### Security Barriers
"Node APIs are not available in the connector runtime environment (due to security reasons)". This means standard node imports such as `path` or `worker_threads` cannot be used.


