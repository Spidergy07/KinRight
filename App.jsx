import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  Edit3,
  Image as ImageIcon,
  Languages,
  MapPin,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  Volume2
} from 'lucide-react';

const FOOD_DATABASE = {
  noodles: {
    id: 'noodles',
    name: 'Noodle Soup (ก๋วยเตี๋ยว)',
    thaiBase: 'ก๋วยเตี๋ยว',
    image: '🍜',
    description: 'Broth, noodles, herbs, and protein.',
    stall: 'Soup cart',
    match: '98%',
    time: '4 min',
    accent: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700'
    },
    steps: [
      {
        id: 'noodle_type',
        title: 'Choose Noodle',
        options: [
          { id: 'sen_lek', label: 'Thin Rice Noodle', thai: 'เส้นเล็ก', tags: [], aliases: ['rice noodles', 'thin noodle', 'sen lek'] },
          { id: 'sen_yai', label: 'Wide Rice Noodle', thai: 'เส้นใหญ่', tags: [], aliases: ['wide noodle', 'flat noodle', 'sen yai'] },
          { id: 'wun_sen', label: 'Glass Noodle', thai: 'วุ้นเส้น', tags: [], aliases: ['glass noodle', 'bean vermicelli'] },
          { id: 'ba_mee', label: 'Egg Noodle', thai: 'บะหมี่', tags: ['gluten'], aliases: ['egg noodle', 'wonton noodle', 'บะหมี่'] }
        ]
      },
      {
        id: 'soup_type',
        title: 'Choose Soup',
        options: [
          { id: 'clear', label: 'Clear Soup', thai: 'น้ำใส', tags: [], aliases: ['clear soup', 'broth', 'soup'] },
          { id: 'tom_yum', label: 'Tom Yum', thai: 'ต้มยำ', tags: ['peanut', 'spicy'], aliases: ['tom yum', 'spicy sour'] },
          { id: 'nam_tok', label: 'Boat Noodle (Blood Soup)', thai: 'น้ำตก', tags: ['pork', 'beef'], aliases: ['boat noodle', 'blood soup', 'nam tok'] },
          { id: 'dry', label: 'Dry Noodle', thai: 'แห้ง', tags: [], aliases: ['dry noodle', 'dry'] }
        ]
      },
      {
        id: 'protein',
        title: 'Choose Protein',
        options: [
          { id: 'pork', label: 'Pork', thai: 'หมู', tags: ['pork'], aliases: ['pork', 'หมู'] },
          { id: 'chicken', label: 'Chicken', thai: 'ไก่', tags: [], aliases: ['chicken', 'ไก่'] },
          { id: 'beef', label: 'Beef', thai: 'เนื้อ', tags: ['beef'], aliases: ['beef', 'braised beef', 'เนื้อ'] },
          { id: 'wonton', label: 'Wonton', thai: 'เกี๊ยว', tags: ['pork', 'gluten'], aliases: ['wonton', 'เกี๊ยว'] },
          { id: 'tofu', label: 'Tofu (Vegan)', thai: 'เต้าหู้', tags: ['vegan'], aliases: ['tofu', 'เต้าหู้'] }
        ]
      }
    ]
  },
  somtum: {
    id: 'somtum',
    name: 'Papaya Salad (ส้มตำ)',
    thaiBase: 'ส้มตำ',
    image: '🥗',
    description: 'Sweet, sour, salty, and spicy.',
    stall: 'Salad stall',
    match: '95%',
    time: '3 min',
    accent: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    },
    steps: [
      {
        id: 'type',
        title: 'Style',
        options: [
          { id: 'thai', label: 'Thai Style (Sweet & Sour)', thai: 'ตำไทย', tags: ['peanut'], aliases: ['thai style', 'sweet sour', 'ตำไทย'] },
          { id: 'plara', label: 'Fermented Fish Style', thai: 'ตำปลาร้า', tags: ['seafood'], aliases: ['fermented fish', 'plara', 'ปลาร้า'] },
          { id: 'cucumber', label: 'Cucumber Salad', thai: 'ตำแตง', tags: ['seafood'], aliases: ['cucumber', 'ตำแตง'] }
        ]
      },
      {
        id: 'spice',
        title: 'Spice Level',
        options: [
          { id: 'no_spice', label: 'No Chili', thai: 'ไม่พริกเลย', tags: [], aliases: ['no chili', 'no spice', 'not spicy'] },
          { id: 'mild', label: '1-2 Chilis', thai: 'เผ็ดน้อย (พริก 1-2 เม็ด)', tags: [], aliases: ['mild', 'less spicy'] },
          { id: 'spicy', label: 'Thai Spicy', thai: 'เผ็ดปกติ', tags: [], aliases: ['thai spicy', 'spicy'] }
        ]
      },
      {
        id: 'addon',
        title: 'Add-on',
        options: [
          { id: 'none', label: 'No Add-on', thai: 'ไม่ใส่เครื่องเพิ่ม', tags: [], aliases: [] },
          { id: 'salted_egg', label: 'Salted Egg', thai: 'ไข่เค็ม', tags: [], aliases: ['salted egg'] },
          { id: 'shrimp', label: 'Shrimp', thai: 'กุ้งสด', tags: ['seafood'], aliases: ['shrimp', 'prawn'] }
        ]
      }
    ]
  },
  padthai: {
    id: 'padthai',
    name: 'Pad Thai (ผัดไทย)',
    thaiBase: 'ผัดไทย',
    image: '🥡',
    description: 'Classic stir-fry with your protein.',
    stall: 'Wok station',
    match: '92%',
    time: '5 min',
    accent: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700'
    },
    steps: [
      {
        id: 'protein',
        title: 'Meat',
        options: [
          { id: 'shrimp', label: 'Shrimp', thai: 'กุ้งสด', tags: ['seafood'], aliases: ['shrimp', 'prawn', 'กุ้ง'] },
          { id: 'chicken', label: 'Chicken', thai: 'ไก่', tags: [], aliases: ['chicken', 'ไก่'] },
          { id: 'pork', label: 'Pork', thai: 'หมู', tags: ['pork'], aliases: ['pork', 'หมู'] },
          { id: 'veg', label: 'Tofu/Veg', thai: 'มังสวิรัติ', tags: ['vegan'], aliases: ['tofu', 'vegetarian', 'veg'] }
        ]
      },
      {
        id: 'egg',
        title: 'Egg',
        options: [
          { id: 'normal', label: 'With Egg', thai: 'ใส่ไข่', tags: [], aliases: ['egg'] },
          { id: 'no_egg', label: 'No Egg', thai: 'ไม่ใส่ไข่', tags: [], aliases: ['no egg'] }
        ]
      },
      {
        id: 'taste',
        title: 'Taste',
        options: [
          { id: 'normal', label: 'Normal Taste', thai: 'รสปกติ', tags: [], aliases: [] },
          { id: 'less_sweet', label: 'Less Sweet', thai: 'หวานน้อย', tags: [], aliases: ['less sweet'] },
          { id: 'less_spicy', label: 'Less Spicy', thai: 'เผ็ดน้อย', tags: [], aliases: ['less spicy', 'mild'] }
        ]
      }
    ]
  }
};

