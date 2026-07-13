export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>ComplyTrace API</h1>
      <p>Backend is running. Available endpoints:</p>
      <ul>
        <li><code>GET /api/health</code></li>
      </ul>
    </main>
  );
}
