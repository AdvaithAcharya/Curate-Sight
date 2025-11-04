import AnimatedContent from '../components/AnimatedContent';

export default function Privacy() {
  return (
    <AnimatedContent distance={120}>
      <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif mb-4">Privacy</h1>
      <p className="mb-3">CurateSight is privacy-first. We do not collect personal data, IP addresses, or identifiers. A random session UUID is stored locally to attribute scans anonymously.</p>
      <p className="mb-3">You can opt out of analytics anytime using the toggle on the Scanner page. When opted out, no events are sent.</p>
      <p className="mb-3">For explainability, we display the top visual labels detected by the recognition model and a confidence score.</p>
      </div>
    </AnimatedContent>
  );
}
