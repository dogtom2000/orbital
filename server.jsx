Parts = new Mongo.Collection("parts");

var rocketPartArray = [];

OrbitalHome = React.createClass({

	mixins: [ReactMeteorData],

	getMeteorData() {
		return {
			parts: Parts.find({}).fetch()
		}
	},

	handleClick (e){
		var index = rocketPartArray.indexOf(e.currentTarget.id);
		if(index == -1){
			rocketPartArray.push(e.currentTarget.id);
			$(("#" + e.currentTarget.id)).addClass('yellow');
		} else {
			rocketPartArray.splice(index, 1);
			$(("#" + e.currentTarget.id)).removeClass('yellow');
		};
	},

	partButton(parts){
		return parts.map((part) => <button id={part._id} onClick={this.handleClick}>Add {part.name}</button>);
	},

	render(){
		return(
				<div>
					{this.partButton(this.data.parts)}
				</div>
			)
	}
});
