// Student Document DTO matching backend StudentDocumentDto
export interface StudentDocument {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  type: string;
  name: string;
  description?: string;
  originalFileName?: string;
  contentType?: string;
  fileSize: number;
  fileSizeFormatted: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedByName?: string;
  expirationDate?: string;
  isExpired: boolean;
  createdAt: string;
  downloadUrl?: string;
}

// Student Document List DTO matching backend StudentDocumentListDto
export interface StudentDocumentListItem {
  id: string;
  type: string;
  name: string;
  originalFileName?: string;
  fileSizeFormatted: string;
  isVerified: boolean;
  expirationDate?: string;
  isExpired: boolean;
  createdAt: string;
}

// Document Upload Result DTO matching backend DocumentUploadResultDto
export interface DocumentUploadResult {
  documentId: string;
  fileName: string;
  fileSize: number;
  fileSizeFormatted: string;
  downloadUrl?: string;
}

// Document Statistics DTO matching backend DocumentStatisticsDto
export interface DocumentStatistics {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingVerification: number;
  expiredDocuments: number;
  totalStorageUsed: number;
  totalStorageFormatted: string;
  documentsByType: Record<string, number>;
}

// Document filter for querying
export interface DocumentFilter {
  type?: string;
  isVerified?: boolean;
  includeExpired?: boolean;
}

// Document types
export const DOCUMENT_TYPES = [
  'Transcript',
  'ID Card',
  'Passport',
  'Birth Certificate',
  'Vaccination Record',
  'Medical Record',
  'Financial Aid',
  'Scholarship',
  'Recommendation Letter',
  'Resume',
  'Photo',
  'Other'
];
