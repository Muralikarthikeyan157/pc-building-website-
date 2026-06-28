/**
 * PC Builder Pro - Product Database
 * Contains hundreds of sample PC components and peripherals
 */

const BRANDS = {
  cpu: ['Intel', 'AMD'],
  gpu: ['NVIDIA', 'AMD', 'Intel Arc'],
  mobo: ['ASUS', 'MSI', 'Gigabyte', 'ASRock'],
  ram: ['Corsair', 'Kingston', 'G.Skill', 'Crucial', 'ADATA', 'TeamGroup', 'Patriot'],
  storage: ['Samsung', 'WD', 'Crucial', 'ADATA', 'Kingston'],
  psu: ['Corsair', 'Seasonic', 'EVGA', 'Cooler Master', 'Antec', 'Montech'],
  case: ['NZXT', 'Lian Li', 'Fractal Design', 'Phanteks', 'Cooler Master', 'DeepCool', 'Antec'],
  cooler: ['Noctua', 'Cooler Master', 'DeepCool', 'NZXT', 'Corsair', 'be quiet!'],
  monitor: ['ASUS ROG', 'MSI', 'LG', 'Dell', 'Acer', 'BenQ', 'ViewSonic', 'AOC', 'Alienware'],
  peripheral: ['Logitech', 'Razer', 'SteelSeries', 'HyperX', 'Redragon', 'Corsair']
};

const SOCKETS = ['LGA1700', 'LGA1851', 'AM4', 'AM5', 'LGA1200'];
const CHIPSETS = {
  intel: ['Z790', 'B760', 'H770', 'Z890', 'B860', 'H810'],
  amd: ['X670E', 'B650E', 'B650', 'X870E', 'B850', 'A620']
};
const RAM_TYPES = ['DDR4', 'DDR5'];
const PCIE_VERSIONS = ['PCIe 3.0', 'PCIe 4.0', 'PCIe 5.0'];

/** Generate placeholder image as data URI */
function genImage(color, text) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:#0a0a12;stop-opacity:1"/>
    </linearGradient></defs>
    <rect width="400" height="300" fill="none"/>
    <text x="200" y="150" font-family="Arial,sans-serif" font-size="18" fill="#fff" text-anchor="middle" opacity="0.9">${text}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/** Base product factory */
function createProduct(base) {
  const product = {
    availability: true,
    rgb: false,
    warranty: '3 Years',
    rating: +(3.5 + Math.random() * 1.5).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 50,
    ...base
  };
  // Assign real product photo (CDN); overrides SVG placeholders
  product.image = resolveProductImage(product);
  return product;
}

/** Generate Intel CPUs */
function generateIntelCPUs() {
  const products = [];
  const series = [
    { name: 'Core i3', gens: ['14th Gen', '13th Gen', '12th Gen'], base: 8500, socket: 'LGA1700' },
    { name: 'Core i5', gens: ['14th Gen', '13th Gen', '12th Gen'], base: 15000, socket: 'LGA1700' },
    { name: 'Core i7', gens: ['14th Gen', '13th Gen'], base: 28000, socket: 'LGA1700' },
    { name: 'Core i9', gens: ['14th Gen', '13th Gen'], base: 45000, socket: 'LGA1700' },
    { name: 'Ultra 5', gens: ['Series 2', 'Series 1'], base: 22000, socket: 'LGA1851' },
    { name: 'Ultra 7', gens: ['Series 2', 'Series 1'], base: 35000, socket: 'LGA1851' },
    { name: 'Ultra 9', gens: ['Series 2', 'Series 1'], base: 55000, socket: 'LGA1851' },
    { name: 'Xeon', gens: ['W-2400', 'W-3400'], base: 65000, socket: 'LGA1700' }
  ];
  let id = 1;
  series.forEach(s => {
    s.gens.forEach((gen, gi) => {
      for (let m = 0; m < 3; m++) {
        const model = s.name.includes('Ultra') ? `${s.name} ${245 + gi * 10 + m}` :
          s.name.includes('Xeon') ? `Xeon ${s.gens[gi]}` :
          `${s.name}-${13400 + gi * 100 + m * 10}F`.replace('Core ', '');
        products.push(createProduct({
          id: `cpu-intel-${id++}`,
          name: `Intel ${model}`,
          brand: 'Intel',
          series: s.name,
          generation: gen,
          price: s.base + gi * 2000 + m * 1500,
          socket: s.socket,
          chipset: s.socket === 'LGA1851' ? 'Z890' : 'Z790',
          tdp: s.name.includes('i9') || s.name.includes('Ultra 9') ? 125 : s.name.includes('i7') || s.name.includes('Ultra 7') ? 65 : 65,
          memory: 'N/A',
          speed: `${3.0 + gi * 0.2 + m * 0.1} GHz`,
          cores: s.name.includes('i9') ? 24 : s.name.includes('i7') ? 16 : s.name.includes('i5') ? 10 : 4,
          threads: s.name.includes('i9') ? 32 : s.name.includes('i7') ? 24 : s.name.includes('i5') ? 16 : 8,
          category: 'cpu',
          image: genImage('#0071c5', `Intel ${model}`),
          description: `High-performance Intel ${s.name} processor with ${gen} architecture. Ideal for gaming and productivity.`,
          pcie: 'PCIe 5.0',
          integratedGraphics: !model.includes('F')
        }));
      }
    });
  });
  return products;
}

