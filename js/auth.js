// ── Firebase Auth & Progress Helper ──────────────────────────────────────────
// Loaded by index.html and practices.html

const _FB_CONFIG = {
  apiKey:            'AIzaSyC8xwZFxNP8x36GmmsZ83_I9gvJjSTPXtM',
  authDomain:        'mathwzshima-32042.firebaseapp.com',
  databaseURL:       'https://mathwzshima-32042-default-rtdb.firebaseio.com',
  projectId:         'mathwzshima-32042',
  storageBucket:     'mathwzshima-32042.firebasestorage.app',
  messagingSenderId: '888329225778',
  appId:             '1:888329225778:web:9e8828cf7f0f4ac3b15e2b'
};

if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(_FB_CONFIG);
}

const _auth = firebase.auth();
const _db   = firebase.database();

// ── Sign In / Out ─────────────────────────────────────────────────────────────
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return _auth.signInWithPopup(provider);
}

function signOutUser() {
  return _auth.signOut();
}

function getCurrentUser() {
  return _auth.currentUser;
}

// ── Save session progress ─────────────────────────────────────────────────────
// Called when student finishes a practice session (backToLessons)
function saveSessionProgress(lessonId, lessonTitle, correct, total) {
  const user = _auth.currentUser;
  if (!user || total === 0) return Promise.resolve();

  const pct = Math.round((correct / total) * 100);
  const uid = user.uid;

  // Update student profile
  _db.ref('progress/' + uid + '/profile').set({
    name:     user.displayName || 'Student',
    email:    user.email       || '',
    photo:    user.photoURL    || '',
    lastSeen: new Date().toISOString()
  });

  // Update lesson stats via transaction (safe accumulation)
  return _db.ref('progress/' + uid + '/lessons/' + lessonId).transaction(function(prev) {
    prev = prev || {};
    return {
      title:         lessonTitle,
      sessions:      (prev.sessions      || 0) + 1,
      totalAnswered: (prev.totalAnswered || 0) + total,
      totalCorrect:  (prev.totalCorrect  || 0) + correct,
      bestScore:     Math.max(prev.bestScore || 0, pct),
      lastScore:     pct,
      lastPlayed:    new Date().toISOString()
    };
  });
}

// ── Load current user's lesson progress (returns Promise<object|null>) ────────
function loadMyProgress() {
  const user = _auth.currentUser;
  if (!user) return Promise.resolve(null);
  return _db.ref('progress/' + user.uid + '/lessons')
    .once('value')
    .then(function(snap) { return snap.val(); });
}
