// Building types with base revenue
const buildingTypes = {
	Market: { baseRevenue: 100, revenueGrowth: 50 },
	Blacksmith: { baseRevenue: 75, revenueGrowth: 35 },
	Temple: { baseRevenue: 50, revenueGrowth: 25 },
	Castle: { baseRevenue: 200, revenueGrowth: 100 },
	Harbor: { baseRevenue: 150, revenueGrowth: 75 },
	Farm: { baseRevenue: 80, revenueGrowth: 40 },
	Mine: { baseRevenue: 120, revenueGrowth: 60 },
	"Trading Post": { baseRevenue: 90, revenueGrowth: 45 },
	"Guard Tower": { baseRevenue: 40, revenueGrowth: 20 },
	Cathedral: { baseRevenue: 180, revenueGrowth: 90 },
};

let cities = [
	{
		name: "Kingsbury",
		population: 50000,
		buildings: [
			{ type: "Castle", level: 1 },
			{ type: "Cathedral", level: 1 },
			{ type: "Market", level: 1 },
			{ type: "Blacksmith", level: 1 },
		],
	},
	{
		name: "Riverkeep",
		population: 30000,
		buildings: [
			{ type: "Harbor", level: 1 },
			{ type: "Trading Post", level: 1 },
			{ type: "Temple", level: 1 },
			{ type: "Guard Tower", level: 1 },
		],
	},
];

let armies = [
	{
		name: "Royal Guard",
		manpower: 5000,
		supply: 10000,
	},
	{
		name: "Northern Legion",
		manpower: 8000,
		supply: 15000,
	},
];

function calculateBuildingRevenue(building) {
	const baseStats = buildingTypes[building.type];
	return (
		baseStats.baseRevenue + baseStats.revenueGrowth * (building.level - 1)
	);
}

function calculateCityRevenue(city) {
	return city.buildings.reduce((total, building) => {
		return total + calculateBuildingRevenue(building);
	}, 0);
}

function renderCities() {
	const citiesList = document.getElementById("citiesList");
	citiesList.innerHTML = "";

	cities.forEach((city, cityIndex) => {
		const cityDiv = document.createElement("div");
		cityDiv.className = "item";

		const buildingsList = city.buildings
			.map(
				(building, buildingIndex) => `
                    <div class="building-item">
                        <div class="building-info">
                            ${building.type} 
                            <span class="level-badge">Level ${
								building.level
							}</span>
                            - Revenue: ${calculateBuildingRevenue(
								building
							)} gold
                        </div>
                        <button class="upgrade-btn" onclick="upgradeBuilding(${cityIndex}, ${buildingIndex})">
                            Upgrade (${building.level + 1})
                        </button>
                        <button class="delete-btn" onclick="removeBuilding(${cityIndex}, ${buildingIndex})">
                            Remove
                        </button>
                    </div>
                `
			)
			.join("");

		const buildingOptions = Object.keys(buildingTypes)
			.map((type) => `<option value="${type}">${type}</option>`)
			.join("");

		cityDiv.innerHTML = `
                    <h3>${city.name}</h3>
                    <div class="stats">Population: ${city.population.toLocaleString()}</div>
                    <div class="total-revenue">Total Revenue: ${calculateCityRevenue(
						city
					)} gold per day</div>
                    <div>
                        <h4>Buildings:</h4>
                        <div class="buildings-list">${buildingsList}</div>
                        <select id="newBuildingType${cityIndex}" class="building-select">
                            ${buildingOptions}
                        </select>
                        <button onclick="addBuilding(${cityIndex})">Add Building</button>
                    </div>
                    <button class="delete-btn" onclick="deleteCity(${cityIndex})">Delete City</button>
                `;

		citiesList.appendChild(cityDiv);
	});
}

function renderArmies() {
	const armiesList = document.getElementById("armiesList");
	armiesList.innerHTML = "";

	armies.forEach((army, index) => {
		const armyDiv = document.createElement("div");
		armyDiv.className = "item";

		armyDiv.innerHTML = `
                    <h3>${army.name}</h3>
                    <div class="stats">
                        Manpower: ${army.manpower.toLocaleString()}<br>
                        Supply: ${army.supply.toLocaleString()}
                    </div>
                    <button class="delete-btn" onclick="deleteArmy(${index})">Delete Army</button>
                `;

		armiesList.appendChild(armyDiv);
	});
}

function addCity() {
	const name = document.getElementById("cityName").value;
	const population = parseInt(
		document.getElementById("cityPopulation").value
	);

	if (name && population) {
		cities.push({
			name: name,
			population: population,
			buildings: [],
		});

		document.getElementById("cityName").value = "";
		document.getElementById("cityPopulation").value = "";
		renderCities();
	}
}

function addArmy() {
	const name = document.getElementById("armyName").value;
	const manpower = parseInt(document.getElementById("armyManpower").value);
	const supply = parseInt(document.getElementById("armySupply").value);

	if (name && manpower && supply) {
		armies.push({
			name: name,
			manpower: manpower,
			supply: supply,
		});

		document.getElementById("armyName").value = "";
		document.getElementById("armyManpower").value = "";
		document.getElementById("armySupply").value = "";
		renderArmies();
	}
}

function addBuilding(cityIndex) {
	const buildingSelect = document.getElementById(
		`newBuildingType${cityIndex}`
	);
	const buildingType = buildingSelect.value;

	if (buildingType) {
		cities[cityIndex].buildings.push({
			type: buildingType,
			level: 1,
		});
		renderCities();
	}
}

function removeBuilding(cityIndex, buildingIndex) {
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

// Initial render
renderCities();
renderArmies();
