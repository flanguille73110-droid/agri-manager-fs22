import React, { useState, useEffect } from 'react';
import { Field, AnimalPen, GameState, CropType, FieldStatus, AnimalType, Shortcut, Note } from './types';
import { Icons, MONTHS } from './constants';

const GROWTH_TIMES: Record<string, number> = {
  [CropType.WHEAT]: 7,
  [CropType.BARLEY]: 6,
  [CropType.CANOLA]: 8,
  [CropType.OAT]: 4,
  [CropType.CORN]: 6,
  [CropType.SUNFLOWER]: 7,
  [CropType.SOYBEAN]: 6,
  [CropType.POTATO]: 4,
  [CropType.SUGARBEET]: 7,
  [CropType.GRASS]: 3,
  [CropType.COTTON]: 8,
  [CropType.GRAPE]: 12,
  [CropType.OLIVE]: 12,
  [CropType.SORGHUM]: 5
};

const ROTATION_ORDER: CropType[] = [
  CropType.OAT,
  CropType.POTATO,
  CropType.CANOLA,
  CropType.CORN,
  CropType.BARLEY,
  CropType.SUGARBEET,
  CropType.SUNFLOWER,
  CropType.WHEAT,
  CropType.GRASS
];

const TOOLS_LIST: string[] = [
  "Aucun",
  "Épandeur à chaux",
  "Épandeur à lisier",
  "Broyeur",
  "Charrue",
  "Ramasseur de pierres",
  "Semoir",
  "Planteuse a PDT",
  "JD X9 barre maïs tournesol",
  "JD X9 grande barre de coupe",
  "Ventor",
  "Rexor",
  "Faucheuse"
];

const CONFIGURABLE_TOOLS: string[] = [
  "Semoir",
  "Planteuse a PDT",
  "JD X9 barre maïs tournesol",
  "JD X9 grande barre de coupe",
  "Ventor",
  "Rexor",
  "Faucheuse"
];

const HARVESTERS: string[] = [
  "JD X9 barre maïs tournesol",
  "JD X9 grande barre de coupe",
  "Ventor",
  "Rexor",
  "Faucheuse"
];

const DEFAULT_TOOL_ASSIGNMENTS: Record<string, CropType[]> = {
  "Semoir": [CropType.OAT, CropType.CANOLA, CropType.CORN, CropType.BARLEY, CropType.SUGARBEET, CropType.SUNFLOWER, CropType.WHEAT, CropType.GRASS],
  "Planteuse a PDT": [CropType.POTATO],
  "JD X9 barre maïs tournesol": [CropType.CORN, CropType.SUNFLOWER],
  "JD X9 grande barre de coupe": [CropType.OAT, CropType.CANOLA, CropType.BARLEY, CropType.WHEAT],
  "Ventor": [CropType.POTATO],
  "Rexor": [CropType.SUGARBEET],
  "Faucheuse": [CropType.GRASS]
};

const DEFAULT_SHORTCUTS: Record<string, Shortcut[]> = {
  'CP COURSEPLAY': [
    { action: 'Afficher fenetre', keyboard: 'Suppr' },
    { action: "lancer l'ouvrier CP", keyboard: 'Ctrl + Maj + Enter' },
    { action: 'Changer le point de départ', keyboard: 'Ctrl + Maj + +' },
    { action: 'Effacer la course', keyboard: 'Ctrl + Maj + -' },
    { action: 'Affichage de la course dans le champ', keyboard: 'Ctrl + Maj + *' },
  ],
  'Guidance Steering (GPS) GS': [
    { action: 'Activer', keyboard: 'Espace + C', gamepad: 'flèche haut' },
    { action: 'Panneau réglage', keyboard: 'Ctrl + S' },
    { action: 'Largeur Auto', keyboard: 'Alt + R' },
    { action: 'Réaligner les lignes', keyboard: 'Alt + 5' },
    { action: '90°', keyboard: 'Alt + 1' },
    { action: 'Gauche', keyboard: 'Alt + 4' },
    { action: 'Droite', keyboard: 'Alt + 6' },
  ],
  'VCA (GPS)': [
    { action: 'activer', keyboard: 'Ctrl + Z' },
    { action: 'largeur auto', keyboard: 'Ctrl + Alt + Z' },
    { action: 'Panneau réglage (tracteur)', keyboard: 'Ctrl + D' },
    { action: 'Panneau réglage (global)', keyboard: 'Ctrl + Alt + C' },
  ],
  'AD Autodrive': [
    { action: 'Destination suivante', keyboard: 'Ctrl + Alt + Droite' },
    { action: 'Destination précedente', keyboard: 'Ctrl + Alt + Gauche' },
    { action: 'Activer / desactiver', keyboard: 'Ctrl + Alt + Enter' },
  ],
  'Autres': [
    { action: 'lavage instantané', keyboard: 'Ctrl + /' },
  ],
};

const STATUS_ORDER: { key: keyof Field; label: string; color: string }[] = [
  { key: 'needsLime', label: 'Chaux', color: 'bg-emerald-500' },
  { key: 'needsSlurry', label: 'Lisier', color: 'bg-emerald-500' },
  { key: 'needsMulching', label: 'Broyer', color: 'bg-emerald-500' },
  { key: 'needsPlowing', label: 'Labour', color: 'bg-emerald-500' },
  { key: 'needsStoneRemoval', label: 'Pierres', color: 'bg-emerald-500' },
  { key: 'needsSowing', label: 'Semis', color: 'bg-emerald-500' },
  { key: 'needsGrowing', label: 'En croissance', color: 'bg-emerald-500' },
];

const COW_CAPACITIES = {
    silageProtein: 2000000,
    hay: 1500000,
    hydration: 1000000,
    concentrate: 500000
};

const PIG_CAPACITIES = {
    foodConcentrate: 2000000,
    foodProtein: 1500000,
    foodEnergy: 1000000,
    foodHydration: 500000
};

