import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

export const openCamera = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      direction: CameraDirection.Rear,
      promptLabelPicture: 'Ambil Foto',
      promptLabelCancel: 'Batal',
    });

    return image;
  } catch (error) {
    console.error('Error opening camera:', error);
    throw error;
  }
};
