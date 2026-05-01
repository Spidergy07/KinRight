import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronLeft,
  Clock,
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
          { id: 'sen_lek', label: 'Thin Rice Noodle', thai: 'เส้นเล็ก', tags: [] },
          { id: 'sen_yai', label: 'Wide Rice Noodle', thai: 'เส้นใหญ่', tags: [] },
          { id: 'ba_mee', label: 'Egg Noodle', thai: 'บะหมี่', tags: ['gluten'] }
        ]
      },
      {
        id: 'soup_type',
        title: 'Choose Soup',
        options: [
          { id: 'clear', label: 'Clear Soup', thai: 'น้ำใส', tags: [] },
          { id: 'tom_yum', label: 'Tom Yum', thai: 'ต้มยำ', tags: ['peanut', 'spicy'] },
          { id: 'nam_tok', label: 'Boat Noodle (Blood Soup)', thai: 'น้ำตก', tags: ['pork', 'beef'] }
        ]
      },
      {
        id: 'protein',
        title: 'Choose Protein',
        options: [
          { id: 'pork', label: 'Pork', thai: 'หมู', tags: ['pork'] },
          { id: 'chicken', label: 'Chicken', thai: 'ไก่', tags: [] },
          { id: 'beef', label: 'Beef', thai: 'เนื้อ', tags: ['beef'] },
          { id: 'tofu', label: 'Tofu (Vegan)', thai: 'เต้าหู้', tags: ['vegan'] }
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
          { id: 'thai', label: 'Thai Style (Sweet & Sour)', thai: 'ตำไทย', tags: ['peanut'] },
          { id: 'plara', label: 'Fermented Fish Style', thai: 'ตำปลาร้า', tags: ['seafood'] }
        ]
      },
      {
        id: 'spice',
        title: 'Spice Level',
        options: [
          { id: 'no_spice', label: 'No Chili', thai: 'ไม่พริกเลย', tags: [] },
          { id: 'mild', label: '1-2 Chilis', thai: 'เผ็ดน้อย (พริก 1-2 เม็ด)', tags: [] },
          { id: 'spicy', label: 'Thai Spicy', thai: 'เผ็ดปกติ', tags: [] }
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
          { id: 'shrimp', label: 'Shrimp', thai: 'กุ้งสด', tags: ['seafood'] },
          { id: 'chicken', label: 'Chicken', thai: 'ไก่', tags: [] },
          { id: 'veg', label: 'Tofu/Veg', thai: 'มังสวิรัติ', tags: ['vegan'] }
        ]
      }
    ]
  }
};

const PROFILE_GROUPS = {
  allergies: [
    { id: 'peanut', label: 'Peanut', icon: '🥜' },
    { id: 'seafood', label: 'Seafood', icon: '🦐' },
    { id: 'gluten', label: 'Gluten', icon: '🌾' }
  ],
  dietary: [
    { id: 'vegan', label: 'Vegan', icon: '🌱' },
    { id: 'halal', label: 'Halal', icon: '✓' }
  ]
};

const SPICE_LABELS = ['None', 'Gentle', 'Mild', 'Medium', 'Hot', 'Local'];
const FOOD_LIST = Object.values(FOOD_DATABASE);

const titleCase = value => value.charAt(0).toUpperCase() + value.slice(1);

