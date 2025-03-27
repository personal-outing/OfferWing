import './env.server';
import { getAppConfig, getDocumentResponse as renderAppToHTML, renderDocumentToResponse as renderAppToResponse } from '@ice/runtime/server';

import * as app from '@/app';
import * as Document from '@/document';
import type { RenderMode } from '@ice/runtime';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';
// @ts-ignore
import assetsManifest from 'virtual:assets-manifest.json';
import routesManifest from './route-manifest.json';

// Do not inject runtime modules when render mode is document only.
const commons = [];
const statics = [];
const createRoutes = () => routesManifest;
const runtimeModules = { commons, statics };

const getRouterBasename = () => {
  const appConfig = getAppConfig(app);
  return appConfig?.router?.basename ?? "/" ?? '';
}


interface RenderOptions {
  documentOnly?: boolean;
  renderMode?: RenderMode;
  basename?: string;
  serverOnlyBasename?: string;
  routePath?: string;
  disableFallback?: boolean;
  publicPath?: string;
  serverData?: any;
  streamOptions?: RenderToPipeableStreamOptions;
}

export async function renderToHTML(requestContext, options: RenderOptions = {}) {
  const mergedOptions = mergeOptions(options);
  return await renderAppToHTML(requestContext, mergedOptions);
}

export async function renderToResponse(requestContext, options: RenderOptions = {}) {
  const mergedOptions = mergeOptions(options);
  return renderAppToResponse(requestContext, mergedOptions);
}

function mergeOptions(options) {
  const { renderMode = 'SSR', basename, publicPath } = options;

  if (publicPath) {
    assetsManifest.publicPath = publicPath;
  }

  return {
    ...options,
    app,
    assetsManifest,
    createRoutes,
    runtimeModules,
    documentDataLoader: Document.dataLoader,
    Document: Document.default,
    basename: basename || getRouterBasename(),
    renderMode,
    };
}
