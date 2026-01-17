
export type Status = 'New' | 'Verified' | 'Approved' | 'Rejected';

export interface VerificationData {
  fieldVerified: boolean;
  creditVerified: boolean;
  remarks: string;
}

export interface ApprovalData {
  status: 'Approve' | 'Reject' | '';
  loanAmount: string;
  tenure: string;
  interestRate: string;
}

export interface Lead {
  id: string;
  customerName: string;
  mobile: string;
  brokerName: string;
  
  // OCR Extracted Data
  aadhaarData?: {
    name: string;
    dob: string;
    aadhaarNo: string;
    pincode: string;
    state: string;
    city: string;
    area: string;
    address: string;
  };
  rcData?: {
    regNo: string;
    ownerName: string;
    vehicleType: string;
    mfgYear: string;
    make: string;
    makeClass: string;
    regAuthority: string;
    engineNo: string;
    chassisNo: string;
    fuelType: string;
    color: string;
    regDate: string;
    expiryDate: string;
  };
  insuranceData?: {
    company: string;
    type: string;
    policyNo: string;
    nameTransfer: string;
    endorsementDate: string;
    expiryDate: string;
    idvValue: string;
    premium: string;
  };

  // Customer Docs (Base64)
  custAadhaarFront?: string;
  custAadhaarBack?: string;
  custPan?: string;
  custPhoto?: string;

  // Guarantor Docs
  guarName: string;
  guarAadhaarFront?: string;
  guarAadhaarBack?: string;
  guarPan?: string;
  guarPhoto?: string;

  // Vehicle Docs
  rcFile?: string;
  insuranceFile?: string;

  // Agreement Docs
  agreementPhoto?: string;
  hisabChittiPhoto?: string;

  status: Status;
  createdAt: string;
  verification?: VerificationData;
  approval?: ApprovalData;
}
