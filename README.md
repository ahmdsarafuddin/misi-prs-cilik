# Misi PRS Cilik

Laman pembelajaran interaktif untuk murid **Pembimbing Rakan Sebaya (PRS)** sekolah rendah, Tahap 2. Murid belajar tentang buli dan **Akta Antibuli 2026 (Akta 876)**, mengumpul XP, membuka lencana, dan menguji kefahaman melalui permainan. Guru boleh melihat kemajuan setiap murid melalui papan pemuka.

## Pautan laman

https://script.google.com/macros/s/AKfycbyvucbM7cuhWkD6TkSHZNyCoLKbaYGvhE4wUYBPJoE5hmzZtNKzRoE0gM-1KSxmbUpKTA/exec

Kemas kini kod melalui **Manage deployments → Edit → New version** supaya pautan ini kekal sama.

## Kandungan

| Modul | Topik |
|---|---|
| 1 | Kenali Buli & Akta Antibuli 2026 (pelajaran 6 langkah) |
| 2 | Siapa PRS? |
| 3 | Ciri-ciri PRS |
| 4 | Mendengar aktif |
| 5 | Bantu atau rujuk? |

**Permainan:** Buli atau Bukan?, Teka Jenis Buli, Apa Kata Akta?, Susun Peta Tindakan, Kuiz Kilat PRS, Bantu atau Rujuk?, Pendengar Hebat.

## Cara ia berfungsi

- Murid daftar sendiri dengan **nama, kelas dan PIN 4 digit**, kemudian log masuk dengan memilih kelas dan nama.
- Kemajuan disimpan secara automatik dalam **Google Sheet** guru (helaian `Murid`).
- **Papan pemuka guru** dilindungi PIN guru: ringkasan, jadual markah, tapisan kelas, butiran murid, reset PIN dan padam rekod.
- Guru juga boleh menampal senarai nama dan kelas terus ke helaian `Murid`. Murid mencipta PIN sendiri semasa log masuk kali pertama.

## Fail

| Fail | Kegunaan |
|---|---|
| `apps-script/Code.gs` | Pelayan: daftar, log masuk, simpan kemajuan, data papan pemuka |
| `apps-script/Index.html` | Laman murid dan papan pemuka guru |
| `apps-script/appsscript.json` | Manifest projek: zon waktu, dan web app dibuka oleh sesiapa tanpa log masuk |
| `.github/workflows/deploy-gas.yml` | GitHub Action yang menghantar kod ke Apps Script secara automatik |

## Cara memasang

Gunakan **akaun Gmail peribadi**, bukan akaun DELIMa. Akaun DELIMa biasanya tidak membenarkan tetapan akses "Anyone".

