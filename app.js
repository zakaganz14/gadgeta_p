// --- UTILITIES ---
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function showNotification(message, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    
    if (isError) {
        toast.classList.replace('bg-green-50', 'bg-red-50');
        toast.classList.replace('text-green-800', 'text-red-800');
        toast.classList.replace('border-green-200', 'border-red-200');
        document.getElementById('toast-icon').setAttribute('data-lucide', 'alert-circle');
    } else {
        toast.classList.replace('bg-red-50', 'bg-green-50');
        toast.classList.replace('text-red-800', 'text-green-800');
        toast.classList.replace('border-red-200', 'border-green-200');
        document.getElementById('toast-icon').setAttribute('data-lucide', 'check-circle-2');
    }
    lucide.createIcons();
    
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Initialize Filter Inputs with current month
function initFilters() {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('filter-month-dashboard').value = currentMonthStr;
    document.getElementById('filter-month-sales').value = currentMonthStr;
}

// --- NAVIGASI ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('bg-slate-100', 'text-slate-900');
        el.classList.add('text-slate-500');
    });
    
    document.getElementById(`view-${tabId}`).classList.add('active');
    const activeNav = document.getElementById(`nav-${tabId}`);
    activeNav.classList.add('bg-slate-100', 'text-slate-900');
    activeNav.classList.remove('text-slate-500');

    activeTab = tabId;
    updateAllViews();
}

// --- RENDER DASHBOARD ---
function updateDashboard() {
    const filterMonth = document.getElementById('filter-month-dashboard').value;
    
    const filteredSales = salesData.filter(sale => {
        if(!filterMonth) return true; 
        const saleDate = new Date(sale.date);
        const saleMonthStr = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        return saleMonthStr === filterMonth;
    });

    const uniqueModels = new Set(inventoryData.map(i => `${i.brand}-${i.model}`));
    const totalStock = inventoryData.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.price, 0);

    document.getElementById('label-terjual').innerText = filterMonth ? `HP Terjual (${filterMonth})` : 'HP Terjual (Total)';
    document.getElementById('label-pendapatan').innerText = filterMonth ? `Pendapatan (${filterMonth})` : 'Total Pendapatan';

    document.getElementById('dash-total-model').innerText = uniqueModels.size;
    document.getElementById('dash-total-stock').innerText = `${totalStock} Unit`;
    document.getElementById('dash-total-sold').innerText = `${filteredSales.length} Unit`;
    document.getElementById('dash-total-revenue').innerText = formatRupiah(totalRevenue);

    const tbody = document.getElementById('dash-recent-sales');
    if (filteredSales.length === 0) {
        tbody.innerHTML = `<tr><td colSpan="5" class="p-8 text-center text-slate-400">Tidak ada data penjualan pada bulan ini.</td></tr>`;
    } else {
        const recent = [...filteredSales].reverse().slice(0, 5); 
        tbody.innerHTML = recent.map(sale => `
            <tr class="border-b border-slate-50 hover:bg-slate-50/50">
                <td class="p-4">${new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td class="p-4 font-medium">${sale.brand} ${sale.model} <span class="text-slate-500 font-normal">(${sale.color || '-'})</span></td>
                <td class="p-4">
                    <span class="block text-slate-800 font-medium">${sale.customer}</span>
                    <span class="text-xs font-mono text-slate-500">${sale.imei}</span>
                </td>
                <td class="p-4 text-slate-600 font-medium">${sale.freelancer || 'Toko'}</td>
                <td class="p-4 text-right font-semibold text-emerald-600">${formatRupiah(sale.price)}</td>
            </tr>
        `).join('');
    }
}

// --- RENDER INVENTORY ---
function toggleInventoryForm(forceClose = false) {
    isInventoryFormOpen = forceClose ? false : !isInventoryFormOpen;
    const container = document.getElementById('inventory-form-container');
    const btnText = document.getElementById('text-toggle-form');
    const btnIcon = document.getElementById('icon-toggle-form');
    
    if (isInventoryFormOpen) {
        container.classList.remove('hidden');
        btnText.innerText = 'Batal';
        btnIcon.setAttribute('data-lucide', 'x');
    } else {
        container.classList.add('hidden');
        btnText.innerText = 'Tambah Stok/Produk';
        btnIcon.setAttribute('data-lucide', 'plus');
        resetInventoryForm();
    }
    lucide.createIcons();
}

