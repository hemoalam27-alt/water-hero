const ActivityCatalog = {
  'Showering': { label: 'Showering', icon: '🚿', baseWaterPerMinute: 15.0, minTime: 3.0, maxTime: 15.0 },
  'Dishwashing': { label: 'Dishwashing', icon: '🍽️', baseWaterPerMinute: 12.0, minTime: 3.0, maxTime: 10.0 },
  'PlantWatering': { label: 'Plant Watering', icon: '🌿', baseWaterPerMinute: 8.0, minTime: 2.0, maxTime: 10.0 },
  'CarWashing': { label: 'Car Washing', icon: '🚗', baseWaterPerMinute: 20.0, minTime: 10.0, maxTime: 30.0 },
  'Laundry': { label: 'Laundry', icon: '👕', baseWaterPerMinute: 18.0, minTime: 20.0, maxTime: 60.0 },
  'Cleaning': { label: 'Cleaning', icon: '🧹', baseWaterPerMinute: 10.0, minTime: 5.0, maxTime: 20.0 },
  'HandWashing': { label: 'Hand Washing', icon: '🧼', baseWaterPerMinute: 3.0, minTime: 0.5, maxTime: 2.0 },
  'Cooking': { label: 'Cooking', icon: '🍳', baseWaterPerMinute: 6.0, minTime: 2.0, maxTime: 8.0 }
};

const defaultConfig = {
  app_title: 'Water Hero',
  water_price_per_liter: 0.008,
  developer_name: 'Mohamed Mohamed Rashad'
};

let config = { ...defaultConfig };
let allRecords = [];
let selectedActivity = null;

function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem('waterHeroRecords');
    allRecords = data ? JSON.parse(data) : [];
    updateAllDisplays();
  } catch (e) {
    console.error('Error loading data:', e);
    allRecords = [];
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('waterHeroRecords', JSON.stringify(allRecords));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

function showTab(tabName) {
  document.getElementById('content-home').classList.toggle('hidden', tabName !== 'home');
  document.getElementById('content-calculator').classList.toggle('hidden', tabName !== 'calculator');
  document.getElementById('content-add').classList.toggle('hidden', tabName !== 'add');
  document.getElementById('content-tips').classList.toggle('hidden', tabName !== 'tips');
  document.getElementById('content-about').classList.toggle('hidden', tabName !== 'about');
  
   const updateTabStyle = (tabId, isActive) => {
    const tab = document.getElementById(tabId);
    if (isActive) {
      tab.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border', 'border-cyan-500/30');
      tab.classList.remove('text-slate-400');
    } else {
      tab.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border', 'border-cyan-500/30');
      tab.classList.add('text-slate-400');
    }
  };
  
  updateTabStyle('tab-home', tabName === 'home');
  updateTabStyle('tab-calculator', tabName === 'calculator');
  updateTabStyle('tab-add', tabName === 'add');
  updateTabStyle('tab-tips', tabName === 'tips');
  updateTabStyle('tab-about', tabName === 'about');
}

document.getElementById('tab-home').addEventListener('click', () => showTab('home'));
document.getElementById('tab-calculator').addEventListener('click', () => showTab('calculator'));
document.getElementById('tab-add').addEventListener('click', () => showTab('add'));
document.getElementById('btn-start').addEventListener('click', () => showTab('add'));
document.getElementById('tab-tips').addEventListener('click', () => showTab('tips'));
document.getElementById('tab-about').addEventListener('click', () => showTab('about'));

function showTimeMessage(isAppropriate, activityName, duration) {
  const modal = document.getElementById('time-message-modal');
  const icon = document.getElementById('message-icon');
  const title = document.getElementById('message-title');
  const text = document.getElementById('message-text');
  
  if (isAppropriate) {
    icon.textContent = '✅';
    title.textContent = 'Perfect Duration! 🎉';
    text.textContent = `${duration} minutes of ${activityName} - this is ideal!`;
    document.getElementById('time-message-content').classList.remove('bg-red-500/20', 'border-red-500/30');
    document.getElementById('time-message-content').classList.add('bg-emerald-500/20', 'border-emerald-500/30');
  } else {
    icon.textContent = '⚠️';
    title.textContent = 'Too Long Duration! ⏰';
    text.textContent = `${duration} minutes of ${activityName} - try reducing the time!`;
    document.getElementById('time-message-content').classList.add('bg-red-500/20', 'border-red-500/30');
    document.getElementById('time-message-content').classList.remove('bg-emerald-500/20', 'border-emerald-500/30');
  }
  
  modal.classList.remove('hidden');
}

function closeTimeMessage() {
  document.getElementById('time-message-modal').classList.add('hidden');
}

document.getElementById('btn-close-modal').addEventListener('click', closeTimeMessage);
document.getElementById('time-message-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('time-message-modal')) {
    closeTimeMessage();
  }
});