const MAX_ANALYSIS_UPLOAD_BYTES = 3.8 * 1024 * 1024;
const IMAGE_MAX_DIMENSION = 1600;
const THAI_VOICE_PREFERENCES = [
  /siri/i,
  /kanya/i,
  /narisa/i,
  /apple/i,
  /google.*thai/i,
  /thai/i,
  /ไทย/i
];

const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (typeof window === 'undefined') return configuredUrl || 'http://localhost:3000';

  const pageHost = window.location.hostname;
  const isLocalPage =
    ['localhost', '127.0.0.1', '::1'].includes(pageHost) ||
    pageHost.startsWith('192.168.') ||
    pageHost.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(pageHost);
  const fallbackUrl = isLocalPage ? `${window.location.protocol}//${pageHost}:3000` : window.location.origin;

  if (!configuredUrl) return fallbackUrl;

  try {
    const url = new URL(configuredUrl, window.location.origin);
    const pageIsLan = isLocalPage && !['localhost', '127.0.0.1', '::1'].includes(pageHost);
    const apiIsLocalhost = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);

    if (pageIsLan && apiIsLocalhost) {
      url.hostname = pageHost;
    }

    return url.origin;
  } catch {
    return fallbackUrl;
  }
};

const API_BASE_URL = getApiBaseUrl();

