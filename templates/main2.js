const buildingTypes = {
    'Market': { baseRevenue: 100, revenueGrowth: 50, baseWorkers: 2, workersGrowth: 1 },
    'Blacksmith': { baseRevenue: 75, revenueGrowth: 35, baseWorkers: 1, workersGrowth: 1 },
    'Temple': { baseRevenue: 50, revenueGrowth: 25, baseWorkers: 2, workersGrowth: 1 },
    'Castle': { baseRevenue: 200, revenueGrowth: 100, baseWorkers: 5, workersGrowth: 2 },
    'Harbor': { baseRevenue: 150, revenueGrowth: 75, baseWorkers: 3, workersGrowth: 2 },
    'Farm': { baseRevenue: 80, revenueGrowth: 40, baseWorkers: 3, workersGrowth: 1 },
    'Mine': { baseRevenue: 120, revenueGrowth: 60, baseWorkers: 4, workersGrowth: 2 },
    'Trading Post': { baseRevenue: 90, revenueGrowth: 45, baseWorkers: 2, workersGrowth: 1 },
    'Guard Tower': { baseRevenue: 40, revenueGrowth: 20, baseWorkers: 1, workersGrowth: 1 },
    'Cathedral': { baseRevenue: 180, revenueGrowth: 90, baseWorkers: 4, workersGrowth: 2 }
};

let cities = [
    {
        name: "Kingsbury",
        level: 5,
        unassignedWorkers: 3,
        buildings: [
            { type: "Castle", level: 1, workers: 2 },
            { type: "Cathedral", level: 1, workers: 0 },
            { type: "Market", level: 1, workers: 0 },
            { type: "Blacksmith", level: 1, workers: 0 }
        ]
    }
];

let armies = [
    {
        name: "Royal Guard",
        manpower: 5000,
        supply: 10000
    }
];

/**
 * @param {string} title
 * @param {string} message
 * @param {string} confirmText
 * @param {Function} onConfirm
 */
function showDialog(title, message, confirmText, onConfirm) {
    const container = document.getElementById('dialogContainer');
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'delete-btn';
    confirmButton.textContent = confirmText;
    confirmButton.addEventListener('click', () => {
        onConfirm();
        dialog.remove();
    });
    
    dialog.innerHTML = `
        <div class="dialog">
            <h3>${title}</h3>
            <p>${message}</p>
            <button onclick="this.closest('.dialog-overlay').remove()">Cancel</button>
        </div>
    `;
    
    // Append the confirm button to the dialog's inner div
    dialog.querySelector('.dialog').appendChild(confirmButton);
    container.appendChild(dialog);
}

function calculateBuildingWorkerCapacity(building) {
    const baseStats = buildingTypes[building.type];
    return baseStats.baseWorkers + (baseStats.workersGrowth * (building.level - 1));
}

function calculateBuildingRevenue(building) {
    const baseStats = buildingTypes[building.type];
    const efficiency = building.workers / calculateBuildingWorkerCapacity(building);
    return Math.floor((baseStats.baseRevenue + (baseStats.revenueGrowth * (building.level - 1))) * efficiency);
}

function calculateCityRevenue(city) {
    return city.buildings.reduce((total, building) => {
        return total + calculateBuildingRevenue(building);
    }, 0);
}

function toggleCollapsibleOLD(element) {
    const content = element.nextElementSibling;
    content.classList.toggle('expanded');
    const icon = element.querySelector('.expand-icon');
    icon.textContent = content.classList.contains('expanded') ? '▼' : '▶';
}

function addWorker(cityIndex, buildingIndex) {
    const city = cities[cityIndex];
    const building = city.buildings[buildingIndex];
    const capacity = calculateBuildingWorkerCapacity(building);
    
    if (city.unassignedWorkers > 0 && building.workers < capacity) {
        city.unassignedWorkers--;
        building.workers++;
        renderCities();
    }
}

function removeWorker(cityIndex, buildingIndex) {
    const city = cities[cityIndex];
    const building = city.buildings[buildingIndex];
    
    if (building.workers > 0) {
        city.unassignedWorkers++;
        building.workers--;
        renderCities();
    }
}

function confirmDeleteCity(cityIndex) {
    showDialog(
        'Delete City',
        `Are you sure you want to delete ${cities[cityIndex].name}?`,
        'Delete',
        () => deleteCity(cityIndex)
    );
}

