'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function SmartMailTestPage() {
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smartmail/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType: 'patient',
          subject: 'Test',
          context: context || 'Dit is een test email',
          tone: 'professional'
        })
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">SmartMail API Test</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Context:</label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Voer context in..."
            rows={3}
          />
        </div>

        <Button onClick={testAPI} disabled={loading}>
          {loading ? 'Testing...' : 'Test API'}
        </Button>

        {result && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}