function resetInventoryForm() {
    document.getElementById('invId').value = '';
    document.getElementById('invBrand').value = '';
    document.getElementById('invModel').value = '';
    document.getElementById('invColor').value = '';
    document.getElementById('invPrice').value = '';
    document.getElementById('invImeis').value = '';
    document.getElementById('inventory-form-title').innerText = 'Input Data Produk & IMEI';
    document.getElementById('btn-save-inv').innerText = 'Simpan Produk & IMEI';
}

function handleSaveInventory(e) {
    e.preventDefault();
    const id = document.getElementById('invId').value;
    const brand = document.getElementById('invBrand').value;
    const model = document.getElementById('invModel').value;
    const color = document.getElementById('invColor').value;
    const price = Number(document.getElementById('invPrice').value);
    const imeisInput = document.getElementById('invImeis').value;

    const imeiList = imeisInput.split(/[\n,]+/).map(i => i.trim()).filter(i => i !== '');

    if (imeiList.length === 0) {
        return showNotification('Minimal masukkan 1 Nomor IMEI!', true);
    }

    if (id) {
        const index = inventoryData.findIndex(i => i.id == id);
        if (index > -1) {
            inventoryData[index] = { ...inventoryData[index], brand, model, color, price, imei: imeiList[0] };
            for (let i = 1; i < imeiList.length; i++) {
                inventoryData.push({ id: Date.now() + i, brand, model, color, price, imei: imeiList[i] });
            }
            showNotification('Data produk berhasil diperbarui.');
        }
    } else {
        imeiList.forEach((imeiStr, i) => {
            inventoryData.push({ id: Date.now() + i, brand, model, color, price, imei: imeiStr });
        });
        showNotification(`${imeiList.length} unit IMEI berhasil ditambahkan terpisah.`);
    }

    toggleInventoryForm(true);
    updateAllViews();
}

function editInventory(id) {
    const item = inventoryData.find(i => i.id == id);
    if(!item) return;
    
    document.getElementById('invId').value = item.id;
    document.getElementById('invBrand').value = item.brand;
    document.getElementById('invModel').value = item.model;
    document.getElementById('invColor').value = item.color || '';
    document.getElementById('invPrice').value = item.price;
    document.getElementById('invImeis').value = item.imei;
    
    document.getElementById('inventory-form-title').innerText = 'Edit Data Produk';
    document.getElementById('btn-save-inv').innerText = 'Simpan Perubahan';
    
    if(!isInventoryFormOpen) toggleInventoryForm();
}

function deleteInventory(id) {
    if(confirm('Yakin ingin menghapus unit fisik HP dengan IMEI ini?')) {
        inventoryData = inventoryData.filter(i => i.id != id);
        showNotification('Data barang berhasil dihapus.');
        updateAllViews();
    }
}

