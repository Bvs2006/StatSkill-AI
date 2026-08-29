import React, { useState } from "react";
import { type NsstaTrainingProgramme, getProfile } from "../services/storageService";

interface NsstaRegistrationModalProps {
  programme: NsstaTrainingProgramme | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (programmeId: string) => void;
}

export function NsstaRegistrationModal({
  programme,
  isOpen,
  onClose,
  onSuccess,
}: NsstaRegistrationModalProps) {
  const profile = getProfile();
  const [designation, setDesignation] = useState(profile.designation || "Senior Statistical Officer (SSO)");
  const [department, setDepartment] = useState(profile.department || "National Accounts Division (NAD)");
  const [employeeId, setEmployeeId] = useState(profile.employeeId || "MOSPI-ISS-2026-8842");
  const [contactEmail, setContactEmail] = useState(profile.email || "officer.iss@nic.in");
  const [lodgingRequired, setLodgingRequired] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  if (!isOpen || !programme) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const refNumber = `TPAC-NSSTA-${programme.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setConfirmedRef(refNumber);
      setSubmitting(false);
      onSuccess(programme.id);
    }, 600);
  }

  function handleResetAndClose() {
    setConfirmedRef(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-gray-100 p-6 sm:p-8 shadow-2xl relative space-y-5 my-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                NSSTA Greater Noida · TPAC
              </span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">
                ● Open for Nominations
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0B3D66] mt-1 font-serif">
              Official Programme Nomination
            </h2>
          </div>
          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {confirmedRef ? (
          /* Confirmation Receipt View */
          <div className="space-y-4 text-center py-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold mx-auto">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 font-serif">
                Nomination Confirmed &amp; Dispatched
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Your official nomination request has been registered in the NSSTA TPAC Training Cadre Roster.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-left text-xs space-y-1.5 font-mono text-gray-700">
              <div className="flex justify-between border-b border-amber-200/60 pb-1">
                <span className="text-gray-500">Nomination Reference:</span>
                <span className="font-bold text-[#0B3D66]">{confirmedRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nominated Officer:</span>
                <span className="font-semibold text-gray-900">{profile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cadre &amp; ID:</span>
                <span className="text-gray-900">{profile.cadre} ({employeeId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Programme:</span>
                <span className="text-gray-900 truncate max-w-[240px]">{programme.programmeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Schedule:</span>
                <span className="text-[#FF7A00] font-bold">{programme.schedule}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue:</span>
                <span className="text-gray-900">{programme.deliveryMode}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href="https://www.mospi.gov.in"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all text-center"
              >
                Visit Official MoSPI Portal ↗
              </a>
              <button
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 bg-[#0B3D66] hover:bg-[#082e4f] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form View */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Programme Snapshot */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1.5">
              <div className="font-bold text-[#0B3D66] text-xs sm:text-sm">{programme.programmeName}</div>
              <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                <span>🗓️ <strong>Dates:</strong> {programme.schedule}</span>
                <span>⏱️ <strong>Duration:</strong> {programme.duration}</span>
                <span>📍 <strong>Venue:</strong> {programme.deliveryMode}</span>
              </div>
              <div className="text-[10px] text-gray-500 pt-0.5">
                <strong>Eligibility:</strong> {programme.eligibility}
              </div>
            </div>

            {/* Officer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Officer Name</label>
                <input
                  type="text"
                  value={profile.name}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded-xl border border-gray-200 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Employee Cadre ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-[#0B3D66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-[#0B3D66] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Department / Division</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-[#0B3D66] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Official NIC / Gov Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-[#0B3D66] focus:outline-none"
              />
            </div>

            {/* Hostel Accommodation Preference */}
            {programme.deliveryMode.toLowerCase().includes("residential") && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-800 text-[11px]">NSSTA Hostel Accommodation</div>
                  <div className="text-[10px] text-gray-500">Complimentary executive residential room at Greater Noida campus</div>
                </div>
                <input
                  type="checkbox"
                  checked={lodgingRequired}
                  onChange={(e) => setLodgingRequired(e.target.checked)}
                  className="w-4 h-4 text-[#0B3D66] rounded cursor-pointer"
                />
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#0B3D66] hover:bg-[#082e4f] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin text-sm">◌</span>
                    <span>Processing Nomination with NSSTA TPAC...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Official Nomination / Registration</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
