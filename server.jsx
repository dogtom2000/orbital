Parts = new Mongo.Collection("parts");

var testVal = 0;
var currentStage = "";
var RocketPartObject = {
	stageThree: {commandModule: "",fuelTank: "",rocketEngine: ""},
	stageTwo: {fuelTank: "",rocketEngine: ""},
	stageOne: {fuelTank: "",rocketEngine: ""}
}

var Planet = {
    name: "Earth",
    sgp: 3.986e14,
    radius: 6.371e6,
    pressure: 1,
    atmScale: 7,
    atmHeight: 1.4e5,
    atmWeight: 28.97,
    dayLength: 86400
};

OrbitalHome = React.createClass({

	mixins: [ReactMeteorData],

	getMeteorData() {
		return {
			parts: Parts.find({}).fetch()
		}
	},
	//adding rocket part object broke this
	clickPart(e){
		var stagePartType = Parts.find({_id: e.currentTarget.id}).fetch()[0].partType;

		switch (Session.get('selectedStage')){
			case "stage-3":
					currentStage = "stageThree";
				break;
			case "stage-2":
					currentStage = "stageTwo";
				break;
			case "stage-1":
					currentStage = "stageOne";
				break;	
		}
		if (currentStage == "stageThree" && stagePartType == "commandModule" || stagePartType !== "commandModule"){
			RocketPartObject[currentStage][stagePartType] = e.currentTarget.id;
		}

		this.redraw();
	},

	clickStage(e){
		$("#stage-3").removeClass('green');
		$("#stage-2").removeClass('green');
		$("#stage-1").removeClass('green');	
		Session.set('selectedStage', e.currentTarget.id);
		$(("#" + e.currentTarget.id)).addClass('green');
		this.redraw();
	},


	clickConfigure(){
		testVal = 1;
		this.forceUpdate()
	},

	configuredRocket(){
		if (testVal === 0){
			var orbit = "Rocket not configured";
		} else {
			Rocket = configureRocket(RocketPartObject);
			orbit = orbitBody(Planet, Rocket, 150000);
			drawchart(orbit[3]);
			var out1 = orbit[0][1];
			var out2 = Math.round(orbit[2] - 6371000);

		}
		return <tr><td>{out1}</td><td>{out2}</td></tr>
	},

	clickClear(){
		RocketPartObject = {
			stageThree: {commandModule: "",fuelTank: "",rocketEngine: ""},
			stageTwo: {fuelTank: "",rocketEngine: ""},
			stageOne: {fuelTank: "",rocketEngine: ""}
			}
		testVal = 0;
		this.forceUpdate()
		d3.select("#chart").selectAll("svg").remove();
		this.redraw();
	},

	redraw(){
		switch (Session.get('selectedStage')){
			case "stage-3":
					currentStage = "stageThree";
				break;
			case "stage-2":
					currentStage = "stageTwo";
				break;
			case "stage-1":
					currentStage = "stageOne";
				break;	
		}
		var currentStageParts = [RocketPartObject[currentStage].commandModule, RocketPartObject[currentStage].fuelTank, RocketPartObject[currentStage].rocketEngine];
		for (var i = 0; i < Parts.find({}).fetch().length; i++){
			var currentId = Parts.find({}).fetch()[i]._id;
			var index = currentStageParts.indexOf(currentId);
			if(index == -1){
				$(("#" + currentId)).removeClass('yellow');
			} else {
				$(("#" + currentId)).addClass('yellow');
			};
		}
	},

	stageParts(stage){
		return ""
	},

	cmTable(){
		var partsArray = Parts.find({"partType": "commandModule"}, {sort: {name: 1}}).fetch();
		return partsArray.map((part) => <tr><td>{part.name}</td><td className="table-number">{part.mass}</td><td className="table-number">{part.diameter}</td><td className="table-number">{part.drag}</td><td></td><td></td><td className="table-button"><button id={part._id} onClick={this.clickPart}>Add {part.name}</button></td></tr>);
	},
	ftTable(){
		var partsArray = Parts.find({"partType": "fuelTank"}, {sort: {name: 1}}).fetch();
		return partsArray.map((part) => <tr><td>{part.name}</td><td className="table-number">{part.dryMass}</td><td className="table-number">{part.fuelMass}</td><td className="table-number">{part.diameter}</td><td className="table-number">{part.drag}</td><td></td><td className="table-button"><button id={part._id} onClick={this.clickPart}>Add {part.name}</button></td></tr>);
	},
	reTable(){
		var partsArray = Parts.find({"partType": "rocketEngine"}, {sort: {name: 1}}).fetch();
		return partsArray.map((part) => <tr><td>{part.name}</td><td className="table-number">{part.mass}</td><td className="table-number">{part.thrust}</td><td className="table-number">{part.isp}</td><td className="table-number">{part.diameter}</td><td className="table-number">{part.drag}</td><td className="table-button"><button id={part._id} onClick={this.clickPart}>Add {part.name}</button></td></tr>);
	},
	
	render(){
		return(
			<div>
				<div id="left-col">
						<table>
							<tr>
								<th>name</th>
								<th className="table-number">mass</th>
								<th className="table-number">diameter</th>
								<th className="table-number">drag</th>
								<th className="table-number"></th>
								<th className="table-number"></th>
								<th className="table-button">include</th>
							</tr>
								{this.cmTable(this.data.parts)}
						</table>
						<table>
							<tr>
								<th>name</th>
								<th className="table-number">dry mass</th>
								<th className="table-number">fuel mass</th>
								<th className="table-number">diameter</th>
								<th className="table-number">drag</th>
								<th className="table-number"></th>
								<th className="table-button">include</th>
							</tr>
								{this.ftTable(this.data.parts)}
						</table>
						<table>
							<tr>
								<th>name</th>
								<th className="table-number">mass</th>
								<th className="table-number">thrust</th>
								<th className="table-number">isp</th>
								<th className="table-number">diameter</th>
								<th className="table-number">drag</th>
								<th className="table-button">include</th>
							</tr>
								{this.reTable(this.data.parts)}
						</table>
				</div>
				<div id="right-col">
					<span>
					<button id="stage-3" onClick={this.clickStage}>Stage 3</button><br/>
					<p>{this.stageParts()}</p><br/>
					<button id="stage-2" onClick={this.clickStage}>Stage 2</button><br/>
					<p>{this.stageParts()}</p><br/>
					<button id="stage-1" onClick={this.clickStage}>Stage 1</button><br/>
					<p>{this.stageParts()}</p><br/>
					<button id="launch" onClick={this.clickConfigure}>Configure and Launch Rocket </button><br/>
					<p></p><br/>
					<button id="clear" onClick={this.clickClear}>Clear Rocket</button><br/>
					<table>
						<tr>
							<th>Status</th>
							<th>Max Hieght</th>
						</tr>
					{this.configuredRocket()}
					</table>
					</span>
				</div>
			</div>
			)
	}
});
