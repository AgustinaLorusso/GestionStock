// ── STATE ──────────────────────────────────────────
const state = {
  sede: null,
  fecha: new Date(),
  flavors: ['Crema catalana','Chocolate','Frutilla','Dulce de leche','Pistacho','Oreo','Kinder','Fruta de la pasion','Yogurt','Frambuesa','Cheesecake','Rocher','Limon','After 8', 'Mango','Vainilla','Cookies'],
  flavorQty: {},
  customFlavors: [],
  photos: [],
};
state.flavors.forEach(f => state.flavorQty[f] = 0);

const $ = id => document.getElementById(id);
const getInsumo = id => parseInt($('insumo-'+id)?.value) || 0;

function formatFecha(d) {
  const dias = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()} — ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ── STEPS ──────────────────────────────────────────
function setStep(active) {
  for (let i=1;i<=5;i++) {
    const el = $('step-'+i);
    el.classList.remove('active','done');
    if (i < active) el.classList.add('done');
    else if (i === active) el.classList.add('active');
  }
}
function markDone(n) {
  const el = $('step-'+n);
  if (el) { el.classList.remove('active'); el.classList.add('done'); }
}

// ── SEDE ───────────────────────────────────────────
document.querySelectorAll('.sede-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.sede-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.sede = card.dataset.sede;
    $('sede-error').classList.remove('visible');
  });
});

$('btn-confirmar').addEventListener('click', () => {
  if (!state.sede) { $('sede-error').classList.add('visible'); return; }
  $('screen-sede').style.display = 'none';
  $('screen-form').style.display = 'block';
  $('progress-strip').classList.add('visible');
  $('sede-badge').textContent = state.sede;
  $('sede-badge').classList.add('visible');
  $('fecha-display').innerHTML = `<strong>${formatFecha(state.fecha)}</strong>`;
  setStep(2);
  updateProgress();
});

$('btn-cambiar-sede').addEventListener('click', () => {
  $('screen-sede').style.display = 'block';
  $('screen-form').style.display = 'none';
  $('progress-strip').classList.remove('visible');
  $('sede-badge').classList.remove('visible');
  setStep(1);
});

// ── RENDER FLAVORS ─────────────────────────────────
function renderFlavors() {
  const list = $('flavors-list');
  list.innerHTML = '';
  state.flavors.forEach(f => {
    const id = 'fl-' + f.replace(/[^a-z0-9]/gi,'-');
    const row = document.createElement('div');
    row.className = 'flavor-row';
    row.innerHTML = `
      <span class="flavor-label">${f}</span>
      <div class="qty-ctrl">
        <button class="qty-btn" data-action="flavor" data-name="${f}" data-delta="-1">−</button>
        <input type="number" id="${id}" class="qty-input" value="0" min="0" data-flavor="${f}">
        <button class="qty-btn" data-action="flavor" data-name="${f}" data-delta="1">+</button>
      </div>`;
    list.appendChild(row);
  });
}

function renderCustomFlavors() {
  const list = $('custom-flavors-list');
  if (!state.customFlavors.length) { list.innerHTML=''; return; }
  list.innerHTML = state.customFlavors.map((c,i) => `
    <div class="flavor-row" style="background:#fafaf7;">
      <span class="flavor-label custom">${c.name}<span class="custom-tag">Nuevo</span></span>
      <div class="qty-ctrl">
        <button class="qty-btn" data-action="custom" data-idx="${i}" data-delta="-1">−</button>
        <input type="number" id="cf-${i}" class="qty-input" value="${c.qty}" min="0" data-custom-idx="${i}">
        <button class="qty-btn" data-action="custom" data-idx="${i}" data-delta="1">+</button>
        <button class="btn-danger-sm" data-action="remove-custom" data-idx="${i}" title="Eliminar">✕</button>
      </div>
    </div>`).join('');
}