/** Generate AMD CPUs */
function generateAMDCPUs() {
  const products = [];
  const series = [
    { name: 'Ryzen 3', gens: ['5000', '7000'], base: 7500, socket: 'AM4' },
    { name: 'Ryzen 5', gens: ['5000', '7000', '9000'], base: 12000, socket: 'AM5' },
    { name: 'Ryzen 7', gens: ['5000', '7000', '9000'], base: 25000, socket: 'AM5' },
    { name: 'Ryzen 9', gens: ['5000', '7000', '9000'], base: 42000, socket: 'AM5' },
    { name: 'Threadripper', gens: ['7000', '9000'], base: 85000, socket: 'AM5' }
  ];
  let id = 1;
  series.forEach(s => {
    s.gens.forEach((gen, gi) => {
      const sock = gen === '5000' && s.name !== 'Threadripper' ? 'AM4' : 'AM5';
      for (let m = 0; m < 3; m++) {
        const num = s.name.includes('Threadripper') ? `7970X` :
          `${gen}${s.name === 'Ryzen 3' ? '4100' : s.name === 'Ryzen 5' ? '5600X' : s.name === 'Ryzen 7' ? '7800X3D' : '9950X'}`.replace(/\d{4}/, String(4000 + gi * 1000 + m * 100));
        products.push(createProduct({
          id: `cpu-amd-${id++}`,
          name: `AMD ${s.name} ${num}`,
          brand: 'AMD',
          series: s.name,
          generation: `${gen} Series`,
          price: s.base + gi * 3000 + m * 2000,
          socket: sock,
          chipset: sock === 'AM4' ? 'B550' : 'X670E',
          tdp: s.name.includes('9') || s.name.includes('Threadripper') ? 170 : 65,
          memory: 'N/A',
          speed: `${3.6 + gi * 0.15} GHz`,
          cores: s.name.includes('9') ? 16 : s.name.includes('7') ? 8 : s.name.includes('5') ? 6 : 4,
          threads: s.name.includes('9') ? 32 : s.name.includes('7') ? 16 : s.name.includes('5') ? 12 : 8,
          category: 'cpu',
          image: genImage('#ed1c24', `AMD ${s.name}`),
          description: `AMD ${s.name} ${num} - Zen architecture powerhouse for gaming and content creation.`,
          pcie: 'PCIe 5.0',
          integratedGraphics: false
        }));
      }
    });
  });
  return products;
}

/** Generate NVIDIA GPUs */
function generateNVIDIAGPUs() {
  const products = [];
  const series = [
    { name: 'GTX 900', models: ['GTX 960', 'GTX 970', 'GTX 980'], base: 8000 },
    { name: 'GTX 10', models: ['GTX 1050 Ti', 'GTX 1060', 'GTX 1070', 'GTX 1080'], base: 12000 },
    { name: 'GTX 16', models: ['GTX 1650', 'GTX 1660', 'GTX 1660 Super', 'GTX 1660 Ti'], base: 15000 },
    { name: 'RTX 20', models: ['RTX 2060', 'RTX 2070', 'RTX 2080', 'RTX 2080 Ti'], base: 22000 },
    { name: 'RTX 30', models: ['RTX 3060', 'RTX 3060 Ti', 'RTX 3070', 'RTX 3080', 'RTX 3090'], base: 28000 },
    { name: 'RTX 40', models: ['RTX 4060', 'RTX 4060 Ti', 'RTX 4070', 'RTX 4070 Ti', 'RTX 4080', 'RTX 4090'], base: 35000 },
    { name: 'RTX 50', models: ['RTX 5060', 'RTX 5060 Ti', 'RTX 5070', 'RTX 5070 Ti', 'RTX 5080', 'RTX 5090'], base: 45000 }
  ];
  const brands = ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'EVGA'];
  let id = 1;
  series.forEach(s => {
    s.models.forEach((model, mi) => {
      brands.forEach((brand, bi) => {
        const vram = model.includes('4090') || model.includes('5090') ? 24 :
          model.includes('4080') || model.includes('5080') ? 16 :
          model.includes('4070') || model.includes('5070') ? 12 : 8;
        products.push(createProduct({
          id: `gpu-nvidia-${id++}`,
          name: `${brand} ${model} ${vram}GB`,
          brand: 'NVIDIA',
          series: s.name,
          generation: s.name,
          price: s.base + mi * 8000 + bi * 2000,
          socket: 'PCIe',
          chipset: 'N/A',
          tdp: model.includes('5090') ? 575 : model.includes('4090') ? 450 : model.includes('4080') ? 320 : 200,
          memory: `${vram}GB GDDR6X`,
          speed: `${1500 + mi * 100} MHz`,
          length: 280 + mi * 15,
          category: 'gpu',
          image: genImage('#76b900', model),
          description: `${brand} ${model} graphics card with ${vram}GB VRAM. Ray tracing and DLSS support.`,
          pcie: s.name.includes('RTX 5') || s.name.includes('RTX 40') ? 'PCIe 4.0' : 'PCIe 3.0',
          rgb: bi % 2 === 0
        }));
      });
    });
  });
  return products;
}

