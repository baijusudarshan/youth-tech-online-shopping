import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "db.json");

app.use(express.json({ limit: "50mb" }));

// Helper to initialize or load the database
function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initialDb = {
      products: [
        {
          id: "prod_1",
          name: "Youth Tech Ultimate Pro Laptop",
          description: "Unleash extreme power with the flagship Youth Tech Ultimate Pro Laptop. Tailored for software devs, designers, and hardcore gamers, it brings raw horsepower paired with a magnificent high-refresh liquid display.",
          category: "Laptops",
          brand: "YouthTech",
          price: 145000,
          discountPrice: 135000,
          rating: 4.8,
          reviewsCount: 3,
          stock: 12,
          images: [
            "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600"
          ],
          specs: {
            Processor: "Intel Core i9 14th Gen (14900HX)",
            RAM: "32GB DDR5 dual-channel",
            Storage: "1TB PCIe Gen4 NVMe SSD",
            Graphics: "NVIDIA GeForce RTX 4070 (8GB GDDR6)",
            Display: "16-inch QHD+ 240Hz IPS Display"
          },
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: true
        },
        {
          id: "prod_2",
          name: "Nebula Gaming Smartphone 5G",
          description: "Dominating the mobile battlegrounds, the Nebula Gaming Smartphone features a revolutionary active liquid cooling setup, blazing fast SoC, and unmatched refresh rates.",
          category: "Smartphones",
          brand: "Nebula",
          price: 85000,
          discountPrice: 79999,
          rating: 4.7,
          reviewsCount: 2,
          stock: 15,
          images: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600"
          ],
          specs: {
            Processor: "Snapdragon 8 Gen 3 (4nm)",
            RAM: "16GB LPDDR5X",
            Storage: "512GB UFS 4.0",
            Display: "6.78-inch 144Hz HDR10+ AMOLED",
            Battery: "6000mAh with 120W HyperCharge"
          },
          isFeatured: true,
          isNewArrival: true,
          isBestSeller: false
        },
        {
          id: "prod_3",
          name: "AcousticNoise Pro Wireless ANC Headphones",
          description: "Immerse yourself completely in rich, high-fidelity audio with hybrid Adaptive Noise Cancelling. Engineered for long listening comfort and flawless acoustics.",
          category: "Audio",
          brand: "SoundWave",
          price: 15500,
          discountPrice: 12499,
          rating: 4.5,
          reviewsCount: 1,
          stock: 22,
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"
          ],
          specs: {
            Type: "Over-Ear Wireless",
            Connectivity: "Bluetooth 5.2 / AAC / aptX Adaptive",
            Battery: "Up to 40 Hours (ANC On)",
            Drivers: "40mm Bio-Cellulose Drivers",
            Charging: "USB-C Quick Charge (10 min = 5 hours)"
          },
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: true
        },
        {
          id: "prod_4",
          name: "Zeta Smart Watch Series X",
          description: "A gorgeous luxury aesthetics merged with high-precision biometric tracking sensors to empower your active lifestyle and monitor your health around the clock.",
          category: "Wearables",
          brand: "Zeta",
          price: 8500,
          rating: 4.2,
          reviewsCount: 1,
          stock: 4,
          images: [
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600"
          ],
          specs: {
            Display: "1.9-inch Curved Ultra AMOLED (Always-On)",
            Sensors: "Continuous Heart Rate, SpO2 Blood Oxygen, Sleep, ECG Widget",
            "Water Resistance": "IP68 & 5ATM swim-proof",
            Battery: "Up to 10 Days Battery Endurance"
          },
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false
        },
        {
          id: "prod_5",
          name: "SuperVision Ultra HD IPS 4K Monitor",
          description: "Designed for content creators and graphic designers, the SuperVision Monitor delivers perfect color precision with wide dynamic viewing ratios.",
          category: "Monitors",
          brand: "ViewPro",
          price: 34000,
          rating: 4.6,
          reviewsCount: 0,
          stock: 8,
          images: [
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600"
          ],
          specs: {
            Resolution: "4K (3840 x 2160) UHD Panel",
            PanelType: "IPS Wide-Angle View",
            ColorAccuracy: "99% sRGB, 95% DCI-P3 calibrated",
            Inputs: "2x HDMI, 1x DisplayPort, 1x USB-C (65W Power Delivery)"
          },
          isFeatured: true,
          isNewArrival: false,
          isBestSeller: false
        },
        {
          id: "prod_6",
          name: "SmartGlow RGB Smart Bulbs Kit",
          description: "Transform your home lighting with millions of customizable colors. Integrate with Apple HomeKit, Google Assistant, or Alexa with no additional hub required.",
          category: "Smart Home",
          brand: "GlowTech",
          price: 4500,
          discountPrice: 3999,
          rating: 4.4,
          reviewsCount: 1,
          stock: 25,
          images: [
            "https://images.unsplash.com/photo-1550525255-cc1c76d936db?auto=format&fit=crop&q=80&w=600"
          ],
          specs: {
            Brightness: "850 Lumens (equivalent to 60W)",
            BaseType: "E27 Screw Fitting",
            Protocol: "Wi-Fi 2.4GHz & Bluetooth Direct",
            Lifespan: "25,000 Rated Hours"
          },
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false
        }
      ],
      reviews: [
        {
          id: "rev_1",
          productId: "prod_1",
          userEmail: "customer@gmail.com",
          userName: "Anish Shrestha",
          rating: 5,
          comment: "Absolute beast of a machine! Builds my Node APIs within seconds, compiles standard React SPAs instantly. Screen is smooth as butter.",
          isApproved: true,
          createdAt: "2026-05-20T12:00:00Z"
        },
        {
          id: "rev_2",
          productId: "prod_1",
          userEmail: "baijusudarshan@gmail.com",
          userName: "Sudarshan Baiju",
          rating: 5,
          comment: "Top notch design. The premium dark tactile aluminum casing is sturdy. Playing titles in ultra is flawless.",
          isApproved: true,
          createdAt: "2026-05-18T10:30:00Z"
        },
        {
          id: "rev_3",
          productId: "prod_1",
          userEmail: "tester@gmail.com",
          userName: "Aayush Adhikari",
          rating: 4,
          comment: "Incredible specs and power, though does run a bit warm during intensive stress tasks. Worth every single rupee.",
          isApproved: true,
          createdAt: "2026-05-15T08:15:00Z"
        },
        {
          id: "rev_4",
          productId: "prod_2",
          userEmail: "customer@gmail.com",
          userName: "Anish Shrestha",
          rating: 5,
          comment: "This gaming phone has no competition. Performance is ridiculously clean. Liquid cooling system prevents thermal throttling perfectly.",
          isApproved: true,
          createdAt: "2026-05-19T14:22:00Z"
        },
        {
          id: "rev_5",
          productId: "prod_2",
          userEmail: "testadmin@gmail.com",
          userName: "Sunil Karki",
          rating: 4,
          comment: "Fast charging takes under 25 mins. Audio from stereo speaker is very rich.",
          isApproved: true,
          createdAt: "2026-05-21T11:00:00Z"
        },
        {
          id: "rev_6",
          productId: "prod_3",
          userEmail: "customer@gmail.com",
          userName: "Anish Shrestha",
          rating: 5,
          comment: "ANC blocks the noisy street traffic completely. Battery life seems infinite.",
          isApproved: true,
          createdAt: "2026-05-10T09:00:00Z"
        },
        {
          id: "rev_7",
          productId: "prod_4",
          userEmail: "guest@gmail.com",
          userName: "Priya Poudel",
          rating: 4,
          comment: "Beautiful Amoled screen! Sleep tracking matches my fitbit and notifications are instant.",
          isApproved: true,
          createdAt: "2026-05-09T18:40:00Z"
        },
        {
          id: "rev_8",
          productId: "prod_6",
          userEmail: "client@gmail.com",
          userName: "Sujit Maharjan",
          rating: 4,
          comment: "Sets the vibe perfect. Integration with Google Assistant works flawlessly.",
          isApproved: true,
          createdAt: "2026-05-22T04:10:00Z"
        }
      ],
      users: [
        {
          email: "baijusudarshan@gmail.com",
          userName: "Sudarshan Baiju",
          role: "admin",
          password: "adminpassword", // In production we encrypt: using simple token lookup
          joinedAt: "2026-05-01T00:00:00Z",
          addresses: [
            {
              id: "addr_1",
              name: "Sudarshan Baiju",
              phone: "9841234567",
              addressLine: "Kupondole Height, Ward-1",
              city: "Lalitpur",
              province: "Bagmati",
              isDefault: true
            }
          ],
          wishlist: ["prod_1", "prod_5"],
          cart: []
        },
        {
          email: "admin@youthtech.com",
          userName: "Youth Tech Admin",
          role: "admin",
          password: "adminpassword",
          joinedAt: "2026-05-02T00:00:00Z",
          addresses: [],
          wishlist: [],
          cart: []
        },
        {
          email: "customer@gmail.com",
          userName: "Anish Shrestha",
          role: "customer",
          password: "password123",
          joinedAt: "2026-05-10T12:00:00Z",
          addresses: [
            {
              id: "addr_2",
              name: "Anish Shrestha",
              phone: "9851122334",
              addressLine: "New Baneshwor, near Parliament building",
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
        }
      ],
      orders: [
        {
          id: "ORD_9104",
          userEmail: "customer@gmail.com",
          shippingInfo: {
            name: "Anish Shrestha",
            phone: "9851122334",
            address: "New Baneshwor, near Parliament building",
            city: "Kathmandu",
            province: "Bagmati"
          },
          billingInfo: {
            name: "Anish Shrestha",
            phone: "9851122334",
            address: "New Baneshwor, near Parliament building",
            city: "Kathmandu",
            province: "Bagmati"
          },
          items: [
            {
              productId: "prod_1",
              name: "Youth Tech Ultimate Pro Laptop",
              price: 145000,
              discountPrice: 135000,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600"
            }
          ],
          subtotal: 135000,
          discount: 10000,
          shippingFee: 150,
          finalTotal: 125150,
          paymentMethod: "eSewa",
          paymentStatus: "Paid",
          orderStatus: "Delivered",
          couponCode: "YOUTHTECH10",
          createdAt: "2026-05-18T14:40:00Z"
        },
        {
          id: "ORD_6441",
          userEmail: "customer@gmail.com",
          shippingInfo: {
            name: "Anish Shrestha",
            phone: "9851122334",
            address: "New Baneshwor, near Parliament building",
            city: "Kathmandu",
            province: "Bagmati"
          },
          billingInfo: {
            name: "Anish Shrestha",
            phone: "9851122334",
            address: "New Baneshwor, near Parliament building",
            city: "Kathmandu",
            province: "Bagmati"
          },
          items: [
            {
              productId: "prod_4",
              name: "Zeta Smart Watch Series X",
              price: 8500,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600"
            }
          ],
          subtotal: 8500,
          discount: 0,
          shippingFee: 150,
          finalTotal: 8650,
          paymentMethod: "Cash on Delivery",
          paymentStatus: "Pending",
          orderStatus: "Confirmed",
          createdAt: "2026-05-20T09:12:00Z"
        }
      ],
      coupons: [
        {
          id: "coup_1",
          code: "YOUTHTECH10",
          discountType: "percent",
          value: 10,
          minPurchase: 5000,
          expiryDate: "2027-12-31T23:59:59Z",
          active: true
        },
        {
          id: "coup_2",
          code: "FESTIVE2500",
          discountType: "fixed",
          value: 2500,
          minPurchase: 30000,
          expiryDate: "2026-11-25T23:59:59Z",
          active: true
        }
      ],
      banners: [
        {
          id: "ban_1",
          title: "Premium Electronics Sale!",
          subtitle: "Get exclusive discounts up to 15% on high performance Laptops and Devices at Youth Tech.",
          imageUrl: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=1200",
          link: "Laptops",
          active: true
        },
        {
          id: "ban_2",
          title: "Unrivaled Audio Experiences",
          subtitle: "Save BIG on Wireless Noise Cancelling Over-Ear Headsets, Earbuds and Smart Controls.",
          imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=1200",
          link: "Audio",
          active: true
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  try {
    const rawData = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (err) {
    // If corrupt, recreate
    console.error("Database corrupt, recreating...", err);
    fs.unlinkSync(DB_PATH);
    return getDb();
  }
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write to database file", err);
  }
}

// Initializing Database
getDb();

// Setup Gemini Client if Key exists
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Successfully initialized server-side Gemini AI Shopping Assistant.");
  } catch (err) {
    console.error("Failed to initialize server-side Gemini Client", err);
  }
}

// Ensure JWT or Session middleware - we will use custom light headers
// API Endpoints:

// 1. PRODUCTS
app.get("/api/products", (req, res) => {
  const db = getDb();
  let results = [...db.products];
  const { search, category, brand, priceMin, priceMax, sort } = req.query;

  if (search) {
    const query = (search as string).toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }

  if (category) {
    const cat = (category as string).toLowerCase();
    results = results.filter((p) => p.category.toLowerCase() === cat);
  }

  if (brand) {
    const brnd = (brand as string).toLowerCase();
    results = results.filter((p) => p.brand.toLowerCase() === brnd);
  }

  if (priceMin) {
    const priceLimit = parseFloat(priceMin as string);
    results = results.filter((p) => (p.discountPrice || p.price) >= priceLimit);
  }

  if (priceMax) {
    const priceLimit = parseFloat(priceMax as string);
    results = results.filter((p) => (p.discountPrice || p.price) <= priceLimit);
  }

  if (sort) {
    switch (sort as string) {
      case "priceAsc":
        results.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case "priceDesc":
        results.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case "popular":
        results.sort((a, b) => b.rating - a.rating);
        break;
      case "latest":
      default:
        results.sort((a, b) => (a.isNewArrival ? -1 : 1));
        break;
    }
  }

  res.json(results);
});

app.get("/api/products/:id", (req, res) => {
  const db = getDb();
  const product = db.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

app.post("/api/products", (req, res) => {
  const db = getDb();
  const newProduct = {
    id: "prod_" + Date.now(),
    name: req.body.name || "Unnamed Product",
    description: req.body.description || "",
    category: req.body.category || "General",
    brand: req.body.brand || "Generic",
    price: parseFloat(req.body.price) || 0,
    discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : undefined,
    rating: 5.0,
    reviewsCount: 0,
    stock: parseInt(req.body.stock) || 0,
    images: req.body.images && req.body.images.length > 0 ? req.body.images : ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600"],
    specs: req.body.specs || {},
    isFeatured: !!req.body.isFeatured,
    isNewArrival: !!req.body.isNewArrival,
    isBestSeller: !!req.body.isBestSeller,
  };

  db.products.push(newProduct);
  saveDb(db);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = getDb();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.products[index] = {
    ...db.products[index],
    name: req.body.name ?? db.products[index].name,
    description: req.body.description ?? db.products[index].description,
    category: req.body.category ?? db.products[index].category,
    brand: req.body.brand ?? db.products[index].brand,
    price: req.body.price ? parseFloat(req.body.price) : db.products[index].price,
    discountPrice: req.body.discountPrice ? parseFloat(req.body.discountPrice) : undefined,
    stock: req.body.stock !== undefined ? parseInt(req.body.stock) : db.products[index].stock,
    images: req.body.images ?? db.products[index].images,
    specs: req.body.specs ?? db.products[index].specs,
    isFeatured: req.body.isFeatured !== undefined ? !!req.body.isFeatured : db.products[index].isFeatured,
    isNewArrival: req.body.isNewArrival !== undefined ? !!req.body.isNewArrival : db.products[index].isNewArrival,
    isBestSeller: req.body.isBestSeller !== undefined ? !!req.body.isBestSeller : db.products[index].isBestSeller,
  };

  saveDb(db);
  res.json(db.products[index]);
});

app.delete("/api/products/:id", (req, res) => {
  const db = getDb();
  const index = db.products.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  db.products.splice(index, 1);
  saveDb(db);
  res.json({ success: true });
});

// Categories & Brands list
app.get("/api/categories", (req, res) => {
  const db = getDb();
  const categories = Array.from(new Set(db.products.map((p) => p.category)));
  res.json(categories);
});

app.get("/api/brands", (req, res) => {
  const db = getDb();
  const brands = Array.from(new Set(db.products.map((p) => p.brand)));
  res.json(brands);
});

// 2. REVIEWS
app.get("/api/reviews", (req, res) => {
  const db = getDb();
  const { productId, requireApproval } = req.query;
  let list = db.reviews;

  if (productId) {
    list = list.filter((r) => r.productId === productId);
  }
  if (requireApproval === "true") {
    // Return all reviews so Admin can approve/delete
  } else {
    // Customer profile only sees approved
    list = list.filter((r) => r.isApproved);
  }

  res.json(list);
});

app.post("/api/reviews", (req, res) => {
  const db = getDb();
  const { productId, userEmail, userName, rating, comment } = req.body;
  if (!productId || !userEmail) {
    return res.status(400).json({ error: "Missing required fields for comments" });
  }

  const newReview = {
    id: "rev_" + Date.now(),
    productId,
    userEmail,
    userName: userName || userEmail.split("@")[0],
    rating: parseFloat(rating) || 5,
    comment: comment || "",
    isApproved: false, // Mandated to be approved by administrator in user flow
    createdAt: new Date().toISOString()
  };

  db.reviews.push(newReview);
  saveDb(db);
  res.status(201).json(newReview);
});

app.post("/api/reviews/:id/approve", (req, res) => {
  const db = getDb();
  const review = db.reviews.find((r) => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }
  review.isApproved = true;

  // Recalculate product rating
  const pReviews = db.reviews.filter((r) => r.productId === review.productId && r.isApproved);
  const totalRating = pReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = pReviews.length > 0 ? parseFloat((totalRating / pReviews.length).toFixed(1)) : 5.0;

  const product = db.products.find((p) => p.id === review.productId);
  if (product) {
    product.rating = avgRating;
    product.reviewsCount = pReviews.length;
  }

  saveDb(db);
  res.json({ success: true, review });
});

app.delete("/api/reviews/:id", (req, res) => {
  const db = getDb();
  const index = db.reviews.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }
  const review = db.reviews[index];
  db.reviews.splice(index, 1);

  // Recalculate rating
  const pReviews = db.reviews.filter((r) => r.productId === review.productId && r.isApproved);
  const totalRating = pReviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = pReviews.length > 0 ? parseFloat((totalRating / pReviews.length).toFixed(1)) : 5.0;

  const product = db.products.find((p) => p.id === review.productId);
  if (product) {
    product.rating = avgRating;
    product.reviewsCount = pReviews.length;
  }

  saveDb(db);
  res.json({ success: true });
});

// 3. AUTHENTICATION (Simulated full sign-in / registration state)
app.post("/api/auth/register", (req, res) => {
  const db = getDb();
  const { email, password, userName, role, uid } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    // If user already exists locally, update their details (sync uid) and proceed
    const isUserAdminUid = uid === "VELm81bBVdRTpoxzETw4whzuo9C3" || email.toLowerCase() === "baijusudarshan@gmail.com" || email.toLowerCase() === "admin@youthtech.com";
    existingUser.uid = uid || existingUser.uid;
    if (isUserAdminUid) {
      existingUser.role = "admin";
    }
    saveDb(db);
    const { password: _, ...userNoPwd } = existingUser;
    return res.status(200).json(userNoPwd);
  }

  const isUserAdminUid = uid === "VELm81bBVdRTpoxzETw4whzuo9C3" || email.toLowerCase() === "baijusudarshan@gmail.com" || email.toLowerCase() === "admin@youthtech.com";
  const newUser = {
    uid: uid || "",
    email: email.toLowerCase(),
    userName: userName || email.split("@")[0],
    role: isUserAdminUid ? "admin" : (role || "customer"),
    password: password,
    joinedAt: new Date().toISOString(),
    addresses: [],
    wishlist: [],
    cart: []
  };

  db.users.push(newUser);
  saveDb(db);

  // Exclude password in response
  const { password: _, ...userNoPwd } = newUser;
  res.status(201).json(userNoPwd);
});

app.post("/api/auth/login", (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or matching password credentials" });
  }

  const { password: _, ...userNoPwd } = user;
  res.json(userNoPwd);
});

