// products.js - BARİSHOP Ürün Verileri

const products = [
    {
        id: 1,
        name: "iPhone 14 Pro",
        originalPrice: 36999,
        discountPercent: 5,
        price: 34999,
        description: "Apple'ın en yeni flagship telefonu. Dynamic Island, 48MP kamera ve A16 Bionic çip.",
        category: "telefon",
        images: [
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-model-select-202209-6-1inch?wid=5120&hei=2880&fmt=jpeg&qlt=95&.v=1660753617533",
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=5120&hei=2880&fmt=jpeg&qlt=95&.v=1660753617533",
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-gold?wid=5120&hei=2880&fmt=jpeg&qlt=95&.v=1660753617533"
        ],
        code: "TS-IP14P",
        filters: {
            "Kapasite": ["128GB", "256GB", "512GB", "1TB"],
            "Renk": ["Deep Purple", "Gold", "Silver", "Space Black"]
        },
        views: 1500,
        sales: 200
    },
    {
        id: 2,
        name: "Samsung Galaxy S23",
        originalPrice: 26999,
        discountPercent: 7,
        price: 24999,
        description: "Samsung'un amiral gemisi telefonu. Snapdragon 8 Gen 2 ve 120Hz ekran.",
        category: "telefon",
        images: [
            "https://images.samsung.com/is/image/samsung/p6pim/tr/2302/gallery/tr-galaxy-s23-s918-sm-s918bzgdmid-thumb-534866569?$264_264_PNG$",
            "https://images.samsung.com/is/image/samsung/p6pim/tr/2302/gallery/tr-galaxy-s23-s918-sm-s918bzgdtur-thumb-534866541?$264_264_PNG$",
            "https://images.samsung.com/is/image/samsung/p6pim/tr/2302/gallery/tr-galaxy-s23-s918-sm-s918bzgttur-thumb-534866527?$264_264_PNG$"
        ],
        code: "TS-SGS23256",
        filters: {
            "Kapasite": ["256GB", "512GB"],
            "Renk": ["Phantom Black", "Cream", "Green", "Lavender"]
        },
        views: 1200,
        sales: 180
    },
    {
        id: 3,
        name: "MacBook Air M2 13\"",
        originalPrice: 31999,
        discountPercent: 6,
        price: 29999,
        description: "Apple M2 çipli ince ve hafif dizüstü bilgisayar. 18 saat pil ömrü.",
        category: "bilgisayar",
        images: [
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-space-gray-select-201810?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664472289661",
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-silver-select-201810?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664472289491",
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-gold-select-201810?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664472289606"
        ],
        code: "TS-MBA13M2",
        filters: {
            "Kapasite": ["256GB SSD", "512GB SSD", "1TB SSD"],
            "Renk": ["Space Gray", "Silver", "Gold", "Midnight"]
        },
        views: 900,
        sales: 150
    },
    {
        id: 4,
        name: "Sony WH-1000XM4 Kulaklık",
        originalPrice: 6499,
        discountPercent: 8,
        price: 5999,
        description: "Gürültü önleyici premium kulaklık. 30 saat pil ömrü ve dokunmatik kontrol.",
        category: "kulaklik",
        images: [
            "https://www.sony.com.tr/image/5c4d4b4e3b1a4c4e8a0a0a0a0a0a0a0a?fmt=pjpeg&wid=1000&hei=1000",
            "https://www.sony.com.tr/image/5c4d4b4e3b1a4c4e8a0a0a0a0a0a0a0b?fmt=pjpeg&wid=1000&hei=1000",
            "https://www.sony.com.tr/image/5c4d4b4e3b1a4c4e8a0a0a0a0a0a0a0c?fmt=pjpeg&wid=1000&hei=1000"
        ],
        code: "TS-SONYXM4",
        filters: {
            "Renk": ["Siyah", "Gümüş", "Platin"]
        },
        views: 800,
        sales: 120
    },
    {
        id: 5,
        name: "Apple Watch Series 8 45mm",
        originalPrice: 9499,
        discountPercent: 5,
        price: 8999,
        description: "Apple'ın en yeni akıllı saati. Kan oksijeni ölçümü ve sıcaklık sensörü.",
        category: "saat",
        images: [
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-series8-aluminum-midnight-nc-41mm_VW_PF_WF_SI?wid=1000&hei=1000&fmt=jpeg&qlt=90&.v=1660759963313",
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-series8-aluminum-starlight-nc-41mm_VW_PF_WF_SI?wid=1000&hei=1000&fmt=jpeg&qlt=90&.v=1660759963340",
            "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/watch-series8-aluminum-silver-nc-41mm_VW_PF_WF_SI?wid=1000&hei=1000&fmt=jpeg&qlt=90&.v=1660759963357"
        ],
        code: "TS-AWS845",
        filters: {
            "Kasa Boyutu": ["41mm", "45mm"],
            "Renk": ["Midnight", "Starlight", "Silver", "Product Red"],
            "Kordon": ["Spor Kordon", "Deri Kordon", "Milanese Loop"]
        },
        views: 700,
        sales: 100
    },
    {
        id: 6,
        name: "PlayStation 5 Standard",
        originalPrice: 15999,
        discountPercent: 6,
        price: 14999,
        description: "Sony'nin yeni nesil oyun konsolu. 4K gaming ve ultra hızlı SSD.",
        category: "konsol",
        images: [
            "https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$1600px--t$",
            "https://gmedia.playstation.com/is/image/SIEPDC/ps5-with-dualsense-front-product-thumbnail-01-en-14sep21?$1600px--t$",
            "https://gmedia.playstation.com/is/image/SIEPDC/ps5-with-dualsense-back-product-thumbnail-01-en-14sep21?$1600px--t$"
        ],
        code: "TS-PS5STD",
        filters: {
            "Model": ["Standard", "Digital Edition"],
            "Paket": ["Konsol Only", "Konsol + Oyun", "Konsol + Kumanda"]
        },
        views: 1100,
        sales: 160
    }
];
