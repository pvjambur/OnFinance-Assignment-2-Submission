import { useState, useEffect } from 'react';
import { FileJson, CheckCircle, XCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { cn } from '@/lib/utils';

interface SchemaProperty {
    type?: string;
    description?: string;
    properties?: Record<string, SchemaProperty>;
    items?: SchemaProperty;
    required?: string[];
    enum?: string[];
    format?: string;
}

interface SchemaNode {
    name: string;
    type: string;
    description?: string;
    required: boolean;
    children?: SchemaNode[];
    enum?: string[];
    format?: string;
}

const SchemaPage = () => {
    const [schema, setSchema] = useState<any>(null);
    const [parsedTree, setParsedTree] = useState<SchemaNode[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
    const [validationStatus, setValidationStatus] = useState<'success' | 'error' | 'idle'>('idle');

    useEffect(() => {
        // Fetch the schema
        fetch('/schema/oracle_state.schema.json')
            .then(res => res.json())
            .then(data => {
                setSchema(data);
                const tree = parseSchema(data);
                setParsedTree(tree);
                setValidationStatus('success');
            })
            .catch(err => {
                console.error('Failed to load schema:', err);
                setValidationStatus('error');
            });
    }, []);

    const parseSchema = (schema: any): SchemaNode[] => {
        if (!schema.properties) return [];

        const requiredFields = new Set(schema.required || []);

        return Object.entries(schema.properties).map(([key, prop]: [string, any]) => {
            const node: SchemaNode = {
                name: key,
                type: prop.type || 'unknown',
                description: prop.description,
                required: requiredFields.has(key),
                format: prop.format,
                enum: prop.enum
            };

            if (prop.type === 'object' && prop.properties) {
                node.children = parseSchemaProperties(prop.properties, prop.required || []);
            } else if (prop.type === 'array' && prop.items) {
                if (prop.items.type === 'object' && prop.items.properties) {
                    node.children = parseSchemaProperties(prop.items.properties, prop.items.required || []);
                }
            }

            return node;
        });
    };

    const parseSchemaProperties = (properties: Record<string, any>, required: string[]): SchemaNode[] => {
        const requiredFields = new Set(required);

        return Object.entries(properties).map(([key, prop]: [string, any]) => {
            const node: SchemaNode = {
                name: key,
                type: prop.type || 'unknown',
                description: prop.description,
                required: requiredFields.has(key),
                format: prop.format,
                enum: prop.enum
            };

            if (prop.type === 'object' && prop.properties) {
                node.children = parseSchemaProperties(prop.properties, prop.required || []);
            } else if (prop.type === 'array' && prop.items) {
                if (prop.items.type === 'object' && prop.items.properties) {
                    node.children = parseSchemaProperties(prop.items.properties, prop.items.required || []);
                }
            }

            return node;
        });
    };

    const toggleNode = (path: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const renderNode = (node: SchemaNode, path: string, depth: number = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(path);
        const indent = depth * 24;

        return (
            <div key={path}>
                <div
                    className={cn(
                        "flex items-start gap-3 p-3 rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer border-l-2",
                        node.required ? "border-l-primary" : "border-l-muted"
                    )}
                    style={{ marginLeft: `${indent}px` }}
                    onClick={() => hasChildren && toggleNode(path)}
                >
                    {hasChildren && (
                        <div className="mt-1">
                            {isExpanded ? (
                                <ChevronDown size={16} className="text-muted" />
                            ) : (
                                <ChevronRight size={16} className="text-muted" />
                            )}
                        </div>
                    )}
                    {!hasChildren && <div className="w-4" />}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-foreground">{node.name}</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-bold uppercase",
                                node.type === 'string' && "bg-blue-500/10 text-blue-500",
                                node.type === 'number' && "bg-green-500/10 text-green-500",
                                node.type === 'integer' && "bg-green-500/10 text-green-500",
                                node.type === 'boolean' && "bg-purple-500/10 text-purple-500",
                                node.type === 'object' && "bg-orange-500/10 text-orange-500",
                                node.type === 'array' && "bg-pink-500/10 text-pink-500"
                            )}>
                                {node.type}
                            </span>
                            {node.format && (
                                <span className="px-2 py-0.5 rounded text-xs bg-lavender/10 text-lavender font-mono">
                                    {node.format}
                                </span>
                            )}
                            {node.required && (
                                <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary font-bold">
                                    REQUIRED
                                </span>
                            )}
                        </div>
                        {node.description && (
                            <p className="text-sm text-muted-deep mt-1">{node.description}</p>
                        )}
                        {node.enum && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                                {node.enum.map(val => (
                                    <span key={val} className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent font-mono">
                                        {val}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-1">
                        {node.children!.map(child => renderNode(child, `${path}.${child.name}`, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <MainLayout>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <FileJson size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Oracle Schema Parser
                        </h1>
                        <p className="text-sm text-muted-deep">
                            Live JSON Schema visualization and validation
                        </p>
                    </div>
                </div>
            </div>

            {/* Validation Status */}
            <div className={cn(
                "p-4 rounded-xl border mb-6 flex items-center gap-3",
                validationStatus === 'success' && "bg-accent/10 border-accent/20",
                validationStatus === 'error' && "bg-primary/10 border-primary/20",
                validationStatus === 'idle' && "bg-muted/10 border-border"
            )}>
                {validationStatus === 'success' && <CheckCircle className="text-accent" size={20} />}
                {validationStatus === 'error' && <XCircle className="text-primary" size={20} />}
                <div>
                    <p className="font-bold text-sm">
                        {validationStatus === 'success' && 'Schema Loaded Successfully'}
                        {validationStatus === 'error' && 'Schema Load Failed'}
                        {validationStatus === 'idle' && 'Loading Schema...'}
                    </p>
                    {schema && (
                        <p className="text-xs text-muted-deep mt-1">
                            {schema.title} - {Object.keys(schema.properties || {}).length} root properties
                        </p>
                    )}
                </div>
            </div>

            {/* Schema Tree */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileJson size={18} className="text-primary" />
                    Schema Structure
                </h2>

                {parsedTree.length > 0 ? (
                    <div className="space-y-1">
                        {parsedTree.map(node => renderNode(node, node.name))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-deep">
                        Loading schema structure...
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default SchemaPage;
