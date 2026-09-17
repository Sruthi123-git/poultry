import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import {
  FolderKanban,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Archive,
  ArrowRight,
  Sparkles,
  X,
  Scale,
  Award,
} from 'lucide-react';
import { Batch } from '../../types';
import confetti from 'canvas-confetti';

export const BatchManagementView: React.FC = () => {
  const { batches, activeBatch, createNewBatch, closeBatch, switchActiveBatch } = useFarm();

  // Create Batch Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [batchName, setBatchName] = useState<string>('Batch 2026-B03 (Vencobb 430Y)');
  const [breed, setBreed] = useState<string>('Vencobb 430Y');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [initialChicks, setInitialChicks] = useState<string>('12000');
  const [shed1Chicks, setShed1Chicks] = useState<string>('6000');
  const [shed2Chicks, setShed2Chicks] = useState<string>('6000');
  const [targetAge, setTargetAge] = useState<string>('42');
  const [targetWeight, setTargetWeight] = useState<string>('2800');
  const [batchNotes, setBatchNotes] = useState<string>('Pre-placement litter fumigation completed.');

  // Close Batch Modal
  const [closingBatch, setClosingBatch] = useState<Batch | null>(null);
  const [finalLiveBirds, setFinalLiveBirds] = useState<string>('11600');
  const [finalAvgWeightKg, setFinalAvgWeightKg] = useState<string>('2.85');
  const [finalFCR, setFinalFCR] = useState<string>('1.55');
  const [harvestNotes, setHarvestNotes] = useState<string>('Harvested successfully at target weight.');

  const handleTotalChicksChange = (val: string) => {
    setInitialChicks(val);
    const num = parseInt(val, 10) || 0;
    const half = Math.floor(num / 2);
    setShed1Chicks(String(half));
    setShed2Chicks(String(num - half));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseInt(initialChicks, 10) || 12000;
    const s1 = parseInt(shed1Chicks, 10) || 6000;
    const s2 = parseInt(shed2Chicks, 10) || 6000;

    await createNewBatch({
      name: batchName.trim() || `Batch ${Date.now()}`,
      breed,
      startDate,
      initialChicks: total,
      shed1StartingChicks: s1,
      shed2StartingChicks: s2,
      targetHarvestAgeDays: parseInt(targetAge, 10) || 42,
      targetHarvestWeightGrams: parseInt(targetWeight, 10) || 2800,
      notes: batchNotes.trim() || undefined,
    });

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch (err) {}

    setShowCreateModal(false);
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingBatch) return;

    await closeBatch(
      closingBatch.id,
      parseInt(finalLiveBirds, 10) || 11600,
      parseFloat(finalAvgWeightKg) || 2.85,
      parseFloat(finalFCR) || 1.55,
      harvestNotes
    );

    setClosingBatch(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Batch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-500" />
            <span>Flock Batch Lifecycle Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create new chick batches, assign shed allocations, harvest completed flocks, and archive records safely.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create New Batch</span>
        </button>
      </div>

      {/* BATCHES LIST */}
      <div className="space-y-4">
        {batches.map(batch => {
          const isActive = batch.status === 'active';
          const isCurrentSelected = activeBatch?.id === batch.id;

          return (
            <div
              key={batch.id}
              className={`p-6 rounded-3xl border shadow-card transition-all ${
                isCurrentSelected
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isActive ? 'Active Flock' : 'Archived Cycle'}
                    </span>
                    {isCurrentSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Currently Viewing
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500">
                      Placed: {batch.startDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                    {batch.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Breed: <strong>{batch.breed}</strong> • Total Placement: <strong>{batch.initialChicks.toLocaleString()} chicks</strong> (Shed 1: {batch.shed1StartingChicks.toLocaleString()} | Shed 2: {batch.shed2StartingChicks.toLocaleString()})
                  </p>
                  {batch.notes && (
                    <p className="text-xs text-slate-500 italic mt-1">"{batch.notes}"</p>
                  )}
                </div>

                {/* Final Performance Highlights (if completed) */}
                {!isActive && batch.finalLiveBirds && (
                  <div className="grid grid-cols-3 gap-3 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Harvest Birds</span>
                      <span className="font-bold text-emerald-600">{batch.finalLiveBirds.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Final FCR</span>
                      <span className="font-bold text-indigo-600">{batch.finalFCR}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Weight</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{batch.finalTotalWeightKg?.toLocaleString()} kg</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  {!isCurrentSelected && (
                    <button
                      onClick={() => switchActiveBatch(batch.id)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      Switch to Batch
                    </button>
                  )}

                  {isActive && (
                    <button
                      onClick={() => {
                        setClosingBatch(batch);
                        setFinalLiveBirds(String(batch.initialChicks - 300));
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Harvest / Complete Batch</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW BATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 my-auto animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Create New Flock Batch
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Name / Reference Code
                </label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={e => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Broiler Breed Standard
                  </label>
                  <select
                    value={breed}
                    onChange={e => setBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Vencobb 430Y">Vencobb 430Y</option>
                    <option value="Cobb 500">Cobb 500</option>
                    <option value="Ross 308">Ross 308</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chick Placement Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Initial Starting Chicks
                </label>
                <input
                  type="number"
                  min="100"
                  required
                  value={initialChicks}
                  onChange={e => handleTotalChicksChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shed 1 Allocation
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={shed1Chicks}
                    onChange={e => setShed1Chicks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shed 2 Allocation
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={shed2Chicks}
                    onChange={e => setShed2Chicks(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Harvest Age (Days)
                  </label>
                  <input
                    type="number"
                    value={targetAge}
                    onChange={e => setTargetAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Harvest Weight (g)
                  </label>
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={e => setTargetWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. DOC hatchery source, vaccine schedule..."
                  value={batchNotes}
                  onChange={e => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Initialize Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HARVEST / COMPLETE BATCH MODAL */}
      {closingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Harvest & Complete Flock ({closingBatch.name})
                </h3>
              </div>
              <button
                onClick={() => setClosingBatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Final Live Harvested Birds Count
                </label>
                <input
                  type="number"
                  required
                  value={finalLiveBirds}
                  onChange={e => setFinalLiveBirds(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Final Average Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={finalAvgWeightKg}
                    onChange={e => setFinalAvgWeightKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Final Feed Conversion (FCR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={finalFCR}
                    onChange={e => setFinalFCR(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Harvest Notes & Buyer Details
                </label>
                <input
                  type="text"
                  value={harvestNotes}
                  onChange={e => setHarvestNotes(e.target.value)}
                  placeholder="e.g. Sold to processing plant, avg price Rs 115/kg..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200">
                Total Live Biomass Produced: <strong>{((parseInt(finalLiveBirds, 10) || 0) * (parseFloat(finalAvgWeightKg) || 0)).toLocaleString()} kg</strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClosingBatch(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-md"
                >
                  Save & Archive Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
