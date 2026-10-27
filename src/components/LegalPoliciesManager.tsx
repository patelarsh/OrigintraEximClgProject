import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Truck,
  Cookie,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
  Scale,
  ListPlus,
  Sparkles,
  Info,
  Layers,
  Calendar,
  Eye,
  Loader2
} from 'lucide-react';
import { 
  DEFAULT_LEGAL_POLICIES, 
  LegalPoliciesMap, 
  LegalPolicyType, 
  LegalSection, 
  LegalPolicyData 
} from '../data/legalPolicies';
import { AdminStorage } from '../services/adminStorage';

interface LegalPoliciesManagerProps {
  onNavigate?: (page: string) => void;
  showToast: (msg: string) => void;
}

export const LegalPoliciesManager: React.FC<LegalPoliciesManagerProps> = ({
  onNavigate,
  showToast
}) => {
  const [policies, setPolicies] = useState<LegalPoliciesMap>(() => AdminStorage.getLegalPolicies());
  const [activePolicyKey, setActivePolicyKey] = useState<LegalPolicyType>('privacy');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({
    'scope': true,
    'contract-framework': true,
    'port-gateways': true,
    'what-are-cookies': true
  });
  const [newBulletInputs, setNewBulletInputs] = useState<Record<string, string>>({});

  const currentPolicy = policies[activePolicyKey];

  const policyList: { key: LegalPolicyType; label: string; path: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'privacy', label: 'Privacy Policy', path: '/privacy-policy', icon: ShieldCheck },
    { key: 'terms', label: 'Terms & Conditions', path: '/terms-of-service', icon: FileText },
    { key: 'shipping', label: 'Shipping Policy', path: '/shipping-policy', icon: Truck },
    { key: 'cookies', label: 'Cookie Policy', path: '/cookie-policy', icon: Cookie },
  ];

  const updateCurrentPolicy = (patch: Partial<LegalPolicyData>) => {
    setPolicies(prev => ({
      ...prev,
      [activePolicyKey]: {
        ...prev[activePolicyKey],
        ...patch
      }
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await AdminStorage.saveLegalPolicies(policies);
      setSaveSuccess(true);
      showToast(`${currentPolicy.title} updated and published live!`);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      showToast('Error saving policies');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm(`Reset "${currentPolicy.title}" back to the official standard legal template? This will replace any custom edits for this policy.`)) {
      setPolicies(prev => ({
        ...prev,
        [activePolicyKey]: { ...DEFAULT_LEGAL_POLICIES[activePolicyKey] }
      }));
      showToast(`Reset ${currentPolicy.title} to standard template. Click Save to publish.`);
    }
  };

  const handleResetAllToDefault = () => {
    if (window.confirm('Reset ALL 4 Legal Policies back to standard defaults?')) {
      const reset = AdminStorage.resetLegalPoliciesToDefault();
      setPolicies(reset);
      showToast('All 4 policies reset to standard defaults!');
    }
  };

  // Section Management Handlers
  const toggleSection = (id: string) => {
    setExpandedSectionIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSection = () => {
    const newId = `section-${Date.now().toString(36)}`;
    const newSection: LegalSection = {
      id: newId,
      title: `${currentPolicy.sections.length + 1}. New Policy Clause`,
      content: ['Enter the text and terms for this clause here.']
    };
    updateCurrentPolicy({
      sections: [...currentPolicy.sections, newSection]
    });
    setExpandedSectionIds(prev => ({ ...prev, [newId]: true }));
    showToast('New section added!');
  };

  const handleUpdateSection = (sectionIndex: number, patch: Partial<LegalSection>) => {
    const updated = [...currentPolicy.sections];
    updated[sectionIndex] = { ...updated[sectionIndex], ...patch };
    updateCurrentPolicy({ sections: updated });
  };

  const handleDeleteSection = (sectionIndex: number) => {
    const sec = currentPolicy.sections[sectionIndex];
    if (window.confirm(`Delete section "${sec.title}"?`)) {
      const updated = currentPolicy.sections.filter((_, idx) => idx !== sectionIndex);
      updateCurrentPolicy({ sections: updated });
      showToast('Section deleted');
    }
  };

  const handleMoveSection = (sectionIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentPolicy.sections.length) return;
    const updated = [...currentPolicy.sections];
    const temp = updated[sectionIndex];
    updated[sectionIndex] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateCurrentPolicy({ sections: updated });
  };

  // Bullet Points
  const handleAddBullet = (sectionIndex: number, sectionId: string) => {
    const text = (newBulletInputs[sectionId] || '').trim();
    if (!text) return;
    const sec = currentPolicy.sections[sectionIndex];
    const bullets = sec.bullets ? [...sec.bullets, text] : [text];
    handleUpdateSection(sectionIndex, { bullets });
    setNewBulletInputs(prev => ({ ...prev, [sectionId]: '' }));
  };

  const handleDeleteBullet = (sectionIndex: number, bulletIndex: number) => {
    const sec = currentPolicy.sections[sectionIndex];
    if (!sec.bullets) return;
    const bullets = sec.bullets.filter((_, bIdx) => bIdx !== bulletIndex);
    handleUpdateSection(sectionIndex, { bullets });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* 1. Header Bar with Policy Switcher & Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" />
              <span>Public Policy & Compliance Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              Legal Pages Content Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage live content, contract terms, shipping clauses, and cookie governance across all 4 public policy URLs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate(currentPolicy.path);
                } else {
                  window.open(currentPolicy.path, '_blank');
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-2xs"
              title="Preview Live Page in new tab"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Preview Live</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
              title="Restore standard template clauses"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Template</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-md cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                  : 'bg-[#0070E0] hover:bg-[#005bb5] text-white shadow-blue-600/20'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved & Published!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Policy Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-2">
          {policyList.map(item => {
            const Icon = item.icon;
            const isActive = activePolicyKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActivePolicyKey(item.key);
                  setSaveSuccess(false);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#0A1C3E] border-[#0A1C3E] text-white shadow-md'
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-white/10 text-sky-300' : 'bg-white text-slate-600 shadow-2xs'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/15 text-sky-200' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {policies[item.key].sections.length} clauses
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">{item.label}</div>
                  <div className={`text-[11px] truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {item.path}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Policy Hero & Metadata Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <Layers className="w-5 h-5 text-[#0070E0]" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Header & Meta Details — {currentPolicy.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">Page Headline (Title)</label>
            <input
              type="text"
              value={currentPolicy.title}
              onChange={(e) => updateCurrentPolicy({ title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 focus:border-[#0070E0] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Effective Date / Version</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={currentPolicy.effectiveDate}
                onChange={(e) => updateCurrentPolicy({ effectiveDate: e.target.value })}
                placeholder="e.g. March 2026"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 focus:border-[#0070E0] transition"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Eyebrow Tagline</label>
            <input
              type="text"
              value={currentPolicy.eyebrow}
              onChange={(e) => updateCurrentPolicy({ eyebrow: e.target.value })}
              placeholder="e.g. Commercial Data Governance"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 focus:border-[#0070E0] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Navigation Button Label</label>
            <input
              type="text"
              value={currentPolicy.navLabel}
              onChange={(e) => updateCurrentPolicy({ navLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 focus:border-[#0070E0] transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Introductory Lead Summary</label>
          <textarea
            rows={3}
            value={currentPolicy.lead}
            onChange={(e) => updateCurrentPolicy({ lead: e.target.value })}
            placeholder="Introduction paragraph displayed at the top of the policy page..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 focus:border-[#0070E0] transition"
          />
        </div>
      </div>

      {/* 3. Sections & Clauses List Editor */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Policy Clauses & Content Sections ({currentPolicy.sections.length})
            </h2>
            <p className="text-xs text-slate-500">
              Add, remove, reorder, and edit clauses, paragraphs, bullet points, and compliance callouts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSection}
            className="px-4 py-2 rounded-xl bg-[#0A1C3E] hover:bg-[#0070E0] text-white text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Clause</span>
          </button>
        </div>

        {/* Section Accordion Cards */}
        <div className="space-y-4">
          {currentPolicy.sections.map((section, sIdx) => {
            const isExpanded = expandedSectionIds[section.id] !== false; // default true

            return (
              <div 
                key={section.id || sIdx}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs transition"
              >
                {/* Section Header Row */}
                <div 
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition ${
                    isExpanded ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/60'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {sIdx + 1}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {section.title || `Clause #${sIdx + 1}`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={() => handleMoveSection(sIdx, 'up')}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-25 transition cursor-pointer"
                      title="Move Clause Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={sIdx === currentPolicy.sections.length - 1}
                      onClick={() => handleMoveSection(sIdx, 'down')}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-25 transition cursor-pointer"
                      title="Move Clause Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sIdx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer ml-1"
                      title="Delete Clause"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand/Collapse Chevron */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-200/60 transition cursor-pointer ml-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Section Content Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-5 bg-white">
                    {/* Clause Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Clause Heading</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(sIdx, { title: e.target.value })}
                        placeholder="e.g. 1. Commercial Scope & B2B Principles"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 focus:border-[#0070E0] transition"
                      />
                    </div>

                    {/* Paragraphs (join by double newlines for easy editing) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">Paragraph Content</label>
                        <span className="text-[10px] text-slate-400">Separate paragraphs with an empty line</span>
                      </div>
                      <textarea
                        rows={4}
                        value={(section.content || []).join('\n\n')}
                        onChange={(e) => {
                          const paragraphs = e.target.value.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
                          handleUpdateSection(sIdx, { content: paragraphs.length ? paragraphs : [''] });
                        }}
                        placeholder="Enter the body paragraphs for this legal clause..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0070E0]/20 focus:border-[#0070E0] transition"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2.5 pt-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Bullet Points ({section.bullets?.length || 0})
                      </label>
                      
                      {section.bullets && section.bullets.length > 0 && (
                        <div className="space-y-2">
                          {section.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-xs text-slate-800">
                              <span className="text-[#0070E0] font-bold mt-0.5">•</span>
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => {
                                  const updatedBullets = [...(section.bullets || [])];
                                  updatedBullets[bIdx] = e.target.value;
                                  handleUpdateSection(sIdx, { bullets: updatedBullets });
                                }}
                                className="flex-1 bg-transparent border-0 focus:outline-none text-xs text-slate-800"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteBullet(sIdx, bIdx)}
                                className="text-slate-400 hover:text-red-500 p-0.5 transition cursor-pointer"
                                title="Remove bullet point"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Bullet Input */}
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="text"
                          value={newBulletInputs[section.id] || ''}
                          onChange={(e) => setNewBulletInputs(prev => ({ ...prev, [section.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddBullet(sIdx, section.id);
                            }
                          }}
                          placeholder="Type a new bullet point and press Enter or Add..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0070E0]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddBullet(sIdx, section.id)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center space-x-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Bullet</span>
                        </button>
                      </div>
                    </div>

                    {/* Highlight Callout Box (Optional) */}
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(section.callout)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleUpdateSection(sIdx, {
                                  callout: {
                                    title: 'Key Compliance Note',
                                    text: 'Important requirement or summary notice for this clause.'
                                  }
                                });
                              } else {
                                handleUpdateSection(sIdx, { callout: undefined });
                              }
                            }}
                            className="rounded text-[#0070E0] focus:ring-[#0070E0]"
                          />
                          <span>Highlight Callout Box</span>
                        </label>
                        {section.callout && (
                          <span className="text-[10px] text-sky-600 font-medium">Displayed with special colored highlight card</span>
                        )}
                      </div>

                      {section.callout && (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-2.5">
                          <input
                            type="text"
                            value={section.callout.title}
                            onChange={(e) => {
                              handleUpdateSection(sIdx, {
                                callout: {
                                  title: e.target.value,
                                  text: section.callout?.text || ''
                                }
                              });
                            }}
                            placeholder="Callout Title (e.g. Zero Third-Party Data Monetization)"
                            className="w-full px-3 py-1.5 rounded-lg border border-sky-200 bg-white text-xs font-bold text-sky-900 focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            value={section.callout.text}
                            onChange={(e) => {
                              handleUpdateSection(sIdx, {
                                callout: {
                                  title: section.callout?.title || '',
                                  text: e.target.value
                                }
                              });
                            }}
                            placeholder="Callout explanation or guarantee..."
                            className="w-full px-3 py-1.5 rounded-lg border border-sky-200 bg-white text-xs text-slate-700 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Save Sticky Footer */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-[#0070E0] shrink-0" />
          <span>
            Changes to <strong>{currentPolicy.title}</strong> will take effect immediately across all live pages and modal dialogues.
          </span>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-auto">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-md cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-[#0070E0] hover:bg-[#005bb5] text-white shadow-blue-600/20'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Published Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save {currentPolicy.title}</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