/** Generate AMD GPUs */
function generateAMDGPUs() {
  const products = [];
  const series = [
    { name: 'RX 5000', models: ['RX 5500 XT', 'RX 5600 XT', 'RX 5700', 'RX 5700 XT'], base: 12000 },
    { name: 'RX 6000', models: ['RX 6600', 'RX 6600 XT', 'RX 6700 XT', 'RX 6800', 'RX 6900 XT'], base: 22000 },
    { name: 'RX 7000', models: ['RX 7600', 'RX 7700 XT', 'RX 7800 XT', 'RX 7900 GRE', 'RX 7900 XTX'], base: 28000 },
    { name: 'RX 9000', models: ['RX 9060 XT', 'RX 9070', 'RX 9070 XT', 'RX 9090 XT'], base: 38000 }
  ];
  const brands = ['ASUS', 'MSI', 'Sapphire', 'Gigabyte', 'XFX'];
  let id = 1;
  series.forEach(s => {
    s.models.forEach((model, mi) => {
      brands.forEach((brand, bi) => {
        products.push(createProduct({
          id: `gpu-amd-${id++}`,
          name: `${brand} ${model}`,
          brand: 'AMD',
          series: s.name,
          generation: s.name,
          price: s.base + mi * 10000 + bi * 1500,
          socket: 'PCIe',
          tdp: 180 + mi * 40,
          memory: `${8 + mi * 2}GB GDDR6`,
          speed: `${2000 + mi * 50} MHz`,
          length: 260 + mi * 20,
          category: 'gpu',
          image: genImage('#ed1c24', model),
          description: `${brand} ${model} - RDNA architecture with FSR support.`,
          pcie: s.name.includes('9000') || s.name.includes('7000') ? 'PCIe 4.0' : 'PCIe 3.0',
          rgb: true
        }));
      });
    });
  });
  return products;
}

/** Generate Intel Arc GPUs */
function generateIntelArcGPUs() {
  const products = [];
  const series = [
    { name: 'Arc A Series', models: ['Arc A380', 'Arc A580', 'Arc A750', 'Arc A770'], base: 12000 },
    { name: 'Arc B Series', models: ['Arc B570', 'Arc B580'], base: 22000 }
  ];
  let id = 1;
  series.forEach(s => {
    s.models.forEach((model, mi) => {
      products.push(createProduct({
        id: `gpu-intel-${id++}`,
        name: `Intel ${model}`,
        brand: 'Intel Arc',
        series: s.name,
        generation: s.name,
        price: s.base + mi * 5000,
        tdp: 75 + mi * 50,
        memory: `${8 + mi * 4}GB GDDR6`,
        length: 240 + mi * 10,
        category: 'gpu',
        image: genImage('#0071c5', model),
        description: `Intel ${model} - Xe architecture with XeSS upscaling.`,
        pcie: 'PCIe 4.0'
      }));
    });
  });
  return products;
}

/** Generate Motherboards */
function generateMotherboards() {
  const products = [];
  const configs = [
    { brand: 'ASUS', socket: 'LGA1700', chipset: 'Z790', ram: 'DDR5', price: 18000 },
    { brand: 'ASUS', socket: 'LGA1700', chipset: 'B760', ram: 'DDR4', price: 12000 },
    { brand: 'ASUS', socket: 'LGA1851', chipset: 'Z890', ram: 'DDR5', price: 28000 },
    { brand: 'MSI', socket: 'AM5', chipset: 'X670E', ram: 'DDR5', price: 22000 },
    { brand: 'MSI', socket: 'AM5', chipset: 'B650', ram: 'DDR5', price: 14000 },
    { brand: 'MSI', socket: 'AM4', chipset: 'B550', ram: 'DDR4', price: 10000 },
    { brand: 'Gigabyte', socket: 'LGA1700', chipset: 'Z790', ram: 'DDR5', price: 16000 },
    { brand: 'Gigabyte', socket: 'AM5', chipset: 'B650E', ram: 'DDR5', price: 15000 },
    { brand: 'ASRock', socket: 'AM5', chipset: 'X870E', ram: 'DDR5', price: 25000 },
    { brand: 'ASRock', socket: 'LGA1851', chipset: 'B860', ram: 'DDR5', price: 13000 }
  ];
  let id = 1;
  configs.forEach((c, i) => {
    for (let v = 0; v < 4; v++) {
      const names = ['Pro', 'Gaming', 'Aorus', 'Tomahawk', 'Steel Legend', 'Phantom'];
      products.push(createProduct({
        id: `mobo-${id++}`,
        name: `${c.brand} ${names[i % names.length]} ${c.chipset}`,
        brand: c.brand,
        series: c.chipset,
        generation: c.socket,
        price: c.price + v * 3000,
        socket: c.socket,
        chipset: c.chipset,
        memory: c.ram,
        ramSlots: 4,
        maxRamSpeed: c.ram === 'DDR5' ? 6400 + v * 400 : 3600,
        m2Slots: 2 + v,
        fanHeaders: 4 + v,
        rgbHeaders: 2,
        pcie: 'PCIe 5.0',
        formFactor: v > 2 ? 'E-ATX' : 'ATX',
        maxGpuLength: 380,
        maxCoolerHeight: 170,
        category: 'motherboard',
        image: genImage('#333', `${c.brand} ${c.chipset}`),
        description: `${c.brand} ${c.chipset} motherboard with ${c.ram} support and ${c.socket} socket.`,
        rgb: v % 2 === 0
      }));
    }
  });
  return products;
}