1. Buka [sheets.new](https://sheets.new) dan namakan fail, contohnya *Rekod Misi PRS*.
2. Klik **Extensions → Apps Script**.
3. Padam semua kod dalam `Code.gs`, kemudian tampal isi `apps-script/Code.gs`.
4. Klik **+** di sebelah *Files*, pilih **HTML**, dan namakan tepat `Index`. Tampal isi `apps-script/Index.html`. Klik **Save**.
5. Pilih fungsi **sediakan**, kemudian klik **Run**. Benarkan akses apabila diminta (*Advanced → Go to … → Allow*). Pop up ini hanya muncul sekali, kepada guru sahaja.
6. Klik **Deploy → New deployment → Web app**, dan tetapkan:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
7. Klik **Deploy** dan salin **Web app URL**. Kongsikan pautan itu dengan murid PRS.
8. Buka pautan, klik **Saya guru: buka papan pemuka**, dan cipta PIN guru.

### Kemas kini kod

Tampal fail baharu, kemudian pilih **Deploy → Manage deployments → Edit (ikon pensel) → Version: New version → Deploy**. Pautan laman kekal sama.

### Terlupa PIN guru

Dalam Apps Script, pilih fungsi **resetPinGuru** dan klik **Run**. Kemudian buka laman dan cipta PIN guru baharu.

## Penyegerakan automatik (clasp + GitHub Actions)

Setiap kali fail dalam folder `apps-script/` diubah di cawangan `main`, GitHub Action **Hantar ke Google Apps Script** akan:

1. menghantar kod ke projek Apps Script (`clasp push`), dan
2. mengemas kini web app yang sedia ada dengan versi baharu (`clasp deploy`), jadi **pautan laman kekal sama**.

Mulai sekarang, ubah kod **di GitHub sahaja**. Perubahan yang dibuat terus dalam editor Apps Script akan ditimpa pada penghantaran seterusnya.

### Persediaan (sekali sahaja)

**Langkah 1: Hidupkan Apps Script API**

Buka https://script.google.com/home/usersettings dengan Gmail yang memiliki projek, kemudian hidupkan **Google Apps Script API**.

**Langkah 2: Dapatkan Script ID**

Dalam editor Apps Script, klik **Project Settings** (ikon gear), kemudian salin **Script ID** di bahagian *IDs*.

**Langkah 3: Dapatkan kelayakan clasp (`.clasprc.json`)**

Langkah ini boleh dibuat terus dalam pelayar menggunakan GitHub Codespaces, tanpa memasang apa-apa di komputer.

1. Di halaman repo ini, klik **Code → Codespaces → Create codespace on main**.
2. Dalam terminal di bahagian bawah, jalankan:
   ```
   npx @google/clasp@2.4.2 login --no-localhost
   ```
3. Buka pautan yang dipaparkan, log masuk dengan Gmail yang memiliki projek Apps Script, kemudian klik **Allow**.
4. Google akan memaparkan satu kod. Salin kod itu, tampal ke terminal, kemudian tekan Enter.
5. Paparkan kelayakan dengan:
   ```
   cat ~/.clasprc.json
   ```
   Salin **seluruh** teks yang dipaparkan, bermula dengan `{` dan berakhir dengan `}`.
6. Padam codespace selepas siap, melalui **github.com/codespaces → ⋯ → Delete**.

**Langkah 4: Simpan sebagai rahsia repo**

Di repo ini, pergi ke **Settings → Secrets and variables → Actions → New repository secret**, kemudian tambah:

| Name | Secret |
|---|---|
| `CLASPRC_JSON` | seluruh isi `.clasprc.json` dari Langkah 3 |
| `SCRIPT_ID` | Script ID dari Langkah 2 |

**Langkah 5: Uji**

Pergi ke tab **Actions → Hantar ke Google Apps Script → Run workflow**. Tanda hijau ✓ bermakna laman sudah dikemas kini.

### Jika berlaku masalah

| Mesej dalam Actions | Penyelesaian |
|---|---|
| `Rahsia CLASPRC_JSON belum ditambah` | Ulang Langkah 4. |
| `User has not enabled the Apps Script API` | Ulang Langkah 1, tunggu beberapa minit, kemudian jalankan semula. |
| `invalid_grant` atau `unauthorized` | Kelayakan telah tamat atau dibatalkan. Ulang Langkah 3 dan gantikan rahsia `CLASPRC_JSON`. |
| `Requested entity was not found` | Semak `SCRIPT_ID`, atau `DEPLOYMENT_ID` dalam `.github/workflows/deploy-gas.yml`. |

**Jika pautan web app berubah**, kemas kini `DEPLOYMENT_ID` dalam `.github/workflows/deploy-gas.yml`. Nilainya ialah bahagian di antara `/s/` dan `/exec` dalam pautan.

**Keselamatan:** `CLASPRC_JSON` memberi akses kepada projek Apps Script dalam Gmail tersebut. Simpan hanya sebagai *secret*. Jangan tampal dalam fail, issue atau mesej.

## Privasi

Kod dalam repositori ini **tidak mengandungi data murid**. Semua rekod (nama, kelas, markah) hanya disimpan dalam Google Sheet guru. PIN murid dan guru disimpan dalam bentuk hash, bukan teks biasa.

## Rujukan

- Akta Antibuli 2026 (Akta 876), diwartakan 23 Januari 2026.
- Modul PRS bagi Program Kerangka Antibuli Sekolah (SAFE), Modul 1.
