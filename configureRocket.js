configureRocket = function(RocketPartObject){

var s11 = Parts.find({_id: RocketPartObject.stageThree.commandModule}).fetch()[0];
var s12 = Parts.find({_id: RocketPartObject.stageThree.fuelTank}).fetch()[0];
var s13 = Parts.find({_id: RocketPartObject.stageThree.rocketEngine}).fetch()[0];
var s22 = Parts.find({_id: RocketPartObject.stageTwo.fuelTank}).fetch()[0];
var s23 = Parts.find({_id: RocketPartObject.stageTwo.rocketEngine}).fetch()[0];
var s32 = Parts.find({_id: RocketPartObject.stageOne.fuelTank}).fetch()[0];
var s33 = Parts.find({_id: RocketPartObject.stageOne.rocketEngine}).fetch()[0];

var s1array = [];
var s2array = [];
var s3array = [];
var stageCount = 3;





if (s11 !== undefined && s12 !== undefined && s13 !== undefined){
	var s1dryMass = s11.mass + s12.dryMass + s13.mass;
	var s1fuelMass = s12.fuelMass;
	var s1fsMass = 0;
	var s1drag = Math.max(s11.drag, s12.drag, s13.drag);
	var s1diameter = Math.max(s11.diameter, s12.diameter, s13.diameter);
	var s1thrust = s13.thrust;
	var s1isp = s13.isp;
	s1array = [[s1fuelMass, s1fuelMass], s1dryMass, s1fsMass, s1drag, s1diameter, s1thrust, s1isp];
}

if (s22 !== undefined && s23 !== undefined){
	var s2dryMass = s22.dryMass + s23.mass;
	var s2fuelMass = s22.fuelMass;
	var s2fsMass = s1dryMass + s1fuelMass;
	var s2drag = Math.max(s11.drag, s12.drag, s13.drag, s22.drag, s23.drag);
	var s2diameter = Math.max(s11.diameter, s12.diameter, s13.diameter, s22.diameter, s23.diameter);
	var s2thrust = s23.thrust;
	var s2isp = s23.isp;
	s2array = [[s2fuelMass, s2fuelMass], s2dryMass, s2fsMass, s2drag, s2diameter, s2thrust, s2isp];
} else {
	stageCount = 1;
}

if (s32 !== undefined && s33 !== undefined){
	var s3dryMass = s32.dryMass + s33.mass;
	var s3fuelMass = s32.fuelMass;
	var s3fsMass = s2fsMass + s2dryMass + s2fuelMass;
	var s3drag = Math.max(s11.drag, s12.drag, s13.drag, s22.drag, s23.drag, s32.drag, s33.drag);
	var s3diameter = Math.max(s11.diameter, s12.diameter, s13.diameter, s22.diameter, s23.diameter, s32.diameter, s33.diameter);
	var s3thrust = s33.thrust;
	var s3isp = s33.isp;
	s3array = [[s3fuelMass, s3fuelMass], s3dryMass, s3fsMass, s3drag, s3diameter, s3thrust, s3isp];
} else if (stageCount == 3){
	stageCount = 2;
}


var Rocket = {
    name: "rocketName",
    stageCount: stageCount,
    stages: {
        1: s1array,
        2: s2array,
        3: s3array,
    }
};

if (stageCount == 2){
	delete Rocket.stages[3];

} else if (stageCount == 1){
	delete Rocket.stages[2];
	delete Rocket.stages[3];
}
	return Rocket;
}