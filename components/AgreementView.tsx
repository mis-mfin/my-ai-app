
import React from 'react';
import { Lead } from '../types';
import { Printer, ArrowLeft, FileCheck } from 'lucide-react';

interface Props {
  lead: Lead;
  onBack: () => void;
}

const AgreementView: React.FC<Props> = ({ lead, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Print Agreement View</h2>
        </div>
        <button 
          onClick={handlePrint}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-md font-semibold"
        >
          <Printer size={18} />
          Print / प्रिंट करें
        </button>
      </div>

      <div id="printable-area" className="bg-white p-6 md:p-10 shadow-2xl border border-slate-200 rounded-xl min-h-[11in]">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div className="text-left">
             <h1 className="text-2xl font-black uppercase text-slate-900 leading-none">Vehicle Finance</h1>
             <p className="text-xs font-bold text-slate-500">LEAD MANAGEMENT SYSTEM</p>
          </div>
          <div className="text-right">
            <p className="text-slate-900 font-black text-xl">CASE: {lead.id}</p>
            <p className="text-xs font-bold text-slate-400">DATE: {new Date(lead.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Customer Info */}
          <section className="col-span-1 space-y-2">
            <h3 className="text-sm font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase">Customer Details / ग्राहक</h3>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[10px]">Name:</span> {lead.customerName}</p>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[10px]">Mobile:</span> {lead.mobile}</p>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[10px]">Broker:</span> {lead.brokerName}</p>
          </section>

          {/* Guarantor Info */}
          <section className="col-span-1 space-y-2">
            <h3 className="text-sm font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase">Guarantor / गारंटीकर्ता</h3>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[10px]">Name:</span> {lead.guarName || 'N/A'}</p>
          </section>

          {/* Verification Details */}
          <section className="col-span-2 space-y-3 pt-4">
            <h3 className="text-sm font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase">Verification & Approval / सत्यापन</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm border p-2 rounded bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Loan Amount</p>
                <p className="font-bold text-lg">₹ {lead.approval?.loanAmount || '0.00'}</p>
              </div>
              <div className="text-sm border p-2 rounded bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tenure</p>
                <p className="font-bold text-lg">{lead.approval?.tenure || '0'} Months</p>
              </div>
              <div className="text-sm border p-2 rounded bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Interest</p>
                <p className="font-bold text-lg">{lead.approval?.interestRate || '0'}%</p>
              </div>
            </div>
          </section>

          {/* Photo Proofs - This section will be small for verification purposes */}
          <section className="col-span-2 pt-6">
            <h3 className="text-sm font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase mb-4">Document Proofs / दस्तावेज़ साक्ष्य</h3>
            <div className="grid grid-cols-4 gap-2">
               {lead.custPhoto && <DocBox label="Cust. Photo" src={lead.custPhoto} />}
               {lead.custAadhaarFront && <DocBox label="Adhaar F" src={lead.custAadhaarFront} />}
               {lead.guarPhoto && <DocBox label="Guar. Photo" src={lead.guarPhoto} />}
               {lead.rcFile && <DocBox label="RC Photo" src={lead.rcFile} />}
            </div>
          </section>
        </div>

        {/* Footer Signature Area */}
        <div className="mt-24 flex justify-between px-6">
          <div className="text-center">
            <div className="w-32 md:w-48 border-b border-slate-900 mb-2"></div>
            <p className="text-[10px] font-bold uppercase">Authorized Signatory</p>
          </div>
          <div className="text-center">
            <div className="w-32 md:w-48 border-b border-slate-900 mb-2"></div>
            <p className="text-[10px] font-bold uppercase">Customer Sign</p>
          </div>
          <div className="text-center">
            <div className="w-32 md:w-48 border-b border-slate-900 mb-2"></div>
            <p className="text-[10px] font-bold uppercase">Guarantor Sign</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area {
            position: absolute; left: 0; top: 0; width: 100%;
            margin: 0; padding: 1rem; box-shadow: none; border: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const DocBox = ({ label, src }: any) => (
  <div className="border p-1 rounded">
    <p className="text-[8px] font-bold text-slate-400 uppercase text-center mb-1">{label}</p>
    <img src={src} className="w-full h-16 object-cover rounded" alt={label} />
  </div>
);

export default AgreementView;
