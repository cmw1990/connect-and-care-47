
import { RouteObject } from 'react-router-dom';

export interface RouteMetadata {
  title: string;
  description?: string;
  icon?: string;
  showInNav?: boolean;
  group?: string;
  order?: number;
  beta?: boolean;
}

export interface AppRoute extends RouteObject {
  meta?: RouteMetadata;
  children?: AppRoute[];
}

export interface DiagramRouteData {
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  connections: Array<{
    target: string;
    type: 'navigation' | 'data' | 'import';
  }>;
}
