// 教科書連動アプリ共通のログイン処理（Firebase Authentication + Firestore）
import { firebaseConfig } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.14.1";

export const enabled = Boolean(firebaseConfig);

let ctx = null;

export async function firebase() {
  if (ctx) return ctx;
  const [{ initializeApp }, authMod, fsMod] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  ctx = { auth: authMod.getAuth(app), db: fsMod.getFirestore(app), authMod, fsMod };
  return ctx;
}

// 認証状態が確定するまで待つ
export async function currentUser() {
  const { auth } = await firebase();
  await auth.authStateReady();
  return auth.currentUser;
}

const cacheKey = (uid) => `bhy-profile:${uid}`;

// 氏名・所属の登録が済んでいるか
export async function hasProfile(user) {
  try {
    if (localStorage.getItem(cacheKey(user.uid)) === "1") return true;
  } catch {}
  const profile = await getProfile(user);
  const ok = Boolean(profile && profile.name && profile.affiliation);
  if (ok) {
    try { localStorage.setItem(cacheKey(user.uid), "1"); } catch {}
  }
  return ok;
}

export async function getProfile(user) {
  const { db, fsMod } = await firebase();
  const snap = await fsMod.getDoc(fsMod.doc(db, "users", user.uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveProfile(user, { name, affiliation }) {
  const { db, fsMod } = await firebase();
  const ref = fsMod.doc(db, "users", user.uid);
  const exists = (await fsMod.getDoc(ref)).exists();
  const data = {
    email: user.email,
    name,
    affiliation,
    updatedAt: fsMod.serverTimestamp(),
  };
  if (!exists) data.createdAt = fsMod.serverTimestamp();
  await fsMod.setDoc(ref, data, { merge: true });
  try { localStorage.setItem(cacheKey(user.uid), "1"); } catch {}
}

const EMAIL_KEY = "bhy-login-email";

// ログイン用リンクをメールで送る。リンクを押すとこのログイン画面（next 付き）に戻る
export async function sendLoginLink(email) {
  const { auth, authMod } = await firebase();
  await authMod.sendSignInLinkToEmail(auth, email, { url: location.href, handleCodeInApp: true });
  try { localStorage.setItem(EMAIL_KEY, email); } catch {}
}

// 今のURLがメールのログイン用リンクか
export async function isLoginLink() {
  const { auth, authMod } = await firebase();
  return authMod.isSignInWithEmailLink(auth, location.href);
}

// 送信時に保存したメールアドレス（別の端末で開いた場合は null）
export function savedEmail() {
  try { return localStorage.getItem(EMAIL_KEY); } catch { return null; }
}

// メールのリンクでログインを完了する
export async function completeLoginLink(email) {
  const { auth, authMod } = await firebase();
  const cred = await authMod.signInWithEmailLink(auth, email, location.href);
  try { localStorage.removeItem(EMAIL_KEY); } catch {}
  return cred.user;
}

export async function signOut() {
  const { auth, authMod } = await firebase();
  const uid = auth.currentUser && auth.currentUser.uid;
  await authMod.signOut(auth);
  if (uid) { try { localStorage.removeItem(cacheKey(uid)); } catch {} }
}

export const loginUrl = (next) => {
  const u = new URL("login.html", import.meta.url);
  if (next) u.searchParams.set("next", next);
  return u.href;
};
