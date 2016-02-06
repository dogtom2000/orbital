if (Meteor.isClient) {
  Meteor.startup(function () {
    ReactDOM.render(<OrbitalHome />, document.getElementById("home"));
  });
}
