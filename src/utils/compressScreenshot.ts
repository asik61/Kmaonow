export interface CompressedResult {
  dataUrl: string;
  originalKb: number;
  compressedKb: number;
}

export async function compressScreenshot(file: File, maxBytes = 195 * 1024): Promise<CompressedResult> {
  const originalKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image format unsupported'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxSide = 1080;

        if (width > maxSide || height > maxSide) {
          if (width > height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let byteSize = Math.round((dataUrl.length * 3) / 4);

        while (byteSize > maxBytes && quality > 0.25) {
          quality -= 0.12;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          byteSize = Math.round((dataUrl.length * 3) / 4);
        }

        resolve({
          dataUrl,
          originalKb,
          compressedKb: Math.max(1, Math.round(byteSize / 1024)),
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function generateSyntheticProofReceipt(taskTitle: string, rewardAmount: number, userPhone: string): CompressedResult {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 840;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 640, 840);

  // Top Green Banner
  ctx.fillStyle = '#047857';
  ctx.fillRect(0, 0, 640, 120);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('KamaoNow Partner Verification', 36, 55);

  ctx.fillStyle = '#D1FAE5';
  ctx.font = '14px monospace';
  ctx.fillText(`TASK-ID: KN-${Date.now().toString().slice(-8)}`, 36, 85);

  // White Card container
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.fillRect(36, 150, 568, 630);
  ctx.strokeRect(36, 150, 568, 630);

  // Green Checkmark Badge
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(320, 240, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(302, 240);
  ctx.lineTo(316, 254);
  ctx.lineTo(340, 226);
  ctx.stroke();

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Task Step Completed', 320, 320);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`Reward: ₹${rewardAmount.toFixed(2)}`, 320, 355);

  ctx.fillStyle = '#64748B';
  ctx.font = '15px sans-serif';
  ctx.fillText(taskTitle, 320, 390);

  // Divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 425);
  ctx.lineTo(570, 425);
  ctx.stroke();

  ctx.textAlign = 'left';
  const rows = [
    ['User Mobile', `+91 ${userPhone}`],
    ['Status', 'KYC / Registration Confirmed'],
    ['Verification Timestamp', new Date().toLocaleString('en-IN')],
    ['Transaction Hash', `KN-VERIFIED-${Math.random().toString(36).substring(2, 9).toUpperCase()}`],
  ];

  let y = 475;
  for (const [lbl, val] of rows) {
    ctx.fillStyle = '#64748B';
    ctx.font = '14px sans-serif';
    ctx.fillText(lbl, 70, y);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(val, 70, y + 26);
    y += 65;
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
  const bytes = Math.round((dataUrl.length * 3) / 4);

  return {
    dataUrl,
    originalKb: 340,
    compressedKb: Math.max(1, Math.round(bytes / 1024)),
  };
}