function updateInventoryTable() {
    const tbody = document.getElementById('inventory-table-body');
    if (inventoryData.length === 0) {
        tbody.innerHTML = `<tr><td colSpan="4" class="p-8 text-center text-slate-400">Stok kosong.</td></tr>`;
        return;
    }

    tbody.innerHTML = inventoryData.map(item => `
        <tr class="border-b border-slate-50 hover:bg-slate-50/50">
            <td class="p-4">
                <span class="font-bold block text-slate-800">${item.model}</span>
                <span class="text-slate-500 text-xs">${item.brand} ${item.color ? `• ${item.color}` : ''}</span>
            </td>
            <td class="p-4 font-medium text-emerald-600">${formatRupiah(item.price)}</td>
            <td class="p-4">
                <span class="inline-flex items-center px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-mono font-semibold">
                    <i data-lucide="tag" class="w-3 h-3 mr-1.5 text-slate-400"></i>${item.imei}
                </span>
            </td>
            <td class="p-4 text-right align-middle whitespace-nowrap">
                <button onclick="editInventory(${item.id})" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex mr-1" title="Edit Unit"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                <button onclick="deleteInventory(${item.id})" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg inline-flex" title="Hapus Unit"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

// --- RENDER SALES / KASIR ---
function updateSalesFormDropdowns() {
    const modelSelect = document.getElementById('salesModel');
    
    const uniqueMap = new Map();
    inventoryData.forEach(item => {
        const key = `${item.brand}::${item.model}::${item.color}`;
        uniqueMap.set(key, { brand: item.brand, model: item.model, color: item.color });
    });
    
    let options = '<option value="">-- Cari Model HP --</option>';
    uniqueMap.forEach((val, key) => {
        options += `<option value="${key}">${val.brand} ${val.model} ${val.color ? `(${val.color})` : ''}</option>`;
    });
    if(inventoryData.length === 0) options += '<option value="" disabled>Semua stok habis!</option>';
    
    const currentVal = modelSelect.value;
    modelSelect.innerHTML = options;
    if(uniqueMap.has(currentVal)) modelSelect.value = currentVal;
    else { modelSelect.value = ''; handleModelChange(); }
}

function handleModelChange() {
    const modelKey = document.getElementById('salesModel').value;
    const imeiSelect = document.getElementById('salesImei');
    const priceInput = document.getElementById('salesPrice');
    const basePriceText = document.getElementById('salesBasePrice');
    const submitBtn = document.getElementById('btn-submit-sale');

    if (!modelKey) {
        imeiSelect.innerHTML = '<option value="">-- Pilih IMEI --</option>';
        imeiSelect.disabled = true;
        priceInput.value = '';
        priceInput.disabled = true;
        basePriceText.innerText = 'Harga Modal: -';
        submitBtn.disabled = true;
        return;
    }

    const [brand, model, color] = modelKey.split('::');
    const availableItems = inventoryData.filter(i => i.brand === brand && i.model === model && (i.color || '') === (color || ''));

    imeiSelect.disabled = false;
    imeiSelect.innerHTML = '<option value="">-- Pilih IMEI Fisik --</option>' + 
                           availableItems.map(item => `<option value="${item.id}">IMEI: ${item.imei} (Modal: ${formatRupiah(item.price)})</option>`).join('');
    
    priceInput.value = '';
    priceInput.disabled = true;
    basePriceText.innerText = 'Pilih IMEI terlebih dahulu';
    submitBtn.disabled = true;
}

function handleImeiChange() {
    const itemId = document.getElementById('salesImei').value;
    const priceInput = document.getElementById('salesPrice');
    const basePriceText = document.getElementById('salesBasePrice');
    const submitBtn = document.getElementById('btn-submit-sale');

    if(itemId) {
        const item = inventoryData.find(i => i.id == itemId);
        priceInput.value = item.price;
        priceInput.disabled = false;
        basePriceText.innerText = `Modal Dasar: ${formatRupiah(item.price)}`;
        submitBtn.disabled = false;
    } else {
        priceInput.value = '';
        priceInput.disabled = true;
        basePriceText.innerText = `Pilih IMEI terlebih dahulu`;
        submitBtn.disabled = true;
    }
}

function handleSearchImei() {
    const query = document.getElementById('searchImeiInput').value.trim();
    if(!query) {
        showNotification('Masukkan nomor IMEI terlebih dahulu', true);
        return;
    }

    const foundItem = inventoryData.find(i => i.imei === query);
    
    if(foundItem) {
        const modelKey = `${foundItem.brand}::${foundItem.model}::${foundItem.color}`;
        const modelSelect = document.getElementById('salesModel');
        modelSelect.value = modelKey;
        handleModelChange(); 
        
        const imeiSelect = document.getElementById('salesImei');
        imeiSelect.value = foundItem.id;
        handleImeiChange(); 
        
        showNotification('Produk ditemukan & dipilih otomatis!');
    } else {
        showNotification('Nomor IMEI tidak ditemukan di stok!', true);
    }
}

function handleProcessSale(e) {
    e.preventDefault();
    const modelKey = document.getElementById('salesModel').value;
    const itemId = document.getElementById('salesImei').value;
    const price = Number(document.getElementById('salesPrice').value);
    const freelancer = document.getElementById('salesFreelance').value.trim() || 'Toko';
    
    const customer = document.getElementById('salesCustomer').value.trim();
    const phone = document.getElementById('salesPhone').value.trim();
    const payment = document.getElementById('salesPayment').value;
    const chkU = document.getElementById('chkUnit').checked;

    if(!modelKey || !itemId || price <= 0 || !customer) return showNotification('Data penjualan tidak valid.', true);
    if(!chkU) return showNotification('Ceklis persiapan wajib dicentang!', true);

    const itemIndex = inventoryData.findIndex(i => i.id == itemId);
    if(itemIndex === -1) return;
    const item = inventoryData[itemIndex];

    const newSale = {
        id: Date.now(),
        brand: item.brand, model: item.model, color: item.color,
        basePrice: item.price, price: price, freelancer: freelancer,
        customer: customer, phone: phone, payment: payment,
        imei: item.imei, date: new Date().toISOString()
    };
    salesData.push(newSale);
    inventoryData.splice(itemIndex, 1);

    document.getElementById('searchImeiInput').value = '';
    document.getElementById('salesModel').value = '';
    document.getElementById('salesFreelance').value = '';
    document.getElementById('salesCustomer').value = '';
    document.getElementById('salesPhone').value = '';
    document.getElementById('chkUnit').checked = false;
    handleModelChange(); 

    showNotification('Penjualan diproses & mencetak Faktur...');
    updateAllViews();
    
    doPrintInvoice(newSale.id);
}

function updateSalesHistory() {
    const filterMonth = document.getElementById('filter-month-sales').value;
    
    const filteredSales = salesData.filter(sale => {
        if(!filterMonth) return true;
        const saleDate = new Date(sale.date);
        const saleMonthStr = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        return saleMonthStr === filterMonth;
    });

    document.getElementById('sales-count').innerText = `${filteredSales.length} Transaksi`;
    const tbody = document.getElementById('sales-table-body');
    
    if (filteredSales.length === 0) {
        tbody.innerHTML = `<tr><td colSpan="5" class="p-12 text-center text-slate-400">Belum ada riwayat penjualan pada bulan ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = [...filteredSales].reverse().map(sale => {
        const isMarkup = sale.price > sale.basePrice;
        const isDiscount = sale.price < sale.basePrice;
        let marginHtml = '';
        if(isMarkup || isDiscount) {
            marginHtml = `<div class="text-[10px] font-medium mt-1 ${isMarkup ? 'text-green-500' : 'text-rose-500'}">
                ${isMarkup ? '+' : ''}${formatRupiah(sale.price - sale.basePrice)} margin
            </div>`;
        }

        return `
        <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="p-4 text-slate-500 text-xs">${new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            <td class="p-4">
                <span class="font-semibold block text-slate-800">${sale.model}</span>
                <span class="text-xs text-slate-500 flex items-center mt-0.5">${sale.brand} ${sale.color ? `<span class="mx-1.5 w-1 h-1 bg-slate-300 rounded-full"></span> ${sale.color}` : ''}</span>
            </td>
            <td class="p-4">
                <div class="mb-1"><span class="font-medium text-slate-800">${sale.customer}</span> <span class="text-xs text-slate-500">(${sale.payment})</span></div>
                <span class="text-[10px] font-mono text-slate-500 border border-slate-200 bg-slate-50 px-1 py-0.5 rounded">IMEI: ${sale.imei}</span>
            </td>
            <td class="p-4 text-right">
                <div class="font-bold text-emerald-600">${formatRupiah(sale.price)}</div>
                ${marginHtml}
            </td>
            <td class="p-4 text-center align-middle">
                <button onclick="doPrintInvoice(${sale.id})" class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg inline-flex" title="Cetak Ulang Faktur">
                    <i data-lucide="printer" class="w-5 h-5"></i>
                </button>
            </td>
        </tr>
    `}).join('');
    lucide.createIcons();
}

function doPrintInvoice(saleId) {
    const sale = salesData.find(s => s.id == saleId);
    if(!sale) return;

    document.getElementById('print-customer').innerText = sale.customer || '-';
    document.getElementById('print-phone').innerText = sale.phone || '-';
    document.getElementById('print-date').innerText = new Date(sale.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const nominal = sale.price.toLocaleString('id-ID');

    document.getElementById('print-item-desc').innerHTML = `${sale.brand} ${sale.model} ${sale.color ? `<br><span class="text-xs font-normal text-slate-700">Warna: ${sale.color}</span>` : ''}`;
    document.getElementById('print-imei').innerText = sale.imei;
    document.getElementById('print-price').innerText = nominal;
    document.getElementById('print-total').innerText = nominal;
    
    document.getElementById('print-subtotal').innerText = nominal;

    if(sale.payment === 'Tunai') {
        document.getElementById('print-cash').innerText = nominal;
        document.getElementById('print-transfer').innerText = '-';
    } else {
        document.getElementById('print-cash').innerText = '-';
        document.getElementById('print-transfer').innerText = `Rp ${nominal}`;
    }

    setTimeout(() => { window.print(); }, 200);
}

function updateAllViews() {
    if(activeTab === 'dashboard') updateDashboard();
    if(activeTab === 'inventory') updateInventoryTable();
    if(activeTab === 'sales') {
        updateSalesFormDropdowns();
        updateSalesHistory();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initFilters();
    updateAllViews();