document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === 'flavor') {
    const name = btn.dataset.name;
    state.flavorQty[name] = Math.max(0,(state.flavorQty[name]||0)+parseInt(btn.dataset.delta));
    const el = document.getElementById('fl-'+name.replace(/[^a-z0-9]/gi,'-'));
    if (el) el.value = state.flavorQty[name];
    updateProgress();
  }
  if (action === 'insumo') {
    const el = $('insumo-'+btn.dataset.id);
    if (el) el.value = Math.max(0,(parseInt(el.value)||0)+parseInt(btn.dataset.delta));
    updateProgress();
  }
  if (action === 'custom') {
    const i = parseInt(btn.dataset.idx);
    state.customFlavors[i].qty = Math.max(0,state.customFlavors[i].qty+parseInt(btn.dataset.delta));
    const el = $('cf-'+i);
    if (el) el.value = state.customFlavors[i].qty;
    updateProgress();
  }
  if (action === 'remove-custom') {
    state.customFlavors.splice(parseInt(btn.dataset.idx),1);
    renderCustomFlavors(); updateProgress();
  }
  if (action === 'remove-photo') {
    state.photos.splice(parseInt(btn.dataset.idx),1);
    renderPhotos(); updateProgress();
  }
});

document.addEventListener('change', e => {
  if (e.target.dataset.flavor) {
    state.flavorQty[e.target.dataset.flavor] = parseInt(e.target.value)||0;
    updateProgress();
  }
  if (e.target.dataset.customIdx !== undefined) {
    state.customFlavors[parseInt(e.target.dataset.customIdx)].qty = parseInt(e.target.value)||0;
    updateProgress();
  }
  if (e.target.id?.startsWith('insumo-')) updateProgress();
});

// ── Añadir sabor  ─────────────────────────────────────
$('btn-new-minus').addEventListener('click', () => {
  const el = $('new-flavor-qty');
  el.value = Math.max(0,(parseInt(el.value)||0)-1);
});
$('btn-new-plus').addEventListener('click', () => {
  const el = $('new-flavor-qty');
  el.value = (parseInt(el.value)||0)+1;
});
$('btn-agregar').addEventListener('click', agregarSabor);
$('new-flavor-name').addEventListener('keydown', e => { if(e.key==='Enter') agregarSabor(); });

function agregarSabor() {
  const nameEl=$('new-flavor-name'), qtyEl=$('new-flavor-qty'), errEl=$('new-flavor-error');
  const name = nameEl.value.trim();
  if (!name) { errEl.textContent='Ingresa el nombre del sabor.'; errEl.classList.add('visible'); return; }
  const all = [...state.flavors,...state.customFlavors.map(c=>c.name)].map(n=>n.toLowerCase());
  if (all.includes(name.toLowerCase())) { errEl.textContent='Este sabor ya existe.'; errEl.classList.add('visible'); return; }
  errEl.classList.remove('visible');
  state.customFlavors.push({name, qty:parseInt(qtyEl.value)||0});
  nameEl.value=''; qtyEl.value=0;
  renderCustomFlavors(); updateProgress();
}

// ──Fotos ─────────────────────────────────────────
$('photo-input').addEventListener('change', e => {
  Array.from(e.target.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      state.photos.push({name:file.name, dataUrl:ev.target.result});
      renderPhotos(); updateProgress();
    };
    reader.readAsDataURL(file);
  });
  e.target.value='';
});

function renderPhotos() {
  const grid = $('photo-grid');
  grid.innerHTML = state.photos.map((p,i) => `
    <div class="photo-item">
      <img src="${p.dataUrl}" class="photo-thumb" alt="Foto ${i+1}">
      <button class="photo-del" data-action="remove-photo" data-idx="${i}">✕</button>
    </div>`).join('');
}

// ── Verificacion ───────────────────────────────────────
function updateProgress() {
  const checks = [
    {label:'Sede seleccionada', ok:!!state.sede},
    {label:'Sabores completados', ok:true},
    {label:'Insumos completados', ok:true},
    {label:'Al menos una foto adjunta', ok:state.photos.length>0},
  ];
  $('export-checklist').innerHTML = checks.map(c=>`
    <div class="check-item">
      <div class="check-dot ${c.ok?'ok':'nok'}">
        ${c.ok?'<svg width="10" height="10" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>':''}
      </div>
      <span class="check-label ${c.ok?'ok':'nok'}">${c.label}</span>
    </div>`).join('');

  const allOk = checks.every(c=>c.ok);
  $('btn-export').disabled = !allOk;
  if (state.sede) markDone(1);
  markDone(2); markDone(3);
  if (state.photos.length>0) markDone(4);
  if (allOk) markDone(5);
}



