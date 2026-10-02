# 안드로이드 앱 (TWA)

Merhaba 안드로이드 앱은 [Trusted Web Activity](https://developer.chrome.com/docs/android/trusted-web-activity)로,
https://turkish-for-koreans.pages.dev 를 Chrome 엔진으로 전체 화면에 띄운다. 그래서

- 웹을 업데이트하면 앱도 바로 최신이 된다 (APK를 다시 배포할 필요 없음 — 아이콘·이름·주소를 바꿀 때만 새로 빌드)
- 말하기 연습(음성 인식)·서비스 워커·오프라인 저장이 웹과 똑같이 동작한다
- 처음 실행할 때 와이파이에서 녹음·글꼴을 자동 저장하면, 그다음부터 데이터 없이 학습할 수 있다

주소 표시줄 없이 열리려면 사이트의 `/.well-known/assetlinks.json`에 앱 서명 인증서의 SHA-256 지문이 있어야 한다(이 저장소의 `.well-known/assetlinks.json`).

## 빌드

```powershell
# 준비: JDK 17+ · Android SDK (cmdline-tools) · Node 20+
# ~/.bubblewrap/config.json: { "jdkPath": "...", "androidSdkPath": "..." }
# SDK에 tools 폴더가 없으면: New-Item -ItemType Junction -Path <SDK>\tools -Target <SDK>\cmdline-tools\latest

mkdir C:\merhaba-android; copy android\twa-manifest.json C:\merhaba-android\   # 한글이 없는 경로에서
cd C:\merhaba-android
$env:BUBBLEWRAP_KEYSTORE_PASSWORD = '<키 비밀번호>'; $env:BUBBLEWRAP_KEY_PASSWORD = '<키 비밀번호>'
Remove-Item Env:\NoDefaultCurrentDirectoryInExePath -ErrorAction SilentlyContinue   # gradlew.bat을 찾도록
npx @bubblewrap/cli update --skipVersionUpgrade
npx @bubblewrap/cli build --skipPwaValidation
copy app-release-signed.apk <저장소>\download\merhaba.apk
```

- 서명 키: `C:\Users\jeong\keys\merhaba\merhaba.keystore` (별칭 `merhaba`, 비밀번호는 같은 폴더의 `password.txt`) — **저장소에 넣지 말 것.** 잃어버리면 같은 앱으로 업데이트할 수 없다.
- 새 버전을 낼 때는 `twa-manifest.json`의 `appVersionCode`(정수)를 올린다.
- 구글 플레이에 올리려면 `app-release-bundle.aab`를 플레이 콘솔에 올린다(개발자 등록 필요). 플레이 앱 서명을 쓰면 플레이가 다시 서명하므로, 플레이 콘솔에 표시되는 SHA-256 지문도 `assetlinks.json`에 추가해야 한다.
