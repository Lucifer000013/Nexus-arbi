/* ============================================================
   MAISON D'OR — данные каталога
   Демонстрационный (учебный) проект. Названия брендов приведены
   как культурная отсылка к сегментам люкс-моды; сайт не является
   официальным магазином и не аффилирован с реальными домами моды.
   ============================================================ */

const BRANDS = [
  {
    id: 'gucci',
    name: 'Gucci',
    tagline: 'Итальянский эксцентризм с 1921 года',
    desc: 'Максимализм, богатая фактура и смелые принты — Дом, который превращает провокацию в канон.',
    initial: 'G',
    accent: '#2f5233',
    accent2: '#c9a961',
    tier: 1.15
  },
  {
    id: 'prada',
    name: 'Prada',
    tagline: 'Миланский модернизм с 1913 года',
    desc: 'Интеллектуальный минимализм и инженерная точность кроя — эстетика без лишнего жеста.',
    initial: 'P',
    accent: '#0d1b2a',
    accent2: '#c9a961',
    tier: 1.1
  },
  {
    id: 'louis-vuitton',
    name: 'Louis Vuitton',
    tagline: 'Maison fondée en 1854',
    desc: 'Дорожная эстетика, монограмма и мастерство ателье — синоним французской роскоши.',
    initial: 'LV',
    accent: '#1a1310',
    accent2: '#c9a961',
    tier: 1.25
  },
  {
    id: 'balenciaga',
    name: 'Balenciaga',
    tagline: 'Радикальная кутюр-школа с 1917 года',
    desc: 'Архитектура формы и уличный радикализм — деконструкция как высшая точность.',
    initial: 'B',
    accent: '#111111',
    accent2: '#c9a961',
    tier: 0.95
  }
];

const GENDERS = [
  { id: 'men', label: 'Мужское', short: 'М' },
  { id: 'women', label: 'Женское', short: 'Ж' },
  { id: 'kids', label: 'Детское', short: 'Д' }
];

/* Категории и словари названий по каждому полу */
const CATALOG_SCHEMA = {
  men: {
    'Верхняя одежда': {
      names: ['Шерстяное пальто', 'Кожаная куртка байкер', 'Стёганый бомбер', 'Хлопковый тренч', 'Пуховик оверсайз', 'Двубортный плащ'],
      price: [230000, 620000], sizes: 'apparel'
    },
    'Костюмы': {
      names: ['Костюм-двойка шерстяной', 'Смокинг с шёлковыми лацканами', 'Костюм оверсайз в клетку', 'Костюм-тройка фланелевый'],
      price: [280000, 560000], sizes: 'apparel'
    },
    'Рубашки': {
      names: ['Рубашка из поплина', 'Оверсайз рубашка льняная', 'Рубашка с монограммой', 'Шёлковая рубашка с принтом'],
      price: [58000, 125000], sizes: 'apparel'
    },
    'Трикотаж': {
      names: ['Свитер из кашемира', 'Водолазка мериносовая', 'Джемпер с логотипом', 'Вязаный кардиган'],
      price: [85000, 190000], sizes: 'apparel'
    },
    'Джинсы': {
      names: ['Джинсы прямого кроя', 'Слим с эффектом потёртости', 'Джинсы карго', 'Окрашенные вручную джинсы'],
      price: [68000, 140000], sizes: 'apparel'
    },
    'Обувь': {
      names: ['Низкие кроссовки', 'Челси на молнии', 'Кожаные лоферы', 'Дерби на шнуровке'],
      price: [62000, 165000], sizes: 'shoesMen'
    },
    'Аксессуары': {
      names: ['Ремень с пряжкой-логотипом', 'Кожаный портфель', 'Шерстяной шарф', 'Кепка с вышивкой'],
      price: [28000, 210000], sizes: 'oneSize'
    }
  },
  women: {
    'Верхняя одежда': {
      names: ['Пальто оверсайз', 'Кожаная куртка косуха', 'Шуба из эко-меха', 'Приталенный тренч', 'Укороченный пуховик'],
      price: [240000, 640000], sizes: 'apparel'
    },
    'Платья': {
      names: ['Шёлковое платье-миди', 'Вечернее платье с вырезом', 'Платье-рубашка', 'Платье с драпировкой'],
      price: [190000, 480000], sizes: 'apparel'
    },
    'Юбки': {
      names: ['Юбка-карандаш', 'Плиссированная юбка миди', 'Кожаная мини-юбка', 'Юбка макси с разрезом'],
      price: [95000, 210000], sizes: 'apparel'
    },
    'Трикотаж': {
      names: ['Оверсайз свитер', 'Кашемировый кардиган', 'Водолазка тонкой вязки', 'Джемпер с люрексом'],
      price: [90000, 195000], sizes: 'apparel'
    },
    'Блузы': {
      names: ['Шёлковая блуза', 'Блуза с бантом', 'Оверсайз блуза льняная'],
      price: [72000, 150000], sizes: 'apparel'
    },
    'Обувь': {
      names: ['Туфли на каблуке', 'Ботильоны на платформе', 'Кожаные балетки', 'Высокие сапоги'],
      price: [68000, 175000], sizes: 'shoesWomen'
    },
    'Сумки': {
      names: ['Кожаный тоут', 'Вечерний клатч', 'Сумка через плечо с монограммой', 'Мини-рюкзак'],
      price: [160000, 520000], sizes: 'oneSize'
    },
    'Аксессуары': {
      names: ['Шёлковый платок', 'Солнцезащитные очки', 'Ремень с логотипом', 'Кожаные перчатки'],
      price: [32000, 220000], sizes: 'oneSize'
    }
  },
  kids: {
    'Верхняя одежда': {
      names: ['Стёганая куртка', 'Шерстяное пальто детское', 'Пуховик с капюшоном'],
      price: [95000, 190000], sizes: 'kids'
    },
    'Комплекты': {
      names: ['Спортивный комплект', 'Нарядный комплект', 'Хлопковый комбинезон'],
      price: [42000, 95000], sizes: 'kids'
    },
    'Футболки и худи': {
      names: ['Футболка с логотипом', 'Хлопковый лонгслив', 'Худи с принтом'],
      price: [21000, 48000], sizes: 'kids'
    },
    'Обувь': {
      names: ['Детские кроссовки', 'Кожаные сандалии', 'Утеплённые ботинки'],
      price: [32000, 65000], sizes: 'shoesKids'
    },
    'Аксессуары': {
      names: ['Кепка с вышивкой', 'Мини-рюкзак с монограммой', 'Шерстяная шапка'],
      price: [16000, 48000], sizes: 'oneSize'
    }
  }
};