/** Generate RAM */
function generateRAM() {
  const products = [];
  const configs = [
    { brand: 'Corsair', series: 'Vengeance', type: 'DDR5', speeds: [5200, 5600, 6000, 6400] },
    { brand: 'G.Skill', series: 'Trident Z5', type: 'DDR5', speeds: [6000, 6400, 7200, 8000] },
    { brand: 'Kingston', series: 'Fury Beast', type: 'DDR5', speeds: [5200, 5600, 6000] },
    { brand: 'Corsair', series: 'Vengeance LPX', type: 'DDR4', speeds: [3200, 3600] },
    { brand: 'G.Skill', series: 'Ripjaws V', type: 'DDR4', speeds: [3200, 3600] },
    { brand: 'Crucial', series: 'Ballistix', type: 'DDR4', speeds: [3200] },
    { brand: 'ADATA', series: 'XPG Lancer', type: 'DDR5', speeds: [5600, 6000, 6400] },
    { brand: 'TeamGroup', series: 'T-Force Delta', type: 'DDR5', speeds: [6000, 6400] },
    { brand: 'Patriot', series: 'Viper Steel', type: 'DDR5', speeds: [5600, 6000] }
  ];
  let id = 1;
  configs.forEach(c => {
    c.speeds.forEach(speed => {
      [8, 16, 32].forEach(capacity => {
        [1, 2].forEach(kit => {
          products.push(createProduct({
            id: `ram-${id++}`,
            name: `${c.brand} ${c.series} ${capacity * kit}GB (${kit}x${capacity}GB) ${c.type}-${speed}`,
            brand: c.brand,
            series: c.series,
            generation: c.type,
            price: (c.type === 'DDR5' ? 3500 : 2500) * capacity * kit + speed * 2,
            memory: `${capacity * kit}GB`,
            speed: `${speed} MHz`,
            memoryType: c.type,
            category: 'ram',
            image: genImage('#ff006e', `${capacity * kit}GB ${c.type}`),
            description: `${c.brand} ${c.series} ${c.type} memory kit at ${speed}MHz.`,
            rgb: c.series.includes('Trident') || c.series.includes('Delta')
          }));
        });
      });
    });
  });
  return products;
}

/** Generate Storage */
function generateStorage() {
  const products = [];
  const ssds = [
    { brand: 'Samsung', name: '990 Pro', type: 'NVMe Gen4', caps: [512, 1024, 2048], base: 5500 },
    { brand: 'Samsung', name: '990 EVO', type: 'NVMe Gen5', caps: [1024, 2048], base: 8000 },
    { brand: 'WD', name: 'Black SN850X', type: 'NVMe Gen4', caps: [512, 1024, 2048], base: 5000 },
    { brand: 'Crucial', name: 'T500', type: 'NVMe Gen4', caps: [512, 1024, 2048], base: 4500 },
    { brand: 'Kingston', name: 'KC3000', type: 'NVMe Gen4', caps: [512, 1024, 2048], base: 4800 },
    { brand: 'ADATA', name: 'Legend 960', type: 'NVMe Gen4', caps: [512, 1024], base: 4000 },
    { brand: 'Samsung', name: '870 EVO', type: 'SATA', caps: [256, 512, 1024, 2048], base: 3500 },
    { brand: 'Crucial', name: 'MX500', type: 'SATA', caps: [256, 512, 1024], base: 3000 }
  ];
  let id = 1;
  ssds.forEach(s => {
    s.caps.forEach(cap => {
      products.push(createProduct({
        id: `ssd-${id++}`,
        name: `${s.brand} ${s.name} ${cap}GB`,
        brand: s.brand,
        series: s.name,
        generation: s.type,
        price: s.base + cap * 3,
        memory: `${cap}GB`,
        speed: s.type.includes('Gen5') ? '7400 MB/s' : s.type.includes('Gen4') ? '7000 MB/s' : '560 MB/s',
        storageType: s.type,
        category: 'ssd',
        image: genImage('#00d4aa', `${s.name} ${cap}GB`),
        description: `${s.brand} ${s.name} ${s.type} SSD with ${cap}GB capacity.`
      }));
    });
  });
  const hdds = [
    { brand: 'WD', name: 'Blue', caps: [1000, 2000, 4000] },
    { brand: 'Seagate', name: 'Barracuda', caps: [1000, 2000, 4000, 8000] },
    { brand: 'WD', name: 'Black', caps: [2000, 4000, 8000] }
  ];
  hdds.forEach(h => {
    h.caps.forEach(cap => {
      products.push(createProduct({
        id: `hdd-${id++}`,
        name: `${h.brand} ${h.name} ${cap}GB HDD`,
        brand: h.brand,
        series: h.name,
        price: 3000 + cap * 0.8,
        memory: `${cap}GB`,
        speed: '7200 RPM',
        category: 'hdd',
        image: genImage('#666', `${cap}GB HDD`),
        description: `${h.brand} ${h.name} ${cap}GB mechanical hard drive.`
      }));
    });
  });
  return products;
}

