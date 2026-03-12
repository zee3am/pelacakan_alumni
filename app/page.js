"use client";

import { useState, useEffect } from "react";

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

function getStatusIcon(status) {
  switch (status) {
    case "Belum Dilacak":
      return "⏳";
    case "Perlu Verifikasi":
      return "🔍";
    case "Teridentifikasi":
      return "✅";
    case "Belum Ditemukan":
      return "❌";
    default:
      return "📋";
  }
}

export default function DashboardPage() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingAll, setTrackingAll] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchAlumni = async () => {
    try {
      const res = await fetch("/api/alumni");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setAlumni(data);
      } else {
        setAlumni([]);
        if (data.error) showToast(data.error, "error");
      }
    } catch {
      setAlumni([]);
      showToast("Gagal memuat data alumni", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTrackAll = async () => {
    setTrackingAll(true);
    try {
      const res = await fetch("/api/cron", { method: "POST" });
      const data = await res.json();
      showToast(data.message, "success");
      fetchAlumni();
    } catch {
      showToast("Gagal menjalankan pelacakan", "error");
    } finally {
      setTrackingAll(false);
    }
  };

  // Calculate stats
  const totalAlumni = alumni.length;
  const belumDilacak = alumni.filter(
    (a) => a.status === "Belum Dilacak"
  ).length;
  const perluVerifikasi = alumni.filter(
    (a) => a.status === "Perlu Verifikasi"
  ).length;
  const teridentifikasi = alumni.filter(
    (a) => a.status === "Teridentifikasi"
  ).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard Pelacakan</h1>
          <p>Kelola dan pantau status pelacakan alumni secara real-time</p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleTrackAll}
          disabled={trackingAll}
          id="btn-track-all"
        >
          {trackingAll ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
              Melacak...
            </>
          ) : (
            <>🔍 Jalankan Pelacakan</>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <span className="stat-value">{totalAlumni}</span>
          <span className="stat-label">Total Alumni</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <span className="stat-value">{belumDilacak}</span>
          <span className="stat-label">Belum Dilacak</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔍</span>
          <span className="stat-value">{perluVerifikasi}</span>
          <span className="stat-label">Perlu Verifikasi</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <span className="stat-value">{teridentifikasi}</span>
          <span className="stat-label">Teridentifikasi</span>
        </div>
      </div>

      {/* Alumni Table */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : alumni.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>Belum ada data alumni</h3>
            <p>
              Mulai dengan menambahkan target alumni baru untuk dilacak melalui
              pencarian web otomatis.
            </p>
            <a
              href="/alumni/new"
              className="btn btn-primary mt-lg"
              style={{ display: "inline-flex", marginTop: "var(--space-lg)" }}
            >
              + Tambah Alumni Pertama
            </a>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table" id="alumni-table">
            <thead>
              <tr>
                <th>Nama Alumni</th>
                <th>Status</th>
                <th>Instansi</th>
                <th>Jabatan / Bidang</th>
                <th>Confidence</th>
                <th>Terakhir Dilacak</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {alumni.map((a) => {
                const topEvidence = a.evidences?.[0];
                const score = topEvidence?.confidence_score || 0;
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="alumni-name">{a.nama}</div>
                      <div className="alumni-meta">
                        {a.program_studi && `${a.program_studi}`}
                        {a.kota && ` • ${a.kota}`}
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(a.status)}>
                        {getStatusIcon(a.status)} {a.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--color-text-secondary)" }}>
                      {a.afiliasi_kampus || "—"}
                    </td>
                    <td style={{ color: "var(--color-text-secondary)" }}>
                      {a.bidang_pekerjaan || topEvidence?.ringkasan_jabatan?.substring(0, 50) || "—"}
                    </td>
                    <td>
                      {topEvidence ? (
                        <div className="confidence-bar-wrapper">
                          <div className="confidence-bar">
                            <div
                              className={`confidence-bar-fill ${getConfidenceClass(score)}`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className={`confidence-text`} style={{ color: score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                            {score}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-muted">
                        {a.last_tracked
                          ? new Date(a.last_tracked).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/alumni/${a.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Detail →
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
