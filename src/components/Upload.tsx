import { useState,useRef } from "react";
import { RunInfference } from "../services/infference";
import { image } from "ionicons/icons";

import ImageUploadedCard from "./ImageUploadedCard";
import UploadCard from "./UploadCard";
import InfferenceResult from "./InfferenceResult";

const Upload:React.FC = ()=>{
  const [file,setFile] = useState<File|null>(null);
  const [imageUrl,setImageUrl] = useState<string|null>(null);
  const [message,setMessage] = useState<string|null>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageUploaded,setIsimageUploaded] = useState<Boolean>(false);
  const [inferenceResult, setInferenceResult] = useState<{
    label: 'Potential Dysgraphia' | 'Low Potential Dysgraphia';
    confidence?: number;
    findings: string[];
    disclaimer?: string;
  } | null>(null);
  
  const allowedTypes = ["image/jpeg","image/jpg","image/png"];

  async function handleChooseImage(event: React.ChangeEvent<HTMLInputElement>){
    const selectedFile = event.target.files?.[0];
    
    // Validasi file ada
    if (!selectedFile) {
      setMessage("Tidak ada file yang dipilih");
      return;
    }
  
    // Validasi tipe file
    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("File harus berupa JPG, JPEG, atau PNG");
      return;
    }
  
    setFile(selectedFile);
    setIsimageUploaded(true);
    setImageUrl(URL.createObjectURL(selectedFile));
    setMessage("File berhasil diupload");
    try {
      // TODO: Implement runInference function
      const result =  RunInfference("Potential Dysgraphia");
      setInferenceResult(result as typeof inferenceResult);
      
      console.log('File selected:', selectedFile.name);
    } catch (error) {
      setMessage("Gagal memproses gambar");
    }
  }
  
  function handleOpenFilePicker () {
    fileInputRef.current?.click();
  };
  
  const handleDeleteImage = () => {
    setFile(null);
    setImageUrl(null);
    setIsimageUploaded(false);
    setMessage(null);
    setInferenceResult(null);
  };
  
  return(
    <div>
      {!isImageUploaded ? (
        <>
          <UploadCard
            icon={image}
            title="Silahkan Unggah Gambar"
            subtitle="Gunakan gambar yang jelas untuk hasil prediksi terbaik"
            buttonText="Ambil Gambar"
            onButtonClick={handleOpenFilePicker}
          />
        </>
      ) : (
        <>
          {imageUrl && (
            <ImageUploadedCard
              imageSrc={imageUrl}
              fileName={file?.name}
            />
          )}
          {inferenceResult && (
            <InfferenceResult
              label={inferenceResult.label}
              confidence={inferenceResult.confidence}
              findings={inferenceResult.findings}
              disclaimer={inferenceResult.disclaimer}
              onDelete={handleDeleteImage}
              changeImages={handleOpenFilePicker}
            />
          )}
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleChooseImage}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default Upload;