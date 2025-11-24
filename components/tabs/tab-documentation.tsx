'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  File, 
  FileText, 
  Trash2, 
  Eye, 
  RefreshCw,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  filename: string;
  size: number;
  type: string;
  product_mapped: string[];
  indexed_at: string | null;
  status: 'uploading' | 'indexed' | 'error' | 'pending';
  visibility: 'public' | 'internal' | 'restricted';
  top_k: number;
  similarity_threshold: number;
}

export function TabDocumentation({ onChange }: { onChange?: () => void }) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Manuel utilisateur Laptop Pro X1',
      filename: 'laptop-pro-x1-manual.pdf',
      size: 2.5 * 1024 * 1024, // 2.5 MB
      type: 'application/pdf',
      product_mapped: ['laptop-pro-x1'],
      indexed_at: '2024-11-10T10:30:00Z',
      status: 'indexed',
      visibility: 'public',
      top_k: 5,
      similarity_threshold: 0.7,
    },
  ]);

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const newDoc: Document = {
        id: `doc_${Date.now()}_${Math.random()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        filename: file.name,
        size: file.size,
        type: file.type,
        product_mapped: [],
        indexed_at: null,
        status: 'uploading',
        visibility: 'public',
        top_k: 5,
        similarity_threshold: 0.7,
      };

      setDocuments(prev => [...prev, newDoc]);

      // Simulate upload
      setTimeout(() => {
        setDocuments(prev =>
          prev.map(d =>
            d.id === newDoc.id
              ? { ...d, status: 'pending' as const }
              : d
          )
        );
      }, 1500);

      onChange?.();
      toast.success(`Fichier "${file.name}" ajouté`);
    });
  };

  const indexDocument = (docId: string) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === docId
          ? { ...d, status: 'indexed', indexed_at: new Date().toISOString() }
          : d
      )
    );
    toast.success('Document indexé avec succès');
    onChange?.();
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
    }
    toast.success('Document supprimé');
    onChange?.();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Documentation & Base de connaissances
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez vos documents et leur indexation pour l'IA
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-blue-400 dark:border-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Importer (CSV/JSON)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Document List */}
        <div className="col-span-7 space-y-4">
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                : 'border-gray-300 dark:border-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500/40'
            )}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Glissez vos fichiers ici
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ou cliquez pour parcourir (PDF, DOCX, TXT, HTML)
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.html,.md"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(Array.from(e.target.files));
                }
              }}
              className="hidden"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans les documents..."
              className="pl-10 border-blue-200 dark:border-blue-500/30"
            />
          </div>

          {/* Documents Table */}
          <Card className="p-4 border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
            <div className="space-y-2">
              {filteredDocs.map(doc => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-3 rounded-lg border transition-all cursor-pointer',
                    selectedDoc?.id === doc.id
                      ? 'bg-blue-100 dark:bg-blue-500/20 border-blue-400 dark:border-blue-500'
                      : 'bg-gray-50 dark:bg-[#0f1320] border-gray-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40'
                  )}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {doc.filename} • {formatSize(doc.size)}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            doc.status === 'indexed' && 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
                            doc.status === 'pending' && 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
                            doc.status === 'uploading' && 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
                            doc.status === 'error' && 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                          )}
                        >
                          {doc.status === 'indexed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {doc.status === 'uploading' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                          {doc.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {doc.status}
                        </Badge>

                        {doc.product_mapped.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <LinkIcon className="w-3 h-3 mr-1" />
                            {doc.product_mapped.length} produit(s)
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {doc.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            indexDocument(doc.id);
                          }}
                          className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                        className="text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredDocs.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun document trouvé</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Document Details */}
        <div className="col-span-5">
          {selectedDoc ? (
            <Card className="p-6 border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80 sticky top-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Détails du document
              </h4>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="doc-title">Titre</Label>
                  <Input
                    id="doc-title"
                    value={selectedDoc.title}
                    onChange={(e) => {
                      setDocuments(prev =>
                        prev.map(d =>
                          d.id === selectedDoc.id ? { ...d, title: e.target.value } : d
                        )
                      );
                      setSelectedDoc({ ...selectedDoc, title: e.target.value });
                      onChange?.();
                    }}
                    className="border-blue-200 dark:border-blue-500/30"
                  />
                </div>

                <div>
                  <Label>Visibilité</Label>
                  <Select
                    value={selectedDoc.visibility}
                    onValueChange={(value: Document['visibility']) => {
                      setDocuments(prev =>
                        prev.map(d =>
                          d.id === selectedDoc.id ? { ...d, visibility: value } : d
                        )
                      );
                      setSelectedDoc({ ...selectedDoc, visibility: value });
                      onChange?.();
                    }}
                  >
                    <SelectTrigger className="border-blue-200 dark:border-blue-500/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Interne</SelectItem>
                      <SelectItem value="restricted">Restreint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="top-k">Top K résultats</Label>
                  <Input
                    id="top-k"
                    type="number"
                    min="1"
                    max="20"
                    value={selectedDoc.top_k}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setDocuments(prev =>
                        prev.map(d =>
                          d.id === selectedDoc.id ? { ...d, top_k: value } : d
                        )
                      );
                      setSelectedDoc({ ...selectedDoc, top_k: value });
                      onChange?.();
                    }}
                    className="border-blue-200 dark:border-blue-500/30"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nombre de passages à récupérer (1-20)
                  </p>
                </div>

                <div>
                  <Label htmlFor="threshold">Seuil de similarité</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={selectedDoc.similarity_threshold}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setDocuments(prev =>
                        prev.map(d =>
                          d.id === selectedDoc.id ? { ...d, similarity_threshold: value } : d
                        )
                      );
                      setSelectedDoc({ ...selectedDoc, similarity_threshold: value });
                      onChange?.();
                    }}
                    className="border-blue-200 dark:border-blue-500/30"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Seuil de pertinence minimum (0.0-1.0)
                  </p>
                </div>

                {selectedDoc.status === 'indexed' && selectedDoc.indexed_at && (
                  <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-900 dark:text-green-300">
                      ✓ Indexé le {new Date(selectedDoc.indexed_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                )}

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={selectedDoc.status === 'uploading'}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Prévisualiser
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 border-blue-200/50 dark:border-blue-500/20 bg-white/80 dark:bg-[#1a1f3a]/80 text-center">
              <File className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
              <p className="text-gray-600 dark:text-gray-400">
                Sélectionnez un document pour voir ses détails
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
