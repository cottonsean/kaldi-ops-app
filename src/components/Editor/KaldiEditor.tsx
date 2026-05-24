"use client";

import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as prettier from 'prettier/standalone';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettierPluginPostcss from 'prettier/plugins/postcss';

interface Tab {
  id: string;
  name: string;
  content: string;
  language: string;
  handle: FileSystemFileHandle | null;
  isDirty: boolean;
}

const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'java', 'json', 'xml', 'html', 'css', 'markdown', 'python', 'sql', 'yaml'
];

const KaldiEditor = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState('');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  
  // 1. Persistence: Load from LocalStorage
  useEffect(() => {
    const savedTabs = localStorage.getItem('kaldi_edit_tabs');
    const savedActiveId = localStorage.getItem('kaldi_edit_active_id');
    const tourDisabled = localStorage.getItem('kaldi_tour_disabled');
    
    if (savedTabs) {
      try {
        const parsed = JSON.parse(savedTabs);
        setTabs(parsed.map((t: any) => ({ ...t, handle: null })));
        if (savedActiveId) setActiveTabId(savedActiveId);
        else setActiveTabId(parsed[0]?.id);
      } catch (e) {
        console.error("Failed to load saved tabs", e);
      }
    } else {
      const initialId = 'initial';
      setTabs([{ id: initialId, name: 'untitled.txt', content: '// Welcome to Kaldi-Edit.\n// Type some messy code here and try "Pretty Print"!', language: 'javascript', handle: null, isDirty: false }]);
      setActiveTabId(initialId);
    }
    
    if (!tourDisabled) {
      setShowTour(true);
    }
    
    setIsLoaded(true);
  }, []);

  // 2. Persistence: Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      const toSave = tabs.map(({ handle, ...rest }) => rest);
      localStorage.setItem('kaldi_edit_tabs', JSON.stringify(toSave));
      localStorage.setItem('kaldi_edit_active_id', activeTabId);
    }
  }, [tabs, activeTabId, isLoaded]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, content: value, isDirty: true } : t
    ));
  };

  const createNewTab = () => {
    const newId = Math.random().toString(36).substring(7);
    const newTab: Tab = {
      id: newId,
      name: 'untitled.txt',
      content: '',
      language: 'plaintext',
      handle: null,
      isDirty: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleDragStart = (id: string) => setDraggedTabId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedTabId === id) return;
    const draggedIdx = tabs.findIndex(t => t.id === draggedTabId);
    const overIdx = tabs.findIndex(t => t.id === id);
    const newTabs = [...tabs];
    const [dragged] = newTabs.splice(draggedIdx, 1);
    newTabs.splice(overIdx, 0, dragged);
    setTabs(newTabs);
  };

  const formatCode = async () => {
    if (!activeTab) return;
    try {
      const formatted = await prettier.format(activeTab.content, {
        parser: activeTab.language === 'javascript' || activeTab.language === 'typescript' ? 'babel' : 
                activeTab.language === 'json' ? 'json' :
                activeTab.language === 'css' ? 'css' :
                activeTab.language === 'html' ? 'html' : 'babel',
        plugins: [prettierPluginEstree, prettierPluginBabel, prettierPluginHtml, prettierPluginPostcss],
        semi: true,
        singleQuote: true,
      });
      handleEditorChange(formatted);
    } catch (err) { console.error('Format failed', err); }
  };

  const openFile = async () => {
    try {
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker();
      const file = await handle.getFile();
      const content = await file.text();
      const newId = Math.random().toString(36).substring(7);
      const ext = file.name.split('.').pop() || 'plaintext';
      const lang = LANGUAGES.includes(ext) ? ext : 'plaintext';
      
      setTabs([...tabs, { id: newId, name: file.name, content, language: lang, handle, isDirty: false }]);
      setActiveTabId(newId);
    } catch (err) { console.error('File open failed', err); }
  };

  const saveFile = async () => {
    if (!activeTab) return;
    try {
      let handle = activeTab.handle;
      if (!('showSaveFilePicker' in window)) {
        const blob = new Blob([activeTab.content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = activeTab.name;
        a.click();
        return;
      }
      if (!handle) {
        // @ts-ignore
        handle = await window.showSaveFilePicker({ suggestedName: activeTab.name });
      }
      const writable = await (handle as any).createWritable();
      await writable.write(activeTab.content);
      await writable.close();
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, handle, name: handle!.name, isDirty: false } : t));
    } catch (err) { console.error('File save failed', err); }
  };

  const completeTour = (disableFuture: boolean) => {
    setShowTour(false);
    if (disableFuture) {
      localStorage.setItem('kaldi_tour_disabled', 'true');
    }
  };

  const tourSteps = [
    { target: 'file-menu', text: 'Welcome to Kaldi-Edit! Use the File menu to open, save, or create new files.', position: 'top-14 left-20', arrow: 'top-[-8px] left-4 border-b-[#15171c]' },
    { target: 'tab-bar', text: 'Open multiple files! They will appear here as tabs. You can drag to reorder or double-click to rename them.', position: 'top-28 left-1/4', arrow: 'top-[-8px] left-1/2 border-b-[#15171c]' },
    { target: 'pretty-print', text: 'Clean up your code instantly with the Pretty Print button. It works for JSON, JS, HTML, and more.', position: 'bottom-14 left-10', arrow: 'bottom-[-8px] left-10 border-t-[#15171c]' },
    { target: 'lang-select', text: 'Switch between languages like JSON, Java, or XML here to get the right syntax highlighting.', position: 'bottom-14 right-10 text-right', arrow: 'bottom-[-8px] right-10 border-t-[#15171c]' },
    { target: 'install-app', text: 'PRO TIP: Click the "Install" icon in your browser address bar to save Kaldi-Edit to your Dock or Taskbar!', position: 'top-14 right-10 text-right', arrow: 'top-[-8px] right-4 border-b-[#15171c]' }
  ];

  if (!isLoaded || !activeTab) return <div className="h-screen bg-[#0a0a0c]" />;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-[#f8fafc] relative overflow-hidden">
      {/* Tour Overlay */}
      {showTour && (
        <div className="absolute inset-0 z-[100] bg-black/40 pointer-events-none">
          <div className={`absolute p-5 bg-[#15171c] border border-[#38bdf8] rounded-xl shadow-2xl max-w-sm pointer-events-auto transition-all duration-300 ${tourSteps[tourStep].position}`}>
            {/* Arrow/Pointer */}
            <div className={`absolute w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] ${tourSteps[tourStep].arrow}`}></div>
            
            <p className="text-sm mb-4 leading-relaxed">{tourSteps[tourStep].text}</p>
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="dont-show" 
                  className="w-3 h-3 accent-[#38bdf8]" 
                  onChange={(e) => {
                    if (e.target.checked) localStorage.setItem('kaldi_tour_disabled', 'true');
                    else localStorage.removeItem('kaldi_tour_disabled');
                  }}
                />
                <label htmlFor="dont-show" className="text-[10px] text-[#94a3b8]">Don't show again</label>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => completeTour(true)} 
                  className="text-xs text-[#94a3b8] hover:text-white mr-2"
                >
                  Skip
                </button>
                {tourStep > 0 && <button onClick={() => setTourStep(s => s - 1)} className="text-xs text-[#94a3b8] hover:text-white">Back</button>}
                <button 
                  onClick={() => {
                    const disable = (document.getElementById('dont-show') as HTMLInputElement)?.checked;
                    if (tourStep === tourSteps.length - 1) completeTour(disable);
                    else setTourStep(s => s + 1);
                  }} 
                  className="bg-[#38bdf8] text-[#0a0a0c] px-3 py-1 rounded text-xs font-bold hover:bg-white transition-colors"
                >
                  {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2d2f36] bg-[#15171c]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain mix-blend-screen brightness-110" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold bg-gradient-to-r from-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent leading-tight">KALDI-EDIT <span className="text-[8px] text-[#38bdf8] border border-[#38bdf8]/30 px-1 rounded ml-1">v0.1.2</span></span>
            <a href="/" className="text-[9px] text-[#38bdf8] hover:underline uppercase tracking-widest opacity-70">Visit Dashboard</a>
          </div>
          <div className="flex gap-4 text-sm text-[#94a3b8]">
            <div className="group relative" id="file-menu">
              <span className="cursor-pointer hover:text-white transition-colors">File</span>
              <div className="hidden group-hover:block absolute top-full left-0 bg-[#15171c] border border-[#2d2f36] py-2 rounded shadow-xl z-50 min-w-[120px]">
                <div onClick={createNewTab} className="px-4 py-1 hover:bg-[#2d2f36] cursor-pointer">New File</div>
                <div onClick={openFile} className="px-4 py-1 hover:bg-[#2d2f36] cursor-pointer">Open...</div>
                <div onClick={saveFile} className="px-4 py-1 hover:bg-[#2d2f36] cursor-pointer border-b border-[#2d2f36] mb-1">Save</div>
                <div onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-4 py-1 hover:bg-[#2d2f36] cursor-pointer text-red-400 text-xs">Reset All</div>
              </div>
            </div>
            <div className="cursor-not-allowed opacity-50">Edit</div>
            <div className="cursor-not-allowed opacity-50">Selection</div>
            <div className="cursor-not-allowed opacity-50">View</div>
            <div className="cursor-not-allowed opacity-50">Help</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[#0a0a0c] px-3 py-1 rounded-md border border-[#2d2f36]" id="lang-select">
            <span className="text-[10px] text-[#64748b] font-bold uppercase">Lang:</span>
            <select 
              value={activeTab.language}
              onChange={(e) => setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, language: e.target.value } : t))}
              className="bg-transparent text-xs outline-none cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button 
            onClick={formatCode}
            id="pretty-print"
            className="flex items-center gap-2 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 text-[#38bdf8] px-4 py-1.5 rounded-lg border border-[#38bdf8]/20 transition-all font-bold text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            PRETTY PRINT
          </button>
          <div id="install-app">
             <svg className="w-5 h-5 text-[#64748b] hover:text-[#38bdf8] cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-[#0a0a0c] px-2 pt-2 gap-1 overflow-x-auto border-b border-[#2d2f36]" id="tab-bar">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            draggable
            onDragStart={() => handleDragStart(tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onClick={() => setActiveTabId(tab.id)}
            onDoubleClick={() => setEditingTabId(tab.id)}
            className={`
              group flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all min-w-[120px] max-w-[200px] border-t border-x
              ${tab.id === activeTabId 
                ? 'bg-[#15171c] border-[#2d2f36] text-[#38bdf8] font-bold' 
                : 'bg-transparent border-transparent text-[#64748b] hover:bg-[#15171c]/50'}
            `}
          >
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            
            {editingTabId === tab.id ? (
              <input 
                autoFocus
                className="bg-transparent outline-none w-full text-xs"
                value={tab.name}
                onBlur={() => setEditingTabId(null)}
                onChange={(e) => setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, name: e.target.value } : t))}
                onKeyDown={(e) => e.key === 'Enter' && setEditingTabId(null)}
              />
            ) : (
              <span className="text-xs truncate">{tab.name}{tab.isDirty ? '*' : ''}</span>
            )}

            <button 
              onClick={(e) => closeTab(e, tab.id)}
              className="ml-auto opacity-0 group-hover:opacity-100 hover:text-white transition-opacity"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <button 
          onClick={createNewTab}
          className="p-2 text-[#64748b] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative">
        <Editor
          theme="vs-dark"
          language={activeTab.language}
          value={activeTab.content}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            padding: { top: 20 },
            scrollBeyondLastLine: false,
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-[#15171c] border-t border-[#2d2f36] px-4 py-1 flex items-center justify-between text-[10px] text-[#64748b]">
        <div className="flex items-center gap-4">
          <span>{activeTab.language.toUpperCase()}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4 uppercase font-bold">
          <span>{activeTab.content.split('\n').length} LINES</span>
          <span className="text-[#38bdf8]">READY</span>
        </div>
      </div>
    </div>
  );
};

export default KaldiEditor;