const titleCase = value => value.charAt(0).toUpperCase() + value.slice(1);

const getProfileInstructions = profile => String(profile?.instructions || '').trim();

const hasAny = (value, patterns) => patterns.some(pattern => pattern.test(value));

const normalizeSearchText = value => String(value || '').toLowerCase();

const deriveProfileConstraints = profile => {
  const instructions = getProfileInstructions(profile).toLowerCase();
  const allergyContext = /แพ้|allerg|avoid|no |ไม่กิน|ห้าม|can't|cannot/i.test(instructions);

  const allergies = {
    peanut: allergyContext && hasAny(instructions, [/ถั่ว/i, /peanut/i]),
    seafood: allergyContext && hasAny(instructions, [/กุ้ง/i, /ปู/i, /หอย/i, /อาหารทะเล/i, /shrimp/i, /prawn/i, /crab/i, /shellfish/i, /seafood/i]),
    gluten: allergyContext && hasAny(instructions, [/กลูเตน/i, /แป้งสาลี/i, /wheat/i, /gluten/i])
  };

  const dietary = {
    vegan: hasAny(instructions, [/มังสวิรัติ/i, /กินเจ/i, /vegan/i, /vegetarian/i]),
    halal: hasAny(instructions, [/ฮาลาล/i, /halal/i, /ไม่กินหมู/i, /ไม่เอาหมู/i, /no pork/i])
  };

  return { allergies, dietary, instructions: getProfileInstructions(profile) };
};

const BrandLockup = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
      <span className="text-[13px] font-black leading-none tracking-wide">KR</span>
    </div>
    <div className="min-w-0">
      <p className={`${compact ? 'text-lg' : 'text-3xl'} font-extrabold leading-none text-slate-950`}>KinRight</p>
      <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-orange-600">กิน-ไร้ท์ • Eat right</p>
    </div>
  </div>
);

const buildOrderStateFromText = (food, values = []) => {
  const text = values.map(normalizeSearchText).join(' ');
  const initialState = {};

  food.steps.forEach(step => {
    const match = step.options.find(option => {
      const candidates = [option.id, option.label, option.thai, ...(option.aliases || []), ...(option.tags || [])];
      return candidates.some(candidate => candidate && text.includes(normalizeSearchText(candidate)));
    });

    if (match) initialState[step.id] = match.id;
  });

  return initialState;
};

const getThaiSpeechVoice = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  const thaiVoices = voices.filter(voice => /^th(-|_|$)/i.test(voice.lang) || /thai|ไทย/i.test(voice.name));

  return (
    THAI_VOICE_PREFERENCES.map(pattern => thaiVoices.find(voice => pattern.test(voice.name))).find(Boolean) ||
    thaiVoices[0] ||
    null
  );
};

const loadImageElement = file =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this image. Try another photo.'));
    };
    image.src = url;
  });

const canvasToBlob = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Could not prepare this image for upload.'));
          return;
        }

        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });

const prepareImageForUpload = async file => {
  if (!file.type.startsWith('image/')) return file;
  if (file.size <= MAX_ANALYSIS_UPLOAD_BYTES) return file;

  const image = await loadImageElement(file);
  const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare this image for upload.');

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.82, 0.72, 0.62, 0.52]) {
    const blob = await canvasToBlob(canvas, quality);

    if (blob.size <= MAX_ANALYSIS_UPLOAD_BYTES) {
      const filename = file.name.replace(/\.[^.]+$/, '') || 'food-photo';
      return new File([blob], `${filename}.jpg`, { type: 'image/jpeg' });
    }
  }

  throw new Error('Photo is too large for deployment upload. Crop it or take a closer photo.');
};

