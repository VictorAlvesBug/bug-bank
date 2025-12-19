import React, { useState, useCallback, useEffect } from 'react';

interface NFCRecord {
  id: string;
  recordType: string;
  mimeType: string;
  data: string;
}

const NFCReader: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [records, setRecords] = useState<NFCRecord[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('NDEFReader' in window) {
      setIsSupported(true);
    }
  }, []);

  const readNFC = useCallback(async () => {
    if (!('NDEFReader' in window)) {
      setStatus('error');
      alert('Web NFC não suportado. Use Chrome Android 81+');
      return;
    }

    try {
      setStatus('scanning');
      
      const reader = new (window as any).NDEFReader();
      
      reader.onreading = (event: any) => {
        console.log('NFC tag detectada:', event.serialNumber);
        
        const ndefRecords: NFCRecord[] = Array.from(event.message.records).map((record: any) => ({
          id: event.serialNumber || 'unknown',
          recordType: record.recordType || 'empty',
          mimeType: record.mediaType || 'text/plain',
          data: new TextDecoder().decode(new Uint8Array(record.data)),
        }));
        
        setRecords(ndefRecords);
        setStatus('success');
      };

      reader.onerror = (error: any) => {
        console.error('NFC Error:', error);
        setStatus('error');
      };

      // Scan por 30 segundos
      await reader.scan({ signal: AbortSignal.timeout(30000) });
    } catch (error: any) {
      console.error('Scan failed:', error);
      setStatus('error');
    }
  }, []);

  const reset = () => {
    setStatus('idle');
    setRecords([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            {status === 'scanning' && (
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
            )}
            {status === 'success' && <span className="text-4xl">✅</span>}
            {status === 'error' && <span className="text-4xl text-red-500">❌</span>}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Leitor NFC
          </h1>
          <p className="text-gray-600 text-sm">Chrome Android 81+ • HTTPS</p>
        </div>

        {/* Suporte */}
        {!isSupported ? (
          <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-xl text-center mb-6">
            <p className="font-bold text-lg mb-2">🚫 Web NFC não suportado</p>
            <p className="text-sm">Use Chrome Android 81+ com HTTPS</p>
          </div>
        ) : status === 'idle' ? (
          <button
            onClick={readNFC}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
          >
            📱 Iniciar Leitura NFC
          </button>
        ) : status === 'scanning' ? (
          <div className="text-center p-12 bg-indigo-50/50 rounded-2xl animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-2xl font-bold text-indigo-700 mb-2">Escaneando...</p>
            <p className="text-indigo-600">Aproxime a tag NFC agora</p>
          </div>
        ) : status === 'success' && records.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-green-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-xl text-center font-semibold">
              ✅ Tag lida com sucesso!
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 max-h-80 overflow-y-auto space-y-3">
              <h3 className="font-bold text-lg text-gray-800 mb-4 text-center">Dados da Tag:</h3>
              {records.map((record, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-800">Record {index + 1}</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                      {record.recordType}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-600 block mb-1">ID:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                        {record.id.slice(0, 16)}...
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">MIME:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {record.mimeType}
                      </code>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-700 font-medium block mb-2">Dados:</span>
                    <div className="bg-indigo-50 p-3 rounded-lg font-mono text-sm border-l-4 border-indigo-400 min-h-[50px] break-words">
                      {record.data || '[vazio]'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={reset}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              🔄 Ler Nova Tag
            </button>
          </div>
        ) : (
          <div className="bg-red-100 border-2 border-red-400 text-red-800 px-6 py-4 rounded-xl text-center font-semibold">
            ❌ Erro ao ler tag
            <br />
            <span className="text-sm font-normal mt-1 block">Tente aproximar novamente</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFCReader;
