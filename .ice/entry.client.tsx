
import '@ice/runtime/polyfills/signal';
import { createElement, Fragment } from 'react';
import { runClientApp, getAppConfig } from '@ice/runtime';
import { commons, statics } from './runtime-modules';
import * as app from '@/app';
import createRoutes from './routes';
import appStore from '@/store';
import type { RunClientAppOptions } from '@ice/runtime';

const getRouterBasename = () => {
  const appConfig = getAppConfig(app);
  return appConfig?.router?.basename ?? "/" ?? '';
}
// Add react fragment for split chunks of app.
// Otherwise chunk of route component will pack @ice/jsx-runtime and depend on framework bundle.
const App = <></>;

let dataLoaderFetcher = (options) => {
  return window.fetch(options.url, options);
}

let dataLoaderDecorator = (dataLoader) => {
  return dataLoader;
}

const renderOptions: RunClientAppOptions = {
  app,
  runtimeModules: {
    commons,
    statics,
  },
  createRoutes,
  basename: getRouterBasename(),
  hydrate: false,
  memoryRouter: false,
  dataLoaderFetcher,
  dataLoaderDecorator,  runtimeOptions: {
  appStore,
  },
};

const defaultRender = (customOptions: Partial<RunClientAppOptions> = {}) => {
  return runClientApp({
    ...renderOptions,
    ...customOptions,
    runtimeOptions: {
      ...(renderOptions.runtimeOptions || {}),
      ...customOptions.runtimeOptions,
    },
  });
};

const renderApp = (appExport: any, customOptions: Partial<RunClientAppOptions>) => {
  if (appExport.runApp) {
    return appExport.runApp(defaultRender, renderOptions);
  } else {
    return defaultRender(customOptions);
  }
};

const render = (customOptions: Partial<RunClientAppOptions> = {}) => {
  return renderApp(app, customOptions);
};

render();

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
