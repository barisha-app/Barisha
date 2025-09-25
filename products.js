// products.js - CSV'den ürünleri okuyan akıllı dosya

let products = [];

// CSV'den ürünleri yükle (Excel'den okur gibi)
async function loadProductsFromCSV() {
    try {
        console.log('📦 Ürünler yükleniyor...');
        const response = await fetch('urunler.csv');
        const csvData = await response.text();
        products = parseCSV(csvData);
        console.log('✅ Ürünler yüklendi!', products.length + ' ürün bulundu');
    } catch (error) {
        console.error('❌ CSV yükleme hatası:', error);
        console.log('🔄 Varsayılan ürünler yükleniyor...');
        products = getDefaultProducts();
    }
}

// CSV'yi anlayıp JavaScript'e çevir
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    const urunListesi = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        // Tırnak içindeki virgülleri dikkate alma
        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const product = {};
        
        headers.forEach((header, index) => {
            let value = values[index] || '';
            value = value.replace(/^"|"$/g, ''); // Tırnakları temizle
            
            // Sayıları sayı yap
            if (['id', 'fiyat', 'orjinal_fiyat', 'indirim', 'stok'].includes(header)) {
                value = parseInt(value) || 0;
            }
            // Yıldızı ondalıklı sayı yap
            else if (header === 'yildiz') {
                value = parseFloat(value) || 0;
            }
            // Görselleri liste yap
            else if (header === 'gorseller') {
                value = value.split(',').map(img => img.trim()).filter(img => img);
            }
            // Özellikleri liste yap
            else if (header === 'ozellikler') {
                value = value.split(',').map(oz => oz.trim()).filter(oz => oz);
            }
            // Varyantları obje yap
            else if (header === 'varyantlar') {
                value = value.split(',').map(v => {
                    const parts = v.split('-');
                    return { 
                        varyant: parts[0] || 'Standart', 
                        renk: parts[1] || 'Siyah' 
                    };
                }).filter(v => v.varyant);
            }
            
            // Türkçe başlıkları İngilizce yap
            const englishHeader = {
                'id': 'id',
                'isim': 'name',
                'aciklama': 'description',
                'kategori': 'category',
                'fiyat': 'price',
                'orjinal_fiyat': 'originalPrice',
                'indirim': 'discountPercent',
                'yildiz': 'rating',
                'gorseller': 'images',
                'stok': 'stock',
                'kod': 'code',
                'ozellikler': 'features',
                'varyantlar': 'variants'
            }[header];
            
            if (englishHeader) {
                product[englishHeader] = value;
            }
        });
        
        if (product.id) {
            urunListesi.push(product);
        }
    }
    
    return urunListesi;
}

// İnternet çökerse diye yedek ürünler
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: "iPhone 14 Pro",
            description: "Apple'ın en yeni flagship telefonu",
            category: "telefon",
            price: 34999,
            originalPrice: 36999,
            discountPercent: 5,
            rating: 4.8,
            images: [
                "https://via.placeholder.com/400x300/333/fff?text=iPhone+14+Pro",
                "https://via.placeholder.com/400x300/666/fff?text=Arka+Taraf"
            ],
            stock: 50,
            code: "TS-IP14P",
            features: ["48MP Kamera", "Dynamic Island", "A16 Çip"],
            variants: [
                { varyant: "128GB", renk: "Siyah" },
                { varyant: "256GB", renk: "Mor" }
            ]
        }
    ];
}

// Yıldızları göster
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="bi-star-fill"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="bi-star-half"></i>';
        } else {
            stars += '<i class="bi-star"></i>';
        }
    }
    return `<div class="rating-stars">${stars}</div>`;
}