const ToggleChip = ({ active, danger, icon, label, onClick }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
      active
        ? danger
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`}
  >
    <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-base">{icon}</span>
    {label}
  </button>
);

export default function App() {
  const [view, setView] = useState('onboarding');
  const [profile, setProfile] = useState({
    allergies: { peanut: false, seafood: false, gluten: false },
    dietary: { vegan: false, halal: false },
    spiceLevel: 2
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [orderState, setOrderState] = useState({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [customNote, setCustomNote] = useState('');
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [scanSource, setScanSource] = useState({ type: 'camera', name: '' });
  const [orderHistory, setOrderHistory] = useState(() => {
    if (typeof window === 'undefined') return [];

    try {
      const saved = JSON.parse(window.localStorage.getItem('streetfood-order-history') || '[]');
      return Array.isArray(saved) ? saved.slice(0, 10) : [];
    } catch {
      return [];
    }
  });

  const profileBadges = useMemo(() => {
    const allergyBadges = PROFILE_GROUPS.allergies
      .filter(item => profile.allergies[item.id])
      .map(item => ({ ...item, tone: 'danger' }));
    const dietaryBadges = PROFILE_GROUPS.dietary
      .filter(item => profile.dietary[item.id])
      .map(item => ({ ...item, tone: 'safe' }));

    return [...allergyBadges, ...dietaryBadges];
  }, [profile]);

  const spiceCaption = SPICE_LABELS[profile.spiceLevel];
  const hasActiveAllergy = Object.values(profile.allergies).some(Boolean);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('streetfood-order-history', JSON.stringify(orderHistory.slice(0, 10)));
      } catch {
        // History still works in memory if localStorage is unavailable.
      }
    }
  }, [orderHistory]);

  const toggleProfile = (category, item) => {
    setProfile(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: !prev[category][item]
      }
    }));
  };

  const startOrdering = foodId => {
    setSelectedFood(FOOD_DATABASE[foodId]);
    setOrderState({});
    setCurrentStepIndex(0);
    setCustomNote('');
    setShowAllergyModal(false);
    setView('ordering');
  };

  const selectOption = (stepId, optionId) => {
    setOrderState(prev => ({ ...prev, [stepId]: optionId }));

    if (currentStepIndex < selectedFood.steps.length - 1) {
      setTimeout(() => setCurrentStepIndex(prev => prev + 1), 220);
    }
  };

  const getEnglishSummary = () => {
    if (!selectedFood) return '';

    const summary = [selectedFood.name.split(' (')[0]];

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
    } else if (profile.spiceLevel === 0) {
      summary.push('No Spice');
    } else if (profile.spiceLevel <= 2) {
      summary.push('Mild Spice');
    } else {
      summary.push(`${spiceCaption} Spice`);
    }

    const note = customNote.trim();
    if (note) summary.push(`Note: ${note}`);

    return summary.join(' • ');
  };

  const saveToHistory = () => {
    if (!selectedFood) return;

    const historyItem = {
      id: Date.now(),
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      image: selectedFood.image,
      englishSummary: getEnglishSummary(),
      orderState: { ...orderState },
      customNote: customNote.trim(),
      date: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setOrderHistory(prev => [historyItem, ...prev].slice(0, 10));
  };

  const loadHistoryItem = item => {
    const food = FOOD_DATABASE[item.foodId];
    if (!food) return;

    setSelectedFood(food);
    setOrderState(item.orderState || {});
    setCustomNote(item.customNote || '');
    setCurrentStepIndex(Math.max(food.steps.length - 1, 0));
    setShowAllergyModal(false);
    setView('result');
  };

  const finishOrder = () => {
    if (hasActiveAllergy) {
      setShowAllergyModal(true);
      return;
    }

    saveToHistory();
    setView('result');
  };

  const openScanner = () => {
    setScanSource({ type: 'camera', name: '' });
    setView('scanning');
  };

  const generateThaiOrder = () => {
    if (!selectedFood) return '';

    const parts = [`เอา${selectedFood.thaiBase ?? selectedFood.name.split(' ')[0]}`];

    selectedFood.steps.forEach(step => {
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
      if (profile.spiceLevel === 0) parts.push('ไม่เผ็ดเลย');
      else if (profile.spiceLevel <= 2) parts.push('เผ็ดน้อย');
    }

    const warnings = [];
    if (profile.allergies.peanut) warnings.push('แพ้ถั่วรุนแรง ห้ามใส่ถั่วเด็ดขาด');
    if (profile.allergies.seafood) warnings.push('แพ้อาหารทะเล');
    if (profile.allergies.gluten) warnings.push('แพ้กลูเตน/แป้งสาลี');
    if (profile.dietary.vegan) warnings.push('กินเจ/มังสวิรัติ ไม่ใส่น้ำปลาและเนื้อสัตว์');
    if (profile.dietary.halal) warnings.push('ไม่ใส่หมู');

    const note = customNote.trim();
    const noteText = note ? ` (เพิ่มเติม: ${note})` : '';
    const orderText = parts.join(' ');
    const warningText = warnings.length > 0 ? ` (${warnings.join(', ')})` : '';

    return {
      main: orderText + noteText,
      warning: warningText,
      full: orderText + noteText + warningText
    };
  };

  const speakText = text => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const isOptionSafe = option => {
    if (profile.allergies.peanut && option.tags.includes('peanut')) return false;
    if (profile.allergies.seafood && option.tags.includes('seafood')) return false;
    if (profile.allergies.gluten && option.tags.includes('gluten')) return false;
    if (profile.dietary.vegan && (option.tags.includes('pork') || option.tags.includes('beef') || option.tags.includes('seafood'))) return false;
    if (profile.dietary.halal && option.tags.includes('pork')) return false;
    return true;
  };

  const renderProfileBadges = () =>
    profileBadges.length > 0 ? (
      profileBadges.map(badge => (
        <span
          key={`${badge.tone}-${badge.id}`}
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
            badge.tone === 'danger' ? 'bg-red-50 text-red-700 ring-1 ring-red-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
          }`}
        >
          <span>{badge.icon}</span>
          {badge.label}
        </span>
      ))
    ) : (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
        <ShieldCheck className="h-3.5 w-3.5" />
        No restrictions
      </span>
    );

  const renderOnboarding = () => (
    <div className="soft-canvas flex h-full min-h-0 flex-col overflow-y-auto p-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:p-6">
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div>
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-lg bg-orange-100 text-orange-600">
            <Camera className="h-7 w-7" />
          </div>
          <p className="text-sm font-semibold text-orange-600">Travel-friendly Thai ordering</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-slate-950">StreetFood AI</h1>
          <p className="mt-3 text-base leading-6 text-slate-600">
            Choose food, avoid unsafe ingredients, and show a clear Thai order to the vendor.
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
              <p className="mt-1 text-sm text-slate-500">Set this once. You can edit it anytime.</p>
            </div>
            <Settings className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Allergies</label>
              <div className="flex flex-wrap gap-2">
                {PROFILE_GROUPS.allergies.map(allergy => (
                  <ToggleChip
                    key={allergy.id}
                    danger
                    active={profile.allergies[allergy.id]}
                    icon={allergy.icon}
                    label={allergy.label}
                    onClick={() => toggleProfile('allergies', allergy.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Dietary needs</label>
              <div className="flex flex-wrap gap-2">
                {PROFILE_GROUPS.dietary.map(diet => (
                  <ToggleChip
                    key={diet.id}
                    active={profile.dietary[diet.id]}
                    icon={diet.icon}
                    label={diet.label}
                    onClick={() => toggleProfile('dietary', diet.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Spice tolerance</span>
                <span className="text-orange-600">{spiceCaption}</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={profile.spiceLevel}
                onChange={event => setProfile({ ...profile, spiceLevel: parseInt(event.target.value, 10) })}
                className="friendly-range w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>None</span>
                <span>Local spicy</span>
              </div>
            </div>
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
            <p className="text-sm font-semibold text-slate-500">Current area</p>
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
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
              <Clock className="h-5 w-5 text-slate-400" />
              Recent orders
            </h2>
            <span className="text-xs font-semibold text-slate-400">{orderHistory.length}/10</span>
          </div>

          {orderHistory.length === 0 ? (
            <button type="button" onClick={openScanner} className="w-full rounded-lg border border-dashed border-slate-300 bg-white p-4 text-left">
              <p className="font-semibold text-slate-900">No orders yet</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">Create one order and it will be saved here.</p>
            </button>
          ) : (
            <div className="grid gap-2">
              {orderHistory.map(item => {
                const food = FOOD_DATABASE[item.foodId];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadHistoryItem(item)}
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${food?.accent.bg || 'bg-slate-50'} text-2xl`}>
                      {item.image}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">{item.foodName}</span>
                      <span className="block truncate text-xs text-slate-500">{item.englishSummary}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                );
              })}
            </div>
          )}
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
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-slate-950 text-white animate-in fade-in duration-200">
      <div className="absolute inset-x-8 top-[22%] flex justify-center">
        <div className="relative aspect-square w-full max-w-72 rounded-lg border border-white/50">
          <div className="absolute inset-4 rounded-lg border border-white/10" />
          <div className="absolute left-3 right-3 top-1/2 h-px animate-[scan_2s_ease-in-out_infinite] bg-orange-400" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-3 p-5 pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-6 sm:pt-8">
        <button type="button" aria-label="Back to home" onClick={() => setView('home')} className="icon-button-dark">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur">
          {scanSource.type === 'photo' ? 'Photo ready' : 'Point camera at food'}
        </div>
        <label className="icon-button-dark cursor-pointer">
          <span className="sr-only">Upload menu photo</span>
          <ImageIcon className="h-5 w-5" />
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) setScanSource({ type: 'photo', name: file.name });
            }}
          />
        </label>
      </div>

      <div className="absolute bottom-0 left-0 right-0 max-h-[58%] overflow-y-auto bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent p-5 pt-20 sm:p-6 sm:pt-24">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white/80">Select a match</p>
          <p className="max-w-[12rem] truncate text-xs text-white/45">
            {scanSource.type === 'photo' ? scanSource.name || 'Photo' : 'Camera'}
          </p>
        </div>
        <div className="space-y-2">
          {FOOD_LIST.map(food => (
            <button
              key={food.id}
              type="button"
              onClick={() => startOrdering(food.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-3 text-left backdrop-blur transition-colors hover:bg-white/15"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${food.accent.bg} text-2xl`}>{food.image}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{food.name}</span>
                <span className="text-xs text-emerald-300">{food.match} match</span>
              </span>
              <ArrowRight className="h-4 w-4 text-white/45" />
            </button>
          ))}
        </div>
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
          <div className="mt-4 flex gap-1.5">
            {selectedFood.steps.map((_, index) => (
              <div key={index} className={`h-1.5 flex-1 rounded-full ${index <= currentStepIndex ? 'bg-orange-500' : 'bg-slate-200'}`} />
            ))}
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
            <button type="button" disabled={currentStepIndex === 0} onClick={() => setCurrentStepIndex(prev => prev - 1)} className="secondary-button disabled:opacity-40">
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
              {isLastStep ? 'Generate order' : 'Next'}
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
                    saveToHistory();
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
          <div className="h-10 w-10" />
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

        <div className="p-5 pb-[max(1rem,env(safe-area-inset-bottom))] text-center sm:p-6">
          <button
            type="button"
            onClick={() => {
              setView('home');
              setSelectedFood(null);
              setOrderState({});
              setCurrentStepIndex(0);
              setCustomNote('');
            }}
            className="font-semibold text-orange-600"
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
