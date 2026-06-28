/**
 * PC Builder Pro - Compatibility Checker
 */

const Compatibility = {
  /**
   * Run full compatibility check on a build
   * @param {Object} build - Map of category -> product
   * @returns {Array} Array of { name, status, message }
   */
  checkBuild(build) {
    const checks = [];
    const cpu = build.cpu;
    const mobo = build.motherboard;
    const ram = build.ram;
    const gpu = build.gpu;
    const psu = build.psu;
    const cabinet = build.cabinet;
    const cooler = build.cooler;

    // CPU Socket vs Motherboard Socket
    if (cpu && mobo) {
      if (cpu.socket === mobo.socket) {
        checks.push({ name: 'CPU Socket', status: 'ok', message: `${cpu.socket} matches motherboard` });
      } else {
        checks.push({ name: 'CPU Socket', status: 'error', message: `CPU (${cpu.socket}) ≠ Motherboard (${mobo.socket})` });
      }
    } else if (cpu || mobo) {
      checks.push({ name: 'CPU Socket', status: 'warn', message: 'Select both CPU and motherboard' });
    }

    // RAM Type
    if (ram && mobo) {
      const ramType = ram.memoryType || ram.generation;
      const moboRam = mobo.memory;
      if (ramType === moboRam) {
        checks.push({ name: 'RAM Type', status: 'ok', message: `${ramType} supported` });
      } else {
        checks.push({ name: 'RAM Type', status: 'error', message: `RAM (${ramType}) not supported by motherboard (${moboRam})` });
      }
    }

    // RAM Speed
    if (ram && mobo?.maxRamSpeed) {
      const speed = parseInt(ram.speed);
      if (speed <= mobo.maxRamSpeed) {
        checks.push({ name: 'RAM Speed', status: 'ok', message: `${speed}MHz within ${mobo.maxRamSpeed}MHz limit` });
      } else {
        checks.push({ name: 'RAM Speed', status: 'warn', message: `${speed}MHz may downclock to ${mobo.maxRamSpeed}MHz` });
      }
    }

    // PSU Wattage
    const estimatedWattage = this.estimateWattage(build);
    if (psu) {
      const headroom = psu.wattage - estimatedWattage;
      if (headroom >= 100) {
        checks.push({ name: 'PSU Wattage', status: 'ok', message: `${psu.wattage}W (${estimatedWattage}W estimated)` });
      } else if (headroom >= 0) {
        checks.push({ name: 'PSU Wattage', status: 'warn', message: `${psu.wattage}W is tight for ${estimatedWattage}W load` });
      } else {
        checks.push({ name: 'PSU Wattage', status: 'error', message: `${psu.wattage}W insufficient for ${estimatedWattage}W` });
      }
    } else if (estimatedWattage > 0) {
      checks.push({ name: 'PSU Wattage', status: 'warn', message: `Estimated ${estimatedWattage}W - select a PSU` });
    }

    // GPU Length vs Case
    if (gpu && cabinet) {
      const gpuLen = gpu.length || 300;
      const maxLen = cabinet.maxGpuLength || 350;
      if (gpuLen <= maxLen) {
        checks.push({ name: 'GPU Length', status: 'ok', message: `${gpuLen}mm fits in ${maxLen}mm clearance` });
      } else {
        checks.push({ name: 'GPU Length', status: 'error', message: `GPU (${gpuLen}mm) exceeds case limit (${maxLen}mm)` });
      }
    }

    // Cooler Height vs Case
    if (cooler && cabinet) {
      const coolerH = cooler.height || 160;
      const maxH = cabinet.maxCoolerHeight || 165;
      if (coolerH <= maxH) {
        checks.push({ name: 'Cooler Height', status: 'ok', message: `${coolerH}mm fits in ${maxH}mm clearance` });
      } else {
        checks.push({ name: 'Cooler Height', status: 'error', message: `Cooler (${coolerH}mm) exceeds case limit (${maxH}mm)` });
      }
    }

    // Cooler Socket
    if (cooler && cpu) {
      if (!cooler.socket || cooler.socket === cpu.socket) {
        checks.push({ name: 'Cooler Socket', status: 'ok', message: 'Cooler supports CPU socket' });
      } else {
        checks.push({ name: 'Cooler Socket', status: 'warn', message: 'Verify cooler mounting bracket' });
      }
    }

    // PCIe Version
    if (gpu && mobo) {
      checks.push({ name: 'PCIe Version', status: 'ok', message: `${gpu.pcie || 'PCIe 4.0'} on ${mobo.pcie || 'PCIe 4.0'} slot` });
    }

    // M.2 Slots
    if (build.ssd && mobo) {
      const ssdType = build.ssd.generation || build.ssd.storageType || '';
      if (ssdType.includes('NVMe') && mobo.m2Slots) {
        checks.push({ name: 'M.2 Slots', status: 'ok', message: `${mobo.m2Slots} M.2 slots available` });
      } else if (ssdType.includes('SATA')) {
        checks.push({ name: 'M.2 Slots', status: 'ok', message: 'SATA SSD - no M.2 required' });
      }
    }

    // Fan Headers
    if (build.fan && mobo) {
      checks.push({ name: 'Fan Headers', status: 'ok', message: `${mobo.fanHeaders || 4} fan headers available` });
    }

    // RGB Headers
    if (build.rgb && mobo) {
      checks.push({ name: 'RGB Headers', status: 'ok', message: `${mobo.rgbHeaders || 2} RGB headers available` });
    }

    return checks;
  },

  /** Estimate total system wattage */
  estimateWattage(build) {
    let watts = 50; // base system
    if (build.cpu) watts += build.cpu.tdp || 65;
    if (build.gpu) watts += build.gpu.tdp || 200;
    if (build.ram) watts += 10;
    if (build.ssd) watts += 5;
    if (build.hdd) watts += 10;
    if (build.cooler?.series?.includes('AIO')) watts += 15;
    if (build.fan) watts += 10;
    return Math.ceil(watts * 1.2); // 20% headroom factor for estimate display
  },

  /** Get overall compatibility status */
  getOverallStatus(checks) {
    if (!checks.length) return 'warn';
    if (checks.some(c => c.status === 'error')) return 'error';
    if (checks.some(c => c.status === 'warn')) return 'warn';
    return 'ok';
  },

  /** Render compatibility HTML */
  renderChecks(checks) {
    if (!checks.length) {
      return '<p class="text-muted">Add components to check compatibility</p>';
    }
    return checks.map(c => `
      <div class="compat-item">
        <span class="compat-item-name">${c.name}</span>
        <span class="compat-status compat-${c.status === 'ok' ? 'ok' : c.status === 'warn' ? 'warn' : 'error'}">
          ${c.status === 'ok' ? '✓' : c.status === 'warn' ? '⚠' : '✗'} ${c.message}
        </span>
      </div>
    `).join('');
  },

  /** Performance estimation */
  estimatePerformance(build) {
    const cpu = build.cpu;
    const gpu = build.gpu;
    const ram = build.ram;

    let gaming = 30, streaming = 25, editing = 25, rendering = 25, programming = 40, ai = 20;

    if (cpu) {
      const cpuScore = (cpu.cores || 4) * 5 + (cpu.tdp || 65) / 5;
      programming = Math.min(100, programming + cpuScore);
      editing = Math.min(100, editing + cpuScore * 0.8);
      streaming = Math.min(100, streaming + cpuScore * 0.7);
      rendering = Math.min(100, rendering + cpuScore * 0.9);
    }

    if (gpu) {
      const gpuScore = (gpu.tdp || 150) / 3;
      const series = gpu.series || '';
      let genBonus = 0;
      if (series.includes('RTX 50') || series.includes('RX 9000')) genBonus = 30;
      else if (series.includes('RTX 40') || series.includes('RX 7000')) genBonus = 20;
      else if (series.includes('RTX 30') || series.includes('RX 6000')) genBonus = 10;

      gaming = Math.min(100, 30 + gpuScore + genBonus);
      streaming = Math.min(100, streaming + gpuScore * 0.5);
      editing = Math.min(100, editing + gpuScore * 0.6);
      rendering = Math.min(100, rendering + gpuScore * 0.8);
      ai = Math.min(100, 20 + gpuScore * 0.7 + (series.includes('RTX') ? 25 : 0));
    }

    if (ram) {
      const cap = parseInt(ram.memory) || 16;
      const bonus = cap >= 32 ? 15 : cap >= 16 ? 8 : 0;
      gaming += bonus * 0.3;
      editing += bonus;
      programming += bonus;
    }

    gaming = Math.round(Math.min(100, gaming));
    streaming = Math.round(Math.min(100, streaming));
    editing = Math.round(Math.min(100, editing));
    rendering = Math.round(Math.min(100, rendering));
    programming = Math.round(Math.min(100, programming));
    ai = Math.round(Math.min(100, ai));

    const overall = Math.round((gaming + streaming + editing + rendering + programming + ai) / 6);

    return { gaming, streaming, editing, rendering, programming, ai, overall };
  },

  /** Render performance bars HTML */
  renderPerformance(perf) {
    const items = [
      { label: 'Gaming FPS', value: perf.gaming },
      { label: 'Streaming', value: perf.streaming },
      { label: 'Editing', value: perf.editing },
      { label: 'Rendering', value: perf.rendering },
      { label: 'Programming', value: perf.programming },
      { label: 'AI Performance', value: perf.ai }
    ];

    return items.map(item => `
      <div class="perf-bar-item">
        <span class="perf-bar-label">${item.label}</span>
        <div class="perf-bar-track">
          <div class="perf-bar-fill" style="width: ${item.value}%"></div>
        </div>
        <span class="perf-bar-value">${item.value}</span>
      </div>
    `).join('');
  },

  /** Find compatible products for a given product */
  findCompatibleProducts(product) {
    if (!product) return [];
    return PRODUCTS.filter(p => {
      if (p.id === product.id) return false;
      if (product.category === 'cpu' && p.category === 'motherboard') {
        return p.socket === product.socket;
      }
      if (product.category === 'motherboard' && p.category === 'cpu') {
        return p.socket === product.socket;
      }
      if (product.category === 'motherboard' && p.category === 'ram') {
        return p.memoryType === product.memory || p.generation === product.memory;
      }
      if (product.category === 'ram' && p.category === 'motherboard') {
        return p.memory === product.memoryType || p.memory === product.generation;
      }
      return false;
    }).slice(0, 6);
  }
};

window.Compatibility = Compatibility;
