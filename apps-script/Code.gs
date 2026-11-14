/** @OnlyCurrentDoc */
/**
 * MISI PRS CILIK — pelayan Google Apps Script
 * Rekod murid disimpan dalam helaian "Murid" pada Google Sheet ini.
 *
 * Fungsi yang boleh dijalankan dari editor:
 *   sediakan()       — jalankan sekali selepas tampal kod (membina helaian & meminta kebenaran)
 *   resetPinGuru()   — jika terlupa PIN guru
 */

var SHEET_MURID = 'Murid';

var GAMES = [
  ['bukan',  'Buli atau Bukan (/8)', 8],
  ['jenis',  'Teka Jenis Buli (/9)', 9],
  ['akta',   'Apa Kata Akta (/10)', 10],
  ['susun',  'Susun Peta Tindakan (/2)', 2],
  ['mitos',  'Mitos atau Fakta (/8)', 8],
  ['kuiz',   'Kuiz Kilat PRS (/8)', 8],
  ['bantu',  'Bantu atau Rujuk (/6)', 6],
  ['dengar', 'Pendengar Hebat (/8)', 8]
];

var HEAD = ['ID', 'Nama', 'Kelas', 'XP', 'Tahap', 'Modul Selesai', 'Lencana']
  .concat(GAMES.map(function (g) { return g[1]; }))
  .concat(['Suara Hati', 'Didaftar', 'Aktif Terakhir', 'PIN (hash)', 'Token Sesi', 'Data (JSON)']);

var C = {};
HEAD.forEach(function (h, i) { C[h] = i; });

var LEVELS = [[0, 'Perintis'], [80, 'Pendengar'], [200, 'Penolong'], [360, 'Pembimbing'], [560, 'PRS Bintang']];
var BADGE_NAMES = {
  perisai: 'Perisai Antibuli', detektif: 'Detektif Buli', jenis: 'Pengenal Jenis', akta: 'Pakar Akta 876',
  peta: 'Peta Tindakan', mitos: 'Pemburu Mitos', ilmu: 'Ulat Buku PRS', kuiz: 'Otak Kilat', bantu: 'Penjaga Selamat',
  dengar: 'Telinga Emas', bintang: 'PRS Bintang'
};

/* ---------- laman ---------- */