function updateHomeStats() {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = allRecords.filter(r => r.date === today);
  
  const dailyWastage = todayRecords.reduce((sum, r) => sum + r.wastageAmount, 0);
  const dailyCost = todayRecords.reduce((sum, r) => sum + r.cost, 0);
  const weeklyCost = dailyCost * 7;
  const monthlyCost = dailyCost * 30;
  
  document.getElementById('today-wastage').textContent = Math.round(dailyWastage);
  document.getElementById('cost-daily').textContent = dailyCost.toFixed(2) + ' EGP';
  document.getElementById('cost-weekly').textContent = weeklyCost.toFixed(2) + ' EGP';
  document.getElementById('cost-monthly').textContent = monthlyCost.toFixed(2) + ' EGP';
  
  document.getElementById('total-activities').textContent = todayRecords.length;
  
  if (todayRecords.length > 0) {
    const activityCounts = {};
    todayRecords.forEach(r => {
      activityCounts[r.activity] = (activityCounts[r.activity] || 0) + 1;
    });
    const bestActivityKey = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0][0];
    const activityObj = ActivityCatalog[bestActivityKey];
    const label = activityObj ? activityObj.label : bestActivityKey;
    const icon = activityObj ? activityObj.icon : '';
    document.getElementById('best-activity').textContent = icon + ' ' + label;
  } else {
    document.getElementById('best-activity').textContent = '-';
  }
  
  updateCharts(todayRecords);
}

