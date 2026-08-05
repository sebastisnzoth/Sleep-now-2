# Sleep Now para Android

La aplicación web fue preparada para ejecutarse como una app Android mediante Capacitor.

## Identidad de la aplicación

- Nombre: `Sleep Now`
- Application ID: `com.sleepnow.app`
- Contenido web compilado: `dist`

## Generar el proyecto Android

```bash
npm install
npm run android:add
```

El comando anterior compila la aplicación web y crea la carpeta nativa `android/`.

## Abrir en Android Studio

```bash
npm run android:open
```

Desde Android Studio se puede ejecutar la app en un emulador o en un teléfono conectado por USB.

## Sincronizar cambios web

Cada vez que se modifique React, ejecutar:

```bash
npm run android:sync
```

## Crear un APK de prueba

Desde la carpeta `android`:

```bash
./gradlew assembleDebug
```

El archivo se genera en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Compilación automática en GitHub

La rama `android-capacitor` incluye el workflow `Build Android Debug APK`. Al ejecutarlo desde la pestaña Actions, GitHub genera un APK de prueba descargable como artefacto.

## Publicación

Para Google Play se debe crear un Android App Bundle firmado desde Android Studio y completar la ficha de la aplicación en Google Play Console. Las claves de firma deben mantenerse fuera del repositorio.
