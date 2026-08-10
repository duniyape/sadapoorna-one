import React, { useState, useRef } from 'react';
import { ArrowLeft, MessageSquare, ShieldCheck, Volume2, Globe, Wand2, Sparkles, Loader2, Bot, Play, Pause, Search } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { callGeminiText, callGeminiStructured, generateImagenBanner, generateGeminiSpeech } from '../utils/ai';

export default function AiSuitePage() {
  const navigate = useNavigate();
  const { showToast } = useOutletContext();
  const [aiActiveTab, setAiActiveTab] = useState('whatsapp');
  
  // WA Broadcast
  const [waProduct, setWaProduct] = useState('Sonamasuri Steam Rice (26kg)');
  const [waPrice, setWaPrice] = useState('₹1,450 / bag');
  const [waTone, setWaTone] = useState('Festival Special Discount');
  const [waCopyLoading, setWaCopyLoading] = useState(false);
  const [waImageLoading, setWaImageLoading] = useState(false);
  const [generatedWaText, setGeneratedWaText] = useState('');
  const [generatedWaImage, setGeneratedWaImage] = useState(null);

  // Risk Assessor
  const [selectedCustomer, setSelectedCustomer] = useState('Laxmi Supermarket');
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskResult, setRiskResult] = useState(null);

  // Voice Digest
  const [ttsLoading, setTtsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // APMC Search
  const [apmcQuery, setApmcQuery] = useState('Current APMC mandi rates for paddy and wheat in Karnataka');
  const [apmcLoading, setApmcLoading] = useState(false);
  const [apmcResult, setApmcResult] = useState(null);

  const handleGenerateWaBroadcast = async () => {
    setWaCopyLoading(true);
    setWaImageLoading(true);
    try {
      const promptText = `Write an engaging, persuasive WhatsApp broadcast message in English for Sadapoorna Rice & Grain Merchants.
Product: ${waProduct}
Special Rate: ${waPrice}
Offer Context: ${waTone}
Include emojis, clear call-to-action, payment details prompt, and contact info.`;

      const textRes = await callGeminiText(promptText, "You are an expert wholesale grain marketer for Sadapoorna Enterprise.");
      setGeneratedWaText(textRes.text);
      setWaCopyLoading(false);

      const imagePrompt = `A high quality, vibrant promotional advertisement banner for ${waProduct}, fresh Indian rice grain bags piled elegantly in a clean modern storehouse, warm cinematic lighting, photorealistic 4k.`;
      const imgRes = await generateImagenBanner(imagePrompt);
      if (imgRes) {
        setGeneratedWaImage(imgRes);
      }
    } catch (e) {
      showToast('AI Generation failed. Please try again.');
    } finally {
      setWaCopyLoading(false);
      setWaImageLoading(false);
    }
  };

  const handleEvaluateRisk = async () => {
    setRiskLoading(true);
    try {
      const prompt = `Evaluate the credit risk for client '${selectedCustomer}'.
Output structured JSON evaluation based on:
- Outstanding Balance: ₹1,42,000
- Overdue Days: 18 days
- Avg monthly order volume: ₹3,50,000
- Historical payment score: 72/100`;

      const schema = {
        type: "OBJECT",
        properties: {
          customerName: { type: "STRING" },
          riskLevel: { type: "STRING", enum: ["LOW", "MEDIUM", "HIGH"] },
          recommendedCreditLimit: { type: "STRING" },
          paymentDaysAllowed: { type: "NUMBER" },
          recommendedAction: { type: "STRING" },
          observations: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["customerName", "riskLevel", "recommendedCreditLimit", "paymentDaysAllowed", "recommendedAction", "observations"]
      };

      const result = await callGeminiStructured(prompt, schema);
      setRiskResult(result);
    } catch (e) {
      showToast('Risk assessment failed.');
    } finally {
      setRiskLoading(false);
    }
  };

  const handleGenerateDailyTts = async () => {
    setTtsLoading(true);
    try {
      const script = `Sadapoorna Enterprise Daily Operational Update. Total sales today ₹4.2 Lakhs. 12 new orders processed for Sonamasuri and Basmati rice. 3 credit limits pending manager approval. High priority: Due collection from Laxmi Supermarket is overdue by 18 days.`;
      const url = await generateGeminiSpeech(script);
      if (url) {
        setAudioUrl(url);
        showToast('Voice Digest synthesized successfully!');
      }
    } catch (e) {
      showToast('TTS synthesis failed.');
    } finally {
      setTtsLoading(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleSearchApmc = async () => {
    if (!apmcQuery.trim()) return;
    setApmcLoading(true);
    try {
      const res = await callGeminiText(apmcQuery, "You are a real-time agricultural mandi intelligence expert.", true);
      setApmcResult(res);
    } catch (e) {
      showToast('APMC search failed.');
    } finally {
      setApmcLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Sadapoorna Gemini AI Suite <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500">Powered by Gemini 3 Flash, Imagen 4, and Speech Synthesis</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setAiActiveTab('whatsapp')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'whatsapp' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> WhatsApp Broadcast
        </button>
        <button
          onClick={() => setAiActiveTab('risk')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'risk' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Credit Risk Assessor
        </button>
        <button
          onClick={() => setAiActiveTab('voice')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'voice' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Volume2 className="w-4 h-4" /> Daily Voice Digest
        </button>
        <button
          onClick={() => setAiActiveTab('apmc')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            aiActiveTab === 'apmc' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" /> APMC Mandi Live Search
        </button>
      </div>

      {aiActiveTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" /> WhatsApp Campaign Generator
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Grain / Product</label>
              <input type="text" value={waProduct} onChange={(e) => setWaProduct(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Special Rate Offer</label>
              <input type="text" value={waPrice} onChange={(e) => setWaPrice(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Hook / Context</label>
              <input type="text" value={waTone} onChange={(e) => setWaTone(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs" />
            </div>
            <button
              onClick={handleGenerateWaBroadcast}
              disabled={waCopyLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
            >
              {waCopyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Broadcast Text &amp; Image
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Campaign Preview</h3>
            {generatedWaText ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                {generatedWaText}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-400 border border-slate-100">
                Click generate to draft AI copy
              </div>
            )}

            {generatedWaImage && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">AI Banner Output (Imagen 4)</div>
                <img src={generatedWaImage} alt="Generated Banner" className="w-full h-48 object-cover rounded-2xl shadow-sm border" />
              </div>
            )}
          </div>
        </div>
      )}

      {aiActiveTab === 'risk' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> AI Credit Risk Evaluator
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer Account</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-white">
              <option>Laxmi Supermarket</option>
              <option>Apex Wholesale Traders</option>
              <option>Karnataka Grain Hub</option>
            </select>
          </div>
          <button
            onClick={handleEvaluateRisk}
            disabled={riskLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
          >
            {riskLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Evaluate Structured Risk Score
          </button>

          {riskResult && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">{riskResult.customerName}</span>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  riskResult.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {riskResult.riskLevel} RISK
                </span>
              </div>
              <div className="text-slate-600"><strong>Recommended Credit:</strong> {riskResult.recommendedCreditLimit}</div>
              <div className="text-slate-600"><strong>Action:</strong> {riskResult.recommendedAction}</div>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                {riskResult.observations?.map((obs, idx) => <li key={idx}>{obs}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {aiActiveTab === 'voice' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6 max-w-2xl">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-indigo-600" /> Audio Operational Digest
          </h3>
          <p className="text-xs text-slate-500">Synthesize audio summary of daily sales and overdue collections with Gemini Speech.</p>
          <button
            onClick={handleGenerateDailyTts}
            disabled={ttsLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
          >
            {ttsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Synthesize Daily Speech Digest
          </button>

          {audioUrl && (
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between">
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlayingAudio(false)} className="hidden" />
              <div className="text-xs font-bold text-indigo-900">Audio Ready (24kHz WAV)</div>
              <button onClick={toggleAudioPlayback} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-1">
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayingAudio ? 'Pause' : 'Play Digest'}
              </button>
            </div>
          )}
        </div>
      )}

      {aiActiveTab === 'apmc' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 max-w-3xl">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" /> Grounded APMC Mandi Search
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={apmcQuery}
              onChange={(e) => setApmcQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 border rounded-2xl text-xs focus:outline-none"
            />
            <button
              onClick={handleSearchApmc}
              disabled={apmcLoading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-2"
            >
              {apmcLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Fetch Rates
            </button>
          </div>

          {apmcResult && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="font-sans whitespace-pre-wrap leading-relaxed text-slate-800">{apmcResult.text}</div>
              {apmcResult.sources?.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-700">Grounding Web Sources:</div>
                  {apmcResult.sources.map((s, idx) => (
                    <a key={idx} href={s.uri} target="_blank" rel="noreferrer" className="block text-teal-600 hover:underline truncate">
                      ● {s.title} ({s.uri})
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