// 
async function optimizeImageForPDF(dataUrl, maxWidth = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      
      if (width > maxWidth) {
        height = (maxWidth * height) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

     
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };

    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen'));
    };

    img.src = dataUrl;
  });
}


function downloadPDF(doc, filename) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  try {
    if (isMobile) {
      // Móvil: usa blob para mejor compatibilidad
      const pdf = doc.output('blob');
      const url = URL.createObjectURL(pdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      // Desktop: descarga estándar
      doc.save(filename);
    }
  } catch(e) {
    console.error('Error descargando PDF:', e);
    throw e;
  }
}

// ── PDF EXPORT ─────────────────────────────────────
// ── FUNCIONES AUXILIARES ─────────────────────────────────────

// MÁS COMPRESIÓN PARA IPHONE
async function optimizeImageForPDF(dataUrl, maxWidth = 800, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth * height) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Error cargando imagen'));
    img.src = dataUrl;
  });
}

// DESCARGA PARA IPHONE + GOOGLE PAGES
function downloadPDF(doc, filename) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  try {
    if (isIOS) {
      // iPhone: la mejor opción es abrir en viewer
      try {
        // Intenta como blob primero (mejor compatibilidad)
        const pdf = doc.output('blob');
        const url = URL.createObjectURL(pdf);
        
        // Abre en la misma pestaña o nueva según disponibilidad
        if (window.navigator.standalone || window.navigator.mobileCheckoutSupported) {
          window.open(url, '_blank');
        } else {
          window.location.href = url;
        }
        
        // Libera memoria
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      } catch(blobError) {
        console.warn('Blob fallback:', blobError);
        // Si blob falla, intenta data URL (pero puede ser lento)
        const dataUrl = doc.output('dataurlstring');
        window.open(dataUrl, '_blank');
      }
    } else {
      // Desktop/Android: descarga normal
      doc.save(filename);
    }
  } catch(e) {
    console.error('Error descargando:', e);
    alert('No se pudo descargar. Intenta visualizar en la previsualización.');
  }
}

