import { useState } from 'react';
import axios from 'axios';

export default function TestAPI() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      // Прямой запрос к backend
      const response = await axios.get('http://localhost:8000/');
      setResult(`✅ Success: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}\nCode: ${error.code}\nURL: ${error.config?.url}`);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testRegister = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    try {
      const response = await axios.post('http://localhost:8000/register', {
        email: `test${Date.now()}@example.com`,
        password: 'test123'
      });
      setResult(`✅ Registration Success: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      setResult(`❌ Registration Error: ${error.message}\nResponse: ${JSON.stringify(error.response?.data)}`);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">🔧 API Connection Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testConnection}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Test Backend Connection (GET /)
          </button>

          <button
            onClick={testRegister}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Test Registration (POST /register)
          </button>

          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              <h2 className="font-bold mb-2">Result:</h2>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-bold mb-2">ℹ️ Debug Info:</h3>
            <p className="text-sm">Backend URL: http://localhost:8000</p>
            <p className="text-sm">Running from: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
