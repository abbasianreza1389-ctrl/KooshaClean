import time, uuid, base64, json, hmac, hashlib, requests
from dataclasses import dataclass
from typing import Any, Dict
from django.conf import settings

@dataclass
class Token:
    token: str
    expires_at: int

def _cfg() -> Dict[str, Any]:
    return getattr(settings, "TELEHEALTH", {})

class BaseProvider:
    def __init__(self, cfg: dict | None = None):
        self.cfg = cfg or _cfg()

    def ensure_room(self, room):
        return room.provider_room_id or room.code

    def join_token(self, room, user, role: str) -> Token:
        raise NotImplementedError

    def start_recording(self, room) -> Dict[str, Any]:
        raise NotImplementedError

    def stop_recording(self, room) -> Dict[str, Any]:
        raise NotImplementedError

# ---------------- Mock ----------------
class MockProvider(BaseProvider):
    def join_token(self, room, user, role: str) -> Token:
        ttl = int(self.cfg.get("TOKEN_TTL_SECONDS", 3600))
        payload = f"{room.code}:{getattr(user,'id','anon')}:{role}:{int(time.time())}"
        fake = str(uuid.uuid5(uuid.NAMESPACE_DNS, payload))
        return Token(token=fake, expires_at=int(time.time())+ttl)
    def start_recording(self, room): return {"provider":"mock","recording_id":f"mock-{uuid.uuid4()}"}
    def stop_recording(self, room): return {"provider":"mock","stopped":True}

# ---------------- Twilio ----------------
class TwilioProvider(BaseProvider):
    BASE = "https://video.twilio.com/v1"

    def _auth(self):
        key = self.cfg.get("TWILIO_API_KEY")
        secret = self.cfg.get("TWILIO_API_SECRET")
        if not (key and secret):
            raise ValueError("TWILIO_API_KEY/SECRET required")
        return (key, secret)

    def _account_sid(self):
        sid = self.cfg.get("TWILIO_ACCOUNT_SID")
        if not sid: raise ValueError("TWILIO_ACCOUNT_SID required")
        return sid

    def ensure_room(self, room):
        unique = room.code
        r = requests.get(f"{self.BASE}/Rooms", params={"UniqueName": unique}, auth=self._auth(), timeout=10)
        r.raise_for_status()
        data = r.json()
        rooms = data.get("rooms", [])
        if rooms:
            return rooms[0]["sid"]
        # create
        payload = {"UniqueName": unique, "Type": "group"}
        r2 = requests.post(f"{self.BASE}/Rooms", data=payload, auth=self._auth(), timeout=10)
        r2.raise_for_status()
        return r2.json()["sid"]

    def join_token(self, room, user, role: str) -> Token:
        api_key = self.cfg.get("TWILIO_API_KEY")
        api_secret = self.cfg.get("TWILIO_API_SECRET")
        account_sid = self._account_sid()
        ttl = int(self.cfg.get("TOKEN_TTL_SECONDS", 3600))
        now = int(time.time())
        header = {"cty":"twilio-fpa;v=1","typ":"JWT","alg":"HS256"}
        payload = {"jti": f"{api_key}-{uuid.uuid4()}","iss": api_key,"sub": account_sid,"exp": now+ttl,
                   "grants": {"identity": str(getattr(user, "id", "anon")), "video": {"room": room.code}}}
        def b64(x): return base64.urlsafe_b64encode(json.dumps(x).encode()).rstrip(b"=").decode()
        token_body = f"{b64(header)}.{b64(payload)}"
        sig = hmac.new(api_secret.encode(), token_body.encode(), hashlib.sha256).digest()
        jwt = f"{token_body}.{base64.urlsafe_b64encode(sig).rstrip(b'=').decode()}"
        return Token(token=jwt, expires_at=now+ttl)

    def start_recording(self, room):
        room_sid = room.provider_room_id or self.ensure_room(room)
        rules = {"rules":[{"type":"include","all":True}]}
        r = requests.post(f"{self.BASE}/Rooms/{room_sid}/RecordingRules",
                          data={"Rules": json.dumps(rules)}, auth=self._auth(), timeout=10)
        r.raise_for_status()
        return {"provider":"twilio","room_sid":room_sid,"rules":rules,"result":r.json()}

    def stop_recording(self, room):
        room_sid = room.provider_room_id or self.ensure_room(room)
        rules = {"rules":[]}
        r = requests.post(f"{self.BASE}/Rooms/{room_sid}/RecordingRules",
                          data={"Rules": json.dumps(rules)}, auth=self._auth(), timeout=10)
        r.raise_for_status()
        return {"provider":"twilio","room_sid":room_sid,"rules":rules,"result":r.json()}