function confirmRemoveBuilding(cityIndex, buildingIndex) {
    const building = cities[cityIndex].buildings[buildingIndex];
    showDialog(
        'Remove Building',
        `Are you sure you want to remove the ${building.type}?`,
        'Remove',
        () => removeBuilding(cityIndex, buildingIndex)
    );
}

function upgradeCity(cityIndex) {
    cities[cityIndex].level++;
    cities[cityIndex].unassignedWorkers++;
    renderCities();
}

function addCity() {
    const name = document.getElementById('cityName').value;
    
    if (name) {
        cities.push({
            name: name,
            level: 1,
            unassignedWorkers: 1,
            buildings: []
        });
        
        document.getElementById('cityName').value = '';
        renderCities();
    }
}

function addArmy() {
    const name = document.getElementById('armyName').value;
    const manpower = parseInt(document.getElementById('armyManpower').value);
    const supply = parseInt(document.getElementById('armySupply').value);
    
    if (name && manpower && supply) {
        armies.push({
            name: name,
            manpower: manpower,
            supply: supply
        });
        
        document.getElementById('armyName').value = '';
        document.getElementById('armyManpower').value = '';
        document.getElementById('armySupply').value = '';
        renderArmies();
    }
}

function addBuilding(cityIndex) {
    const buildingSelect = document.getElementById(`newBuildingType${cityIndex}`);
    const buildingType = buildingSelect.value;
    
    if (buildingType) {
        cities[cityIndex].buildings.push({
            type: buildingType,
            level: 1,
            workers: 0
        });
        renderCities();
    }
}

function removeBuilding(cityIndex, buildingIndex) {
    const building = cities[cityIndex].buildings[buildingIndex];
    cities[cityIndex].unassignedWorkers += building.workers;
    cities[cityIndex].buildings.splice(buildingIndex, 1);
    renderCities();
}

function upgradeBuilding(cityIndex, buildingIndex) {
    cities[cityIndex].buildings[buildingIndex].level += 1;
    renderCities();
}

function deleteCity(index) {
    cities.splice(index, 1);
    renderCities();
}

function deleteArmy(index) {
    armies.splice(index, 1);
    renderArmies();
}
// New Render Armies

// Store and retrieve army collapsible states
const ARMY_STORAGE_KEY = 'armyCollapsibleStates';

function saveArmyCollapsibleStates() {
    const states = {};
    document.querySelectorAll('#armiesList .item').forEach((armyDiv, armyIndex) => {
        states[`army_${armyIndex}`] = armyDiv.querySelector('.collapsible').classList.contains('active');
    });
    localStorage.setItem(ARMY_STORAGE_KEY, JSON.stringify(states));
}