const SIZE_SETS = {
  apparel: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoesMen: ['40', '41', '42', '43', '44', '45'],
  shoesWomen: ['35', '36', '37', '38', '39', '40'],
  shoesKids: ['28', '29', '30', '31', '32', '33', '34'],
  kids: ['2-3 года', '4-5 лет', '6-7 лет', '8-9 лет', '10-11 лет', '12-13 лет'],
  oneSize: ['One Size']
};

/* Простой детерминированный ГПСЧ, чтобы каталог был стабильным между перезагрузками */
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  let a = h >>> 0 || 1;
  return function () {
    a ^= a << 13; a >>>= 0;
    a ^= a >>> 17;
    a ^= a << 5; a >>>= 0;
    return (a >>> 0) / 4294967296;
  };
}

const STOCK_PHRASES = [
  'Осталось всего 2 экземпляра',
  'Осталось всего 3 экземпляра',
  'Ограниченная партия — 4 шт.',
  'Эксклюзивный выпуск капсулы',
  null, null, null // чаще без пометки дефицита
];

function buildCatalog() {
  const products = [];
  let uid = 1;

  BRANDS.forEach(brand => {
    GENDERS.forEach(gender => {
      const schema = CATALOG_SCHEMA[gender.id];
      Object.keys(schema).forEach(categoryName => {
        const cat = schema[categoryName];
        const rng = seededRandom(brand.id + '|' + gender.id + '|' + categoryName);
        const sizePool = SIZE_SETS[cat.sizes];

        cat.names.forEach((baseName, idx) => {
          const [lo, hi] = cat.price;
          const rawPrice = lo + rng() * (hi - lo);
          const price = Math.round((rawPrice * brand.tier) / 500) * 500;

          // случайный, но детерминированный набор доступных размеров (2/3 пула)
          const sizeCount = Math.max(2, Math.round(sizePool.length * (0.55 + rng() * 0.4)));
          const shuffled = [...sizePool].sort(() => rng() - 0.5);
          const sizes = sizePool.length <= 2 ? [...sizePool] : shuffled.slice(0, sizeCount).sort(
            (a, b) => sizePool.indexOf(a) - sizePool.indexOf(b)
          );

          const stockRoll = Math.floor(rng() * STOCK_PHRASES.length);
          const badge = STOCK_PHRASES[stockRoll];

          products.push({
            id: 'p' + (uid++),
            brandId: brand.id,
            genderId: gender.id,
            category: categoryName,
            name: baseName,
            price,
            sizes,
            badge,
            description: `${baseName} — эксклюзивная модель из линии ${brand.name} ${gender.label.toLowerCase()}. Категория «${categoryName.toLowerCase()}». Ручная отделка, ограниченный тираж, сертификат подлинности при заказе через личного шоппера.`
          });
        });
      });
    });
  });

  return products;
}

const PRODUCTS = buildCatalog();

function getBrand(id) {
  return BRANDS.find(b => b.id === id);
}

function getCategories(genderId) {
  return Object.keys(CATALOG_SCHEMA[genderId]);
}

function getProducts({ brandId, genderId, category }) {
  return PRODUCTS.filter(p =>
    (!brandId || p.brandId === brandId) &&
    (!genderId || p.genderId === genderId) &&
    (!category || p.category === category)
  );
}

function formatPrice(v) {
  return v.toLocaleString('ru-RU') + ' ₽';
}
