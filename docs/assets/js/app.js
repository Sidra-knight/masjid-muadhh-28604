// app.js — public site loader: loads content JSONs and renders prayer times via Aladhan

async function loadJSON(path) {
  try {
    const r = await fetch(path)
    if (!r.ok) return null
    return await r.json()
  } catch(e) { return null }
}

async function render() {
  const cfg = await loadJSON('/content/config.json') || {}
  const ann = await loadJSON('/content/announcements.json') || {items:[]}
  const jumuah = await loadJSON('/content/jumuah.json') || {entries:[]}
  const eid = await loadJSON('/content/eid.json') || {visible:false}

  document.getElementById('mosque-name').textContent = cfg.name || 'Mosque'
  document.getElementById('mosque-address').textContent = cfg.address || ''

  // Announcements
  const annList = document.getElementById('ann-list')
  annList.innerHTML = ''
  for (let it of ann.items || []) {
    const li = document.createElement('li')
    li.textContent = it.text
    annList.appendChild(li)
  }

  // Jumuah
  const jList = document.getElementById('jumuah-list')
  jList.innerHTML = ''
  for (let e of jumuah.entries || []) {
    const li = document.createElement('li')
    li.textContent = `${e.date} — Khutbah: ${e.khutbah_time} Prayer: ${e.prayer_time}`
    jList.appendChild(li)
  }

  // Eid
  if (eid.visible) {
    document.getElementById('eid').style.display = 'block'
    document.getElementById('eid-dt').textContent = eid.datetime || ''
  }

  // Prayer times from Aladhan
  if (cfg.lat && cfg.lon) {
    const d = new Date()
    const D = d.getDate()
    const M = d.getMonth() + 1
    const Y = d.getFullYear()
    const url = `https://api.aladhan.com/v1/timings/${D}-${M}-${Y}?latitude=${cfg.lat}&longitude=${cfg.lon}&method=${cfg.calc_method || 2}&school=${cfg.school || 0}`
    fetch(url).then(r=>r.json()).then(data=>{
      const timings = data.data.timings || {}
      const timesList = document.getElementById('times-list')
      timesList.innerHTML = ''
      ['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(k => {
        const li = document.createElement('li')
        li.textContent = `${k}: ${timings[k] || '-'} `
        timesList.appendChild(li)
      })
    }).catch(()=>{})
  }
}

render()
