insertParts = function(){
	Parts.insert({partType: "rocketEngine", name: "RE1", mass: 2000, thrust: 140000, isp: 350, diameter: 5, drag: 0.2});
	Parts.insert({partType: "fuelTank", name: "FT1", dryMass: 500, fuelMass: 10000, diameter: 5, drag: 0.2});
	Parts.insert({partType: "commandModule", name: "CM1", mass: 500, diameter: 5, drag: 0.2});
}
