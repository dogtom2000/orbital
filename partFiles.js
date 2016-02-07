insertParts = function(){
	Parts.insert({partType: "rocketEngine", name: "RE1", mass: 2000, thrust: 140000, isp: 350, diameter: 5, drag: 0.2});
	Parts.insert({partType: "rocketEngine", name: "RE2", mass: 1000, thrust: 45000, isp: 350, diameter: 3, drag: 0.2});
	Parts.insert({partType: "rocketEngine", name: "RE3", mass: 500, thrust: 15000, isp: 350, diameter: 3, drag: 0.2});
	Parts.insert({partType: "fuelTank", name: "FT1", dryMass: 1000, fuelMass: 9000, diameter: 5, drag: 0.2});
	Parts.insert({partType: "fuelTank", name: "FT2", dryMass: 500, fuelMass: 4500, diameter: 3, drag: 0.2});
	Parts.insert({partType: "fuelTank", name: "FT3", dryMass: 200, fuelMass: 1800, diameter: 3, drag: 0.2});
	Parts.insert({partType: "commandModule", name: "CM1", mass: 500, diameter: 5, drag: 0.2});
	Parts.insert({partType: "commandModule", name: "CM2", mass: 200, diameter: 3, drag: 0.2});
}
