Parts = new Mongo.Collection("parts");

var testVal = 0;
var currentStage = "";
var RocketPartObject = {
	stageOne: {commandModule: "",fuelTank: "",rocketEngine: ""},
	stageTwo: {fuelTank: "",rocketEngine: ""},
	stageThree: {fuelTank: "",rocketEngine: ""}
}

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
			case "stage-1":
					currentStage = "stageOne";
				break;
			case "stage-2":
					currentStage = "stageTwo";
				break;
			case "stage-3":
					currentStage = "stageThree";
				break;	
		}
		if (currentStage == "stageOne" && stagePartType == "commandModule" || stagePartType !== "commandModule"){
			RocketPartObject[currentStage][stagePartType] = e.currentTarget.id;
		}

		this.redraw();
	},

	clickStage(e){
		$("#stage-1").removeClass('green');
		$("#stage-2").removeClass('green');
		$("#stage-3").removeClass('green');	
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
			var what = "Rocket not configured";
		} else {
			what = configureRocket(RocketPartObject);
		}
		return <td>{what}</td>
	},

	clickClear(){
		RocketPartObject = {
			stageOne: {commandModule: "",fuelTank: "",rocketEngine: ""},
			stageTwo: {fuelTank: "",rocketEngine: ""},
			stageThree: {fuelTank: "",rocketEngine: ""}
			}
		testVal = 0;
		this.forceUpdate()
		this.redraw(); 
	},

	redraw(){
		switch (Session.get('selectedStage')){
			case "stage-1":
					currentStage = "stageOne";
				break;
			case "stage-2":
					currentStage = "stageTwo";
				break;
			case "stage-3":
					currentStage = "stageThree";
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
		return partsArray.map((part) => <tr><td>{part.name}</td><td>{part.mass}</td><td>{part.diameter}</td><td>{part.drag}</td><td><button id={part._id} onClick={this.clickPart}>Add {part.name}</button></td></tr>);
	},
	ftTable(){
		var partsArray = Parts.find({"partType": "fuelTank"}, {sort: {name: 1}}).fetch();
		return partsArray.map((part) => <tr><td>{part.name}</td><td>{part.dryMass}</td><td>{part.fuelMass}</td><td>{part.diameter}</td><td>{part.drag}</td><td><button id={part._id} onClick={this.clickPart}>Add {part.name}</button></td></tr>);
	},
	reTable(){
		var partsArray = Parts.find({"partType": "rocketEngine"}, {sort: {name: 1}}).fetch();
		return partsArray.map((part) => <tr><td>{part.name}</td><td>{part.mass}</td><td>{part.thrust}</td><td>{part.isp}</td><td>{part.diameter}</td><td>{part.drag}</td><td><button id={part._id} onClick={this.clickPart}>Add {part.name}</button></td></tr>);
	},
	
	render(){
		return(
			<div>
				<div id="left-col">
						<table>
							<tr>
								<th>name</th>
								<th>mass</th>
								<th>diameter</th>
								<th>drag</th>
							</tr>
								{this.cmTable(this.data.parts)}
						</table>
						<table>
							<tr>
								<th>name</th>
								<th>mass dry</th>
								<th>fuel dry</th>
								<th>diameter</th>
								<th>drag</th>
							</tr>
								{this.ftTable(this.data.parts)}
						</table>
						<table>
							<tr>
								<th>name</th>
								<th>mass</th>
								<th>thrust</th>
								<th>isp</th>
								<th>diameter</th>
								<th>drag</th>
							</tr>
								{this.reTable(this.data.parts)}
						</table>
				</div>
				<div id="right-col">
					<span>
					<button id="stage-1" onClick={this.clickStage}>Stage 1</button><br/>
					<p>{this.stageParts()}</p><br/>
					<button id="stage-2" onClick={this.clickStage}>Stage 2</button><br/>
					<p>{this.stageParts()}</p><br/>
					<button id="stage-3" onClick={this.clickStage}>Stage 3</button><br/>
					<p>{this.stageParts()}</p><br/>
					<button id="launch" onClick={this.clickConfigure}>Configure Rocket </button><br/>
					<p></p><br/>
					<button id="clear" onClick={this.clickClear}>Clear Rocket</button><br/>
					<table>
						<tr>
							<th>stage</th>
							<th>TWR</th>
							<th>deltaV</th>
							<th>cD</th>
						</tr>
					{this.configuredRocket()}
					</table>
					</span>
				</div>
			</div>
			)
	}
});
