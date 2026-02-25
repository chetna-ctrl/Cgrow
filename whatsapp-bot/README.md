# cGrow WhatsApp Bot 🌱

**Twilio ka free alternative** — Aapke personal WhatsApp number se messages bhejta hai.

---

## Quick Start

```bash
# 1. Dependencies install karein
npm install

# 2. Bot start karein
node index.js

# 3. Terminal mein QR code aayega — phone se scan karein
#    WhatsApp > ⋮ > Linked Devices > Link a Device

# 4. "WhatsApp Bot is READY!" aane ke baad dashboard use kar sakte hain
```

---

## API Endpoints

| Method | URL | Use |
|--------|-----|-----|
| `GET` | `/status` | Bot ready hai ya nahi check karo |
| `POST` | `/send-msg` | Single message bhejo |
| `POST` | `/send-bulk` | Multiple messages bhejo (max 50) |

### /send-msg Example
```json
POST http://localhost:3001/send-msg
{
  "number": "919876543210",
  "message": "Alert! Paudhon ko pani chahiye 🌱"
}
```

### Python se kaise use karein (Agri-OS sensors ke liye)
```python
import requests

requests.post("http://localhost:3001/send-msg", json={
    "number": "919876543210",
    "message": "Alert! Soil moisture 18% — pani ki zaroorat hai 🌱"
})
```

---

## ⚠️ Important Rules (Account Ban se Bachne ke liye)

1. **Din mein 100 se zyada messages mat bhejo** unknown numbers ko
2. **Sirf opt-in users ko bhejo** — jo expect kar rahe hain
3. **Delay auto-set hai** — 2-5 seconds gap automatically lagta hai

---

## Session Reset (Agar dobara QR chahiye)

```bash
# .wwebjs_auth folder delete karo aur restart karo
rmdir /s /q .wwebjs_auth
node index.js
```