const CHICKEN_CAPACITIES = {
    protein: 350000,
    energy: 100000,
    base: 350000,
    hydration: 200000
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard' | 'fields' | 'animals' | 'shortcuts' | 'settings' | 'notes'>('home');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'rotations' | 'tools' | 'vehicles' | 'actions'>('rotations');
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  
  // Animal Selection State
  const [selectedAnimalType, setSelectedAnimalType] = useState<AnimalType | null>(null);

  // Shortcut Modal State
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newActionName, setNewActionName] = useState("");
  const [editingId, setEditingId] = useState<{ category: string; index: number } | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteSort, setNoteSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'mois',
    direction: 'asc'
  });

  const handleSort = (key: string) => {
    setNoteSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const [shortcutForm, setShortcutForm] = useState({
    category: 'CP COURSEPLAY',
    action: '',
    keyboard: '',
    mouse: '',
    gamepad: ''
  });
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('fs22_manager_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration ensures toolAssignments exists and is populated if empty
        if (!parsed.toolAssignments || Object.keys(parsed.toolAssignments).length === 0) {
            parsed.toolAssignments = DEFAULT_TOOL_ASSIGNMENTS;
        }
        // Migration ensures shortcuts exists
        if (!parsed.shortcuts || Object.keys(parsed.shortcuts).length === 0) {
            parsed.shortcuts = DEFAULT_SHORTCUTS;
        }
        // Migration for growthTimes
        if (!parsed.growthTimes || Object.keys(parsed.growthTimes).length === 0) {
            parsed.growthTimes = GROWTH_TIMES;
        }
        // Migration for notes
        if (parsed.notes === undefined) {
            parsed.notes = "";
        }
        // Migration for customActions
        if (!parsed.customActions) {
            parsed.customActions = [];
        }
        // Migration for structuredNotes
        if (!parsed.structuredNotes) {
            parsed.structuredNotes = [];
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing saved game state, resetting:", e);
        localStorage.removeItem('fs22_manager_state');
      }
    }
    return {
      money: 500000,
      month: 7, // August (Index starts at 0 for Jan, so 7 is Aug)
      year: 1,
      fields: [
        { id: '1', number: 1, size: 2.5, crop: CropType.WHEAT, status: FieldStatus.GROWING, fertilizer: 50, needsLime: false, needsPlowing: false, isWaiting: false, needsSlurry: false, needsMulching: false, needsSowing: false, needsGrowing: true, needsStoneRemoval: false, needsHarvest: false, yieldPotential: 95, nextCrop: CropType.BARLEY, sownIn: 9, currentTool: 'Aucun' },
        { id: '2', number: 2, size: 1.2, crop: CropType.BARLEY, status: FieldStatus.HARVESTING, fertilizer: 100, needsLime: true, needsPlowing: false, isWaiting: false, needsSlurry: false, needsMulching: false, needsSowing: false, needsGrowing: false, needsStoneRemoval: false, needsHarvest: true, yieldPotential: 110, nextCrop: CropType.CANOLA, sownIn: 9, currentTool: 'Aucun' }
      ],
      animals: [
        { id: 'a1', type: AnimalType.COWS, name: 'Moutons', count: 12, health: 90, foodLevel: 80, waterLevel: 100, productivity: 85, lastFed: new Date().toISOString() }
      ],
      toolAssignments: DEFAULT_TOOL_ASSIGNMENTS,
      shortcuts: DEFAULT_SHORTCUTS,
      growthTimes: GROWTH_TIMES,
      notes: "",
      customActions: [],
      structuredNotes: []
    };
  });

  const [noteForm, setNoteForm] = useState({
    action: gameState.customActions?.[0] || '',
    enclos: 'Moutons',
    mois: MONTHS[gameState.month] || MONTHS[0],
    annee: gameState.year,
    duree: 0
  });

  useEffect(() => {
    localStorage.setItem('fs22_manager_state', JSON.stringify(gameState));
  }, [gameState]);

  const handleSaveAction = () => {
    if (newActionName.trim()) {
      setGameState(prev => ({
        ...prev,
        customActions: [...(prev.customActions || []), newActionName.trim()]
      }));
      setNewActionName("");
      setIsActionModalOpen(false);
    }
  };

  const handleSaveNote = () => {
    if (editingNoteId) {
      setGameState(prev => ({
        ...prev,
        structuredNotes: (prev.structuredNotes || []).map(n => 
          n.id === editingNoteId ? { ...noteForm, id: editingNoteId } : n
        )
      }));
    } else {
      const newNote: Note = {
        id: Math.random().toString(36).substr(2, 9),
        ...noteForm
      };
      setGameState(prev => ({
        ...prev,
        structuredNotes: [...(prev.structuredNotes || []), newNote]
      }));
    }
    setIsNoteModalOpen(false);
    setEditingNoteId(null);
    setNoteForm({
      action: gameState.customActions?.[0] || '',
      enclos: 'Moutons',
      mois: MONTHS[gameState.month] || MONTHS[0],
      annee: gameState.year,
      duree: 0
    });
  };

  const openEditNoteModal = (note: Note) => {
    setNoteForm({
      action: note.action,
      enclos: note.enclos,
      mois: note.mois,
      annee: note.annee,
      duree: note.duree
    });
    setEditingNoteId(note.id);
    setIsNoteModalOpen(true);
  };

  const updateNoteToCurrent = (id: string) => {
    setGameState(prev => ({
      ...prev,
      structuredNotes: (prev.structuredNotes || []).map(n => 
        n.id === id ? { 
          ...n, 
          mois: MONTHS[prev.month] || MONTHS[0], 
          annee: prev.year 
        } : n
      )
    }));
  };

  const deleteNote = (id: string) => {
    setGameState(prev => ({
      ...prev,
      structuredNotes: (prev.structuredNotes || []).filter(n => n.id !== id)
    }));
  };

  const deleteAction = (index: number) => {
    setGameState(prev => ({
      ...prev,
      customActions: (prev.customActions || []).filter((_, i) => i !== index)
    }));
  };

  const updateGrowthTime = (crop: string, months: number) => {
    setGameState(prev => ({
      ...prev,
      growthTimes: {
        ...(prev.growthTimes || GROWTH_TIMES),
        [crop]: months
      }
    }));
  };

  const addField = () => {
    const newField: Field = {
      id: Math.random().toString(36).substr(2, 9),
      number: gameState.fields.length + 1,
      size: 1.0,
      crop: CropType.GRASS,
      status: FieldStatus.FALLOW,
      fertilizer: 0,
      needsLime: false,
      needsPlowing: false,
      isWaiting: false,
      needsSlurry: false,
      needsMulching: false,
      needsSowing: false,
      needsGrowing: false,
      needsStoneRemoval: false,
      needsHarvest: false,
      yieldPotential: 100,
      nextCrop: undefined,
      sownIn: gameState.month,
      currentTool: 'Aucun',
      lastCompletedTool: undefined
    };
    setGameState(prev => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const addAnimal = (type: AnimalType) => {
    const existingAnimalsOfType = gameState.animals.filter(a => a.type === type);
    let name = type.toString();
    
    // Naming logic: First is "Type", second is "Type 2", third is "Type 3"
    if (existingAnimalsOfType.length >= 1) {
        name = `${type} ${existingAnimalsOfType.length + 1}`;
    }

    const newPen: AnimalPen = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      name: name,
      count: 0,
      health: 100,
      foodLevel: 100,
      waterLevel: 100,
      productivity: 0,
      lastFed: new Date().toISOString()
    };
    setGameState(prev => ({ ...prev, animals: [...prev.animals, newPen] }));
  };

  const advanceMonth = () => {
    setGameState(prev => {
      let nextMonth = prev.month + 1;
      let nextYear = prev.year;
      if (nextMonth >= 12) {
        nextMonth = 0;
        nextYear += 1;
      }
      return { ...prev, month: nextMonth, year: nextYear };
    });
  };

  const regressMonth = () => {
    setGameState(prev => {
      let nextMonth = prev.month - 1;
      let nextYear = prev.year;
      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear -= 1;
      }
      return { ...prev, month: nextMonth, year: nextYear };
    });
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setGameState(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  const toggleToolAssignment = (toolName: string, crop: CropType) => {
    setGameState(prev => {
      const currentAssignments = prev.toolAssignments?.[toolName] || [];
      const newAssignments = currentAssignments.includes(crop)
        ? currentAssignments.filter(c => c !== crop)
        : [...currentAssignments, crop];
      
      return {
        ...prev,
        toolAssignments: {
          ...prev.toolAssignments,
          [toolName]: newAssignments
        }
      };
    });
  };

  const openAddShortcutModal = () => {
      setShortcutForm({
          category: 'CP COURSEPLAY',
          action: '',
          keyboard: '',
          mouse: '',
          gamepad: ''
      });
      setEditingId(null);
      setIsShortcutModalOpen(true);
  };

  const openEditShortcutModal = (category: string, index: number, shortcut: Shortcut) => {
      setShortcutForm({
          category,
          action: shortcut.action,
          keyboard: shortcut.keyboard,
          mouse: shortcut.mouse || '',
          gamepad: shortcut.gamepad || ''
      });
      setEditingId({ category, index });
      setIsShortcutModalOpen(true);
  };

  const handleDeleteShortcut = (category: string, index: number) => {
      if(!window.confirm("Voulez-vous vraiment supprimer ce raccourci ?")) return;

      setGameState(prev => {
          const shortcuts = { ...(prev.shortcuts || {}) };
          const list = [...(shortcuts[category] || [])];
          list.splice(index, 1);
          shortcuts[category] = list;
          return { ...prev, shortcuts };
      });
  };

  const handleSaveShortcut = () => {
      if (!shortcutForm.action || !shortcutForm.category) return;

      const newShortcut: Shortcut = {
          action: shortcutForm.action,
          keyboard: shortcutForm.keyboard,
          mouse: shortcutForm.mouse,
          gamepad: shortcutForm.gamepad
      };

      setGameState(prev => {
          const shortcuts = { ...(prev.shortcuts || {}) };

          if (editingId) {
              // Edit existing
              if (editingId.category === shortcutForm.category) {
                   // Same category, just update index
                   const list = [...(shortcuts[editingId.category] || [])];
                   list[editingId.index] = newShortcut;
                   shortcuts[editingId.category] = list;
              } else {
                   // Category changed, move it
                   const oldList = [...(shortcuts[editingId.category] || [])];
                   oldList.splice(editingId.index, 1);
                   shortcuts[editingId.category] = oldList;

                   const newList = [...(shortcuts[shortcutForm.category] || [])];
                   newList.push(newShortcut);
                   shortcuts[shortcutForm.category] = newList;
              }
          } else {
              // Add new
              const list = [...(shortcuts[shortcutForm.category] || [])];
              list.push(newShortcut);
              shortcuts[shortcutForm.category] = list;
          }

          return { ...prev, shortcuts };
      });

      setIsShortcutModalOpen(false);
  };

  // Helper to get or create placeholder data for the detailed view by number
  const getFieldByNumber = (num: number): Field => {
    const existing = gameState.fields.find(f => f.number === num);
    if (existing) return existing;
    return {
      id: 'temp', // Placeholder ID
      number: num,
      size: 1.0,
      crop: CropType.GRASS,
      status: FieldStatus.FALLOW,
      fertilizer: 0,
      needsLime: false,
      needsPlowing: false,
      isWaiting: false,
      needsSlurry: false,
      needsMulching: false,
      needsSowing: false,
      needsGrowing: false,
      needsStoneRemoval: false,
      needsHarvest: false,
      yieldPotential: 100,
      nextCrop: undefined,
      sownIn: 0,
      currentTool: 'Aucun',
      lastCompletedTool: undefined
    };
  };

  // Helper to save data from the detailed view (creates field if it didn't exist)
  const saveFieldByNumber = (num: number, updates: Partial<Field>) => {
    setGameState(prev => {
      const existingIndex = prev.fields.findIndex(f => f.number === num);
      if (existingIndex >= 0) {
        const newFields = [...prev.fields];
        newFields[existingIndex] = { ...newFields[existingIndex], ...updates };
        return { ...prev, fields: newFields };
      } else {
        const newField: Field = {
            ...getFieldByNumber(num), // Get defaults
            id: Math.random().toString(36).substr(2, 9),
            ...updates
        };
        return { ...prev, fields: [...prev.fields, newField] };
      }
    });
  };

  const updateAnimal = (id: string, updates: Partial<AnimalPen>) => {
    setGameState(prev => ({
      ...prev,
      animals: prev.animals.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAnimal = (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet enclos ?")) return;
    setGameState(prev => ({
      ...prev,
      animals: prev.animals.filter(a => a.id !== id)
    }));
  };

  const vehicleList: { name: string; count: number }[] = [
    { name: "Andaineur", count: 1 },
    { name: "Benne", count: 4 },
    { name: "Broyeur", count: 2 },
    { name: "Chargeuse a paille", count: 1 },
    { name: "Charrue", count: 3 },
    { name: "Épandeur à chaux", count: 2 },
    { name: "Épandeur à lisier", count: 2 },
    { name: "Faneuse", count: 1 },
    { name: "Faucheuse", count: 2 },
    { name: "Houe", count: 2 },
    { name: "JD X9 barre maïs tournesol", count: 2 },
    { name: "JD X9 grande barre de coupe", count: 2 },
    { name: "Planteuse a PDT", count: 3 },
    { name: "Plateau a balles", count: 2 },
    { name: "Presse a balle", count: 1 },
    { name: "Pulvé", count: 2 },
    { name: "Ramasseur de pierres", count: 2 },
    { name: "Rexor", count: 2 },
    { name: "Sarcleuse", count: 2 },
    { name: "Semoir", count: 2 },
    { name: "Ventor", count: 2 }
  ];

  // Helper to get selected field object safely
  const selectedField = selectedFieldId ? getFieldByNumber(selectedFieldId) : null;

  // Sorting fields logic: Fields with an active tool come first
  const sortedFieldNumbers = Array.from({ length: 11 }, (_, i) => i + 1).sort((a, b) => {
    const fieldA = gameState.fields.find(f => f.number === a);
    const fieldB = gameState.fields.find(f => f.number === b);
    
    const hasToolA = fieldA?.currentTool && fieldA.currentTool !== 'Aucun';
    const hasToolB = fieldB?.currentTool && fieldB.currentTool !== 'Aucun';

    if (hasToolA && !hasToolB) return -1;
    if (!hasToolA && hasToolB) return 1;
    return a - b;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 md:pb-0 md:pl-64">
      {/* Sidebar Navigation (PC) */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Icons.Tractor />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AgriManager</h1>
        </div>

        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
            <Icons.Calendar />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mois en cours</div>
            <div className="text-sm font-bold text-white">{MONTHS[gameState.month]} {gameState.year}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <NavItem active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedFieldId(null); }} icon={<Icons.Home />} label="Accueil" />
          <NavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedFieldId(null); }} icon={<Icons.Tractor />} label="Véhicules" />
          <NavItem active={activeTab === 'fields'} onClick={() => { setActiveTab('fields'); setSelectedFieldId(null); }} icon={<Icons.Tractor />} label="Champs" />
          <NavItem active={activeTab === 'animals'} onClick={() => { setActiveTab('animals'); setSelectedAnimalType(null); }} icon={<Icons.Cow />} label="Animaux" />
          <NavItem active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} icon={<Icons.Zap />} label="Raccourcis" />
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Icons.Calendar />} label="Paramètres" />
        </div>
      </nav>

      {/* Bottom Navigation (Mobile) */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 h-10 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 flex items-center justify-center gap-2 px-4 z-50">
        <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center text-emerald-400">
          <Icons.Calendar />
        </div>
        <span className="text-xs font-bold text-white uppercase tracking-wider">{MONTHS[gameState.month]} {gameState.year}</span>
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex justify-around items-center px-2 z-50">
        <MobileNavItem active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setSelectedFieldId(null); }} icon={<Icons.Home />} label="Accueil" />
        <MobileNavItem active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSelectedFieldId(null); }} icon={<Icons.Tractor />} label="Véhicules" />
        <MobileNavItem active={activeTab === 'fields'} onClick={() => { setActiveTab('fields'); setSelectedFieldId(null); }} icon={<Icons.Tractor />} label="Champs" />
        <MobileNavItem active={activeTab === 'animals'} onClick={() => { setActiveTab('animals'); setSelectedAnimalType(null); }} icon={<Icons.Cow />} label="Bêtes" />
        <MobileNavItem active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} icon={<Icons.Zap />} label="Raccourcis" />
        <MobileNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Icons.Calendar />} label="Paramètres" />
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Accueil</h2>

            {/* Badges de notification */}
            {(() => {
              const actionsCount = (gameState.structuredNotes || []).filter(note => {
                const startMonthIndex = MONTHS.indexOf(note.mois);
                const totalMonths = startMonthIndex + note.duree;
                const endMonthIndex = totalMonths % 12;
                const additionalYears = Math.floor(totalMonths / 12);
                const endYear = note.annee + additionalYears;
                return endMonthIndex === gameState.month && endYear === gameState.year;
              }).length;

              const refillCount = (gameState.animals || []).filter(pen => {
                if (!pen.moisRavitaille || pen.anneeRavitaille === undefined || !pen.dureeRavitaillement) return false;
                const startMonthIndex = MONTHS.indexOf(pen.moisRavitaille);
                const totalMonths = startMonthIndex + pen.dureeRavitaillement;
                const endMonthIndex = totalMonths % 12;
                const additionalYears = Math.floor(totalMonths / 12);
                const endYear = pen.anneeRavitaille + additionalYears;
                return endMonthIndex === gameState.month && endYear === gameState.year;
              }).length;

              if (actionsCount > 0 || refillCount > 0) {
                return (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {actionsCount > 0 && (
                      <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-full shadow-lg shadow-blue-500/5 animate-fade-in">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Action a faire : {actionsCount}
                        </span>
                      </div>
                    )}
                    {refillCount > 0 && (
                      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full shadow-lg shadow-amber-500/5 animate-fade-in">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          Enclos a ravitailler : {refillCount}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mois en cours</label>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                        <Icons.Calendar />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">{MONTHS[gameState.month]}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={regressMonth}
                        className="w-10 h-10 bg-slate-700 hover:bg-slate-600 text-white rounded-full flex items-center justify-center transition-colors border border-slate-600"
                        title="Mois précédent"
                      >
                        <Icons.ChevronLeft />
                      </button>
                      <button 
                        onClick={advanceMonth}
                        className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/20"
                        title="Passer au mois suivant"
                      >
                        <Icons.ChevronRight />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Année de jeu</label>
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                        <span className="font-bold text-lg">Y</span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">Année {gameState.year}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        min="1"
                        max="100"
                        value={gameState.year}
                        onChange={(e) => setGameState(prev => ({ ...prev, year: parseInt(e.target.value) || 1 }))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Champs a récolter</h3>
              <div className="space-y-3">
                {gameState.fields.filter(field => {
                  if (field.sownIn === undefined) return false;
                  const growth = (gameState.growthTimes?.[field.crop] || GROWTH_TIMES[field.crop]) || 5;
                  const harvestMonthIndex = (field.sownIn + growth) % 12;
                  return harvestMonthIndex === gameState.month;
                }).length > 0 ? (
                  gameState.fields
                    .filter(field => {
                      if (field.sownIn === undefined) return false;
                      const growth = (gameState.growthTimes?.[field.crop] || GROWTH_TIMES[field.crop]) || 5;
                      const harvestMonthIndex = (field.sownIn + growth) % 12;
                      return harvestMonthIndex === gameState.month;
                    })
                    .sort((a, b) => a.number - b.number)
                    .map(field => (
                      <div key={field.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white">
                            {field.number}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{field.crop}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                          À récolter
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-500 italic text-sm">
                    Aucun champ à récolter ce mois-ci.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Champs bientôt a récolter</h3>
              <div className="space-y-3">
                {gameState.fields.filter(field => {
                  if (field.sownIn === undefined) return false;
                  const growth = (gameState.growthTimes?.[field.crop] || GROWTH_TIMES[field.crop]) || 5;
                  const harvestMonthIndex = (field.sownIn + growth) % 12;
                  const nextMonthIndex = (gameState.month + 1) % 12;
                  return harvestMonthIndex === nextMonthIndex;
                }).length > 0 ? (
                  gameState.fields
                    .filter(field => {
                      if (field.sownIn === undefined) return false;
                      const growth = (gameState.growthTimes?.[field.crop] || GROWTH_TIMES[field.crop]) || 5;
                      const harvestMonthIndex = (field.sownIn + growth) % 12;
                      const nextMonthIndex = (gameState.month + 1) % 12;
                      return harvestMonthIndex === nextMonthIndex;
                    })
                    .sort((a, b) => a.number - b.number)
                    .map(field => (
                      <div key={field.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white">
                            {field.number}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{field.crop}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                          Mois prochain
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-slate-500 italic text-sm">
                    Aucun champ à récolter le mois prochain.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Action a faire</h3>
              <div className="space-y-3">
                {(() => {
                  const actionsToDo = (gameState.structuredNotes || []).filter(note => {
                    const startMonthIndex = MONTHS.indexOf(note.mois);
                    const totalMonths = startMonthIndex + note.duree;
                    const endMonthIndex = totalMonths % 12;
                    const additionalYears = Math.floor(totalMonths / 12);
                    const endYear = note.annee + additionalYears;
                    
                    return endMonthIndex === gameState.month && endYear === gameState.year;
                  });

                  if (actionsToDo.length > 0) {
                    return actionsToDo.map(note => (
                      <div key={note.id} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                            <Icons.Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{note.action}</div>
                            <div className="text-xs text-slate-400">{note.enclos}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                          À faire
                        </div>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="text-center py-8 text-slate-500 italic text-sm">
                        Aucune action à faire ce mois-ci.
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Enclos a ravitailler</h3>
              <div className="space-y-3">
                {(() => {
                  const pensToRefill = (gameState.animals || []).filter(pen => {
                    if (!pen.moisRavitaille || pen.anneeRavitaille === undefined || !pen.dureeRavitaillement) return false;
                    const startMonthIndex = MONTHS.indexOf(pen.moisRavitaille);
                    const totalMonths = startMonthIndex + pen.dureeRavitaillement;
                    const endMonthIndex = totalMonths % 12;
                    const additionalYears = Math.floor(totalMonths / 12);
                    const endYear = pen.anneeRavitaille + additionalYears;
                    
                    return endMonthIndex === gameState.month && endYear === gameState.year;
                  });

                  if (pensToRefill.length > 0) {
                    return pensToRefill.map(pen => (
                      <div key={pen.id} className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-500">
                            {pen.type === AnimalType.COWS && <Icons.Cow className="w-4 h-4" />}
                            {pen.type === AnimalType.PIGS && <Icons.Pig className="w-4 h-4" />}
                            {pen.type === AnimalType.CHICKENS && <Icons.Chicken className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{pen.name || pen.type}</div>
                            <div className="text-xs text-slate-400">Ravitaillement prévu ce mois-ci</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 animate-pulse">
                          RAVITAILLER
                        </div>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="text-center py-8 text-slate-500 italic text-sm">
                        Aucun enclos à ravitailler ce mois-ci.
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {selectedFieldId === null ? (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Sélectionnez un champ</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {sortedFieldNumbers.map((num) => {
                            const field = gameState.fields.find(f => f.number === num);
                            const currentTool = field?.currentTool;
                            const hasTool = currentTool && currentTool !== 'Aucun';

                            return (
                                <button
                                    key={num}
                                    onClick={() => setSelectedFieldId(num)}
                                    className={`w-full bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex justify-between items-center transition-all group ${hasTool ? 'border-amber-500/30 bg-amber-900/10' : 'hover:bg-slate-800 hover:border-emerald-500/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${hasTool ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            <span className="font-bold">{num}</span>
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-lg text-slate-200 group-hover:text-emerald-400 transition-colors">Champ n°{num}</span>
                                            {hasTool && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="relative flex h-2 w-2">
                                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                    </span>
                                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">{currentTool}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`transition-colors ${hasTool ? 'text-amber-500' : 'text-slate-600 group-hover:text-emerald-500'}`}>
                                       <Icons.Tractor />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <button 
                        onClick={() => setSelectedFieldId(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-medium mb-4"
                    >
                        <span>← Retour aux champs</span>
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                            <span className="text-3xl font-bold">{selectedFieldId}</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Champ n°{selectedFieldId}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* En travail (GAUCHE) */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
                            <h3 className="text-xl font-bold text-amber-400 mb-6 flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                                En travail
                            </h3>
                            <div className="space-y-3">
                                {selectedField?.currentTool && selectedField.currentTool !== 'Aucun' ? (
                                    <div className="bg-slate-800 border border-amber-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-slate-300 gap-3 h-64 shadow-[0_0_20px_rgba(245,158,11,0.1)] animate-fade-in">
                                        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                                            <Icons.Tractor />
                                        </div>
                                        <span className="font-bold text-lg text-center">{selectedField.currentTool}</span>
                                        <span className="text-xs text-amber-500 font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full">En cours d'utilisation</span>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 gap-2 h-64">
                                        <Icons.Tractor />
                                        <span>Aucune machine en cours</span>
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Finis en attente (DROITE) */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 min-h-[400px]">
                            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                Finis en attente
                            </h3>
                            <div className="space-y-3">
                                {selectedField?.lastCompletedTool ? (
                                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-300 gap-3 h-64 animate-fade-in">
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                                            <Icons.Tractor />
                                        </div>
                                        <span className="font-bold text-lg text-center">{selectedField.lastCompletedTool}</span>
                                        <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full">Tâche terminée</span>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 gap-2 h-64">
                                        <span className="text-2xl font-bold">✓</span>
                                        <span>Aucune tâche terminée récemment</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="space-y-6">
            {selectedFieldId ? (
                <div className="animate-fade-in">
                     <button 
                        onClick={() => setSelectedFieldId(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-medium mb-4"
                    >
                        <span>← Retour à la liste</span>
                    </button>
                    <FieldCard 
                        field={getFieldByNumber(selectedFieldId)} 
                        onUpdate={(updates) => saveFieldByNumber(selectedFieldId, updates)}
                        toolAssignments={gameState.toolAssignments || DEFAULT_TOOL_ASSIGNMENTS}
                        currentMonth={gameState.month}
                        growthTimes={gameState.growthTimes || GROWTH_TIMES}
                    />
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Vos Champs</h2>
                    </div>
                    
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            {Array.from({length: 11}, (_, i) => i + 1).map(num => {
                                const field = gameState.fields.find(f => f.number === num);
                                
                                let statusText = "Libre";
                                let statusColor = "text-slate-500";
                                let borderColor = "border-slate-800";
                                let bgClass = "bg-slate-900";

                                if (field) {
                                    borderColor = "border-slate-700";
                                    bgClass = "bg-slate-900/80 hover:bg-slate-800";
                                    
                                    if (field.needsGrowing) {
                                        statusText = "À Récolter";
                                        statusColor = "text-yellow-400";
                                        borderColor = "border-yellow-500/30";
                                    } else if (field.needsSowing) {
                                        const growth = (gameState.growthTimes?.[field.crop] || GROWTH_TIMES[field.crop]) || 0;
                                        const progress = field.sownIn !== undefined ? Math.min((gameState.month - field.sownIn + 12) % 12, growth) : 0;
                                        statusText = `En croissance ${progress}/${growth}`;
                                        statusColor = "text-emerald-400";
                                        borderColor = "border-emerald-500/30";
                                    } else if (field.needsStoneRemoval) {
                                        statusText = "À semer";
                                        statusColor = "text-blue-400";
                                        borderColor = "border-blue-500/30";
                                    } else if (field.needsPlowing) {
                                        statusText = "Enlever les pierres";
                                        statusColor = "text-stone-400";
                                        borderColor = "border-stone-500/30";
                                    } else if (field.needsMulching) {
                                        statusText = "À Labourer";
                                        statusColor = "text-orange-400";
                                        borderColor = "border-orange-500/30";
                                    } else if (field.needsSlurry) {
                                        statusText = "À Broyer";
                                        statusColor = "text-rose-400";
                                        borderColor = "border-rose-500/30";
                                    } else if (field.needsLime) {
                                        statusText = "À Amender en lisier";
                                        statusColor = "text-lime-400";
                                        borderColor = "border-lime-500/30";
                                    } else if (field.isWaiting) {
                                        statusText = "À Chauler";
                                        statusColor = "text-cyan-400";
                                        borderColor = "border-cyan-500/30";
                                    } else {
                                        statusText = "en attente";
                                        statusColor = "text-slate-500";
                                        borderColor = "border-slate-800";
                                    }
                                }

                                return (
                                    <button
                                        key={num}
                                        onClick={() => setSelectedFieldId(num)}
                                        className={`p-4 rounded-xl border flex flex-col items-start gap-2 transition-all ${bgClass} ${borderColor}`}
                                    >
                                        <div className="flex justify-between w-full items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${field ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-600'}`}>
                                                    {num}
                                                </div>
                                                <span className={`text-sm font-bold uppercase ${statusColor}`}>{statusText}</span>
                                            </div>
                                            {field && (
                                                <div className="text-slate-600">
                                                    <Icons.Tractor />
                                                </div>
                                            )}
                                        </div>
                                        {field && (
                                            <div className="pl-11">
                                                <div className="text-xs text-slate-400 font-medium">{field.crop}</div>
                                                {field.currentTool !== 'Aucun' && (
                                                    <div className="text-[10px] text-emerald-500/80 mt-1 truncate max-w-[120px]">
                                                        {field.currentTool}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
          </div>
        )}

        {activeTab === 'animals' && (
          <div className="space-y-6">
            {!selectedAnimalType ? (
                <div className="flex flex-col gap-4 max-w-md mx-auto mt-10">
                    <h2 className="text-2xl font-bold text-center mb-6 text-white">Gérer mes élevages</h2>
                    
                    <button 
                        onClick={() => setSelectedAnimalType(AnimalType.COWS)}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 p-6 rounded-2xl flex items-center gap-6 transition-all group hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <Icons.Cow />
                        </div>
                        <span className="text-xl font-bold text-slate-200">Moutons</span>
                    </button>

                    <button 
                        onClick={() => setSelectedAnimalType(AnimalType.PIGS)}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 p-6 rounded-2xl flex items-center gap-6 transition-all group hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.1)]"
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                             <Icons.Pig />
                        </div>
                        <span className="text-xl font-bold text-slate-200">Cochons</span>
                    </button>

                    <button 
                        onClick={() => setSelectedAnimalType(AnimalType.CHICKENS)}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 p-6 rounded-2xl flex items-center gap-6 transition-all group hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                            <Icons.Chicken />
                        </div>
                        <span className="text-xl font-bold text-slate-200">Poules</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('notes')}
                        className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 p-6 rounded-2xl flex items-center gap-6 transition-all group hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                    >
                        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <Icons.Notes />
                        </div>
                        <span className="text-xl font-bold text-slate-200">Notes</span>
                    </button>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <button 
                        onClick={() => setSelectedAnimalType(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors font-medium mb-4"
                    >
                        <span>← Retour aux élevages</span>
                    </button>

                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-800">
                             <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 ${
                                    selectedAnimalType === AnimalType.COWS ? 'bg-emerald-500' :
                                    selectedAnimalType === AnimalType.PIGS ? 'bg-pink-500' :
                                    'bg-amber-500'
                                }`}>
                                    {selectedAnimalType === AnimalType.COWS && <Icons.Cow />}
                                    {selectedAnimalType === AnimalType.PIGS && <Icons.Pig />}
                                    {selectedAnimalType === AnimalType.CHICKENS && <Icons.Chicken />}
                                </div>
                                <h2 className="text-2xl font-bold text-white">{selectedAnimalType}</h2>
                             </div>
                             <button 
                                onClick={() => addAnimal(selectedAnimalType)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                             >
                                <Icons.Plus />
                                <span>Ajouter un enclos</span>
                             </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {gameState.animals.filter(a => a.type === selectedAnimalType).length > 0 ? (
                                gameState.animals
                                    .filter(a => a.type === selectedAnimalType)
                                    .map(pen => (
                                        <AnimalCard 
                                            key={pen.id} 
                                            pen={pen} 
                                            gameState={gameState}
                                            onUpdate={(updates) => updateAnimal(pen.id, updates)} 
                                            onDelete={() => deleteAnimal(pen.id)}
                                            onOpenNotes={() => setActiveTab('notes')}
                                        />
                                    ))
                            ) : (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                                    <span className="text-4xl mb-4 opacity-50">
                                        {selectedAnimalType === AnimalType.COWS && <Icons.Cow />}
                                        {selectedAnimalType === AnimalType.PIGS && <Icons.Pig />}
                                        {selectedAnimalType === AnimalType.CHICKENS && <Icons.Chicken />}
                                    </span>
                                    <p>Aucun enclos pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveTab('animals')}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"
                    >
                        <Icons.ChevronLeft />
                    </button>
                    <h2 className="text-2xl font-bold text-white">Notes</h2>
                </div>
                <button 
                    onClick={() => {
                        setNoteForm({
                            action: gameState.customActions?.[0] || '',
                            enclos: 'Moutons',
                            mois: MONTHS[gameState.month] || MONTHS[0],
                            annee: gameState.year,
                            duree: 0
                        });
                        setIsNoteModalOpen(true);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                    <Icons.Plus />
                    <span>Ajouter une note</span>
                </button>
            </div>
            
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-700">
                            <th 
                                onClick={() => handleSort('action')}
                                className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    Actions
                                    {noteSort.key === 'action' && (noteSort.direction === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                                </div>
                            </th>
                            <th 
                                onClick={() => handleSort('enclos')}
                                className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    Enclos
                                    {noteSort.key === 'enclos' && (noteSort.direction === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                                </div>
                            </th>
                            <th 
                                onClick={() => handleSort('mois')}
                                className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    Mois
                                    {noteSort.key === 'mois' && (noteSort.direction === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                                </div>
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Années de jeu</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Durée</th>
                            <th 
                                onClick={() => handleSort('arefaire')}
                                className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    A refaire
                                    {noteSort.key === 'arefaire' && (noteSort.direction === 'asc' ? <Icons.ChevronUp className="w-3 h-3" /> : <Icons.ChevronDown className="w-3 h-3" />)}
                                </div>
                            </th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {(() => {
                            const sortedNotes = [...(gameState.structuredNotes || [])].sort((a, b) => {
                                let valA: any;
                                let valB: any;

                                if (noteSort.key === 'action') {
                                    valA = a.action.toLowerCase();
                                    valB = b.action.toLowerCase();
                                } else if (noteSort.key === 'enclos') {
                                    valA = a.enclos.toLowerCase();
                                    valB = b.enclos.toLowerCase();
                                } else if (noteSort.key === 'mois') {
                                    valA = MONTHS.indexOf(a.mois) + (a.annee * 12);
                                    valB = MONTHS.indexOf(b.mois) + (b.annee * 12);
                                } else if (noteSort.key === 'arefaire') {
                                    valA = MONTHS.indexOf(a.mois) + a.duree + (a.annee * 12);
                                    valB = MONTHS.indexOf(b.mois) + b.duree + (b.annee * 12);
                                } else {
                                    return 0;
                                }

                                if (valA < valB) return noteSort.direction === 'asc' ? -1 : 1;
                                if (valA > valB) return noteSort.direction === 'asc' ? 1 : -1;
                                return 0;
                            });

                            return sortedNotes.length > 0 ? (
                                sortedNotes.map((note) => {
                                    const startMonthIndex = MONTHS.indexOf(note.mois);
                                    const totalMonths = startMonthIndex + note.duree;
                                    const endMonthIndex = totalMonths % 12;
                                    const additionalYears = Math.floor(totalMonths / 12);
                                    const endYear = note.annee + additionalYears;
                                    const endMonth = MONTHS[endMonthIndex];

                                    return (
                                        <tr key={note.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="p-4 text-slate-200 font-medium">{note.action}</td>
                                            <td className="p-4 text-slate-400">{note.enclos}</td>
                                            <td className="p-4 text-slate-400">{note.mois}</td>
                                            <td className="p-4 text-emerald-400 font-mono font-bold">{note.annee}</td>
                                            <td className="p-4 text-slate-400">{note.duree}</td>
                                            <td className="p-4 text-blue-400 font-bold">{endMonth} {endYear}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => updateNoteToCurrent(note.id)}
                                                        className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                                                        title="Mettre au mois en cours"
                                                    >
                                                        <Icons.Calendar />
                                                    </button>
                                                    <button 
                                                        onClick={() => openEditNoteModal(note)}
                                                        className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                                                        title="Modifier"
                                                    >
                                                        <Icons.Pencil />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteNote(note.id)}
                                                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                                                        title="Supprimer"
                                                    >
                                                        <Icons.Trash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500 italic">
                                        Aucune note enregistrée.
                                    </td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'shortcuts' && (
          <div className="space-y-6 animate-fade-in relative">
              <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Raccourcis</h2>
                  <button 
                      onClick={openAddShortcutModal}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                      <Icons.Plus />
                      <span>Ajouter une action</span>
                  </button>
              </div>

              {/* Add/Edit Shortcut Modal */}
              {isShortcutModalOpen && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
                          <h3 className="text-xl font-bold text-white mb-4">
                              {editingId ? 'Modifier un raccourci' : 'Ajouter un raccourci'}
                          </h3>
                          
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-xs text-slate-400 font-bold uppercase">Catégorie</label>
                                  <select
                                      value={shortcutForm.category}
                                      onChange={(e) => setShortcutForm(prev => ({ ...prev, category: e.target.value }))}
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
                                  >
                                      {Object.keys(gameState.shortcuts || {}).map(key => (
                                          <option key={key} value={key}>{key}</option>
                                      ))}
                                  </select>
                              </div>

                              <div className="space-y-2">
                                  <label className="text-xs text-slate-400 font-bold uppercase">Nom de l'action</label>
                                  <input 
                                      type="text"
                                      value={shortcutForm.action}
                                      onChange={(e) => setShortcutForm(prev => ({ ...prev, action: e.target.value }))}
                                      placeholder="Ex: Activer le GPS"
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2 col-span-2">
                                      <label className="text-xs text-slate-400 font-bold uppercase">Clavier</label>
                                      <input 
                                          type="text"
                                          value={shortcutForm.keyboard}
                                          onChange={(e) => setShortcutForm(prev => ({ ...prev, keyboard: e.target.value }))}
                                          placeholder="Ex: Ctrl + S"
                                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-xs text-slate-400 font-bold uppercase">Souris</label>
                                      <input 
                                          type="text"
                                          value={shortcutForm.mouse}
                                          onChange={(e) => setShortcutForm(prev => ({ ...prev, mouse: e.target.value }))}
                                          placeholder="Ex: Clic Droit"
                                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                                      />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-xs text-slate-400 font-bold uppercase">Manette</label>
                                      <input 
                                          type="text"
                                          value={shortcutForm.gamepad}
                                          onChange={(e) => setShortcutForm(prev => ({ ...prev, gamepad: e.target.value }))}
                                          placeholder="Ex: A"
                                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                                      />
                                  </div>
                              </div>
                          </div>

                          <div className="flex gap-3 mt-6">
                              <button 
                                  onClick={() => setIsShortcutModalOpen(false)}
                                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                              >
                                  Annuler
                              </button>
                              <button 
                                  onClick={handleSaveShortcut}
                                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
                              >
                                  {editingId ? 'Modifier' : 'Ajouter'}
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(Object.entries(gameState.shortcuts || {}) as [string, Shortcut[]][]).map(([category, shortcuts]) => (
                      <div key={category} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-colors shadow-lg flex flex-col group/card">
                          <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                              {category}
                          </h3>
                          <div className="space-y-3">
                              {shortcuts.map((shortcut, idx) => (
                                  <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-slate-800/50 last:border-0 last:pb-0 relative group">
                                      <div className="flex justify-between items-start">
                                        <span className="text-slate-300 font-medium text-sm">{shortcut.action}</span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEditShortcutModal(category, idx, shortcut)} 
                                                className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                                                title="Modifier"
                                            >
                                                <Icons.Pencil />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteShortcut(category, idx)} 
                                                className="text-slate-400 hover:text-red-400 transition-colors p-1"
                                                title="Supprimer"
                                            >
                                                <Icons.Trash />
                                            </button>
                                        </div>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                          {shortcut.keyboard && (
                                              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 font-mono">
                                                  ⌨ {shortcut.keyboard}
                                              </span>
                                          )}
                                          {shortcut.mouse && (
                                              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 font-mono">
                                                  🖱️ {shortcut.mouse}
                                              </span>
                                          )}
                                          {shortcut.gamepad && (
                                              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded border border-slate-700 font-mono">
                                                  🎮 {shortcut.gamepad}
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              ))}
                              {shortcuts.length === 0 && (
                                <div className="text-slate-500 text-xs italic text-center py-4">Aucun raccourci</div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Paramètres</h2>
            
            <div className="flex p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
              {['rotations', 'tools', 'vehicles', 'actions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSettingsTab(tab as any)}
                  className={`flex-1 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    activeSettingsTab === tab 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'rotations' ? 'Rotations de cultures' : tab === 'tools' ? 'Outils' : tab === 'vehicles' ? 'Tous les véhicules' : 'Actions'}
                </button>
              ))}
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 min-h-[400px]">
              {activeSettingsTab === 'rotations' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Temps de croissance (en mois)</h3>
                  <p className="text-slate-400">Durée estimée de la période de croissance.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ROTATION_ORDER.map((crop) => (
                      <div key={crop} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                          <span className="font-bold text-slate-200">{crop}</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="1"
                              max="24"
                              value={gameState.growthTimes?.[crop] || GROWTH_TIMES[crop]}
                              onChange={(e) => updateGrowthTime(crop, parseInt(e.target.value) || 1)}
                              className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-slate-400 text-xs">mois</span>
                          </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeSettingsTab === 'tools' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Mes Outils</h3>
                  <div className="grid grid-cols-1 gap-3">
                     {TOOLS_LIST.map((tool, index) => {
                        const isConfigurable = CONFIGURABLE_TOOLS.includes(tool);
                        return (
                        <div key={index} className="flex flex-col gap-2 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"><Icons.Tractor /></div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-200">{tool}</div>
                                    <div className="text-xs text-emerald-500">Prêt à l'emploi</div>
                                </div>
                            </div>
                            {isConfigurable && (
                                <CropMultiSelect 
                                    toolName={tool}
                                    selectedCrops={gameState.toolAssignments?.[tool] || []}
                                    onToggle={(crop) => toggleToolAssignment(tool, crop)}
                                />
                            )}
                        </div>
                     )})}
                  </div>
                </div>
              )}
              {activeSettingsTab === 'vehicles' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Parc Véhicules</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {vehicleList.map((vehicle, index) => (
                        <div key={index} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400"><Icons.Tractor /></div>
                                <span className="font-bold text-slate-200">{vehicle.name}</span>
                            </div>
                            <span className="text-indigo-400 font-bold font-mono bg-indigo-500/10 px-3 py-1 rounded-lg">{vehicle.count}</span>
                        </div>
                     ))}
                   </div>
                </div>
              )}
              {activeSettingsTab === 'actions' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Actions</h3>
                      <p className="text-slate-400 text-sm">Gérez vos actions personnalisées ici.</p>
                    </div>
                    <button 
                      onClick={() => setIsActionModalOpen(true)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 group"
                    >
                      <Icons.Plus className="group-hover:rotate-90 transition-transform" />
                      <span>Ajouter une action</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {(gameState.customActions || []).length > 0 ? (
                      (gameState.customActions || []).map((action, index) => (
                        <div key={index} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center group">
                          <span className="font-bold text-slate-200">{action}</span>
                          <button 
                            onClick={() => deleteAction(index)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-500 italic border-2 border-dashed border-slate-800 rounded-xl">
                        Aucune action personnalisée.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Action Modal */}
        {isActionModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4">Ajouter une action</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Nom de l'action</label>
                  <input 
                    type="text"
                    value={newActionName}
                    onChange={(e) => setNewActionName(e.target.value)}
                    placeholder="Ex: Révision du tracteur"
                    autoFocus
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none placeholder:text-slate-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveAction()}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setIsActionModalOpen(false);
                    setNewActionName("");
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveAction}
                  disabled={!newActionName.trim()}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {isNoteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingNoteId ? 'Modifier la note' : 'Ajouter une note'}
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Action</label>
                  <select 
                    value={noteForm.action}
                    onChange={(e) => setNoteForm({ ...noteForm, action: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
                  >
                    <option value="" disabled>Sélectionner une action</option>
                    {(gameState.customActions || []).map((action, idx) => (
                      <option key={idx} value={action}>{action}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Enclos</label>
                  <select 
                    value={noteForm.enclos}
                    onChange={(e) => setNoteForm({ ...noteForm, enclos: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
                  >
                    <option value="Cochons">Cochons</option>
                    <option value="Moutons">Moutons</option>
                    <option value="Poules">Poules</option>
                    <option value="Vaches">Vaches</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Mois</label>
                  <select 
                    value={noteForm.mois}
                    onChange={(e) => setNoteForm({ ...noteForm, mois: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
                  >
                    {MONTHS.map((month, idx) => (
                      <option key={idx} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Années de jeu</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={noteForm.annee}
                    onChange={(e) => setNoteForm({ ...noteForm, annee: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-bold uppercase">Durée (mois)</label>
                  <input 
                    type="number"
                    min="0"
                    value={noteForm.duree}
                    onChange={(e) => setNoteForm({ ...noteForm, duree: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setIsNoteModalOpen(false);
                    setEditingNoteId(null);
                  }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveNote}
                  disabled={!noteForm.action}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- Subcomponents ---

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${
      active ? 'text-emerald-400 scale-110' : 'text-slate-500'
    }`}
  >
    <div className={active ? 'scale-110' : ''}>{icon}</div>
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

interface FieldCardProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  toolAssignments: Record<string, CropType[]>;
  currentMonth: number;
  growthTimes: Record<string, number>;
}

const FieldCard = ({ field, onUpdate, toolAssignments, currentMonth, growthTimes }: FieldCardProps) => {
  const calculateHarvestMonth = (crop: CropType, sownIn?: number) => {
      if (sownIn === undefined) return '...';
      const growth = growthTimes[crop] || 5;
      const harvestIndex = (sownIn + growth) % 12;
      return MONTHS[harvestIndex];
  };

  const currentCropIndex = ROTATION_ORDER.indexOf(field.crop);
  const nextCrop = currentCropIndex !== -1 
    ? ROTATION_ORDER[(currentCropIndex + 1) % ROTATION_ORDER.length] 
    : undefined;
  const nextCropName = nextCrop || '-';

  // Determine Next Tool Logic based on Current Tool
  const getNextTool = () => {
      const currentTool = field.currentTool;
      
      if (!currentTool || currentTool === 'Aucun') {
          if (field.needsSowing && !field.needsGrowing) {
              if ([CropType.OAT, CropType.CANOLA, CropType.BARLEY, CropType.WHEAT].includes(field.crop)) return "JD X9 grande barre de coupe";
              if ([CropType.CORN, CropType.SUNFLOWER].includes(field.crop)) return "JD X9 barre maïs tournesol";
              if (field.crop === CropType.POTATO) return "Ventor";
              if (field.crop === CropType.SUGARBEET) return "Rexor";
              if (field.crop === CropType.GRASS) return "Faucheuse";
          }
          return '-';
      }

      // Check if current tool is a harvester
      if (HARVESTERS.includes(currentTool)) {
          return "Aucun";
      }

      if (currentTool === 'Planteuse a PDT') {
          return 'Ventor';
      }

      if (currentTool === 'Semoir') {
           // If we are sowing, the next tool is for Harvesting the crop we just sowed/are sowing.
           // This is the 'nextCrop' (target of the sowing).
           if (!nextCrop) return '-';

           for (const tool of HARVESTERS) {
               if (toolAssignments[tool]?.includes(nextCrop)) {
                   return tool;
               }
           }
           return 'Aucun'; // Or unknown
      }
    
      const currentToolIndex = TOOLS_LIST.indexOf(currentTool);
      return currentToolIndex !== -1
        ? TOOLS_LIST[(currentToolIndex + 1) % TOOLS_LIST.length]
        : '-';
  };
    
  const nextToolName = getNextTool();

  // Helper to check if harvest is done (used for unlocking)
  const isHarvestDone = field.needsHarvest;

  // Check if all preparation steps (up to Stone Removal) are done
  // Sequence: Attente -> Chaux -> Lisier -> Broyer -> Labour -> Pierres
  const isPrepComplete = 
      field.isWaiting &&
      field.needsLime &&
      field.needsSlurry &&
      field.needsMulching &&
      field.needsPlowing &&
      field.needsStoneRemoval;
  
  // Highlight Next if Prep is done AND Sowing is NOT done.
  // If Sowing IS done, or Prep NOT done, Current gets the color.
  const highlightNext = isPrepComplete && !field.needsSowing;
  const highlightCurrent = !highlightNext;

  const handleNextState = () => {
    const previousTool = field.currentTool;
    
    if (!field.isWaiting) {
        onUpdate({ 
            isWaiting: true, 
            currentTool: TOOLS_LIST[1],
            lastCompletedTool: previousTool !== TOOLS_LIST[1] ? previousTool : field.lastCompletedTool
        });
        return;
    }

    const nextIndex = STATUS_ORDER.findIndex(item => !field[item.key]);
    if (nextIndex !== -1) {
        const item = STATUS_ORDER[nextIndex];
        const updates: Partial<Field> = {};
        (updates as any)[item.key] = true;

        if (item.key === 'needsStoneRemoval') {
            if (nextCrop) {
                const isPotato = toolAssignments["Planteuse a PDT"]?.includes(nextCrop);
                updates.currentTool = isPotato ? "Planteuse a PDT" : "Semoir";
            } else {
                updates.currentTool = "Semoir";
            }
        } else if (item.key === 'needsGrowing') {
            if ([CropType.OAT, CropType.CANOLA, CropType.BARLEY, CropType.WHEAT].includes(field.crop)) updates.currentTool = "JD X9 grande barre de coupe";
            else if ([CropType.CORN, CropType.SUNFLOWER].includes(field.crop)) updates.currentTool = "JD X9 barre maïs tournesol";
            else if (field.crop === CropType.POTATO) updates.currentTool = "Ventor";
            else if (field.crop === CropType.SUGARBEET) updates.currentTool = "Rexor";
            else if (field.crop === CropType.GRASS) updates.currentTool = "Faucheuse";
            else updates.currentTool = "Aucun";
        } else {
            if (TOOLS_LIST[nextIndex + 2]) {
                updates.currentTool = TOOLS_LIST[nextIndex + 2];
            }
        }

        if (item.key === 'needsSowing') {
            const currentSown = field.sownIn ?? 0;
            const growthTime = growthTimes[field.crop] || 5;
            const newSownIndex = (currentSown + growthTime) % 12;
            const currentCropIndex = ROTATION_ORDER.indexOf(field.crop);
            const nextCropCycle = ROTATION_ORDER[(currentCropIndex + 1) % ROTATION_ORDER.length];
            
            onUpdate({
                ...updates,
                needsSowing: true,
                crop: nextCropCycle,
                sownIn: newSownIndex,
                currentTool: 'Aucun',
                lastCompletedTool: previousTool
            });
        } else {
            if (updates.currentTool && updates.currentTool !== previousTool) {
                updates.lastCompletedTool = previousTool;
            }
            onUpdate(updates);
        }
    }
  };

  // Check if all states are validated (for enabling Harvest Button)
  const allStatesValidated = 
    field.isWaiting &&
    field.needsLime &&
    field.needsSlurry &&
    field.needsMulching &&
    field.needsPlowing &&
    field.needsStoneRemoval &&
    field.needsSowing &&
    field.needsGrowing;

  const currentStatusIndex = [...STATUS_ORDER].reverse().findIndex(item => !!field[item.key]);
  const actualCurrentIndex = currentStatusIndex !== -1 ? STATUS_ORDER.length - 1 - currentStatusIndex : -1;
  const nextStatusIndex = STATUS_ORDER.findIndex(item => !field[item.key]);

  const getStatusLabel = (item: typeof STATUS_ORDER[0]) => {
    if (item.key === 'needsGrowing' && field.sownIn !== undefined) {
        const growth = growthTimes[field.crop] || 0;
        const progress = Math.min((currentMonth - field.sownIn + 12) % 12, growth);
        return `${item.label} ${progress}/${growth}`;
    }
    return item.label;
  };

  const currentStatusLabel = actualCurrentIndex !== -1 
    ? getStatusLabel(STATUS_ORDER[actualCurrentIndex])
    : field.isWaiting ? "Attente" : "-";

  const nextStatusLabel = nextStatusIndex !== -1 
    ? STATUS_ORDER[nextStatusIndex].label
    : null;

  const handleHarvest = () => {
    onUpdate({
      isWaiting: false,
      needsLime: false,
      needsSlurry: false,
      needsMulching: false,
      needsPlowing: false,
      needsStoneRemoval: false,
      needsSowing: false,
      needsGrowing: false,
      needsHarvest: false,
      currentTool: 'Aucun',
      lastCompletedTool: field.currentTool // The harvester becomes the completed tool
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors shadow-lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Crop Info */}
        <div className="flex-1 space-y-4">
            <h4 className="text-lg font-bold">Champ #{field.number}</h4>

            {/* Culture actuelle */}
            <div className="space-y-1">
                <p className={`text-[10px] font-bold uppercase ${highlightCurrent ? 'text-purple-400' : 'text-slate-500'}`}>Culture actuelle</p>
                <select 
                    value={field.crop} 
                    onChange={(e) => onUpdate({ crop: e.target.value as CropType })}
                    className={`w-full text-xs border rounded-lg p-2 transition-colors ${
                        highlightCurrent 
                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.1)]' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                >
                    {ROTATION_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Sowing and Harvesting - Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Semé en</p>
                    <select 
                        value={field.sownIn ?? 0}
                        onChange={(e) => onUpdate({ sownIn: parseInt(e.target.value) })}
                        className="w-full bg-slate-800 text-xs border border-slate-700 rounded-lg p-2"
                    >
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">À récolter en</p>
                    <div className="w-full bg-slate-800/50 text-xs border border-slate-700/50 rounded-lg p-2 text-emerald-400 font-bold flex items-center">
                        {calculateHarvestMonth(field.crop, field.sownIn)}
                    </div>
                </div>
            </div>

            {/* Next Crop */}
            <div className="space-y-1">
                <p className={`text-[10px] font-bold uppercase ${highlightNext ? 'text-purple-400' : 'text-slate-500'}`}>Culture suivante à semer</p>
                <div className={`w-full text-xs border rounded-lg p-2 font-bold transition-colors ${
                    highlightNext
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.1)]'
                    : 'bg-slate-800 border-slate-700 text-emerald-400' 
                }`}>
                    {nextCropName}
                </div>
            </div>

            {/* Outils en cours */}
            <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Outils en cours</p>
                <select
                    value={field.currentTool || 'Aucun'}
                    onChange={(e) => onUpdate({ currentTool: e.target.value })}
                    className="w-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/50 rounded-lg p-2 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                >
                    {TOOLS_LIST.map(t => <option key={t} value={t} className="bg-slate-900 text-slate-300">{t}</option>)}
                </select>
            </div>

            {/* Outils suivant à envoyer */}
            <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Outils suivant à envoyer</p>
                <div className="w-full bg-slate-800/50 text-xs border border-slate-700/50 rounded-lg p-2 text-slate-300 font-bold">
                    {nextToolName}
                </div>
            </div>
        </div>
        
        {/* Right Column: Status Toggles */}
        <div className="md:w-48 flex flex-col gap-2 pt-2 md:border-l md:border-slate-800 md:pl-6">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 hidden md:block">État</p>
            
            <button
                onClick={handleNextState}
                disabled={field.needsGrowing}
                className={`w-full px-3 py-3 rounded-xl text-xs font-bold uppercase transition-all border flex justify-center items-center gap-2 mb-4 ${
                    !field.needsGrowing
                    ? 'bg-emerald-500 text-slate-950 border-transparent shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 cursor-pointer'
                    : 'bg-slate-800 text-slate-600 border-slate-700 opacity-50 cursor-not-allowed'
                }`}
            >
                <Icons.Tractor />
                <span>Changer d'état</span>
            </button>

            <div className="space-y-3">
                <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Etat actuel</p>
                    <div className="w-full bg-slate-800/50 text-xs border border-slate-700/50 rounded-lg p-2 text-emerald-400 font-bold">
                        {currentStatusLabel}
                    </div>
                </div>

                {nextStatusLabel && (
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Etat en cours</p>
                        <div className="w-full bg-slate-800/50 text-xs border border-slate-700/50 rounded-lg p-2 text-slate-400 font-bold">
                            {nextStatusLabel}
                        </div>
                    </div>
                )}
            </div>
            
            {field.needsGrowing && (
                <button
                    onClick={handleHarvest}
                    disabled={!allStatesValidated}
                    className={`w-full mt-4 px-3 py-3 rounded-xl text-xs font-bold uppercase transition-all border flex justify-between items-center ${
                        allStatesValidated
                        ? 'bg-amber-500 text-slate-950 border-transparent shadow-lg shadow-amber-500/30 hover:bg-amber-400 cursor-pointer'
                        : 'bg-slate-800 text-slate-600 border-slate-700 opacity-50 cursor-not-allowed'
                    }`}
                >
                    <span>Récolter</span>
                    <span className={allStatesValidated ? 'animate-pulse' : ''}>{allStatesValidated ? '!' : '✗'}</span>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

const AnimalCard: React.FC<{ pen: AnimalPen; gameState: GameState; onUpdate: (updates: Partial<AnimalPen>) => void; onDelete?: () => void; onOpenNotes?: () => void }> = ({ pen, gameState, onUpdate, onDelete, onOpenNotes }) => {
  const isCow = pen.type === AnimalType.COWS;
  const isPig = pen.type === AnimalType.PIGS;
  const isChicken = pen.type === AnimalType.CHICKENS;

  // Use optional chaining carefully
  const cowDetails = pen.cowDetails || { silageProtein: 0, hay: 0, hydration: 0, concentrate: 0 };
  const pigDetails = pen.pigDetails || { foodConcentrate: 0, foodProtein: 0, foodEnergy: 0, foodHydration: 0 };
  const chickenDetails = pen.chickenDetails || { protein: 0, energy: 0, base: 0, hydration: 0 };
  
  const handleCowDetailChange = (key: keyof typeof cowDetails, value: string) => {
      // Limit to 7 digits
      if (value.length > 7) return;
      const numValue = parseInt(value) || 0;
      onUpdate({
          cowDetails: {
              ...cowDetails,
              [key]: numValue
          }
      });
  };

  const handlePigDetailChange = (key: keyof typeof pigDetails, value: string) => {
      // Limit to 7 digits
      if (value.length > 7) return;
      const numValue = parseInt(value) || 0;
      onUpdate({
          pigDetails: {
              ...pigDetails,
              [key]: numValue
          }
      });
  };

  const handleChickenDetailChange = (key: keyof typeof chickenDetails, value: string) => {
      // Limit to 7 digits
      if (value.length > 7) return;
      const numValue = parseInt(value) || 0;
      onUpdate({
          chickenDetails: {
              ...chickenDetails,
              [key]: numValue
          }
      });
  };

  const cowTotalRestant = cowDetails.silageProtein + cowDetails.hay + cowDetails.hydration + cowDetails.concentrate;
  const pigTotalRestant = pigDetails.foodConcentrate + pigDetails.foodProtein + pigDetails.foodEnergy + pigDetails.foodHydration;
  const chickenTotalRestant = chickenDetails.protein + chickenDetails.energy + chickenDetails.base + chickenDetails.hydration;
  
  const cowToRefill = {
      silageProtein: Math.max(0, COW_CAPACITIES.silageProtein - cowDetails.silageProtein),
      hay: Math.max(0, COW_CAPACITIES.hay - cowDetails.hay),
      hydration: Math.max(0, COW_CAPACITIES.hydration - cowDetails.hydration),
      concentrate: Math.max(0, COW_CAPACITIES.concentrate - cowDetails.concentrate),
  };
  
  const pigToRefill = {
      foodConcentrate: Math.max(0, PIG_CAPACITIES.foodConcentrate - pigDetails.foodConcentrate),
      foodProtein: Math.max(0, PIG_CAPACITIES.foodProtein - pigDetails.foodProtein),
      foodEnergy: Math.max(0, PIG_CAPACITIES.foodEnergy - pigDetails.foodEnergy),
      foodHydration: Math.max(0, PIG_CAPACITIES.foodHydration - pigDetails.foodHydration),
  };

  const chickenToRefill = {
      protein: Math.max(0, CHICKEN_CAPACITIES.protein - chickenDetails.protein),
      energy: Math.max(0, CHICKEN_CAPACITIES.energy - chickenDetails.energy),
      base: Math.max(0, CHICKEN_CAPACITIES.base - chickenDetails.base),
      hydration: Math.max(0, CHICKEN_CAPACITIES.hydration - chickenDetails.hydration),
  };

  const cowTotalToRefill = cowToRefill.silageProtein + cowToRefill.hay + cowToRefill.hydration + cowToRefill.concentrate;
  const pigTotalToRefill = pigToRefill.foodConcentrate + pigToRefill.foodProtein + pigToRefill.foodEnergy + pigToRefill.foodHydration;
  const chickenTotalToRefill = chickenToRefill.protein + chickenToRefill.energy + chickenToRefill.base + chickenToRefill.hydration;

  const handleRefillCows = () => {
       onUpdate({
          cowDetails: {
              silageProtein: 0,
              hay: 0,
              hydration: 0,
              concentrate: 0
          },
          moisRavitaille: MONTHS[gameState.month],
          anneeRavitaille: gameState.year
       });
  };

  const handleRefillPigs = () => {
       onUpdate({
          pigDetails: {
              foodConcentrate: 0,
              foodProtein: 0,
              foodEnergy: 0,
              foodHydration: 0
          },
          moisRavitaille: MONTHS[gameState.month],
          anneeRavitaille: gameState.year
       });
  };

  const handleRefillChickens = () => {
       onUpdate({
          chickenDetails: {
              protein: 0,
              energy: 0,
              base: 0,
              hydration: 0
          },
          moisRavitaille: MONTHS[gameState.month],
          anneeRavitaille: gameState.year
       });
  };

  return (
    <div className={`bg-slate-900/80 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-colors shadow-lg ${(isCow || isPig || isChicken) ? 'col-span-full xl:col-span-2' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/20">
            {pen.type === AnimalType.COWS && <Icons.Cow />}
            {pen.type === AnimalType.PIGS && <Icons.Pig />}
            {pen.type === AnimalType.CHICKENS && <Icons.Chicken />}
            {pen.type === AnimalType.SHEEP && <Icons.Cow />} {/* Fallback if needed */}
          </div>
          <h4 className="text-xl font-bold leading-tight text-white">{pen.name || pen.type}</h4>
        </div>
        <div className="flex items-center gap-3">
          {(!isCow && !isPig && !isChicken) && (
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Santé</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">{pen.health}%</p>
            </div>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-700 hover:border-rose-500/50"
              title="Supprimer l'enclos"
            >
              <Icons.Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {(isCow || isPig || isChicken) && (
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex items-center gap-3 bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-700/50 shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">Nourriture total</span>
            <input 
              type="number" 
              value={pen.totalFood || ''} 
              placeholder="0"
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                const updates: Partial<AnimalPen> = { totalFood: val };
                if ((isCow || isPig || isChicken) && pen.consoAnnuelle) {
                  updates.dureeRavitaillement = Math.round((val / pen.consoAnnuelle) * 12);
                }
                onUpdate(updates);
              }}
              className="w-32 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-4xl mx-auto">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Conso quotidienne</span>
              <input 
                type="number" 
                value={pen.consoQuotidienne || ''} 
                placeholder="0"
                onChange={(e) => onUpdate({ consoQuotidienne: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Conso annuelle</span>
              <input 
                type="number" 
                value={pen.consoAnnuelle || ''} 
                placeholder="0"
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  const updates: Partial<AnimalPen> = { consoAnnuelle: val };
                  if ((isCow || isPig || isChicken) && pen.totalFood) {
                    updates.dureeRavitaillement = Math.round((pen.totalFood / val) * 12);
                  }
                  onUpdate(updates);
                }}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Durée</span>
              <input 
                type="number" 
                value={pen.dureeRavitaillement || ''} 
                placeholder="0"
                onChange={(e) => onUpdate({ dureeRavitaillement: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Mois ravitaillé</span>
              <div className="h-[34px] w-full flex items-center justify-center px-2 bg-slate-800/30 border border-slate-700 rounded-lg text-xs text-slate-300 font-mono overflow-hidden truncate">
                {pen.moisRavitaille ? `${pen.moisRavitaille} ${pen.anneeRavitaille}` : '-'}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">À ravitailler pour</span>
              <div className="h-[34px] w-full flex items-center justify-center px-2 bg-slate-800/30 border border-slate-700 rounded-lg text-xs text-blue-400 font-bold font-mono overflow-hidden truncate">
                {(() => {
                  if (!pen.moisRavitaille || pen.anneeRavitaille === undefined || !pen.dureeRavitaillement) return '-';
                  const startMonthIndex = MONTHS.indexOf(pen.moisRavitaille);
                  const totalMonths = startMonthIndex + pen.dureeRavitaillement;
                  const endMonthIndex = totalMonths % 12;
                  const additionalYears = Math.floor(totalMonths / 12);
                  const endYear = pen.anneeRavitaille + additionalYears;
                  return `${MONTHS[endMonthIndex]} ${endYear}`;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {(!isCow && !isPig && !isChicken) && (
        <div className="flex items-center justify-center gap-3 mb-6 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
          <input 
            type="number" 
            value={pen.count} 
            onChange={(e) => onUpdate({ count: parseInt(e.target.value) || 0 })}
            className="w-16 bg-slate-900/50 text-sm text-emerald-400 font-mono border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
          />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unités</span>
        </div>
      )}

      {isCow ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Table 1: Categories (Moutons) */}
            <div className="overflow-hidden rounded-xl border border-slate-700">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase">
                        <tr>
                            <th className="px-3 py-2">Catégories</th>
                            <th className="px-3 py-2">Restant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                        <tr>
                            <td className="px-3 py-2">Proteine d'ensilage 40%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={cowDetails.silageProtein || ''}
                                    placeholder="0"
                                    onChange={(e) => handleCowDetailChange('silageProtein', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Fourrage brut 30%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={cowDetails.hay || ''}
                                    placeholder="0"
                                    onChange={(e) => handleCowDetailChange('hay', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Hydratant 20%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={cowDetails.hydration || ''}
                                    placeholder="0"
                                    onChange={(e) => handleCowDetailChange('hydration', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Concentrés 10%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={cowDetails.concentrate || ''}
                                    placeholder="0"
                                    onChange={(e) => handleCowDetailChange('concentrate', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                         <tr>
                            <td className="px-3 py-2 font-bold text-white">Total</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">
                                {cowTotalRestant.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Table 2: Products (Moutons) */}
            <div className="overflow-hidden rounded-xl border border-slate-700">
                 <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase">
                        <tr>
                            <th className="px-3 py-2">Produits</th>
                            <th className="px-3 py-2">A Ravitaller</th>
                            <th className="px-3 py-2">Position</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                        <tr>
                            <td className="px-3 py-2">Ensilage de trèfle</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{cowToRefill.silageProtein.toLocaleString()}</td>
                            <td className="px-3 py-2 font-mono text-red-400">-1</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Foin de trèfle</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{cowToRefill.hay.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-red-400">-1</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Carottes</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{cowToRefill.hydration.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-emerald-400">+10</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Deuka céréales concassées</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{cowToRefill.concentrate.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-red-400">-8</td>
                        </tr>
                         <tr>
                            <td className="px-3 py-2 font-bold text-white">Total</td>
                            <td className="px-3 py-2 font-mono font-bold text-white">{cowTotalToRefill.toLocaleString()}</td>
                            <td className="px-3 py-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      ) : isPig ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Table 1: Categories (Cochons) */}
            <div className="overflow-hidden rounded-xl border border-slate-700">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase">
                        <tr>
                            <th className="px-3 py-2">Catégories</th>
                            <th className="px-3 py-2">Restant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                        <tr>
                            <td className="px-3 py-2">Concentrés alimentaires 40%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={pigDetails.foodConcentrate || ''}
                                    placeholder="0"
                                    onChange={(e) => handlePigDetailChange('foodConcentrate', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Aliments proteinés 30%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={pigDetails.foodProtein || ''}
                                    placeholder="0"
                                    onChange={(e) => handlePigDetailChange('foodProtein', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Aliments energétique 20%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={pigDetails.foodEnergy || ''}
                                    placeholder="0"
                                    onChange={(e) => handlePigDetailChange('foodEnergy', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Aliments hydratant 10%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={pigDetails.foodHydration || ''}
                                    placeholder="0"
                                    onChange={(e) => handlePigDetailChange('foodHydration', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                         <tr>
                            <td className="px-3 py-2 font-bold text-white">Total</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">
                                {pigTotalRestant.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Table 2: Products (Cochons) */}
            <div className="overflow-hidden rounded-xl border border-slate-700">
                 <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase">
                        <tr>
                            <th className="px-3 py-2">Produits</th>
                            <th className="px-3 py-2">A Ravitaller</th>
                            <th className="px-3 py-2">Position</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                        <tr>
                            <td className="px-3 py-2">Deuka compléments mineral</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{pigToRefill.foodConcentrate.toLocaleString()}</td>
                            <td className="px-3 py-2 font-mono text-emerald-400">+21</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Soja</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{pigToRefill.foodProtein.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-emerald-400">+1</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Maïs</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{pigToRefill.foodEnergy.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-emerald-400">+1</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Pommes de terre</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{pigToRefill.foodHydration.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-red-400">-23</td>
                        </tr>
                         <tr>
                            <td className="px-3 py-2 font-bold text-white">Total</td>
                            <td className="px-3 py-2 font-mono font-bold text-white">{pigTotalToRefill.toLocaleString()}</td>
                            <td className="px-3 py-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      ) : isChicken ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Table 1: Categories (Poules) */}
            <div className="overflow-hidden rounded-xl border border-slate-700">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase">
                        <tr>
                            <th className="px-3 py-2">Catégories</th>
                            <th className="px-3 py-2">Restant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                        <tr>
                            <td className="px-3 py-2">Aliments protéinés 35%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={chickenDetails.protein || ''}
                                    placeholder="0"
                                    onChange={(e) => handleChickenDetailChange('protein', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Aliments energétique 10%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={chickenDetails.energy || ''}
                                    placeholder="0"
                                    onChange={(e) => handleChickenDetailChange('energy', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Aliments de base 35%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={chickenDetails.base || ''}
                                    placeholder="0"
                                    onChange={(e) => handleChickenDetailChange('base', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Aliments hydratant 20%</td>
                            <td className="px-3 py-2">
                                <input 
                                    type="number" 
                                    value={chickenDetails.hydration || ''}
                                    placeholder="0"
                                    onChange={(e) => handleChickenDetailChange('hydration', e.target.value)}
                                    className="w-full bg-transparent border-b border-slate-600 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                            </td>
                        </tr>
                         <tr>
                            <td className="px-3 py-2 font-bold text-white">Total</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">
                                {chickenTotalRestant.toLocaleString()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Table 2: Products (Poules) */}
            <div className="overflow-hidden rounded-xl border border-slate-700">
                 <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800 text-slate-400 font-bold uppercase">
                        <tr>
                            <th className="px-3 py-2">Produits</th>
                            <th className="px-3 py-2">A Ravitaller</th>
                            <th className="px-3 py-2">Position</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-900/50">
                        <tr>
                            <td className="px-3 py-2">Soja</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{chickenToRefill.protein.toLocaleString()}</td>
                            <td className="px-3 py-2 font-mono text-red-400">-4</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Sorgho</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{chickenToRefill.energy.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-emerald-400">+5</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Maïs</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{chickenToRefill.base.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-emerald-400">+2</td>
                        </tr>
                        <tr>
                            <td className="px-3 py-2">Betteraves</td>
                            <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{chickenToRefill.hydration.toLocaleString()}</td>
                             <td className="px-3 py-2 font-mono text-red-400">-3</td>
                        </tr>
                         <tr>
                            <td className="px-3 py-2 font-bold text-white">Total</td>
                            <td className="px-3 py-2 font-mono font-bold text-white">{chickenTotalToRefill.toLocaleString()}</td>
                            <td className="px-3 py-2"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
            <StatBar label="Nourriture" value={pen.foodLevel} color="bg-amber-500" onUpdate={(v) => onUpdate({ foodLevel: v })} />
            <StatBar label="Eau" value={pen.waterLevel} color="bg-blue-500" onUpdate={(v) => onUpdate({ waterLevel: v })} />
            <StatBar label="Productivité" value={pen.productivity} color="bg-purple-500" onUpdate={(v) => onUpdate({ productivity: v })} />
        </div>
      )}

      <button 
        onClick={() => {
            if (isCow) handleRefillCows();
            else if (isPig) handleRefillPigs();
            else if (isChicken) handleRefillChickens();
            else onUpdate({ foodLevel: 100, waterLevel: 100, health: Math.min(100, pen.health + 5) });
        }}
        className="mt-6 w-full py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors uppercase tracking-wider"
      >
        Ravitailler l'enclos
      </button>
    </div>
  );
};

const BadgeButton: React.FC<{ active: boolean; label: React.ReactNode; onClick: () => void; color: string; disabled?: boolean }> = ({ active, label, onClick, color, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border flex justify-between items-center ${
      active 
      ? `${color} text-white border-transparent shadow-lg shadow-emerald-500/30` 
      : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span>{label}</span>
    <span>{active ? '✓' : '✗'}</span>
  </button>
);

const StatBar: React.FC<{ label: string; value: number; color: string; onUpdate: (val: number) => void }> = ({ label, value, color, onUpdate }) => (
  <div>
    <div className="flex justify-between text-[10px] mb-1">
      <span className="text-slate-400 font-bold uppercase">{label}</span>
      <span className="font-mono text-white">{value}%</span>
    </div>
    <div className="group relative h-2 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer">
      <div 
        className={`h-full ${color} transition-all duration-300`} 
        style={{ width: `${value}%` }}
      ></div>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => onUpdate(parseInt(e.target.value))}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  </div>
);

interface CropMultiSelectProps {
  toolName: string;
  selectedCrops: CropType[];
  onToggle: (crop: CropType) => void;
}

const CropMultiSelect = ({ toolName, selectedCrops, onToggle }: CropMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative pl-[52px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left text-xs bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 flex justify-between items-center transition-colors"
      >
        <span className="text-slate-400">
            {selectedCrops.length > 0 
                ? `${selectedCrops.length} culture(s) assignée(s)` 
                : "Configurer les cultures..."}
        </span>
        <span className="text-slate-500">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-[52px] right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-2 max-h-48 overflow-y-auto">
          {ROTATION_ORDER.map(crop => (
            <div key={crop} 
                 onClick={() => onToggle(crop)}
                 className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded cursor-pointer transition-colors"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selectedCrops.includes(crop) 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'border-slate-500 bg-slate-900'
              }`}>
                  {selectedCrops.includes(crop) && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
              <span className={`text-sm ${selectedCrops.includes(crop) ? 'text-white font-medium' : 'text-slate-400'}`}>
                {crop}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;