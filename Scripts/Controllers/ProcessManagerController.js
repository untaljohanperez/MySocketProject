var app = angular.module('mySocketApp', ['btford.socket-io']);

app.factory('mySocket', function (socketFactory) {
  return socketFactory();
});

app.controller('ProcessManagerController', ['$scope', 'mySocket', function($scope, mySocket){
	$scope.processList = [];
	$scope.newProcess = { process: null, processingTime: null};

	$scope.sendProcess = function(){
		if($scope.newProcess.process == null && $scope.newProcess.processingTime == null)
			return;

		mySocket.emit('client_data', $scope.newProcess);
	};
	
	mySocket.on("sendProcessList", function(data){
		console.log(data, "from server, from angular");
		$scope.processList = data;
	});

	mySocket.on("postNewProcessSuccess", function(data){
		$scope.newProcess.process = null;
		$scope.newProcess.processingTime = null;
	});
}]);