function doGet(e) {
  if (e && e.parameter && e.parameter.ping) {
    return json_({ ok: { versi: VERSI, masa: Date.now() } });
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Misi PRS Cilik')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ---------- API untuk laman di GitHub Pages ---------- */

var VERSI = '1.4';

// Hanya fungsi dalam senarai ini boleh dipanggil dari luar.
var API_DIBENARKAN = {
  apiKelas: apiKelas, apiNama: apiNama, apiDaftar: apiDaftar, apiMasuk: apiMasuk, apiSimpan: apiSimpan,
  apiGuruStatus: apiGuruStatus, apiGuruCipta: apiGuruCipta, apiGuruData: apiGuruData,
  apiGuruResetPin: apiGuruResetPin, apiGuruPadam: apiGuruPadam
};

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var fn = API_DIBENARKAN.hasOwnProperty(body.fn) ? API_DIBENARKAN[body.fn] : null;
    if (!fn) return json_({ err: 'Permintaan tidak dikenali.' });
    var args = Array.isArray(body.args) ? body.args.slice(0, 5) : [];
    return json_({ ok: fn.apply(null, args) });
  } catch (err) {
    return json_({ err: String((err && err.message) || err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- persediaan ---------- */

function sediakan() {
  sheet_();
  salt_();
  Logger.log('Siap. Helaian "Murid" sedia. Sekarang klik Deploy > New deployment.');
}

function resetPinGuru() {
  PropertiesService.getScriptProperties().deleteProperty('GURU_PIN');
  Logger.log('PIN guru dipadam. Buka laman dan cipta PIN guru baharu.');
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_MURID);
  if (!sh) {
    sh = ss.insertSheet(SHEET_MURID, 0);
  }
  if (sh.getMaxColumns() < HEAD.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), HEAD.length - sh.getMaxColumns());
  }
  var width = Math.max(HEAD.length, sh.getLastColumn());
  var first = sh.getRange(1, 1, 1, width).getValues()[0];
  var same = HEAD.every(function (h, i) { return first[i] === h; });
  if (same) return sh;
  if (first[0] === HEAD[0]) {
    pindahLajur_(sh, first);          // tajuk lama: susun semula lajur tanpa kehilangan data
  } else {
    if (first.join('') !== '') sh.insertRowBefore(1);   // senarai nama yang ditampal guru tanpa tajuk
    tulisTajuk_(sh);
  }
  return sh;
}

function tulisTajuk_(sh) {
  sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold').setBackground('#d8f1ee');
  sh.setFrozenRows(1);
  sh.setFrozenColumns(3);
  try { sh.showColumns(1, sh.getMaxColumns()); } catch (e) {}
  sh.hideColumns(C['PIN (hash)'] + 1, 3);   // sembunyikan lajur teknikal
}

/** Susun semula data mengikut tajuk baharu apabila lajur ditambah dalam versi baharu. */
function pindahLajur_(sh, oldHead) {
  var n = sh.getLastRow();
  if (n >= 2) {
    var w = oldHead.length;
    var data = sh.getRange(2, 1, n - 1, w).getValues();
    var idx = {};
    oldHead.forEach(function (h, i) { if (h !== '' && idx[h] == null) idx[h] = i; });
    var out = data.map(function (r) {
      return HEAD.map(function (h) { return idx[h] != null ? r[idx[h]] : ''; });
    });
    if (w > HEAD.length) sh.getRange(2, HEAD.length + 1, n - 1, w - HEAD.length).clearContent();
    sh.getRange(2, 1, n - 1, HEAD.length).setValues(out);
  }
  if (oldHead.length > HEAD.length) sh.getRange(1, HEAD.length + 1, 1, oldHead.length - HEAD.length).clearContent();
  tulisTajuk_(sh);
}

function salt_() {
  var p = PropertiesService.getScriptProperties();
  var s = p.getProperty('SALT');
  if (!s) { s = Utilities.getUuid(); p.setProperty('SALT', s); }
  return s;
}

function hash_(pin, extra) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
    salt_() + '|' + extra + '|' + pin, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { var v = (b + 256) % 256; return (v < 16 ? '0' : '') + v.toString(16); }).join('');
}

/* ---------- pembantu ---------- */

function norm_(s) { return String(s == null ? '' : s).trim().replace(/\s+/g, ' '); }
function key_(s) { return norm_(s).toUpperCase(); }

function rows_() {
  var sh = sheet_();
  var n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, HEAD.length).getValues().map(function (r, i) {
    return { row: i + 2, r: r };
  }).filter(function (x) { return norm_(x.r[C['Nama']]) !== ''; });
}

/** Beri ID kepada baris yang guru isi sendiri (Nama + Kelas sahaja). */
function ensureIds_() {
  var sh = sheet_();
  rows_().forEach(function (x) {
    if (!x.r[C['ID']]) {
      sh.getRange(x.row, C['ID'] + 1).setValue('M' + Utilities.getUuid().slice(0, 8));
    }
  });
}