export default function App() {
  const [view, setView] = useState('onboarding');
  const [profile, setProfile] = useState({
    instructions: ''
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [orderState, setOrderState] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [customNote, setCustomNote] = useState('');
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [scanSource, setScanSource] = useState({ type: 'camera', name: '' });
  const [scanPreviewUrl, setScanPreviewUrl] = useState('');
  const [scanAnalysis, setScanAnalysis] = useState({ status: 'idle', data: null, error: '' });
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const derivedProfile = useMemo(() => deriveProfileConstraints(profile), [profile]);
  const profileInstructions = derivedProfile.instructions;
  const hasActiveAllergy = Object.values(derivedProfile.allergies).some(Boolean);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const startOrdering = (foodId, analysis = null) => {
    const food = FOOD_DATABASE[foodId];
    if (!food) return;

    setSelectedFood(food);
    setSelectedAnalysis(analysis);

    const initialState = buildOrderStateFromText(food, [
      analysis?.dishName,
      analysis?.thaiName,
      analysis?.englishSummary,
      ...(analysis?.likelyIngredients || []),
      ...(analysis?.detectedText || [])
    ]);
    setOrderState(initialState);
    setCurrentStepIndex(0);
    setCustomNote('');
    setShowAllergyModal(false);
    setView('ordering');
  };

  const selectOption = (stepId, optionId) => {
    setOrderState(prev => ({ ...prev, [stepId]: optionId }));
  };

  const getEnglishSummary = () => {
    if (!selectedFood) return '';

    const summary = [selectedFood.name.split(' (')[0]];

    if (!selectedFood.steps?.length) return summary.join(' • ');

    selectedFood.steps.forEach(step => {
      if (orderState[step.id]) {
        const option = step.options.find(o => o.id === orderState[step.id]);
        if (option && step.id !== 'spice') summary.push(option.label);
      }
    });

    if (selectedFood.id === 'somtum' && orderState.spice) {
      const spiceOpt = selectedFood.steps
        .find(step => step.id === 'spice')
        .options.find(option => option.id === orderState.spice);
      summary.push(spiceOpt.label);
    } else {
      if (profileInstructions) summary.push(`Profile: ${profileInstructions}`);
    }

    const note = customNote.trim();
    if (note) summary.push(`Note: ${note}`);

    return summary.join(' • ');
  };

  const finishOrder = () => {
    const hasDetectedRisk =
      selectedAnalysis?.allergyRisks?.length > 0 ||
      selectedAnalysis?.dietaryRisks?.length > 0;

    if (hasActiveAllergy || hasDetectedRisk) {
      setShowAllergyModal(true);
      return;
    }

    setView('result');
  };

  const openScanner = () => {
    setScanSource({ type: 'camera', name: '' });
    setScanPreviewUrl('');
    setScanAnalysis({ status: 'idle', data: null, error: '' });
    setSelectedAnalysis(null);
    setView('scanning');
  };

  const analyzeUploadedImage = async file => {
    if (!file) return;

    setScanSource({ type: 'photo', name: file.name });
    setScanPreviewUrl(URL.createObjectURL(file));
    setScanAnalysis({ status: 'loading', data: null, error: '' });

    try {
      const uploadFile = await prepareImageForUpload(file);
      const compressed = uploadFile !== file;
      setScanSource({
        type: 'photo',
        name: compressed ? `${file.name} optimized for upload` : file.name
      });

      const formData = new FormData();
      formData.append('image', uploadFile, uploadFile.name || 'food-photo.jpg');
      formData.append('profile', JSON.stringify(profile));

      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error || 'Image analysis failed.');
      }

      setScanAnalysis({ status: 'done', data: body, error: '' });
    } catch (error) {
      const rawMessage = error.message || 'Image analysis failed.';
      const message =
        rawMessage === 'Load failed' || rawMessage === 'Failed to fetch'
          ? `Cannot reach API at ${API_BASE_URL}. Start the API server and use the same Wi-Fi.`
          : rawMessage;
      setScanAnalysis({ status: 'error', data: null, error: message });
    }
  };

  const generateThaiOrder = () => {
    if (!selectedFood) return '';

    const parts = [`เอา${selectedFood.thaiBase ?? selectedFood.name.split(' ')[0]}`];

    selectedFood.steps?.forEach(step => {
      if (orderState[step.id]) {
        const option = step.options.find(o => o.id === orderState[step.id]);
        if (option && step.id !== 'spice') parts.push(option.thai);
      }
    });

    if (selectedFood.id === 'somtum' && orderState.spice) {
      const spiceOpt = selectedFood.steps
        .find(step => step.id === 'spice')
        .options.find(option => option.id === orderState.spice);
      parts.push(spiceOpt.thai);
    } else {
      if (profileInstructions) parts.push(profileInstructions);
    }

    const warnings = [];
    if (derivedProfile.allergies.peanut) warnings.push('Severe peanut allergy. Strictly no peanuts.');
    if (derivedProfile.allergies.seafood) warnings.push('Seafood allergy.');
    if (derivedProfile.allergies.gluten) warnings.push('Gluten/Wheat allergy.');
    if (derivedProfile.dietary.vegan) warnings.push('Vegan/Vegetarian. No fish sauce or meat.');
    if (derivedProfile.dietary.halal) warnings.push('No pork.');
    if (profileInstructions) warnings.push(`Dietary profile: ${profileInstructions}`);
    if (selectedAnalysis?.allergyRisks?.length) {
      warnings.push(`AI warning: May contain ${selectedAnalysis.allergyRisks.map(risk => risk.name).join(', ')}. Please check with the restaurant first.`);
    }
    if (selectedAnalysis?.dietaryRisks?.length) {
      warnings.push(`AI warning regarding ${selectedAnalysis.dietaryRisks.map(risk => risk.name || risk.type).join(', ')}. Please check with the restaurant first.`);
    }

    const note = customNote.trim();
    const noteText = note ? ` (Additional request: ${note})` : '';
    const orderText = parts.join(' ');
    const warningText = warnings.length > 0 ? ` (${warnings.join(', ')})` : '';

    return {
      main: orderText + noteText,
      warning: warningText,
      full: orderText + noteText + warningText
    };
  };

  const speakText = text => {
    const speechText = String(text || '').trim();

    if (speechText && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(speechText);
      const thaiVoice = getThaiSpeechVoice();

      utterance.lang = 'th-TH';
      if (thaiVoice) utterance.voice = thaiVoice;
      utterance.rate = 0.78;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const isOptionSafe = option => {
    if (derivedProfile.allergies.peanut && option.tags.includes('peanut')) return false;
    if (derivedProfile.allergies.seafood && option.tags.includes('seafood')) return false;
    if (derivedProfile.allergies.gluten && option.tags.includes('gluten')) return false;
    if (derivedProfile.dietary.vegan && (option.tags.includes('pork') || option.tags.includes('beef') || option.tags.includes('seafood'))) return false;
    if (derivedProfile.dietary.halal && option.tags.includes('pork')) return false;
    return true;
  };

  const renderProfileBadges = () =>
    profileInstructions ? (
      <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-100">
        <span>✎</span>
        <span className="truncate">{profileInstructions}</span>
      </span>
    ) : null;

  const renderOnboarding = () => (
    <div className="soft-canvas flex h-full min-h-0 flex-col overflow-y-auto p-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:p-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div>
          <BrandLockup />
          <p className="mt-6 text-sm font-semibold text-orange-600">Travel-friendly Thai ordering</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-slate-950">กินให้ถูก ถูกใจ ถูกต้อง.</h1>
          <p className="mt-3 text-base leading-6 text-slate-600">
            Order Thai street food with clearer choices, safer ingredients, and Thai text/audio for the vendor.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: ShieldCheck, label: 'Safety' },
            { icon: Languages, label: 'Thai text' },
            { icon: Volume2, label: 'Audio' }
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-slate-500" />
                <p className="mt-2 text-xs font-semibold text-slate-600">{item.label}</p>
              </div>
            );
          })}
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Your food profile</h2>
              <p className="mt-1 text-sm text-slate-500">Tell KinRight what to avoid and how you like your food.</p>
            </div>
            <Settings className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Food instruction</span>
              <textarea
                value={profile.instructions}
                onChange={event => setProfile({ ...profile, instructions: event.target.value })}
                rows={4}
                placeholder="Allergic to shrimp and peanuts, mild spice only"
                className="min-h-28 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold leading-6 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              />
              <span className="mt-2 block text-xs font-medium leading-5 text-slate-500">
                This is used for every scan and every generated Thai order.
              </span>
            </label>
          </div>
        </section>
      </div>

      <button type="button" onClick={() => setView('home')} className="primary-button mt-5">
        Continue <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );

  const renderHome = () => (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 animate-in fade-in duration-200">
      <header className="bg-white px-5 pb-5 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6 sm:pt-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <BrandLockup compact />
            <p className="mt-1 flex items-center gap-1 truncate text-sm font-bold text-slate-900">
              <MapPin className="h-4 w-4 shrink-0 text-orange-500" /> Yaowarat, Bangkok
            </p>
          </div>
          <button
            type="button"
            aria-label="Open profile settings"
            onClick={() => setView('onboarding')}
            className="icon-button"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold leading-tight text-slate-950">What do you want to order?</h1>
        <button type="button" onClick={openScanner} className="mt-5 flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-100">
          <Search className="h-5 w-5 shrink-0 text-orange-500" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-slate-900">Scan food or menu</span>
            <span className="block truncate text-sm text-slate-500">Camera or photo upload</span>
          </span>
          <ScanLine className="h-5 w-5 shrink-0 text-slate-400" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-28 sm:p-6 sm:pb-28">
        <div className="mb-5 flex flex-wrap gap-2">{renderProfileBadges()}</div>

        <section className="mb-7">
          {/* Manual order removed as requested */}
        </section>
      </div>

      <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 px-5">
        <button type="button" onClick={openScanner} className="primary-button pointer-events-auto shadow-lg shadow-orange-200/70">
          <Camera className="h-5 w-5" />
          Scan menu
        </button>
      </div>
    </div>
  );

  const renderScanning = () => (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 animate-in fade-in duration-200">
      <header className="border-b border-slate-200 bg-white px-5 pb-4 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:pt-8">
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3">
          <div />
          <p className="text-center text-base font-bold text-slate-950">Scan food or menu</p>
          <label className="icon-button cursor-pointer">
            <span className="sr-only">Take or upload photo</span>
            <ImageIcon className="h-5 w-5" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = '';
                analyzeUploadedImage(file);
              }}
            />
          </label>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-7 sm:p-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="overflow-hidden rounded-lg bg-slate-100">
            {scanPreviewUrl ? (
              <img src={scanPreviewUrl} alt="Selected food or menu" className="h-64 w-full object-cover" />
            ) : (
              <div className="grid h-64 place-items-center px-6 text-center">
                <div>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-orange-100 text-orange-600">
                    <Camera className="h-7 w-7" />
                  </div>
                  <p className="mt-4 font-bold text-slate-950">Take a photo to analyze</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">Use a clear photo of the dish, menu, or food stall sign.</p>
                </div>
              </div>
            )}
          </div>

          <label className="primary-button mt-4 cursor-pointer">
            <Camera className="h-5 w-5" />
            Take or choose photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = '';
                analyzeUploadedImage(file);
              }}
            />
          </label>

          {scanSource.type === 'photo' && (
            <p className="mt-3 truncate text-center text-xs text-slate-400">{scanSource.name}</p>
          )}
        </section>

        {scanAnalysis.status === 'loading' && (
          <div className="mt-4 rounded-lg border border-orange-100 bg-white p-4 text-slate-900 shadow-sm" role="status" aria-live="polite">
            <div className="flex items-start gap-3">
              <div className="processing-spinner mt-1" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">Processing your photo</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">This usually takes 10-30 seconds. Keep this page open.</p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-orange-100">
              <div className="processing-bar h-full rounded-full bg-orange-500" />
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              {[
                'Uploading image temporarily',
                'Gemini is reading the food/menu',
                'Deleting the upload after analysis'
              ].map((label, index) => (
                <div key={label} className="flex items-center gap-2 text-slate-600">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-orange-50 text-[11px] font-bold text-orange-600">
                    {index + 1}
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <button type="button" disabled className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-100 font-bold text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              Processing...
            </button>
          </div>
        )}

        {scanAnalysis.status === 'error' && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-red-800">
            <p className="font-bold">Could not analyze image</p>
            <p className="mt-1 text-sm leading-5 text-red-700">{scanAnalysis.error}</p>
          </div>
        )}

        {scanAnalysis.status === 'done' && scanAnalysis.data?.analysis && (
          <div className="mt-4 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">AI detection</p>
                <h3 className="mt-1 truncate text-xl font-extrabold text-slate-950">{scanAnalysis.data.analysis.dishName}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-500">{scanAnalysis.data.analysis.englishSummary}</p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                {Math.round((scanAnalysis.data.analysis.confidence || 0) * 100)}%
              </span>
            </div>

            {scanAnalysis.data.analysis.allergyRisks?.length > 0 && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                Risk: {scanAnalysis.data.analysis.allergyRisks.map(risk => risk.name).join(', ')}
              </div>
            )}

            {scanAnalysis.data.analysis.likelyIngredients?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Detected ingredients</p>
                <div className="flex flex-wrap gap-2">
                  {scanAnalysis.data.analysis.likelyIngredients.map(ing => (
                    <span key={ing} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setView('onboarding')} className="secondary-button w-full">
                Edit profile
              </button>
              {FOOD_DATABASE[scanAnalysis.data.analysis.dishId] ? (
                <button type="button" onClick={() => startOrdering(scanAnalysis.data.analysis.dishId, scanAnalysis.data.analysis)} className="primary-button">
                  Use result <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={() => setScanAnalysis({ status: 'idle', data: null, error: '' })} className="primary-button">
                  Scan again <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );

  const renderOrdering = () => {
    if (!selectedFood) return null;

    const currentStep = selectedFood.steps[currentStepIndex];
    const isLastStep = currentStepIndex === selectedFood.steps.length - 1;
    const selectedCount = Object.keys(orderState).length;

    return (
      <div className="relative flex h-full min-h-0 flex-col bg-slate-50 animate-in fade-in duration-200">
        <header className="border-b border-slate-200 bg-white px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Back to home" onClick={() => setView('home')} className="icon-button">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Step {currentStepIndex + 1} of {selectedFood.steps.length}
              </p>
              <h2 className="truncate text-lg font-bold text-slate-950">{selectedFood.name}</h2>
            </div>
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${selectedFood.accent.bg} text-2xl`}>{selectedFood.image}</div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-3xl font-extrabold leading-tight text-slate-950">{currentStep.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{selectedCount} selected so far</p>
          </div>

          <div className="space-y-3">
            {currentStep.options.map(option => {
              const safe = isOptionSafe(option);
              const isSelected = orderState[currentStep.id] === option.id;

              if (!safe) {
                return (
                  <div key={option.id} className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-red-700 line-through">{option.label}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5" /> Conflicts with your profile
                      </p>
                    </div>
                    <ShieldCheck className="h-5 w-5 shrink-0 text-red-400" />
                  </div>
                );
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectOption(currentStep.id, option.id)}
                  className={`flex min-h-[74px] w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition-colors ${
                    isSelected ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950">{option.label}</p>
                    <p className="mt-1 text-base font-semibold text-slate-500">{option.thai}</p>
                    {option.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {option.tags.map(tag => (
                          <span key={tag} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                            {titleCase(tag)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isSelected ? <CheckCircle2 className="h-6 w-6 shrink-0 text-orange-500" /> : <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          {isLastStep && (
            <label className="mb-4 block animate-in slide-in-from-bottom-2 duration-200">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Edit3 className="h-4 w-4 text-slate-400" />
                Special note
              </span>
              <input
                type="text"
                value={customNote}
                onChange={event => setCustomNote(event.target.value)}
                placeholder="Take away, no ice, less sugar..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              />
            </label>
          )}

          <div className="flex gap-3">
            <button type="button" disabled={currentStepIndex === 0} onClick={() => setCurrentStepIndex(prev => prev - 1)} className="secondary-button w-full disabled:opacity-40">
              Back
            </button>
            <button
              type="button"
              disabled={!orderState[currentStep.id]}
              onClick={() => {
                if (isLastStep) finishOrder();
                else setCurrentStepIndex(prev => prev + 1);
              }}
              className="primary-button flex-1 disabled:bg-slate-300 disabled:shadow-none"
            >
              {isLastStep ? 'Generate Thai order' : 'Next'}
            </button>
          </div>
        </div>

        {showAllergyModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-5 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl animate-in zoom-in-95 duration-200">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-950">Allergy warning</h3>
              <p className="mt-2 text-sm leading-5 text-slate-500">
                This order includes allergy warnings. Make sure the vendor sees the next screen.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">{renderProfileBadges()}</div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setShowAllergyModal(false)} className="secondary-button justify-center">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAllergyModal(false);
                    setView('result');
                  }}
                  className="rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (!selectedFood) return null;

    const orderData = generateThaiOrder();

    return (
      <div className="soft-canvas flex h-full min-h-0 flex-col animate-in fade-in duration-200">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 p-5 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur sm:p-6">
          <button type="button" aria-label="Back to order" onClick={() => setView('ordering')} className="icon-button">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <span className="font-bold text-slate-950">Your order</span>
          <div className="w-10" /> {/* Spacer to keep title centered if needed, or just leave empty */}
        </header>

        <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 overflow-y-auto p-5 sm:p-6">
          <div>
            <p className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
              <Languages className="h-3.5 w-3.5" />
              Show this to the vendor
            </p>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h1 className="break-words text-[2.15rem] font-extrabold leading-[1.1] text-slate-950 sm:text-5xl">{orderData.main}</h1>
              {orderData.warning && (
                <div className="mt-5 flex max-w-full items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-red-700">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="break-words text-base font-bold leading-6">{orderData.warning}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className={`grid h-12 w-12 place-items-center rounded-lg ${selectedFood.accent.bg} text-2xl`}>{selectedFood.image}</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">English check</p>
              <p className="mt-1 font-semibold leading-5 text-slate-800">{getEnglishSummary()}</p>
            </div>
          </div>

          <button type="button" onClick={() => speakText(orderData.full)} className="primary-button min-h-16">
            <Volume2 className="h-6 w-6" />
            Play Thai audio
          </button>
        </div>

        <div className="grid gap-3 p-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
          <button
            type="button"
            onClick={() => {
              setView('home');
              setSelectedFood(null);
              setOrderState({});
              setCurrentStepIndex(0);
              setCustomNote('');
              setSelectedAnalysis(null);
            }}
            className="primary-button"
          >
            Start new order
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-[100dvh] w-full bg-slate-100 sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-[min(860px,calc(100dvh-3rem))] sm:max-w-md sm:rounded-2xl sm:border sm:border-slate-200 sm:shadow-xl">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {view === 'onboarding' && renderOnboarding()}
          {view === 'home' && renderHome()}
          {view === 'scanning' && renderScanning()}
          {view === 'ordering' && renderOrdering()}
          {view === 'result' && renderResult()}
        </div>
      </div>
    </main>
  );
}