/** Generate PSUs */
function generatePSUs() {
  const products = [];
  const configs = [
    { brand: 'Corsair', series: 'RMx', watts: [550, 650, 750, 850, 1000] },
    { brand: 'Seasonic', series: 'Focus GX', watts: [550, 650, 750, 850, 1000] },
    { brand: 'EVGA', series: 'SuperNOVA', watts: [650, 750, 850, 1000] },
    { brand: 'Cooler Master', series: 'MWE Gold', watts: [550, 650, 750, 850] },
    { brand: 'Antec', series: 'HCG Gold', watts: [650, 750, 850] },
    { brand: 'Montech', series: 'Century II', watts: [650, 750, 850, 1000] }
  ];
  let id = 1;
  configs.forEach(c => {
    c.watts.forEach(w => {
      products.push(createProduct({
        id: `psu-${id++}`,
        name: `${c.brand} ${c.series} ${w}W 80+ Gold`,
        brand: c.brand,
        series: c.series,
        price: 5000 + w * 8,
        tdp: w,
        wattage: w,
        efficiency: '80+ Gold',
        modular: 'Fully Modular',
        category: 'psu',
        image: genImage('#ffd700', `${w}W PSU`),
        description: `${c.brand} ${c.series} ${w}W fully modular power supply.`,
        rgb: c.brand === 'Corsair'
      }));
    });
  });
  return products;
}

/** Generate Cases */
function generateCases() {
  const products = [];
  const configs = [
    { brand: 'NZXT', name: 'H7 Flow', price: 12000, maxGpu: 400, maxCooler: 185 },
    { brand: 'NZXT', name: 'H5 Flow', price: 8000, maxGpu: 365, maxCooler: 165 },
    { brand: 'Lian Li', name: 'O11 Dynamic', price: 15000, maxGpu: 420, maxCooler: 167 },
    { brand: 'Lian Li', name: 'LANCOOL 216', price: 9000, maxGpu: 392, maxCooler: 180 },
    { brand: 'Fractal Design', name: 'North', price: 11000, maxGpu: 355, maxCooler: 170 },
    { brand: 'Fractal Design', name: 'Meshify 2', price: 10000, maxGpu: 467, maxCooler: 185 },
    { brand: 'Phanteks', name: 'Eclipse G360A', price: 7500, maxGpu: 435, maxCooler: 163 },
    { brand: 'Cooler Master', name: 'MasterBox 600', price: 6500, maxGpu: 420, maxCooler: 170 },
    { brand: 'DeepCool', name: 'CH560', price: 7000, maxGpu: 380, maxCooler: 175 },
    { brand: 'Antec', name: 'Flux', price: 5500, maxGpu: 330, maxCooler: 160 }
  ];
  let id = 1;
  configs.forEach(c => {
    ['Black', 'White'].forEach(color => {
      products.push(createProduct({
        id: `case-${id++}`,
        name: `${c.brand} ${c.name} ${color}`,
        brand: c.brand,
        series: c.name,
        price: c.price + (color === 'White' ? 1000 : 0),
        maxGpuLength: c.maxGpu,
        maxCoolerHeight: c.maxCooler,
        formFactor: 'Mid Tower',
        category: 'cabinet',
        image: genImage('#1a1a2e', c.name),
        description: `${c.brand} ${c.name} mid-tower case in ${color}.`,
        rgb: true
      }));
    });
  });
  return products;
}

/** Generate Coolers */
function generateCoolers() {
  const products = [];
  const configs = [
    { brand: 'Noctua', name: 'NH-D15', type: 'Air', price: 8500, height: 165, tdp: 250 },
    { brand: 'Cooler Master', name: 'Hyper 212', type: 'Air', price: 3500, height: 159, tdp: 180 },
    { brand: 'DeepCool', name: 'AK620', type: 'Air', price: 5500, height: 160, tdp: 260 },
    { brand: 'NZXT', name: 'Kraken X73', type: 'AIO 360mm', price: 12000, height: 55, tdp: 350 },
    { brand: 'Corsair', name: 'H150i Elite', type: 'AIO 360mm', price: 14000, height: 55, tdp: 350 },
    { brand: 'DeepCool', name: 'LS720', type: 'AIO 360mm', price: 9000, height: 55, tdp: 300 },
    { brand: 'be quiet!', name: 'Dark Rock Pro 4', type: 'Air', price: 7500, height: 163, tdp: 250 },
    { brand: 'Corsair', name: 'H100i', type: 'AIO 240mm', price: 9500, height: 55, tdp: 280 }
  ];
  let id = 1;
  configs.forEach(c => {
    SOCKETS.forEach((sock, si) => {
      if (si < 3) {
        products.push(createProduct({
          id: `cooler-${id++}`,
          name: `${c.brand} ${c.name}`,
          brand: c.brand,
          series: c.type,
          price: c.price,
          height: c.height,
          tdp: c.tdp,
          socket: sock,
          category: 'cooler',
          image: genImage('#4a90d9', c.name),
          description: `${c.brand} ${c.name} ${c.type} CPU cooler.`,
          rgb: c.brand === 'NZXT' || c.brand === 'Corsair'
        }));
      }
    });
  });
  return products;
}

