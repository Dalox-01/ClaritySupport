'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestShopifyPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.log(message);
  };

  const testDirectRedirect = () => {
    addLog('🔵 Test 1: Direct redirect to Shopify OAuth URL');
    const authUrl = 'https://hk610k-6m.myshopify.com/admin/oauth/authorize?client_id=e511da3e1fa70629b10f49c23705a980&scope=read_orders%2Cread_customers%2Cread_products%2Cread_inventory&redirect_uri=https%3A%2F%2Fwww.claritysupport.app%2Fapi%2Fshopify%2Fcallback&state=eyJ1c2VySWQiOiI5Mzc0MDQ3NC0yMzMwLTRlMDUtYmI2My1jNzVjZDYyZDJkZTAiLCJ0aW1lc3RhbXAiOjE3NjMzMTk0OTEwMzN9';
    addLog('Executing: window.location.href = authUrl');
    window.location.href = authUrl;
  };

  const testAPICall = async () => {
    addLog('🔵 Test 2: Call /api/shopify/connect POST');
    setLoading(true);

    try {
      addLog('Sending POST request...');
      const res = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ shopDomain: 'hk610k-6m' }),
      });

      addLog(`Response status: ${res.status}`);
      const data = await res.json();
      addLog(`Response data: ${JSON.stringify(data, null, 2)}`);

      if (data.authUrl) {
        addLog(`✅ authUrl received: ${data.authUrl.substring(0, 80)}...`);
        addLog('Executing redirect...');
        window.location.href = data.authUrl;
      } else {
        addLog('❌ No authUrl in response!');
      }
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testWindowOpen = () => {
    addLog('🔵 Test 3: window.open() in new tab');
    const authUrl = 'https://hk610k-6m.myshopify.com/admin/oauth/authorize?client_id=e511da3e1fa70629b10f49c23705a980&scope=read_orders%2Cread_customers%2Cread_products%2Cread_inventory&redirect_uri=https%3A%2F%2Fwww.claritysupport.app%2Fapi%2Fshopify%2Fcallback&state=eyJ1c2VySWQiOiI5Mzc0MDQ3NC0yMzMwLTRlMDUtYmI2My1jNzVjZDYyZDJkZTAiLCJ0aW1lc3RhbXAiOjE3NjMzMTk0OTEwMzN9';
    addLog('Opening in new window...');
    window.open(authUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Test Shopify OAuth</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests de redirection</h2>
          
          <div className="space-y-3">
            <Button 
              onClick={testDirectRedirect}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Test 1: Direct Redirect (window.location.href)
            </Button>

            <Button 
              onClick={testAPICall}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Loading...' : 'Test 2: API Call + Redirect'}
            </Button>

            <Button 
              onClick={testWindowOpen}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Test 3: Open in New Tab
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow p-6 text-green-400 font-mono text-sm">
          <h3 className="text-white font-bold mb-3">Console Logs:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Click a test button to see logs...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-800">
            <li><strong>Test 1</strong> devrait vous rediriger immédiatement vers Shopify</li>
            <li><strong>Test 2</strong> appelle l'API puis redirige si authUrl est reçue</li>
            <li><strong>Test 3</strong> ouvre Shopify dans un nouvel onglet</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
