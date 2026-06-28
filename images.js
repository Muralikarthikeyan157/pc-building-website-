/**
 * PC Builder Pro - Product Image Resolver
 * Real hardware photos from Pexels & Wikimedia (CDN).
 */

const IMAGE_POOLS = {
  cpu: [
    'https://images.pexels.com/photos/163100/pexels-photo-163100.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Amd-ryzen-1700x.jpg/800px-Amd-ryzen-1700x.jpg',
    'https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  gpu: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/GTX_970.jpg/800px-GTX_970.jpg',
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1038926/pexels-photo-1038926.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1716008/pexels-photo-1716008.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/AMD_Radeon_RX_5700_XT_%28front%29.jpg/800px-AMD_Radeon_RX_5700_XT_%28front%29.jpg'
  ],
  motherboard: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Computer_motherboard.jpg/800px-Computer_motherboard.jpg',
    'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  ram: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/RAM_n.jpg/800px-RAM_n.jpg',
    'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/163100/pexels-photo-163100.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  ssd: [
    'https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  hdd: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Hard_disk_drive.jpg/800px-Hard_disk_drive.jpg'
  ],
  psu: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/PC_power_supply_interior.jpg/800px-PC_power_supply_interior.jpg',
    'https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  cabinet: [
    'https://images.pexels.com/photos/1038926/pexels-photo-1038926.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1716008/pexels-photo-1716008.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  cooler: [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/CPU_heatsink_and_fan.jpg/800px-CPU_heatsink_and_fan.jpg',
    'https://images.pexels.com/photos/1038926/pexels-photo-1038926.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  fan: [
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1716008/pexels-photo-1716008.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  rgb: [
    'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/1716008/pexels-photo-1716008.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  paste: [
    'https://images.pexels.com/photos/163100/pexels-photo-163100.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  monitor: [
    'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  keyboard: [
    'https://images.pexels.com/photos/2111382/pexels-photo-2111382.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/6066430/pexels-photo-6066430.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  mouse: [
    'https://images.pexels.com/photos/7923819/pexels-photo-7923819.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/2111382/pexels-photo-2111382.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  mousepad: [
    'https://images.pexels.com/photos/2111382/pexels-photo-2111382.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  headset: [
    'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  speakers: [
    'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  microphone: [
    'https://images.pexels.com/photos/3993299/pexels-photo-3993299.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  webcam: [
    'https://images.pexels.com/photos/18105/pexels-photo-18105.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  ups: [
    'https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  chair: [
    'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/667164/pexels-photo-667164.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ],
  desk: [
    'https://images.pexels.com/photos/667164/pexels-photo-667164.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
  ]
};

const BUILD_IMAGES = {
  'build-budget': 'https://images.pexels.com/photos/1038926/pexels-photo-1038926.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'build-mid': 'https://images.pexels.com/photos/1716008/pexels-photo-1716008.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'build-high': 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'build-stream': 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop'
};

function hashId(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function resolveProductImage(product) {
  const category = product.category || 'cpu';
  const pool = IMAGE_POOLS[category] || IMAGE_POOLS.cpu;
  const brandOffset = hashId(product.brand || '') % pool.length;
  const idOffset = hashId(product.id || product.name || '') % pool.length;
  const idx = (brandOffset + idOffset) % pool.length;
  return pool[idx];
}

function getBuildImage(buildId) {
  return BUILD_IMAGES[buildId] || BUILD_IMAGES['build-mid'];
}

function fallbackImage(text, category) {
  const colors = { cpu: '#0071c5', gpu: '#76b900', motherboard: '#444', ram: '#ff006e', default: '#7b2ff7' };
  const color = colors[category] || colors.default;
  const label = (text || 'Product').substring(0, 36).replace(/'/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="#12121a"/>
    <rect x="80" y="80" width="640" height="440" rx="12" fill="${color}" opacity="0.15"/>
    <text x="400" y="310" font-family="Arial,sans-serif" font-size="20" fill="#888" text-anchor="middle">${label}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function productImgAttrs(product) {
  const cat = product?.category || 'default';
  return `class="product-img" loading="lazy" decoding="async" data-category="${cat}"`;
}

if (typeof window !== 'undefined') {
  window.resolveProductImage = resolveProductImage;
  window.getBuildImage = getBuildImage;
  window.fallbackImage = fallbackImage;
  window.productImgAttrs = productImgAttrs;
  window.IMAGE_POOLS = IMAGE_POOLS;

  // Global fallback for broken product images
  document.addEventListener('error', (e) => {
    if (e.target?.tagName === 'IMG' && e.target.classList.contains('product-img') && !e.target.dataset.fallback) {
      e.target.dataset.fallback = '1';
      const cat = e.target.dataset.category || 'default';
      e.target.src = fallbackImage(e.target.alt || 'Product', cat);
    }
  }, true);
}
