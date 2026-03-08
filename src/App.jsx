import { useState, useRef, useEffect } from "react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const DEFAULT_LEADERS = [
  { id:"plato",      name:"Plato",           era:"428–348 BC",    domain:"Philosophy",    avatar:"🏛️", style:"Ask deep questions, challenge assumptions, use simple analogies",                        custom:false, color:"#E63946" },
  { id:"sun_tzu",    name:"Sun Tzu",          era:"544–496 BC",    domain:"Strategy",      avatar:"⚔️",  style:"Short and sharp. Strategy, timing, knowing when to act and when not to",               custom:false, color:"#2196F3" },
  { id:"marcus",     name:"Marcus Aurelius",  era:"121–180 AD",    domain:"Stoicism",      avatar:"🪙",  style:"Calm, grounded. Focus on what you control. Accept what you can't",                     custom:false, color:"#FF9800" },
  { id:"machiavelli",name:"Machiavelli",      era:"1469–1527",     domain:"Politics",      avatar:"🦁",  style:"Blunt, practical. Power, people's real motives, not what they say",                    custom:false, color:"#4CAF50" },
  { id:"lincoln",    name:"Abraham Lincoln",  era:"1809–1865",     domain:"Leadership",    avatar:"🎩",  style:"Warm, story-driven. Lead with values, bring people with you",                           custom:false, color:"#9C27B0" },
  { id:"churchill",  name:"Winston Churchill",era:"1874–1965",     domain:"Oratory",       avatar:"🗣️", style:"Bold, defiant. Never give up, rally people with strong clear words",                    custom:false, color:"#00BCD4" },
  { id:"jobs",       name:"Steve Jobs",       era:"1955–2011",     domain:"Innovation",    avatar:"🍎",  style:"Demanding, visionary. Cut the clutter, make it insanely simple",                       custom:false, color:"#FF5722" },
  { id:"musk",       name:"Elon Musk",        era:"1971–present",  domain:"Entrepreneur",  avatar:"🚀",  style:"First principles thinking. Ignore conventional wisdom, move fast, think big",           custom:false, color:"#3F51B5" },
];

const NAV = [
  { id:"chat",     label:"Chat",          icon:"💬", group:"minds" },
  { id:"insight",  label:"Insights",      icon:"💡", group:"minds" },
  { id:"speech",   label:"Speech Studio", icon:"🎤", group:"create" },
  { id:"meeting",  label:"Notes",         icon:"📋", group:"create" },
  { id:"brain",    label:"Second Brain",  icon:"🧠", group:"brain" },
  { id:"research", label:"Research",      icon:"🔬", group:"brain" },
  { id:"synthesis",label:"Idea Synthesis",icon:"⚡", group:"brain" },
  { id:"cluster",  label:"Knowledge Clusters", icon:"🗺️", group:"brain" },
  { id:"saved",    label:"Saved",         icon:"🗂️", group:"system" },
];

const SPEECH_SUBMODES = [
  { id:"generate", label:"Speech Mode",       icon:"🎙️", desc:"Full structured speech from your brief" },
  { id:"idea",     label:"Idea Mode",          icon:"💭", desc:"Turn raw thoughts into a speech outline" },
  { id:"link",     label:"Link Insight Mode",  icon:"🔗", desc:"Summarise a YouTube / article link" },
];

const AUDIENCE_TYPES = ["College students","Engineering students","Young entrepreneurs","Policy students","Startup founders","MBA students","High school","General public"];
const EVENT_TYPES    = ["College Innovation Day","Conference keynote","TEDx Talk","Academic lecture","Startup pitch","Policy forum","Graduation ceremony","Workshop"];
const DURATIONS      = ["3 minutes","5 minutes","7 minutes","10 minutes","15 minutes","20 minutes"];
const IDEA_FORMATS   = ["Concept","Framework","Policy idea","Startup idea","Research question","Speech topic"];
const EMOJIS = ["🧠","👑","⚡","🌍","🔥","💎","🦅","🎯","🌊","🏆","🧭","🌱","🦁","🐯","🦊","✨"];
const COLORS = ["#E63946","#2196F3","#FF9800","#4CAF50","#9C27B0","#00BCD4","#FF5722","#3F51B5"];

const SECOND_BRAIN_SYS = `You are a Second Brain — a structured intellectual companion for policy leaders, founders, researchers, and innovation builders. You help capture knowledge, synthesize ideas, and generate insights.

Principles:
- Intellectual depth with clarity
- Short sections, clear ideas, structured thinking
- Draw on science, economics, governance, technology, systems thinking
- Thinkers to reference (no fabricated quotes): Peter Drucker, Clayton Christensen, Elinor Ostrom, Amartya Sen, Buckminster Fuller, Einstein, Lee Kuan Yew, Nassim Taleb, Steve Jobs, Yuval Noah Harari
- Avoid generic motivational language and excessive verbosity
- Every output should increase the user's understanding and ability to act`;

const SPEECH_ENGINE_BASE = `You are an advanced Speech Intelligence Engine for academic institutions, conferences, innovation forums, and policy events.
Core: Intellectual but accessible. Story-driven. Synthesize science, economics, technology, history, philosophy.
Reference real thinkers when relevant (never fabricate quotes): Drucker, Christensen, Sen, Ostrom, Harari, Taleb, Jobs, Lee Kuan Yew, Einstein, Buckminster Fuller.
Avoid jargon, clichés, generic motivational tone. Short paragraphs, strong transitions.`;

async function callClaude(sys, messages, maxTokens=1800) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTokens, system:sys, messages }),
  });
  const d = await res.json();
  return d.content?.map(b=>b.text||"").join("") || "No response.";
}

function RichText({ text }) {
  return text.split("\n").map((line,li,arr)=>{
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    return <span key={li}>{parts.map((p,i)=>p.startsWith("**")&&p.endsWith("**")?<strong key={i} style={{color:"#1a1a2e",fontWeight:700}}>{p.slice(2,-2)}</strong>:p)}{li<arr.length-1&&<br/>}</span>;
  });
}

function HeroArcs() {
  return (
    <svg viewBox="0 0 800 180" style={{position:"absolute",bottom:0,left:0,width:"100%",pointerEvents:"none"}} preserveAspectRatio="none">
      <path d="M-20 180 Q400 20 820 180 Z" fill="white" opacity="0.08"/>
      <path d="M-20 180 Q400 60 820 180 Z" fill="white" opacity="0.06"/>
      <path d="M-20 180 Q400 100 820 180 Z" fill="white" opacity="0.05"/>
    </svg>
  );
}

function Chip({ active, onClick, children, color="#1565C0" }) {
  return (
    <button onClick={onClick} style={{
      padding:"5px 13px", borderRadius:20, fontSize:12, cursor:"pointer", border:"2px solid",
      fontFamily:"'DM Sans', sans-serif", fontWeight:active?600:400, transition:"all 0.15s",
      borderColor:active?color:"#e8eaf0", background:active?color:"white", color:active?"white":"#6b7280",
    }}>{children}</button>
  );
}