function updateCharts(todayRecords) {
  const activityMap = {};
  const costMap = {};
  todayRecords.forEach(r => {
    activityMap[r.activity] = (activityMap[r.activity] || 0) + r.wastageAmount;
    costMap[r.activity] = (costMap[r.activity] || 0) + r.cost;
  });
  
  const activityChart = document.getElementById('activity-chart');
  if (Object.keys(activityMap).length === 0) {
    activityChart.innerHTML = '<p class="text-slate-400 text-xs text-center py-4">No data available yet</p>';
  } else {
    const maxActivity = Math.max(...Object.values(activityMap));
    activityChart.innerHTML = Object.entries(activityMap)
      .sort((a, b) => b[1] - a[1])
      .map(([activityKey, amount]) => {
        const percentage = (amount / maxActivity) * 100;
        const activityObj = ActivityCatalog[activityKey];
        const icon = activityObj?.icon || '📍';
        const label = activityObj?.label || activityKey;
        return `
          <div class="chart-item flex items-center gap-2">
            <div class="flex items-center gap-1 flex-1">
              <span class="text-lg">${icon}</span>
              <div class="flex-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-white">${label}</span>
                  <span class="text-cyan-400 font-bold">${Math.round(amount)} L</span>
                </div>
                <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" style="width: ${percentage}%"></div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
  }
  
  const savingsChart = document.getElementById('savings-chart');
  if (Object.keys(costMap).length === 0) {
    savingsChart.innerHTML = '<p class="text-slate-400 text-xs text-center py-4">No data available yet</p>';
  } else {
    const maxCost = Math.max(...Object.values(costMap));
    savingsChart.innerHTML = Object.entries(costMap)
      .sort((a, b) => b[1] - a[1])
      .map(([activityKey, cost]) => {
        const percentage = (cost / maxCost) * 100;
        const activityObj = ActivityCatalog[activityKey];
        const icon = activityObj?.icon || '📍';
        const label = activityObj?.label || activityKey;
        return `
          <div class="chart-item flex items-center gap-2">
            <div class="flex items-center gap-1 flex-1">
              <span class="text-lg">${icon}</span>
              <div class="flex-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-white">${label}</span>
                  <span class="text-emerald-400 font-bold">${cost.toFixed(2)} EGP</span>
                </div>
                <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style="width: ${percentage}%"></div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
  }
}

function updateAllDisplays() {
  updateHomeStats();
}

document.getElementById('calc-activity').addEventListener('change', updateCalculator);
document.getElementById('calc-minutes').addEventListener('input', (e) => {
  document.getElementById('minutes-display').textContent = e.target.value;
  updateCalculator();
});

function updateCalculator() {
  const activityKey = document.getElementById('calc-activity').value;
  const minutes = parseFloat(document.getElementById('calc-minutes').value);
  
  if (!activityKey || minutes <= 0) {
    document.getElementById('calc-results').classList.add('hidden');
    document.getElementById('calc-error').classList.add('hidden');
    return;
  }
  
  if (!ActivityCatalog[activityKey]) {
    document.getElementById('calc-error').textContent = '❌ Activity not found in catalog!';
    document.getElementById('calc-error').classList.remove('hidden');
    document.getElementById('calc-results').classList.add('hidden');
    return;
  }
  
  document.getElementById('calc-error').classList.add('hidden');
  document.getElementById('calc-results').classList.remove('hidden');
  
  const baseWater = ActivityCatalog[activityKey].baseWaterPerMinute;
  const waterPrice = config.water_price_per_liter || 0.008;
  
  const dailyWater = baseWater * minutes;
  const dailyCost = dailyWater * waterPrice;
  
  const weeklyWater = dailyWater * 7;
  const weeklyCost = weeklyWater * waterPrice;
  
  const monthlyWater = dailyWater * 30;
  const monthlyCost = monthlyWater * waterPrice;
  
  document.getElementById('calc-daily-water').textContent = Math.round(dailyWater) + ' L';
  document.getElementById('calc-daily-cost').textContent = dailyCost.toFixed(2) + ' EGP';
  
  document.getElementById('calc-weekly-water').textContent = Math.round(weeklyWater) + ' L';
  document.getElementById('calc-weekly-cost').textContent = weeklyCost.toFixed(2) + ' EGP';
  
  document.getElementById('calc-monthly-water').textContent = Math.round(monthlyWater) + ' L';
  document.getElementById('calc-monthly-cost').textContent = monthlyCost.toFixed(2) + ' EGP';
  
  let comparison = '';
  if (dailyWater <= 20) {
    comparison = 'Water consumption is low & efficient!';
  } else if (dailyWater <= 50) {
    comparison = 'Moderate consumption level.';
  } else if (dailyWater <= 100) {
    comparison = 'High consumption! Try reducing duration.';
  } else {
    comparison = 'Very high consumption! Urgent reduction needed.';
  }
  
  document.getElementById('calc-comparison').textContent = comparison;
}

document.querySelectorAll('.activity-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.activity-btn').forEach(b => {
      b.classList.remove('active', 'ring-2', 'ring-cyan-400', 'bg-cyan-500/20', 'border-cyan-500/50');
    });
    
    btn.classList.add('active', 'ring-2', 'ring-cyan-400', 'bg-cyan-500/20', 'border-cyan-500/50');
    
    const activityKey = btn.dataset.activity;
    const activityObj = ActivityCatalog[activityKey];
    selectedActivity = {
          key: activityKey,
      label: activityObj.label,
      icon: activityObj.icon,
      baseWater: activityObj.baseWaterPerMinute,
      minTime: activityObj.minTime,
      maxTime: activityObj.maxTime
    };
       
    document.getElementById('activity-details').classList.remove('hidden');
    document.getElementById('selected-activity-name').textContent = selectedActivity.label + ' ' + selectedActivity.icon;
    document.getElementById('activity-message').classList.add('hidden');
    document.getElementById('duration-input').value = 5;
    
    updateCalculations();
  });
});

