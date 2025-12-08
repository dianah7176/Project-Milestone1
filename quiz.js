// Run once on load to set up handlers and the answer key
(function(){
  // Grab the form and results panel
  const form = document.getElementById('quiz');
  const results = document.getElementById('results');
  const resetBtn = document.getElementById('resetBtn');

  // Define correct answers for each question
  const key = {
    q1: (v) => (v || '').trim().toLowerCase() === 'quic',
    q2: '1.1',
    q3: 'quic',
    q4: '2',
    q5: new Set(['conf','integ','auth'])
  };

  // Assign point values
  const pts = { q1:20, q2:20, q3:20, q4:20, q5:20 };

  // Check multi-select by exact set match
  function gradeMulti(selected, correctSet){
    if(selected.length === 0) return false;
    const s = new Set(selected);
    if(s.size !== correctSet.size) return false;
    for(const v of s){ if(!correctSet.has(v)) return false; }
    return true;
  }

  // Score the quiz and show feedback without leaving the page
  form.addEventListener('submit', function(e){
    e.preventDefault();

    // Read user answers
    const a1 = document.getElementById('q1').value;
    const a2 = (form.querySelector('input[name="q2"]:checked') || {}).value || '';
    const a3 = (form.querySelector('input[name="q3"]:checked') || {}).value || '';
    const a4 = (form.querySelector('input[name="q4"]:checked') || {}).value || '';
    const a5 = Array.from(form.querySelectorAll('input[name="q5"]:checked')).map(el => el.value);

    // Score answers and collect per-question details
    let total = 0;
    const details = [];

    const c1 = key.q1(a1); if(c1) total += pts.q1;
    details.push({ q:'Q1', ok:c1, your:a1 || '(blank)', ans:'QUIC', note:'HTTP/3 runs over QUIC (UDP).' });

    const c2 = (a2 === key.q2); if(c2) total += pts.q2;
    details.push({ q:'Q2', ok:c2, your:a2 ? 'HTTP/'+a2 : '(blank)', ans:'HTTP/1.1', note:'HTTP/1.1 introduced persistent connections.' });

    const c3 = (a3 === key.q3); if(c3) total += pts.q3;
    details.push({ q:'Q3', ok:c3, your:a3 || '(blank)', ans:'QUIC', note:'QUIC removes TCP head-of-line blocking.' });

    const c4 = (a4 === key.q4); if(c4) total += pts.q4;
    details.push({ q:'Q4', ok:c4, your:a4 ? (a4==='2' ? 'HTTP/2' : a4==='3' ? 'HTTP/3' : 'HTTP/'+a4) : '(blank)', ans:'HTTP/2', note:'HTTP/2 adds multiplexing and header compression.' });

    const c5 = gradeMulti(a5, key.q5); if(c5) total += pts.q5;
    details.push({ q:'Q5', ok:c5, your:a5.length ? a5.join(', ') : '(none)', ans:'Confidentiality, Integrity, Authentication', note:'HTTPS/TLS provides these properties.' });

    // Decide pass or fail using a 70-point threshold
    const passed = total >= 70;

    // Render the total and the per-question feedback
    results.style.display = 'block';
    results.innerHTML = `
      <div class="scoreline ${passed ? 'pass':'fail'}">${passed ? 'PASS' : 'FAIL'} — Score: ${total}/100</div>
      ${details.map(d => `
        <div class="perq">
          <div><strong>${d.q}</strong> — <span class="${d.ok ? 'ok':'bad'}">${d.ok ? 'Correct' : 'Incorrect'}</span></div>
          <div>Your answer: ${d.your}</div>
          ${d.ok ? '' : `<div>Correct answer: <strong>${d.ans}</strong></div>`}
          <div class="hint">${d.note}</div>
        </div>
      `).join('')}
    `;

    // Move focus to the results for quick review
    results.scrollIntoView({ behavior:'smooth', block:'start' });
  });

  // Clear inputs and results so users can retake the quiz
  resetBtn.addEventListener('click', function(){
    form.reset();
    results.style.display = 'none';
    results.innerHTML = '';
  });
})();
