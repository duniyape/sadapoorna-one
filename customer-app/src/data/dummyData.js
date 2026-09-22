export const cxData = {
  profile: {
    name: 'Rahul Sharma',
    mobile: '7089449249',
    shopName: 'Sharma General Store',
    address: 'Shop No 14, Main Market, Andheri West, Mumbai',
    gstin: '27AABCS1429B1Z',
    joinedSince: '2023-01-15'
  },
  financials: {
    totalDue: 45500,
    daysOverdue: 12,
    creditLimit: 100000,
    availableCredit: 54500
  },
  payments: [
    { id: 'PAY-1001', date: '2026-09-15', amount: 15000, mode: 'UPI', status: 'SUCCESS' },
    { id: 'PAY-1000', date: '2026-09-01', amount: 25000, mode: 'Bank Transfer', status: 'SUCCESS' },
    { id: 'PAY-0999', date: '2026-08-15', amount: 20000, mode: 'Cash', status: 'SUCCESS' }
  ],
  orders: [
    { 
      id: 'ORD-5092', 
      date: '2026-09-18', 
      total: 12500, 
      status: 'OUT_FOR_DELIVERY',
      items: [
        { name: 'Sona Masoori Rice 25kg', qty: 2, price: 1500 },
        { name: 'Toor Dal Premium 1kg', qty: 50, price: 140 },
        { name: 'Refined Sunflower Oil 1L', qty: 20, price: 125 }
      ],
      tracker: [
        { status: 'PLACED', time: '2026-09-18 10:30 AM', completed: true },
        { status: 'PROCESSING', time: '2026-09-18 02:15 PM', completed: true },
        { status: 'OUT_FOR_DELIVERY', time: '2026-09-19 09:00 AM', completed: true },
        { status: 'DELIVERED', time: null, completed: false }
      ]
    },
    { 
      id: 'ORD-5011', 
      date: '2026-09-10', 
      total: 33000, 
      status: 'DELIVERED',
      items: [
        { name: 'Aashirvaad Atta 10kg', qty: 10, price: 450 },
        { name: 'Fortune Soyabean Oil 15L', qty: 15, price: 1800 },
        { name: 'Tata Salt 1kg', qty: 100, price: 24 }
      ],
      tracker: [
        { status: 'PLACED', time: '2026-09-10 09:15 AM', completed: true },
        { status: 'PROCESSING', time: '2026-09-10 11:30 AM', completed: true },
        { status: 'OUT_FOR_DELIVERY', time: '2026-09-11 08:45 AM', completed: true },
        { status: 'DELIVERED', time: '2026-09-11 02:30 PM', completed: true }
      ]
    }
  ],
  catalog: [
    { id: 'P-1', name: 'Sona Masoori Rice', category: 'Rice', variant: '25kg Bag', price: 1500, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-9', name: 'Basmati Rice Premium', category: 'Rice', variant: '5kg Bag', price: 650, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-2', name: 'Toor Dal Premium', category: 'Pulses', variant: '1kg Pouch', price: 140, image: 'https://images.unsplash.com/photo-1615486171448-4fd133d837cc?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-10', name: 'Moong Dal', category: 'Pulses', variant: '1kg Pouch', price: 110, image: 'https://images.unsplash.com/photo-1615486171448-4fd133d837cc?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-3', name: 'Refined Sunflower Oil', category: 'Edible Oils', variant: '1L Pouch', price: 125, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400&h=400', inStock: false },
    { id: 'P-11', name: 'Mustard Oil (Kachi Ghani)', category: 'Edible Oils', variant: '5L Can', price: 850, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-4', name: 'Aashirvaad Atta', category: 'Grains', variant: '10kg Bag', price: 450, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-12', name: 'Premium Wheat', category: 'Grains', variant: '50kg Sack', price: 1400, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-5', name: 'Tata Salt', category: 'Spices', variant: '1kg Pouch', price: 24, image: 'https://images.unsplash.com/photo-1626200925764-555e0c52bb85?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-13', name: 'Turmeric Powder', category: 'Spices', variant: '500g Box', price: 120, image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-14', name: 'Red Chilli Powder', category: 'Spices', variant: '500g Box', price: 180, image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-15', name: 'Premium Cashews', category: 'Dry Fruits', variant: '1kg Box', price: 850, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-16', name: 'California Almonds', category: 'Dry Fruits', variant: '1kg Box', price: 750, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-6', name: 'Madhur Sugar', category: 'More', variant: '5kg Bag', price: 210, image: 'https://images.unsplash.com/photo-1621245084949-6f17d337be3a?auto=format&fit=crop&q=80&w=400&h=400', inStock: false },
    { id: 'P-7', name: 'Maggi Noodles', category: 'More', variant: '140g Pack', price: 28, image: 'https://images.unsplash.com/photo-1612929633738-8fe01f7c885f?auto=format&fit=crop&q=80&w=400&h=400', inStock: true },
    { id: 'P-8', name: 'Brooke Bond Red Label', category: 'More', variant: '500g Box', price: 260, image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?auto=format&fit=crop&q=80&w=400&h=400', inStock: true }
  ],
  offerBanners: [
    {
      id: 'B-1',
      title: 'Monsoon Mega Sale',
      subtitle: 'Flat 15% OFF on Edible Oils',
      color: 'from-blue-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7ea5?auto=format&fit=crop&q=80&w=400&h=200'
    },
    {
      id: 'B-2',
      title: 'Wholesale Discount',
      subtitle: 'Buy 10+ Rice Bags, Get 1 Free',
      color: 'from-emerald-500 to-teal-600',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400&h=200'
    }
  ]
};
