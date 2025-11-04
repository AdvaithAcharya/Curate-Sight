import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { api, getSessionId } from '../lib/api';
import AnimatedContent from '../components/AnimatedContent';

const videoConstraints = {
  facingMode: 'environment',
};

export default function Scanner() {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasStream, setHasStream] = useState(false);
  const navigate = useNavigate();

  const requestPermission = async () => {
    try {
      setError(null);
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    } catch (e) {
      setError('Camera permission denied or unavailable. Check browser site settings and allow camera.');
    }
  };

  const handleScan = async () => {
    setError(null);
    const img = webcamRef.current?.getScreenshot();
    if (!img) {
      setError('Camera not ready. Click "Enable camera" and allow access, then try again.');
      return;
    }
    setLoading(true);
    try {
      const optOut = localStorage.getItem('curatesight_optout') === 'true';
      const { data } = await api.post('/recognize', {
        image: img,
        sessionId: getSessionId(),
        optOut,
      });
      navigate(`/artwork/${data.artwork?._id || 'unknown'}`, { state: data });
    } catch (e) {
      if (e?.response?.status === 404) setError('No match found.');
      else setError('Scan failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const optOut = localStorage.getItem('curatesight_optout') === 'true';
      const { data } = await api.post('/recognize', {
        image: dataUrl,
        sessionId: getSessionId(),
        optOut,
      });
      navigate(`/artwork/${data.artwork?._id || 'unknown'}`, { state: data });
    } catch (e) {
      if (e?.response?.status === 404) setError('No match found.');
      else setError('Upload failed. Try another image.');
    } finally {
      setLoading(false);
      // reset input so same file can be selected again
      if (e.target) e.target.value = '';
    }
  };

  return (
    <AnimatedContent distance={120} direction="vertical" ease="power3.out" initialOpacity={0} animateOpacity threshold={0.2}>
      <div className="min-h-screen flex flex-col gap-4 items-center p-4">
      <h1 className="text-3xl font-serif">CurateSight – AI Museum Scanner</h1>
      <div className="w-full max-w-md aspect-[3/4] bg-black rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
          onUserMedia={() => setHasStream(true)}
          onUserMediaError={() => setHasStream(false)}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked={localStorage.getItem('curatesight_camera_enabled') !== 'false'}
            onChange={(e)=>{
              const v = e.target.checked;
              localStorage.setItem('curatesight_camera_enabled', String(v));
              if (v) requestPermission();
            }}
          />
          Use camera
        </label>
        {!hasStream && (
<button onClick={requestPermission} className="glass-btn text-sm">Enable camera</button>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleScan}
className="glass-btn disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Scanning…' : 'Scan'}
        </button>
<label className="glass-btn cursor-pointer disabled:opacity-50">
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          Upload photo
        </label>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="text-sm opacity-80">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            defaultChecked={localStorage.getItem('curatesight_optout') === 'true'}
            onChange={(e) => localStorage.setItem('curatesight_optout', String(e.target.checked))}
          />
          Opt out of anonymous analytics
        </label>
      </div>
      </div>
    </AnimatedContent>
  );
}
