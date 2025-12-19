// src/types/nfc-react-web.d.ts
declare module 'nfc-react-web' {
  export interface NDEFRecord {
    recordType: string;
    mediaType?: string;
    id?: Uint8Array;
    data: Uint8Array;
  }

  export interface NDEFMessage {
    records: NDEFRecord[];
  }

  export interface NfcProps {
    onRead?: (data: NDEFMessage) => void;
    onError?: (error: Error) => void;
    timeout?: number;
    clearSrcTagIdOnSuccess?: boolean;
    children?: React.ReactNode;
  }

  const Nfc: React.FC<NfcProps>;
  export default Nfc;
}
