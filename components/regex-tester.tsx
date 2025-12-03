'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RegexTester() {
  const [regex, setRegex] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState('gi');
  const [isValid, setIsValid] = useState(true);
  const [matches, setMatches] = useState<string[]>([]);

  const handleRegexChange = (value: string) => {
    setRegex(value);
    try {
      const re = new RegExp(value, flags);
      setIsValid(true);
      
      if (testString) {
        const found = testString.match(re);
        setMatches(found || []);
      }
    } catch (error) {
      setIsValid(false);
      setMatches([]);
    }
  };

  const handleTestStringChange = (value: string) => {
    setTestString(value);
    if (regex && isValid) {
      try {
        const re = new RegExp(regex, flags);
        const found = value.match(re);
        setMatches(found || []);
      } catch {
        setMatches([]);
      }
    }
  };

  return (
    <Card className="p-6 border-purple-200/50 dark:border-purple-500/20 bg-white/80 dark:bg-[#1a1f3a]/80">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-purple-500" />
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Testeur d'expressions régulières
        </h4>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Expression régulière</Label>
          <div className="flex gap-2">
            <Input
              value={regex}
              onChange={(e) => handleRegexChange(e.target.value)}
              placeholder="Ex: ^[A-Z]{3}-\d{4}$"
              className={cn(
                'font-mono',
                isValid
                  ? 'border-green-300 dark:border-green-500/30'
                  : 'border-red-300 dark:border-red-500/30'
              )}
            />
            <Input
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="Flags"
              className="w-20 font-mono"
            />
          </div>
          {!isValid && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Expression invalide
            </p>
          )}
        </div>

        <div>
          <Label>Texte de test</Label>
          <Textarea
            value={testString}
            onChange={(e) => handleTestStringChange(e.target.value)}
            placeholder="Entrez le texte à tester..."
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        {/* Results */}
        {regex && testString && (
          <div className={cn(
            'p-4 rounded-lg border',
            matches.length > 0
              ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
              : 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30'
          )}>
            <h5 className="font-medium mb-2 flex items-center gap-2">
              {matches.length > 0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-green-900 dark:text-green-300">
                    {matches.length} correspondance(s) trouvée(s)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-900 dark:text-orange-300">
                    Aucune correspondance
                  </span>
                </>
              )}
            </h5>

            {matches.length > 0 && (
              <div className="space-y-1 mt-3">
                {matches.map((match, idx) => (
                  <Badge key={idx} variant="outline" className="font-mono">
                    {match}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Common patterns helper */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
          <h6 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Patterns courants
          </h6>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleRegexChange('[A-Z]{3}-\d{4}')}
              className="text-left p-2 rounded bg-white dark:bg-[#0f1320] hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <code className="text-blue-600 dark:text-blue-400">SKU:</code> [A-Z]{'{'}3{'}'}-\d{'{'}4{'}'}
            </button>
            <button
              onClick={() => handleRegexChange('order_id|commande|#\\d+')}
              className="text-left p-2 rounded bg-white dark:bg-[#0f1320] hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <code className="text-blue-600 dark:text-blue-400">Order ID:</code> order_id|commande|#\d+
            </button>
            <button
              onClick={() => handleRegexChange('\\b(urgent|critique|important)\\b')}
              className="text-left p-2 rounded bg-white dark:bg-[#0f1320] hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <code className="text-blue-600 dark:text-blue-400">Urgence:</code> \b(urgent|critique)\b
            </button>
            <button
              onClick={() => handleRegexChange('\\d{1,3}(,\\d{3})*(\\.\\d{2})?\\s?€')}
              className="text-left p-2 rounded bg-white dark:bg-[#0f1320] hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <code className="text-blue-600 dark:text-blue-400">Montant:</code> \d{'{'}1,3{'}'}(,\d{'{'}3{'}'})*€
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
