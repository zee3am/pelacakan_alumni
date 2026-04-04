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

      <div className="card" style={{ maxWidth: 680, margin: "0 auto" }}>
        <form onSubmit={handleSubmit} id="form-new-alumni">
          <div className="form-group">
            <label className="form-label" htmlFor="nama">
              Nama Lengkap Alumni *
            </label>
            <input
              className="form-input"
              type="text"
              id="nama"
              name="nama"
              placeholder="Contoh: Muhammad Zulfikar"
              value={formData.nama}
              onChange={handleChange}
              required
            />
            <span className="form-hint">
              Masukkan nama lengkap untuk hasil pencarian optimal
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="afiliasi_kampus">
              Afiliasi Kampus / Universitas
            </label>
            <input
              className="form-input"
              type="text"
              id="afiliasi_kampus"
              name="afiliasi_kampus"
              placeholder="Contoh: Institut Teknologi Bandung"
              value={formData.afiliasi_kampus}
              onChange={handleChange}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-lg)",
            }}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="program_studi">
                Program Studi
              </label>
              <input
                className="form-input"
                type="text"
                id="program_studi"
                name="program_studi"
                placeholder="Contoh: Teknik Informatika"
                value={formData.program_studi}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="kota">
                Kota
              </label>
              <input
                className="form-input"
                type="text"
                id="kota"
                name="kota"
                placeholder="Contoh: Jakarta"
                value={formData.kota}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bidang_pekerjaan">
              Bidang Pekerjaan
            </label>
            <input
              className="form-input"
              type="text"
              id="bidang_pekerjaan"
              name="bidang_pekerjaan"
              placeholder="Contoh: Software Engineering"
              value={formData.bidang_pekerjaan}
              onChange={handleChange}
            />
            <span className="form-hint">
              Opsional. Membantu mempersempit hasil pencarian
            </span>
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
