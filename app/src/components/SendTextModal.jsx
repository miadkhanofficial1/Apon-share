import React, { useRef, useEffect, useState } from 'react';
import { X, Send, Clipboard, Check } from 'lucide-react';

export default function SendTextModal({
  isOpen,
  onClose,
  initialText = '',
  recipientCount = 0,
  onSendText
}) {
  const dialogRef = useRef(null);
  const [text, setText] = useState(initialText);
  const [sentToast, setSentToast] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setText(initialText);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, initialText]);

  const handlePasteClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip);
    } catch (e) {
      console.warn('Clipboard read error', e);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendText(text);
    setSentToast(true);
    setTimeout(() => {
      setSentToast(false);
      onClose();
    }, 800);
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      onClose={onClose}
      className="m-auto rounded-3xl bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 p-0 shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm focus:outline-none"
    >
      <div className="p-5 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clipboard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h3 className="text-sm font-bold font-heading">
              Beam Text / Clipboard
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Area */}
        <form onSubmit={handleSend} className="space-y-3">
          <div className="relative">
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type message, URL, or paste clipboard contents..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none font-mono"
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="absolute right-2 bottom-2 px-2 py-1 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              Paste
            </button>
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-apon-navy hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow"
          >
            {sentToast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Text Beamed!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>
                  {recipientCount > 0 ? `Beam to ${recipientCount} Peer(s)` : 'Beam to Nearby Peers'}
                </span>
              </>
            )}
          </button>
        </form>

      </div>
    </dialog>
  );
}
