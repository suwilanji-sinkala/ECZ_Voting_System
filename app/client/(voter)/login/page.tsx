"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
// Bootstrap Icons are loaded via CDN in layout.tsx

export default function VoterLogin() {
  const [NRC, setNRC] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/voters/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ NRC, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      
      // Store voter information in localStorage
      localStorage.setItem('voter', JSON.stringify({
        id: data.voter.id,
        First_Name: data.voter.First_Name,
        Last_Name: data.voter.Last_Name,
        NRC: NRC,
        Constituency: data.voter.Constituency,
        Ward: data.voter.Ward
      }));
      
      // Success: redirect
      router.push("/client/vote-candidates");
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image src="/ECZ_Logo.png" alt="ECZ Logo" width={200} height={100} />
        <h1 className={styles.title}>ECZ - Online Voting System</h1>
        <div className={styles.container}>
          <h2 className={styles.tagline}>Voter Sign In</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              className={styles.input}
              placeholder="NRC"
              value={NRC}
              onChange={e => setNRC(e.target.value)}
              required
            />
            <input
              type="password"
              className={styles.input}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}