document.getElementById('duration-input').addEventListener('input', updateCalculations);

function updateCalculations() {
  if (!selectedActivity) return;
  
  const duration = parseFloat(document.getElementById('duration-input').value) || 0;
  const wastageAmount = selectedActivity.baseWater * duration;
  const waterPrice = parseFloat(config.water_price_per_liter) || 0.008;
  const cost = wastageAmount * waterPrice;
  
  document.getElementById('calculation-wastage').textContent = Math.round(wastageAmount) + ' L';
  document.getElementById('calculation-savings').textContent = cost.toFixed(2) + ' EGP';
}

function checkTimeAppropriate(activityKey, duration) {
  const activity = ActivityCatalog[activityKey];
  if (!activity) return false;
  return duration >= activity.minTime && duration <= activity.maxTime;
}

document.getElementById('btn-save-activity').addEventListener('click', () => {
  if (!selectedActivity) return;
  
  const duration = parseFloat(document.getElementById('duration-input').value) || 0;
  
  if (duration <= 0) {
    const msg = document.getElementById('activity-message');
    msg.className = 'p-3 rounded-lg text-sm text-center bg-red-500/20 border border-red-500/30 text-red-400';
    msg.textContent = '❌ Please enter a valid duration!';
    msg.classList.remove('hidden');
    return;
  }
  
  const wastageAmount = selectedActivity.baseWater * duration;
  const waterPrice = parseFloat(config.water_price_per_liter) || 0.008;
  const cost = wastageAmount * waterPrice;
  const isTimeAppropriate = checkTimeAppropriate(selectedActivity.key, duration);
  
  const newRecord = {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    activity: selectedActivity.key,
    duration: duration,
    wastageAmount: wastageAmount,
    cost: cost,
    timeAppropriate: isTimeAppropriate
  };
  
  allRecords.push(newRecord);
  saveToLocalStorage();
  updateAllDisplays();
  
  showTimeMessage(isTimeAppropriate, selectedActivity.label, duration);
  
  document.getElementById('duration-input').value = 5;
  document.querySelectorAll('.activity-btn').forEach(b => {
    b.classList.remove('active', 'ring-2', 'ring-cyan-400', 'bg-cyan-500/20', 'border-cyan-500/50');
  });
  document.getElementById('activity-details').classList.add('hidden');
  selectedActivity = null;
  
  setTimeout(() => showTab('home'), 2000);
});

document.getElementById('btn-cancel-activity').addEventListener('click', () => {
  document.getElementById('activity-details').classList.add('hidden');
  document.querySelectorAll('.activity-btn').forEach(b => {
    b.classList.remove('active', 'ring-2', 'ring-cyan-400', 'bg-cyan-500/20', 'border-cyan-500/50');
  });
  selectedActivity = null;
});

async function onConfigChange(cfg) {
  config = { ...defaultConfig, ...cfg };
  document.getElementById('app-title').textContent = config.app_title || defaultConfig.app_title;
  document.getElementById('app-title-about').textContent = config.app_title || defaultConfig.app_title;
  document.getElementById('developer-name').textContent = config.developer_name || defaultConfig.developer_name;
}

function mapToCapabilities(cfg) {
  return {
    recolorables: [],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  };
}

function mapToEditPanelValues(cfg) {
  return new Map([
    ['app_title', cfg.app_title || defaultConfig.app_title],
    ['water_price_per_liter', (cfg.water_price_per_liter || defaultConfig.water_price_per_liter).toString()],
    ['developer_name', cfg.developer_name || defaultConfig.developer_name]
  ]);
}

(async () => {
  loadFromLocalStorage();
  
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities,
      mapToEditPanelValues
    });
  } else {
    onConfigChange(defaultConfig);
  }
})();
