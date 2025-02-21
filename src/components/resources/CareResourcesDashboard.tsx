import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { careResourcesService, CareGuide, CareResource, LegalResource, CommunityResource } from '@/services/care-resources.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Spinner } from '@/components/ui/Spinner';
import {
  BookOpen,
  Video,
  CheckSquare,
  FileText,
  Tool,
  Users,
  MapPin,
  Calendar,
  Scale,
  Search,
  BookmarkPlus,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react';

interface ResourceFilters {
  category?: string;
  type?: string;
  difficulty?: string;
  location?: string;
  tags?: string[];
}

export const CareResourcesDashboard: React.FC = () => {
  const { t } = useTranslation();
  const user = useUser();
  const [activeTab, setActiveTab] = React.useState('guides');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState<ResourceFilters>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [resources, setResources] = React.useState<{
    guides: CareGuide[];
    resources: CareResource[];
    legal: LegalResource[];
    community: CommunityResource[];
  }>({
    guides: [],
    resources: [],
    legal: [],
    community: []
  });
  const [progress, setProgress] = React.useState<Record<string, number>>({});
  const [collections, setCollections] = React.useState<any[]>([]);

  // Load initial data
  React.useEffect(() => {
    loadResources();
    if (user) {
      loadUserCollections();
      loadUserProgress();
    }
  }, [user]);

  // Load resources based on active tab and filters
  const loadResources = async () => {
    setIsLoading(true);
    try {
      if (searchQuery) {
        const results = await careResourcesService.searchResources(searchQuery);
        setResources(results);
      } else {
        const [guides, resources, legal, community] = await Promise.all([
          careResourcesService.getGuides(filters),
          careResourcesService.getResources(filters),
          careResourcesService.getLegalResources(filters),
          careResourcesService.getCommunityResources(filters)
        ]);
        setResources({ guides, resources, legal, community });
      }
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCollections = async () => {
    try {
      const collections = await careResourcesService.getUserCollections(user!.id);
      setCollections(collections);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadUserProgress = async () => {
    try {
      // Load progress for all resources in the current view
      const progressPromises = resources[activeTab].map(resource =>
        careResourcesService.getResourceProgress(user!.id, resource.id)
      );
      const progressResults = await Promise.all(progressPromises);
      const progressMap = progressResults.reduce((acc, curr) => {
        if (curr) {
          acc[curr.resource_id] = curr.progress;
        }
        return acc;
      }, {} as Record<string, number>);
      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  // Resource type icons
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'checklist':
        return <CheckSquare className="h-5 w-5" />;
      case 'template':
        return <FileText className="h-5 w-5" />;
      case 'tool':
        return <Tool className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  // Resource card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderResourceCard = (resource: any, type: string) => {
    const resourceProgress = progress[resource.id] || 0;

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.3 }}
      >
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getResourceIcon(resource.type || type)}
              <div>
                <h3 className="font-medium">{resource.title || resource.name}</h3>
                {resource.category && (
                  <Badge variant="outline" className="mt-1">
                    {resource.category}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {/* Handle bookmark */}}
            >
              <BookmarkPlus className="h-5 w-5" />
            </Button>
          </div>

          {resource.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {resource.description}
            </p>
          )}

          {resource.estimatedTime && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {resource.estimatedTime} minutes
            </div>
          )}

          {type === 'community' && resource.location && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              {resource.location}
            </div>
          )}

          {resourceProgress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{resourceProgress}%</span>
              </div>
              <Progress value={resourceProgress} className="h-2" />
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              {resource.tags?.slice(0, 2).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {resource.tags?.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{resource.tags.length - 2}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => {/* Handle view resource */}}
            >
              View
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('resources.title')}
        </h2>
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-40"
          >
            <option value="">All Categories</option>
            <option value="eldercare">Eldercare</option>
            <option value="childcare">Childcare</option>
            <option value="healthcare">Healthcare</option>
            <option value="disability">Disability</option>
            <option value="mental-health">Mental Health</option>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Legal
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Community
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <TabsContent value="guides" className="space-y-4">
                {resources.guides.map(guide => renderResourceCard(guide, 'guide'))}
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                {resources.resources.map(resource => renderResourceCard(resource, 'resource'))}
              </TabsContent>

              <TabsContent value="legal" className="space-y-4">
                {resources.legal.map(resource => renderResourceCard(resource, 'legal'))}
              </TabsContent>

              <TabsContent value="community" className="space-y-4">
                {resources.community.map(resource => renderResourceCard(resource, 'community'))}
              </TabsContent>
            </>
          )}
        </AnimatePresence>
      </Tabs>

      {user && collections.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Your Collections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(collection => (
              <Card key={collection.id} className="p-4">
                <h4 className="font-medium">{collection.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {collection.resource_ids.length} items
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {/* Handle view collection */}}
                >
                  View Collection
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
