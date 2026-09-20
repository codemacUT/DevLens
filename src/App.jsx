import React,{useState,useEffect} from 'react';
import './App.css';
const API_BASE='http://localhost:5001/api';
const TOOL_CONFIG={
  error:{label: '[1] Stacktrace & Fix',placeholder: 'Paste error stacktrace or broken code...' },
  refactor:{label: '[2] Refactor & Review',placeholder: 'Paste code to audit and optimize...' },
  test:{label: '[3] Unit Test Gen',placeholder: 'Paste function to generate unit tests for...' },
  regex:{label: '[4] Regex Architect',placeholder: 'Enter regex to explain or description to generate...' }
};
export default function App(){
  const [tool, setTool]=useState('error');
  const [input, setInput]=useState('');
  const [output, setOutput]=useState('// DevTools output will display here...');
  const [status, setStatus]=useState('READY');
  const [history, setHistory]=useState([]);
  const [loading, setLoading]=useState(false);
  useEffect(()=>{
    fetchHistory();
  },[]);
  const fetchHistory=async ()=>{
    try{
      const res=await fetch(`${API_BASE}/history`);
      if(res.ok){
        const data=await res.json();
        setHistory(data);
      }
    }
    catch(err){
      console.error('Failed to load history',err);
    }
  };
  const handleRun=async ()=>{
    if(!input.trim() || loading) return;
    setLoading(true);
    setStatus('WORKING');
    try{
      const res=await fetch(`${API_BASE}/analyze`,{
        method:'POST',
        headers:{ 'Content-Type': 'application/json' },
        body:JSON.stringify({ tool, input })
      });
      const data=await res.json();
      if(!res.ok){
        throw new Error(data.error || 'Request failed');
      }
      setOutput(data.output.replace(/[#*`]/g, ''));
      setStatus('READY');
      fetchHistory();
    }
    catch(err){
      setOutput(`${err.message}`);
      setStatus('ERROR');
    }
    finally{
      setLoading(false);
    }
  };
  const handleKeyDown=(e)=>{
    if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
      handleRun();
    }
  };
  const loadFromHistory=(item)=>{
    setTool(item.tool);
    setInput(item.input);
    setOutput(item.output);
  };
  return(
    <div className="devtools-container">
      <header>
        <div className="brand">DEVLENS</div>
        <div style={{
          fontSize:'11px',color:'var(--muted)'
          }}>
            Engine : Gemini 3.6 Flash
        </div>
      </header>
      {}
      {history.length>0 && (
        <div className="history-list">
          <span style={{
            fontSize:'10px',color:'var(--accent)', alignSelf:'center'}}>
              PAST:
          </span>
          {history.map((h)=>(
            <button key={h._id} className="history-item" onClick={() => loadFromHistory(h)}>
              [{h.tool.toUpperCase()}]{
              new Date(h.createdAt).toLocaleTimeString([],{
                hour:'2-digit',minute:'2-digit' 
                })
              }
            </button>
          ))}
        </div>
      )}
      {}
      <nav className="toolbar">
        {Object.entries(TOOL_CONFIG).map(([key, cfg])=>(
          <button
            key={key}
            className={`tab-btn ${tool === key ? 'active' : ''}`}
            onClick={() => setTool(key)}
          >
            {cfg.label}
          </button>
        ))}
      </nav>
      {}
      <main>
        <section className="pane">
          <div className="pane-header">
            <span>INPUT ({tool.toUpperCase()})</span>
            <span>{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={TOOL_CONFIG[tool].placeholder}
            spellCheck="false"
          />
          <div className="actions">
            <span style={{
              fontSize:'11px',color:'var(--muted)'
              }}>
            Ctrl / Cmd + Enter to run
            </span>
            <button className="run-btn" onClick={handleRun} disabled={loading}>
              {loading ? 'Running...' : 'Run Analysis'}
            </button>
          </div>
        </section>
        <section className="pane">
          <div className="pane-header">
            <span>DEVTOOLS OUTPUT</span>
            <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
          </div>
          <div className="output-container">{output}</div>
        </section>
      </main>
    </div>
  );
}