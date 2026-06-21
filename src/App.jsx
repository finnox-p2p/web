import React, { useState, useEffect } from 'react';

// ==========================================
// CONFIGURATION & GLOBAL INITIALIZATION
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

const PREBUILT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60",
];

const FALLBACK_OFFERS = [
  {
    id: 'off_901',
    sellerId: 'usr_shreya_901',
    sellerName: 'Shreya Sharma',
    sellerRating: 4.95,
    completionRate: '99.2%',
    usdtAmount: 850,
    pricePerUsdt: 88.00,
    minLimit: 5000,
    maxLimit: 75000,
    paymentMethod: 'Bank Deposit',
    status: 'Active',
    volumeTraded: 1250
  },
  {
    id: 'off_902',
    sellerId: 'usr_amit_delhi',
    sellerName: 'Amit Verma',
    sellerRating: 4.80,
    completionRate: '96%',
    usdtAmount: 450,
    pricePerUsdt: 89.00,
    minLimit: 1000,
    maxLimit: 40000,
    paymentMethod: 'Bank Deposit',
    status: 'Active',
    volumeTraded: 420
  }
];

export default function App() {
  const [firebaseServices, setFirebaseServices] = useState(null); 
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Inject Tailwind Dynamic Override
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
        setIsTailwindLoaded(true);
      };
      document.head.appendChild(tailwindScript);
    } else {
      setIsTailwindLoaded(true);
    }

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

    // Dynamic Compat Firebase loader from cloud
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

      authInstance.onAuthStateChanged((user) => {
        setFirebaseUser(user);
      });
    };

    loadFirebaseFromCDN();

    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(splashTimer);
  }, []);

  // UI States
  const [activeTab, setActiveTab] = useState('home'); 
  const [currentRole, setCurrentRole] = useState('buyer'); 
  const [isLoading, setIsLoading] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); 
  
  // Registration States
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authReferId, setAuthReferId] = useState('');
  const [authMode, setAuthMode] = useState('signup'); 

  // Firestore Profile model
  const [userProfile, setUserProfile] = useState({
    name: 'GUEST USER',
    email: '',
    phone: '',
    usdtBalance: 150.00,
    fiatBalance: 50000.00,
    escrowLocked: 0.00,
    referralCode: '',
    referredBy: '',
    avatarUrl: PREBUILT_AVATARS[0],
    activeSellHold: null, 
    bankAccounts: [
      { id: 'b1', bankName: 'HDFC Bank', accountName: 'GUEST USER', accountNumber: '50100488219033', ifscCode: 'HDFC0000060', isPrimary: true }
    ],
    referralsCount: 0,
    totalReferralEarnings: 0
  });

  const [offers, setOffers] = useState(FALLBACK_OFFERS);
  const [trades, setTrades] = useState([]);
  const [selectedTradeId, setSelectedTradeId] = useState(null);

  // Form states
  const [selectedBankIdForSell, setSelectedBankIdForSell] = useState('b1');
  const [activeBuyOffer, setActiveBuyOffer] = useState(null);
  const [buyAmountInput, setBuyAmountInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [sellQuantityInput, setSellQuantityInput] = useState('');
  const [sellRateInput, setSellRateInput] = useState('88.00');

  // New Bank Account form fields
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNo, setNewAccountNo] = useState('');
  const [newIfsc, setNewIfsc] = useState('');

  // Notifications List
  const [notifications, setNotifications] = useState([
    { id: 1, title: "🔒 Secure Hold Active", body: "Direct HDFC Bank deposit transfer complete check kariye.", time: "10 mins ago" },
    { id: 2, title: "🎁 Welcome Bonus Credits", body: "₹500 bonus registration credits has been added to your bank.", time: "1 hour ago" }
  ]);

  // Dynamic Dialog boxes
  const [toast, setToast] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [sellHoldTimeRemaining, setSellHoldTimeRemaining] = useState('');

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!firebaseServices || !firebaseUser || firebaseUser.isAnonymous) return;
    const { db } = firebaseServices;

    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    const unsubscribe = profileRef.onSnapshot((docSnap) => {
      if (docSnap.exists) {
        setUserProfile(docSnap.data());
      } else {
        const myRandomRefer = 'FNX' + Math.floor(1000 + Math.random() * 9000);
        const defaultProfile = {
          name: authName ? authName.toUpperCase() : (authEmail ? authEmail.split('@')[0].toUpperCase() : 'RAJESH PATEL'),
          email: firebaseUser.email || 'rajesh.patel@finnox.com',
          phone: authPhone || '9876543210',
          usdtBalance: 850.00, 
          fiatBalance: 45000.00,
          escrowLocked: 0.00,
          referralCode: myRandomRefer,
          referredBy: authReferId || '',
          avatarUrl: PREBUILT_AVATARS[0],
          activeSellHold: null,
          bankAccounts: [
            { id: 'b1', bankName: 'HDFC Bank', accountName: authName ? authName.toUpperCase() : (authEmail ? authEmail.split('@')[0].toUpperCase() : 'RAJESH PATEL'), accountNumber: '5010048' + Math.floor(100000 + Math.random() * 900000), ifscCode: 'HDFC0000060', isPrimary: true }
          ],
          referralsCount: 0,
          totalReferralEarnings: 0
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

  // Sync P2P Offers & Trades
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

  // Timers handler
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
    }, 1000);
    return () => clearInterval(timer);
  }, [userProfile]);

  // ==========================================
  // TRANSACTION VALIDATORS (00 ENDINGS & IN LIMITS)
  // ==========================================
  const validateAmountRule = (fiatAmount) => {
    if (fiatAmount < 100 || fiatAmount > 100000) {
      setErrorModal("Transactions strictly ₹100 minimum aur ₹1,00,000 maximum limits me hi allowed hain.");
      return false;
    }
    if (fiatAmount % 100 !== 0) {
      setErrorModal("⚠️ Non-round transaction amount blocked! Aap ₹101 ya ₹409 jaise decimals ya random digits me transfer nahi kar sakte. Amount strictly double zero '00' endings me hona chahiye (e.g., ₹100, ₹1800, ₹41000).");
      return false;
    }
    return true;
  };

  const handleRequestWithdraw = () => {
    if (userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now()) {
      setErrorModal(`Aapka USDT Safe-Hold active hai! Aap lock period (${sellHoldTimeRemaining}) se pehle assets withdraw nahi kar sakte.`);
    } else {
      triggerToast("Withdrawal process under Bank holiday cycle settlement. Try tomorrow.", "info");
    }
  };

  const handleOpenDispute = async () => {
    if (!firebaseServices || !selectedTradeId) return;
    const { db } = firebaseServices;
    const tradeRef = db.doc(`artifacts/${appId}/public/data/trades/${selectedTradeId}`);
    
    await tradeRef.update({
      status: 'DISPUTED',
      messages: [
        ...currentTrade.messages,
        { senderId: 'system', text: '🚨 DISPUTE INITIATED. Finnox support team will verify manual bank deposits receipts.', timestamp: 'Just now' }
      ]
    });
    triggerToast("Dispute opened successfully. Support team notified.", "warning");
  };

  const handleLogout = async () => {
    if (!firebaseServices) return;
    try {
      await firebaseServices.auth.signOut();
      setFirebaseUser(null);
      triggerToast("Logged out successfully.", "info");
      handleTabChange('home');
    } catch (err) {
      triggerToast(err.message, "error");
    }
  };

  // ==========================================
  // ADD BANK ACCOUNT PROCESS
  // ==========================================
  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    if (!newBankName || !newAccountNo || !newIfsc) {
      triggerToast("Kripya saari bank details fill karein.", "error");
      return;
    }
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;

    const newAccountObj = {
      id: `acc_${Date.now()}`,
      bankName: newBankName,
      accountName: userProfile.name,
      accountNumber: newAccountNo,
      ifscCode: newIfsc,
      isPrimary: userProfile.bankAccounts.length === 0
    };

    const updatedAccounts = [...userProfile.bankAccounts, newAccountObj];
    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    await profileRef.update({ bankAccounts: updatedAccounts });

    setNewBankName('');
    setNewAccountNo('');
    setNewIfsc('');
    setActiveSheet(null);
    triggerToast("Naya bank account safely link ho gaya hai!", "success");
  };

  // ==========================================
  // SIGN-UP & SIGN-IN WITH EMAIL CONFIRMATION LINK
  // ==========================================
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!firebaseServices) return;
    const { auth, db } = firebaseServices;

    if (!authName || !authEmail || !authPhone || !authPassword) {
      triggerToast('Kripya saare mandatory fields enter karein.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await auth.createUserWithEmailAndPassword(authEmail, authPassword);
      const user = userCredential.user;

      await user.sendEmailVerification();
      triggerToast("Verification Link is on the way! Check your inbox.", "success");

      const myRandomRefer = 'FNX' + Math.floor(1000 + Math.random() * 9000);
      const profileRef = db.doc(`artifacts/${appId}/users/${user.uid}/profile/data`);
      
      const premiumProfile = {
        name: authName.toUpperCase(),
        email: authEmail,
        phone: authPhone,
        usdtBalance: 150.00, 
        fiatBalance: 25000.00,
        escrowLocked: 0.00,
        referralCode: myRandomRefer,
        referredBy: authReferId || '',
        avatarUrl: PREBUILT_AVATARS[0],
        activeSellHold: null,
        bankAccounts: [
          { id: 'b1', bankName: 'SBI Bank', accountName: authName.toUpperCase(), accountNumber: '3099824' + Math.floor(10000+Math.random()*90000), ifscCode: 'SBIN0000102', isPrimary: true }
        ],
        referralsCount: 0,
        totalReferralEarnings: 0
      };

      await profileRef.set(premiumProfile);
      
      await db.doc(`artifacts/${appId}/public/data/referrals/${myRandomRefer}`).set({
        ownerUid: user.uid,
        ownerName: premiumProfile.name
      });

      setSuccessModal({
        title: 'Verifying Email Required 🛡️',
        desc: `Aapki security ke liye verification link ${authEmail} par bhej diya gaya hai. Kripya apna SPAM/Junk folder zaroor check karein.`
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setErrorModal(error.message);
    }
  };

  const handleCheckEmailVerified = async () => {
    if (!firebaseServices || !firebaseUser) return;
    const { auth } = firebaseServices;
    setIsLoading(true);
    await auth.currentUser.reload();
    const updatedUser = auth.currentUser;
    if (updatedUser.emailVerified) {
      setFirebaseUser(updatedUser);
      triggerToast("Email ID verified successfully! Access granted.", "success");
    } else {
      triggerToast("Humne verify nahi kiya hai. Apne inbox aur SPAM folder ko check karein.", "warning");
    }
    setIsLoading(false);
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
      await auth.signInWithEmailAndPassword(authEmail, authPassword);
      triggerToast('Welcome back to Finnox!', 'success');
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setErrorModal(err.message);
    }
  };

  // ==========================================
  // SELL HOLD TRANSACTION PROCESS WITH ACCOUNT SELECT
  // ==========================================
  const handleCreateSellHold = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;

    if (userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now()) {
      setErrorModal(`Aapka sell hold active hai! Lock period (${sellHoldTimeRemaining}) expire hone se pehle doosra lock nahi lagaya ja sakta.`);
      return;
    }

    const qty = parseFloat(sellQuantityInput);
    const rate = parseFloat(sellRateInput);

    if (isNaN(qty) || qty <= 0) {
      triggerToast('Kripya valid quantity enter karein.', 'error');
      return;
    }

    if (qty > userProfile.usdtBalance) {
      setErrorModal('Insufficient wallet balance!');
      return;
    }

    const selectedBank = userProfile.bankAccounts.find(acc => acc.id === selectedBankIdForSell);
    if (!selectedBank) {
      triggerToast("Kripya ek verified Bank Account zaroor select karein.", "error");
      return;
    }

    const lockDuration = 60 * 60 * 1000; 
    const expiresAt = Date.now() + lockDuration;

    const holdDetails = {
      lockedAmount: qty,
      rate: rate,
      createdAt: Date.now(),
      expiresAt: expiresAt,
      linkedBank: selectedBank
    };

    const { db } = firebaseServices;
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
      completionRate: '99%',
      usdtAmount: qty,
      pricePerUsdt: rate,
      minLimit: 100, 
      maxLimit: 100000, 
      paymentMethod: 'Bank Deposit',
      status: 'Active',
      expiresAt: expiresAt,
      linkedBank: selectedBank,
      volumeTraded: userProfile.escrowLocked > 1000 ? 1200 : 450
    });

    setSellQuantityInput('');
    setSuccessModal({
      title: '₹ Secure hold applied! 🔒',
      desc: `Aapka ${qty} USDT safely hold bank portal me locked hai aur buyers ke liye published hai.`
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
    triggerToast("Hold timeout finished! Funds unlocked.", "info");
  };

  // ==========================================
  // SECURED DIRECT PURCHASE PROCESS
  // ==========================================
  const handleInitiateTrade = async () => {
    const amt = parseFloat(buyAmountInput);
    if (isNaN(amt) || amt <= 0 || amt > activeBuyOffer.usdtAmount) {
      triggerToast('Sahi quantity enter karein.', 'error');
      return;
    }
    const totalFiat = amt * activeBuyOffer.pricePerUsdt;

    if (!validateAmountRule(totalFiat)) return;

    if (totalFiat > userProfile.fiatBalance) {
      setErrorModal('Simulated balance insufficient!');
      return;
    }

    const { db } = firebaseServices;
    const tradeId = `FNX-IN-${Math.floor(100000 + Math.random() * 900000)}`;
    const tradeDocRef = db.doc(`artifacts/${appId}/public/data/trades/${tradeId}`);

    const linkedBank = activeBuyOffer.linkedBank || {
      bankName: 'HDFC Bank',
      accountName: activeBuyOffer.sellerName,
      accountNumber: '50100488219033',
      ifscCode: 'HDFC0000060'
    };

    const newTradeObj = {
      id: tradeId,
      offerId: activeBuyOffer.id,
      sellerId: activeBuyOffer.sellerId,
      sellerName: activeBuyOffer.sellerName,
      buyerId: firebaseUser.uid,
      buyerName: userProfile.name,
      usdtAmount: amt,
      pricePerUsdt: activeBuyOffer.pricePerUsdt,
      fiatAmount: totalFiat,
      status: 'AWAITING_PAYMENT',
      timeLeft: 900,
      paymentProof: null,
      bankDetails: linkedBank,
      createdAt: new Date().toISOString(),
      messages: [
        { senderId: 'system', text: `Hold Applied. Platform 0.5% security fee: ₹${(totalFiat*0.005).toFixed(2)}`, timestamp: 'Just now' },
        { senderId: 'system', text: `Strictly direct bank deposits allowed. Upload branch receipt below.`, timestamp: 'Just now' }
      ]
    };

    await tradeDocRef.set(newTradeObj);
    setSelectedTradeId(tradeId);
    setActiveBuyOffer(null);
    setBuyAmountInput('');

    setSuccessModal({
      title: 'Hold Active! 🔒',
      desc: `Aapka ₹${totalFiat.toLocaleString('en-IN')} deal block ban gaya hai. Direct receipt check zaroori hai.`
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
        { senderId: 'system', text: '✅ Branch slip uploaded. Netbanking verify check.', timestamp: 'Just now' }
      ]
    });

    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    await profileRef.update({
      fiatBalance: userProfile.fiatBalance - currentTrade.fiatAmount
    });

    triggerToast("Payment marked! Waiting for Seller validation.", "success");
  };

  const handleReleaseEscrow = async () => {
    if (!firebaseServices) return;
    const { db } = firebaseServices;
    const tradeRef = db.doc(`artifacts/${appId}/public/data/trades/${selectedTradeId}`);
    
    const calculatedFee = currentTrade.fiatAmount * 0.005;

    await tradeRef.update({
      status: 'COMPLETED',
      messages: [
        ...currentTrade.messages,
        { senderId: 'system', text: `🏆 Transaction settled. Net fee of ₹${calculatedFee.toFixed(2)} deducted.`, timestamp: 'Just now' }
      ]
    });

    const sellerProfileRef = db.doc(`artifacts/${appId}/users/${currentTrade.sellerId}/profile/data`);
    const buyerProfileRef = db.doc(`artifacts/${appId}/users/${currentTrade.buyerId}/profile/data`);

    const sellerSnap = await sellerProfileRef.get();
    const buyerSnap = await buyerProfileRef.get();

    if (sellerSnap.exists) {
      await sellerProfileRef.update({
        escrowLocked: Math.max(0, sellerSnap.data().escrowLocked - currentTrade.usdtAmount),
        activeSellHold: null
      });
    }

    if (buyerSnap.exists) {
      await buyerProfileRef.update({
        usdtBalance: buyerSnap.data().usdtBalance + currentTrade.usdtAmount
      });
    }

    setSuccessModal({
      title: 'Transferred Successfully! 🏆',
      desc: `${currentTrade.usdtAmount} USDT credited to wallet after deducting 0.5% security platform charges.`
    });
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

  const handleUpdateAvatar = async (url) => {
    if (!firebaseServices || !firebaseUser) return;
    const { db } = firebaseServices;
    const profileRef = db.doc(`artifacts/${appId}/users/${firebaseUser.uid}/profile/data`);
    await profileRef.update({ avatarUrl: url });
    triggerToast("Profile identity avatar safely updated!", "success");
  };

  const currentTrade = trades.find(t => t.id === selectedTradeId);

  if (!isTailwindLoaded) {
    return (
      <div style={{
        height: '100dvh',
        width: '100vw',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          height: '45px',
          width: '45px',
          border: '4px solid #2563eb',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '16px', color: '#1e3a8a', fontWeight: 'bold', fontSize: '14px' }}>
          Finnox Secure hold pipeline loading...
        </p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center py-0 md:py-6 px-0 sm:px-4">
      
      {/* ==========================================
          MOBILE VIEWPORT CONTAINER (390px Dynamic App Shell)
         ========================================== */}
      <div className="w-full max-w-[390px] h-[100dvh] md:h-[844px] bg-white flex flex-col justify-between relative shadow-2xl md:rounded-[40px] md:border-[12px] md:border-slate-800 overflow-hidden text-slate-800">
        
        {/* ==========================================
            FINTECH ANIMATED SPLASH SCREEN (2.5 Sec Minimum)
           ========================================== */}
        {showSplash && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-between py-12 px-6">
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296a3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043a3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296a3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043a3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-black tracking-tight text-blue-900 leading-none">Finnox</h1>
                <span className="text-[10px] font-extrabold text-emerald-600 tracking-widest block uppercase mt-1">DIRECT SAFE-HOLD GATEWAY</span>
              </div>
            </div>

            <div className="space-y-2 text-center w-full">
              <div className="h-1 w-24 bg-blue-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-infinite-loading w-1/2"></div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secured by State Bank Protection Rules</p>
            </div>
          </div>
        )}

        {/* ==========================================
            CUSTOM LOG-IN / SIGN-UP OVERLAY
           ========================================== */}
        {(!firebaseUser || firebaseUser.isAnonymous) && !isFirebaseLoading && !showSplash && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col justify-between p-6">
            <div className="space-y-4 pt-4 overflow-y-auto max-h-[92%]">
              
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

              {/* Form implementation */}
              <form onSubmit={authMode === 'signup' ? handleEmailSignUp : handleEmailSignIn} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Enter legal banking name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl text-xs shadow-lg shadow-blue-600/20 transition active:scale-95 mt-2"
                >
                  {authMode === 'signup' ? 'Sign Up & Send Verification Link 🎁' : 'Login Securely 🔑'}
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
            EMAIL VERIFICATION REQUIRED SCREEN
           ========================================== */}
        {firebaseUser && !firebaseUser.emailVerified && !firebaseUser.email.includes('demo') && !isFirebaseLoading && !showSplash && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col justify-between p-6 text-center">
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
                🛡️
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900">Email Verification Required</h2>
                <p className="text-xs text-slate-500 leading-relaxed px-4">
                  Humne verification email aapke register email **{firebaseUser.email}** par send kiya hai.
                </p>
              </div>

              {/* Spam Warning Box */}
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl text-xs leading-relaxed text-left w-full space-y-1">
                <strong className="block text-amber-950">⚠️ IMP: Check Spam/Junk folder</strong>
                <span>कभी-कभी फ़ायरबेस का वेरिफिकेशन लिंक आपके इनबॉक्स की जगह **SPAM** या **Junk Mail** फोल्डर में चला जाता है। कृपया वहां चेक करें!</span>
              </div>

              <div className="space-y-2 w-full">
                <button 
                  onClick={handleCheckEmailVerified}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-blue-500/10"
                >
                  Verify completed? Click here to verify status 🔄
                </button>
                <button 
                  onClick={handleResendEmail}
                  className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl text-xs font-bold"
                >
                  Resend Verification Email ✉️
                </button>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="text-xs text-slate-400 font-semibold underline"
            >
              Sign up with different Email ID
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
              <span className="text-[9px] font-semibold text-emerald-600 tracking-widest block uppercase mt-0.5">US-Registered P2P Vault</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveSheet('notifications')}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-600"></span>
            </button>

            <button 
              onClick={() => handleTabChange('profile')}
              className="h-8 w-8 rounded-full overflow-hidden border border-blue-200 shadow-sm"
            >
              <img src={userProfile.avatarUrl} alt="Avatar" className="object-cover h-full w-full" />
            </button>
          </div>
        </header>

        {/* ==========================================
            SCROLLABLE CONTENT AREA
           ========================================== */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 bg-slate-50 scrollbar-none pb-20">
          
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
                      <h2 className="text-base font-black text-slate-900 leading-tight">
                        {userProfile.name} 🇮🇳
                      </h2>
                    </div>
                    {userProfile.referralCode && (
                      <div className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl text-[10px] font-bold text-blue-700">
                        Code: {userProfile.referralCode}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE SELL LOCK BANNER WARNING */}
                  {userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now() && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2.5 items-start">
                      <span className="text-lg animate-bounce">🔒</span>
                      <div className="text-[10px] leading-relaxed text-amber-900">
                        <span className="font-bold block text-xs">1-Hour Safe Hold Lock Active!</span>
                        Aapka <span className="font-bold">{userProfile.activeSellHold.lockedAmount} USDT</span> locked hai. Lock expire hone me <span className="font-extrabold font-mono text-xs text-rose-600">{sellHoldTimeRemaining}</span> bacha hai. Tab tak doosra sell process blocked rahega.
                      </div>
                    </div>
                  )}

                  {/* Trust-First balance display card */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-150 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 font-bold text-6xl text-blue-600 pointer-events-none -mr-4">INR</div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">My Safe Holdings</span>
                        <span className="text-3xl font-black text-slate-900 mt-0.5 block tracking-tight">
                          {userProfile.usdtBalance.toFixed(2)}{' '}
                          <span className="text-sm font-bold text-blue-600 font-mono">USDT</span>
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> ₹ Secured
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
                      onClick={() => handleTabChange('sell-usdt')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-4 text-center transition active:scale-95 shadow-md shadow-emerald-600/10"
                    >
                      <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2 text-white text-lg font-bold">
                        －
                      </div>
                      <span className="text-xs font-extrabold block">USDT बेचें</span>
                      <span className="text-[9px] text-emerald-100 font-medium mt-0.5 block">Sell locked USDT</span>
                    </button>
                  </div>

                  {/* US-REGISTERED HUD BADGES (Fully Responsive) */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-150">
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-700">
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-lg block mb-0.5">🏦</span>
                        <span className="block leading-tight">Bank Deposit Only</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-lg block mb-0.5">💼</span>
                        <span className="block leading-tight">DE-Registered</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-lg block mb-0.5">📉</span>
                        <span className="block leading-tight">0.5% Low Fee</span>
                      </div>
                    </div>
                  </div>

                  {/* Referral Card summary */}
                  <div className="bg-gradient-to-tr from-blue-700 to-indigo-800 text-white p-4 rounded-3xl space-y-3 relative overflow-hidden shadow-lg">
                    <div className="absolute right-0 bottom-0 opacity-10 font-bold text-7xl text-white pointer-events-none -mr-4">🎁</div>
                    <div>
                      <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-extrabold uppercase">REFERRAL REWARD</span>
                      <h3 className="text-sm font-black mt-1">Get $10 Per Verified Referral! 🤝</h3>
                      <p className="text-[10px] text-blue-100 leading-relaxed mt-1">
                        Aapke referral code ka use karke registration karne par referee ko first $100 sell transaction par reward milega.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveSheet('refer-earn')}
                      className="bg-white text-blue-800 font-extrabold text-[10px] px-4 py-2 rounded-xl"
                    >
                      Invite Friends Now
                    </button>
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
                      const isProVerified = offer.volumeTraded >= 1000;
                      return (
                        <div key={offer.id} className="bg-white border border-slate-150 rounded-3xl p-4 space-y-3 shadow-sm relative">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700 text-sm">
                                {offer.sellerName[0]}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="text-xs font-black text-slate-800">{offer.sellerName}</span>
                                  {isProVerified && (
                                    <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider block whitespace-nowrap">
                                      ★ Pro Verified
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block">Rating: ★ {offer.sellerRating} • Volume: {offer.volumeTraded} USDT</span>
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
                              <span className="font-extrabold text-slate-850 font-mono">₹{offer.minLimit.toLocaleString('en-IN')} - ₹{offer.maxLimit.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 gap-2">
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 whitespace-nowrap">
                              🏦 Direct Bank Deposit Only
                            </span>

                            <button 
                              onClick={() => handleOpenBuyModal(offer)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded-xl transition flex-1 text-center"
                            >
                              Buy Now
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
                            <span className="text-[10px] text-slate-400 font-semibold">Verified Bank deposit with {activeBuyOffer.sellerName}</span>
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
                              <span className="text-slate-400">Locked Rate:</span>
                              <span className="font-bold text-slate-700">₹{activeBuyOffer.pricePerUsdt.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Security Fee (0.5%):</span>
                              <span className="font-bold text-rose-600">₹{((parseFloat(buyAmountInput) || 0) * activeBuyOffer.pricePerUsdt * 0.005).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-slate-100">
                              <span className="font-extrabold text-slate-600">Total Bank Bill:</span>
                              <span className="font-black text-blue-700 font-mono">
                                ₹{((parseFloat(buyAmountInput) || 0) * activeBuyOffer.pricePerUsdt).toLocaleString('en-IN')}
                              </span>
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
                  DEDICATED "USDT बेचें" (SELL USDT) PAGE
                 ========================================== */}
              {activeTab === 'sell-usdt' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm space-y-2">
                    <h3 className="text-base font-black text-slate-900">USDT Lock &amp; Sell Securehold</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Sellers lock USDT inside Finnox escrow vault for 1 hour. No withdrawals or parallel sales are allowed inside this lock window.
                    </p>
                  </div>

                  {userProfile.activeSellHold && userProfile.activeSellHold.expiresAt > Date.now() ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl space-y-3">
                      <span className="text-xs text-amber-800 font-extrabold uppercase block">Active locked escrow details</span>
                      <div className="text-xs space-y-1.5 text-slate-700">
                        <div className="flex justify-between">
                          <span>Locked volume:</span>
                          <span className="font-bold">{userProfile.activeSellHold.lockedAmount} USDT</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exchange rate applied:</span>
                          <span className="font-bold">₹{userProfile.activeSellHold.rate}/USDT</span>
                        </div>
                        <div className="flex justify-between border-t border-amber-200 pt-2">
                          <span className="font-bold text-amber-950">Release countdown:</span>
                          <span className="font-black text-rose-600 text-sm animate-pulse">{sellHoldTimeRemaining}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateSellHold} className="bg-white p-4 rounded-3xl border border-slate-150 space-y-4 shadow-sm">
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Select linked Bank Account for Payment</label>
                        <select 
                          value={selectedBankIdForSell}
                          onChange={(e) => setSelectedBankIdForSell(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800"
                        >
                          {userProfile.bankAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber} ({acc.accountName})</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3.5 rounded-xl transition shadow-lg shadow-blue-600/10 uppercase tracking-wider"
                      >
                        🔒 Lock escrow &amp; Publish direct buy/sell
                      </button>
                    </form>
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
                    
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="h-10 w-10 rounded-full border-4 border-blue-600 flex items-center justify-center font-bold text-xs text-blue-700 font-mono shrink-0">
                        100%
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">SafeVault target</span>
                        <span className="text-xs font-bold text-slate-700 block">INR Pegged Network</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs overflow-hidden">
                      <span className="text-slate-400 font-mono text-[9px] truncate">
                        {firebaseUser ? `0x${firebaseUser.uid}` : '0x71C35342a78a9c148'}
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
                  5. PROFILE SCREEN VIEW
                 ========================================== */}
              {activeTab === 'profile' && (
                <div className="space-y-5 font-sans">
                  
                  {/* Premium Profile card */}
                  <div className="bg-white p-4 rounded-3xl border border-slate-150 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden border border-blue-200 shadow-sm relative">
                        <img src={userProfile.avatarUrl} alt="Avatar" className="object-cover h-full w-full" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 leading-tight">{userProfile.name}</h4>
                        <span className="text-[9px] font-bold text-slate-400 block">{userProfile.email}</span>
                      </div>
                    </div>

                    {/* Avatar selection deck */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-extrabold block">Select Profile Pic Avatar</span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {PREBUILT_AVATARS.map((url, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleUpdateAvatar(url)}
                            className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 hover:border-blue-600 shrink-0 transition"
                          >
                            <img src={url} alt="Av" className="object-cover h-full w-full" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BANK ACCOUNTS CARD VIEW (MANAGEMENT) */}
                  <div className="bg-white p-4 rounded-3xl border border-slate-150 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase">My Bank Accounts ({userProfile.bankAccounts.length})</span>
                      <button 
                        onClick={() => setActiveSheet('bank-accounts')}
                        className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-xl font-bold"
                      >
                        + Add Bank
                      </button>
                    </div>

                    <div className="space-y-2">
                      {userProfile.bankAccounts.map((acc) => (
                        <div key={acc.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex justify-between items-center">
                          <div>
                            <span className="font-extrabold text-slate-800 block">{acc.bankName}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">A/c: {acc.accountNumber} • {acc.ifscCode}</span>
                          </div>
                          {acc.isPrimary && (
                            <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Primary</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Swap context */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 space-y-3 shadow-sm">
                    <span className="text-xs font-black text-slate-900 block">🧪 Dynamic Swap Deck</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button 
                        onClick={() => handleRoleChange('buyer')}
                        className={`py-2 rounded-xl font-bold transition-all ${
                          currentRole === 'buyer' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Rajesh (Buyer)
                      </button>
                      <button 
                        onClick={() => handleRoleChange('seller')}
                        className={`py-2 rounded-xl font-bold transition-all ${
                          currentRole === 'seller' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}
                      >
                        Shreya (Seller)
                      </button>
                    </div>
                  </div>

                  {/* PREMIUM CLEAN POLICY LINKS SYSTEM */}
                  <div className="bg-white rounded-3xl border border-slate-150 p-2 divide-y divide-slate-100 shadow-sm text-xs font-bold text-slate-700">
                    <button onClick={() => setActiveSheet('legal-about')} className="w-full text-left py-3 px-3 flex justify-between items-center hover:bg-slate-50">
                      <span>Corporate About Us</span> <span className="text-slate-400">➔</span>
                    </button>
                    <button onClick={() => setActiveSheet('legal-terms')} className="w-full text-left py-3 px-3 flex justify-between items-center hover:bg-slate-50">
                      <span>Terms &amp; Conditions</span> <span className="text-slate-400">➔</span>
                    </button>
                    <button onClick={() => setActiveSheet('legal-security')} className="w-full text-left py-3 px-3 flex justify-between items-center hover:bg-slate-50">
                      <span>Finnox Security Standards</span> <span className="text-slate-400">➔</span>
                    </button>
                    <button onClick={() => setActiveSheet('legal-fees')} className="w-full text-left py-3 px-3 flex justify-between items-center hover:bg-slate-50">
                      <span>Platform Fees &amp; Limits</span> <span className="text-slate-400">➔</span>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-2xl text-xs font-black uppercase"
                    >
                      Log Out Account
                    </button>
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
            <span className="text-[8px] font-extrabold uppercase mt-1">Deals</span>
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
            SECURE BOTTOM DRAWERS / SHEETS SYSTEM
           ========================================== */}
        {activeSheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0 font-sans">
            <div className="bg-white border-t border-slate-200 rounded-t-[32px] p-5 w-full max-w-[390px] max-h-[70%] overflow-y-auto space-y-4">
              
              {/* Header drawer sheet */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-800 uppercase">
                  {activeSheet === 'notifications' ? 'System Alerts (Real-time)' :
                   activeSheet === 'bank-accounts' ? 'Verified Bank Accounts' :
                   activeSheet === 'refer-earn' ? 'Refer & Earn rewards' :
                   activeSheet === 'legal-about' ? 'Corporate Profile' :
                   activeSheet === 'legal-terms' ? 'Platform Rules' :
                   activeSheet === 'legal-security' ? 'Privacy Policies' :
                   activeSheet === 'legal-risk' ? 'Risk warning disclosure' :
                   'System Information'}
                </span>
                <button 
                  onClick={() => setActiveSheet(null)}
                  className="text-slate-400 hover:text-slate-600 font-black h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* SHEET 1: REAL-TIME NOTIFICATIONS */}
              {activeSheet === 'notifications' && (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-xs font-extrabold text-blue-900">{n.title}</strong>
                        <span className="text-[8px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{n.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* SHEET 2: LINK NEW BANK DETAILS */}
              {activeSheet === 'bank-accounts' && (
                <form onSubmit={handleAddBankAccount} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Bank Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. HDFC Bank, ICICI Bank"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Account Number</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="Enter legal bank account number"
                      value={newAccountNo}
                      onChange={(e) => setNewAccountNo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">IFSC Routing Code</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. HDFC0000060"
                      value={newIfsc}
                      onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none uppercase"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition"
                  >
                    Link Verified Bank Details
                  </button>
                </form>
              )}

              {/* SHEET 3: REFER & EARN DASHBOARD */}
              {activeSheet === 'refer-earn' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 text-white p-4 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-100">Refer &amp; Claim $10 Cash</span>
                    <h3 className="text-base font-black">Referral Dashboard</h3>
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/20 text-xs">
                      <div>
                        <span className="opacity-80 block text-[9px]">Total Referrals</span>
                        <span className="font-extrabold text-sm">{userProfile.referralsCount || 0} Friends</span>
                      </div>
                      <div>
                        <span className="opacity-80 block text-[9px]">Earned Bonus</span>
                        <span className="font-extrabold text-sm">${userProfile.totalReferralEarnings || 0} USDT</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <strong className="block text-slate-800 text-xs mb-1">⚙️ Rules &amp; Settlement Policies</strong>
                    <p>1. Aapka link use karke register karne wale person ko $10 milenge aur refer karne wale ko bhi $10 direct target par milenge.</p>
                    <p className="font-bold text-blue-700">2. Conditions: Referred person ko minimum $100 ka first USDT sell hold verify complete karna hoga, tabhi bonus withdrawable balance me unlock hoga.</p>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`https://finnox-p2p.com/ref=${userProfile.referralCode}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono select-all text-blue-700 font-bold"
                    />
                    <button 
                      onClick={() => {
                        triggerToast("Referral code copied!", "success");
                        setActiveSheet(null);
                      }}
                      className="bg-blue-600 text-white font-black text-xs px-4 py-2 rounded-xl"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              )}

              {/* ABOUT US Corporate Sheet */}
              {activeSheet === 'legal-about' && (
                <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-sans">
                  <h3 className="font-black text-slate-800 text-sm">Finnox Technologies Inc</h3>
                  <p>Finnox is a secure US-Registered peer-to-peer hold ledger network created specifically to optimize direct cash deposits settlements across cross-border bank portals safely.</p>
                  <p className="font-bold text-slate-900 border-t border-slate-100 pt-3">DE-Registration Corporate Address:</p>
                  <address className="not-italic font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-slate-800">
                    <span className="block font-bold">🏢 Finnox Technologies</span>
                    <span className="block">1209 Orange Street</span>
                    <span className="block">Wilmington, DE 19801</span>
                    <span className="block font-bold">United States 🇺🇸</span>
                  </address>
                </div>
              )}

              {/* TERMS & CONDITIONS SHEET */}
              {activeSheet === 'legal-terms' && (
                <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                  <h3 className="font-black text-slate-800 text-sm">Platform Rules</h3>
                  <p>1. Users must strictly utilize bank deposits matching their verified KYC name. No third-party bank payments are verified.</p>
                  <p>2. Double-spending or fraudulent deposit receipt uploads will trigger immediate support desk intervention and lifetime asset freezes.</p>
                  <p>3. 0.5% protocol handling fee is applicable on each transaction settled.</p>
                </div>
              )}

              {/* FEES & LIMITS SHEET */}
              {activeSheet === 'legal-fees' && (
                <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-sans">
                  <h3 className="font-black text-slate-800 text-sm">Finnox Service Fees</h3>
                  <p>The platform maintains transparent pricing layers ensuring highest liquidity and safety across direct escrow holds:</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>USDT buy/sell transaction fee:</span>
                      <span className="font-bold text-blue-700">0.5% Fee</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum transaction limit:</span>
                      <span className="font-bold text-slate-800">₹100 INR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum transaction limit:</span>
                      <span className="font-bold text-slate-800">₹1,00,000 INR</span>
                    </div>
                  </div>
                </div>
              )}

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