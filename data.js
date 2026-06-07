// --- DATA STATE (LOKAL) ---
let inventoryData = [
    { id: 1, brand: 'Apple', model: 'iPhone 15 Pro Max', color: 'Natural Titanium', price: 24999000, imei: '358910001000001' },
    { id: 2, brand: 'Apple', model: 'iPhone 15 Pro Max', color: 'Natural Titanium', price: 24999000, imei: '358910001000002' },
    { id: 3, brand: 'Samsung', model: 'Galaxy S24 Ultra', color: 'Titanium Black', price: 21999000, imei: '358920002000001' }
];

let salesData = [
    { id: 101, brand: 'Apple', model: 'iPhone 15 Pro Max', color: 'Natural Titanium', basePrice: 24999000, price: 25500000, imei: '358910001000000', freelancer: 'Budi', customer: 'Andi', phone: '08123456789', payment: 'Transfer', date: new Date().toISOString() }
];

let activeTab = 'dashboard';
let isInventoryFormOpen = false;