import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem, UserProfile } from "../types";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, OperationType, handleFirestoreError } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type Language = "en" | "ne";
export type Theme = "dark" | "light";

interface ThemeLanguageContextType {
  theme: Theme;
  language: Language;
  currentUser: UserProfile | null;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateUserInDb: (updated: UserProfile) => Promise<void>;
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
}

const defaultUser: UserProfile = {
  email: "customer@gmail.com",
  userName: "Anish Shrestha",
  role: "customer",
  joinedAt: "2026-05-10T12:00:00Z",
  addresses: [
    {
      id: "addr_2",
      name: "Anish Shrestha",
      phone: "9851122334",
      addressLine: "New Baneshwor, Ward-10",
      city: "Kathmandu",
      province: "Bagmati",
      isDefault: true
    }
  ],
  wishlist: ["prod_2"],
  cart: [
    {
      productId: "prod_3",
      name: "AcousticNoise Pro Wireless ANC Headphones",
      price: 15500,
      discountPrice: 12499,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export function ThemeLanguageProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Sync state when user changes
  useEffect(() => {
    if (currentUser) {
      setCart(currentUser.cart || []);
      setWishlist(currentUser.wishlist || []);
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [currentUser]);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isUserAdminUid = firebaseUser.uid === "VELm81bBVdRTpoxzETw4whzuo9C3" || firebaseUser.email === "admin@youthtech.com" || firebaseUser.email === "baijusudarshan@gmail.com";
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        try {
          // Attempt loading from Firestore first
          let docSnap;
          try {
            docSnap = await getDoc(userDocRef);
          } catch (e: any) {
            handleFirestoreError(e, OperationType.GET, `users/${firebaseUser.uid}`);
          }

          if (docSnap.exists()) {
            const data = docSnap.data() as any;
            let updatedRole = data.role || "customer";
            if (isUserAdminUid) {
              updatedRole = "admin";
            }
            const loadedProfile: UserProfile = {
              email: firebaseUser.email || data.email || "",
              userName: data.userName || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              role: updatedRole,
              joinedAt: data.joinedAt || new Date().toISOString(),
              addresses: data.addresses || [],
              wishlist: data.wishlist || [],
              cart: data.cart || []
            };

            if (data.role !== updatedRole) {
              try {
                await setDoc(userDocRef, { role: updatedRole }, { merge: true });
              } catch (e: any) {
                handleFirestoreError(e, OperationType.UPDATE, `users/${firebaseUser.uid}`);
              }
            }

            setCurrentUser(loadedProfile);

            // Sync with local memory backend for consistency
            await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...loadedProfile,
                uid: firebaseUser.uid,
                password: "firebase-managed-auth"
              })
            }).catch(() => {});
          } else {
            // Document doesn't exist, check local server DB and/or local storage
            const response = await fetch("/api/auth/profile?email=" + encodeURIComponent(firebaseUser.email || "") + "&uid=" + firebaseUser.uid);
            let profileToSave: UserProfile;

            if (response.ok) {
              const userObj = await response.json();
              if (isUserAdminUid) {
                userObj.role = "admin";
              }
              profileToSave = userObj;
            } else {
              const pendingRole = (isUserAdminUid ? "admin" : (localStorage.getItem("pending_role") || "customer")) as "admin" | "customer";
              profileToSave = {
                email: firebaseUser.email || "",
                userName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
                role: pendingRole,
                joinedAt: new Date().toISOString(),
                addresses: [],
                wishlist: [],
                cart: []
              };

              await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...profileToSave,
                  uid: firebaseUser.uid,
                  password: "firebase-managed-auth"
                })
              }).catch(() => {});
            }

            localStorage.removeItem("pending_role");

            // Write record to Firestore
            try {
              await setDoc(userDocRef, {
                ...profileToSave,
                uid: firebaseUser.uid
              });
            } catch (e: any) {
              handleFirestoreError(e, OperationType.CREATE, `users/${firebaseUser.uid}`);
            }

            setCurrentUser(profileToSave);
          }
        } catch (err) {
          console.error("Firestore user read failure, falling back to local api and memory store", err);
          const response = await fetch("/api/auth/profile?email=" + encodeURIComponent(firebaseUser.email || ""));
          if (response.ok) {
            const userObj = await response.json();
            if (isUserAdminUid) {
              userObj.role = "admin";
            }
            setCurrentUser(userObj);
          } else {
            const pendingRole = (isUserAdminUid ? "admin" : (localStorage.getItem("pending_role") || "customer")) as "admin" | "customer";
            setCurrentUser({
              email: firebaseUser.email || "",
              userName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              role: pendingRole,
              joinedAt: new Date().toISOString(),
              addresses: [],
              wishlist: [],
              cart: []
            });
          }
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ne" : "en"));
  };

  const login = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const logout = () => {
    signOut(auth).catch((err) => console.error("Firebase signOut failed", err));
    setCurrentUser(null);
  };

  const updateUserInDb = async (updated: UserProfile) => {
    setCurrentUser(updated);
    try {
      // Sync on local Express memory server for DB operations
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      // Write changes natively to Firestore as they requested to connect to firebase database
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        try {
          await setDoc(userDocRef, {
            ...updated,
            uid: auth.currentUser.uid
          }, { merge: true });
        } catch (e: any) {
          handleFirestoreError(e, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
        }
      }

      if (response.ok) {
        const fresh = await response.json();
        setCurrentUser(fresh);
      }
    } catch (err) {
      console.error("Failed to sync profile update with server and Firestore", err);
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    let updatedCart = [...cart];
    const existingIdx = updatedCart.findIndex((item) => item.productId === product.id);

    if (existingIdx !== -1) {
      updatedCart[existingIdx].quantity += quantity;
    } else {
      updatedCart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        quantity,
        image: product.images[0] || "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600"
      });
    }

    setCart(updatedCart);

    if (currentUser) {
      updateUserInDb({
        ...currentUser,
        cart: updatedCart
      });
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    if (currentUser) {
      updateUserInDb({
        ...currentUser,
        cart: updatedCart
      });
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    if (currentUser) {
      updateUserInDb({
        ...currentUser,
        cart: updatedCart
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    if (currentUser) {
      updateUserInDb({
        ...currentUser,
        cart: []
      });
    }
  };

  const addToWishlist = (productId: string) => {
    if (wishlist.includes(productId)) return;
    const updatedWishlist = [...wishlist, productId];
    setWishlist(updatedWishlist);
    if (currentUser) {
      updateUserInDb({
        ...currentUser,
        wishlist: updatedWishlist
      });
    }
  };

  const removeFromWishlist = (productId: string) => {
    const updatedWishlist = wishlist.filter((id) => id !== productId);
    setWishlist(updatedWishlist);
    if (currentUser) {
      updateUserInDb({
        ...currentUser,
        wishlist: updatedWishlist
      });
    }
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        language,
        currentUser,
        toggleTheme,
        toggleLanguage,
        login,
        logout,
        updateUserInDb,
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      <div className={theme === "dark" ? "dark bg-slate-950 text-slate-100 min-h-screen transition-colors duration-300" : "bg-neutral-50 text-slate-900 min-h-screen transition-colors duration-300"}>
        {children}
      </div>
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error("useThemeLanguage must be wrapped inside of ThemeLanguageProvider");
  }
  return context;
}

// Translations Dictionary
export const translations = {
  en: {
    home: "Home",
    shop: "Shop Now",
    laptops: "Laptops",
    smartphones: "Smartphones",
    audio: "Audio Gear",
    wearables: "Wearables",
    monitors: "Monitors",
    smarthome: "Smart Home",
    featuredProducts: "Featured Products",
    newArrivals: "New Arrivals",
    bestSellers: "Best Sellers",
    categories: "Categories",
    searchPlaceholder: "Search gadgets, brands, laptops, specs...",
    cart: "Cart",
    wishlist: "Wishlist",
    adminPanel: "Admin Panel",
    userProfile: "My Account",
    reviews: "Reviews",
    addReview: "Write a Review",
    rating: "Rating",
    specifications: "Specifications",
    stock: "Stock",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock Alert",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    checkout: "Checkout",
    relatedProducts: "Related Products",
    nepaliPay: "Pay with local e-wallet",
    cod: "Cash on Delivery",
    coupon: "Coupon Discount",
    subtotal: "Subtotal",
    shipping: "Standard Shipping",
    totalPrice: "Total Due",
    quickView: "Quick View",
    saveForLater: "Save for Later",
    deliveryAddress: "Delivery Address",
    placeOrder: "Confirm Order & Pay",
    invoiceHeader: "Invoice Bill",
    trackOrder: "Track Shipment",
    liveChat: "AI Tech Support",
    online: "Online",
    faqHeader: "Frequently Asked Questions",
    returnsPolicy: "Returns & Refund Policy",
    contactUs: "Contact Youth Tech",
    newsletterSub: "Subscribe to Newsletter"
  },
  ne: {
    home: "गृहपेज",
    shop: "किनमेल गर्नुहोस्",
    laptops: "ल्यापटपहरु",
    smartphones: "स्मार्टफोनहरु",
    audio: "अडियो गियर",
    wearables: "स्मार्ट घडीहरु",
    monitors: "मनिटरहरु",
    smarthome: "स्मार्ट होम उपकरण",
    featuredProducts: "विशेष उत्पादनहरु",
    newArrivals: "नयाँ सामानहरु",
    bestSellers: "धेरै बिक्री हुने",
    categories: "श्रेणीहरु",
    searchPlaceholder: "ग्याजेट, ब्रान्ड, मोडल खोज्नुहोस्...",
    cart: "झोला",
    wishlist: "इच्छा सूची",
    adminPanel: "व्यवस्थापक प्यानल",
    userProfile: "मेरो खाता",
    reviews: "ग्राहक सन्तुष्टि",
    addReview: "प्रतिक्रिया लेख्नुहोस्",
    rating: "दर्जा",
    specifications: "विशिष्टताहरु",
    stock: "बाँकी स्टक",
    inStock: "स्टकमा उपलब्ध",
    outOfStock: "स्टक सकिएको",
    lowStock: "कम स्टक चेतावनी",
    addToCart: "झोलामा थप्नुहोस्",
    buyNow: "अहिले किन्नुहोस्",
    checkout: "चेकआउट गर्नुहोस्",
    relatedProducts: "सम्बन्धित उत्पादनहरु",
    nepaliPay: "नेपाली डिजिटल वालेट मार्फत भुक्तानी",
    cod: "डेलिभरीमा नगद भुक्तानी (COD)",
    coupon: "कुपन छुट",
    subtotal: "जम्मा रकम",
    shipping: "ढुवानी शुल्क",
    totalPrice: "कुल भुक्तानी रसिद",
    quickView: "सरसर्ती हेर्नुहोस्",
    saveForLater: "पछि विचार गरौँला",
    deliveryAddress: "वितरण ठेगाना",
    placeOrder: "अर्डर स्वीकार्नुहोस् र भुक्तानी गर्नुहोस्",
    invoiceHeader: "डिजिटल बिल रसिद",
    trackOrder: "अर्डर ट्र्याक गर्नुहोस्",
    liveChat: "एआई ग्याजेट सहयोगी",
    online: "सक्रिय",
    faqHeader: "बारम्बार सोधिने प्रश्नहरु",
    returnsPolicy: "फिर्ता र रिफन्ड नीति",
    contactUs: "सम्पर्क युथ टेक",
    newsletterSub: "नयाँ अफरहरूको लागि दर्ता गर्नुहोस्"
  }
};
