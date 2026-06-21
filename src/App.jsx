import React, { useState, useEffect } from 'react';

// ==========================================
// FIREBASE CONFIGURATION & INITIALIZATION (Updated with your newest credentials)
// ==========================================
const appId = typeof __app_id !== 'undefined' ? __app_id : 'finnox-p2p-india';
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyBTil7HVnWHncJhXsmsm_C7Ejs7vahunt4",
      authDomain: "finnox-p2p.firebaseapp.com",
      projectId: "finnox-p2p",
      storageBucket: "finnox-p2p.firebasestorage.app",
      messagingSenderId: "296846053902",
      appId: "1:296846053902:web:24ceb69a3c52d56f18225f"
    };

const FALLBACK_OFFERS = [
  {
    id: 'offer_ind_fallback_01',
    sellerId: 'usr_shreya_901',
    sellerName: 'Shreya Sharma',
    sellerRating: 4.95,
    cumulativeVolume: 1250, // >1000 means Verified Pro Seller
    completionRate: '99.2%',
    usdtAmount: 850,
    pricePerUsdt: 88.00,
    minLimit: 5000,
    maxLimit: 75000,
    paymentMethod: 'Bank Deposit',
    status: 'Active'
  },
  {
    id: 'offer_ind_fallback_02',
    sellerId: 'usr_node_delhi',
    sellerName: 'Delhi Liquidity Hub',
    sellerRating: 4.90,
    cumulativeVolume: 450, // <1000 Standard verified merchant
    completionRate: '100%',
    usdtAmount: 4500,
    pricePerUsdt: 89.00,
    minLimit: 10000,
    maxLimit: 350000,
    paymentMethod: 'Bank Deposit',
    status: 'Active'
  }
];

const PRESETS_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
];

