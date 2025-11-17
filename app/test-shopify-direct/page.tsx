"use client";

import { useState } from 'react';

export default function TestShopifyDirect() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const testConnection = async () => {
    setLogs([]);
    setLoading(true);
    addLog("🟢 Début du test de connexion Shopify");

    try {
      addLog("🔵 Envoi de la requête POST à /api/shopify/connect");
      
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain: 'hk610k-6m' }),
      });

      addLog(`🔵 Réponse reçue - Status: ${response.status}`);

      const data = await response.json();
      addLog(`🔵 Data reçue: ${JSON.stringify(data, null, 2)}`);

      if (!response.ok) {
        addLog(`❌ Erreur: ${data.error || data.message}`);
        setLoading(false);
        return;
      }

      if (data.authUrl) {
        addLog(`✅ authUrl reçue: ${data.authUrl}`);
        addLog(`🚀 Redirection dans 2 secondes...`);
        
        setTimeout(() => {
          addLog(`🔵 Exécution de window.location.href`);
          window.location.href = data.authUrl;
        }, 2000);
      } else {
        addLog(`❌ Pas d'authUrl dans la réponse !`);
        setLoading(false);
      }

    } catch (error) {
      addLog(`❌ Erreur: ${error}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Shopify OAuth Direct</h1>
        
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Tester la connexion hk610k-6m'}
        </button>

        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Logs de débogage :</h2>
          <div className="space-y-1 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">Aucun log pour le moment</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-300">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-900/50 border border-blue-500 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Variables d'environnement attendues :</h3>
          <ul className="text-sm space-y-1">
            <li>SHOPIFY_API_KEY: 9ed12bae... (32 caractères)</li>
            <li>SHOPIFY_API_SECRET: shpss_... (38 caractères)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