/** Generate peripherals and accessories */
function generatePeripherals() {
  const products = [];
  let id = 1;

  // Case Fans
  ['Corsair', 'NZXT', 'Cooler Master', 'DeepCool', 'Lian Li'].forEach(brand => {
    ['120mm', '140mm'].forEach(size => {
      products.push(createProduct({
        id: `fan-${id++}`, name: `${brand} ${size} RGB Fan (3-Pack)`, brand, series: size,
        price: 3500 + (size === '140mm' ? 500 : 0), category: 'fan', rgb: true,
        image: genImage('#00ffff', `${size} Fan`), description: `${brand} ${size} PWM RGB case fans.`
      }));
    });
  });

  // RGB Accessories
  ['Corsair', 'NZXT', 'Razer'].forEach(brand => {
    products.push(createProduct({
      id: `rgb-${id++}`, name: `${brand} RGB Strip Kit`, brand, series: 'RGB',
      price: 2500, category: 'rgb', rgb: true,
      image: genImage('#ff00ff', 'RGB Strip'), description: `${brand} addressable RGB lighting kit.`
    }));
  });

  // Thermal Paste
  ['Noctua', 'Thermal Grizzly', 'Arctic', 'Cooler Master'].forEach(brand => {
    products.push(createProduct({
      id: `paste-${id++}`, name: `${brand} Thermal Paste`, brand, series: 'Thermal',
      price: 500 + id * 100, category: 'paste',
      image: genImage('#888', 'Thermal Paste'), description: `Premium thermal compound by ${brand}.`
    }));
  });

  // Monitors
  const monitors = [
    { brand: 'ASUS ROG', name: 'PG27AQDM', size: 27, res: '2560x1440', refresh: 240, price: 55000 },
    { brand: 'MSI', name: 'MAG274QRF', size: 27, res: '2560x1440', refresh: 165, price: 28000 },
    { brand: 'LG', name: '27GP850', size: 27, res: '2560x1440', refresh: 165, price: 32000 },
    { brand: 'Dell', name: 'S2721DGF', size: 27, res: '2560x1440', refresh: 165, price: 35000 },
    { brand: 'Acer', name: 'XV272U', size: 27, res: '2560x1440', refresh: 170, price: 25000 },
    { brand: 'BenQ', name: 'MOBIUZ EX2710', size: 27, res: '1920x1080', refresh: 144, price: 18000 },
    { brand: 'ViewSonic', name: 'XG270Q', size: 27, res: '2560x1440', refresh: 165, price: 22000 },
    { brand: 'AOC', name: 'AG274QXM', size: 27, res: '2560x1440', refresh: 240, price: 45000 },
    { brand: 'Alienware', name: 'AW2725DF', size: 27, res: '2560x1440', refresh: 360, price: 65000 },
    { brand: 'ASUS ROG', name: 'PG32UCDM', size: 32, res: '3840x2160', refresh: 240, price: 95000 }
  ];
  monitors.forEach(m => {
    products.push(createProduct({
      id: `monitor-${id++}`, name: `${m.brand} ${m.name}`, brand: m.brand, series: m.name,
      price: m.price, memory: `${m.size}"`, speed: `${m.refresh}Hz`, generation: m.res,
      category: 'monitor', image: genImage('#0066cc', `${m.size}" Monitor`),
      description: `${m.brand} ${m.size}" ${m.res} ${m.refresh}Hz gaming monitor.`
    }));
  });

  // Keyboards
  ['Logitech', 'Razer', 'SteelSeries', 'HyperX', 'Redragon', 'Corsair'].forEach(brand => {
    ['Mechanical', 'Optical', 'Membrane'].forEach(type => {
      products.push(createProduct({
        id: `kb-${id++}`, name: `${brand} ${type} Keyboard`, brand, series: type,
        price: type === 'Mechanical' ? 8000 : type === 'Optical' ? 12000 : 3000,
        category: 'keyboard', rgb: true,
        image: genImage('#333', `${brand} KB`), description: `${brand} ${type} gaming keyboard.`
      }));
    });
  });

  // Mice
  ['Logitech', 'Razer', 'SteelSeries', 'HyperX', 'Redragon'].forEach(brand => {
    products.push(createProduct({
      id: `mouse-${id++}`, name: `${brand} Gaming Mouse`, brand, series: 'Gaming',
      price: 2500 + Math.random() * 8000, category: 'mouse', rgb: true,
      image: genImage('#444', `${brand} Mouse`), description: `${brand} precision gaming mouse.`
    }));
  });

  // Mouse Pads
  ['SteelSeries', 'Razer', 'HyperX', 'Logitech'].forEach(brand => {
    ['Medium', 'Large', 'XL'].forEach(size => {
      products.push(createProduct({
        id: `pad-${id++}`, name: `${brand} ${size} Mouse Pad`, brand, series: size,
        price: 800 + (size === 'XL' ? 1500 : size === 'Large' ? 800 : 0),
        category: 'mousepad', rgb: brand === 'Razer',
        image: genImage('#222', 'Mouse Pad'), description: `${brand} ${size} gaming mouse pad.`
      }));
    });
  });

  // Headsets
  ['HyperX', 'SteelSeries', 'Logitech', 'Razer', 'Corsair'].forEach(brand => {
    products.push(createProduct({
      id: `headset-${id++}`, name: `${brand} Gaming Headset`, brand, series: 'Gaming',
      price: 3500 + Math.random() * 10000, category: 'headset', rgb: brand === 'Razer',
      image: genImage('#555', `${brand} Headset`), description: `${brand} 7.1 surround gaming headset.`
    }));
  });

  // Speakers, Mic, Webcam, UPS, Chair, Desk
  const misc = [
    { cat: 'speakers', brands: ['Logitech', 'Razer', 'Creative'], prefix: 'Speakers' },
    { cat: 'microphone', brands: ['HyperX', 'Blue', 'Razer'], prefix: 'Microphone' },
    { cat: 'webcam', brands: ['Logitech', 'Razer', 'Elgato'], prefix: 'Webcam' },
    { cat: 'ups', brands: ['APC', 'CyberPower', 'Luminous'], prefix: 'UPS' },
    { cat: 'chair', brands: ['Secretlab', 'Noblechairs', 'GT Racing'], prefix: 'Gaming Chair' },
    { cat: 'desk', brands: ['IKEA', 'Secretlab', 'FlexiSpot'], prefix: 'Gaming Desk' }
  ];
  misc.forEach(m => {
    m.brands.forEach(brand => {
      products.push(createProduct({
        id: `${m.cat}-${id++}`, name: `${brand} ${m.prefix}`, brand, series: m.prefix,
        price: m.cat === 'chair' ? 25000 + Math.random() * 30000 :
          m.cat === 'desk' ? 15000 + Math.random() * 20000 :
          m.cat === 'ups' ? 8000 + Math.random() * 12000 : 3000 + Math.random() * 8000,
        category: m.cat,
        image: genImage('#666', m.prefix),
        description: `${brand} ${m.prefix} for your gaming setup.`
      }));
    });
  });

  return products;
}