app.get("/api/auth/profile", (req, res) => {
  const db = getDb();
  const email = req.query.email as string;
  const uid = req.query.uid as string;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() || (uid && u.uid === uid));
  if (!user) {
    return res.status(404).json({ error: "Profile not found" });
  }
  const isUserAdminUid = uid === "VELm81bBVdRTpoxzETw4whzuo9C3" || user.uid === "VELm81bBVdRTpoxzETw4whzuo9C3" || email.toLowerCase() === "baijusudarshan@gmail.com" || email.toLowerCase() === "admin@youthtech.com";
  if (isUserAdminUid) {
    user.role = "admin";
  }
  const { password: _, ...userNoPwd } = user;
  res.json(userNoPwd);
});

app.post("/api/auth/update-profile", (req, res) => {
  const db = getDb();
  const { email, userName, addresses, wishlist, cart } = req.body;
  const userIndex = db.users.findIndex((u) => u.email.toLowerCase() === email?.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: "Profile not found" });
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    userName: userName ?? db.users[userIndex].userName,
    addresses: addresses ?? db.users[userIndex].addresses,
    wishlist: wishlist ?? db.users[userIndex].wishlist,
    cart: cart ?? db.users[userIndex].cart,
  };

  saveDb(db);
  const { password: _, ...userNoPwd } = db.users[userIndex];
  res.json(userNoPwd);
});

