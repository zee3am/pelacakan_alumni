"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAlumniPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    afiliasi_kampus: "",
    program_studi: "",
    kota: "",
    bidang_pekerjaan: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    tiktok: "",
    email: "",
    no_hp: "",
    tempat_bekerja: "",
    alamat_bekerja: "",
    posisi: "",
    status_kepegawaian: "",
    medsos_tempat_bekerja: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menambahkan alumni");
      }

      const data = await res.json();
      router.push(`/alumni/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Tambah Target Alumni</h1>
          <p>Masukkan data profil alumni untuk pencarian otomatis</p>
        </div>
        <a href="/" className="btn btn-secondary">
          ← Kembali
        </a>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
        <form onSubmit={handleSubmit} id="form-new-alumni">
          <h3 style={{ marginBottom: "var(--space-md)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-sm)" }}>Data Dasar</h3>
          <div className="form-group">
            <label className="form-label" htmlFor="nama">Nama Lengkap Alumni *</label>
            <input className="form-input" type="text" id="nama" name="nama" value={formData.nama} onChange={handleChange} required />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="afiliasi_kampus">Instansi / Kampus</label>
              <input className="form-input" type="text" id="afiliasi_kampus" name="afiliasi_kampus" value={formData.afiliasi_kampus} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="program_studi">Program Studi</label>
              <input className="form-input" type="text" id="program_studi" name="program_studi" value={formData.program_studi} onChange={handleChange} />
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="kota">Kota</label>
              <input className="form-input" type="text" id="kota" name="kota" value={formData.kota} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bidang_pekerjaan">Bidang Pekerjaan</label>
              <input className="form-input" type="text" id="bidang_pekerjaan" name="bidang_pekerjaan" value={formData.bidang_pekerjaan} onChange={handleChange} />
            </div>
          </div>

          <h3 style={{ marginTop: "var(--space-xl)", marginBottom: "var(--space-md)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-sm)" }}>Kontak & Sosial Media</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input" type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="no_hp">No HP</label>
              <input className="form-input" type="text" id="no_hp" name="no_hp" value={formData.no_hp} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="linkedin">URL LinkedIn</label>
              <input className="form-input" type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="instagram">URL Instagram</label>
              <input className="form-input" type="url" id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="facebook">URL Facebook</label>
              <input className="form-input" type="url" id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tiktok">URL TikTok</label>
              <input className="form-input" type="url" id="tiktok" name="tiktok" value={formData.tiktok} onChange={handleChange} />
            </div>
          </div>

          <h3 style={{ marginTop: "var(--space-xl)", marginBottom: "var(--space-md)", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-sm)" }}>Data Pekerjaan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="status_kepegawaian">Status Kepegawaian</label>
              <select className="form-input" id="status_kepegawaian" name="status_kepegawaian" value={formData.status_kepegawaian} onChange={handleChange} style={{ backgroundColor: "var(--color-bg-elevated)", color: "var(--color-text)", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                <option value="">-- Pilih Status --</option>
                <option value="PNS">PNS</option>
                <option value="Swasta">Swasta</option>
                <option value="Wirausaha">Wirausaha</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="posisi">Posisi / Jabatan</label>
              <input className="form-input" type="text" id="posisi" name="posisi" value={formData.posisi} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="tempat_bekerja">Nama Tempat Bekerja</label>
              <input className="form-input" type="text" id="tempat_bekerja" name="tempat_bekerja" value={formData.tempat_bekerja} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="medsos_tempat_bekerja">Sosmed Tempat Bekerja</label>
              <input className="form-input" type="text" id="medsos_tempat_bekerja" name="medsos_tempat_bekerja" value={formData.medsos_tempat_bekerja} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="alamat_bekerja">Alamat Bekerja</label>
            <textarea className="form-input" id="alamat_bekerja" name="alamat_bekerja" value={formData.alamat_bekerja} onChange={handleChange} rows="2" style={{ width: "100%", backgroundColor: "var(--color-bg-elevated)", color: "var(--color-text)", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)" }} />
          </div>

          {error && (
            <div
              style={{
                color: "var(--color-danger)",
                fontSize: "var(--font-size-sm)",
                marginBottom: "var(--space-md)",
                padding: "var(--space-md)",
                background: "var(--color-danger-bg)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              ❌ {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              justifyContent: "flex-end",
              marginTop: "var(--space-lg)",
            }}
          >
            <a href="/" className="btn btn-secondary">
              Batal
            </a>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              id="btn-submit-alumni"
            >
              {submitting ? (
                <>
                  <span
                    className="spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  ></span>
                  Menyimpan...
                </>
              ) : (
                "💾 Simpan Alumni"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