export default function App() {
  const [firebaseServices, setFirebaseServices] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // App Navigation Panels
  const [activeTab, setActiveTab] = useState('home'); 
  const [currentRole, setCurrentRole] = useState('buyer'); 
  const [isLoading, setIsLoading] = useState(false);

  // Auth Inputs
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authReferId, setAuthReferId] = useState('');
  const [authMode, setAuthMode] = useState('signup'); 

  // Firestore Live Synced Datastores
  const [userProfile, setUserProfile] = useState({
    name: 'RAJESH PATEL',
    email: '',
    phone: '',
    usdtBalance: 120.00,
    fiatBalance: 25000.00,
    escrowLocked: 0.00,
    referralCode: '',
    referredBy: '',
    profilePic: PRESETS_AVATARS[0],
    activeSellHold: null,
    bankDetails: {
      bankName: 'HDFC Bank',
      accountName: 'Finnox Verified User',
      accountNumber: '50100488219033',
      ifscCode: 'HDFC0000060'
    }
  });

  const [offers, setOffers] = useState(FALLBACK_OFFERS);
  const [trades, setTrades] = useState([]);
  const [selectedTradeId, setSelectedTradeId] = useState(null);

  // Form Inputs State
  const [activeBuyOffer, setActiveBuyOffer] = useState(null);
  const [buyAmountInput, setBuyAmountInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [sellQuantityInput, setSellQuantityInput] = useState('');
  const [sellRateInput, setSellRateInput] = useState('88.00');

  // Custom feedback modal states
  const [toast, setToast] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [sellHoldTimeRemaining, setSellHoldTimeRemaining] = useState('');
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);

  // Legal Modal Screens
  const [legalModalContent, setLegalModalContent] = useState(null); // { title, text }

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // Inject Tailwind
    if (!document.getElementById('tailwind-cdn-override')) {
      const tailwindScript = document.createElement('script');
      tailwindScript.id = 'tailwind-cdn-override';
      tailwindScript.src = 'https://cdn.tailwindcss.com';
      tailwindScript.onload = () => {
        window.tailwind.config = {
          theme: {
            extend: {
              colors: {
                brandBlue: {
                  50: '#f0f6ff',
                  100: '#e0ecff',
                  500: '#2563eb',
                  600: '#1d4ed8',
                  700: '#1e40af',
                },
                brandGreen: {
                  50: '#ecfdf5',
                  500: '#10b981',
                  600: '#059669',
                }
              }
            }
          }
        };
      };
      document.head.appendChild(tailwindScript);
    }

    // Inject Plus Jakarta Font
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const styleOverride = document.createElement('style');
    styleOverride.innerHTML = `
      * {
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        -webkit-tap-highlight-color: transparent;
      }
      ::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(styleOverride);

    // Dynamic Firebase compat libraries loading
    const loadFirebaseFromCDN = async () => {
      try {
        if (window.firebase) {
          initializeAndSetFirebase();
          return;
        }

        const scripts = [
          'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
          'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js',
          'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js'
        ];

        for (const src of scripts) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }

        initializeAndSetFirebase();
      } catch (err) {
        console.error("Firebase CDN dynamic load failed:", err);
        setIsFirebaseLoading(false);
      }
    };

    const initializeAndSetFirebase = () => {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(firebaseConfig);
      }
      const authInstance = window.firebase.auth();
      const dbInstance = window.firebase.firestore();

      setFirebaseServices({ auth: authInstance, db: dbInstance });
      setIsFirebaseLoading(false);

      // Listen to Auth State change
      authInstance.onAuthStateChanged((user) => {
        setFirebaseUser(user);
        if (user) {
          setIsEmailVerified(user.emailVerified);
        } else {
          setIsEmailVerified(false);
        }
      });
    };

    loadFirebaseFromCDN();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;

    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    
    const unsubscribe = profileRef.onSnapshot((docSnap) => {
      if (docSnap.exists) {
        setUserProfile(docSnap.data());
      } else {
        const myRandomRefer = 'FNX' + Math.floor(1000 + Math.random() * 9000);
        const defaultProfile = {
          name: authName || 'NEW FINNOX USER',
          email: firebaseUser.email || 'user@finnox.com',
          phone: authPhone || '9876543210',
          usdtBalance: 150.00, 
          fiatBalance: 25000.00,
          escrowLocked: 0.00,
          referralCode: myRandomRefer,
          referredBy: authReferId || '',
          profilePic: PRESETS_AVATARS[0],
          activeSellHold: null,
          referredUsersProgress: {}, // tracking: { referredUid: { hasTraded$100: false, amountTraded: 0 } }
          bankDetails: {
            bankName: 'HDFC Bank',
            accountName: authName || 'FINNOX USER',
            accountNumber: '5010048' + Math.floor(100000 + Math.random() * 900000),
            ifscCode: 'HDFC0000060'
          }
        };
        profileRef.set(defaultProfile);
        
        db.doc(`artifacts/${appId}/public/data/referrals/${myRandomRefer}`).set({
          ownerUid: firebaseUser.uid,
          ownerName: defaultProfile.name
        });
      }
    }, (error) => {
      console.error("Firestore Profile Sync Error:", error);
    });

    return () => unsubscribe();
  }, [firebaseUser, firebaseServices]);

  useEffect(() => {
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;

    const offersRef = db.collection(`artifacts/${appId}/public/data/offers`);
    const unsubscribeOffers = offersRef.onSnapshot((querySnap) => {
      const parsedOffers = [];
      querySnap.forEach((doc) => {
        parsedOffers.push({ id: doc.id, ...doc.data() });
      });
      setOffers(parsedOffers.length > 0 ? parsedOffers : FALLBACK_OFFERS);
    }, (err) => console.log("Offers fetch error: ", err));

    // Listen globally for active trades
    const tradesRef = db.collection(`artifacts/${appId}/public/data/trades`);
    const unsubscribeTrades = tradesRef.onSnapshot((querySnap) => {
      const parsedTrades = [];
      querySnap.forEach((doc) => {
        parsedTrades.push({ id: doc.id, ...doc.data() });
      });
      setTrades(parsedTrades);
    }, (err) => console.log("Trades fetch error: ", err));

    return () => {
      unsubscribeOffers();
      unsubscribeTrades();
    };
  }, [firebaseUser, firebaseServices]);

  // Timed calculations & Hold verifications
  useEffect(() => {
    const timer = setInterval(() => {
      if (userProfile && userProfile.activeSellHold) {
        const expiresAt = userProfile.activeSellHold.expiresAt;
        const diff = expiresAt - Date.now();
        if (diff <= 0) {
          handleExpireSellHold();
        } else {
          const totalSeconds = Math.floor(diff / 1000);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          setSellHoldTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      } else {
        setSellHoldTimeRemaining('');
      }

      if (trades.length > 0) {
        setTrades(prevTrades => 
          prevTrades.map(t => {
            if (t.status === 'AWAITING_PAYMENT' && t.timeLeft > 0) {
              return { ...t, timeLeft: t.timeLeft - 1 };
            }
            return t;
          })
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [userProfile, trades]);

  const handleTabChange = (tab) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    triggerToast(`Switched Role view to: ${role.toUpperCase()}`, 'info');
  };

  const handleOpenDispute = () => {
    triggerToast("Dispute registered. Our Support Admin will verify bank details soon.", "warning");
  };

  const handleCreateSellHold = async (e) => {
    e.preventDefault();
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;

    if (userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now()) {
      setErrorModal(`Aapka sell hold active hai! Lock expire hone tak (${sellHoldTimeRemaining}) aap naya sell order nahi laga sakte.`);
      return;
    }

    const qty = parseFloat(sellQuantityInput);
    const rate = parseFloat(sellRateInput);

    if (isNaN(qty) || qty <= 0) {
      triggerToast('Kripya sahi quantity enter karein.', 'error');
      return;
    }

    if (qty > userProfile.usdtBalance) {
      setErrorModal('Aapke pass itna USDT balance nahi hai!');
      return;
    }

    const lockDuration = 60 * 60 * 1000; 
    const expiresAt = Date.now() + lockDuration;

    const holdDetails = {
      lockedAmount: qty,
      rate: rate,
      createdAt: Date.now(),
      expiresAt: expiresAt
    };

    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    await profileRef.update({
      usdtBalance: userProfile.usdtBalance - qty,
      escrowLocked: userProfile.escrowLocked + qty,
      activeSellHold: holdDetails
    });

    const newOfferId = `offer_live_${Date.now().toString().slice(-4)}`;
    const offerDocRef = db.doc(`artifacts/${appId}/public/data/offers/${newOfferId}`);
    await offerDocRef.set({
      id: newOfferId,
      sellerId: firebaseUser.uid,
      sellerName: userProfile.name,
      sellerRating: 4.9,
      cumulativeVolume: userProfile.escrowLocked + qty, // Track total traded volume dynamically
      completionRate: '98%',
      usdtAmount: qty,
      pricePerUsdt: rate,
      minLimit: 100, 
      maxLimit: 100000,
      paymentMethod: 'Bank Deposit',
      status: 'Active',
      expiresAt: expiresAt
    });

    setSellQuantityInput('');
    setSuccessModal({
      title: 'USDT locked for 1 hour! 🔒',
      desc: `Aapka ${qty} USDT agle 1 ghante tak locked rahega. Yeh amount safe-hold me chala gaya hai aur marketplace par live hai.`
    });
    handleTabChange('buy-sell');
  };

  const handleExpireSellHold = async () => {
    if (!firebaseServices || !firebaseUser || !userProfile.activeSellHold) return;
    const { db } = firebaseServices;

    const lockedAmount = userProfile.activeSellHold.lockedAmount;
    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);

    await profileRef.update({
      usdtBalance: userProfile.usdtBalance + lockedAmount,
      escrowLocked: Math.max(0, userProfile.escrowLocked - lockedAmount),
      activeSellHold: null
    });

    triggerToast("USDT Safe-Hold timeout limit completed! Balance unlocked.", "info");
  };

  const handleRequestWithdraw = () => {
    if (userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now()) {
      setErrorModal(`Aapka USDT Safe-Hold active hai! Aap lock period (${sellHoldTimeRemaining}) se pehle assets withdraw nahi kar sakte.`);
    } else {
      triggerToast("Withdrawal request recorded under daily US-based settlements.", "info");
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!firebaseServices || !firebaseUser) return;
    try {
      setVerificationLoading(true);
      await firebaseUser.sendEmailVerification();
      triggerToast("Verification link aapki Email par bhej diya gaya hai! ✉️", "success");
      setResendCooldown(60);
    } catch (error) {
      setErrorModal(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleCheckEmailVerified = async () => {
    if (!firebaseServices || !firebaseUser) return;
    try {
      setVerificationLoading(true);
      await firebaseUser.reload();
      const updatedUser = firebaseServices.auth.currentUser;
      setIsEmailVerified(updatedUser.emailVerified);
      
      if (updatedUser.emailVerified) {
        triggerToast("Aapki email ID verified ho chuki hai! Welcome! 🎉", "success");
      } else {
        triggerToast("Email verify nahi hua hai. Kripya apna Spam/Junk folder check karein.", "warning");
      }
    } catch (error) {
      setErrorModal(error.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!firebaseServices) return;
    const { auth, db } = firebaseServices;

    if (!authName || !authEmail || !authPhone || !authPassword) {
      triggerToast('Mandatory fields fill karna zaroori hai.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await auth.createUserWithEmailAndPassword(authEmail, authPassword);
      const user = userCredential.user;

      // Send Verification Email immediately
      await user.sendEmailVerification();
      setIsEmailVerified(false);

      const myRandomRefer = 'FNX' + Math.floor(1000 + Math.random() * 9000);
      let initialUsdt = 100.00;
      let initialFiat = 25000.00;

      // Check if referrer code is supplied
      if (authReferId.trim()) {
        const publicReferRef = db.doc(`artifacts/${appId}/public/data/referrals/${authReferId.trim().toUpperCase()}`);
        const referSnap = await publicReferRef.get();
        
        if (referSnap.exists()) {
          const referrerUid = referSnap.data().ownerUid;
          const referrerProfileRef = db.doc(`artifacts/${appId}/users/${referrerUid}/profile/data`);
          const referrerSnap = await referrerProfileRef.get();
          
          if (referrerSnap.exists()) {
            const currentRefData = referrerSnap.data();
            const progress = currentRefData.referredUsersProgress || {};
            
            // Add current user to referrer's tracking with initial pending state
            progress[user.uid] = {
              name: authName.toUpperCase(),
              email: authEmail,
              amountTraded: 0,
              hasTraded$100: false,
              rewardClaimed: false
            };

            await referrerProfileRef.update({
              referredUsersProgress: progress
            });
          }
        }
      }

      const profileRef = db.doc(`artifacts/${appId}/users/${user.uid}/profile/data`);
      const premiumProfile = {
        name: authName.toUpperCase(),
        email: authEmail,
        phone: authPhone,
        usdtBalance: initialUsdt,
        fiatBalance: initialFiat,
        escrowLocked: 0.00,
        referralCode: myRandomRefer,
        referredBy: authReferId || '',
        profilePic: PRESETS_AVATARS[0],
        activeSellHold: null,
        referredUsersProgress: {},
        bankDetails: {
          bankName: 'HDFC Bank',
          accountName: authName.toUpperCase(),
          accountNumber: '5010048' + Math.floor(100000 + Math.random() * 900000),
          ifscCode: 'HDFC0000060'
        },
        verificationBadge: 'Registered'
      };

      await profileRef.set(premiumProfile);
      
      await db.doc(`artifacts/${appId}/public/data/referrals/${myRandomRefer}`).set({
        ownerUid: user.uid,
        ownerName: premiumProfile.name
      });

      triggerToast("Verification link sent to email! Check Inbox and Spam folders.", "success");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorModal(error.message);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!firebaseServices) return;
    const { auth } = firebaseServices;

    if (!authEmail || !authPassword) {
      triggerToast('Enter valid credentials.', 'error');
      return;
    }
    try {
      setIsLoading(true);
      const userCredential = await auth.signInWithEmailAndPassword(authEmail, authPassword);
      setIsEmailVerified(userCredential.user.emailVerified);
      triggerToast('Welcome back to Finnox!', 'success');
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorModal(err.message);
    }
  };

  const handleInitiateTrade = async () => {
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;

    const amt = parseFloat(buyAmountInput);
    if (isNaN(amt) || amt <= 0 || amt > activeBuyOffer.usdtAmount) {
      setErrorModal('Kripya valid USDT quantity enter karein.');
      return;
    }

    const totalFiat = amt * activeBuyOffer.pricePerUsdt;

    // RULE: Min ₹100, Max ₹1,00,000 & Ends with '00' (multiple of 100)
    if (totalFiat < 100 || totalFiat > 100000) {
      setErrorModal('Transaction amount minimum INR 100 aur maximum INR 1 Lakh hona chahiye.');
      return;
    }

    if (totalFiat % 100 !== 0) {
      setErrorModal('Transaction amount ₹101, ₹409 jaise rands me accept nahi hoga. Kripya double zero ending amounts hi choose karein (for ex: ₹100, ₹1800, ₹41000).');
      return;
    }

    if (totalFiat > userProfile.fiatBalance) {
      setErrorModal('Aapke pass trade ke liye insufficient bank balance hai.');
      return;
    }

    const tradeId = `FNX-IN-${Math.floor(10000 + Math.random() * 90000)}`;
    const tradeDocRef = db.doc(`artifacts/${appId}/public/data/trades/${tradeId}`);

    // Calculate Platform Fee (0.5% for both Buyer & Seller)
    const platformFeePercent = 0.005;
    const platformFeeUsdt = amt * platformFeePercent; 
    const finalReceiverUsdt = amt - platformFeeUsdt;

    const newTradeObj = {
      id: tradeId,
      offerId: activeBuyOffer.id,
      sellerId: activeBuyOffer.sellerId,
      sellerName: activeBuyOffer.sellerName,
      buyerId: firebaseUser.uid,
      buyerName: userProfile.name,
      usdtAmount: amt,
      platformFeeUsdt: platformFeeUsdt,
      finalReceiverUsdt: finalReceiverUsdt,
      pricePerUsdt: activeBuyOffer.pricePerUsdt,
      fiatAmount: totalFiat,
      status: 'AWAITING_PAYMENT',
      timeLeft: 900, 
      paymentProof: null,
      bankDetails: {
        bankName: 'HDFC Bank',
        accountName: activeBuyOffer.sellerName,
        accountNumber: '50100488219033',
        ifscCode: 'HDFC0000060'
      },
      createdAt: new Date().toISOString(),
      messages: [
        { senderId: 'system', text: `Secure Hold Active! ₹${totalFiat.toLocaleString('en-IN')} has been locked securely.`, timestamp: 'Just now' },
        { senderId: 'system', text: `Platform fees of 0.5% (${platformFeeUsdt.toFixed(3)} USDT) is applicable on this transaction.`, timestamp: 'Just now' },
        { senderId: 'system', text: `Please deposit directly to Seller's HDFC bank account. Only direct bank deposits allowed.`, timestamp: 'Just now' }
      ]
    };

    // Save globally and in user specific Firestore subcollection for audit logs
    await tradeDocRef.set(newTradeObj);
    await db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/trades/${tradeId}`).set(newTradeObj);
    await db.doc(`artifacts/${appId}/users/${activeBuyOffer.sellerId}/trades/${tradeId}`).set(newTradeObj);

    setSelectedTradeId(tradeId);
    setActiveBuyOffer(null);
    setBuyAmountInput('');

    setSuccessModal({
      title: 'Secure Hold Activated!',
      desc: `₹${totalFiat.toLocaleString('en-IN')} transfers required. USDT safe in vault.`
    });
    handleTabChange('transactions');
  };

  const handleMarkAsPaid = async () => {
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;

    const tradeRef = db.doc(`artifacts/${appId}/public/data/trades/${selectedTradeId}`);
    
    await tradeRef.update({
      status: 'PAID',
      paymentProof: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60",
      messages: [
        ...currentTrade.messages,
        { senderId: 'system', text: '✅ Buyer uploaded bank deposit receipt screenshot. Seller verification pending.', timestamp: 'Just now' },
        { senderId: firebaseUser.uid, text: 'Deposit done directly! Receipt uploaded. Check bank records.', timestamp: 'Just now' }
      ]
    });

    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    await profileRef.update({
      fiatBalance: userProfile.fiatBalance - currentTrade.fiatAmount
    });

    setSuccessModal({
      title: 'Bank Receipt Uploaded!',
      desc: 'Seller will verify direct deposit and release USDT soon.'
    });
  };

  const handleReleaseEscrow = async () => {
    if (!firebaseServices) return;
    const { db } = firebaseServices;

    const tradeRef = db.doc(`artifacts/${appId}/public/data/trades/${selectedTradeId}`);
    
    await tradeRef.update({
      status: 'COMPLETED',
      messages: [
        ...currentTrade.messages,
        { senderId: 'system', text: '🏆 Safe hold released. Assets credited successfully.', timestamp: 'Just now' }
      ]
    });

    const sellerProfileRef = db.doc(`artifacts/${appId}/users/${currentTrade.sellerId}/profile/data`);
    const buyerProfileRef = db.doc(`artifacts/${appId}/users/${currentTrade.buyerId}/profile/data`);

    const sellerSnap = await sellerProfileRef.get();
    const buyerSnap = await buyerProfileRef.get();

    if (sellerSnap.exists) {
      const sellerData = sellerSnap.data();
      await sellerProfileRef.update({
        escrowLocked: Math.max(0, sellerData.escrowLocked - currentTrade.usdtAmount),
        activeSellHold: null 
      });
    }

    if (buyerSnap.exists) {
      const buyerData = buyerSnap.data();
      await buyerProfileRef.update({
        usdtBalance: buyerData.usdtBalance + currentTrade.finalReceiverUsdt // Deduct 0.5% platform fee
      });
    }

    // Process Referral Reward rules if any
    await checkReferralRewardsProgress(currentTrade.sellerId, currentTrade.usdtAmount);

    setSuccessModal({
      title: 'Transaction Completed!',
      desc: `${currentTrade.finalReceiverUsdt.toFixed(2)} USDT transferred to Buyer wallet after 0.5% fee deduction.`
    });
  };

  const checkReferralRewardsProgress = async (sellerUid, tradeUsdtAmount) => {
    if (!firebaseServices) return;
    const { db } = firebaseServices;

    const sellerProfileRef = db.doc(`artifacts/${appId}/users/${sellerUid}/profile/data`);
    const sellerSnap = await sellerProfileRef.get();

    if (sellerSnap.exists) {
      const sellerData = sellerSnap.data();
      const referredByCode = sellerData.referredBy;

      if (referredByCode) {
        const publicReferRef = db.doc(`artifacts/${appId}/public/data/referrals/${referredByCode.toUpperCase()}`);
        const referSnap = await publicReferRef.get();

        if (referSnap.exists()) {
          const referrerUid = referSnap.data().ownerUid;
          const referrerProfileRef = db.doc(`artifacts/${appId}/users/${referrerUid}/profile/data`);
          const referrerSnap = await referrerProfileRef.get();

          if (referrerSnap.exists()) {
            const referrerData = referrerSnap.data();
            const progress = referrerData.referredUsersProgress || {};
            
            if (progress[sellerUid]) {
              const currentProgress = progress[sellerUid];
              currentProgress.amountTraded += tradeUsdtAmount;

              // Condition: Reached Successful $100 (₹8,500) sell volume
              if (currentProgress.amountTraded >= 100 && !currentProgress.hasTraded$100) {
                currentProgress.hasTraded$100 = true;
                currentProgress.rewardClaimed = true;

                // Deliver $10 / ₹850 reward
                await referrerProfileRef.update({
                  fiatBalance: referrerData.fiatBalance + 850, // ₹850 reward equivalent
                  usdtBalance: referrerData.usdtBalance + 10,  // $10 worth of USDT bonus
                  referredUsersProgress: progress
                });

                triggerToast(`🎉 Referral Bonus unlocked! You earned ₹850 ($10) as Shreya traded $100!`, 'success');
              } else {
                await referrerProfileRef.update({
                  referredUsersProgress: progress
                });
              }
            }
          }
        }
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !firebaseServices) return;
    const { db } = firebaseServices;

    const tradeRef = db.doc(`artifacts/${appId}/public/data/trades/${selectedTradeId}`);
    await tradeRef.update({
      messages: [
        ...currentTrade.messages,
        { senderId: firebaseUser.uid, text: chatInput, timestamp: 'Just now' }
      ]
    });
    setChatInput('');
  };

  const handleChangeProfilePic = async (imgUrl) => {
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;

    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    await profileRef.update({
      profilePic: imgUrl
    });
    setAvatarSelectorOpen(false);
    triggerToast("Profile picture updated!", "success");
  };

  const handleLogout = () => {
    if (!firebaseServices) return;
    firebaseServices.auth.signOut();
    setAuthEmail('');
    setAuthPassword('');
    triggerToast("Logged out successfully.", "info");
  };

  const currentTrade = trades.find(t => t.id === selectedTradeId);

  const openLegalDocument = (pageType) => {
    const documents = {
      'about': {
        title: "About Us",
        text: "Finnox Technologies is a leading premium software custodian based in the United States. We operate securely out of Wilmington, Delaware. We provide safe, time-locked automated escrow hold systems for decentralized digital assets. Our platform is strictly designed to secure peers during direct manual bank deposits with zero exposure to high-chargeback UPI interfaces or local card processors."
      },
      'terms': {
        title: "Terms & Conditions",
        text: "These terms govern the use of Finnox Technologies escrow routing. By registering, you agree that only direct, manual branch or online bank deposits are permitted. Platform fees of 0.5% are deducted on all successful transfers. Any suspicious high-frequency odd-fraction deposits without standard double-zero '00' endings are subject to automated audit holding."
      },
      'privacy': {
        title: "Privacy Policy",
        text: "We value user privacy. Profile names, verified contact numbers, and transaction ledgers are encrypted and securely synchronized inside Firestore cloud. We never sell user data. Ledger records are preserved for corporate regulatory compliances in Wilmington, Delaware."
      },
      'risk': {
        title: "Risk Disclosure",
        text: "P2P transactions involve bank-to-bank settlements. Users are advised to double-check beneficiary HDFC account numbers before completing transfers. Do not release USDT until direct verification inside HDFC bank ledger is completed. Finnox Technologies holds zero liabilities for manual negligence."
      },
      'contact': {
        title: "Contact Us",
        text: "For institutional disputes or corporate inquiries, write to Finnox Technologies, 1209 Orange Street, Wilmington, DE 19801, United States. Phone and Support Email handles will remain empty for customizable integrations."
      },
      'fees': {
        title: "Fees & Limits",
        text: "Platform Fees: 0.5% on successful settlements for both Buyer and Seller. Minimum Transaction Limit: INR 100. Maximum Transaction Limit: INR 1,00,000 (1 Lakh). All transactions must strictly be round figures ending in standard double-zero format."
      }
    };
    setLegalModalContent(documents[pageType]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center py-0 md:py-6 px-0 sm:px-4">
      
      {/* ==========================================
          MOBILE VIEWPORT CONTAINER (390px Native App Shell)
         ========================================== */}
      <div className="w-full max-w-[390px] h-screen md:h-[844px] bg-white flex flex-col justify-between relative shadow-2xl md:rounded-[40px] md:border-[12px] md:border-slate-800 overflow-hidden text-slate-800 pb-16">
        
        {/* ==========================================
            1. PREMIUM SPLASH SCREEN (RULE 1)
           ========================================== */}
        {isFirebaseLoading && (
          <div className="absolute inset-0 bg-blue-600 z-[70] flex flex-col items-center justify-between p-12 text-center text-white transition-opacity duration-500">
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="h-20 w-24 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl animate-pulse">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296a3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043a3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296a3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight">Finnox</h1>
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-widest block">SAFE HOLD ESCROW</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce"></span>
              </div>
              <p className="text-[10px] text-blue-200">Secured with Live Firebase Ledger</p>
            </div>
          </div>
        )}

        {/* ==========================================
            2. CUSTOM LOG-IN / SIGN-UP OVERLAY
           ========================================== */}
        {(!firebaseUser || firebaseUser.isAnonymous) && !isFirebaseLoading && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col justify-between p-6">
            <div className="space-y-5 pt-4 overflow-y-auto max-h-[92%]">
              
              {/* Brand Header */}
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296a3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043a3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296a3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-blue-900 leading-none">Finnox</h1>
                  <span className="text-[9px] font-bold text-emerald-600 tracking-wider uppercase block mt-1">SAFE HOLD SYSTEM</span>
                </div>
              </div>

              {/* Toggle Mode */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'signup' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'}`}
                >
                  नए यूज़र (Register)
                </button>
                <button 
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-blue-700 shadow' : 'text-slate-500'}`}
                >
                  लॉगिन (Log In)
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {authMode === 'signup' ? 'Create Wallet & Get Rewards 🎁' : 'Login Securely'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {authMode === 'signup' 
                    ? 'Refer ID enter karne par ₹850 ($10) cash bonus automatic active ho jaega.' 
                    : 'Apne registered credentials ke sath safely login karein.'}
                </p>
              </div>

              {/* Form implementation */}
              <form onSubmit={authMode === 'signup' ? handleEmailSignUp : handleEmailSignIn} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Full Name (Mandatory)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="As per bank records"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Email ID</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter email e.g. rajesh@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                    <div className="flex">
                      <span className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-3 py-2.5 text-xs text-slate-500 flex items-center">+91</span>
                      <input 
                        type="tel" 
                        required 
                        pattern="[0-9]{10}"
                        placeholder="10-digit mobile number"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    placeholder="Min 6 characters"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Referral Code (Optional)</label>
                      <span className="text-[8px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">Reward $10</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter Refer Code (e.g., FNX1234)"
                      value={authReferId}
                      onChange={(e) => setAuthReferId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 uppercase font-mono"
                    />
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-blue-600/20 transition active:scale-95 mt-2"
                >
                  {authMode === 'signup' ? 'Create Account & Proceed 🎁' : 'Login Securely 🔑'}
                </button>
              </form>

              {/* DEMO BYPASS BUTTONS FOR TESTING SPEED */}
              <div className="border-t border-slate-100 pt-4 text-center space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Direct Quick Sandbox Access</span>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      setAuthEmail('demo.buyer@finnox.com');
                      setAuthPassword('buyer123');
                      setAuthMode('login');
                      setTimeout(() => triggerToast("Credentials loaded. Click Login Securely!", "info"), 200);
                    }}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-1.5 rounded-lg text-[9px] font-bold"
                  >
                    Demo Buyer 👤
                  </button>
                  <button 
                    onClick={async () => {
                      setAuthEmail('demo.seller@finnox.com');
                      setAuthPassword('seller123');
                      setAuthMode('login');
                      setTimeout(() => triggerToast("Credentials loaded. Click Login Securely!", "info"), 200);
                    }}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-1.5 rounded-lg text-[9px] font-bold"
                  >
                    Demo Seller 🛍️
                  </button>
                </div>
              </div>

            </div>

            <div className="text-center pt-2">
              <p className="text-[9px] text-slate-400 leading-relaxed">
                By signing up on Finnox, you verify that you will use Bank Deposits exclusively. No UPI or digital wallets allowed.
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            3. REAL EMAIL VERIFICATION SHIELD SCREEN (RULE 3)
           ========================================== */}
        {firebaseUser && !firebaseUser.isAnonymous && !isEmailVerified && !isFirebaseLoading && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col justify-between p-6">
            <div className="my-auto space-y-6 text-center">
              <div className="h-20 w-20 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900">Confirm Your Email ID ✉️</h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[300px] mx-auto">
                  Aapke registered email address <strong className="text-slate-800">{firebaseUser.email}</strong> par confirmation link bheja gaya hai. Kripya use click karein aur niche status verify karein.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 leading-normal font-semibold">
                  ⚠️ <strong>IMPORTANT NOTE:</strong> Agar verification email inbox me nahi mila, to kripya apna <strong>Spam</strong> ya <strong>Junk</strong> folder check karein!
                </div>
              </div>

              {/* Status Verification Triggers */}
              <div className="space-y-2 pt-4">
                <button
                  onClick={handleCheckEmailVerified}
                  disabled={verificationLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-md"
                >
                  {verificationLoading ? 'Checking status...' : 'Maine Email Verify Kar Diya 👍'}
                </button>

                <button
                  onClick={handleSendVerificationEmail}
                  disabled={resendCooldown > 0 || verificationLoading}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-[11px] transition"
                >
                  {resendCooldown > 0 ? `Resend link available in ${resendCooldown}s` : 'Verification Link Dobara Bhejein 🔄'}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-center text-xs text-rose-500 hover:underline font-bold py-4"
            >
              Sign Out &amp; Use Different Account 🚪
            </button>
          </div>
        )}

        {/* APP STATUS BAR AND TOP HEADER */}
        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296a3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043a3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296a3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-blue-900 block">Finnox</span>
              <span className="text-[9px] font-semibold text-emerald-600 tracking-wider block uppercase">US-Registered P2P Vault</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded font-bold uppercase tracking-wider">
              🇺🇸 Wilmington, DE
            </span>

            <button 
              onClick={() => handleTabChange('profile')}
              className="h-8 w-8 rounded-full border border-blue-200 overflow-hidden"
            >
              <img src={userProfile.profilePic || PRESETS_AVATARS[0]} alt="Avatar" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* ==========================================
            SCROLLABLE CONTENT AREA
           ========================================== */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 bg-slate-50 scrollbar-none pb-6">
          
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-40 bg-white rounded-2xl border border-slate-100"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-16 bg-white rounded-xl"></div>
                <div className="h-16 bg-white rounded-xl"></div>
              </div>
              <div className="h-20 bg-white rounded-xl"></div>
            </div>
          ) : (
            <>
              {/* ==========================================
                  1. HOME SCREEN VIEW
                 ========================================== */}
              {activeTab === 'home' && (
                <div className="space-y-5">
                  
                  {/* Local Welcome Block */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-500 font-semibold block">Welcome back,</span>
                      <h2 className="text-lg font-bold text-slate-900">
                        {userProfile.name}
                      </h2>
                    </div>
                  </div>

                  {/* ACTIVE SELL LOCK BANNER WARNING */}
                  {userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2.5 items-start">
                      <span className="text-lg animate-bounce">🔒</span>
                      <div className="text-[10px] leading-normal text-amber-900">
                        <span className="font-bold block">1-Hour Safe Hold Lock Active!</span>
                        Aapka <span className="font-bold">{userProfile.activeSellHold.lockedAmount} USDT</span> hold locked hai. Timer: <span className="font-extrabold font-mono text-xs text-rose-600">{sellHoldTimeRemaining}</span>. Is samay koi doosra withdrawal ya sale orders active nahi kiya ja sakta.
                      </div>
                    </div>
                  )}

                  {/* Trust-First balance display card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 font-bold text-6xl text-blue-600 pointer-events-none -mr-4">USD</div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">My Safe Holdings</span>
                        <span className="text-3xl font-black text-slate-900 mt-0.5 block tracking-tight">
                          {userProfile.usdtBalance.toFixed(2)}{' '}
                          <span className="text-sm font-bold text-blue-600 font-mono">USDT</span>
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Verified Vault
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3.5 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">Estimated Value</span>
                        <span className="text-slate-800 font-bold block mt-0.5">
                          ₹{(userProfile.usdtBalance * 88.00).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px]">Locked In Hold</span>
                        <span className="text-amber-600 font-bold block mt-0.5">
                          ₹{(userProfile.escrowLocked * 88.00).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hindi action panels */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleTabChange('buy-sell')}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 text-center transition active:scale-95 shadow-md shadow-blue-600/10"
                    >
                      <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg font-bold">
                        ＋
                      </div>
                      <span className="text-xs font-extrabold block">USDT खरीदें</span>
                      <span className="text-[9px] text-blue-100 font-medium mt-0.5 block">Buy USDT instantly</span>
                    </button>

                    <button 
                      onClick={() => {
                        handleTabChange('profile');
                        triggerToast("Lock Order section activated under your profile", "info");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-4 text-center transition active:scale-95 shadow-md shadow-emerald-600/10"
                    >
                      <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg font-bold">
                        －
                      </div>
                      <span className="text-xs font-extrabold block">USDT बेचें</span>
                      <span className="text-[9px] text-emerald-100 font-medium mt-0.5 block">Sell locked USDT</span>
                    </button>
                  </div>

                  {/* Dynamic Refer & Earn Promotion Board */}
                  <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4.5 rounded-3xl shadow-md relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 text-7xl font-bold select-none -mb-4 -mr-4">$10</div>
                    <span className="bg-amber-400 text-slate-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">REFER &amp; EARN</span>
                    <h3 className="text-sm font-extrabold mt-1.5">Earn ₹850 ($10) Cash Reward!</h3>
                    <p className="text-[10px] text-indigo-100 mt-1 leading-normal">
                      Apne doston ko invite karein. Jaise hi unka first sell transaction **$100 USDT** se upar safalta-purvak complete hoga, aapko turant ₹850 ($10) milega!
                    </p>
                    
                    <div className="mt-3.5 bg-white/10 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono">
                      <span>{userProfile.referralCode || 'GENERATING...'}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://finnox-p2p.web.app/register?refer=${userProfile.referralCode}`);
                          triggerToast("Refer link copied to clipboard!", "success");
                        }}
                        className="bg-amber-400 text-slate-900 font-black px-3 py-1 rounded-lg text-[9px] font-sans"
                      >
                        SHARE LINK
                      </button>
                    </div>
                  </div>

                  {/* Guarantee Seals */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Finnox Safe-Net Protocol</h4>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50 flex flex-col items-center">
                        <span className="text-lg">🛡️</span>
                        <span className="font-bold text-blue-950 block leading-tight mt-1">Bank Deposit Only</span>
                      </div>

                      <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex flex-col items-center">
                        <span className="text-lg">💼</span>
                        <span className="font-bold text-emerald-950 block leading-tight mt-1">DE-Registered Co.</span>
                      </div>

                      <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/50 flex flex-col items-center">
                        <span className="text-lg">📉</span>
                        <span className="font-bold text-amber-950 block leading-tight mt-1">0.5% Low Fee</span>
                      </div>
                    </div>
                  </div>

                  {/* Corporate Jurisdiction Footer */}
                  <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 text-center space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Corporate Headquarters</span>
                    <span className="text-[11px] text-slate-700 font-extrabold block">Finnox Technologies</span>
                    <span className="text-[9px] text-slate-400 block font-mono">1209 Orange Street, Wilmington, DE 19801, United States</span>
                  </div>

                  {/* Legal Quick Nav links */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-blue-600 pt-2 pb-4">
                    <button onClick={() => openLegalDocument('about')} className="hover:underline">About Us</button>
                    <button onClick={() => openLegalDocument('terms')} className="hover:underline">Terms</button>
                    <button onClick={() => openLegalDocument('privacy')} className="hover:underline">Privacy</button>
                    <button onClick={() => openLegalDocument('risk')} className="hover:underline">Risk Info</button>
                    <button onClick={() => openLegalDocument('contact')} className="hover:underline">Contact</button>
                    <button onClick={() => openLegalDocument('fees')} className="hover:underline">Fees</button>
                  </div>

                </div>
              )}

              {/* ==========================================
                  2. BUY / SELL SCREEN VIEW
                 ========================================== */}
              {activeTab === 'buy-sell' && (
                <div className="space-y-4">
                  
                  <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-150 shadow-sm">
                    <input 
                      type="text"
                      placeholder="Search bank deposit sellers..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                    />
                    <button className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {offers.map(offer => {
                      // Verified Seller Logic: Traded volume > $1000 USDT cumulative
                      const isVerifiedSeller = offer.cumulativeVolume >= 1000;

                      return (
                        <div key={offer.id} className="bg-white border border-slate-150 rounded-3xl p-4 space-y-3 shadow-sm relative">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm">
                                {offer.sellerName[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-extrabold text-slate-800">{offer.sellerName}</span>
                                  {isVerifiedSeller ? (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                                      🛡️ Verified Pro
                                    </span>
                                  ) : (
                                    <span className="h-4 w-4 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block">Traded Volume: {offer.cumulativeVolume || 150} USDT</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 font-extrabold block">Rate</span>
                              <span className="text-base font-black text-emerald-600">₹{offer.pricePerUsdt.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] leading-tight text-slate-600">
                            <div>
                              <span className="text-slate-400 block font-bold text-[9px] uppercase">Available</span>
                              <span className="font-extrabold text-slate-850 font-mono">{offer.usdtAmount.toLocaleString()} USDT</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold text-[9px] uppercase">Limit range</span>
                              <span className="font-extrabold text-slate-850 font-mono">₹100 - ₹1,00,000</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              🏦 Direct Bank Deposit Only
                            </span>

                            <button 
                              onClick={() => handleOpenBuyModal(offer)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4.5 py-2 rounded-xl transition"
                            >
                              Buy USDT
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Buy order bottom modal drawer */}
                  {activeBuyOffer && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0">
                      <div className="bg-white border-t border-slate-200 rounded-t-[32px] p-5 w-full max-w-[390px] space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h3 className="text-sm font-black uppercase text-slate-700">P2P Purchase Sheet</h3>
                            <span className="text-[10px] text-slate-400">Escrow verification with {activeBuyOffer.sellerName}</span>
                          </div>
                          <button 
                            onClick={() => setActiveBuyOffer(null)}
                            className="text-slate-400 hover:text-slate-600 font-black h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Enter USDT Amount</label>
                            <div className="relative">
                              <input 
                                type="number"
                                value={buyAmountInput}
                                onChange={(e) => setBuyAmountInput(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-600 font-mono"
                              />
                              <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">USDT</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-bold">Locked Rate:</span>
                              <span className="font-bold text-slate-700">₹{activeBuyOffer.pricePerUsdt.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-150 pt-1.5">
                              <span className="text-slate-400 font-bold">Est Payout Amount:</span>
                              <span className="font-extrabold text-slate-900 font-mono">
                                ₹{((parseFloat(buyAmountInput) || 0) * activeBuyOffer.pricePerUsdt).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-[10px] text-amber-800 leading-normal bg-amber-50 p-2 rounded-lg border border-amber-200">
                              ⚠️ <strong>ROUND AMOUNT REQUIREMENT:</strong> Total INR payout amount must strictly end with **"00"** (multiple of 100). Examples: ₹1800, ₹41000. Cents/singles not accepted.
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={handleInitiateTrade}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-blue-600/10 transition"
                        >
                          Lock Vault &amp; Get Details
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ==========================================
                  3. TRANSACTIONS SCREEN VIEW (Escrow Chat Sync)
                 ========================================== */}
              {activeTab === 'transactions' && (
                <div className="space-y-4 font-sans">
                  
                  {currentTrade ? (
                    <div className="space-y-4">
                      
                      {/* Flow Progress header */}
                      <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">{currentTrade.id}</span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            currentTrade.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            currentTrade.status === 'PAID' ? 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse' :
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {currentTrade.status}
                          </span>
                        </div>

                        {/* Visual Timeline steps */}
                        <div className="grid grid-cols-4 gap-1.5 text-[8px] text-center font-bold">
                          <div>
                            <div className="h-1.5 w-full rounded bg-blue-600 mb-1"></div>
                            <span className="text-blue-700 block">1. HOLD ACTIVE</span>
                          </div>
                          <div>
                            <div className={`h-1.5 w-full rounded mb-1 ${
                              currentTrade.status !== 'AWAITING_PAYMENT' ? 'bg-blue-600' : 'bg-slate-100'
                            }`}></div>
                            <span className={currentTrade.status !== 'AWAITING_PAYMENT' ? 'text-blue-700 block' : 'text-slate-400 block'}>2. DEPOSIT</span>
                          </div>
                          <div>
                            <div className={`h-1.5 w-full rounded mb-1 ${
                              currentTrade.status === 'COMPLETED' ? 'bg-blue-600' : 'bg-slate-100'
                            }`}></div>
                            <span className={currentTrade.status === 'COMPLETED' ? 'text-blue-700 block' : 'text-slate-400 block'}>3. VERIFY</span>
                          </div>
                          <div>
                            <div className={`h-1.5 w-full rounded mb-1 ${
                              currentTrade.status === 'COMPLETED' ? 'bg-blue-600' : 'bg-slate-100'
                            }`}></div>
                            <span className={currentTrade.status === 'COMPLETED' ? 'text-blue-700 block' : 'text-slate-400 block'}>4. RELEASE</span>
                          </div>
                        </div>

                        {/* Volume breakdown */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex justify-between items-center text-xs mt-2">
                          <div>
                            <span className="text-slate-400 block text-[9px] font-bold uppercase">Locked Secure hold</span>
                            <span className="text-blue-700 font-extrabold font-mono">{currentTrade.usdtAmount} USDT</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] font-bold uppercase">Fiat Deposit bill</span>
                            <span className="text-slate-800 font-extrabold font-mono">₹{currentTrade.fiatAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Platform Fee Breakdown banner */}
                        <div className="bg-blue-50 border border-blue-150 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-blue-900 font-semibold">
                          <span>0.5% Platform Charges:</span>
                          <span className="font-bold">{(currentTrade.platformFeeUsdt || (currentTrade.usdtAmount * 0.005)).toFixed(3)} USDT</span>
                        </div>
                      </div>

                      {/* Beneficiary bank card details */}
                      <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm space-y-2.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Beneficiary Target Details</span>
                        
                        <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Bank Name:</span>
                            <span className="font-bold text-slate-700">{currentTrade.bankDetails.bankName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Account Beneficiary:</span>
                            <span className="font-bold text-slate-700">{currentTrade.bankDetails.accountName}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-2 mb-2">
                            <span className="text-slate-400">Account No:</span>
                            <span className="font-bold text-slate-900 font-mono">{currentTrade.bankDetails.accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">IFSC Routing Code:</span>
                            <span className="font-bold text-slate-900 font-mono">{currentTrade.bankDetails.ifscCode}</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed">
                          ⚠️ Strictly make a manual branch deposit, bank transfer, or netbanking transfer. Digital UPI apps are strictly prohibited.
                        </p>
                      </div>

                      {/* Messaging center */}
                      <div className="bg-white p-3 rounded-3xl border border-slate-150 h-[220px] flex flex-col justify-between overflow-hidden shadow-sm">
                        <div className="overflow-y-auto space-y-3 pr-1 text-xs flex-1">
                          {currentTrade.messages.map((m, idx) => {
                            const isSystem = m.senderId === 'system';
                            const isMyMsg = m.senderId === firebaseUser.uid;
                            
                            if (isSystem) {
                              return (
                                <div key={idx} className="bg-slate-50 border border-slate-100 text-center rounded-lg p-2 text-[9px] text-slate-500 leading-relaxed font-mono">
                                  🛡️ {m.text}
                                </div>
                              );
                            }

                            return (
                              <div key={idx} className={`flex ${isMyMsg ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl p-2.5 ${
                                  isMyMsg ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'
                                }`}>
                                  <div className="text-[8px] font-bold mb-0.5 uppercase tracking-wider opacity-80">
                                    {isMyMsg ? 'Aap (You)' : 'Partner'}
                                  </div>
                                  <div className="leading-relaxed font-medium">{m.text}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Interactive Dynamic Action trays */}
                        <div className="pt-2 border-t border-slate-100 flex gap-2">
                          {currentRole === 'buyer' && currentTrade.status === 'AWAITING_PAYMENT' && (
                            <button 
                              onClick={handleMarkAsPaid}
                              className="w-full bg-blue-600 text-white font-black text-xs py-2 rounded-xl shadow transition"
                            >
                              Deposit Slip Upload &amp; Claim ⚡
                            </button>
                          )}

                          {currentRole === 'seller' && currentTrade.status === 'PAID' && (
                            <button 
                              onClick={handleReleaseEscrow}
                              className="w-full bg-emerald-600 text-white font-black text-xs py-2 rounded-xl shadow transition"
                            >
                              Payment Verified, Send USDT 🚀
                            </button>
                          )}

                          {currentTrade.status !== 'COMPLETED' && currentTrade.status !== 'DISPUTED' && (
                            <button 
                              onClick={handleOpenDispute}
                              className="text-slate-500 border border-slate-250 px-3 py-2 rounded-xl text-xs"
                            >
                              Dispute ⚠️
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Chat textbox */}
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Type transactional chat..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-black">
                          Send
                        </button>
                      </form>

                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-150 p-6 space-y-3">
                      <span className="text-4xl block">🤝</span>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Open Deals</h4>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        USDT Buy/Sell tab par jao, seller select karo aur secure payment channel open karein.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* ==========================================
                  4. WALLET SCREEN VIEW
                 ========================================== */}
              {activeTab === 'wallet' && (
                <div className="space-y-5 font-sans">
                  
                  {/* Local Balance */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Unified Ledger Balance</span>
                    
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="h-10 w-10 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-xs text-blue-700 font-mono">
                        100%
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">SafeVault target</span>
                        <span className="text-xs font-bold text-slate-700 block">INR Pegged Network</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400 font-mono text-[9px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {firebaseUser ? `0x${firebaseUser.uid.slice(0, 16)}...` : '0x71C35342a78a9c148'}
                      </span>
                      <button 
                        onClick={() => triggerToast("Wallet address copied!", "success")}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black shrink-0"
                      >
                        COPY
                      </button>
                    </div>
                  </div>

                  {/* Refiller & Withdraw Lock logic */}
                  <div className="bg-white rounded-3xl border border-slate-150 p-5 space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Mock Wallet Operations</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      USDT hold lock active hone par checkout ya direct withdrawals frozen ho jaate hain.
                    </p>

                    <div className="space-y-2">
                      <button 
                        onClick={handleRequestWithdraw}
                        className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 font-bold py-2.5 rounded-xl text-xs text-center"
                      >
                        📤 Withdraw assets to bank account
                      </button>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (!firebaseServices || !firebaseUser) return;
                            const { db } = firebaseServices;
                            const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
                            profileRef.update({
                              usdtBalance: userProfile.usdtBalance + 250
                            });
                            triggerToast("Added 250 USDT!", "success");
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 py-2 rounded-xl text-[10px] font-extrabold animate-pulse"
                        >
                          +250 USDT
                        </button>
                        <button 
                          onClick={() => {
                            if (!firebaseServices || !firebaseUser) return;
                            const { db } = firebaseServices;
                            const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
                            profileRef.update({
                              fiatBalance: userProfile.fiatBalance + 10000
                            });
                            triggerToast("Loaded ₹10,000 cash!", "success");
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 py-2 rounded-xl text-[10px] font-extrabold"
                        >
                          +₹10,000 Cash
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ==========================================
                  5. PROFILE SCREEN VIEW (1-Hour Lockout setup)
                 ========================================== */}
              {activeTab === 'profile' && (
                <div className="space-y-5 font-sans pb-8">
                  
                  {/* Profile tag */}
                  <div className="bg-white p-4 rounded-3xl border border-slate-150 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={userProfile.profilePic || PRESETS_AVATARS[0]} 
                          alt="Profile avatar" 
                          className="h-11 w-11 rounded-full object-cover border-2 border-blue-500" 
                        />
                        <button 
                          onClick={() => setAvatarSelectorOpen(true)}
                          className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-1 text-[8px] font-bold shadow-md"
                        >
                          ✏️
                        </button>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{userProfile.name}</h4>
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded mt-1 inline-block font-extrabold uppercase">
                          {userProfile.verificationBadge || 'Phone Verified'}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="text-xs text-rose-600 hover:text-rose-700 font-extrabold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-150"
                    >
                      Logout 🚪
                    </button>
                  </div>

                  {/* Dynamic simulator Swap deck */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🧪</span>
                      <h3 className="text-xs font-black uppercase text-slate-600">Simulate Swap Deck</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Switch active roles to simulate transaction actions from both side viewpoints in real-time.
                    </p>

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleRoleChange('buyer')}
                        className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all ${
                          currentRole === 'buyer' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Act as Rajesh Patel (Buyer context)
                      </button>

                      <button 
                        onClick={() => handleRoleChange('seller')}
                        className={`w-full py-2 rounded-xl text-[11px] font-bold transition-all ${
                          currentRole === 'seller' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Act as Shreya Sharma (Seller context)
                      </button>
                    </div>
                  </div>

                  {/* DYNAMIC SECURE HOURLY ESCROW LOCK LAUNCHER */}
                  <div className="bg-white border border-slate-150 rounded-3xl p-4 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block">USDT timed sellhold lock (1 hour)</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-bold">1-Hour Lock</span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Detais enter karke submit karein. Submit karte hi yeh amount **1 hour** ke liye hold ho jaega. Lock duration tak aap ise withdraw ya doosri baar sell nahi kar sakte.
                    </p>

                    {userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now() ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                        <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wide block">Active hold contract details</span>
                        <div className="text-xs space-y-1.5 text-slate-700">
                          <div className="flex justify-between">
                            <span>Locked volume:</span>
                            <span className="font-bold">{userProfile.activeSellHold.lockedAmount} USDT</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Locked Rate:</span>
                            <span className="font-bold">₹{userProfile.activeSellHold.rate}/USDT</span>
                          </div>
                          <div className="flex justify-between border-t border-amber-200 pt-1.5">
                            <span className="font-bold">Unlocks in:</span>
                            <span className="font-black text-rose-600 animate-pulse">{sellHoldTimeRemaining}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleCreateSellHold} className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Sell Quantity (USDT)</label>
                            <input 
                              type="number"
                              required
                              placeholder="e.g. 150"
                              value={sellQuantityInput}
                              onChange={(e) => setSellQuantityInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 font-extrabold block mb-1">Exchange Rate (₹)</label>
                            <input 
                              type="number"
                              required
                              placeholder="e.g. 88.00"
                              value={sellRateInput}
                              onChange={(e) => setSellRateInput(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-lg shadow-blue-600/10"
                        >
                          🔒 Lock escrow &amp; Publish direct buy/sell
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Referrals list tracker inside profile */}
                  <div className="bg-white border border-slate-150 rounded-3xl p-4 space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block border-b pb-1.5">Referred Friends Tracking ($10 Target)</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Jab bhi koi aapka friend list me se **$100 (₹8,500) equivalent** total sells complete kar lega, aapka pending status automatic claim status me change ho jaega.
                    </p>
                    
                    <div className="space-y-2">
                      {userProfile.referredUsersProgress && Object.keys(userProfile.referredUsersProgress).length > 0 ? (
                        Object.keys(userProfile.referredUsersProgress).map((uid) => {
                          const friend = userProfile.referredUsersProgress[uid];
                          return (
                            <div key={uid} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-800 block">{friend.name}</span>
                                <span className="text-[9px] text-slate-400">Traded: {friend.amountTraded.toFixed(2)} / 100 USDT</span>
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                friend.hasTraded$100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                              }`}>
                                {friend.hasTraded$100 ? 'Unlocked 🔓' : 'Pending ⏳'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-xs text-slate-400">
                          Abhi tak koi refer friends nahi mila hai.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

        {/* ==========================================
            TACTILE BOTTOM NAVIGATION BAR
           ========================================== */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 px-2 flex justify-around items-center z-30 shadow-lg font-sans">
          <button 
            onClick={() => handleTabChange('home')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[8px] font-extrabold uppercase mt-1">Home</span>
          </button>

          <button 
            onClick={() => handleTabChange('buy-sell')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'buy-sell' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L17.5 12M21 7.5H7.5" />
            </svg>
            <span className="text-[8px] font-extrabold uppercase mt-1">Buy/Sell</span>
          </button>

          <button 
            onClick={() => handleTabChange('transactions')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition relative ${activeTab === 'transactions' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-[8px] font-extrabold uppercase mt-1">Transactions</span>
            {trades.filter(t => t.status === 'AWAITING_PAYMENT' || t.status === 'PAID').length > 0 && (
              <span className="absolute top-1.5 right-2.5 h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping"></span>
            )}
          </button>

          <button 
            onClick={() => handleTabChange('wallet')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'wallet' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
            </svg>
            <span className="text-[8px] font-extrabold uppercase mt-1">Wallet</span>
          </button>

          <button 
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center w-12 h-12 transition ${activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[8px] font-extrabold uppercase mt-1">Profile</span>
          </button>
        </nav>

        {/* ==========================================
            AVATAR CHANGE DRAWER (Bottom Sheet Modal)
           ========================================== */}
        {avatarSelectorOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0">
            <div className="bg-white border-t border-slate-200 rounded-t-[32px] p-5 w-full max-w-[390px] space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase">Change Profile Avatar</h3>
                  <span className="text-[9px] text-slate-400">Select pre-designed premium avatars</span>
                </div>
                <button 
                  onClick={() => setAvatarSelectorOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-black h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3.5 py-2">
                {PRESETS_AVATARS.map((picUrl, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleChangeProfilePic(picUrl)}
                    className="h-16 w-16 rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-all flex mx-auto"
                  >
                    <img src={picUrl} alt="Preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            LEGAL / REGULATORY MODAL DRAWER
           ========================================== */}
        {legalModalContent && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0">
            <div className="bg-white border-t border-slate-200 rounded-t-[32px] p-5 w-full max-w-[390px] space-y-4 max-h-[80%] flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2 border-b">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">{legalModalContent.title}</h3>
                  <span className="text-[9px] text-slate-400">Finnox Regulatory Desk</span>
                </div>
                <button 
                  onClick={() => setLegalModalContent(null)}
                  className="text-slate-400 hover:text-slate-600 font-black h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2 text-xs text-slate-600 leading-relaxed space-y-3 font-normal">
                <p>{legalModalContent.text}</p>
                
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Corporate Details</span>
                  <span className="text-[11px] text-slate-800 font-bold block">Finnox Technologies</span>
                  <span className="text-[10px] text-slate-600 font-mono block">1209 Orange Street, Wilmington, DE 19801, United States</span>
                  <span className="text-[10px] text-slate-400 block font-mono mt-1">📧 Support Email: [Blank for custom integration]</span>
                  <span className="text-[10px] text-slate-400 block font-mono">📞 Support Phone: [Blank for custom integration]</span>
                </div>
              </div>

              <button 
                onClick={() => setLegalModalContent(null)}
                className="w-full bg-blue-600 text-white font-extrabold text-xs py-2.5 rounded-xl mt-2"
              >
                Close Document
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            SUCCESS POPUP DIALOGUE
           ========================================== */}
        {successModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 font-sans">
            <div className="bg-white border border-slate-150 rounded-3xl p-6 text-center max-w-[320px] w-full space-y-4 shadow-2xl">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mx-auto text-xl">
                ✓
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{successModal.title}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{successModal.desc}</p>
              </div>
              <button 
                onClick={() => setSuccessModal(null)}
                className="w-full bg-blue-600 text-white font-extrabold text-xs py-2.5 rounded-xl"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            ERROR POPUP DIALOGUE
           ========================================== */}
        {errorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 font-sans">
            <div className="bg-white border border-slate-150 rounded-3xl p-6 text-center max-w-[320px] w-full space-y-4 shadow-2xl">
              <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold mx-auto text-xl">
                ✕
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">Action Blocked</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{errorModal}</p>
              </div>
              <button 
                onClick={() => setErrorModal(null)}
                className="w-full bg-rose-600 text-white font-extrabold text-xs py-2.5 rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}