function getArmyCollapsibleStates() {
    const stored = localStorage.getItem(ARMY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

function renderArmies() {
    const armiesList = document.getElementById('armiesList');
    armiesList.innerHTML = '';
    
    // Get saved states
    const savedStates = getArmyCollapsibleStates();
    
    armies.forEach((army, index) => {
        const armyDiv = document.createElement('div');
        armyDiv.className = 'item';
        
        // Get saved army state
        const isArmyOpen = savedStates[`army_${index}`];
        const armyExpandIcon = isArmyOpen ? '▼' : '▶';
        const armyActiveClass = isArmyOpen ? 'active' : '';
        
        armyDiv.innerHTML = `
            <h3 onclick="toggleCollapsible(this, 'army')">
                <span class="expand-icon">${armyExpandIcon}</span>
                ${army.name}
            </h3>
            <div class="collapsible ${armyActiveClass}">
                <div class="stats">
                    Manpower: ${army.manpower.toLocaleString()}<br>
                    Supply: ${army.supply.toLocaleString()}
                </div>
                <button class="delete-btn" onclick="deleteArmy(${index})">Delete Army</button>
            </div>
        `;
        
        armiesList.appendChild(armyDiv);
    });
}


// New Render Armies


function renderArmiesOld() {
    const armiesList = document.getElementById('armiesList');
    armiesList.innerHTML = '';
    
    armies.forEach((army, index) => {
        const armyDiv = document.createElement('div');
        armyDiv.className = 'item';
        
        armyDiv.innerHTML = `
            <h3 onclick="toggleCollapsible(this)">
                <span class="expand-icon">▶</span>
                ${army.name}
            </h3>
            <div class="collapsible">
                <div class="stats">
                    Manpower: ${army.manpower.toLocaleString()}<br>
                    Supply: ${army.supply.toLocaleString()}
                </div>
                <button class="delete-btn" onclick="deleteArmy(${index})">Delete Army</button>
            </div>
        `;
        
        armiesList.appendChild(armyDiv);
    });
}

// -- NEW

// Store and retrieve collapsible states
const STORAGE_KEY = 'cityCollapsibleStates';

function saveCollapsibleStates() {
    const states = {};
    document.querySelectorAll('.item').forEach((cityDiv, cityIndex) => {
        // Save city state
        states[`city_${cityIndex}`] = cityDiv.querySelector('.collapsible').classList.contains('active');
        
        // Save building states
        const buildingStates = {};
        cityDiv.querySelectorAll('.building-item').forEach((buildingDiv, buildingIndex) => {
            buildingStates[`building_${buildingIndex}`] = buildingDiv.querySelector('.building-details').classList.contains('active');
        });
        states[`city_${cityIndex}_buildings`] = buildingStates;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}

function getCollapsibleStates() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

function toggleCollapsible(element) {
    const collapsible = element.nextElementSibling;
    const expandIcon = element.querySelector('.expand-icon');
    
    collapsible.classList.toggle('active');
    expandIcon.textContent = collapsible.classList.contains('active') ? '▼' : '▶';
    
    // Save states after toggle
    saveCollapsibleStates();
    saveArmyCollapsibleStates();
}

function renderCities() {
    const citiesList = document.getElementById('citiesList');
    citiesList.innerHTML = '';
    
    // Get saved states
    const savedStates = getCollapsibleStates();
    
    cities.forEach((city, cityIndex) => {
        const cityDiv = document.createElement('div');
        cityDiv.className = 'item';
        
        const buildingsList = city.buildings.map((building, buildingIndex) => {
            const capacity = calculateBuildingWorkerCapacity(building);
            const efficiency = Math.floor((building.workers / capacity) * 100);
            
            // Get saved building state
            const isBuildingOpen = savedStates[`city_${cityIndex}_buildings`]?.[`building_${buildingIndex}`];
            const buildingExpandIcon = isBuildingOpen ? '▼' : '▶';
            const buildingActiveClass = isBuildingOpen ? 'active' : '';
            
            return `
                <div class="building-item">
                    <div class="building-header" onclick="toggleCollapsible(this)">
                        <span class="expand-icon">${buildingExpandIcon}</span>
                        <div class="building-info">
                            ${building.type} 
                            <span class="level-badge">Level ${building.level}</span>
                            <span class="worker-badge">${building.workers}/${capacity} Workers</span>
                        </div>
                    </div>
                    <div class="building-details collapsible ${buildingActiveClass}">
                        Revenue: ${calculateBuildingRevenue(building)} gold
                        <div class="worker-controls">
                            <button onclick="removeWorker(${cityIndex}, ${buildingIndex})"
                                    ${building.workers === 0 ? 'disabled' : ''}>
                                - Worker
                            </button>
                            <div class="worker-display">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${efficiency}%"></div>
                                </div>
                                ${efficiency}% Efficiency
                            </div>
                            <button onclick="addWorker(${cityIndex}, ${buildingIndex})"
                                    ${(city.unassignedWorkers === 0 || building.workers >= capacity) ? 'disabled' : ''}>
                                + Worker
                            </button>
                        </div>
                        <button class="upgrade-btn" onclick="upgradeBuilding(${cityIndex}, ${buildingIndex})">
                            Upgrade to Level ${building.level + 1}
                        </button>
                        <button class="delete-btn" onclick="confirmRemoveBuilding(${cityIndex}, ${buildingIndex})">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const buildingOptions = Object.keys(buildingTypes)
            .map(type => `<option value="${type}">${type}</option>`)
            .join('');

        // Get saved city state
        const isCityOpen = savedStates[`city_${cityIndex}`];
        const cityExpandIcon = isCityOpen ? '▼' : '▶';
        const cityActiveClass = isCityOpen ? 'active' : '';

        cityDiv.innerHTML = `
            <h3 onclick="toggleCollapsible(this)">
                <span class="expand-icon">${cityExpandIcon}</span>
                ${city.name}
            </h3>
            <div class="collapsible ${cityActiveClass}">
                <div class="stats">
                    City Level: ${city.level} 
                    (Available Workers: ${city.unassignedWorkers}/${city.level})
                </div>
                <div class="total-revenue">Total Revenue: ${calculateCityRevenue(city)} gold per day</div>
                <button class="upgrade-btn" onclick="upgradeCity(${cityIndex})">
                    Upgrade City to Level ${city.level + 1}
                </button>
                <div>
                    <h4>Buildings:</h4>
                    <div class="buildings-list">${buildingsList}</div>
                    <select id="newBuildingType${cityIndex}" class="building-select">
                        ${buildingOptions}
                    </select>
                    <button onclick="addBuilding(${cityIndex})">Add Building</button>
                </div>
                <button class="delete-btn" onclick="confirmDeleteCity(${cityIndex})">Delete City</button>
            </div>
        `;
        
        citiesList.appendChild(cityDiv);
    });
}

//   -- NEW


function renderCitiesOld() {
    const citiesList = document.getElementById('citiesList');
    citiesList.innerHTML = '';
    
    cities.forEach((city, cityIndex) => {
        const cityDiv = document.createElement('div');
        cityDiv.className = 'item';
        
        const buildingsList = city.buildings.map((building, buildingIndex) => {
            const capacity = calculateBuildingWorkerCapacity(building);
            const efficiency = Math.floor((building.workers / capacity) * 100);
            
            return `
                <div class="building-item">
                    <div class="building-header" onclick="toggleCollapsible(this)">
                        <span class="expand-icon">▶</span>
                        <div class="building-info">
                            ${building.type} 
                            <span class="level-badge">Level ${building.level}</span>
                            <span class="worker-badge">${building.workers}/${capacity} Workers</span>
                        </div>
                    </div>
                    <div class="building-details collapsible">
                        Revenue: ${calculateBuildingRevenue(building)} gold
                        <div class="worker-controls">
                            <button onclick="removeWorker(${cityIndex}, ${buildingIndex})"
                                    ${building.workers === 0 ? 'disabled' : ''}>
                                - Worker
                            </button>
                            <div class="worker-display">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${efficiency}%"></div>
                                </div>
                                ${efficiency}% Efficiency
                            </div>
                            <button onclick="addWorker(${cityIndex}, ${buildingIndex})"
                                    ${(city.unassignedWorkers === 0 || building.workers >= capacity) ? 'disabled' : ''}>
                                + Worker
                            </button>
                        </div>
                        <button class="upgrade-btn" onclick="upgradeBuilding(${cityIndex}, ${buildingIndex})">
                            Upgrade to Level ${building.level + 1}
                        </button>
                        <button class="delete-btn" onclick="confirmRemoveBuilding(${cityIndex}, ${buildingIndex})">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const buildingOptions = Object.keys(buildingTypes)
            .map(type => `<option value="${type}">${type}</option>`)
            .join('');

        cityDiv.innerHTML = `
            <h3 onclick="toggleCollapsible(this)">
                <span class="expand-icon">▶</span>
                ${city.name}
            </h3>
            <div class="collapsible">
                <div class="stats">
                    City Level: ${city.level} 
                    (Available Workers: ${city.unassignedWorkers}/${city.level})
                </div>
                <div class="total-revenue">Total Revenue: ${calculateCityRevenue(city)} gold per day</div>
                <button class="upgrade-btn" onclick="upgradeCity(${cityIndex})">
                    Upgrade City to Level ${city.level + 1}
                </button>
                <div>
                    <h4>Buildings:</h4>
                    <div class="buildings-list">${buildingsList}</div>
                    <select id="newBuildingType${cityIndex}" class="building-select">
                        ${buildingOptions}
                    </select>
                    <button onclick="addBuilding(${cityIndex})">Add Building</button>
                </div>
                <button class="delete-btn" onclick="confirmDeleteCity(${cityIndex})">Delete City</button>
            </div>
        `;
        
        citiesList.appendChild(cityDiv);
    });
}

// Initial render
renderCities();
renderArmies();