# ---------------- 100ms (HMS) ----------------
class HMSProvider(BaseProvider):
    API = "https://api.100ms.live/v2"

    def _mgmt_token(self):
        key = self.cfg.get("HMS_ACCESS_KEY"); secret = self.cfg.get("HMS_SECRET")
        if not (key and secret): raise ValueError("HMS_ACCESS_KEY/HMS_SECRET required")
        now = int(time.time())
        header = {"alg":"HS256","typ":"JWT"}
        payload = {"access_key": key, "type":"management","version":2,"iat":now,"nbf":now,"exp":now+300}
        def b64(x): return base64.urlsafe_b64encode(json.dumps(x).encode()).rstrip(b"=").decode()
        token_body = f"{b64(header)}.{b64(payload)}"
        sig = hmac.new(secret.encode(), token_body.encode(), hashlib.sha256).digest()
        return f"{token_body}.{base64.urlsafe_b64encode(sig).rstrip(b'=').decode()}"

    def join_token(self, room, user, role: str) -> Token:
        key = self.cfg.get("HMS_ACCESS_KEY"); secret = self.cfg.get("HMS_SECRET")
        ttl = int(self.cfg.get("TOKEN_TTL_SECONDS", 3600)); now = int(time.time())
        header = {"alg":"HS256","typ":"JWT"}
        payload = {"access_key": key, "type":"app","version":2,"room_id": room.code,"user_id": str(getattr(user,"id","anon")), "role": role, "exp": now+ttl}
        def b64(x): return base64.urlsafe_b64encode(json.dumps(x).encode()).rstrip(b"=").decode()
        token_body = f"{b64(header)}.{b64(payload)}"
        sig = hmac.new(secret.encode(), token_body.encode(), hashlib.sha256).digest()
        jwt = f"{token_body}.{base64.urlsafe_b64encode(sig).rstrip(b'=').decode()}"
        return Token(token=jwt, expires_at=now+ttl)

    def start_recording(self, room):
        token = self._mgmt_token()
        url = f"{self.API}/recordings/room/{room.code}"
        payload = {"type":"room-composite"}
        r = requests.post(url, json=payload, headers={"Authorization": f"Bearer {token}"}, timeout=15)
        r.raise_for_status()
        return {"provider":"hms","result": r.json()}

    def stop_recording(self, room):
        token = self._mgmt_token()
        url = f"{self.API}/recordings/room/{room.code}/stop"
        r = requests.post(url, headers={"Authorization": f"Bearer {token}"}, timeout=15)
        r.raise_for_status()
        return {"provider":"hms","result": r.json()}

# ---------------- Agora ----------------
class AgoraProvider(BaseProvider):
    API = "https://api.agora.io/v1/apps"

    def _auth(self):
        app_id = self.cfg.get("AGORA_APP_ID"); app_cert = self.cfg.get("AGORA_APP_CERT")
        if not (app_id and app_cert): raise ValueError("AGORA_APP_ID/AGORA_APP_CERT required")
        return app_id, app_cert

    def _headers(self):
        cust_id = self.cfg.get("AGORA_CUSTOMER_ID"); cust_secret = self.cfg.get("AGORA_CUSTOMER_SECRET")
        if not (cust_id and cust_secret): raise ValueError("AGORA_CUSTOMER_ID/AGORA_CUSTOMER_SECRET required")
        b = base64.b64encode(f"{cust_id}:{cust_secret}".encode()).decode()
        return {"Authorization": f"Basic {b}", "Content-Type":"application/json"}

    def join_token(self, room, user, role: str) -> Token:
        app_id, app_cert = self._auth()
        ttl = int(self.cfg.get("TOKEN_TTL_SECONDS", 3600)); now=int(time.time())
        raw = f"{app_id}:{room.code}:{getattr(user,'id','anon')}:{now+ttl}"
        sig = hmac.new(app_cert.encode(), raw.encode(), hashlib.sha256).hexdigest()
        token = base64.urlsafe_b64encode(f"{raw}:{sig}".encode()).decode()
        return Token(token=token, expires_at=now+ttl)

    def start_recording(self, room):
        app_id, _ = self._auth()
        acquire_url = f"{self.API}/{app_id}/cloud_recording/acquire"
        headers = self._headers()
        a = requests.post(acquire_url, headers=headers, json={"cname": room.code, "uid":"1", "clientRequest": {}}, timeout=15)
        a.raise_for_status()
        rid = a.json()["resourceId"]
        start_url = f"{self.API}/{app_id}/cloud_recording/resourceid/{rid}/mode/mix/start"
        payload = {
            "cname": room.code, "uid":"1",
            "clientRequest": {
                "recordingConfig": {"maxIdleTime": 60, "streamTypes": 2, "channelType": 1, "videoStreamType": 0},
                "recordingFileConfig": {"avFileType": ["hls","mp4"]},
                "storageConfig": {
                    "vendor": int(self.cfg.get("AGORA_VENDOR", 1)),
                    "region": int(self.cfg.get("AGORA_REGION", 0)),
                    "bucket": self.cfg.get("AGORA_BUCKET",""),
                    "accessKey": self.cfg.get("AGORA_BUCKET_KEY",""),
                    "secretKey": self.cfg.get("AGORA_BUCKET_SECRET",""),
                    "fileNamePrefix": ["koosha","telehealth", room.code]
                }
            }
        }
        s = requests.post(start_url, headers=headers, json=payload, timeout=20)
        s.raise_for_status()
        data = s.json()
        return {"provider":"agora","resourceId": rid, "sid": data.get("sid"), "result": data}

    def stop_recording(self, room):
        app_id, _ = self._auth()
        rid = (room.meta or {}).get("agora_resource_id")
        sid = (room.meta or {}).get("agora_sid")
        if not (rid and sid):
            return {"provider":"agora","error":"missing_resource_or_sid"}
        stop_url = f"{self.API}/{app_id}/cloud_recording/resourceid/{rid}/sid/{sid}/mode/mix/stop"
        headers = self._headers()
        st = requests.post(stop_url, headers=headers, json={"cname": room.code, "uid":"1", "clientRequest": {}}, timeout=15)
        st.raise_for_status()
        return {"provider":"agora","result": st.json()}

def get_provider(name: str):
    cfg = _cfg()
    name = (name or cfg.get("PROVIDER") or "mock").lower()
    if name == "twilio": return TwilioProvider(cfg)
    if name in ("onehundredms","hms","100ms"): return HMSProvider(cfg)
    if name == "agora": return AgoraProvider(cfg)
    return MockProvider(cfg)