// 4. COUPONS
app.get("/api/coupons", (req, res) => {
  const db = getDb();
  res.json(db.coupons);
});

app.get("/api/coupons/validate", (req, res) => {
  const db = getDb();
  const { code, subtotal } = req.query;
  if (!code) {
    return res.status(400).json({ error: "No discount coupon requested" });
  }

  const coupon = db.coupons.find((c) => c.code.toUpperCase() === (code as string).toUpperCase() && c.active);
  if (!coupon) {
    return res.status(400).json({ error: "Invalid coupon code, or coupon expired" });
  }

  const minAmt = coupon.minPurchase || 0;
  const currentSubtotal = parseFloat(subtotal as string) || 0;

  if (currentSubtotal < minAmt) {
    return res.status(400).json({ error: `At least Rs. ${minAmt} is required to apply code ${coupon.code}` });
  }

  res.json(coupon);
});

app.post("/api/coupons", (req, res) => {
  const db = getDb();
  const newCoupon = {
    id: "coup_" + Date.now(),
    code: (req.body.code as string).toUpperCase(),
    discountType: req.body.discountType || "percent",
    value: parseFloat(req.body.value) || 0,
    minPurchase: parseFloat(req.body.minPurchase) || 0,
    expiryDate: req.body.expiryDate || "2027-12-31T23:59:59Z",
    active: req.body.active !== undefined ? !!req.body.active : true
  };

  db.coupons.push(newCoupon);
  saveDb(db);
  res.status(201).json(newCoupon);
});