/** Featured & preset builds */
const FEATURED_BUILDS = [
  {
    id: 'build-budget',
    name: 'Budget Gaming Build',
    budget: 40000,
    description: '1080p gaming on a budget',
    tags: ['Budget', '1080p'],
    image: 'https://images.pexels.com/photos/1038926/pexels-photo-1038926.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
  },
  {
    id: 'build-mid',
    name: 'Mid-Range Powerhouse',
    budget: 100000,
    description: '1440p high settings gaming',
    tags: ['Mid-Range', '1440p'],
    image: 'https://images.pexels.com/photos/1716008/pexels-photo-1716008.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
  },
  {
    id: 'build-high',
    name: 'Ultimate Gaming Rig',
    budget: 250000,
    description: '4K ultra settings ray tracing',
    tags: ['High-End', '4K'],
    image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
  },
  {
    id: 'build-stream',
    name: 'Streaming Setup',
    budget: 150000,
    description: 'Game and stream simultaneously',
    tags: ['Streaming', 'Content'],
    image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
  }
];

const BUDGET_TIERS = [
  { label: '₹25,000', value: 25000 },
  { label: '₹30,000', value: 30000 },
  { label: '₹40,000', value: 40000 },
  { label: '₹50,000', value: 50000 },
  { label: '₹60,000', value: 60000 },
  { label: '₹75,000', value: 75000 },
  { label: '₹1 Lakh', value: 100000 },
  { label: '₹1.5 Lakh', value: 150000 },
  { label: '₹2 Lakh', value: 200000 },
  { label: '₹3 Lakh+', value: 300000 }
];

const REVIEWS = [
  { name: 'Arjun K.', rating: 5, text: 'Built my dream PC using this builder. Compatibility checker saved me from buying wrong RAM!', date: '2025-11-15' },
  { name: 'Priya S.', rating: 5, text: 'The budget filter helped me build a ₹50K gaming PC that runs everything smoothly.', date: '2025-12-02' },
  { name: 'Rahul M.', rating: 4, text: 'Great product database and compare feature. UI looks absolutely stunning!', date: '2026-01-10' },
  { name: 'Sneha R.', rating: 5, text: 'Performance estimator was spot on. Getting exactly the FPS predicted in Cyberpunk.', date: '2026-02-20' },
  { name: 'Vikram P.', rating: 5, text: 'Best PC builder website I have used. Dark mode and RGB effects are chef\'s kiss.', date: '2026-03-05' },
  { name: 'Ananya D.', rating: 4, text: 'Saved multiple builds and compared GPUs easily. Very intuitive interface.', date: '2026-04-18' }
];

const FAQ_DATA = [
  { q: 'How does the compatibility checker work?', a: 'Our system automatically verifies CPU socket, RAM type, PSU wattage, GPU clearance, cooler height, and more when you add components to your build.' },
  { q: 'Can I save my PC build?', a: 'Yes! Use the Save Build feature to store your configuration in your browser\'s local storage. Access saved builds anytime from the Saved Builds page.' },
  { q: 'Are prices in Indian Rupees?', a: 'All prices displayed are in INR (₹) and represent approximate market prices for reference purposes.' },
  { q: 'How accurate is the performance estimator?', a: 'Performance estimates are based on component benchmarks and provide realistic expectations for gaming, streaming, editing, and other workloads.' },
  { q: 'Can I compare different components?', a: 'Absolutely! Add up to 4 products of the same category to the Compare page for side-by-side specification comparison.' },
  { q: 'Do I need an account?', a: 'No account required. All features work locally in your browser using localStorage for wishlist and saved builds.' }
];

