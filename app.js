(() => {
  const $ = (selector) => document.querySelector(selector);
  const input = $('#problemInput');
  const examples = {
    vibration: {
      title: 'Free vibration response', legend: 'Displacement', xLabel: 'Time (s)', yLabel: 'Displacement (m)', color: '#77d9cf',
      summary: 'A damped oscillator returns toward equilibrium over time.', assumptions: 'This preview uses a linear, underdamped single-degree-of-freedom model with zero initial velocity. Confirm the parameters and model fit your real system.',
      metrics: [['Natural frequency', '5.00 rad/s'], ['Damping ratio', '0.10'], ['Peak response', '0.050 m']],
      x: range(0, 5, 101), compute: t => { const m=1,c=1,k=25,wn=Math.sqrt(k/m),z=c/(2*Math.sqrt(k*m)),wd=wn*Math.sqrt(1-z*z); return .05*Math.exp(-z*wn*t)*(Math.cos(wd*t)+(z/Math.sqrt(1-z*z))*Math.sin(wd*t)); },
      code: `%% Damped free vibration | MatEngine illustrative model\nm = 1.0;                 % mass (kg)\nc = 1.0;                 % viscous damping (N*s/m)\nk = 25.0;                % stiffness (N/m)\nx0 = 0.05;               % initial displacement (m)\nt = linspace(0, 5, 501); % time (s)\n\nwn = sqrt(k/m);\nzeta = c/(2*sqrt(k*m));\nwd = wn*sqrt(1-zeta^2);\nx = x0*exp(-zeta*wn*t) .* ...\n    (cos(wd*t) + zeta/sqrt(1-zeta^2)*sin(wd*t));\n\nplot(t, x, 'LineWidth', 1.8);\ngrid on; xlabel('Time (s)');\nylabel('Displacement (m)');\ntitle('Damped free vibration');`
    },
    beam: {
      title: 'Cantilever beam deflection', legend: 'Deflection', xLabel: 'Position along beam (m)', yLabel: 'Deflection (mm)', color: '#8eb8ff',
      summary: 'A uniformly distributed load bends a cantilever beam along its span.', assumptions: 'This preview assumes a prismatic, linearly elastic cantilever beam under a uniform static load. It excludes shear deformation and large-deflection effects.',
      metrics: [['Span', '2.00 m'], ['Load', '1.00 kN/m'], ['Tip deflection', '−1.25 mm']],
      x: range(0, 2, 101), compute: x => { const L=2,E=200e9,I=8e-6,q=1000; return -q*x*x*(6*L*L-4*L*x+x*x)/(24*E*I)*1000; },
      code: `%% Cantilever beam | Uniform distributed load\nE = 200e9;              % Young's modulus (Pa)\nI = 8e-6;               % second moment of area (m^4)\nL = 2.0;                % beam length (m)\nq = 1000;               % distributed load (N/m)\nx = linspace(0, L, 201);\n\n% Euler-Bernoulli beam, small-deflection model\ny = -q*x.^2.*(6*L^2 - 4*L*x + x.^2) ...\n    /(24*E*I);            % deflection (m)\n\nplot(x, 1000*y, 'LineWidth', 1.8);\ngrid on; xlabel('Position (m)');\nylabel('Deflection (mm)');\ntitle('Cantilever under uniform load');`
    },
    heat: {
      title: 'Lumped cooling response', legend: 'Temperature', xLabel: 'Time (s)', yLabel: 'Temperature (°C)', color: '#f2a879',
      summary: 'A warm component cools toward ambient temperature over time.', assumptions: 'This preview uses a lumped-capacitance model with uniform component temperature and constant convection. Check the Biot number before applying it to a real part.',
      metrics: [['Initial temp.', '90 °C'], ['Ambient temp.', '22 °C'], ['At 30 min', '42.5 °C']],
      x: range(0, 1800, 101), compute: t => 22+(90-22)*Math.exp(-t/1500),
      code: `%% Lumped-capacitance cooling model\nT0 = 90;                 % initial temperature (degC)\nTinf = 22;               % ambient temperature (degC)\nh = 65;                  % convection coefficient (W/m^2/K)\nA = 0.08;                % exposed area (m^2)\nrho = 7800;              % density (kg/m^3)\ncp = 500;                % specific heat (J/kg/K)\nV = 0.002;               % component volume (m^3)\nt = linspace(0, 1800, 301);\n\ntau = rho*cp*V/(h*A);\nT = Tinf + (T0-Tinf).*exp(-t/tau);\n\nplot(t/60, T, 'LineWidth', 1.8);\ngrid on; xlabel('Time (min)');\nylabel('Temperature (degC)');\ntitle('Lumped-capacitance cooling');`
    },
    calculus: {
      title: 'Definite integral of sin(x)', legend: 'sin(x)', xLabel: 'x (rad)', yLabel: 'sin(x)', color: '#ba9bff',
      summary: 'Visualize the area under sin(x) from 0 to π; the exact integral is 2.', assumptions: 'This preview shows the function and uses MATLAB integral for adaptive numerical quadrature. The integral is exact for this interval: 2.',
      metrics: [['Interval', '[0, π]'], ['Exact integral', '2.0000'], ['Method', 'Adaptive quad.']],
      x: range(0, Math.PI, 101), compute: x => Math.sin(x),
      code: `%% Definite integral of sin(x)\nf = @(x) sin(x);\na = 0;\nb = pi;\n\narea = integral(f, a, b);\nx = linspace(a, b, 301);\ny = f(x);\n\nplot(x, y, 'LineWidth', 1.8);\nyline(0, ':'); grid on;\nxlabel('x (rad)'); ylabel('sin(x)');\ntitle(sprintf('Integral = %.4f', area));\nfprintf('Integral from 0 to pi: %.8f\\n', area);`
    },
    linear: {
      title: 'Eigenvalues of a 2 × 2 system', legend: 'Eigenvalue', xLabel: 'Mode', yLabel: 'Eigenvalue', color: '#73d6a5',
      summary: 'A small matrix eigenvalue problem reveals the system’s characteristic modes.', assumptions: 'The displayed matrix is a dimensionless illustrative example. For a physical system, eigenvalues depend on its formulation, units, and boundary conditions.',
      metrics: [['Matrix', '[4  1; 2  3]'], ['Eigenvalues', '5.00, 2.00'], ['Trace check', '7.00']],
      x: [1,2], compute: i => i===1?5:2,
      code: `%% Eigenvalues of a 2-by-2 matrix\nA = [4 1; 2 3];\n[V, D] = eig(A);\nlambda = diag(D);\n\ndisp('Eigenvalues:');\ndisp(lambda);\ndisp('Eigenvectors (columns):');\ndisp(V);\n\nbar(real(lambda)); grid on;\nxlabel('Mode'); ylabel('Eigenvalue');\ntitle('Eigenvalues of A');`
    },
    optimize: {
      title: 'Quadratic design objective', legend: 'Objective', xLabel: 'Design variable, x', yLabel: 'Objective, f(x)', color: '#e9cf79',
      summary: 'Explore a simple convex objective and locate its minimum.', assumptions: 'This is a one-dimensional illustrative objective with a known smooth minimum. Real design optimization needs constraints and a validated objective model.',
      metrics: [['Objective', '(x − 3)² + 2'], ['Minimum x', '3.00'], ['Minimum f(x)', '2.00']],
      x: range(0, 6, 101), compute: x => (x-3)**2+2,
      code: `%% One-dimensional design optimization\nf = @(x) (x - 3).^2 + 2;\nxRange = linspace(0, 6, 301);\n\n[xMin, fMin] = fminbnd(f, 0, 6);\nplot(xRange, f(xRange), 'LineWidth', 1.8);\nhold on; plot(xMin, fMin, 'o'); hold off;\ngrid on; xlabel('Design variable, x');\nylabel('Objective, f(x)');\ntitle(sprintf('Minimum at x = %.2f', xMin));\nfprintf('Minimum objective: %.4f\\n', fMin);`
    }
  };
  let current = 'vibration';
  let toastTimer;
  function range(a,b,n){return Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));}
  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function renderCode(text){return escapeHtml(text).replace(/(%[^\n]*)/g,'<span class="comment">$1</span>').replace(/\b(function|if|else|end|for|while)\b/g,'<span class="keyword">$1</span>').replace(/\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/gi,'<span class="number">$1</span>');}
  function drawChart(item, values, xValues=item.x){
    const svg=$('#plot'), W=640,H=250,L=54,R=17,T=29,B=30, innerW=W-L-R,innerH=H-T-B;
    const lo=Math.min(...values),hi=Math.max(...values),pad=(hi-lo||1)*.14,ymin=lo-pad,ymax=hi+pad;
    const xmin=Math.min(...xValues),xmax=Math.max(...xValues);
    const px=x=>L+(x-xmin)/(xmax-xmin||1)*innerW, py=y=>T+(ymax-y)/(ymax-ymin)*innerH;
    let grid=''; for(let i=0;i<5;i++){const y=T+i*innerH/4,value=ymax-i*(ymax-ymin)/4;grid+=`<line class="grid-line" x1="${L}" y1="${y}" x2="${W-R}" y2="${y}"/><text class="axis-label" x="${L-8}" y="${y+3}" text-anchor="end">${formatTick(value)}</text>`;}
    const points=xValues.map((x,i)=>`${i?'L':'M'}${px(x).toFixed(2)},${py(values[i]).toFixed(2)}`).join(' ');
    const fill=`${points} L${px(xValues[xValues.length-1])},${H-B} L${px(xValues[0])},${H-B} Z`;
    const xTicks=[xmin,(xmin+xmax)/2,xmax].map(x=>`<text class="axis-label" x="${px(x)}" y="${H-7}" text-anchor="middle">${formatTick(x)}</text>`).join('');
    svg.innerHTML=`<defs><linearGradient id="plotGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${item.color}" stop-opacity=".2"/><stop offset="1" stop-color="${item.color}" stop-opacity="0"/></linearGradient></defs>${grid}${xTicks}<path class="plot-fill" d="${fill}"/><path class="plot-line" style="stroke:${item.color}" d="${points}"/>`;
    svg.setAttribute('aria-label',`${item.title} chart, ${values.length} data points`);
  }
  function formatTick(n){if(Math.abs(n)>=100)return n.toFixed(0);if(Math.abs(n)>=10)return n.toFixed(1);return n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');}
  function render(key){current=key;const item=examples[key];$('#resultTitle').textContent=item.title;$('#resultSummary').textContent=item.summary;$('#chartLegend').textContent=item.legend;$('#xLabel').textContent=item.xLabel;$('#yLabel').textContent=item.yLabel;$('#assumptions').textContent=item.assumptions;$('#matlabCode').innerHTML=renderCode(item.code);$('#metrics').innerHTML=item.metrics.map(([label,value])=>`<div class="metric"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join('');drawChart(item,item.x.map(item.compute));$('#resultMode').textContent='ILLUSTRATIVE PREVIEW';document.querySelectorAll('[data-solver]').forEach(el=>el.classList.toggle('selected',el.dataset.solver===key));}
  function detect(text){const q=text.toLowerCase();if(/beam|deflect|cantilever|stress|strain|truss/.test(q))return 'beam';if(/heat|cool|temperature|thermal|conduction|convection/.test(q))return 'heat';if(/eigen|matrix|linear algebra|eigenvector/.test(q))return 'linear';if(/integr|differentiat|derivative|calculus|sin\s*\(/.test(q))return 'calculus';if(/optim|minimi|maximi|objective|design variable/.test(q))return 'optimize';return 'vibration';}
  function showToast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
  async function run(){
    const query=input.value.trim();if(!query){showToast('Describe a problem or choose an example first.');input.focus();return;}
    const key=detect(query);render(key);const button=$('#runButton');button.disabled=true;button.querySelector('span:first-child').textContent='Checking runtime…';
    const base=window.MATENGINE_API_BASE;
    if(base){try{
      const response=await fetch(`${base.replace(/\/$/,'')}/api/run`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:key,question:query})});
      if(!response.ok)throw new Error(`Runtime returned ${response.status}`);
      const result=await response.json();
      if(!Array.isArray(result.x)||!Array.isArray(result.y)||result.x.length!==result.y.length||result.x.length<2||result.x.length>1201||!result.x.every(Number.isFinite)||!result.y.every(Number.isFinite))throw new Error('Runtime response must include 2–1201 matching finite x and y values.');
      drawChart(examples[key],result.y,result.x);$('#resultMode').textContent='MATLAB RESULT';$('#resultSummary').textContent=result.summary||'Analysis completed by the configured MATLAB service.';$('#runtimeStatus').textContent='MATLAB connected';showToast('MATLAB analysis completed.');
    }catch(error){$('#resultMode').textContent='PREVIEW ONLY';$('#runtimeStatus').textContent='Runtime unavailable';showToast(`MATLAB service unavailable: ${error.message}`);}}
    else{await new Promise(resolve=>setTimeout(resolve,220));showToast('Preview updated. Connect a MATLAB service to run in MATLAB.');}
    button.disabled=false;button.querySelector('span:first-child').textContent='Run analysis';
  }
  function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
  const prompts={vibration:'Plot the free vibration response of a damped mass-spring system.',beam:'Estimate the deflection of a cantilever beam under a uniform load.',heat:'Show how a warm component cools toward ambient temperature.',calculus:'Integrate sin(x) from 0 to pi and plot the function.',linear:'Find eigenvalues and eigenvectors for a 2 by 2 matrix.',optimize:'Find the minimum of a quadratic design objective.'};
  document.querySelectorAll('[data-solver]').forEach(el=>el.addEventListener('click',()=>{const key=el.dataset.solver;input.value=prompts[key];$('#charCount').textContent=`${input.value.length} / 600`;render(key);}));
  input.addEventListener('input',()=>$('#charCount').textContent=`${input.value.length} / 600`);
  $('#runButton').addEventListener('click',run);
  $('#copyCode').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(examples[current].code);showToast('MATLAB code copied to clipboard.');}catch{showToast('Clipboard access unavailable. Download the .m file instead.');}});
  $('#downloadCode').addEventListener('click',()=>download('matengine_analysis.m',examples[current].code,'text/plain'));
  $('#downloadCsv').addEventListener('click',()=>{const item=examples[current],values=item.x.map(item.compute),csv=`x,y\n${item.x.map((x,i)=>`${x},${values[i]}`).join('\n')}`;download('matengine_preview.csv',csv,'text/csv');});
  $('#examplesNav').addEventListener('click',()=>document.querySelector('.example-chips').scrollIntoView({behavior:'smooth',block:'center'}));
  render('vibration');
})();
