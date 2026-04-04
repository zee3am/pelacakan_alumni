"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

function getStatusBadgeClass(status) {
  switch (status) {
    case "Belum Dilacak":
      return "badge badge-belum";
    case "Perlu Verifikasi":
      return "badge badge-verifikasi";
    case "Teridentifikasi":
      return "badge badge-teridentifikasi";
    case "Belum Ditemukan":
      return "badge badge-tidak";
    default:
      return "badge badge-belum";
  }
}

function getConfidenceClass(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function getConfidenceLabelBadge(label) {
  if (label === "Kemungkinan Kuat") return "badge badge-kuat";
  if (label === "Perlu Verifikasi") return "badge badge-verifikasi";
  return "badge badge-cocok";
}

export default function AlumniDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // State untuk form manual
  const [showManualForm, setShowManualForm] = useState(false);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualData, setManualData] = useState({ url: "", sumber: "", ringkasan_jabatan: "" });

  const fetchAlumni = async () => {
    try {
      const res = await fetch(`/api/alumni/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setAlumni(data);
    } catch {
      setAlumni(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTrack = async () => {
    setTracking(true);
    try {
      const res = await fetch(`/api/cron?alumniId=${id}`, { method: "POST" });
      const data = await res.json();
      showToast(data.message || "Pelacakan selesai!", "success");
      fetchAlumni();
    } catch {
      showToast("Gagal menjalankan pelacakan", "error");
    } finally {
      setTracking(false);
    }
  };

  const handleVerify = async (evidenceId) => {
    try {
      const res = await fetch(`/api/alumni/${id}/evidence/${evidenceId}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error();
      showToast("Evidence diverifikasi! Status diperbarui.", "success");
      fetchAlumni();
    } catch {
      showToast("Gagal memverifikasi evidence", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus alumni ini beserta seluruh data pelacakannya?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/alumni/${id}`, { method: "DELETE" });
      router.push("/");
    } catch {
      showToast("Gagal menghapus alumni", "error");
      setDeleting(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualData.url) return showToast("URL wajib diisi", "error");
    
    setSubmittingManual(true);
    try {
      const res = await fetch(`/api/alumni/${id}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualData),
      });

      if (!res.ok) throw new Error();
      
      showToast("Bukti manual berhasil ditambahkan!", "success");
      setShowManualForm(false);
      setManualData({ url: "", sumber: "", ringkasan_jabatan: "" }); // reset
      fetchAlumni();
    } catch {
      showToast("Gagal menambahkan bukti manual", "error");
    } finally {
      setSubmittingManual(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Alumni tidak ditemukan</h3>
          <p>Data alumni yang dicari tidak tersedia.</p>
          <a href="/" className="btn btn-primary mt-lg" style={{ display: "inline-flex", marginTop: "var(--space-lg)" }}>
            ← Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <a href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: "var(--space-sm)" }}>
            ← Kembali ke Dashboard
          </a>
          <h1>{alumni.nama}</h1>
          <p>Detail profil dan jejak bukti pelacakan</p>
        </div>
        <div className="flex gap-sm">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowManualForm(true)}
          >
            + Bukti Manual
          </button>
          <button
            className="btn btn-primary"
            onClick={handleTrack}
            disabled={tracking}
            id="btn-track-single"
          >
            {tracking ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
                Melacak...
              </>
            ) : (
              <>🔍 Lacak Otomatis</>
            )}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            id="btn-delete-alumni"
          >
            🗑 Hapus
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Sidebar - Alumni Info */}
        <div className="detail-sidebar">
          <div className="card">
            <div className="section-title" style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--space-lg)" }}>
              📋 Informasi Target
            </div>
            <div className="detail-info">
              <div className="detail-info-row">
                <span className="detail-info-label">Status</span>
                <span className={getStatusBadgeClass(alumni.status)} style={{ alignSelf: "flex-start" }}>
                  {alumni.status}
                </span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Nama Lengkap</span>
                <span className="detail-info-value">{alumni.nama}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Afiliasi Kampus</span>
                <span className="detail-info-value">{alumni.afiliasi_kampus || "—"}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Program Studi</span>
                <span className="detail-info-value">{alumni.program_studi || "—"}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Kota</span>
                <span className="detail-info-value">{alumni.kota || "—"}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Bidang Pekerjaan</span>
                <span className="detail-info-value">{alumni.bidang_pekerjaan || "—"}</span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Terakhir Dilacak</span>
                <span className="detail-info-value">
                  {alumni.last_tracked
                    ? new Date(alumni.last_tracked).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Belum pernah"}
                </span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Jumlah Evidence</span>
                <span className="detail-info-value">
                  {alumni.evidences?.length || 0} hasil
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Evidence */}
        <div>
          <div className="section-title">
            🔎 Jejak Bukti Pelacakan ({alumni.evidences?.length || 0})
          </div>

          {!alumni.evidences || alumni.evidences.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">📡</div>
                <h3>Belum ada hasil pelacakan</h3>
                <p>
                  Klik tombol &quot;Jalankan Pelacakan&quot; untuk mulai mencari
                  informasi alumni dari sumber web terbuka.
                </p>
              </div>
            </div>
          ) : (
            <div className="evidence-list">
              {alumni.evidences.map((ev) => (
                <div
                  key={ev.id}
                  className={`evidence-card ${ev.is_verified ? "verified" : ""}`}
                >
                  <div className="evidence-header">
                    <div style={{ flex: 1 }}>
                      <div className="evidence-source">
                        {ev.is_verified && (
                          <span className="verified-badge" style={{ marginRight: 8 }}>
                            ✓ Terverifikasi
                          </span>
                        )}
                        {ev.sumber}
                      </div>
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="evidence-url"
                      >
                        {ev.url}
                      </a>
                    </div>
                  </div>

                  {ev.ringkasan_jabatan && (
                    <div className="evidence-snippet">{ev.ringkasan_jabatan}</div>
                  )}

                  <div className="evidence-footer">
                    <div className="flex items-center gap-md">
                      {/* Confidence Bar */}
                      <div className="confidence-bar-wrapper" style={{ minWidth: 140 }}>
                        <div className="confidence-bar">
                          <div
                            className={`confidence-bar-fill ${getConfidenceClass(ev.confidence_score)}`}
                            style={{ width: `${ev.confidence_score}%` }}
                          ></div>
                        </div>
                        <span
                          className="confidence-text"
                          style={{
                            color:
                              ev.confidence_score >= 70
                                ? "var(--color-success)"
                                : ev.confidence_score >= 40
                                ? "var(--color-warning)"
                                : "var(--color-danger)",
                          }}
                        >
                          {ev.confidence_score}%
                        </span>
                      </div>
                      <span className={getConfidenceLabelBadge(ev.confidence_label)}>
                        {ev.confidence_label}
                      </span>
                    </div>

                    <div className="flex gap-sm">
                      <span className="text-xs text-muted">
                        {new Date(ev.tanggal_ditemukan).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {!ev.is_verified && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleVerify(ev.id)}
                          id={`btn-verify-${ev.id}`}
                        >
                          ✓ Verifikasi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Tambah Bukti Manual */}
      {showManualForm && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: "100%", maxWidth: 500 }}>
            <h3>Tambah Bukti Manual</h3>
            <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
              Masukkan data pelacakan yang Anda temukan secara mandiri.
            </p>
            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <label className="form-label">URL / Tautan Profil</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://linkedin.com/in/..."
                  value={manualData.url}
                  onChange={(e) => setManualData({ ...manualData, url: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sumber</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contoh: LinkedIn, Berita Kampus"
                  value={manualData.sumber}
                  onChange={(e) => setManualData({ ...manualData, sumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ringkasan / Jabatan Pekerjaan</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Contoh: Bekerja sebagai Software Engineer sejak 2021"
                  value={manualData.ringkasan_jabatan}
                  onChange={(e) => setManualData({ ...manualData, ringkasan_jabatan: e.target.value })}
                ></textarea>
              </div>
              <div className="flex gap-sm" style={{ marginTop: "var(--space-lg)", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowManualForm(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={submittingManual}>
                  {submittingManual ? "Menyimpan..." : "Simpan Bukti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}
    </>
  );
}
