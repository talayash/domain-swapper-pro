import { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, CheckCircle, Share2, Download, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import type { Profile } from '~/types';
import { encodeProfile, decodeProfile, getEncodedSize } from '~/lib/profileSharing';
import { useStore } from '~/store';

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export function ProfileShareModal({ isOpen, onClose, profile }: ProfileShareModalProps) {
  const [encoded, setEncoded] = useState('');
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const addProfile = useStore((state) => state.addProfile);

  useEffect(() => {
    if (isOpen && profile) {
      const enc = encodeProfile(profile);
      setEncoded(enc);
      setCopied(false);
      setImportText('');
      setImportStatus(null);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (encoded && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, encoded, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch(() => {
        // QR too large
      });
    }
  }, [encoded]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(encoded);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = encoded;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImport = () => {
    const trimmed = importText.trim();
    if (!trimmed) {
      setImportStatus({ type: 'error', message: 'Paste an encoded profile string' });
      return;
    }

    const decoded = decodeProfile(trimmed);
    if (!decoded) {
      setImportStatus({ type: 'error', message: 'Invalid profile data. Check the string and try again.' });
      return;
    }

    addProfile(decoded);
    setImportStatus({ type: 'success', message: `Profile "${decoded.name}" imported successfully!` });
    setImportText('');
  };

  const sizeBytes = getEncodedSize(encoded);
  const sizeWarning = sizeBytes > 2000;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg p-5 w-[480px] max-h-[85vh] overflow-y-auto border border-border animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              Share Profile
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn-icon-sm flex items-center justify-center">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </Dialog.Close>
          </div>

          {profile && (
            <div className="space-y-5">
              {/* Export section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Share "{profile.name}"</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Copy this code and share it with teammates. They can paste it below to import the profile.
                </p>

                <div className="relative">
                  <textarea
                    readOnly
                    value={encoded}
                    className="input font-mono text-xs h-20 resize-none"
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 btn btn-secondary px-2 py-1 h-auto text-xs"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {sizeWarning && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    Large profile — QR code may be hard to scan. Use copy/paste instead.
                  </p>
                )}

                {/* QR Code */}
                <div className="flex justify-center mt-4">
                  <div className="bg-white p-2 rounded-lg">
                    <canvas ref={canvasRef} />
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t" />

              {/* Import section */}
              <div>
                <h4 className="text-sm font-medium mb-2">Import a Profile</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Paste an encoded profile string from a teammate to import it.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value);
                      setImportStatus(null);
                    }}
                    placeholder="Paste DSP1:... code here"
                    className="input flex-1 font-mono text-xs"
                  />
                  <button
                    onClick={handleImport}
                    className="btn btn-primary px-3"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Import
                  </button>
                </div>

                {importStatus && (
                  <div
                    className={`flex items-center gap-2 p-2.5 rounded-md mt-2 text-sm ${
                      importStatus.type === 'success'
                        ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {importStatus.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{importStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