app.put("/api/coupons/:id", (req, res) => {
  const db = getDb();
  const index = db.coupons.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Coupon not found" });
  }

  db.coupons[index] = {
    ...db.coupons[index],
    code: req.body.code ? (req.body.code as string).toUpperCase() : db.coupons[index].code,
    discountType: req.body.discountType ?? db.coupons[index].discountType,
    value: req.body.value !== undefined ? parseFloat(req.body.value) : db.coupons[index].value,
    minPurchase: req.body.minPurchase !== undefined ? parseFloat(req.body.minPurchase) : db.coupons[index].minPurchase,
    expiryDate: req.body.expiryDate ?? db.coupons[index].expiryDate,
    active: req.body.active !== undefined ? !!req.body.active : db.coupons[index].active
  };

  saveDb(db);
  res.json(db.coupons[index]);
});

app.delete("/api/coupons/:id", (req, res) => {
  const db = getDb();
  const index = db.coupons.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Coupon not found" });
  }
  db.coupons.splice(index, 1);
  saveDb(db);
  res.json({ success: true });
});

// 5. BANNERS
app.get("/api/banners", (req, res) => {
  const db = getDb();
  res.json(db.banners);
});

app.put("/api/banners", (req, res) => {
  const db = getDb();
  // Simply replaces/updates homepage banners
  if (Array.isArray(req.body)) {
    db.banners = req.body;
    saveDb(db);
  }
  res.json(db.banners);
});