function Label({ children }) {
  return <div style={{fontSize:11,fontWeight:700,color:"#374151",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{children}</div>;
}

function Card({ children, style={} }) {
  return <div style={{background:"white",borderRadius:16,padding:"20px 22px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:"1px solid #f0f2f8",...style}}>{children}</div>;
}

function OutputCard({ output, onCopy, onSave, label, meta }) {
  return (
    <div style={{marginTop:18,background:"white",borderRadius:16,padding:"24px 26px",boxShadow:"0 2px 16px rgba(0,0,0,0.08)",borderTop:"4px solid #1565C0"}}>
      {(label||meta) && (
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingBottom:14,borderBottom:"1px solid #f0f4ff"}}>
          {label && <span style={{fontSize:10,fontWeight:700,color:"#1565C0",textTransform:"uppercase",letterSpacing:"0.1em",background:"#e8f0fe",padding:"3px 10px",borderRadius:10}}>{label}</span>}
          {meta && <span style={{fontSize:11,color:"#9ca3af"}}>{meta}</span>}
        </div>
      )}
      <div style={{fontSize:14.5,lineHeight:2,color:"#2d3748",whiteSpace:"pre-wrap"}}><RichText text={output}/></div>
      <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"flex-end",borderTop:"1px solid #f0f0f0",paddingTop:14}}>
        <button onClick={onCopy} style={{padding:"7px 16px",borderRadius:8,cursor:"pointer",background:"#f5f5f5",border:"none",color:"#6b7280",fontSize:12,fontWeight:500}}>Copy</button>
        <button onClick={onSave} style={{padding:"7px 16px",borderRadius:8,cursor:"pointer",background:"#e8f0fe",border:"none",color:"#1565C0",fontSize:12,fontWeight:600}}>Save ✦</button>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
        <span style={{fontSize:20}}>{icon}</span>
        <span style={{fontFamily:"'Playfair Display', serif",fontSize:18,fontWeight:700,color:"#1a1a2e"}}>{title}</span>
      </div>
      {sub && <p style={{margin:0,fontSize:13,color:"#9ca3af",paddingLeft:28}}>{sub}</p>}
    </div>
  );
}

