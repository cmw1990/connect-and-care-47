import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { APP_MODULES } from '@/app.structure';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const findModuleAndFeature = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);
  if (paths.length === 0) return null;

  const module = APP_MODULES.find(m => m.id === paths[0]);
  if (!module) return null;

  let feature = null;
  let subFeature = null;

  if (paths.length > 1) {
    feature = module.features.find(f => f.id === paths[1]);
    if (feature && feature.features && paths.length > 2) {
      subFeature = feature.features.find(sf => sf.id === paths[2]);
    }
  }

  return { module, feature, subFeature };
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathInfo = findModuleAndFeature(location.pathname.substring(1));
  
  if (!pathInfo || !pathInfo.module) return null;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/' },
    { label: pathInfo.module.title, path: pathInfo.module.path }
  ];

  if (pathInfo.feature) {
    breadcrumbs.push({
      label: pathInfo.feature.title,
      path: pathInfo.feature.path
    });
  }

  if (pathInfo.subFeature) {
    breadcrumbs.push({
      label: pathInfo.subFeature.title,
      path: pathInfo.subFeature.path
    });
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4" />
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium text-foreground">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
