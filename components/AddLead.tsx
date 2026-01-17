
import React, { useState } from 'react';
import { Lead } from '../types';
import { Upload, Save, ArrowLeft, User, Users, Truck, FileText, Camera, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onAdd: (lead: Omit<Lead, 'id' | 'status' | 'createdAt'>) => void;
  onCancel: () => void;
}

const AddLead: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    brokerName: '',
    guarName: '',
  });
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key: string]: string }>({});
  const [ocrData, setOcrData] = useState<Partial<Lead>>({});

  const extractData = async (base64: string, type: 'aadhaar' | 'rc' | 'insurance') => {
    setIsProcessing(type);
    
    try {
      // Create AI instance inside the function to ensure process.env.API_KEY is accessible
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = base64.split(',')[1];
      
      let prompt = "";
      if (type === 'aadhaar') {
        prompt = `Analyze this Aadhaar card image and extract the following information into a valid JSON format:
        {
          "name": "Full name in English",
          "dob": "Date of birth",
          "aadhaarNo": "12 digit number with spaces",
          "pincode": "6 digit pincode",
          "state": "State name",
          "city": "City or District",
          "area": "Locality or Area",
          "address": "Full address string"
        }
        Only return the JSON object.`;
      } else if (type === 'rc') {
        prompt = `Analyze this Vehicle Registration Certificate (RC) image and extract information into valid JSON:
        {
          "regNo": "Vehicle number",
          "ownerName": "Owner name",
          "vehicleType": "Type of vehicle",
          "mfgYear": "Manufacturing year",
          "make": "Manufacturer",
          "makeClass": "Model name",
          "regAuthority": "RTO name",
          "engineNo": "Engine number",
          "chassisNo": "Chassis number",
          "fuelType": "Petrol/Diesel/CNG",
          "color": "Vehicle color",
          "regDate": "Registration date",
          "expiryDate": "Fitness/Registration expiry"
        }
        Only return the JSON object.`;
      } else if (type === 'insurance') {
        prompt = `Analyze this Vehicle Insurance document image and extract into valid JSON:
        {
          "company": "Insurance company name",
          "type": "Comprehensive/Third Party",
          "policyNo": "Policy number",
          "nameTransfer": "Insured name",
          "endorsementDate": "Start date",
          "expiryDate": "Expiry date",
          "idvValue": "Insured Declared Value as number",
          "premium": "Total premium amount as number"
        }
        Only return the JSON object.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: [{
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
            { text: prompt }
          ]
        }],
        config: { 
          responseMimeType: "application/json" 
        }
      });

      if (!response.text) throw new Error("Empty response from AI");
      
      const result = JSON.parse(response.text.trim());
      
      if (type === 'aadhaar') {
        setOcrData(prev => ({ ...prev, aadhaarData: result }));
        if (result.name) setFormData(prev => ({ ...prev, customerName: result.name }));
      } else if (type === 'rc') {
        setOcrData(prev => ({ ...prev, rcData: result }));
      } else if (type === 'insurance') {
        setOcrData(prev => ({ ...prev, insuranceData: result }));
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI reading failed. Please fill details manually or try a clearer photo.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setFiles(prev => ({ ...prev, [key]: base64 }));
        
        // Trigger OCR for specific documents
        if (key === 'custAadhaarFront') await extractData(base64, 'aadhaar');
        if (key === 'rc') await extractData(base64, 'rc');
        if (key === 'insurance') await extractData(base64, 'insurance');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      ...ocrData,
      custAadhaarFront: files.custAadhaarFront,
      custAadhaarBack: files.custAadhaarBack,
      custPan: files.custPan,
      custPhoto: files.custPhoto,
      guarAadhaarFront: files.guarAadhaarFront,
      guarAadhaarBack: files.guarAadhaarBack,
      guarPan: files.guarPan,
      guarPhoto: files.guarPhoto,
      rcFile: files.rc,
      insuranceFile: files.insurance,
      agreementPhoto: files.agreement,
      hisabChittiPhoto: files.hisab,
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="p-3 hover:bg-white rounded-full transition-all shadow-sm">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">New Finance Case</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">AI Assisted Data Entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <User size={64} />
            </div>
            <h3 className="flex items-center gap-3 font-black text-indigo-900 mb-8 text-lg uppercase tracking-tighter">
              <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">1</span>
              Customer Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Customer Name" value={formData.customerName} onChange={(v: string) => setFormData({...formData, customerName: v})} required />
              <InputField label="Mobile Number" value={formData.mobile} onChange={(v: string) => setFormData({...formData, mobile: v})} required type="tel" />
              <div className="md:col-span-2">
                <InputField label="Broker Name" value={formData.brokerName} onChange={(v: string) => setFormData({...formData, brokerName: v})} required />
              </div>
            </div>
          </div>

          {/* AI Extracted Data Preview (Read Only) */}
          {(ocrData.aadhaarData || ocrData.rcData || ocrData.insuranceData) && (
            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100 space-y-4">
              <h3 className="flex items-center gap-2 font-black text-emerald-900 text-sm uppercase">
                <Sparkles size={18} className="text-emerald-500" /> AI Extracted Info
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[11px]">
                {ocrData.aadhaarData && (
                  <>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-slate-400 font-bold uppercase">Aadhaar No</p>
                      <p className="font-black text-slate-800">{ocrData.aadhaarData.aadhaarNo}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-slate-400 font-bold uppercase">DOB</p>
                      <p className="font-black text-slate-800">{ocrData.aadhaarData.dob}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-slate-400 font-bold uppercase">City/State</p>
                      <p className="font-black text-slate-800">{ocrData.aadhaarData.city}, {ocrData.aadhaarData.state}</p>
                    </div>
                  </>
                )}
                {ocrData.rcData && (
                  <>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-slate-400 font-bold uppercase">Vehicle No</p>
                      <p className="font-black text-slate-800">{ocrData.rcData.regNo}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-slate-400 font-bold uppercase">Mfg Year</p>
                      <p className="font-black text-slate-800">{ocrData.rcData.mfgYear}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <p className="text-slate-400 font-bold uppercase">Engine/Chassis</p>
                      <p className="font-black text-slate-800 truncate">{ocrData.rcData.engineNo}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Documents Grid */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <h3 className="flex items-center gap-3 font-black text-indigo-900 mb-8 text-lg uppercase tracking-tighter">
              <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">2</span>
              Upload Documents
            </h3>
            
            <div className="space-y-10">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Customer Identity</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FileUploadField label="Aadhaar Front (OCR)" id="custAadhaarFront" onChange={handleFileChange} preview={files.custAadhaarFront} loading={isProcessing === 'aadhaar'} />
                  <FileUploadField label="Aadhaar Back" id="custAadhaarBack" onChange={handleFileChange} preview={files.custAadhaarBack} />
                  <FileUploadField label="PAN Card" id="custPan" onChange={handleFileChange} preview={files.custPan} />
                  <FileUploadField label="Passport Photo" id="custPhoto" onChange={handleFileChange} preview={files.custPhoto} />
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Vehicle & Insurance</p>
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadField label="Vehicle RC (OCR)" id="rc" onChange={handleFileChange} preview={files.rc} loading={isProcessing === 'rc'} />
                  <FileUploadField label="Insurance (OCR)" id="insurance" onChange={handleFileChange} preview={files.insurance} loading={isProcessing === 'insurance'} />
                </div>
              </div>
              
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Guarantor</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InputField label="Guarantor Name" value={formData.guarName} onChange={(v: string) => setFormData({...formData, guarName: v})} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FileUploadField label="G. Photo" id="guarPhoto" onChange={handleFileChange} preview={files.guarPhoto} />
                  <FileUploadField label="G. Aadhaar F" id="guarAadhaarFront" onChange={handleFileChange} preview={files.guarAadhaarFront} />
                  <FileUploadField label="G. Aadhaar B" id="guarAadhaarBack" onChange={handleFileChange} preview={files.guarAadhaarBack} />
                  <FileUploadField label="G. PAN Card" id="guarPan" onChange={handleFileChange} preview={files.guarPan} />
                </div>
              </div>

              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Agreement</p>
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadField label="Agreement Photo" id="agreement" onChange={handleFileChange} preview={files.agreement} />
                  <FileUploadField label="Hisab Chitti" id="hisab" onChange={handleFileChange} preview={files.hisab} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-indigo-900 text-white rounded-3xl p-8 shadow-2xl shadow-indigo-900/30 sticky top-10">
            <h4 className="font-black text-lg mb-2 tracking-tighter">Ready to Save?</h4>
            <p className="text-indigo-200 text-sm mb-8 font-medium">Please verify all uploaded documents before submitting the application.</p>
            
            <button 
              type="submit" 
              disabled={!!isProcessing}
              className="w-full bg-white text-indigo-950 hover:bg-indigo-50 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              Submit Case
            </button>
            <button 
              type="button" 
              onClick={onCancel}
              className="w-full mt-4 text-indigo-300 hover:text-white py-2 font-bold text-sm uppercase tracking-widest transition-colors"
            >
              Discard Entry
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", required = false }: any) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
    <input 
      required={required}
      type={type}
      className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 focus:outline-none bg-slate-50/50 font-bold text-slate-800 transition-all"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const FileUploadField = ({ label, id, onChange, preview, loading }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate block">{label}</label>
    <div className={`
      relative h-32 border-4 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden
      ${preview ? 'border-emerald-400 bg-emerald-50' : 'border-slate-100 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30'}
      ${loading ? 'animate-pulse border-indigo-500' : ''}
    `}>
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="text-indigo-500 animate-spin" size={24} />
          <span className="text-[10px] font-black text-indigo-500 uppercase">AI Reading...</span>
        </div>
      ) : preview ? (
        <img src={preview} alt="preview" className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Camera size={24} className="text-slate-300" />
          <span className="text-[10px] text-slate-400 font-black uppercase">Capture</span>
        </div>
      )}
      <input 
        type="file" 
        accept="image/*" 
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
        onChange={(e) => onChange(e, id)}
      />
    </div>
  </div>
);

export default AddLead;
