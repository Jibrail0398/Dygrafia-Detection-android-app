import { useState,useRef } from "react";
import { image } from "ionicons/icons";

import ImageUploadedCard from "./ImageUploadedCard";
import UploadCard from "./UploadCard";
import InfferenceResult from "./InfferenceResult";
import { useInference } from "../hooks/useInference";

const Upload:React.FC = ()=>{
  
  const modelPath = "/models/mobilevit_s_fold1_fp16_standalone.onnx";
  const { classify } = useInference(modelPath);

  const [file,setFile] = useState<File|null>(null);
  const [imageUrl,setImageUrl] = useState<string|null>(null);
  const [message,setMessage] = useState<string|null>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageUploaded,setIsimageUploaded] = useState<Boolean>(false);

  const [inferenceResult, setInferenceResult] = useState<{
    label: string;
    classIndex: number;
    confidence: number;
    probabilities: number[];
    findings: string;
    disclaimer?: string;
  } | null>(null);
  
  const allowedTypes = ["image/jpeg","image/jpg","image/png"];

  async function handleChooseImage(event: React.ChangeEvent<HTMLInputElement>){
    const selectedFile = event.target.files?.[0];
    
    if (!selectedFile) {
      setMessage("Tidak ada file yang dipilih");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage("File harus berupa JPG, JPEG, atau PNG");
      return;
    }

    setFile(selectedFile);
    setIsimageUploaded(true);
    const objectUrl = URL.createObjectURL(selectedFile);
    setImageUrl(objectUrl);
    setMessage("File berhasil diupload");
    
    try {
      // Karena useInference.ts sudah diperbaiki, res tidak akan undefined lagi
      const res = await classify(objectUrl);

      // Tentukan findings berdasarkan label
      const findings = res?.label === "Potential Dysgraphia" 
        ? "Ditemukan salah satu atau kombinasi dari indikasi berikut:\n1. Spasi antar kata tidak konsisten\n2. Ukuran huruf tidak konsisten\n3. Huruf-huruf yang melewati garis atau melayang diantara garis"
        : "Tulisan tangan anak tampak normal, tidak ditemukan indikasi disgrafia";

      // Tentukan disclaimer berdasarkan label
      const disclaimer = res?.label === "Potential Dysgraphia"
        ? "“ Hasil ini merupakan skrining awal dan bukan  diagnosis medis. Untuk memastikan kondisi anak secara menyeluruh, silahkan berkonsultasi dengan tenaga professional.“"
        : "";

      if (res?.label) {
        const newInferenceResult = {
          ...res,
          findings: findings,
          disclaimer: disclaimer,
        };
        setInferenceResult(newInferenceResult);
        console.log(`Isi inferenceResult: `, newInferenceResult)
      }
      console.log("Hasil Prediksi:", res);

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