// 6. ORDERS
app.get("/api/orders", (req, res) => {
  const db = getDb();
  const { email } = req.query;
  if (email) {
    const list = db.orders.filter((o) => o.userEmail.toLowerCase() === (email as string).toLowerCase());
    return res.json(list);
  }
  // Admin sees all
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const db = getDb();
  const {
    userEmail,
    shippingInfo,
    billingInfo,
    items,
    paymentMethod,
    couponCode
  } = req.body;

  if (!userEmail || !items || items.length === 0) {
    return res.status(400).json({ error: "Missing required checkout parameters" });
  }

  // Validate Stock, decrement quantities
  let subtotal = 0;
  for (const item of items) {
    const p = db.products.find((prod) => prod.id === item.productId);
    if (!p) {
      return res.status(400).json({ error: `Product ${item.name} not found in inventory` });
    }
    if (p.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient inventory for ${p.name}. Only ${p.stock} units left.` });
    }
    const rate = p.discountPrice || p.price;
    subtotal += rate * item.quantity;
  }

  // Calculate discount
  let discount = 0;
  if (couponCode) {
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (coupon && subtotal >= (coupon.minPurchase || 0)) {
      if (coupon.discountType === "percent") {
        discount = Math.round((subtotal * coupon.value) / 100);
      } else {
        discount = coupon.value;
      }
    }
  }

  // Stock depletion
  for (const item of items) {
    const p = db.products.find((prod) => prod.id === item.productId);
    if (p) {
      p.stock -= item.quantity;
    }
  }

  const shippingFee = subtotal > 15000 ? 0 : 150; // free standard shipping above 15000
  const finalTotal = subtotal - discount + shippingFee;

  // Generate simulated transaction/verification URL for Nepali e-wallets
  const generatedId = "ORD_" + Math.floor(1000 + Math.random() * 9000);
  const paymentStatus = paymentMethod === "Cash on Delivery" ? "Pending" : "Paid"; // immediately simulate paid for simplicity/flow tests

  const newOrder = {
    id: generatedId,
    userEmail,
    shippingInfo,
    billingInfo: billingInfo || shippingInfo,
    items,
    subtotal,
    discount,
    shippingFee,
    finalTotal,
    paymentMethod,
    paymentStatus,
    orderStatus: "Pending",
    couponCode,
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);
  saveDb(db);
  res.status(201).json(newOrder);
});

app.put("/api/orders/:id/status", (req, res) => {
  const db = getDb();
  const { orderStatus, paymentStatus } = req.body;
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  saveDb(db);
  res.json(order);
});

// 7. ADMIN DASHBOARD STATS
app.get("/api/stats", (req, res) => {
  const db = getDb();
  const totalSales = db.orders.reduce((sum, o) => sum + o.finalTotal, 0);
  const totalOrders = db.orders.length;
  const totalCustomers = db.users.filter((u) => u.role === "customer").length;

  // Stock alerts (less than 5 units left)
  const lowStockAlerts = db.products.filter((p) => p.stock < 5);

  // Group monthly revenue (simulated monthly distributions over the past 5 months helper)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIdx = new Date().getMonth();

  const monthlyRevData = [
    { name: months[(currentMonthIdx - 4 + 12) % 12], sales: Math.round(totalSales * 0.15), orders: Math.round(totalOrders * 0.15) },
    { name: months[(currentMonthIdx - 3 + 12) % 12], sales: Math.round(totalSales * 0.18), orders: Math.round(totalOrders * 0.20) },
    { name: months[(currentMonthIdx - 2 + 12) % 12], sales: Math.round(totalSales * 0.224), orders: Math.round(totalOrders * 0.20) },
    { name: months[(currentMonthIdx - 1 + 12) % 12], sales: Math.round(totalSales * 0.25), orders: Math.round(totalOrders * 0.22) },
    { name: months[currentMonthIdx], sales: Math.round(totalSales * 0.216), orders: Math.round(totalOrders * 0.23) }
  ];

  res.json({
    totalSales,
    totalOrders,
    totalCustomers,
    lowStockAlerts: lowStockAlerts.map((p) => ({ id: p.id, name: p.name, stock: p.stock })),
    monthlyRevData
  });
});

// 8. AI LIVE CHAT SUPPORT (GEMINI API WITH INVENTORY GROUNDING)
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Provide chat histories array" });
  }

  const userQuery = messages[messages.length - 1]?.text || "";
  const db = getDb();

  // Create a localized catalog context for grounding
  const catalogContext = db.products
    .map(
      (p) =>
        `- ID: ${p.id}, Name: ${p.name}, Brand: ${p.brand}, Category: ${p.category}, Price: Rs. ${p.price}${
          p.discountPrice ? ` (Discount Price: Rs. ${p.discountPrice})` : ""
        }, Stock Left: ${p.stock}, Specs: ${JSON.stringify(p.specs)}, Details: ${p.description}`
    )
    .join("\n");

  if (aiClient) {
    try {
      const promptText = `
You are the official supportive AI Shopping Assistant for "Youth Tech Online Shopping", a premium electronic retail website in Nepal.
Your goal is to politely assist customers, recommend specific products from the live catalog list provided below, and walk them through queries in both English and Nepali if desired (since the brand represents premium gadgets for youth in Nepal).

Rules:
1. Recommend ONLY the products existing in the store catalog below. Never invent other models.
2. If the user asks about laptops, smartphones, monitors, headphones, smart devices, quote their pricing in Nepali Rupees (Rs.).
3. Mention current stock values if they are low (e.g., less than 5 units) so they checkout fast!
4. Keep answers friendly, professional, brief, and highly helpful.

Store Live Catalog:
${catalogContext}

Recent chat messages user sent:
${messages.map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n")}

Respond to the last message as the AI Assistant:`;

      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptText
      });

      const responseText = response.text || "Pardon, I didn't catch that. Could you please repeat your electronic tech query?";
      return res.json({ botResponse: responseText });
    } catch (e) {
      console.error("Gemini runtime API execution error, falling back dynamically", e);
    }
  }

  // Fallback Rule-Based Bot if API Key is unavailable
  let reply = "Hello! I am your Youth Tech virtual assistant. How can I facilitate your shopping experience today? I can suggest premium Laptops, Gaming Smartphones, smart wearables, monitors or assist with order tracking.";
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes("laptop") || queryLower.includes("computer")) {
    const laptops = db.products.filter((p) => p.category.toLowerCase() === "laptops");
    reply = "We offer the premium " + laptops.map((l) => `${l.name} (Rs. ${l.discountPrice || l.price})`).join(" & ") + ". Would you like to check specifications or view details?";
  } else if (queryLower.includes("phone") || queryLower.includes("mobile") || queryLower.includes("smartphone")) {
    const phones = db.products.filter((p) => p.category.toLowerCase() === "smartphones");
    reply = "Our top model is the " + phones.map((ph) => `${ph.name} styled with 5G connectivity for Rs. ${ph.discountPrice || ph.price}`).join(", ") + ". Ready for eSewa/Khalti checkout!";
  } else if (queryLower.includes("nepali") || queryLower.includes("namaste")) {
    reply = "नमस्ते! Youth Tech Online Shopping मा तपाईंलाई स्वागत छ। हामीसँग उत्कृष्ट ल्यापटप, स्मार्टफोन, घडी तथा इलेक्ट्रोनिक्स छन्। हामी eSewa र Khalti भुक्तानी स्वीकार गर्छौं!";
  } else if (queryLower.includes("discount") || queryLower.includes("coupon") || queryLower.includes("offer")) {
    reply = "Absolutely! Apply code 'YOUTHTECH10' on checkout for a 10% discount on orders above Rs. 5000, or 'FESTIVE2500' for a flat Rs. 2500 discount on orders above Rs. 30000!";
  } else if (queryLower.includes("payment") || queryLower.includes("khalti") || queryLower.includes("esewa") || queryLower.includes("cod")) {
    reply = "We support instant online payments with Khalti, eSewa, and Cash on Delivery (COD) anywhere in Nepal with reliable tracking.";
  } else if (queryLower.includes("track") || queryLower.includes("order")) {
    reply = "You can easily track your shipments in your Customer Dashboard orders section! Simply click your account profile to review real-time delivery phases.";
  }

  res.json({ botResponse: reply });
});

// Serve frontend assets
if (process.env.NODE_ENV !== "production") {
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  })();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const serverInstance = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server successfully listening on http://0.0.0.0:${PORT}`);
});