export default function App() {
  const [leaders, setLeaders] = useState(DEFAULT_LEADERS);
  const [mode, setMode] = useState("chat");
  const [selectedLeaders, setSelectedLeaders] = useState(["plato","musk"]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]);
  const [meetingType, setMeetingType] = useState("strategy session");
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatLeader, setActiveChatLeader] = useState(null);
  const [showAddLeader, setShowAddLeader] = useState(false);
  const [newLeader, setNewLeader] = useState({name:"",era:"",domain:"",avatar:"🧠",style:"",color:"#E63946"});
  const [speechSubmode, setSpeechSubmode] = useState("generate");
  const [speechAudience, setSpeechAudience] = useState("College students");
  const [speechEvent, setSpeechEvent] = useState("College Innovation Day");
  const [speechDuration, setSpeechDuration] = useState("7 minutes");
  const [speechTopic, setSpeechTopic] = useState("");
  const [speechIdeas, setSpeechIdeas] = useState("");
  const [speechLink, setSpeechLink] = useState("");
  const [speechLinkContext, setSpeechLinkContext] = useState("");

  // Second Brain state
  const [notes, setNotes] = useState([]); // {id,title,context,insight,use,tags,ts,raw}
  const [noteInput, setNoteInput] = useState({title:"",context:"",insight:"",use:"",tags:""});
  const [researchQ, setResearchQ] = useState("");
  const [synthInput, setSynthInput] = useState("");
  const [synthFormat, setSynthFormat] = useState("Concept");
  const [thoughtInput, setThoughtInput] = useState("");
  const [activeTag, setActiveTag] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(()=>{
    const link=document.createElement("link"); link.rel="stylesheet"; link.href=FONT_LINK; document.head.appendChild(link);
    loadStorage();
  },[]);
  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"})},[chatHistory]);

  const loadStorage = async () => {
    try {
      const items = await Promise.all([
        window.storage.get("mat-saved").catch(()=>null),
        window.storage.get("mat-leaders").catch(()=>null),
        window.storage.get("mat-notes").catch(()=>null),
      ]);
      if(items[0]) setSaved(JSON.parse(items[0].value));
      if(items[1]) setLeaders(JSON.parse(items[1].value));
      if(items[2]) setNotes(JSON.parse(items[2].value));
    } catch(e){}
  };

  const ps = async(k,v) => { try{ await window.storage.set(k,JSON.stringify(v)); }catch(e){} };
  const saveItem = (item) => { const u=[{...item,id:Date.now(),ts:new Date().toLocaleString()},...saved]; setSaved(u); ps("mat-saved",u); };
  const toggleLeader = (id) => setSelectedLeaders(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const addLeader = () => {
    if(!newLeader.name.trim()) return;
    const u=[...leaders,{...newLeader,id:`custom_${Date.now()}`,custom:true}];
    setLeaders(u); ps("mat-leaders",u);
    setNewLeader({name:"",era:"",domain:"",avatar:"🧠",style:"",color:"#E63946"});
    setShowAddLeader(false);
  };
  const deleteLeader = (id) => { const u=leaders.filter(l=>l.id!==id); setLeaders(u); ps("mat-leaders",u); setSelectedLeaders(p=>p.filter(x=>x!==id)); };

  const startChat = (id) => { setActiveChatLeader(id); setChatHistory([]); setInput(""); };
  const sendChat = async () => {
    if(!input.trim()||!activeChatLeader) return;
    const leader=leaders.find(l=>l.id===activeChatLeader);
    const hist=[...chatHistory,{role:"user",content:input}];
    setChatHistory(hist); setInput(""); setLoading(true);
    try {
      const reply=await callClaude(`You ARE ${leader.name} (${leader.era}). Speak in first person. Style: ${leader.style}. Plain language. Short sentences. Max 4 sentences. Stay in character.`,hist.map(m=>({role:m.role,content:m.content})));
      setChatHistory(p=>[...p,{role:"assistant",content:reply,leaderName:leader.name,leaderAvatar:leader.avatar,leaderColor:leader.color}]);
    } catch(e){ setChatHistory(p=>[...p,{role:"assistant",content:"Something went wrong.",leaderName:leader.name,leaderAvatar:leader.avatar,leaderColor:leader.color}]); }
    setLoading(false);
  };
  const saveChatSnapshot = () => {
    const leader=leaders.find(l=>l.id===activeChatLeader);
    saveItem({type:"chat",label:`Chat with ${leader?.name}`,text:chatHistory.map(m=>`${m.role==="user"?"You":leader?.name}: ${m.content}`).join("\n\n")});
  };

  // INSIGHT / MEETING
  const getGenPrompt = () => {
    const list=leaders.filter(l=>selectedLeaders.includes(l.id)).map(l=>`${l.name} (${l.style})`).join(", ");
    if(mode==="insight") return `You are a practical wisdom translator. Give real useful advice voiced by: ${list}.\nShort, direct, zero fluff. No academic words. 2-3 sentences per leader.\nFormat: **[Leader Name]**: their take.\nEnd with **The Big Takeaway**: one plain sentence.`;
    if(mode==="meeting") return `You're a sharp facilitator inspired by: ${list}. Turn this into clean ${meetingType} notes. Short sentences, no jargon. Format: **Summary**, **Decisions Made**, **Action Items**, **Key Insight**, **Next Steps**.`;
    return "";
  };
  const handleGenerate = async () => {
    if(!input.trim()||!selectedLeaders.length) return;
    setLoading(true); setOutput(null);
    try { setOutput(await callClaude(getGenPrompt(),[{role:"user",content:input}])); } catch(e){setOutput("Error.");}
    setLoading(false);
  };

  // SPEECH STUDIO
  const handleSpeechGenerate = async () => {
    setLoading(true); setOutput(null);
    let sys=SPEECH_ENGINE_BASE; let userMsg="";
    if(speechSubmode==="generate"){
      if(!speechTopic.trim()){setLoading(false);return;}
      sys+=`\n\nGenerate a structured speech in this exact format:\n**SPEECH TITLE**\n[title]\n\n**Opening Hook**\n[powerful opening]\n\n**Core Narrative**\n[context and story]\n\n**Key Insight 1**\n[insight]\n\n**Key Insight 2**\n[insight]\n\n**Key Insight 3**\n[insight]\n\n**Example or Story**\n[relatable story]\n\n**Message to the Audience**\n[direct message]\n\n**Closing Thought**\n[inspiring close]`;
      userMsg=`Topic: ${speechTopic}\nAudience: ${speechAudience}\nEvent: ${speechEvent}\nDuration: ${speechDuration}${speechIdeas.trim()?`\nKey ideas: ${speechIdeas}`:""}${speechLink.trim()?`\nReference: ${speechLink}`:""}`;
    }
    if(speechSubmode==="idea"){
      if(!speechIdeas.trim()){setLoading(false);return;}
      sys+=`\n\nConvert raw thoughts into a speech outline.\nFormat:\n**Speech Outline: [Suggested Title]**\n\n**Central Theme**\n[what this speech is really about]\n\n**Opening Hook Options**\n[2-3 hook ideas]\n\n**Section 1:** [title]\n- point\n- point\n\n**Section 2:** [title]\n- point\n- point\n\n**Section 3:** [title]\n- point\n- point\n\n**Closing Message**\n[how to end strongly]\n\n**Thinkers to Weave In**\n[relevant names and ideas]`;
      userMsg=`Raw ideas: ${speechIdeas}\nAudience: ${speechAudience}\nEvent: ${speechEvent}`;
    }
    if(speechSubmode==="link"){
      if(!speechLink.trim()){setLoading(false);return;}
      sys+=`\n\nAnalyse the provided link/content.\nFormat:\n**Content Summary**\n[2-3 sentence summary]\n\n**Key Insights**\n[3-5 bullet insights]\n\n**Intellectual Connections**\n[connect to relevant thinkers, history, fields]\n\n**How to Use in a Speech**\n[practical suggestions]\n\n**Suggested Hook from this Content**\n[strong paraphraseable line]`;
      userMsg=`Link or content: ${speechLink}${speechLinkContext.trim()?`\nContext: ${speechLinkContext}`:""}${speechTopic.trim()?`\nSpeech topic: ${speechTopic}`:""}`;
    }
    try { setOutput(await callClaude(sys,[{role:"user",content:userMsg}],2000)); } catch(e){setOutput("Error.");}
    setLoading(false);
  };

  // SECOND BRAIN — Note capture
  const addNote = async () => {
    if(!noteInput.title.trim()&&!noteInput.context.trim()) return;
    setLoading(true);
    const tags = noteInput.tags.split(/[\s,]+/).filter(t=>t.startsWith("#")||t.trim()).map(t=>t.startsWith("#")?t:`#${t}`).filter(Boolean);
    let aiInsight = "";
    if(noteInput.context.trim()) {
      try {
        aiInsight = await callClaude(SECOND_BRAIN_SYS,[{role:"user",content:`For this note, give ONE sharp insight (2 sentences max) that a policy maker or founder would find immediately useful.\n\nNote: "${noteInput.context}"`}],300);
      } catch(e){}
    }
    const newNote = { id:Date.now(), title:noteInput.title||noteInput.context.slice(0,60), context:noteInput.context, insight:noteInput.insight||aiInsight, use:noteInput.use, tags, ts:new Date().toLocaleString() };
    const updated=[newNote,...notes];
    setNotes(updated); ps("mat-notes",updated);
    setNoteInput({title:"",context:"",insight:"",use:"",tags:""});
    setLoading(false);
  };

  const deleteNote = (id) => { const u=notes.filter(n=>n.id!==id); setNotes(u); ps("mat-notes",u); };

  // All unique tags
  const allTags = [...new Set(notes.flatMap(n=>n.tags||[]))];

  // RESEARCH
  const handleResearch = async () => {
    if(!researchQ.trim()) return;
    setLoading(true); setOutput(null);
    const sys=SECOND_BRAIN_SYS+`\n\nProvide structured research on the topic.\nFormat:\n**Concept Definition**\n[clear definition]\n\n**Underlying Mechanism**\n[how it works]\n\n**Why It Matters**\n[significance for policy/innovation]\n\n**Real World Examples**\n[3 concrete examples]\n\n**Policy or Innovation Implications**\n[what decision-makers should consider]\n\n**Thinkers & Frameworks**\n[relevant intellectual frameworks]`;
    try { setOutput(await callClaude(sys,[{role:"user",content:researchQ}],1800)); } catch(e){setOutput("Error.");}
    setLoading(false);
  };

  // IDEA SYNTHESIS
  const handleSynthesis = async () => {
    if(!synthInput.trim()) return;
    setLoading(true); setOutput(null);
    const noteContext = notes.length>0 ? `\n\nUser's existing knowledge base (${notes.length} notes):\n${notes.slice(0,5).map(n=>`- ${n.title}: ${n.context.slice(0,100)}`).join("\n")}` : "";
    const sys=SECOND_BRAIN_SYS+noteContext+`\n\nConvert the fragmented ideas into a structured "${synthFormat}".\n\nFormat:\n**${synthFormat}: [Name/Title]**\n\n**Core Idea**\n[what this is really about]\n\n**Underlying Principle**\n[the fundamental logic]\n\n**Possible Applications**\n[3 concrete ways this could be used]\n\n**Intellectual Connections**\n[how this connects to known thinkers or frameworks]\n\n**Open Questions**\n[2-3 questions worth exploring further]`;
    try { setOutput(await callClaude(sys,[{role:"user",content:synthInput}],1600)); } catch(e){setOutput("Error.");}
    setLoading(false);
  };

  // KNOWLEDGE CLUSTER
  const handleCluster = async (tag) => {
    const clusterNotes = notes.filter(n=>(n.tags||[]).includes(tag));
    if(clusterNotes.length<2) return;
    setLoading(true); setOutput(null);
    const notesText = clusterNotes.map(n=>`Title: ${n.title}\nContext: ${n.context}\nInsight: ${n.insight}`).join("\n\n---\n\n");
    const sys=SECOND_BRAIN_SYS+`\n\nAnalyse these related notes and generate a knowledge cluster synthesis.\n\nFormat:\n**Cluster: ${tag}**\n\n**Key Ideas Across Notes**\n[synthesised ideas]\n\n**Emerging Patterns**\n[what patterns keep appearing]\n\n**Strategic Implications**\n[what this means for policy/innovation action]\n\n**Potential Opportunity**\n[one concrete opportunity this suggests]\n\n**Open Questions**\n[3 questions worth exploring]`;
    try { setOutput(await callClaude(sys,[{role:"user",content:notesText}],1600)); } catch(e){setOutput("Error.");}
    setLoading(false);
  };

  const activeLeader = leaders.find(l=>l.id===activeChatLeader);
  const speechReady = () => { if(speechSubmode==="generate") return speechTopic.trim().length>0; if(speechSubmode==="idea") return speechIdeas.trim().length>0; return speechLink.trim().length>0; };
  const filteredNotes = activeTag ? notes.filter(n=>(n.tags||[]).includes(activeTag)) : notes;

  const IS = { width:"100%", background:"white", border:"2px solid #e8eaf0", borderRadius:12, padding:"11px 15px", color:"#1a1a2e", fontFamily:"'DM Sans', sans-serif", fontSize:14, lineHeight:1.6, outline:"none", boxSizing:"border-box", resize:"vertical", transition:"border-color 0.2s" };
  const foc = e => e.target.style.borderColor="#1565C0";
  const blu = e => e.target.style.borderColor="#e8eaf0";
  const Loader = ({msg}) => (
    <div style={{marginTop:24,textAlign:"center",padding:"20px"}}>
      <div style={{display:"inline-flex",gap:7}}>{[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:"#1565C0",animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
      <p style={{marginTop:10,color:"#9ca3af",fontStyle:"italic",fontSize:13}}>{msg||"Thinking..."}</p>
    </div>
  );
  const GenBtn = ({onClick,disabled,label}) => (
    <button onClick={onClick} disabled={disabled} style={{padding:"11px 28px",borderRadius:24,border:"none",cursor:"pointer",background:"linear-gradient(135deg, #1565C0, #0D47A1)",color:"white",fontFamily:"'DM Sans', sans-serif",fontWeight:600,fontSize:14,boxShadow:"0 4px 14px rgba(21,101,192,0.35)",opacity:disabled?0.5:1,transition:"all 0.2s"}}>{label}</button>
  );

  // Group nav items
  const navGroups = [
    { label:"Minds", ids:["chat","insight"] },
    { label:"Create", ids:["speech","meeting"] },
    { label:"Second Brain", ids:["brain","research","synthesis","cluster"] },
    { label:"", ids:["saved"] },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f4f6fb",fontFamily:"'DM Sans', sans-serif",color:"#1a1a2e"}}>

      {/* HEADER */}
      <header style={{position:"relative",overflow:"hidden",background:"linear-gradient(135deg, #1565C0 0%, #0D47A1 40%, #1a237e 100%)",padding:"28px 28px 44px",color:"white"}}>
        <HeroArcs/>
        {[{x:"8%",y:"18%",s:10,c:"#E53935"},{x:"15%",y:"68%",s:7,c:"#43A047"},{x:"88%",y:"18%",s:12,c:"#FB8C00"},{x:"82%",y:"68%",s:8,c:"#00BCD4"},{x:"50%",y:"8%",s:6,c:"#E53935"},{x:"70%",y:"52%",s:9,c:"#9C27B0"}].map((d,i)=>(
          <div key={i} style={{position:"absolute",left:d.x,top:d.y,width:d.s,height:d.s,borderRadius:"50%",background:d.c,opacity:0.45}}/>
        ))}
        <div style={{position:"relative",zIndex:1,maxWidth:1060,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
            <svg viewBox="0 0 48 48" width="42" height="42">
              <path d="M6 44 A38 38 0 0 1 42 44" fill="none" stroke="#FB8C00" strokeWidth="5" strokeLinecap="round"/>
              <path d="M12 44 A30 30 0 0 1 36 44" fill="none" stroke="#E53935" strokeWidth="5" strokeLinecap="round"/>
              <path d="M19 44 A19 19 0 0 1 29 44" fill="none" stroke="#43A047" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="24" cy="44" r="3.5" fill="white"/>
            </svg>
            <div>
              <h1 style={{fontFamily:"'Playfair Display', serif",fontSize:"clamp(20px,3.5vw,36px)",fontWeight:900,margin:0,letterSpacing:"-0.02em",lineHeight:1.1}}>Minds Across Time</h1>
              <p style={{margin:"4px 0 0",fontSize:12,opacity:0.7,fontStyle:"italic",fontWeight:300}}>Conversations with the greatest minds who ever lived.</p>
            </div>
          </div>

          {/* Nav — grouped */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
            {navGroups.map((g,gi)=>(
              <div key={gi} style={{display:"flex",gap:4,alignItems:"center"}}>
                {gi>0 && <div style={{width:1,height:20,background:"rgba(255,255,255,0.2)",margin:"0 4px"}}/>}
                {g.label && <span style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:"0.12em",textTransform:"uppercase",marginRight:2}}>{g.label}</span>}
                {NAV.filter(n=>g.ids.includes(n.id)).map(m=>(
                  <button key={m.id} onClick={()=>{setMode(m.id);setOutput(null);}} style={{
                    padding:"6px 14px",borderRadius:20,cursor:"pointer",border:"none",transition:"all 0.18s",
                    background:mode===m.id?"white":"rgba(255,255,255,0.13)",
                    color:mode===m.id?"#1565C0":"white",
                    fontFamily:"'DM Sans', sans-serif",fontWeight:mode===m.id?600:400,fontSize:12,
                    boxShadow:mode===m.id?"0 2px 8px rgba(0,0,0,0.15)":"none",
                    display:"flex",alignItems:"center",gap:5,
                  }}>
                    <span>{m.icon}</span><span>{m.label}{m.id==="saved"&&saved.length>0?` (${saved.length})`:""}{m.id==="brain"&&notes.length>0?` (${notes.length})`:""}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* BODY */}
      <div style={{maxWidth:1060,margin:"0 auto",padding:"22px 18px",display:"grid",gridTemplateColumns:"1fr 255px",gap:18,alignItems:"start"}}>
        <div>

          {/* ─ CHAT ─ */}
          {mode==="chat" && !activeChatLeader && (
            <div>
              <Card style={{marginBottom:14}}><p style={{margin:0,fontSize:14,color:"#5a6072",lineHeight:1.6}}>Pick a mind from history and have a real conversation. Ask them anything — they'll answer as themselves, in plain language.</p></Card>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))",gap:9}}>
                {leaders.map(l=>(
                  <button key={l.id} onClick={()=>startChat(l.id)} style={{padding:"14px 11px",borderRadius:14,cursor:"pointer",textAlign:"left",border:"none",background:"white",boxShadow:"0 2px 10px rgba(0,0,0,0.07)",transition:"all 0.2s",borderTop:`4px solid ${l.color||"#2196F3"}`}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.07)";}}>
                    <div style={{fontSize:24,marginBottom:7}}>{l.avatar}</div>
                    <div style={{fontFamily:"'Playfair Display', serif",fontSize:13,fontWeight:700,color:"#1a1a2e"}}>{l.name}</div>
                    <div style={{fontSize:9.5,color:l.color||"#2196F3",fontWeight:600,marginTop:2,letterSpacing:"0.05em",textTransform:"uppercase"}}>{l.domain}</div>
                    <div style={{fontSize:10,color:"#9ca3af",marginTop:1}}>{l.era}</div>
                    <div style={{fontSize:11,color:"#6b7280",marginTop:6,lineHeight:1.4}}>{l.style.slice(0,48)}…</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode==="chat" && activeChatLeader && (
            <div>
              <div style={{background:"white",borderRadius:16,padding:"13px 16px",marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.07)",display:"flex",alignItems:"center",gap:11,borderLeft:`5px solid ${activeLeader?.color||"#2196F3"}`}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:activeLeader?.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{activeLeader?.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Playfair Display', serif",fontSize:15,fontWeight:700}}>{activeLeader?.name}</div>
                  <div style={{fontSize:10,color:"#9ca3af"}}>{activeLeader?.era} · {activeLeader?.domain}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {chatHistory.length>0&&<button onClick={saveChatSnapshot} style={{padding:"5px 11px",borderRadius:8,cursor:"pointer",background:"#f0f4ff",border:"none",color:"#1565C0",fontSize:11,fontWeight:600}}>Save chat</button>}
                  <button onClick={()=>{setActiveChatLeader(null);setChatHistory([]);}} style={{padding:"5px 11px",borderRadius:8,cursor:"pointer",background:"#f5f5f5",border:"none",color:"#666",fontSize:11}}>← Back</button>
                </div>
              </div>
              <div style={{background:"white",borderRadius:16,padding:"16px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",minHeight:280,maxHeight:400,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:10}}>
                {chatHistory.length===0&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"50px 20px",textAlign:"center"}}><div><div style={{fontSize:34,marginBottom:10}}>{activeLeader?.avatar}</div><p style={{color:"#9ca3af",fontSize:13,fontStyle:"italic",lineHeight:1.6}}>Ask {activeLeader?.name} anything — a challenge, decision, or advice.</p></div></div>}
                {chatHistory.map((msg,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:msg.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:msg.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:msg.role==="user"?"#1565C0":`${msg.leaderColor||"#2196F3"}12`,border:msg.role==="user"?"none":`1.5px solid ${msg.leaderColor||"#2196F3"}30`,fontSize:14,lineHeight:1.75,color:msg.role==="user"?"white":"#1a1a2e"}}>
                      {msg.role==="assistant"&&<div style={{fontSize:9.5,color:msg.leaderColor||"#2196F3",fontWeight:700,marginBottom:4,letterSpacing:"0.08em",textTransform:"uppercase"}}>{msg.leaderAvatar} {msg.leaderName}</div>}
                      <div style={{whiteSpace:"pre-wrap"}}><RichText text={msg.content}/></div>
                    </div>
                  </div>
                ))}
                {loading&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:activeLeader?.color||"#2196F3",animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`,opacity:0.7}}/>)}<span style={{fontSize:10,color:"#9ca3af",marginLeft:5}}>{activeLeader?.name} is thinking...</span></div>}
                <div ref={chatEndRef}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={`Ask ${activeLeader?.name} something...`} rows={2} style={{...IS,flex:1,resize:"none"}} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}} onFocus={e=>e.target.style.borderColor=activeLeader?.color||"#2196F3"} onBlur={blu}/>
                <button onClick={sendChat} disabled={loading||!input.trim()} style={{padding:"0 18px",borderRadius:12,border:"none",cursor:"pointer",background:activeLeader?.color||"#1565C0",color:"white",fontFamily:"'DM Sans', sans-serif",fontWeight:600,fontSize:14,opacity:loading||!input.trim()?0.5:1}}>Send</button>
              </div>
              <div style={{fontSize:10,color:"#c0c0c0",marginTop:4}}>Enter to send · Shift+Enter for new line</div>
            </div>
          )}

          {/* ─ SPEECH STUDIO ─ */}
          {mode==="speech" && (
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:20}}>
                {SPEECH_SUBMODES.map(sm=>(
                  <button key={sm.id} onClick={()=>{setSpeechSubmode(sm.id);setOutput(null);}} style={{padding:"13px 11px",borderRadius:14,cursor:"pointer",textAlign:"left",border:"2px solid",transition:"all 0.18s",borderColor:speechSubmode===sm.id?"#1565C0":"#e8eaf0",background:speechSubmode===sm.id?"#e8f0fe":"white",boxShadow:speechSubmode===sm.id?"0 2px 12px rgba(21,101,192,0.15)":"0 1px 4px rgba(0,0,0,0.05)"}}>
                    <div style={{fontSize:20,marginBottom:5}}>{sm.icon}</div>
                    <div style={{fontFamily:"'Playfair Display', serif",fontSize:13,fontWeight:700,color:speechSubmode===sm.id?"#1565C0":"#1a1a2e"}}>{sm.label}</div>
                    <div style={{fontSize:11,color:"#9ca3af",marginTop:3,lineHeight:1.4}}>{sm.desc}</div>
                  </button>
                ))}
              </div>
              <Card style={{gap:16,display:"flex",flexDirection:"column"}}>
                {speechSubmode==="generate"&&(<>
                  <div><Label>Speech Topic *</Label><input value={speechTopic} onChange={e=>setSpeechTopic(e.target.value)} placeholder="e.g. AI Era and the Future of Work" style={{...IS,resize:"none"}} onFocus={foc} onBlur={blu}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <div><Label>Audience</Label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{AUDIENCE_TYPES.map(a=><Chip key={a} active={speechAudience===a} onClick={()=>setSpeechAudience(a)}>{a}</Chip>)}</div></div>
                    <div><Label>Event</Label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{EVENT_TYPES.map(e=><Chip key={e} active={speechEvent===e} onClick={()=>setSpeechEvent(e)}>{e}</Chip>)}</div></div>
                  </div>
                  <div><Label>Duration</Label><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{DURATIONS.map(d=><Chip key={d} active={speechDuration===d} onClick={()=>setSpeechDuration(d)} color="#FF5722">{d}</Chip>)}</div></div>
                  <div><Label>Key Ideas to Include (optional)</Label><textarea value={speechIdeas} onChange={e=>setSpeechIdeas(e.target.value)} placeholder="e.g. micro-retirement, skills over degrees, AI productivity..." rows={3} style={IS} onFocus={foc} onBlur={blu}/></div>
                  <div><Label>Reference Link (optional)</Label><input value={speechLink} onChange={e=>setSpeechLink(e.target.value)} placeholder="YouTube, article, or website URL" style={{...IS,resize:"none"}} onFocus={foc} onBlur={blu}/></div>
                </>)}
                {speechSubmode==="idea"&&(<>
                  <div><Label>Your Raw Thoughts *</Label><textarea value={speechIdeas} onChange={e=>setSpeechIdeas(e.target.value)} placeholder={"Dump your ideas here — fragments, bullet points, anything...\n\ne.g.\n- AI is changing jobs\n- Young people need skills not just degrees\n- Something about resilience"} rows={7} style={IS} onFocus={foc} onBlur={blu}/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <div><Label>Audience</Label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{AUDIENCE_TYPES.slice(0,5).map(a=><Chip key={a} active={speechAudience===a} onClick={()=>setSpeechAudience(a)}>{a}</Chip>)}</div></div>
                    <div><Label>Event</Label><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{EVENT_TYPES.slice(0,4).map(e=><Chip key={e} active={speechEvent===e} onClick={()=>setSpeechEvent(e)}>{e}</Chip>)}</div></div>
                  </div>
                </>)}
                {speechSubmode==="link"&&(<>
                  <div><Label>YouTube / Article / Website URL *</Label><input value={speechLink} onChange={e=>setSpeechLink(e.target.value)} placeholder="https://..." style={{...IS,resize:"none"}} onFocus={foc} onBlur={blu}/></div>
                  <div><Label>What's the content about?</Label><textarea value={speechLinkContext} onChange={e=>setSpeechLinkContext(e.target.value)} placeholder="Describe what's in the video/article, key points you remember..." rows={4} style={IS} onFocus={foc} onBlur={blu}/></div>
                  <div><Label>Speech topic this connects to (optional)</Label><input value={speechTopic} onChange={e=>setSpeechTopic(e.target.value)} placeholder="e.g. Future of education" style={{...IS,resize:"none"}} onFocus={foc} onBlur={blu}/></div>
                </>)}
                <div style={{display:"flex",justifyContent:"flex-end",paddingTop:4,borderTop:"1px solid #f0f0f0"}}>
                  <GenBtn onClick={handleSpeechGenerate} disabled={loading||!speechReady()} label={loading?"Crafting...":speechSubmode==="generate"?"🎙️ Generate Speech":speechSubmode==="idea"?"💭 Build Outline":"🔗 Extract Insights"}/>
                </div>
              </Card>
              {loading&&<Loader msg={speechSubmode==="generate"?"Synthesising wisdom across millennia...":speechSubmode==="idea"?"Structuring your thoughts...":"Extracting insights..."}/>}
              {output&&!loading&&<OutputCard output={output} onCopy={()=>navigator.clipboard.writeText(output)} onSave={()=>saveItem({type:"speech",label:speechTopic||speechIdeas.slice(0,50)||"Link insight",text:output})} label={speechSubmode==="generate"?"Full Speech":speechSubmode==="idea"?"Speech Outline":"Link Insights"} meta={`${speechAudience} · ${speechEvent}${speechSubmode==="generate"?` · ${speechDuration}`:""}`}/>}
            </div>
          )}

          {/* ─ INSIGHT / MEETING ─ */}
          {(mode==="insight"||mode==="meeting") && (
            <div>
              {selectedLeaders.length===0&&<div style={{padding:"11px 15px",background:"#fff3e0",borderRadius:10,marginBottom:12,fontSize:13,color:"#e65100",fontWeight:500}}>Select at least one mind from the sidebar →</div>}
              {selectedLeaders.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{leaders.filter(l=>selectedLeaders.includes(l.id)).map(l=><span key={l.id} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px 3px 7px",borderRadius:20,background:l.color+"18",border:`1.5px solid ${l.color}40`,fontSize:12,color:l.color,fontWeight:600}}>{l.avatar} {l.name}</span>)}</div>}
              {mode==="meeting"&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:11}}>{["strategy session","quarterly review","1:1 check-in","board meeting","team standup","client call"].map(t=><Chip key={t} active={meetingType===t} onClick={()=>setMeetingType(t)}>{t}</Chip>)}</div>}
              <Card style={{overflow:"hidden",padding:0}}><textarea value={input} onChange={e=>setInput(e.target.value)} rows={mode==="meeting"?7:4} placeholder={mode==="insight"?"What challenge or question do you want insight on?":"Paste raw notes, bullet points, or a transcript..."} style={{...IS,border:"none",borderRadius:16,boxShadow:"none"}} onFocus={e=>e.target.style.borderColor="transparent"} onBlur={e=>e.target.style.borderColor="transparent"}/></Card>
              <div style={{display:"flex",justifyContent:"flex-end",marginTop:9}}>
                <GenBtn onClick={handleGenerate} disabled={loading||!input.trim()||!selectedLeaders.length} label={loading?"Thinking...":mode==="insight"?"Get Insights":"Generate Notes"}/>
              </div>
              {loading&&<Loader msg="Consulting across millennia..."/>}
              {output&&!loading&&<OutputCard output={output} onCopy={()=>navigator.clipboard.writeText(output)} onSave={()=>saveItem({type:mode,label:input.slice(0,60),text:output})}/>}
            </div>
          )}

          {/* ─ SECOND BRAIN — NOTE CAPTURE ─ */}
          {mode==="brain" && (
            <div>
              <SectionTitle icon="🧠" title="Second Brain" sub="Capture knowledge, tag it, and build your personal intelligence layer."/>
              <Card style={{marginBottom:18,display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><Label>Note Title</Label><input value={noteInput.title} onChange={e=>setNoteInput(p=>({...p,title:e.target.value}))} placeholder="e.g. AI and water management" style={{...IS,resize:"none"}} onFocus={foc} onBlur={blu}/></div>
                  <div><Label>Tags (hashtags)</Label><input value={noteInput.tags} onChange={e=>setNoteInput(p=>({...p,tags:e.target.value}))} placeholder="#policy #AI #water" style={{...IS,resize:"none"}} onFocus={foc} onBlur={blu}/></div>
                </div>
                <div><Label>Context / Main Idea *</Label><textarea value={noteInput.context} onChange={e=>setNoteInput(p=>({...p,context:e.target.value}))} placeholder="What is this about? Paste notes, a summary, or any key observation..." rows={4} style={IS} onFocus={foc} onBlur={blu}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><Label>Your Key Insight (optional)</Label><textarea value={noteInput.insight} onChange={e=>setNoteInput(p=>({...p,insight:e.target.value}))} placeholder="What does this mean to you? Leave blank for AI to generate one." rows={2} style={IS} onFocus={foc} onBlur={blu}/></div>
                  <div><Label>Possible Use</Label><textarea value={noteInput.use} onChange={e=>setNoteInput(p=>({...p,use:e.target.value}))} placeholder="e.g. Could use in a speech on DPI, or for policy brief..." rows={2} style={IS} onFocus={foc} onBlur={blu}/></div>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #f0f0f0",paddingTop:12}}>
                  <GenBtn onClick={addNote} disabled={loading||(!noteInput.title.trim()&&!noteInput.context.trim())} label={loading?"Saving & generating insight...":"💾 Capture Note"}/>
                </div>
              </Card>

              {/* Tag filter */}
              {allTags.length>0&&(
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#9ca3af",fontWeight:600,marginRight:4}}>Filter:</span>
                  <Chip active={!activeTag} onClick={()=>setActiveTag(null)}>All ({notes.length})</Chip>
                  {allTags.map(t=><Chip key={t} active={activeTag===t} onClick={()=>setActiveTag(activeTag===t?null:t)} color="#4CAF50">{t} ({notes.filter(n=>(n.tags||[]).includes(t)).length})</Chip>)}
                </div>
              )}

              {filteredNotes.length===0&&<Card><p style={{margin:0,color:"#9ca3af",fontSize:14,textAlign:"center",padding:"20px 0"}}>No notes yet. Start capturing ideas above — the AI will generate an insight for each one.</p></Card>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {filteredNotes.map(n=>(
                  <div key={n.id} style={{background:"white",borderRadius:14,padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",borderLeft:"4px solid #4CAF50"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
                      <div style={{fontFamily:"'Playfair Display', serif",fontSize:15,fontWeight:700,color:"#1a1a2e"}}>{n.title}</div>
                      <div style={{display:"flex",gap:5,flexShrink:0}}>
                        <button onClick={()=>saveItem({type:"note",label:n.title,text:`Context: ${n.context}\n\nInsight: ${n.insight}\n\nPossible Use: ${n.use}`})} style={{padding:"3px 9px",borderRadius:6,cursor:"pointer",background:"#e8f0fe",border:"none",color:"#1565C0",fontSize:10,fontWeight:600}}>Save ✦</button>
                        <button onClick={()=>deleteNote(n.id)} style={{padding:"3px 9px",borderRadius:6,cursor:"pointer",background:"#fff0f0",border:"none",color:"#e53935",fontSize:10}}>✕</button>
                      </div>
                    </div>
                    {n.context&&<p style={{margin:"0 0 8px",fontSize:13,color:"#4b5563",lineHeight:1.6}}>{n.context}</p>}
                    {n.insight&&<div style={{padding:"8px 12px",background:"#f0fdf4",borderRadius:8,fontSize:13,color:"#166534",lineHeight:1.6,marginBottom:8}}><strong>💡 Insight:</strong> {n.insight}</div>}
                    {n.use&&<p style={{margin:"0 0 8px",fontSize:12,color:"#9ca3af",fontStyle:"italic"}}>Possible use: {n.use}</p>}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {(n.tags||[]).map(t=><span key={t} onClick={()=>setActiveTag(activeTag===t?null:t)} style={{padding:"2px 8px",borderRadius:10,background:"#e8f5e9",color:"#2e7d32",fontSize:11,fontWeight:600,cursor:"pointer"}}>{t}</span>)}
                      <span style={{fontSize:10,color:"#d1d5db",marginLeft:"auto"}}>{n.ts}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ RESEARCH ─ */}
          {mode==="research" && (
            <div>
              <SectionTitle icon="🔬" title="Research Mode" sub="Get structured, deep understanding of any concept, policy, or innovation topic."/>
              <Card style={{display:"flex",flexDirection:"column",gap:14}}>
                <div><Label>Research Question or Topic</Label><textarea value={researchQ} onChange={e=>setResearchQ(e.target.value)} placeholder="e.g. How does DPI (Digital Public Infrastructure) enable financial inclusion?\n\nor: What is the Ostrom framework for managing common pool resources?" rows={4} style={IS} onFocus={foc} onBlur={blu}/></div>
                <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #f0f0f0",paddingTop:12}}>
                  <GenBtn onClick={handleResearch} disabled={loading||!researchQ.trim()} label={loading?"Researching...":"🔬 Deep Research"}/>
                </div>
              </Card>
              {loading&&<Loader msg="Building structured understanding..."/>}
              {output&&!loading&&<OutputCard output={output} onCopy={()=>navigator.clipboard.writeText(output)} onSave={()=>saveItem({type:"research",label:researchQ.slice(0,60),text:output})} label="Research Brief"/>}
            </div>
          )}

          {/* ─ IDEA SYNTHESIS ─ */}
          {mode==="synthesis" && (
            <div>
              <SectionTitle icon="⚡" title="Idea Synthesis" sub="Dump raw thoughts — get structured frameworks, concepts, policy ideas, or startup ideas."/>
              <Card style={{display:"flex",flexDirection:"column",gap:14}}>
                <div>
                  <Label>Output Format</Label>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {IDEA_FORMATS.map(f=><Chip key={f} active={synthFormat===f} onClick={()=>setSynthFormat(f)} color="#9C27B0">{f}</Chip>)}
                  </div>
                </div>
                <div><Label>Your Raw Ideas or Reflections</Label><textarea value={synthInput} onChange={e=>setSynthInput(e.target.value)} placeholder={"Dump anything here — observations, half-ideas, questions...\n\ne.g.\n- Farmers don't use weather data even when available\n- Mobile phones more common than irrigation meters\n- Something about last-mile decision support\n- AI + agriculture + Tamil Nadu"} rows={7} style={IS} onFocus={foc} onBlur={blu}/></div>
                <div style={{display:"flex",justifyContent:"flex-end",borderTop:"1px solid #f0f0f0",paddingTop:12}}>
                  <GenBtn onClick={handleSynthesis} disabled={loading||!synthInput.trim()} label={loading?"Synthesising...":"⚡ Synthesise Ideas"}/>
                </div>
              </Card>
              {loading&&<Loader msg="Connecting your ideas..."/>}
              {output&&!loading&&<OutputCard output={output} onCopy={()=>navigator.clipboard.writeText(output)} onSave={()=>saveItem({type:"synthesis",label:synthInput.slice(0,60),text:output})} label={synthFormat}/>}
            </div>
          )}

          {/* ─ KNOWLEDGE CLUSTERS ─ */}
          {mode==="cluster" && (
            <div>
              <SectionTitle icon="🗺️" title="Knowledge Clusters" sub="Select a hashtag to synthesise all related notes into strategic insight."/>
              {notes.length<2&&<Card><p style={{margin:0,color:"#9ca3af",fontSize:14,textAlign:"center",padding:"20px 0"}}>You need at least 2 notes with the same hashtag to generate a cluster. Go to Second Brain to add notes.</p></Card>}
              {allTags.length>0&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))",gap:10,marginBottom:20}}>
                  {allTags.map(tag=>{
                    const count=notes.filter(n=>(n.tags||[]).includes(tag)).length;
                    return (
                      <button key={tag} onClick={()=>{setActiveTag(tag);handleCluster(tag);}} disabled={count<2} style={{padding:"16px 14px",borderRadius:14,cursor:count<2?"not-allowed":"pointer",textAlign:"left",border:"2px solid",borderColor:activeTag===tag?"#4CAF50":"#e8eaf0",background:activeTag===tag?"#f0fdf4":"white",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",opacity:count<2?0.5:1,transition:"all 0.2s"}}>
                        <div style={{fontSize:22,marginBottom:6}}>🗂️</div>
                        <div style={{fontSize:14,fontWeight:700,color:"#2e7d32"}}>{tag}</div>
                        <div style={{fontSize:11,color:"#9ca3af",marginTop:3}}>{count} note{count!==1?"s":""}{count<2?" (need 2+)":""}</div>
                      </button>
                    );
                  })}
                </div>
              )}
              {loading&&<Loader msg="Synthesising your knowledge cluster..."/>}
              {output&&!loading&&<OutputCard output={output} onCopy={()=>navigator.clipboard.writeText(output)} onSave={()=>saveItem({type:"cluster",label:`Cluster: ${activeTag}`,text:output})} label={`Knowledge Cluster · ${activeTag}`}/>}
            </div>
          )}

          {/* ─ SAVED ─ */}
          {mode==="saved" && (
            <div>
              <div style={{background:"white",borderRadius:14,padding:"13px 16px",marginBottom:14,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:11,color:"#9ca3af",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase"}}>Saved Items — persists across sessions · {saved.length} items</div>
              </div>
              {saved.length===0&&<Card><div style={{textAlign:"center",padding:"30px 0"}}><div style={{fontSize:32,marginBottom:10}}>🗂️</div><p style={{color:"#9ca3af",fontSize:14}}>Nothing saved yet.</p></div></Card>}
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {saved.map(s=>(
                  <div key={s.id} style={{background:"white",borderRadius:14,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8}}>
                      <div><span style={{fontSize:9.5,fontWeight:700,color:"#1565C0",textTransform:"uppercase",letterSpacing:"0.08em",background:"#e8f0fe",padding:"2px 7px",borderRadius:8,marginRight:7}}>{s.type}</span><span style={{fontSize:13,color:"#374151",fontWeight:500}}>{s.label}</span></div>
                      <div style={{display:"flex",gap:4,flexShrink:0}}>
                        <button onClick={()=>navigator.clipboard.writeText(s.text)} style={{padding:"3px 9px",borderRadius:6,cursor:"pointer",background:"#f5f5f5",border:"none",color:"#6b7280",fontSize:11}}>Copy</button>
                        <button onClick={()=>{const u=saved.filter(x=>x.id!==s.id);setSaved(u);ps("mat-saved",u);}} style={{padding:"3px 9px",borderRadius:6,cursor:"pointer",background:"#fff0f0",border:"none",color:"#e53935",fontSize:11}}>✕</button>
                      </div>
                    </div>
                    <div style={{fontSize:13,lineHeight:1.7,color:"#6b7280",whiteSpace:"pre-wrap",maxHeight:160,overflowY:"auto"}}><RichText text={s.text.slice(0,450)}/>{s.text.length>450?"…":""}</div>
                    <div style={{fontSize:9.5,color:"#d1d5db",marginTop:7}}>{s.ts}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─ SIDEBAR ─ */}
        <div>
          <button onClick={()=>setShowAddLeader(true)} style={{width:"100%",padding:"9px 13px",marginBottom:11,borderRadius:12,cursor:"pointer",background:"white",border:"2px dashed #cbd5e1",color:"#64748b",fontFamily:"'DM Sans', sans-serif",fontSize:13,fontWeight:500,transition:"all 0.18s",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#1565C0";e.currentTarget.style.color="#1565C0";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#cbd5e1";e.currentTarget.style.color="#64748b";}}>+ Add a Mind</button>

          {(mode==="insight"||mode==="meeting")&&<div style={{fontSize:10,fontWeight:700,color:"#9ca3af",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7,paddingLeft:2}}>Select for insights</div>}
          {(mode==="brain"||mode==="research"||mode==="synthesis"||mode==="cluster")&&(
            <div style={{background:"#e8f0fe",borderRadius:12,padding:"13px 13px",marginBottom:12,border:"1px solid #c5d8fb"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#1565C0",marginBottom:5}}>🧠 Second Brain</div>
              <div style={{fontSize:11,color:"#3a5f9a",lineHeight:1.7}}>Notes: <strong>{notes.length}</strong><br/>Tags: <strong>{allTags.length}</strong><br/>Saved: <strong>{saved.length}</strong></div>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {leaders.map(l=>{
              const sel=selectedLeaders.includes(l.id);
              return (
                <div key={l.id} style={{display:"flex"}}>
                  <button onClick={()=>mode==="chat"?startChat(l.id):toggleLeader(l.id)} style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"8px 9px",borderRadius:l.custom?"10px 0 0 10px":"10px",cursor:"pointer",transition:"all 0.15s",background:sel&&(mode==="insight"||mode==="meeting")?`${l.color||"#2196F3"}12`:"white",border:sel&&(mode==="insight"||mode==="meeting")?`2px solid ${l.color||"#2196F3"}60`:"2px solid #f0f2f5",borderRight:l.custom?"none":undefined,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",textAlign:"left"}}>
                    <span style={{fontSize:14,lineHeight:1,flexShrink:0}}>{l.avatar}</span>
                    <div style={{overflow:"hidden",flex:1}}>
                      <div style={{fontFamily:"'Playfair Display', serif",fontSize:12.5,fontWeight:700,color:"#1a1a2e",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{l.name}</div>
                      <div style={{fontSize:9,color:l.color||"#2196F3",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase"}}>{l.domain}</div>
                    </div>
                    {sel&&(mode==="insight"||mode==="meeting")&&<div style={{width:7,height:7,borderRadius:"50%",background:l.color||"#2196F3",flexShrink:0}}/>}
                  </button>
                  {l.custom&&<button onClick={()=>deleteLeader(l.id)} style={{padding:"8px 8px",borderRadius:"0 10px 10px 0",cursor:"pointer",background:"white",border:"2px solid #f0f2f5",borderLeft:"none",color:"#d1d5db",fontSize:10,transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.color="#e53935";e.currentTarget.style.background="#fff0f0";}}
                    onMouseLeave={e=>{e.currentTarget.style.color="#d1d5db";e.currentTarget.style.background="white";}}
                  >✕</button>}
                </div>
              );
            })}
          </div>

          {mode==="speech"&&<div style={{marginTop:14,background:"#e8f0fe",borderRadius:12,padding:"13px 13px",border:"1px solid #c5d8fb"}}><div style={{fontSize:11,fontWeight:700,color:"#1565C0",marginBottom:5}}>🎙️ Speech Studio</div><div style={{fontSize:11,color:"#3a5f9a",lineHeight:1.6}}>Draws on Drucker, Christensen, Harari, Sen, Taleb and others automatically.</div></div>}
        </div>
      </div>

      {/* ADD LEADER MODAL */}
      {showAddLeader&&(
        <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)setShowAddLeader(false);}}>
          <div style={{background:"white",borderRadius:20,padding:"28px 26px",width:"100%",maxWidth:450,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
              <svg viewBox="0 0 32 32" width="24" height="24"><path d="M4 28 A24 24 0 0 1 28 28" fill="none" stroke="#FB8C00" strokeWidth="3.5" strokeLinecap="round"/><path d="M8 28 A18 18 0 0 1 24 28" fill="none" stroke="#E53935" strokeWidth="3.5" strokeLinecap="round"/><path d="M13 28 A11 11 0 0 1 19 28" fill="none" stroke="#43A047" strokeWidth="3.5" strokeLinecap="round"/><circle cx="16" cy="28" r="2.5" fill="#1565C0"/></svg>
              <h2 style={{fontFamily:"'Playfair Display', serif",fontSize:19,fontWeight:700,color:"#1a1a2e",margin:0}}>Add a Mind</h2>
            </div>
            <p style={{color:"#9ca3af",fontSize:12,marginBottom:20}}>Any historical figure, executive, philosopher, or mentor.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><Label>Name *</Label><input value={newLeader.name} onChange={e=>setNewLeader(p=>({...p,name:e.target.value}))} placeholder="e.g. Nelson Mandela" style={IS} onFocus={foc} onBlur={blu}/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                <div><Label>Era</Label><input value={newLeader.era} onChange={e=>setNewLeader(p=>({...p,era:e.target.value}))} placeholder="e.g. 1918–2013" style={IS} onFocus={foc} onBlur={blu}/></div>
                <div><Label>Domain</Label><input value={newLeader.domain} onChange={e=>setNewLeader(p=>({...p,domain:e.target.value}))} placeholder="e.g. Justice" style={IS} onFocus={foc} onBlur={blu}/></div>
              </div>
              <div><Label>Avatar & Colour</Label><div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>{EMOJIS.map(e=><button key={e} onClick={()=>setNewLeader(p=>({...p,avatar:e}))} style={{width:32,height:32,fontSize:16,borderRadius:7,cursor:"pointer",border:"2px solid",borderColor:newLeader.avatar===e?"#1565C0":"#e8eaf0",background:newLeader.avatar===e?"#e8f0fe":"#f9fafb"}}>{e}</button>)}</div><div style={{display:"flex",gap:5}}>{COLORS.map(c=><button key={c} onClick={()=>setNewLeader(p=>({...p,color:c}))} style={{width:22,height:22,borderRadius:"50%",cursor:"pointer",background:c,border:newLeader.color===c?"3px solid #1a1a2e":"3px solid transparent"}}/>)}</div></div>
              <div><Label>Communication Style</Label><textarea value={newLeader.style} onChange={e=>setNewLeader(p=>({...p,style:e.target.value}))} placeholder="How do they talk? e.g. Calm, data-driven, storyteller..." rows={2} style={IS} onFocus={foc} onBlur={blu}/></div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:7,marginTop:20}}>
              <button onClick={()=>setShowAddLeader(false)} style={{padding:"8px 18px",borderRadius:10,cursor:"pointer",background:"#f5f5f5",border:"none",color:"#6b7280",fontFamily:"'DM Sans', sans-serif",fontSize:13}}>Cancel</button>
              <button onClick={addLeader} disabled={!newLeader.name.trim()} style={{padding:"8px 22px",borderRadius:10,border:"none",cursor:"pointer",background:"linear-gradient(135deg, #1565C0, #0D47A1)",color:"white",fontFamily:"'DM Sans', sans-serif",fontWeight:600,fontSize:13,opacity:!newLeader.name.trim()?0.4:1}}>Add Mind</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(-5px);opacity:1}}
        *{box-sizing:border-box;}
        textarea::placeholder,input::placeholder{color:#c0c8d8;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px;}
      `}</style>
    </div>
  );
}
