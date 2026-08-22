"use client";

import { FormEvent, useMemo, useState } from "react";

const channels = ["YouTube", "Instagram", "LinkedIn", "Substack", "Medium", "Telegram"];
const formats = ["Short video", "Long-form video", "Blog post", "Carousel"];

const capabilities = [
  ["01", "Find the right idea", "Daily opportunity intelligence combines trends, audience signals, evergreen gaps, and your own knowledge."],
  ["02", "Create like a human", "Zyvoriq directs story, voice, emotion, visuals, pacing, typography, body language, and cultural context as one system."],
  ["03", "Assure before publish", "Fact, originality, visual, voice, brand, rights, and platform-quality checks run before content reaches your audience."],
  ["04", "Publish everywhere", "One master story becomes native versions for each channel instead of copy-paste cross-posting."],
  ["05", "Learn what works", "Performance becomes feedback. Zyvoriq updates your taste, format, timing, and opportunity model continuously."],
  ["06", "Stay in control", "Choose manual, approval, or autopilot modes with identity, topic, channel, and risk boundaries."],
];

const demoIdeas: Record<string, string[]> = {
  "Thought leader": ["A contrarian take on AI agents", "A 60-second architecture explainer", "A research-backed carousel"],
  Founder: ["Turn product release notes into a launch campaign", "Create founder-led customer education", "Build a weekly category POV"],
  Student: ["Learn cloud by solving a real incident", "Practice a job interview with roleplay", "Turn a topic into a visual lesson"],
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState("Thought leader");
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const suggestions = useMemo(() => demoIdeas[mode], [mode]);

  function runDemo(e?: FormEvent) {
    e?.preventDefault();
    if (!prompt.trim()) setPrompt(suggestions[0]);
    setSubmitted(true);
  }

  return (
    <main>
      <header className="nav-shell">
        <a className="brand" href="#top" aria-label="Zyvoriq home"><span className="brand-mark">Z</span><span>Zyvoriq</span></a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Primary navigation">
          <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
          <a href="#quality" onClick={() => setMenuOpen(false)}>Quality</a>
          <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#use-cases" onClick={() => setMenuOpen(false)}>Use cases</a>
        </nav>
        <div className="nav-actions">
          <a className="text-link" href="#waitlist">Join early access</a>
          <a className="button compact" href="#demo">Try the demo</a>
          <button className="menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="orb orb-one" /><div className="orb orb-two" />
        <div className="eyebrow"><span className="live-dot" /> Autonomous idea-to-impact intelligence</div>
        <h1>Turn what you know into content <span>people actually care about.</span></h1>
        <p className="hero-copy">Zyvoriq discovers what matters, creates premium humanized content, adapts it for every channel, validates quality, publishes, and learns what works.</p>
        <div className="hero-actions"><a className="button" href="#demo">Create from an idea</a><a className="ghost-button" href="#workflow">See the system <span>→</span></a></div>

        <div className="command-card" id="demo">
          <div className="command-top">
            <div><span className="tiny-label">ZYVORIQ DIRECTOR</span><h2>What do you want to achieve?</h2></div>
            <div className="status-pill"><span /> Context ready</div>
          </div>
          <div className="mode-tabs" role="tablist" aria-label="Demo persona">
            {Object.keys(demoIdeas).map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => { setMode(item); setSubmitted(false); }}>{item}</button>)}
          </div>
          <form onSubmit={runDemo}>
            <textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); setSubmitted(false); }} placeholder={suggestions[0]} aria-label="Creation goal" />
            <div className="composer-footer">
              <div className="attachment-row"><button type="button" title="Attach source">＋</button><span>URL</span><span>PDF</span><span>Video</span><span>Voice note</span></div>
              <button className="send-button" type="submit">Build plan <span>↗</span></button>
            </div>
          </form>
          {submitted && <div className="plan-panel" aria-live="polite"><div className="plan-head"><span>Production plan</span><strong>Ready</strong></div><p>“{prompt || suggestions[0]}”</p><div className="plan-grid"><div><strong>1</strong><span>Master story</span></div><div><strong>6</strong><span>Channel variants</span></div><div><strong>3</strong><span>Quality gates</span></div><div><strong>1</strong><span>Learning loop</span></div></div></div>}
        </div>
        <div className="channel-strip" aria-label="Supported content destinations"><span>ONE IDEA →</span>{channels.map((c) => <span key={c}>{c}</span>)}</div>
      </section>

      <section className="section" id="product">
        <div className="section-label">THE PRODUCT</div>
        <div className="split-heading"><h2>Not another AI content generator.</h2><p>Zyvoriq starts before creation and keeps working after publication. The product is a closed learning loop built around your identity, knowledge, audience, and goals.</p></div>
        <div className="capability-grid">{capabilities.map(([n, title, body]) => <article className="capability-card" key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="dark-section" id="workflow">
        <div className="section-label light">ONE LIVING SYSTEM</div>
        <div className="split-heading light"><h2>From idea to impact, without tool-hopping.</h2><p>Every stage is connected, so facts, persona, creative decisions, publishing results, and audience response improve the next cycle.</p></div>
        <div className="flowline">{["Discover", "Understand", "Create", "Assure", "Publish", "Learn"].map((x, i) => <div className="flow-step" key={x}><span>0{i + 1}</span><strong>{x}</strong>{i < 5 && <i>→</i>}</div>)}</div>
        <div className="director-visual">
          <div className="brain-card"><span className="tiny-label">YOUR CONTEXT</span><h3>Persona + Knowledge + Taste + Audience</h3><div className="signal-bars"><i style={{width:"92%"}}/><i style={{width:"78%"}}/><i style={{width:"86%"}}/></div></div>
          <div className="pulse-node"><span>ZY</span></div>
          <div className="output-stack">{formats.map((x,i)=><div key={x}><span>{x}</span><b>{96-i}%</b></div>)}</div>
        </div>
      </section>

      <section className="section quality" id="quality">
        <div className="section-label">QUALITY BEFORE QUANTITY</div>
        <div className="quality-layout">
          <div><h2>If it feels like AI slop, it doesn't ship.</h2><p>Zyvoriq separates generation from judgment. Independent evaluators check substance, factuality, visual craft, identity consistency, humanization, originality, rights, and channel fit—then selectively repair weak output.</p><ul className="check-list"><li>Master-story gate before format multiplication</li><li>Claim-level evidence and freshness checks</li><li>Visual, motion, typography and identity QA</li><li>Voice, emotion and performance consistency</li><li>Originality and audience-fatigue protection</li></ul></div>
          <div className="score-card"><div className="score-head"><span>Publish confidence</span><strong>96.8</strong></div>{[["Substance",98],["Accuracy",99],["Originality",94],["Visual quality",97],["Humanization",96],["Platform fit",97]].map(([label,value])=><div className="score-row" key={String(label)}><span>{label}</span><div><i style={{width:`${value}%`}}/></div><b>{value}</b></div>)}<div className="ready-badge">✓ Ready to publish</div></div>
        </div>
      </section>

      <section className="use-cases" id="use-cases">
        <div className="section-label">BUILT FOR REAL PEOPLE</div><h2>One intelligence. Different outcomes.</h2>
        <div className="use-grid">{[["Creators", "One idea → complete multi-channel campaign."],["Technical experts", "Repo, architecture or insight → authoritative thought leadership."],["Students", "Learn by doing through adaptive practice and roleplay."],["Teams", "Create on-brand content with approvals, provenance and quality gates."]].map(([title,body],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{body}</p><a href="#demo">Try this path →</a></article>)}</div>
      </section>

      <section className="closing" id="waitlist">
        <div><span className="section-label light">EARLY ACCESS</span><h2>What would you create if the production work disappeared?</h2><p>Join the first group shaping Zyvoriq.</p></div>
        <form className="waitlist" onSubmit={(e)=>{e.preventDefault(); if(email.includes("@")) setJoined(true);}}>{joined ? <div className="joined">✓ You're on the early-access list.</div> : <><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email address"/><button type="submit">Join early access</button></>}</form>
      </section>

      <footer><a className="brand" href="#top"><span className="brand-mark">Z</span><span>Zyvoriq</span></a><p>AI that turns ideas into impact.</p><div><a href="#product">Product</a><a href="#quality">Quality</a><a href="#waitlist">Early access</a></div><span>© 2026 Zyvoriq</span></footer>
    </main>
  );
}
