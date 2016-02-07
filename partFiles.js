insertParts = function(){
	Parts.insert({partType: "rocketEngine", name: "RE1", mass: 2000, thrust: 340000, isp: 350, diameter: 5, drag: 0.2});
	Parts.insert({partType: "rocketEngine", name: "RE2", mass: 1000, thrust: 140000, isp: 350, diameter: 3, drag: 0.2});
	Parts.insert({partType: "rocketEngine", name: "RE3", mass: 500, thrust: 45000, isp: 350, diameter: 3, drag: 0.2});
	Parts.insert({partType: "fuelTank", name: "FT1", dryMass: 1000, fuelMass: 13500, diameter: 5, drag: 0.2});
	Parts.insert({partType: "fuelTank", name: "FT2", dryMass: 500, fuelMass: 6750, diameter: 3, drag: 0.2});
	Parts.insert({partType: "fuelTank", name: "FT3", dryMass: 200, fuelMass: 2700, diameter: 3, drag: 0.2});
	Parts.insert({partType: "commandModule", name: "CM1", mass: 250, diameter: 5, drag: 0.2});
	Parts.insert({partType: "commandModule", name: "CM2", mass: 100, diameter: 3, drag: 0.2});
}
