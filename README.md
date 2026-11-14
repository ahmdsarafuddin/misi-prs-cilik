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

## Privasi

Kod dalam repositori ini **tidak mengandungi data murid**. Semua rekod (nama, kelas, markah) hanya disimpan dalam Google Sheet guru. PIN murid dan guru disimpan dalam bentuk hash, bukan teks biasa.

## Rujukan

- Akta Antibuli 2026 (Akta 876), diwartakan 23 Januari 2026.
- Modul PRS bagi Program Kerangka Antibuli Sekolah (SAFE), Modul 1.
