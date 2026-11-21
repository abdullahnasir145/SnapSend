import { CameraView, type CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Camera, Flashlight, ImagePlus, RefreshCcw } from "lucide-react-native";
import { useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { Heading1, Heading3, Paragraph } from "@/components/ui/typography";

/** Captures or imports a receipt and presents the explicit pre-OCR processing state. */
export function ScanContainer() {
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);

  const requestCameraAccess = async () => {
    await requestCameraPermission();
  };

  const captureReceipt = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });

    if (photo) {
      setReceiptUri(photo.uri);
    }
  };

  const importReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const resetReceipt = () => {
    setReceiptUri(null);
    setTorchEnabled(false);
  };

  const toggleFacing = () => {
    setFacing(facing === "back" ? "front" : "back");
  };

  if (!cameraPermission) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <View />
      </ScreenContainer>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <ScreenContainer className="items-center justify-center gap-4 px-6">
        <Heading1 size="2xl">Camera access needed</Heading1>
        <Paragraph className="text-center text-muted">
          SnapSend uses your camera only to capture a receipt for your review.
        </Paragraph>
        <Pressable
          accessibilityLabel="Allow camera access"
          className="rounded-button bg-primary px-5 py-3"
          onPress={requestCameraAccess}
        >
          <Paragraph className="text-primary-foreground" weight="semibold">Allow camera</Paragraph>
        </Pressable>
      </ScreenContainer>
    );
  }

  if (receiptUri) {
    return (
      <ScreenContainer className="gap-5 p-5">
        <Heading1 size="2xl">Review receipt</Heading1>
        <Image accessibilityLabel="Captured receipt" className="flex-1 rounded-card bg-surface-secondary" source={{ uri: receiptUri }} />
        <View className="rounded-card bg-primary-soft p-4">
          <Heading3 className="text-primary">Receipt saved for review</Heading3>
          <Paragraph className="mt-1 text-muted">OCR is not enabled yet. Item and total extraction will be added in the next phase.</Paragraph>
        </View>
        <Pressable accessibilityLabel="Capture another receipt" className="items-center rounded-button border border-border py-3" onPress={resetReceipt}>
          <Paragraph weight="semibold">Retake or choose another</Paragraph>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="gap-5 p-5">
      <View>
        <Heading1 size="2xl">Scan receipt</Heading1>
        <Paragraph className="mt-1 text-muted">Fit the full receipt inside the frame.</Paragraph>
      </View>
      <View className="flex-1 overflow-hidden rounded-card bg-foreground">
        <CameraView ref={cameraRef} enableTorch={torchEnabled} facing={facing} style={{ flex: 1 }} />
        <View className="absolute inset-0 items-center justify-between p-5" pointerEvents="box-none">
          <View className="w-full flex-row justify-end gap-3">
            <Pressable accessibilityLabel="Toggle flash" className="h-11 w-11 items-center justify-center rounded-full bg-black/45" onPress={() => setTorchEnabled(!torchEnabled)}>
              <Flashlight color="#FFFFFF" size={20} />
            </Pressable>
            <Pressable accessibilityLabel="Switch camera" className="h-11 w-11 items-center justify-center rounded-full bg-black/45" onPress={toggleFacing}>
              <RefreshCcw color="#FFFFFF" size={20} />
            </Pressable>
          </View>
          <View className="h-[58%] w-full rounded-input border-2 border-white/90" pointerEvents="none" />
        </View>
      </View>
      <View className="flex-row items-center justify-between px-5">
        <Pressable accessibilityLabel="Choose a receipt from photos" className="h-12 w-12 items-center justify-center rounded-full bg-surface-secondary" onPress={importReceipt}>
          <ImagePlus color="#087F5B" size={22} />
        </Pressable>
        <Pressable accessibilityLabel="Capture receipt" className="h-18 w-18 items-center justify-center rounded-full border-4 border-primary-soft bg-primary" onPress={captureReceipt}>
          <Camera color="#FFFFFF" size={28} />
        </Pressable>
        <View className="h-12 w-12" />
      </View>
    </ScreenContainer>
  );
}