function findById_(id) {
  id = String(id || '');
  var all = rows_();
  for (var i = 0; i < all.length; i++) if (String(all[i].r[C['ID']]) === id && id) return all[i];
  return null;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function checkPin_(pin, min, max) {
  pin = String(pin || '');
  var re = new RegExp('^\\d{' + min + ',' + max + '}$');
  if (!re.test(pin)) throw new Error(min === max ? 'PIN mesti ' + min + ' digit nombor.' : 'PIN mesti ' + min + ' hingga ' + max + ' digit nombor.');
  return pin;
}

function tooMany_(k) {
  var n = Number(CacheService.getScriptCache().get('f_' + k) || 0);
  if (n >= 5) throw new Error('Terlalu banyak cubaan salah. Tunggu 10 minit, kemudian cuba lagi.');
}
function failed_(k) {
  var c = CacheService.getScriptCache();
  c.put('f_' + k, String(Number(c.get('f_' + k) || 0) + 1), 600);
}
function cleared_(k) { CacheService.getScriptCache().remove('f_' + k); }

function emptyState_() { return { xp: 0, mods: [], best: {}, tries: {}, badges: [], suara: '' }; }

function parseState_(r) {
  try {
    var s = JSON.parse(r[C['Data (JSON)']] || '{}');
    return clean_(s);
  } catch (e) { return emptyState_(); }
}

function clean_(s) {
  s = s || {};
  var o = emptyState_();
  o.xp = Math.max(0, Math.min(100000, Math.round(Number(s.xp) || 0)));
  o.mods = (Array.isArray(s.mods) ? s.mods : []).map(String)
    .filter(function (m, i, a) { return /^[1-5]$/.test(m) && a.indexOf(m) === i; }).sort();
  o.badges = (Array.isArray(s.badges) ? s.badges : []).map(String)
    .filter(function (b, i, a) { return BADGE_NAMES[b] && a.indexOf(b) === i; });
  GAMES.forEach(function (g) {
    var b = s.best && s.best[g[0]], t = s.tries && s.tries[g[0]];
    if (b != null && isFinite(b)) o.best[g[0]] = Math.max(0, Math.min(g[2], Math.round(Number(b))));
    if (t != null && isFinite(t)) o.tries[g[0]] = Math.max(0, Math.min(9999, Math.round(Number(t))));
  });
  o.suara = String(s.suara || '').slice(0, 300);
  return o;
}

function tahap_(xp) {
  var i = 0;
  LEVELS.forEach(function (l, k) { if (xp >= l[0]) i = k; });
  return (i + 1) + ' · ' + LEVELS[i][1];
}

function writeState_(x, st) {
  var r = x.r.slice();
  r[C['XP']] = st.xp;
  r[C['Tahap']] = tahap_(st.xp);
  r[C['Modul Selesai']] = st.mods.join(', ');
  r[C['Lencana']] = st.badges.map(function (b) { return BADGE_NAMES[b]; }).join(', ');
  GAMES.forEach(function (g) { r[C[g[1]]] = st.best[g[0]] != null ? st.best[g[0]] : ''; });
  r[C['Suara Hati']] = st.suara;
  r[C['Aktif Terakhir']] = new Date();
  r[C['Data (JSON)']] = JSON.stringify(st);
  sheet_().getRange(x.row, 1, 1, HEAD.length).setValues([r]);
  x.r = r;
}

function session_(x) {
  return {
    id: String(x.r[C['ID']]), token: String(x.r[C['Token Sesi']]),
    nama: norm_(x.r[C['Nama']]), kelas: norm_(x.r[C['Kelas']]), state: parseState_(x.r)
  };
}

function ms_(d) { return d instanceof Date ? d.getTime() : null; }

/* ---------- API murid ---------- */

function apiKelas() {
  var set = {};
  rows_().forEach(function (x) { var k = norm_(x.r[C['Kelas']]); if (k) set[key_(k)] = k; });
  return Object.keys(set).sort().map(function (k) { return set[k]; });
}

function apiNama(kelas) {
  withLock_(ensureIds_);
  var k = key_(kelas);
  return rows_().filter(function (x) { return key_(x.r[C['Kelas']]) === k; })
    .map(function (x) {
      return { id: String(x.r[C['ID']]), nama: norm_(x.r[C['Nama']]), adaPin: !!x.r[C['PIN (hash)']] };
    })
    .sort(function (a, b) { return a.nama.localeCompare(b.nama); });
}

function apiDaftar(nama, kelas, pin) {
  nama = norm_(nama); kelas = norm_(kelas).toUpperCase();
  if (nama.length < 3 || nama.length > 60) throw new Error('Nama mesti antara 3 hingga 60 huruf.');
  if (kelas.length < 1 || kelas.length > 20) throw new Error('Sila isi nama kelas, contoh: 5 BESTARI.');
  pin = checkPin_(pin, 4, 4);
  return withLock_(function () {
    var dup = rows_().some(function (x) {
      return key_(x.r[C['Nama']]) === key_(nama) && key_(x.r[C['Kelas']]) === key_(kelas);
    });
    if (dup) throw new Error('Nama ini sudah ada dalam kelas ' + kelas + '. Sila pilih "Log masuk".');
    var id = 'M' + Utilities.getUuid().slice(0, 8);
    var st = emptyState_();
    var r = HEAD.map(function () { return ''; });
    r[C['ID']] = id; r[C['Nama']] = nama; r[C['Kelas']] = kelas;
    r[C['Didaftar']] = new Date(); r[C['PIN (hash)']] = hash_(pin, id);
    r[C['Token Sesi']] = Utilities.getUuid();
    var sh = sheet_();
    sh.appendRow(r);
    var x = { row: sh.getLastRow(), r: r };
    writeState_(x, st);
    return session_(x);
  });
}

function apiMasuk(id, pin, pinBaharu) {
  tooMany_(id);
  return withLock_(function () {
    var x = findById_(id);
    if (!x) throw new Error('Nama tidak dijumpai. Sila muat semula halaman.');
    if (!x.r[C['PIN (hash)']]) {
      // kali pertama (nama diisi guru, atau PIN direset guru)
      pinBaharu = checkPin_(pinBaharu, 4, 4);
      x.r[C['PIN (hash)']] = hash_(pinBaharu, x.r[C['ID']]);
      if (!x.r[C['Didaftar']]) x.r[C['Didaftar']] = new Date();
    } else {
      pin = checkPin_(pin, 4, 4);
      if (hash_(pin, x.r[C['ID']]) !== x.r[C['PIN (hash)']]) {
        failed_(id);
        throw new Error('PIN salah. Cuba lagi atau minta guru reset PIN kamu.');
      }
    }
    cleared_(id);
    x.r[C['Token Sesi']] = Utilities.getUuid();
    writeState_(x, parseState_(x.r));
    return session_(x);
  });
}

function apiSimpan(id, token, state) {
  return withLock_(function () {
    var x = findById_(id);
    if (!x || !token || String(x.r[C['Token Sesi']]) !== String(token)) {
      throw new Error('SESI: Sesi kamu telah tamat (mungkin kamu log masuk di peranti lain). Sila log masuk semula.');
    }
    writeState_(x, clean_(state));
    return true;
  });
}

/* ---------- API guru ---------- */

function guruOk_(pin) {
  tooMany_('guru');
  var h = PropertiesService.getScriptProperties().getProperty('GURU_PIN');
  if (!h) throw new Error('PIN guru belum dicipta.');
  if (hash_(String(pin || ''), 'GURU') !== h) { failed_('guru'); throw new Error('PIN guru salah.'); }
  cleared_('guru');
}

function apiGuruStatus() {
  return { adaPin: !!PropertiesService.getScriptProperties().getProperty('GURU_PIN') };
}

function apiGuruCipta(pin) {
  pin = checkPin_(pin, 4, 8);
  return withLock_(function () {
    var p = PropertiesService.getScriptProperties();
    if (p.getProperty('GURU_PIN')) throw new Error('PIN guru sudah wujud. Sila masukkan PIN tersebut.');
    p.setProperty('GURU_PIN', hash_(pin, 'GURU'));
    return true;
  });
}

function apiGuruData(pin) {
  guruOk_(pin);
  withLock_(ensureIds_);
  var list = rows_().map(function (x) {
    var st = parseState_(x.r);
    return {
      id: String(x.r[C['ID']]), nama: norm_(x.r[C['Nama']]), kelas: norm_(x.r[C['Kelas']]),
      xp: st.xp, mods: st.mods, badges: st.badges, best: st.best, tries: st.tries, suara: st.suara,
      didaftar: ms_(x.r[C['Didaftar']]), aktif: ms_(x.r[C['Aktif Terakhir']]),
      adaPin: !!x.r[C['PIN (hash)']]
    };
  });
  return { murid: list, sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(), masa: Date.now() };
}

function apiGuruResetPin(pin, id) {
  guruOk_(pin);
  return withLock_(function () {
    var x = findById_(id);
    if (!x) throw new Error('Rekod murid tidak dijumpai.');
    var sh = sheet_();
    sh.getRange(x.row, C['PIN (hash)'] + 1).setValue('');
    sh.getRange(x.row, C['Token Sesi'] + 1).setValue('');
    return true;
  });
}

function apiGuruPadam(pin, id) {
  guruOk_(pin);
  return withLock_(function () {
    var x = findById_(id);
    if (!x) throw new Error('Rekod murid tidak dijumpai.');
    sheet_().deleteRow(x.row);
    return true;
  });
}
