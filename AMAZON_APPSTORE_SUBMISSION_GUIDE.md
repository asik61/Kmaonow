# 🚀 Amazon Appstore Submission & AdMob Approval Complete Guide
**App Name:** Real Money App — Daily Tasks & Rewards  
**Package Name:** `online.realmoneyapp.app`  
**Official Website:** `https://realmoneyapp.online`  
**Privacy Policy:** `https://realmoneyapp.online/privacy-policy.html`  
**Terms of Service:** `https://realmoneyapp.online/terms.html`  
**app-ads.txt:** `https://realmoneyapp.online/app-ads.txt`

---

## 🎯 KYUN AMAZON APPSTORE PEHLE? (Strategy)
Google AdMob ka latest niyam hai ki **Ads live hone ke liye App kisi officially approved App Store par live honi chahiye**.
- Google Play Console par naye account par 20 testers aur 14 din ka lamba jhanjhat hota hai.
- **Amazon Appstore** Google AdMob ka officially verified partner store hai!
- Amazon par koi 20-tester requirement nahi hai. Form bharo, APK upload karo, aur **24 se 48 ghante me app live ho jaati hai**!
- Amazon par live hote hi AdMob me app turant link ho jati hai aur ads approve ho jaate hain.

---

## 📋 PART 1: Amazon Developer Console Par Form Kaise Bharein

### 1. Account Setup
1. Jao: [https://developer.amazon.com/apps-and-games](https://developer.amazon.com/apps-and-games)
2. Apne Amazon Account se Login / Free Developer Register karein.
3. Dashboard par **"Add New App"** -> **"Android"** par click karein.

---

### 2. General Information (Copy-Paste Text)

- **App Title:**
  `Real Money App - Daily Tasks & Rewards`

- **App SKU:**
  `online.realmoneyapp.app`

- **App Category:**
  `Novelty & Humor` ya `Lifestyle` ya `Finance / Utility`

- **Default Language:**
  `English (United States)` ya `English (India)`

---

### 3. Descriptions & Keywords (Copy-Paste)

#### 🔹 Short Description (Under 120 Characters)
```
Complete simple daily tasks, sponsor offers, lucky spin and scratch cards to earn real rewards with instant UPI payout.
```

#### 🔹 Long Description
```
Welcome to Real Money App — India's premier daily reward and micro-task platform!

Earn real wallet cash and instant UPI payouts by engaging with sponsor tasks, participating in daily lucky spins, scratch cards, and inviting friends.

✨ KEY FEATURES:
• Easy Daily Tasks: Download verified sponsor applications, register, and submit proof screenshots for fast reward approval.
• Daily Lucky Spin & Scratch: Enjoy free daily wheel spins and scratch cards with exciting bonuses.
• Instant UPI Transfers: Request withdrawals directly to your PhonePe, Google Pay, Paytm, or BHIM UPI address (starting at just ₹20 for your first cashout!).
• Fair Play Guarantee: Strict 1 Phone = 1 Account security system to ensure genuine users always get rewarded safely and equitably.
• ₹5 Welcome Bonus: Unlock an instant ₹5 bonus upon completing your first verified task!

🔒 100% SAFE & COMPLIANT:
Real Money App is an engagement-based promotional platform. We strictly adhere to fair advertising practices and do NOT offer real-money gambling, lottery, or games of chance requiring financial stakes.

Support & Inquiries: asik94906@gmail.com
Website: https://realmoneyapp.online
Privacy Policy: https://realmoneyapp.online/privacy-policy.html
```

#### 🔹 Product Feature Bullets (5 Bullets)
```
1. Complete quick sponsor offers and simple installation tasks
2. Free daily lucky spins and scratch card rewards
3. Instant payouts directly to Indian UPI addresses (GPay, PhonePe, Paytm)
4. Strict 1 Phone = 1 Account anti-fraud fair play engine
5. ₹5.00 Welcome bonus upon completing your first verified offer
```

#### 🔹 Keywords (Search Tags)
```
money app, cash rewards, daily task, earn money, upi cash, scratch card, spin wheel, reward platform, earn cash, paytm cash, phonepe
```

---

### 4. Privacy Policy & Compliance Links

- **Privacy Policy URL:**
  `https://realmoneyapp.online/privacy-policy.html`

- **Terms of Service URL:**
  `https://realmoneyapp.online/terms.html`

- **Support Email:**
  `asik94906@gmail.com`

- **Support Phone / Website:**
  `https://realmoneyapp.online`

---

### 5. Content Rating Questionnaire Answers

Jab Amazon rating sawal pooche, ye select karein:
- **Does the app contain advertising?** 👉 **YES** (AdMob ads included)
- **Does the app contain gambling or betting?** 👉 **NO** (Strictly No)
- **Does the app collect personal information?** 👉 **YES** (Email & Phone for login and UPI payout)
- **Target Audience:** 👉 **13+ or 18+**

---

### 6. APK File Upload

- **Package Name:** `online.realmoneyapp.app`
- **Target Android Versions:** Android 7.0 (Nougat, API 24) to Android 14/15 (API 34/35)
- **APK Location in GitHub / Project:**
  `android/app/build/outputs/apk/release/app-release.apk`
- Submit par click kar dein!

---

## 💰 PART 2: Amazon Par Live Hone Ke Baad AdMob Approval Flow

Jab Amazon par app live ho jaye (Status: **Live**):

### Step 1: AdMob Console me App Add Karein
1. Jao: [https://admob.google.com](https://admob.google.com)
2. **Apps** -> **Add App** dabayein.
3. Platform: **Android** select karein.
4. Sawal: *"Is the app listed on a supported app store?"* 👉 **YES** select karein.
5. List of stores me se **Amazon Appstore** select karein!
6. Apni app ka naam `Real Money App` ya package name `online.realmoneyapp.app` search karein aur **Add** dabayein.

### Step 2: app-ads.txt Setup (Already Ready!)
1. AdMob me **Settings** -> **Account Information** par apna Publisher ID dekhein (`pub-XXXXXXXXXXXXXXXX`).
2. Project me `public/app-ads.txt` me `pub-XXXXXXXXXXXXXXXX` ki jagah apna real pub id daal de:
   ```
   google.com, pub-YOUR_ACTUAL_PUB_ID, DIRECT, f08c47fec0942fa0
   ```
3. Push kar dena. Google AdMob automatically `realmoneyapp.online/app-ads.txt` crawl karega aur green tick de dega!

---

## 🛡️ PART 3: "1 Phone = 1 Account" Anti-Fraud Protections Active in App

App me yeh 4 level ki security active kar di gayi hai:

1. **Hardware-Level Device ID:**
   - Android Native bridge me `Settings.Secure.ANDROID_ID` aur secure hardware signature read hota hai.
2. **Firestore Device Binding:**
   - `devices/{deviceId}` collection me device pehle account se lock ho jata hai.
   - Agar koi naya banda usi phone me dusra account banane ki koshish karega to login screen par turant red banner aayega:
     *"1 Phone = 1 Account Niyam: Is mobile par pehle se dusra account registered hai (a***k@gmail.com)."*
3. **Self-Referral Anti-Cheat:**
   - User apne hi phone se apna referral code enter nahi kar sakta (device fingerprint match hone par block).
4. **1 UPI = 1 Account:**
   - Ek UPI ID sirf ek account se payout le sakti hai. Duplicate account par same UPI ID daalne par turant block.
