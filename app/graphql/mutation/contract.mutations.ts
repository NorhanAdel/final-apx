// Upload signed contract
export const UPLOAD_SIGNED_CONTRACT = `
  mutation UploadSignedContract($file: Upload!) {
    uploadSignedContract(file: $file) {
      id
      contract_url
      status
      rejection_reason
      created_at
      reviewed_at
    }
  }
`;
