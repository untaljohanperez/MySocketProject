var app = angular.module('mySocketApp', ['btford.socket-io']);

app.factory('mySocket', function (socketFactory) {
  return socketFactory();
});

app.controller('ProcessManagerController', ['$scope', '$timeout', '$interval', 'mySocket', function($scope, $timeout, $interval, mySocket){
	$scope.processList = [];
	$scope.newProcess = { process: null, processingTime: null};

	$scope.sendProcess = function(){
		if($scope.newProcess.process == null && $scope.newProcess.processingTime == null)
			return;

		var newProcess = new processClass($scope.processList.length + 1,
										$scope.newProcess.process,
										 $scope.newProcess.processingTime,
										 $scope.newProcess.processingTime,
										 readyStatus);
		$scope.processList.push(newProcess);

		$scope.newProcess.process = null;
		$scope.newProcess.processingTime = null;
		mySocket.emit('newProcess', newProcess);
	};
	
	mySocket.on("sendProcessList", function(data){
		console.log(data, "from server, from angular");
		$scope.processList = data;
	});

	mySocket.on("postNewProcessSuccess", function(data){
		$scope.newProcess.process = null;
		$scope.newProcess.processingTime = null;
	});

	var sleep = function(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
	    if ((new Date().getTime() - start) > milliseconds){
	      break;
	    }
	  }
	}

	var readyStatus = "ready";
	var runningStatus = "running"; 
	var waitingStatus = "waiting"; 
	var terminatedStatus = "terminated";

	var processClass = class Process{
		constructor(_id, _process, _processingTime, _remainingTime, _status){
			this.id = _id;
			this.process = _process;
			this.processingTime = _processingTime;
			this._remainingTime = _remainingTime;
			this.status = _status
		}

		get remainingTime(){
			return this._remainingTime;
		}

		set remainingTime(value){
			this._remainingTime = value
		}
	}

	$scope.allProcess = function(actualProcess){
        actualProcess++;   
        console.log(actualProcess + 1, "actualProcess");/**/ 
        var process = $scope.processList[actualProcess];
        if(!process){
            return;    
        }
        console.log($scope.processList[actualProcess], "Process");/**/
        process.status = runningStatus;
        //mySocket.emit('sendProcessList', processList);
        //mySocket.broadcast.emit('sendProcessList', processList);   

        $scope.run(process);

        $timeout(function(){
        	$scope.allProcess(actualProcess);
        }, process.processingTime * 1000);
	};

    $scope.run = function(process){
        var remainingTime = process.remainingTime;
        if(remainingTime == 0){
        	process.status = terminatedStatus;
        	mySocket.emit('sendProcessList', $scope.processList);
            return;
        }else{
            $timeout(function () {
            	process.remainingTime--;
	            mySocket.emit('sendProcessList', $scope.processList);
	            //mySocket.broadcast.emit('sendProcessList', processList);
	            $scope.run(process);
	            console.log(process.remainingTime, "id = " + process.id);/**/
            }, 1000);
            //sleep(1000); 
        }
    };

    $scope.startProcessing = function(){
    	var actualProcess = -1;
       	$scope.allProcess(actualProcess);
    };

    $scope.$watchCollection('processList', function (newValue, oldValue){
    	console.log('processList!!');
    }, true);


}]);
