import type { AppConfig, RouteConfig as DefaultRouteConfig } from '@ice/runtime';
import type { ConfigAuth } from '@ice/plugin-auth/types';
type ExtendsRouteConfig = ConfigAuth;
type PageConfig = DefaultRouteConfig<ExtendsRouteConfig>;
type PageConfigDefinitionContext<DataType = any> = {
  data?: DataType;
};
type PageConfigDefinition = (context: PageConfigDefinitionContext) => PageConfig;

export type {
  AppConfig,
  PageConfig,
  PageConfigDefinition,
};
