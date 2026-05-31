// scanner.js

document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scan-btn');
  const inputEl = document.getElementById('scanner-input');
  const resultsSection = document.getElementById('scanner-results');
  const outputEl = document.getElementById('scanner-output');
  const scoreValue = document.getElementById('score-value');
  const scoreBar = document.getElementById('score-bar');
  const scoreCard = document.querySelector('.score-card');
  const issuesCount = document.getElementById('issues-count');
  const issuesBreakdown = document.getElementById('issues-breakdown');
  const reportWrap = document.getElementById('analysis-report');
  
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  let currentFileType = 'text';

  const heuristics = [
    // True Blue Human Indicators (Negative Weight = Reduces AI Score)
    { regex: /\b(yeah nah|nah yeah)\b/gi, reason: "Aussie logic gate detected. 100% human.", type: 'human', weight: -20 },
    { regex: /\b(mate|fair dinkum|strewth|crikey)\b/gi, reason: "True blue Aussie vernacular.", type: 'human', weight: -15 },
    { regex: /\/\/\s*todo:\s*fix\s*(this\s*)?(shit|crap|junk)/gi, reason: "Frustrated dev comment. AI is never this honest.", type: 'human', weight: -30 },
    { regex: /console\.log\(['"](here|test|wtf|plz work|fml)['"]\)/gi, reason: "Desperation logging. A classic human trait.", type: 'human', weight: -30 },
    { regex: /\b(chuck|whack|bung)\b/gi, reason: "Casual placement verbs, very human.", type: 'human', weight: -10 },

    // The Roasts (ChatGPT Giveaways)
    { 
      regex: /\b(delve)\b/gi, 
      reason: "Mate, nobody has used the word 'delve' since 1842.", 
      type: 'vocab', weight: 20,
      alternatives: { au: 'have a squiz at', us: 'look into', uk: 'look into', global: 'explore' }
    },
    { 
      regex: /\b(tapestry)\b/gi, 
      reason: "A rich tapestry? What are you, Shakespeare?", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'a whole bunch of stuff', us: 'a collection', uk: 'a mixture', global: 'a complex mix' }
    },
    { 
      regex: /\b(testament to)\b/gi, 
      reason: "Sounds like a eulogy, not a dev doc. Classic AI.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'goes to show', us: 'proves', uk: 'shows', global: 'demonstrates' }
    },
    { 
      regex: /\b(in conclusion)\b/gi, 
      reason: "Did you just finish a year 9 English essay?", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'at the end of the day', us: 'to wrap up', uk: 'to sum up', global: 'finally' }
    },
    { 
      regex: /\b(it is important to note)\b/gi, 
      reason: "The ultimate AI filler phrase. Zero value.", 
      type: 'vocab', weight: 20,
      alternatives: { au: 'keep in mind', us: 'note that', uk: 'worth noting', global: 'remember that' }
    },
    { 
      regex: /\b(crucial)\b/gi, 
      reason: "Overused AI adjective.", 
      type: 'vocab', weight: 5,
      alternatives: { au: 'bloody important', us: 'important', uk: 'key', global: 'essential' }
    },
    { 
      regex: /\b(underscore)\b/gi, 
      reason: "Stop trying to sound smart. It's AI.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'highlight', us: 'emphasize', uk: 'highlight', global: 'highlight' }
    },
    { 
      regex: /\b(multifaceted)\b/gi, 
      reason: "You mean 'complicated'? Just say that.", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'a bit of a mess', us: 'complex', uk: 'complex', global: 'complex' }
    },
    { 
      regex: /\b(foster)\b/gi, 
      reason: "Unless you're talking about the beer, this is ChatGPT.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'build up', us: 'encourage', uk: 'promote', global: 'encourage' }
    },
    { 
      regex: /\b(navigating the complexities)\b/gi, 
      reason: "Total wank word salad. Absolute AI.", 
      type: 'vocab', weight: 20,
      alternatives: { au: 'dealing with the bullshit', us: 'handling the tough parts', uk: 'managing the difficulties', global: 'dealing with issues' }
    },
    { 
      regex: /\b(ultimately,)\b/gi, 
      reason: "Lazy concluding transition.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'at the end of the day,', us: 'in the end,', uk: 'in the end,', global: 'finally,' }
    },
    { 
      regex: /\b(not only.*?but also)\b/gi, 
      reason: "Formulaic rhetorical rubbish.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'both [x] and [y]', us: 'both [x] and [y]', uk: 'both [x] and [y]', global: 'both [x] and [y]' }
    },
    { 
      regex: /\b(landscape)\b/gi, 
      reason: "'In today's digital landscape...' 🤮 Pure corporate AI slop.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'scene', us: 'environment', uk: 'environment', global: 'world' }
    },
    { 
      regex: /\b(seamless\w*)\b/gi, 
      reason: "Nothing is 'seamless'. AI loves this lie.", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'smooth', us: 'smooth', uk: 'smooth', global: 'smooth' }
    },
    { 
      regex: /\b(leverage)\b/gi, 
      reason: "Unless you're using a crowbar, stop saying 'leverage'.", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'use', us: 'use', uk: 'use', global: 'use' }
    },
    { 
      regex: /\b(demystify)\b/gi, 
      reason: "It's code, not magic. Stop trying to 'demystify' it.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'explain', us: 'explain', uk: 'clear up', global: 'explain' }
    },
    { 
      regex: /\b(comprehensive)\b/gi, 
      reason: "AI thinks every list it makes is 'comprehensive'.", 
      type: 'vocab', weight: 5,
      alternatives: { au: 'full', us: 'complete', uk: 'thorough', global: 'detailed' }
    },
    { 
      regex: /\b(unleash)\b/gi, 
      reason: "'Unleash the power...' Okay, Thanos. Definitely a robot.", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'let loose', us: 'release', uk: 'release', global: 'use' }
    },
    { 
      regex: /\b(robust)\b/gi, 
      reason: "Every AI thinks its code is 'robust'. It never is.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'solid', us: 'solid', uk: 'reliable', global: 'strong' }
    },
    { 
      regex: /\b(transformative)\b/gi, 
      reason: "Hyperbolic AI buzzword.", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'game-changing', us: 'major', uk: 'major', global: 'significant' }
    },
    { 
      regex: /\b(paramount)\b/gi, 
      reason: "It's not a mountain, it's just important.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'top priority', us: 'vital', uk: 'crucial', global: 'very important' }
    },
    { 
      regex: /\b(embark)\b/gi, 
      reason: "Are we getting on a ship? No, we're writing code.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'kick off', us: 'start', uk: 'begin', global: 'start' }
    },
    { 
      regex: /\b(supercharge)\b/gi, 
      reason: "AI marketing speak for 'make it slightly better'.", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'beef up', us: 'boost', uk: 'improve', global: 'enhance' }
    },
    { 
      regex: /\b(dive in)\b/gi, 
      reason: "ChatGPT loves to 'dive in' to topics.", 
      type: 'vocab', weight: 15,
      alternatives: { au: 'get stuck in', us: 'get started', uk: 'begin', global: 'start' }
    },
    { 
      regex: /\b(moreover)\b/gi, 
      reason: "Nobody says 'moreover' in real life.", 
      type: 'vocab', weight: 10,
      alternatives: { au: 'plus', us: 'also', uk: 'furthermore', global: 'additionally' }
    },

    // AI Formatting/Structure
    { 
      regex: /:\s*\n\s*(1\.|-|\*)\s/g, 
      reason: "The classic 'Here are 3 things:' list setup. ChatGPT's favorite format.", 
      type: 'vocab', weight: 20,
      alternatives: { au: '(Just write a normal paragraph mate)', us: '(Consider writing without a bulleted list)', uk: '(Try a more organic structure)', global: '(Avoid overly structured lists)' }
    },
    
    // AI Apologies & Meta-text
    { 
      regex: /(as an ai language model)/gi, 
      reason: "Dead giveaway. Straight to the bin.", 
      type: 'apology', weight: 100,
      alternatives: { au: '(Delete this garbage)', us: '(Remove AI disclaimer)', uk: '(Remove AI disclaimer)', global: '(Remove this phrase entirely)' }
    },
    { 
      regex: /(i apologize)/gi, 
      reason: "AI begging for forgiveness.", 
      type: 'apology', weight: 20,
      alternatives: { au: 'sorry mate', us: 'sorry', uk: 'sorry about that', global: 'sorry' }
    },
    { 
      regex: /(sure, i can help with that)/gi, 
      reason: "Classic robot obedience.", 
      type: 'apology', weight: 40,
      alternatives: { au: 'no worries, I gotcha', us: 'sure thing', uk: 'of course', global: 'yes' }
    },
    { 
      regex: /(certainly!)/gi, 
      reason: "Too enthusiastic. Definitely a bot.", 
      type: 'apology', weight: 15,
      alternatives: { au: 'too easy', us: 'sure', uk: 'absolutely', global: 'yes' }
    },
    
    // Code Artifacts
    { 
      regex: /(here is the updated code)/gi, 
      reason: "Forgot to delete the AI's chat text, didn't you?", 
      type: 'code_artifact', weight: 50,
      alternatives: { au: '(Just delete it, mate)', us: '(Remove conversational text)', uk: '(Remove chat text)', global: '(Delete this)' }
    },
    { 
      regex: /(```[a-z]*\n)/gi, 
      reason: "Leftover markdown formatting in a raw file. Busted.", 
      type: 'code_artifact', weight: 30,
      alternatives: { au: '(Strip out the markdown)', us: '(Remove markdown)', uk: '(Remove markdown)', global: '(Remove markdown)' }
    },
    { 
      regex: /(```)/g, 
      reason: "Leftover markdown block. Vibe coding exposed.", 
      type: 'code_artifact', weight: 30,
      alternatives: { au: '(Delete the backticks)', us: '(Remove markdown ticks)', uk: '(Remove markdown ticks)', global: '(Remove markdown)' }
    },
    { 
      regex: /(\/\/ \.\.\. existing code \.\.\.)/gi, 
      reason: "The AI got lazy and skipped the rest of the code.", 
      type: 'code_artifact', weight: 50,
      alternatives: { au: '(Write the actual code you lazy bugger)', us: '(Implement the missing code)', uk: '(Fill in the missing code)', global: '(Write the full code)' }
    },
    { 
      regex: /(<!-- \.\.\. existing code \.\.\. -->)/gi, 
      reason: "Lazy AI HTML truncation.", 
      type: 'code_artifact', weight: 50,
      alternatives: { au: '(Put the HTML back)', us: '(Restore HTML)', uk: '(Restore HTML)', global: '(Restore full HTML)' }
    },
    { 
      regex: /(\/\/ Your code here)/gi, 
      reason: "AI left you a placeholder.", 
      type: 'code_artifact', weight: 20,
      alternatives: { au: '(Actually do the work)', us: '(Implement logic here)', uk: '(Add your logic)', global: '(Implement functionality)' }
    },
    { 
      regex: /\/\/\s*This is a helper function/gi, 
      reason: "Over-explaining obvious code. AI classic.", 
      type: 'code_artifact', weight: 15,
      alternatives: { au: '(We know, delete the comment)', us: '(Remove redundant comment)', uk: '(Remove redundant comment)', global: '(Delete comment)' }
    }
  ];

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    if (file.size > 5 * 1024 * 1024) return showToast("Hold up mate, that file is too large. Keep it under 5MB.", "error");
    
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return showToast("Crikey! You uploaded a binary file. Since we run 100% offline, we can't parse PDFs or Word Docs yet. Just copy and paste the text instead, mate.", "error");
    }
    
    const codeExtensions = ['.js', '.py', '.html', '.css', '.ts', '.jsx', '.tsx', '.json', '.java', '.c', '.cpp', '.php', '.rb', '.go'];
    currentFileType = codeExtensions.some(ext => file.name.toLowerCase().endsWith(ext)) ? 'code' : 'text';

    const reader = new FileReader();
    reader.onload = (e) => {
      inputEl.value = e.target.result;
      dropzone.querySelector('p').innerHTML = `Loaded: <span class="accent">${file.name}</span>`;
    };
    reader.readAsText(file);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({'&': '&amp;','<': '&lt;','>': '&gt;',"'": '&#39;','"': '&quot;'}[tag] || tag));
  }

  async function queryHuggingFaceAPI(text, retries = 1) {
    const API_URL = "https://api-inference.huggingface.co/models/Hello-SimpleAI/chatgpt-detector-roberta";
    const payload = { inputs: text.substring(0, 2000) };

    for (let i = 0; i < retries; i++) {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.error && result.estimated_time) {
        scanBtn.textContent = `[ WAKING UP ML SERVER... ]`;
        await new Promise(r => setTimeout(r, 4000));
        continue;
      }
      return result;
    }
    throw new Error("Model timeout");
  }

  function detectPayloadType(text) {
    if (dropzone.querySelector('p').innerText.includes("Loaded:")) {
      return currentFileType; 
    }
    if (text.match(/function |const |let |var |=>|def |class |import |export |public |private /)) {
      return 'code';
    }
    return 'text';
  }

  // --- MATHEMATICAL NLP ENGINES ---

  function calculateBurstiness(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (!sentences || sentences.length < 4) return { scoreModifier: 0, reason: null };

    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    if (cv < 0.25) {
      return { scoreModifier: 20, reason: "Low Burstiness: Sentences are perfectly uniform in length (Highly Robotic)." };
    } else if (cv > 0.60) {
      return { scoreModifier: -20, reason: "High Burstiness: Erratic variation in sentence length (Very Human)." };
    }
    return { scoreModifier: 0, reason: null };
  }

  function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  function calculateFleschKincaid(text) {
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    if (words.length < 20 || sentences.length === 0) return { scoreModifier: 0, reason: null };

    const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
    const gradeLevel = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59;
    
    // ChatGPT default output clusters tightly between Grade 11.0 and 14.0
    if (gradeLevel >= 11.0 && gradeLevel <= 14.0) {
      return { scoreModifier: 15, reason: `Robotic Density: Flesch-Kincaid Grade ${gradeLevel.toFixed(1)}. ChatGPT defaults to this exact density range.` };
    } else if (gradeLevel < 8 || gradeLevel > 16) {
      return { scoreModifier: -10, reason: `Human Density: Grade ${gradeLevel.toFixed(1)}. Structurally natural or highly specialized.` };
    }
    return { scoreModifier: 0, reason: null };
  }

  function calculateNGrams(text) {
    // Handle apostrophes so "that's" doesn't become "that" "s"
    const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];
    if (words.length < 30) return { scoreModifier: 0, reason: null };

    const trigrams = {};
    for (let i = 0; i < words.length - 2; i++) {
      const gram = `${words[i]} ${words[i+1]} ${words[i+2]}`;
      trigrams[gram] = (trigrams[gram] || 0) + 1;
    }

    let maxGram = "";
    let maxCount = 0;
    for (let gram in trigrams) {
      // Ignore trigrams where EVERY word is extremely short (e.g. "it is a", "that's a")
      const isTooGeneric = gram.split(' ').every(w => w.length <= 4);
      if (!isTooGeneric && trigrams[gram] > maxCount) {
        maxCount = trigrams[gram];
        maxGram = gram;
      }
    }

    if (maxCount >= 3) {
      return { scoreModifier: 15, reason: `N-Gram Loop: The phrase "${maxGram}" was repeated ${maxCount} times. AI models frequently loop phrase structures.` };
    }
    return { scoreModifier: 0, reason: null };
  }

  // --- MAIN EXECUTION ---

  scanBtn.addEventListener('click', async () => {
    const text = inputEl.value;
    if (!text.trim()) return showToast("Mate, you gotta paste something in first before we can scan it.", "error");

    currentFileType = detectPayloadType(text);

    scanBtn.textContent = "[ RUNNING THE PUB TEST... ]";
    scanBtn.classList.add('scanning');
    scanBtn.disabled = true;
    resultsSection.style.display = 'none';

    let aiProbability = null;
    let fallbackScore = 0;

    try {
      const mlResponse = await queryHuggingFaceAPI(text);
      if (Array.isArray(mlResponse) && mlResponse[0]) {
        const chatGptScore = mlResponse[0].find(r => r.label === 'ChatGPT' || r.label === 'Fake');
        if (chatGptScore) {
          aiProbability = chatGptScore.score * 100;
        } else {
          const humanScore = mlResponse[0].find(r => r.label === 'Human' || r.label === 'Real');
          if (humanScore) aiProbability = (1 - humanScore.score) * 100;
        }
      }
    } catch (err) {
      console.warn("ML API Blocked. Falling back to Aussie Heuristics.");
    }

    const dialect = document.getElementById('dialect-selector') ? document.getElementById('dialect-selector').value : 'global';
    let totalIssues = 0;
    let counts = { vocab: 0, apology: 0, code_artifact: 0, human: 0 };
    let foundFootprints = {}; 
    let highlightedText = escapeHTML(text);
    
    heuristics.forEach(h => {
      const matches = text.match(h.regex);
      if (matches) {
        fallbackScore += matches.length * h.weight;
        
        if (h.type !== 'human') {
          totalIssues += matches.length;
        }
        
        counts[h.type] += matches.length;
        const matchPhrase = matches[0].toLowerCase();
        
        let alternativeText = null;
        if (h.alternatives) {
           alternativeText = h.alternatives[dialect] || h.alternatives['global'];
        }

        if (!foundFootprints[matchPhrase]) {
          foundFootprints[matchPhrase] = { 
            count: 0, 
            reason: h.reason, 
            type: h.type,
            alternative: alternativeText 
          };
        }
        foundFootprints[matchPhrase].count += matches.length;

        highlightedText = highlightedText.replace(h.regex, (match) => {
           const markClass = h.type === 'human' ? 'human-mark' : '';
           let reasonText = h.reason;
           if (alternativeText) {
             reasonText += ` Try: '${alternativeText}'`;
           }
           return `<mark class="${markClass}" data-reason="${reasonText}">${match}</mark>`;
        });
      }
    });

    // Run Advanced NLP logic if it's text
    if (currentFileType === 'text') {
      const nlpResults = [
        calculateBurstiness(text),
        calculateFleschKincaid(text),
        calculateNGrams(text)
      ];

      nlpResults.forEach(res => {
        if (res.scoreModifier !== 0) {
          fallbackScore += res.scoreModifier;
          if (aiProbability !== null) {
             aiProbability += (res.scoreModifier * 0.4); 
          }
          
          const type = res.scoreModifier > 0 ? 'vocab' : 'human';
          if (type === 'human') counts.human++;
          else totalIssues++;

          foundFootprints[res.reason.split(':')[0]] = {
            count: 1,
            reason: res.reason.split(':')[1].trim(),
            type: type
          };
        }
      });
    }

    const calculatedScore = aiProbability !== null ? aiProbability : fallbackScore;
    
    // If we caught AI footprints, the score should never be an absolute 0%, even if human traits canceled it out.
    const hasAIFootprints = (counts.vocab > 0 || counts.apology > 0 || counts.code_artifact > 0 || foundFootprints['N-Gram Loop']);
    const minimumFloor = hasAIFootprints ? 5 : 0;
    
    const finalScore = Math.max(minimumFloor, Math.min(Math.round(calculatedScore), 100)); // Clamp between minimum and 100
    const usedFallback = aiProbability === null;

    scoreValue.textContent = finalScore + '%';
    scoreBar.style.width = finalScore + '%';
    
    scoreCard.classList.remove('safe', 'warning', 'danger');
    reportWrap.classList.remove('danger');

    if (finalScore < 20) {
      scoreCard.classList.add('safe');
      scoreBar.style.backgroundColor = '#10B981'; 
    } else if (finalScore < 60) {
      scoreCard.classList.add('warning');
      scoreBar.style.backgroundColor = '#f59e0b'; 
    } else {
      scoreCard.classList.add('danger');
      scoreBar.style.backgroundColor = '#ef4444'; 
      reportWrap.classList.add('danger');
    }

    issuesCount.textContent = totalIssues;
    issuesBreakdown.innerHTML = `
      <span>Corporate Buzzwords: <b>${counts.vocab}</b></span>
      <span>Bot Apologies: <b>${counts.apology}</b></span>
      <span>Vibe Coding Artifacts: <b>${counts.code_artifact}</b></span>
      <span style="color:#10B981;">Aussie/Human Traits: <b>${counts.human}</b></span>
    `;

    generateReportUI(foundFootprints, totalIssues, finalScore, currentFileType, usedFallback);
    outputEl.innerHTML = highlightedText || "No obvious bot footprints detected. Clean as a whistle.";

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    scanBtn.textContent = "[ RUN ANOTHER PUB TEST ]";
    scanBtn.classList.remove('scanning');
    scanBtn.disabled = false;
  });

  function generateReportUI(footprints, totalIssues, finalScore, fileType, usedFallback) {
    let reportHTML = '';

    let verdictIcon = finalScore > 70 ? '🤖' : (finalScore > 30 ? '👀' : '🍺');
    let verdictTitle = '';
    let verdictDesc = '';
    let verdictClass = finalScore > 70 ? 'danger' : '';

    if (finalScore > 70) {
      verdictTitle = 'Failed The Pub Test (Absolute ChatGPT Slop)';
      verdictDesc = fileType === 'code' 
        ? `Yeah, nah. This code is riddled with AI artifacts and lazy vibe-coding traits. Don't push this to prod.`
        : `Mate, nobody talks like this. It's completely littered with ChatGPT buzzwords. Straight to the bin.`;
    } else if (finalScore > 30) {
      verdictTitle = 'Lookin\' a bit sketchy mate...';
      verdictDesc = `There are a few corporate buzzwords or AI traits in here. Might want to give it a quick proofread.`;
    } else {
      verdictTitle = 'Passes The Pub Test (Fair Dinkum Human)';
      verdictDesc = `Looks totally clean. No obvious AI generated junk detected in this payload.`;
    }

    const engineBadge = usedFallback 
      ? `<span style="font-size:0.7rem; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin-left:10px;">Offline Pub Engine</span>`
      : `<span style="font-size:0.7rem; background:rgba(16,185,129,0.2); color:#10B981; padding:2px 6px; border-radius:4px; margin-left:10px;">Neural Network</span>`;

    reportHTML += `
      <div class="report-item">
        <div class="report-item-icon">${verdictIcon}</div>
        <div>
          <div class="report-item-title ${verdictClass}">${verdictTitle} ${engineBadge}</div>
          <div style="color: var(--text-dim);">${verdictDesc}</div>
        </div>
      </div>
    `;

    let redditReceiptText = `🚨 AI FOOTPRINT REPORT 🚨\nScore: ${finalScore}%\nVerdict: ${verdictTitle.replace(/<[^>]*>?/gm, '')}\n\nCaught in the act:\n`;

    if (Object.keys(footprints).length > 0) {
      reportHTML += `<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.1);"><div class="report-item-title" style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--text-muted);">THE ROAST REPORT</div>`;
      Object.keys(footprints).forEach(key => {
        const data = footprints[key];
        let icon = data.type === 'human' ? '🍺' : (data.type === 'vocab' ? '⚠️' : '🚨');
        let titleClass = data.type === 'human' ? 'safe' : (data.type === 'vocab' ? '' : 'danger');
        let titleText = data.type === 'human' ? `True Blue: "${key}"` : `Busted: "${key}" (Found ${data.count}x)`;
        
        let alternativeHTML = '';
        let alternativeTextForReceipt = '';
        if (data.alternative) {
          alternativeHTML = `<div style="margin-top: 0.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--brand-accent);">> Suggested alternative: <span style="color: #fff;">${data.alternative}</span></div>`;
          alternativeTextForReceipt = `\n  > Suggested alternative: ${data.alternative}`;
        }

        reportHTML += `
          <div class="report-item">
            <div class="report-item-icon">${icon}</div>
            <div>
              <div class="report-item-title ${titleClass}">${titleText}</div>
              <div style="color: var(--text-dim);">${data.reason}</div>
              ${alternativeHTML}
            </div>
          </div>
        `;
        redditReceiptText += `- "${key}": ${data.reason}${alternativeTextForReceipt}\n`;
      });
      reportHTML += `</div>`;
    }

    redditReceiptText += `\nScanned via riyostudio.dev/scanner`;

    // Add Copy Report Button
    reportHTML += `
      <div style="margin-top: 1.5rem; text-align: right;">
        <button id="copy-receipt-btn" class="cyber-submit-btn" style="background: rgba(16,185,129,0.1); border: 1px solid var(--accent); color: var(--accent); font-size: 0.85rem; padding: 8px 16px; width: auto; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy Full Report
        </button>
      </div>
    `;

    reportWrap.innerHTML = reportHTML;

    const copyBtn = document.getElementById('copy-receipt-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(redditReceiptText).then(() => {
          const origText = copyBtn.innerHTML;
          copyBtn.innerHTML = "Copied to Clipboard!";
          setTimeout(() => copyBtn.innerHTML = origText, 2000);
        });
      });
    }
  }
});
