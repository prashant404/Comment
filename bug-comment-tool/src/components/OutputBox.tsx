export default function OutputBox({ output }: { output: string }) {
  if (!output) {
    return (
      <div className="output-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#475569', fontSize: '0.9rem' }}>Comment will appear here...</p>
      </div>
    );
  }
  
  return (
    <div className="output-container">
      <pre className="output">{output}</pre>
    </div>
  );
}