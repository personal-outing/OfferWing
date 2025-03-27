import { dataLoader } from '@ice/runtime';
import * as app from '@/app';
import dataloaderConfig from './dataloader-config'
            import module0 from '@ice/plugin-request/runtime';
                        
const loaders = {
  ...dataloaderConfig,
  __app: app.dataLoader,}

let dataLoaderFetcher = (options) => {
  return window.fetch(options.url, options);
}

let dataLoaderDecorator = (dataLoader) => {
  return dataLoader;
}

// Only init static runtime in data-loader. 
const staticRuntimeModules = [
  module0,
];

dataLoader.init(loaders, {
  fetcher: dataLoaderFetcher,
  decorator: dataLoaderDecorator,
  runtimeModules: staticRuntimeModules,
  appExport: app,
});
