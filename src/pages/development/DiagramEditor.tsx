
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllRoutes, AppRoute } from '@/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight,
  Plus,
  Minus,
  Move,
  Link as LinkIcon,
  Save,
  FileJson,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';

interface DiagramNode {
  id: string;
  type: 'page' | 'component';
  title: string;
  path?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: string[];
  meta?: Record<string, any>;
}

interface DiagramConnection {
  source: string;
  target: string;
  type: 'navigation' | 'data' | 'import';
}

export function DiagramEditor() {
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [connections, setConnections] = useState<DiagramConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startConnection, setStartConnection] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize diagram with existing routes
    const routes = getAllRoutes();
    const newNodes: DiagramNode[] = routes.map((route, index) => ({
      id: route.path || `node-${index}`,
      type: 'page',
      title: route.meta?.title || route.path || `Page ${index}`,
      path: route.path,
      x: 100 + (index % 3) * 300,
      y: 100 + Math.floor(index / 3) * 200,
      width: 200,
      height: 120,
      connections: [],
      meta: route.meta
    }));

    setNodes(newNodes);

    // Initialize connections based on route hierarchy
    const newConnections: DiagramConnection[] = [];
    routes.forEach(route => {
      if (route.children) {
        route.children.forEach(child => {
          if (route.path && child.path) {
            newConnections.push({
              source: route.path,
              target: child.path,
              type: 'navigation'
            });
          }
        });
      }
    });

    setConnections(newConnections);
  }, []);

  const handleNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    if (!isDragging) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    setNodes(nodes.map(n => 
      n.id === nodeId 
        ? { ...n, x, y }
        : n
    ));
  };

  const handleConnectionStart = (nodeId: string) => {
    setStartConnection(nodeId);
  };

  const handleConnectionEnd = (nodeId: string) => {
    if (startConnection && startConnection !== nodeId) {
      setConnections([
        ...connections,
        { source: startConnection, target: nodeId, type: 'navigation' }
      ]);

      // Update route configuration
      toast({
        title: "Connection Created",
        description: "Route connection has been updated.",
      });
    }
    setStartConnection(null);
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node?.path) {
      navigate(node.path);
    }
  };

  const exportDiagram = () => {
    const data = {
      nodes,
      connections,
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-diagram.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <div className="flex h-full">
        {/* Toolbar */}
        <div className="w-64 bg-white dark:bg-gray-800 p-4 border-r">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Diagram Tools</h2>
            
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
              >
                <Plus className="w-4 h-4 mr-2" />
                Zoom In
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
              >
                <Minus className="w-4 h-4 mr-2" />
                Zoom Out
              </Button>
            </div>

            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={exportDiagram}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Diagram
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-auto"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {nodes.map(node => (
            <motion.div
              key={node.id}
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                cursor: isDragging ? 'move' : 'pointer'
              }}
              drag
              dragMomentum={false}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              onMouseUp={() => handleConnectionEnd(node.id)}
            >
              <Card className={`h-full ${selectedNode === node.id ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">{node.title}</CardTitle>
                  {node.path && (
                    <CardDescription className="text-xs">{node.path}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnectionStart(node.id)}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNodeSelect(node.id)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none">
            {connections.map((conn, i) => {
              const source = nodes.find(n => n.id === conn.source);
              const target = nodes.find(n => n.id === conn.target);
              if (!source || !target) return null;

              const sourceX = source.x + source.width / 2;
              const sourceY = source.y + source.height / 2;
              const targetX = target.x + target.width / 2;
              const targetY = target.y + target.height / 2;

              return (
                <g key={`${conn.source}-${conn.target}-${i}`}>
                  <path
                    d={`M ${sourceX} ${sourceY} L ${targetX} ${targetY}`}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="text-gray-400"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-64 bg-white dark:bg-gray-800 p-4 border-l">
            <h2 className="text-lg font-semibold mb-4">Properties</h2>
            <div className="space-y-4">
              {/* Node properties form */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