// ── PDF EXPORT ─────────────────────────────────────
$('btn-export').addEventListener('click', async () => {
  const overlay = $('loading-overlay');
  overlay.style.display = 'flex';
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:'mm',format:'a4'});
    const W=210, H=297, M=18, CW=W-M*2;
    let y=M;

    const NAVY=[26,39,68], RED=[192,57,43], CREAM_C=[245,240,232],
          BEIGE=[212,201,176], GRAY_C=[180,178,175], LIGHT=[250,249,247];

    const pageHeader = () => {
      doc.setFillColor(...NAVY);
      doc.rect(0,0,W,14,'F');
      doc.setFillColor(...RED);
      doc.rect(0,14,W,3,'F');
      doc.setFont('helvetica','bolditalic'); doc.setFontSize(10);
      doc.setTextColor(245,240,232);
      doc.text('Le Bistrot', M, 10);
      doc.setFont('helvetica','normal'); doc.setFontSize(6.5);
      doc.setTextColor(...BEIGE);
      doc.text('GESTION DE STOCK — '+state.sede.toUpperCase(), W-M, 10, {align:'right'});
    };

    const checkPage = (n=18) => {
      if (y+n > H-M) { doc.addPage(); pageHeader(); y=24; }
    };

    const sectionHead = (num, title) => {
      checkPage(24);
      doc.setFillColor(...NAVY);
      doc.rect(M,y,CW,16,'F');
      doc.setFillColor(...RED);
      doc.rect(M,y,3,16,'F');
      doc.setFont('helvetica','normal'); doc.setFontSize(7);
      doc.setTextColor(...BEIGE); doc.text(num, M+8, y+6);
      doc.setFont('helvetica','bolditalic'); doc.setFontSize(14);
      doc.setTextColor(255,255,255); doc.text(title, M+8, y+13);
      y+=22;
    };

    // ── SABORES ──
    pageHeader(); y=24;
    sectionHead('1','Sabores en stock');

    const colQ = W-M-16;
    doc.setFillColor(220,224,235); doc.rect(M,y,CW,8,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(...NAVY);
    doc.text('SABOR', M+4, y+5.5);
    doc.text('CANT.', colQ, y+5.5, {align:'center'});
    y+=8;

    const allFl=[
      ...state.flavors.map(f=>({name:f,qty:state.flavorQty[f]||0,custom:false})),
      ...state.customFlavors.map(c=>({name:c.name,qty:c.qty,custom:true}))
    ];
    allFl.forEach((f,i)=>{
      checkPage(8);
      if(i%2===0){ doc.setFillColor(255,255,255); } else { doc.setFillColor(...LIGHT); }
      doc.rect(M,y,CW,7.5,'F');
      doc.setFont('helvetica',f.custom?'italic':'normal');
      doc.setFontSize(8.5); doc.setTextColor(...NAVY);
      doc.text(f.name+(f.custom?' *':''), M+4, y+5);
      doc.setFont('helvetica','bold');
      doc.text(String(f.qty), colQ, y+5, {align:'center'});
      y+=7.5;
    });
    if(state.customFlavors.length){ y+=3; doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(...GRAY_C); doc.text('* Agregados manualmente.',M,y); y+=8; } else y+=6;

    // ── INSUMOS ──
    checkPage(30); sectionHead('2','Stock de insumos');
    const groups=[
      {cat:'Cucharitas',items:[['Cucharitas descartables',getInsumo('cucharitas')]]},
      {cat:'Conos',items:[['Conos chicos',getInsumo('conos-ch')],['Conos medianos',getInsumo('conos-me')],['Conos grandes',getInsumo('conos-gr')]]},
      {cat:'Tarrinas',items:[['chicas',getInsumo('tar-c-ch')],['medianas',getInsumo('tar-c-me')],['grandes',getInsumo('tar-c-gr')]]},
      {cat:'Tarrinas vacias',items:[['Vacias',getInsumo('tar-v-ch')]]},
    ];
    groups.forEach(g=>{
      checkPage(14+g.items.length*8);
      doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(...RED);
      doc.text(g.cat.toUpperCase(),M,y); y+=1.5;
      doc.setDrawColor(...BEIGE); doc.setLineWidth(0.2); doc.line(M,y,M+CW,y); y+=5;
      g.items.forEach((item,i)=>{
        if(i%2===0){ doc.setFillColor(255,255,255); }else{ doc.setFillColor(...LIGHT); }
        doc.rect(M,y,CW,7.5,'F');
        doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...NAVY);
        doc.text(item[0],M+4,y+5);
        doc.setFont('helvetica','bold'); doc.text(String(item[1]),colQ,y+5,{align:'center'});
        y+=7.5;
      });
      y+=7;
    });

    // ── FOTOS ──
    if(state.photos.length){
      doc.addPage(); pageHeader(); y=24;
      sectionHead('3','Foto Vitrina');
      const iw = CW;
      const ih = iw * 0.65;

      for(let i=0; i<state.photos.length; i++){
        checkPage(ih+12);
        const x = M;

        try{
         
          const optimizedImage = await optimizeImageForPDF(state.photos[i].dataUrl);
          doc.addImage(optimizedImage, 'JPEG', x, y, iw, ih);

          doc.setDrawColor(...BEIGE);
          doc.setLineWidth(0.3);
          doc.rect(x, y, iw, ih);

          doc.setFont('helvetica','normal');
          doc.setFontSize(7);
          doc.setTextColor(...GRAY_C);
          doc.text('Foto '+(i+1), x, y+ih+5);
        }catch(e){
          console.warn('Error foto '+i+':', e.message);
      
        }

        y += ih + 12;
      }
    }

    const slug = state.sede.replace(/\s+/g,'_').toLowerCase();
    const ds = state.fecha.toISOString().slice(0,10);
    const filename = 'stock_'+slug+'_'+ds+'.pdf';

    downloadPDF(doc, filename);

  } catch(err) {
    $('export-error').textContent='Error al generar el PDF. Intentalo nuevamente.';
    $('export-error').classList.add('visible');
    console.error('Error completo:', err);
  } finally {
    overlay.style.display='none';
  }
});

renderFlavors();
updateProgress();
