import { Injectable } from '@angular/core';
import { Media } from '@capacitor-community/media';
import {
  GetBrightnessReturnValue,
  ScreenBrightness,
} from '@capacitor-community/screen-brightness';
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar } from '@capacitor/status-bar';
import {
  Nfc,
  NfcPlugin,
  NfcTag,
  NfcTagScannedEvent,
  NfcUtils,
} from '@capawesome-team/capacitor-nfc';
import { CapacitorPassToWallet } from 'capacitor-pass-to-wallet';

export interface IAddToAppleWalletError {
  message: string;
}

export interface IAddToAppleWalletErrorParsed {
  message: string;
  /**
   * 100 = Pass already exists in the wallet
   */
  code: 100;
}
@Injectable()
export class CapacitorService {
  public isNative = Capacitor.isNativePlatform();
  public isIOS = Capacitor.getPlatform() === 'ios';
  public isAndroid = Capacitor.getPlatform() === 'android';
  public isDesktop = Capacitor.getPlatform() === 'web';
  public devicePlatform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  public hFeedbackStyles = { ...ImpactStyle, ...NotificationType };
  public nfcUtils = new NfcUtils();

  public get brightness(): Promise<GetBrightnessReturnValue> {
    return new Promise<GetBrightnessReturnValue>((resolve, reject) => {
      if (!this.isNative) {
        return resolve({ brightness: 0 });
      }
      return ScreenBrightness.getBrightness()
        .then((brightness: GetBrightnessReturnValue) => resolve(brightness))
        .catch((error) => reject(error));
    });
  }

  public itemClickedHapticFeedback() {
    if (!this.isNative) {
      return;
    }

    return Haptics.impact({ style: ImpactStyle.Light }).catch((error) =>
      console.error(`Error triggering selection feedback: ${error}`)
    );
  }

  public async addToWallet(base64: string) {
    return CapacitorPassToWallet.addToWallet({
      base64,
    });
  }

  public triggerHapticFeedback(style: ImpactStyle | NotificationType) {
    // console.log('triggerHapticFeedback', style, this.isNative);
    if (!this.isNative) {
      return;
    }

    if (
      Object.values(NotificationType).includes(
        style as unknown as NotificationType
      )
    ) {
      return Haptics.notification({
        type: style as unknown as NotificationType,
      }).catch((error) => {
        console.error(`Error triggering haptic feedback: ${error}`); // Android
        Haptics.vibrate();
      });
    }

    return Haptics.impact({ style: style as unknown as ImpactStyle }).catch(
      (error) => {
        console.error(`Error triggering haptic feedback: ${error}`); // Android
        Haptics.vibrate();
      }
    );
  }

  public async modal(config: {
    title: string;
    message: string;
    options: { title: string; style?: ActionSheetButtonStyle }[];
  }) {
    const _config = Object.assign({
      ...config,
      options: [
        ...config.options,
        {
          title: 'Annulla',
          style: ActionSheetButtonStyle.Cancel,
        },
      ],
    });

    const result = await ActionSheet.showActions(_config);
    if (result.index === config.options.length) {
      return null;
    }

    return result;
  }

  public async takePhoto() {
    return await Camera.getPhoto({
      quality: 60,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      width: 1024,
      height: 1024,
      source: this.isNative ? CameraSource.Prompt : CameraSource.Camera,
      direction: CameraDirection.Rear,
      promptLabelPicture: 'Scatta una foto',
      promptLabelPhoto: 'Seleziona dalla galleria',
      promptLabelHeader: "Scegli un'immagine",
      promptLabelCancel: 'Annulla',
      presentationStyle: 'fullscreen',
    });
  }

  public async setStatusbarVisibility(visible: boolean) {
    if (!this.isNative) {
      return;
    }

    if (!visible) {
      await StatusBar.hide();
      return;
    }

    await StatusBar.show();
  }

  public async setBrightness(brightness: number): Promise<void> {
    if (!this.isNative) {
      return;
    }

    await ScreenBrightness.setBrightness({ brightness }).catch((error) =>
      console.error(`Error setting brightness: ${error}`)
    );
  }

  public async saveImage(config: { filename: string; data: string }) {
    await Media.savePhoto({
      path: `Notify/${config.filename}`,
      fileName: config.filename,
    });
  }

  public async scanNFCTag(
    callback: (
      Nfc: NfcPlugin,
      tag: NfcTag | undefined,
      source: 'scanSessionCanceled' | 'scanSessionError' | 'nfcTagScanned'
    ) => unknown
  ) {
    if (!this.isNative) {
      return;
    }

    const eventHandler = async (
      resolve: () => void,
      source: 'scanSessionCanceled' | 'scanSessionError' | 'nfcTagScanned',
      event?: NfcTagScannedEvent
    ) => {
      await callback(Nfc, event?.nfcTag, source);
      Nfc.stopScanSession();
      Nfc.removeAllListeners();
      resolve();
    };

    await new Promise<void>((resolve) => {
      Nfc.addListener('scanSessionCanceled', async () => {
        console.log('NFC Scan Session Canceled 🚀');
        await eventHandler(resolve, 'scanSessionCanceled');
      });

      Nfc.addListener('scanSessionError', async () => {
        console.log('NFC Scan Session Error 🚀');
        await eventHandler(resolve, 'scanSessionError');
      });

      Nfc.addListener('nfcTagScanned', async (event) => {
        console.log('NFC Tag Scanned 🚀');
        await eventHandler(resolve, 'nfcTagScanned', event);
      });

      Nfc.startScanSession();
    });
  }

  public prepareURINDEF(uri: string) {
    return this.nfcUtils.createNdefUriRecord({
      uri,
    }).record;
  }
}