const BUILDER_CATEGORIES = [
  { id: 'cpu', name: 'Processor (CPU)', icon: '🔲', required: true },
  { id: 'cooler', name: 'CPU Cooler', icon: '❄️', required: false },
  { id: 'motherboard', name: 'Motherboard', icon: '📟', required: true },
  { id: 'ram', name: 'Memory (RAM)', icon: '🧠', required: true },
  { id: 'gpu', name: 'Graphics Card', icon: '🎮', required: false },
  { id: 'ssd', name: 'SSD', icon: '💾', required: true },
  { id: 'hdd', name: 'HDD', icon: '💿', required: false },
  { id: 'psu', name: 'Power Supply', icon: '⚡', required: true },
  { id: 'cabinet', name: 'Cabinet / Case', icon: '🖥️', required: true },
  { id: 'fan', name: 'Case Fans', icon: '🌀', required: false },
  { id: 'rgb', name: 'RGB Accessories', icon: '🌈', required: false },
  { id: 'paste', name: 'Thermal Paste', icon: '🧴', required: false },
  { id: 'monitor', name: 'Monitor', icon: '🖵', required: false },
  { id: 'keyboard', name: 'Keyboard', icon: '⌨️', required: false },
  { id: 'mouse', name: 'Mouse', icon: '🖱️', required: false },
  { id: 'mousepad', name: 'Mouse Pad', icon: '🎯', required: false },
  { id: 'headset', name: 'Headset', icon: '🎧', required: false },
  { id: 'speakers', name: 'Speakers', icon: '🔊', required: false },
  { id: 'microphone', name: 'Microphone', icon: '🎤', required: false },
  { id: 'webcam', name: 'Webcam', icon: '📷', required: false },
  { id: 'ups', name: 'UPS', icon: '🔋', required: false },
  { id: 'chair', name: 'Chair', icon: '💺', required: false },
  { id: 'desk', name: 'Desk', icon: '🪑', required: false }
];

/** Master product array */
const PRODUCTS = [
  ...generateIntelCPUs(),
  ...generateAMDCPUs(),
  ...generateNVIDIAGPUs(),
  ...generateAMDGPUs(),
  ...generateIntelArcGPUs(),
  ...generateMotherboards(),
  ...generateRAM(),
  ...generateStorage(),
  ...generatePSUs(),
  ...generateCases(),
  ...generateCoolers(),
  ...generatePeripherals()
];

/** Utility getters */
function getProductsByCategory(category) {
  return PRODUCTS.filter(p => p.category === category);
}

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function getBrands() {
  return [...new Set(PRODUCTS.map(p => p.brand))].sort();
}

function getFeaturedProducts(limit = 8) {
  return [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

function getLatestProducts(limit = 8) {
  return PRODUCTS.slice(-limit).reverse();
}

function formatPrice(price) {
  return '₹' + Math.round(price).toLocaleString('en-IN');
}

function searchProducts(query, filters = {}) {
  let results = PRODUCTS;
  const q = query?.toLowerCase().trim();

  if (q) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.series?.toLowerCase().includes(q) ||
      p.generation?.toLowerCase().includes(q) ||
      p.socket?.toLowerCase().includes(q) ||
      p.chipset?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }

  if (filters.category) results = results.filter(p => p.category === filters.category);
  if (filters.brand) results = results.filter(p => p.brand === filters.brand);
  if (filters.series) results = results.filter(p => p.series === filters.series);
  if (filters.minPrice) results = results.filter(p => p.price >= filters.minPrice);
  if (filters.maxPrice) results = results.filter(p => p.price <= filters.maxPrice);
  if (filters.rgb) results = results.filter(p => p.rgb);
  if (filters.memoryType) results = results.filter(p => p.memoryType === filters.memoryType || p.memory === filters.memoryType || p.generation === filters.memoryType);
  if (filters.socket) results = results.filter(p => p.socket === filters.socket);
  if (filters.chipset) results = results.filter(p => p.chipset === filters.chipset);
  if (filters.pcie) results = results.filter(p => p.pcie === filters.pcie);
  if (filters.availability) results = results.filter(p => p.availability);

  return results;
}

function suggestBudgetBuild(budget) {
  const build = {};
  const order = ['cpu', 'motherboard', 'ram', 'gpu', 'ssd', 'psu', 'cabinet', 'cooler'];
  const allocations = { cpu: 0.22, motherboard: 0.12, ram: 0.08, gpu: 0.35, ssd: 0.08, psu: 0.07, cabinet: 0.05, cooler: 0.03 };
  let remaining = budget;

  order.forEach(cat => {
    const target = budget * allocations[cat];
    const candidates = getProductsByCategory(cat)
      .filter(p => p.price <= target && p.price <= remaining)
      .sort((a, b) => b.rating - a.rating);
    if (candidates.length) {
      build[cat] = candidates[0];
      remaining -= candidates[0].price;
    }
  });
  return build;
}

// Export for modules
if (typeof window !== 'undefined') {
  window.PRODUCTS = PRODUCTS;
  window.BUILDER_CATEGORIES = BUILDER_CATEGORIES;
  window.FEATURED_BUILDS = FEATURED_BUILDS;
  window.BUDGET_TIERS = BUDGET_TIERS;
  window.REVIEWS = REVIEWS;
  window.FAQ_DATA = FAQ_DATA;
  window.getProductsByCategory = getProductsByCategory;
  window.getProductById = getProductById;
  window.getBrands = getBrands;
  window.getFeaturedProducts = getFeaturedProducts;
  window.getLatestProducts = getLatestProducts;
  window.formatPrice = formatPrice;
  window.searchProducts = searchProducts;
  window.suggestBudgetBuild = suggestBudgetBuild;
}
